import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { countActiveCarsInModel } from "@/lib/supabase/availability";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import VehicleUnavailable from "@/components/booking/VehicleUnavailable";
import InsurancePage from "./InsurancePage";
import type { ModelGroup } from "@/types";

type Props = {
  params: Promise<{ modelId: string; locale: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function BookingInsurancePage({ params, searchParams }: Props) {
  const { modelId, locale } = await params;
  const { from = "", to = "" } = await searchParams;

  if (!from || !to) redirect(`/${locale}/fleet`);

  const supabase = await createClient();
  const { data: model } = await supabase
    .from("model_group")
    .select("*")
    .eq("id", modelId)
    .single();

  if (!model) notFound();

  // No active car left in this model group → not bookable.
  if ((await countActiveCarsInModel(supabase, modelId)) === 0) {
    return (
      <>
        <Navbar />
        <VehicleUnavailable locale={locale} />
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

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
