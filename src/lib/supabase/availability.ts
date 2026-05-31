import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModelGroup } from "@/types";

/**
 * Returns model_groups that have at least one available car for the given
 * date range, with `available_count` attached to each result.
 *
 * Formula per model:
 *   unavailable = distinct car_ids in car_calendar where dates overlap
 *   available   = total_cars − unavailable
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
  // ── 1. All model groups ───────────────────────────────────────────────────
  const { data: models, error: modelsError } = await supabase
    .from("model_group")
    .select("*")
    .order("created_at", { ascending: false });

  if (modelsError || !models?.length) return [];

  // ── 2. Blocked car_ids with their model_group_id via the cars table ───────
  //   car_calendar.car_id  →  cars.id  →  cars.model_group_id
  //   ANY entry in car_calendar means the car is unavailable — no block_type filter.
  const { data: blocked } = await supabase
    .from("car_calendar")
    .select("car_id, cars!inner(model_group_id)")
    .lte("start_date", returnDate)
    .gte("end_date",   pickupDate);

  // ── 3. Build a map: model_group_id → Set of blocked car_ids ──────────────
  const blockedByModel = new Map<string, Set<string>>();

  for (const row of blocked ?? []) {
    const carsJoin = row.cars as { model_group_id: string } | { model_group_id: string }[] | null;
    const modelId = Array.isArray(carsJoin) ? carsJoin[0]?.model_group_id : carsJoin?.model_group_id;
    if (!modelId || !row.car_id) continue;
    if (!blockedByModel.has(modelId)) blockedByModel.set(modelId, new Set());
    blockedByModel.get(modelId)!.add(row.car_id as string);
  }

  // ── 4. Attach available_count, keep only models with ≥ 1 available car ───
  return (models as ModelGroup[])
    .map((m) => ({
      ...m,
      available_count: m.total_cars - (blockedByModel.get(m.id)?.size ?? 0),
    }))
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
  const { data: cars } = await supabase
    .from("cars")
    .select("id")
    .eq("model_group_id", modelGroupId)
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
