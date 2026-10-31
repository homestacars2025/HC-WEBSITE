"use client";

import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function PrivacyPage() {
  const t      = useTranslations("privacyPage");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  const mainSections = [
    { n: "01", title: t("s1Title"), body: t("s1Body") },
    { n: "02", title: t("s2Title"), body: t("s2Body") },
    { n: "03", title: t("s3Title"), body: t("s3Body") },
    { n: "04", title: t("s4Title"), body: t("s4Body") },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="bg-white min-h-screen"
    >
      <div className="max-w-[760px] mx-auto px-6 py-24">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-[#6e6e73] hover:text-[#0a0a0a] mb-14 transition-colors duration-150"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {t("backHome")}
        </Link>

        {/* Header */}
        <h1
          className={cn(
            "font-bold tracking-tight text-[#1d1d1f] mb-3",
            isRTL
              ? "text-[32px] sm:text-[38px] leading-[1.4]"
              : "text-[38px] sm:text-[48px] leading-[1.07]",
          )}
        >
          {t("title")}
        </h1>
        <p className="text-[14px] text-[#86868b] mb-14">{t("lastUpdated")}</p>

        <div className="h-px bg-[#e5e5e5] mb-14" />

        {/* Sections */}
        <div className="space-y-12">
          {mainSections.map((s) => (
            <div key={s.n}>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">{s.title}</h2>
              <p className="text-[16px] text-[#555] leading-[1.8]">{s.body}</p>
            </div>
          ))}

          {/* Section 5 — Contact (with links) */}
          <div>
            <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">{t("s5Title")}</h2>
            <div className="text-[16px] text-[#555] leading-[1.8] space-y-1.5">
              <p>
                <a
                  href="mailto:info@homestacars.com"
                  className="text-brand-strong hover:underline"
                >
                  {t("s5Email")}
                </a>
              </p>
              <p>
                <a
                  href="https://wa.me/message/CUGF33QK7NX5C1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-strong hover:underline"
                >
                  {t("s5WhatsApp")}
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
