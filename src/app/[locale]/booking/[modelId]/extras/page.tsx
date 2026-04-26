import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import ExtrasPage from "./ExtrasPage";
import type { ModelGroup } from "@/types";

type Props = {
  params: Promise<{ modelId: string; locale: string }>;
  searchParams: Promise<{ from?: string; to?: string; insurance?: string }>;
};

export default async function BookingExtrasPage({ params, searchParams }: Props) {
  const { modelId, locale } = await params;
  const { from = "", to = "", insurance = "standard" } = await searchParams;

  if (!from || !to) redirect(`/${locale}/fleet`);

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
      <ExtrasPage
        model={model as ModelGroup}
        pickupDate={from}
        returnDate={to}
        insurancePackage={insurance}
      />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
