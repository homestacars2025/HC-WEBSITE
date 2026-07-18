import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "./CheckoutForm";

// Checkout is driven by a booking, never by a client-supplied amount. The
// payable total is loaded here (server-side) from the booking and shown
// read-only; /api/payment/initiate independently re-reads it from the booking.
type Props = {
  searchParams: Promise<{ booking?: string }>;
};

export default async function CheckoutRoute({ searchParams }: Props) {
  const { booking = "" } = await searchParams;

  let bookingNumber = "";
  let amount = "";

  if (booking) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("bookings")
      .select("booking_number, total_amount, currency, payment_status")
      .eq("booking_number", booking)
      .maybeSingle();

    const row = data as
      | { booking_number: string; total_amount: number | null; currency: string; payment_status: string }
      | null;

    if (row && row.payment_status !== "paid" && row.total_amount != null && row.total_amount > 0) {
      bookingNumber = row.booking_number;
      amount = String(row.total_amount);
    }
  }

  return (
    <>
      <Navbar />
      <CheckoutForm bookingNumber={bookingNumber} amount={amount} />
      <Footer />
    </>
  );
}
