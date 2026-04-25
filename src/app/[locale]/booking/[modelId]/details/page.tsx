import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import DetailsPage from "./DetailsPage";
import type { ModelGroup } from "@/types";

type Props = {
  params: Promise<{ modelId: string; locale: string }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
    insurance?: string;
    childSeat?: string;
    additionalDriver?: string;
    extraKm?: string;
  }>;
};

export default async function BookingDetailsPage({ params, searchParams }: Props) {
  const { modelId } = await params;
  const {
    from = "",
    to = "",
    insurance = "medium",
    childSeat = "0",
    additionalDriver = "0",
    extraKm = "0",
  } = await searchParams;

  const supabase = await createClient();
  const { data: model } = await supabase
    .from("model_group")
    .select("*")
    .eq("id", modelId)
    .single();

  if (!model) notFound();

  return (
    <>
      <Navbar />
      <DetailsPage
        model={model as ModelGroup}
        pickupDate={from}
        returnDate={to}
        insurancePackage={insurance}
        childSeats={Math.max(0, parseInt(childSeat, 10) || 0)}
        additionalDrivers={Math.max(0, parseInt(additionalDriver, 10) || 0)}
        extraKm={extraKm === "1"}
      />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
