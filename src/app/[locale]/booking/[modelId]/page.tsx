import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import InsurancePage from "./InsurancePage";
import type { ModelGroup } from "@/types";

type Props = {
  params: Promise<{ modelId: string; locale: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function BookingInsurancePage({ params, searchParams }: Props) {
  const { modelId } = await params;
  const { from = "", to = "" } = await searchParams;

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
      <InsurancePage
        model={model as ModelGroup}
        pickupDate={from}
        returnDate={to}
      />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
