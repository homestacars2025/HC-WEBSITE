import { getTranslations } from "next-intl/server";
import { AlertCircle } from "lucide-react";

/**
 * Shown when a booking-funnel URL targets a model group that no longer has any
 * active car (all its cars were sold / removed). Renders instead of the booking
 * form so a removed vehicle can never be booked from a direct/stale link.
 */
export default async function VehicleUnavailable({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "booking.unavailable" });

  return (
    <main className="min-h-screen bg-[#f9f9f9] pt-16 flex items-center justify-center">
      <div className="max-w-[520px] mx-auto px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdecec]">
          <AlertCircle className="h-7 w-7 text-[#d92d20]" />
        </div>
        <h1 className="text-[24px] font-bold text-[#0a0a0a] mb-2">{t("title")}</h1>
        <p className="text-[15px] text-[#6e6e73] mb-8">{t("body")}</p>
        <a
          href={`/${locale}/fleet`}
          className="inline-flex items-center justify-center rounded-full bg-[#0a0a0a] px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
        >
          {t("browseCta")}
        </a>
      </div>
    </main>
  );
}
