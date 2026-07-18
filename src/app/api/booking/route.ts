import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findAvailableCarId } from "@/lib/supabase/availability";

// Booking creation must be server-authoritative: the browser is never trusted
// to decide which car gets booked. This route re-selects an ACTIVE, free car
// server-side, re-verifies `is_active` on the chosen car, then inserts the
// booking — so a sold / removed car (is_active = false) can never be booked,
// even by a crafted request.
export const dynamic = "force-dynamic";

interface Body {
  modelGroupId?: string | number;
  pickupDate?: string;
  returnDate?: string;
  customerId?: string | number;
  insuranceType?: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
      car_id:          carId,
      start_date:      pickupDate,
      end_date:        returnDate,
      insurance_type:  insuranceType,
      pickup_location: "Istanbul",
      dropoff_location:"Istanbul",
      booking_number:  bookingNumber,
      customer_id:     customerId,
      status:          "pending",
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
