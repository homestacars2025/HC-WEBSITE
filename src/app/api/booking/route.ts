import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findAvailableCarId } from "@/lib/supabase/availability";
import {
  fetchActivePricingTiers,
  fetchUsdToTry,
  computeBookingTotalTRY,
} from "@/lib/pricing";

// Booking creation must be server-authoritative: the browser is never trusted
// to decide which car gets booked OR how much it costs. This route re-selects
// an ACTIVE, free car server-side, re-verifies `is_active`, computes the
// authoritative payable total (TRY) from DB pricing data, and stores it on the
// booking — so neither a sold car nor a tampered price can slip through.
export const dynamic = "force-dynamic";

interface Body {
  modelGroupId?: string | number;
  pickupDate?: string;
  returnDate?: string;
  customerId?: string | number;
  insuranceType?: string;
  childSeats?: number;
  additionalDrivers?: number;
  extraKm?: boolean;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Whole rental days between two YYYY-MM-DD dates (matches the UI's daysBetween). */
function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { modelGroupId, pickupDate, returnDate, customerId } = body;
  const insuranceType = body.insuranceType ?? "medium";

  if (
    modelGroupId == null ||
    customerId == null ||
    !pickupDate || !DATE_RE.test(pickupDate) ||
    !returnDate || !DATE_RE.test(returnDate) ||
    returnDate < pickupDate
  ) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = await createClient();

  // 1 ── Pick an ACTIVE car that is free for the range (findAvailableCarId only
  //      considers is_active = true cars). Null → the model has no bookable car.
  const carId = await findAvailableCarId(supabase, modelGroupId, pickupDate, returnDate);
  if (carId == null) {
    return NextResponse.json({ error: "unavailable" }, { status: 409 });
  }

  // 2 ── Critical guard: re-read the chosen car and confirm it is still active.
  //      Defense in depth — never create a booking against an inactive car.
  const { data: car, error: carError } = await supabase
    .from("cars")
    .select("id, is_active")
    .eq("id", carId)
    .maybeSingle();

  if (carError || !car || car.is_active !== true) {
    return NextResponse.json({ error: "unavailable" }, { status: 409 });
  }

  // 2b ── Compute the AUTHORITATIVE total (TRY) from DB pricing data. The client
  //       never supplies the amount — it is derived here from the model's USD
  //       price, the day-based discount tier, insurance, extras and the live
  //       USD→TRY rate, then stored on the booking for the payment step to read.
  const childSeats        = Math.max(0, Math.trunc(Number(body.childSeats) || 0));
  const additionalDrivers = Math.max(0, Math.trunc(Number(body.additionalDrivers) || 0));
  const extraKm           = body.extraKm === true;

  const [{ data: model }, tiers, usdToTry] = await Promise.all([
    supabase.from("model_group").select("price").eq("id", modelGroupId).maybeSingle(),
    fetchActivePricingTiers(supabase),
    fetchUsdToTry(supabase),
  ]);

  const dailyPriceUSD = Number((model as { price?: number } | null)?.price);
  let totalAmount: number | null = null;
  if (Number.isFinite(dailyPriceUSD) && dailyPriceUSD > 0 && usdToTry) {
    totalAmount = computeBookingTotalTRY({
      dailyPriceUSD,
      days: daysBetween(pickupDate, returnDate),
      insuranceType,
      childSeats,
      additionalDrivers,
      extraKm,
      tiers,
      usdToTry,
    });
  } else {
    // Missing price/rate — create the booking but leave the amount unset; the
    // payment step will reject rather than charge a guessed value.
    console.error("[booking] could not price booking", {
      modelGroupId,
      hasPrice: Number.isFinite(dailyPriceUSD),
      hasRate: Boolean(usdToTry),
    });
  }

  const additionalServices: Record<string, unknown> = {};
  if (childSeats > 0)        additionalServices.child_seat        = childSeats;
  if (additionalDrivers > 0) additionalServices.additional_drivers = additionalDrivers;
  if (extraKm)               additionalServices.extra_km          = true;

  // 3 ── Generate the booking number (HOM-MM-YY-NNN) server-side.
  const now    = new Date();
  const mm     = String(now.getMonth() + 1).padStart(2, "0");
  const yy     = String(now.getFullYear()).slice(-2);
  const prefix = `HOM-${mm}-${yy}-`;

  const { count: existingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .like("booking_number", `${prefix}%`);

  const seq           = String((existingCount ?? 0) + 1).padStart(3, "0");
  const bookingNumber = `${prefix}${seq}`;

  // 4 ── Insert the booking. The DB exclusion constraint (no_overlapping_bookings)
  //      is the final race guard; 23P01 means the car was taken in parallel.
  const { error: bookingError } = await supabase
    .from("bookings")
    .insert({
      car_id:              carId,
      start_date:          pickupDate,
      end_date:            returnDate,
      insurance_type:      insuranceType,
      pickup_location:     "Istanbul",
      dropoff_location:    "Istanbul",
      booking_number:      bookingNumber,
      customer_id:         customerId,
      status:              "pending",
      total_amount:        totalAmount,
      currency:            "TRY",
      payment_status:      "unpaid",
      additional_services: Object.keys(additionalServices).length
        ? JSON.stringify(additionalServices)
        : null,
    } as never)
    .select("id")
    .single();

  if (bookingError) {
    if (bookingError.code === "23P01") {
      return NextResponse.json({ error: "dates_conflict" }, { status: 409 });
    }
    console.error("[booking] insert failed", {
      code: bookingError.code,
      message: bookingError.message,
    });
    return NextResponse.json({ error: "submit_failed" }, { status: 500 });
  }

  return NextResponse.json({ bookingNumber }, { status: 200 });
}
