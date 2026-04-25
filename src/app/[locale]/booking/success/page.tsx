import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import SuccessPage from "./SuccessPage";

type Props = {
  searchParams: Promise<{ ref?: string; car?: string }>;
};

export default async function BookingSuccessPage({ searchParams }: Props) {
  const { ref = "", car = "" } = await searchParams;

  return (
    <>
      <Navbar />
      <SuccessPage bookingNumber={ref} carName={decodeURIComponent(car)} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
