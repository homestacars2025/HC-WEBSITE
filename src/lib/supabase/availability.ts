import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModelGroup } from "@/types";

/**
 * Number of ACTIVE cars per model_group_id (keyed by string).
 *
 * Sold / written-off / returned cars carry `cars.is_active = false` and MUST
 * NOT count toward availability, even though their rows (and `model_group`'s
 * stored `total_cars`) still include them. All public availability math is
 * based on this map, never on `model_group.total_cars`.
 */
export async function activeCarCountByModel(
  supabase: SupabaseClient,
): Promise<Map<string, number>> {
  const { data } = await supabase
    .from("cars")
    .select("model_group_id")
    .eq("is_active", true);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = (row as { model_group_id: string | number | null }).model_group_id;
    if (id == null) continue;
    const key = String(id);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/** Count of ACTIVE cars in a single model group (for direct-URL guards). */
export async function countActiveCarsInModel(
  supabase: SupabaseClient,
  modelGroupId: string | number,
): Promise<number> {
  const { count } = await supabase
    .from("cars")
    .select("id", { count: "exact", head: true })
    .eq("model_group_id", modelGroupId)
    .eq("is_active", true);
  return count ?? 0;
}

/**
 * Returns model_groups that have at least one available ACTIVE car for the
 * given date range, with `available_count` attached to each result.
 *
 * Formula per model:
 *   active      = count of cars with is_active = true in the model
 *   unavailable = distinct ACTIVE car_ids in car_calendar where dates overlap
 *   available   = active − unavailable
 *
 * Any entry in car_calendar blocks the car — no block_type filter applied.
 *
 * Overlap condition (INCLUSIVE intervals — must match the bookings
 * `no_overlapping_bookings` exclusion constraint, which is defined as
 * `daterange(start_date, end_date, '[]')`, i.e. the end date is occupied):
 *   calendar.start_date <= returnDate  AND  calendar.end_date >= pickupDate
 *
 * Using strict `<`/`>` here previously made a car whose prior booking ends on
 * day X appear "available" for a new booking starting on day X, while the
 * constraint rejected the insert with 23P01. Inclusive bounds keep the two in
 * agreement.
 */
export async function getAvailableModels(
  supabase: SupabaseClient,
  pickupDate: string,
  returnDate: string,
): Promise<ModelGroup[]> {
  // ── 1. All model groups + active-car counts ───────────────────────────────
  const [{ data: models, error: modelsError }, activeCounts] = await Promise.all([
    supabase.from("model_group").select("*").order("created_at", { ascending: false }),
    activeCarCountByModel(supabase),
  ]);

  if (modelsError || !models?.length) return [];

  // ── 2. Blocked ACTIVE car_ids with their model_group_id via the cars table ─
  //   car_calendar.car_id  →  cars.id  →  cars.model_group_id
  //   ANY entry in car_calendar means the car is unavailable — no block_type filter.
  //   `cars.is_active = true` on the inner join ensures blocks on already-sold
  //   cars don't distort the count (a sold car isn't in the active base anyway).
  const { data: blocked } = await supabase
    .from("car_calendar")
    .select("car_id, cars!inner(model_group_id, is_active)")
    .eq("cars.is_active", true)
    .lte("start_date", returnDate)
    .gte("end_date",   pickupDate);

  // ── 3. Build a map: model_group_id → Set of blocked car_ids ──────────────
  const blockedByModel = new Map<string, Set<string>>();

  for (const row of blocked ?? []) {
    const carsJoin = row.cars as { model_group_id: string } | { model_group_id: string }[] | null;
    const modelId = Array.isArray(carsJoin) ? carsJoin[0]?.model_group_id : carsJoin?.model_group_id;
    if (!modelId || !row.car_id) continue;
    const key = String(modelId);
    if (!blockedByModel.has(key)) blockedByModel.set(key, new Set());
    blockedByModel.get(key)!.add(row.car_id as string);
  }

  // ── 4. Attach available_count from ACTIVE cars, keep models with ≥ 1 free ─
  return (models as ModelGroup[])
    .map((m) => {
      const active = activeCounts.get(String(m.id)) ?? 0;
      const blockedCount = blockedByModel.get(String(m.id))?.size ?? 0;
      return { ...m, available_count: active - blockedCount };
    })
    .filter((m) => (m.available_count ?? 0) > 0);
}

/**
 * Picks a specific car in a model group that is actually free for the given
 * date range, or `null` if every car is taken.
 *
 * The fleet filter guarantees ≥1 free car at the MODEL level, but a booking row
 * targets ONE specific car. Always grabbing the "first" car (the previous
 * behaviour) could land on a car that is already booked while siblings are
 * free — the insert then fails with 23P01 even though the model showed as
 * available.
 *
 * A car is considered free only when it is blocked by NEITHER source:
 *   - car_calendar (maintenance / manual blocks / confirmed-booking mirrors)
 *   - active bookings (the exclusion constraint's source of truth)
 * Both use the same INCLUSIVE overlap as the constraint
 * (`start_date <= returnDate AND end_date >= pickupDate`). Cancelled/completed
 * bookings do not participate in the constraint, so they are ignored here too.
 */
export async function findAvailableCarId(
  supabase: SupabaseClient,
  modelGroupId: string | number,
  pickupDate: string,
  returnDate: string,
): Promise<string | number | null> {
  // Only ACTIVE cars are bookable — sold / written-off cars (is_active = false)
  // must never be selected for a new booking.
  const { data: cars } = await supabase
    .from("cars")
    .select("id")
    .eq("model_group_id", modelGroupId)
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (!cars?.length) return null;
  const carIds = cars.map((c) => c.id as string | number);

  const blocked = new Set<string | number>();

  // ── Calendar blocks ────────────────────────────────────────────────────────
  const { data: calBlocks } = await supabase
    .from("car_calendar")
    .select("car_id")
    .in("car_id", carIds)
    .lte("start_date", returnDate)
    .gte("end_date",   pickupDate);
  for (const r of calBlocks ?? []) {
    if (r.car_id != null) blocked.add(r.car_id as string | number);
  }

  // ── Active-booking blocks (mirror the exclusion constraint) ────────────────
  const { data: bookingBlocks } = await supabase
    .from("bookings")
    .select("car_id, status")
    .in("car_id", carIds)
    .lte("start_date", returnDate)
    .gte("end_date",   pickupDate);
  for (const r of bookingBlocks ?? []) {
    const status = (r.status as string | null) ?? "";
    if (status === "cancelled" || status === "completed") continue;
    if (r.car_id != null) blocked.add(r.car_id as string | number);
  }

  return carIds.find((id) => !blocked.has(id)) ?? null;
}
