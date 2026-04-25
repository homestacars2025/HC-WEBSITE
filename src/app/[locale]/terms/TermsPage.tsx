"use client";

import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function TermsPage() {
  const t      = useTranslations("termsPage");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  const sections = [
    { n: "01", title: t("s1Title"), body: t("s1Body") },
    { n: "02", title: t("s2Title"), body: t("s2Body") },
    { n: "03", title: t("s3Title"), body: t("s3Body") },
    { n: "04", title: t("s4Title"), body: t("s4Body") },
    { n: "05", title: t("s5Title"), body: t("s5Body") },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={cn("bg-white min-h-screen", isRTL && "font-[Cairo]")}
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
          {sections.map((s) => (
            <div key={s.n}>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">{s.title}</h2>
              <p className="text-[16px] text-[#555] leading-[1.8]">{s.body}</p>
            </div>
          ))}

          {/* Section 6 — Contact (with email link) */}
          <div>
            <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">{t("s6Title")}</h2>
            <p className="text-[16px] text-[#555] leading-[1.8]">
              {t("s6Body").split("info@homestacars.com")[0]}
              <a
                href="mailto:info@homestacars.com"
                className="text-[#4ba6ea] hover:underline"
              >
                info@homestacars.com
              </a>
              {t("s6Body").split("info@homestacars.com")[1] ?? ""}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
