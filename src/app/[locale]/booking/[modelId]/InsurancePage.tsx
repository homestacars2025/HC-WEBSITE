"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Check, X, Car, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCurrency } from "@/lib/context/currency-context";
import { createClient } from "@/lib/supabase/client";
import { fetchActivePricingTiers, findMatchingTier, applyDiscount, type PricingTier } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { ModelGroup } from "@/types";

// ─── Package config ───────────────────────────────────────────────────────────

type PackageId = "none" | "basic" | "medium" | "full";

interface PackageDef {
  id:            PackageId;
  pricePct:      number;
  popular?:      boolean;
  coversKeys:    string[];
  notKeys:       string[];
  deductibleKey: string;
}

const PACKAGES: PackageDef[] = [
  {
    id:            "none",
    pricePct:      0,
    coversKeys:    [],
    notKeys:       [],
    deductibleKey: "",
  },
  {
    id:            "basic",
    pricePct:      10,
    coversKeys:    ["basicCovers1", "basicCovers2"],
    notKeys:       ["basicNotCovered1", "basicNotCovered2"],
    deductibleKey: "basicDeductible",
  },
  {
    id:            "medium",
    pricePct:      15,
    popular:       true,
    coversKeys:    ["mediumCovers1", "mediumCovers2", "mediumCovers3"],
    notKeys:       ["mediumNotCovered1", "mediumNotCovered2"],
    deductibleKey: "mediumDeductible",
  },
  {
    id:            "full",
    pricePct:      20,
    coversKeys:    ["fullCovers1", "fullCovers2", "fullCovers3"],
    notKeys:       ["fullNotCovered1", "fullNotCovered2", "fullNotCovered3"],
    deductibleKey: "fullDeductible",
  },
];

const NONE_WARN_KEYS = [
  "noneWarn1", "noneWarn2", "noneWarn3", "noneWarn4", "noneWarn5",
] as const;

// ─── Palette per package ──────────────────────────────────────────────────────

const PALETTE = {
  none:   { strip: "bg-[#9ca3af]", ring: "ring-[#9ca3af]",   pct: "text-[#6b7280]",  btn: "bg-[#6b7280] hover:bg-[#4b5563]" },
  basic:  { strip: "bg-green-400", ring: "ring-green-400",   pct: "text-green-600",  btn: "bg-green-500 hover:bg-green-600" },
  medium: { strip: "bg-[#4ba6ea]", ring: "ring-[#4ba6ea]",   pct: "text-[#4ba6ea]", btn: "bg-[#4ba6ea] hover:bg-[#2d8fd4]" },
  full:   { strip: "bg-[#1d1d1f]", ring: "ring-[#1d1d1f]/60",pct: "text-[#1d1d1f]", btn: "bg-[#1d1d1f] hover:bg-[#333]"   },
} satisfies Record<PackageId, { strip: string; ring: string; pct: string; btn: string }>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  return Math.max(0, Math.ceil(
    (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000
  ));
}

function displayDate(ymd: string): string {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

type T = ReturnType<typeof useTranslations<"booking.insurance">>;

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ t }: { t: T }) {
  const steps = [t("stepCar"), t("stepInsurance"), t("stepExtras"), t("stepDetails")];
  const current = 2;

  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const n = i + 1;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold",
                n < current  && "bg-green-500 text-white",
                n === current && "bg-[#4ba6ea] text-white",
                n > current  && "bg-[#f0f0f0] text-[#86868b]",
              )}>
                {n < current ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={cn(
                "text-[14px] font-medium whitespace-nowrap",
                n === current ? "text-[#0a0a0a]" : "text-[#86868b]",
              )}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-px mx-4", n < current ? "bg-green-300" : "bg-[#e5e5e5]")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Summary row ──────────────────────────────────────────────────────────────

function SummaryRow({ label, value, bold = false, discount = false, highlight = false, money = false }: {
  label: string; value: string; bold?: boolean; discount?: boolean; highlight?: boolean; money?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn(
        "text-[13px]",
        bold ? "font-semibold text-[#0a0a0a]" : discount ? "text-green-600" : highlight ? "font-medium text-[#4ba6ea]" : "text-[#6e6e73]",
      )}>{label}</span>
      <span className={cn(
        "text-[13px]",
        money && "font-mono tabular-nums",
        bold ? "font-bold text-[#0a0a0a]" : discount ? "font-semibold text-green-600" : highlight ? "font-semibold text-[#4ba6ea]" : "text-[#1d1d1f]",
      )}>{value}</span>
    </div>
  );
}

// ─── Package card ─────────────────────────────────────────────────────────────

function PackageCard({
  pkg,
  selected,
  insurancePrice,
  onSelect,
  t,
}: {
  pkg: PackageDef;
  selected: boolean;
  insurancePrice: number;
  onSelect: (id: PackageId) => void;
  t: T;
}) {
  const isNone = pkg.id === "none";
  const pal    = PALETTE[pkg.id];
  const { displayPrice } = useCurrency();

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onSelect(pkg.id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(pkg.id)}
      className={cn(
        "relative flex flex-col rounded-2xl overflow-hidden bg-white transition-all duration-200 cursor-pointer outline-none",
        "border-2",
        selected
          ? cn("shadow-lg ring-4 ring-offset-0", pal.ring, "border-transparent")
          : "border-[#e5e5e5] hover:border-[#c8c8c8] shadow-sm hover:shadow-md",
        pkg.popular && !selected && "border-[#4ba6ea]/40",
      )}
    >
      {/* Colour strip */}
      <div className={cn("h-1.5 w-full shrink-0", pal.strip)} />

      {/* Popular badge */}
      {pkg.popular && (
        <div className="absolute top-3 end-3 bg-[#4ba6ea] text-white text-[10px] font-bold px-2.5 py-1 rounded-full leading-none">
          {t("mostPopular")}
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 pt-4">

        {/* Name */}
        <h3 className="text-[17px] font-bold text-[#0a0a0a] leading-snug mb-1 pe-16">
          {t(`${pkg.id}Name` as Parameters<typeof t>[0])}
        </h3>

        {/* Price */}
        <div className="mb-4">
          {pkg.pricePct === 0 ? (
            <span className="text-[13px] text-[#86868b]">{t("free")}</span>
          ) : (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={cn("text-[24px] font-black leading-none", pal.pct)}>
                {pkg.pricePct}%
              </span>
              <span className="text-[11px] text-[#86868b]">{t("ofSubtotal")}</span>
              {insurancePrice > 0 && (
                <span className="text-[12px] font-semibold text-[#1d1d1f] ms-0.5">
                  ≈ {displayPrice(insurancePrice)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* No Protection: description + warning */}
        {isNone && (
          <>
            <p className="text-[12px] text-[#6e6e73] leading-relaxed mb-4">
              {t("noneDesc")}
            </p>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide leading-tight">
                  {t("warningTitle")}
                </span>
              </div>
              <ul className="space-y-1.5">
                {NONE_WARN_KEYS.map((k) => (
                  <li key={k} className="flex items-start gap-1.5 text-[11px] text-amber-900 leading-snug">
                    <span className="text-amber-500 shrink-0 mt-px">•</span>
                    {t(k)}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Covers */}
        {pkg.coversKeys.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#86868b] mb-2">
              {t("covers")}
            </p>
            <ul className="space-y-1.5">
              {pkg.coversKeys.map((k) => (
                <li key={k} className="flex items-start gap-2 text-[12px] text-[#1d1d1f] leading-snug">
                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  {t(k as Parameters<typeof t>[0])}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Not covered */}
        {pkg.notKeys.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#86868b] mb-2">
              {t("notCovered")}
            </p>
            <ul className="space-y-1.5">
              {pkg.notKeys.map((k) => (
                <li key={k} className="flex items-start gap-2 text-[12px] leading-snug">
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-[#b0b0b0] line-through">
                    {t(k as Parameters<typeof t>[0])}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Deductible */}
        {pkg.deductibleKey && (
          <div className="mt-auto pt-3 border-t border-[#f0f0f0]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#86868b] mb-1">
              {t("deductible")}
            </p>
            <p className="text-[12px] text-[#1d1d1f] leading-snug">
              {t(pkg.deductibleKey as Parameters<typeof t>[0])}
            </p>
          </div>
        )}

        {/* Selection indicator */}
        <div className={cn(
          "mt-4 h-9 rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold transition-colors duration-150",
          selected
            ? cn("text-white", pal.btn)
            : "bg-[#f5f5f7] text-[#6e6e73]",
        )}>
          {selected && <Check className="w-4 h-4" />}
          {selected ? t("selected") : t("choose")}
        </div>

      </div>
    </div>
  );
}

// ─── InsurancePage ────────────────────────────────────────────────────────────

interface InsurancePageProps {
  model:       ModelGroup;
  pickupDate:  string;
  returnDate:  string;
}

export default function InsurancePage({ model, pickupDate, returnDate }: InsurancePageProps) {
  const t      = useTranslations("booking.insurance");
  const locale = useLocale();
  const router = useRouter();
  const { displayPrice } = useCurrency();

  const [selected, setSelected] = useState<PackageId>("medium");
  const [tier,     setTier]     = useState<PricingTier | null>(null);

  const isRTL = locale === "ar";
  const days  = daysBetween(pickupDate, returnDate);
  const title = [model.brand, model.model].filter(Boolean).join(" ") || model.name;

  useEffect(() => {
    if (!days) return;
    fetchActivePricingTiers(createClient()).then((tiers) => setTier(findMatchingTier(tiers, days)));
  }, [days]);

  const finalDailyPrice = applyDiscount(model.price, tier);
  const baseSubtotal    = model.price * days;
  const subtotal        = finalDailyPrice * days;
  const rentalSavings   = baseSubtotal - subtotal;

  const selectedPkg   = PACKAGES.find((p) => p.id === selected)!;
  const insuranceCost = subtotal * selectedPkg.pricePct / 100;
  const grandTotal    = subtotal + insuranceCost;

  function insurancePriceFor(pkg: PackageDef): number {
    return days && pkg.pricePct > 0 ? subtotal * pkg.pricePct / 100 : 0;
  }

  function handleContinue() {
    const params = new URLSearchParams();
    if (pickupDate) params.set("from",      pickupDate);
    if (returnDate) params.set("to",        returnDate);
    params.set("insurance", selected);
    router.push(`/booking/${model.id}/extras?${params.toString()}`);
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <main className="min-h-screen bg-[#f5f5f7] pt-16 pb-32">

        {/* ── Step bar ────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-[#e5e5e5]">
          <div className="max-w-[1280px] mx-auto px-6 py-5">
            <StepBar t={t} />
          </div>
        </div>

        {/* ── Page heading ────────────────────────────────────────────── */}
        <div className="max-w-[1280px] mx-auto px-6 pt-10 pb-6">
          <h1 className="text-[28px] font-bold tracking-tight text-[#0a0a0a] mb-1">
            {t("pageTitle")}
          </h1>
          <p className="text-[15px] text-[#6e6e73]">{t("pageSubtitle")}</p>
        </div>

        {/* ── Main content ────────────────────────────────────────────── */}
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">

            {/* Cards: 1 col → 2 col → 4 col */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {PACKAGES.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={selected === pkg.id}
                  insurancePrice={insurancePriceFor(pkg)}
                  onSelect={setSelected}
                  t={t}
                />
              ))}
            </div>

            {/* Sidebar summary */}
            <div className="bg-white rounded-2xl shadow-md px-8 py-10 sticky top-20">
              <h2 className="text-[17px] font-bold text-[#0a0a0a] mb-7">{t("summaryTitle")}</h2>

              {/* Car */}
              <div className="pb-7 mb-7 border-b border-[#f0f0f0]">
                {model.image_url ? (
                  <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-[#f5f5f7] mb-3">
                    <Image src={model.image_url} alt={title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/2] rounded-xl bg-[#f5f5f7] flex items-center justify-center mb-3">
                    <Car className="w-8 h-8 text-[#b0b0b0]" />
                  </div>
                )}
                <p className="text-[15px] font-bold text-[#0a0a0a] leading-snug">{title}</p>
                <p className="text-[12px] text-[#86868b] capitalize mt-0.5">{model.category}</p>
              </div>

              {/* Dates */}
              {pickupDate && returnDate ? (
                <div className="space-y-2 pb-7 mb-7 border-b border-[#f0f0f0]">
                  <SummaryRow label={t("summaryPickup")}   value={displayDate(pickupDate)} />
                  <SummaryRow label={t("summaryReturn")}   value={displayDate(returnDate)} />
                  <SummaryRow
                    label={t("summaryDuration")}
                    value={`${days} ${days === 1 ? t("summaryDay") : t("summaryDays")}`}
                  />
                </div>
              ) : (
                <p className="text-[13px] text-[#86868b] italic pb-7 mb-7 border-b border-[#f0f0f0]">
                  {t("summaryNoDates")}
                </p>
              )}

              {/* Price breakdown */}
              {days > 0 && (
                <div className="space-y-2 mb-6">
                  <SummaryRow
                    label={t("summaryBaseRate")}
                    value={`${displayPrice(model.price)} × ${days} ${days === 1 ? t("summaryDay") : t("summaryDays")}`}
                    money
                  />
                  {tier && rentalSavings > 0 && (
                    <SummaryRow
                      label={`${t("summaryDiscount")} (${tier.discount_percent}%)`}
                      value={`-${displayPrice(rentalSavings)}`}
                      discount
                      money
                    />
                  )}
                  {selectedPkg.pricePct > 0 && (
                    <SummaryRow
                      label={`${t("summaryInsurance")} (${selectedPkg.pricePct}%)`}
                      value={displayPrice(insuranceCost)}
                      highlight
                      money
                    />
                  )}
                  <div className="border-t border-[#f0f0f0] pt-2">
                    <SummaryRow label={t("summarySubtotal")} value={displayPrice(grandTotal)} bold money />
                  </div>
                </div>
              )}

              {/* Selected protection badge */}
              <div className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 mb-6",
                PALETTE[selected].strip.replace("bg-", "bg-") + "/10",
                "bg-[#f0f7ff]",
              )}>
                <ShieldCheck className="w-4 h-4 text-[#4ba6ea] shrink-0" />
                <span className="text-[12px] font-medium text-[#1d1d1f] truncate">
                  {t(`${selected}Name` as Parameters<typeof t>[0])}
                </span>
              </div>

              <p className="text-[11px] text-[#86868b] leading-relaxed pt-5 border-t border-[#f5f5f7]">
                {t("summaryNote")}
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* ── Sticky bottom Continue bar ───────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#e5e5e5] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] text-[#6e6e73] truncate">
              {t(`${selected}Name` as Parameters<typeof t>[0])}
              {selectedPkg.pricePct > 0 && days > 0 && (
                <span className="ms-2 font-semibold text-[#1d1d1f]">
                  · +{displayPrice(insuranceCost)}
                </span>
              )}
            </p>
            {days > 0 && (
              <p className="text-[17px] font-bold text-[#0a0a0a]">
                {displayPrice(grandTotal)}
              </p>
            )}
          </div>
          <button
            onClick={handleContinue}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-xl text-[15px] font-semibold text-white transition-colors duration-150 active:scale-[0.98]",
              PALETTE[selected].btn,
            )}
          >
            {t("continue")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

    </div>
  );
}
