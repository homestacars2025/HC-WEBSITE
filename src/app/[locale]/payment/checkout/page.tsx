import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CheckoutForm from "./CheckoutForm";

type Props = {
  searchParams: Promise<{ amount?: string; order?: string }>;
};

export default async function CheckoutRoute({ searchParams }: Props) {
  const { amount = "" } = await searchParams;

  return (
    <>
      <Navbar />
      <CheckoutForm initialAmount={amount} />
      <Footer />
    </>
  );
}
