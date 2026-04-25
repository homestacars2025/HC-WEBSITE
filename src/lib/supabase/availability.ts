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
 * Overlap condition (half-open intervals):
 *   calendar.start_date < returnDate  AND  calendar.end_date > pickupDate
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
    .lt("start_date", returnDate)
    .gt("end_date",   pickupDate);

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
