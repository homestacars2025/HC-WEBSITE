import type { SupabaseClient } from "@supabase/supabase-js";

export interface PricingTier {
  min_days: number;
  max_days: number;
  discount_percent: number;
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Find the tier whose day range covers `days`. Global — applies to all cars. */
export function findMatchingTier(
  tiers: PricingTier[],
  days: number
): PricingTier | null {
  if (days <= 0) return null;
  return tiers.find((t) => t.min_days <= days && days <= t.max_days) ?? null;
}

/** Return the discounted daily price, or the base price when no tier applies. */
export function applyDiscount(basePrice: number, tier: PricingTier | null): number {
  if (!tier || tier.discount_percent <= 0) return basePrice;
  return basePrice * (1 - tier.discount_percent / 100);
}

// ─── Supabase fetcher ─────────────────────────────────────────────────────────

/** Fetch all active pricing tiers. No car/model filtering — tiers are global. */
export async function fetchActivePricingTiers(
  client: SupabaseClient
): Promise<PricingTier[]> {
  const { data, error } = await client
    .from("car_pricing_tiers")
    .select("min_days, max_days, discount_percent")
    .eq("is_active", true);

  if (error) {
    console.error("[pricing] fetchActivePricingTiers error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    min_days:         row.min_days as number,
    max_days:         row.max_days as number,
    discount_percent: row.discount_percent as number,
  }));
}
