import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FleetClient from "@/components/fleet/FleetClient";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

export default async function FleetPage() {
  const t = await getTranslations("fleet");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16">

        {/* Page header */}
        <div className="border-b border-[#e5e5e5]">
          <div className="max-w-[1200px] mx-auto px-6 py-12">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#4ba6ea] mb-3">
              {t("title")}
            </p>
            <h1 className="text-[40px] sm:text-[52px] font-bold leading-[1.05] tracking-[-0.03em] text-[#0a0a0a]">
              {t("pageHeading")}
            </h1>
          </div>
        </div>

        <Suspense>
          <FleetClient />
        </Suspense>

      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
