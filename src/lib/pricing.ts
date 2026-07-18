import type { SupabaseClient } from "@supabase/supabase-js";

export interface PricingTier {
  min_days: number;
  max_days: number;
  discount_percent: number;
}

// ─── Shared pricing constants (single source of truth for UI + server) ────────
// These MUST match what the booking summary shows the customer.

/** Insurance surcharge as a % of the car subtotal, by package. */
export const INSURANCE_PCT: Record<string, number> = {
  none: 0,
  basic: 10,
  medium: 15,
  full: 20,
};
/** Child seat surcharge = this fraction of the car subtotal, per seat. */
export const CHILD_SEAT_PCT = 0.05;
/** Flat TRY add-ons. */
export const ADDITIONAL_DRIVER_TRY = 1500;
export const EXTRA_KM_TRY = 5000;

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

/** USD→TRY rate from the exchange_rates table (TRY is the base). */
export async function fetchUsdToTry(client: SupabaseClient): Promise<number | null> {
  const { data, error } = await client
    .from("exchange_rates")
    .select("rate_to_try")
    .eq("currency", "USD")
    .maybeSingle();
  if (error || !data) return null;
  const rate = Number((data as { rate_to_try: number }).rate_to_try);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

// ─── Authoritative total ──────────────────────────────────────────────────────

export interface BookingPriceInput {
  dailyPriceUSD: number; // model_group.price (USD)
  days: number;
  insuranceType: string;
  childSeats: number;
  additionalDrivers: number;
  extraKm: boolean;
  tiers: PricingTier[];
  usdToTry: number;
}

/**
 * The payable total in TRY (the currency Kuveyt Türk charges). Mirrors the
 * client booking summary exactly: car price is USD (with the day-based tier
 * discount), insurance and child seats are % of the car subtotal, and the
 * additional-driver / extra-km add-ons are flat TRY. The USD portion is
 * converted to TRY with the live rate; the TRY add-ons are added as-is.
 */
export function computeBookingTotalTRY(p: BookingPriceInput): number {
  const days = Math.max(0, Math.trunc(p.days));
  const tier = findMatchingTier(p.tiers, days);
  const dailyUSD = applyDiscount(p.dailyPriceUSD, tier);
  const carSubtotalUSD = dailyUSD * days;
  const insurancePct = INSURANCE_PCT[p.insuranceType] ?? 0;
  const insuranceUSD = carSubtotalUSD * (insurancePct / 100);
  const childSeatUSD = carSubtotalUSD * CHILD_SEAT_PCT * Math.max(0, p.childSeats);

  const usdPortionTRY = (carSubtotalUSD + insuranceUSD + childSeatUSD) * p.usdToTry;
  const driverTRY = ADDITIONAL_DRIVER_TRY * Math.max(0, p.additionalDrivers);
  const extraKmTRY = p.extraKm ? EXTRA_KM_TRY : 0;

  const total = usdPortionTRY + driverTRY + extraKmTRY;
  return Math.round(total * 100) / 100; // 2dp
}
