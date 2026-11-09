"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { readSource } from "./source";

const LANGS = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "tr", label: "Türkçe" },
] as const;

// Always-visible switch for applicants on phones (the navbar's sits in the menu).
// Keeps the slug and the query string, so ?src= survives.
export default function CareersLanguageSwitch() {
  const t = useTranslations("careers");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Remember ?src= as soon as a careers page opens.
  useEffect(() => { readSource(); }, []);

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="inline-flex shrink-0 rounded-full border border-[#e5e5e5] bg-white p-1"
    >
      {LANGS.map((l) => (
        <button
          key={l.value}
          type="button"
          lang={l.value}
          aria-pressed={locale === l.value}
          onClick={() => {
            if (locale !== l.value) router.replace(`${pathname}${window.location.search}`, { locale: l.value });
          }}
          className={cn(
            "h-8 rounded-full px-3 text-[13px] font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            locale === l.value ? "bg-[#0a0a0a] text-white" : "text-[#6e6e73] hover:text-[#0a0a0a]",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
