"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Check, Car, Minus, Plus } from "lucide-react";

import Image from "next/image";
import { useCurrency } from "@/lib/context/currency-context";
import { createClient } from "@/lib/supabase/client";
import { fetchActivePricingTiers, findMatchingTier, applyDiscount, type PricingTier } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { ModelGroup } from "@/types";

// Fixed TRY prices for extras
const ADDITIONAL_DRIVER_TRY = 1500;
const EXTRA_KM_TRY = 5000;

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

// ─── Step progress bar ────────────────────────────────────────────────────────

type T = ReturnType<typeof useTranslations<"booking.extras">>;

function StepBar({ t }: { t: T }) {
  const steps = [
    { n: 1, label: t("stepCar") },
    { n: 2, label: t("stepInsurance") },
    { n: 3, label: t("stepExtras") },
    { n: 4, label: t("stepDetails") },
  ];
  const current = 3;

  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors",
                step.n < current   && "bg-green-500 text-white",
                step.n === current && "bg-[#4ba6ea] text-white",
                step.n > current   && "bg-[#f0f0f0] text-[#86868b]",
              )}
            >
              {step.n < current ? <Check className="w-4 h-4" /> : step.n}
            </div>
            <span
              className={cn(
                "text-[14px] font-medium whitespace-nowrap",
                step.n === current ? "text-[#0a0a0a]" : "text-[#86868b]",
              )}
            >
              {step.label}
            </span>
          </div>

          {i < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-px mx-4",
                step.n < current ? "bg-green-300" : "bg-[#e5e5e5]",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Quantity selector ────────────────────────────────────────────────────────

function QuantitySelector({
  value,
  min = 0,
  max,
  onChange,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const tCommon = useTranslations("common");
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-150",
          value <= min
            ? "border-[#e5e5e5] text-[#c8c8c8] cursor-not-allowed"
            : "border-[#4ba6ea] text-[#4ba6ea] hover:bg-[#4ba6ea] hover:text-white active:scale-95",
        )}
        aria-label={tCommon("decrease")}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className="w-6 text-center text-[17px] font-bold text-[#0a0a0a] tabular-nums select-none">
        {value}
      </span>

      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-150",
          value >= max
            ? "border-[#e5e5e5] text-[#c8c8c8] cursor-not-allowed"
            : "border-[#4ba6ea] text-[#4ba6ea] hover:bg-[#4ba6ea] hover:text-white active:scale-95",
        )}
        aria-label={tCommon("increase")}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  labelOn,
  labelOff,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 group"
    >
      <div
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors duration-200",
          checked ? "bg-[#4ba6ea]" : "bg-[#d0d0d0]",
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200",
            checked ? "left-[26px]" : "left-0.5",
          )}
        />
      </div>
      <span
        className={cn(
          "text-[13px] font-semibold transition-colors",
          checked ? "text-[#4ba6ea]" : "text-[#86868b]",
        )}
      >
        {checked ? labelOn : labelOff}
      </span>
    </button>
  );
}

// ─── Service card ─────────────────────────────────────────────────────────────

function ServiceCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] p-5 flex items-center justify-between gap-4">
      {children}
    </div>
  );
}

// ─── Summary row ──────────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  bold = false,
  discount = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  discount?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn(
        "text-[13px]",
        bold     ? "font-semibold text-[#0a0a0a]" :
        discount ? "text-green-600" :
                   "text-[#6e6e73]",
      )}>
        {label}
      </span>
      <span className={cn(
        "text-[13px]",
        bold     ? "font-bold text-[#0a0a0a]" :
        discount ? "font-semibold text-green-600" :
                   "text-[#1d1d1f]",
      )}>
        {value}
      </span>
    </div>
  );
}

// ─── Insurance chip ───────────────────────────────────────────────────────────

const INSURANCE_CHIP: Record<string, { bg: string; text: string }> = {
  none:   { bg: "#f5f5f7", text: "#9ca3af" },
  basic:  { bg: "#dcfce7", text: "#16a34a" },
  medium: { bg: "#dbeafe", text: "#2563eb" },
  full:   { bg: "#1d1d1f", text: "#ffffff" },
};

function InsuranceChip({ pkg }: { pkg: string }) {
  const style = INSURANCE_CHIP[pkg] ?? INSURANCE_CHIP.medium;
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize"
      style={{ background: style.bg, color: style.text }}
    >
      {pkg}
    </span>
  );
}

// ─── ExtrasPage ───────────────────────────────────────────────────────────────

interface ExtrasPageProps {
  model: ModelGroup;
  pickupDate: string;
  returnDate: string;
  insurancePackage: string;
}

export default function ExtrasPage({ model, pickupDate, returnDate, insurancePackage }: ExtrasPageProps) {
  const t      = useTranslations("booking.extras");
  const locale = useLocale();
  const router = useRouter();
  const { displayPrice, displayPriceTRY } = useCurrency();

  const [childSeats,         setChildSeats]         = useState(0);
  const [additionalDrivers,  setAdditionalDrivers]  = useState(0);
  const [extraKm,            setExtraKm]            = useState(false);
  const [tier,               setTier]               = useState<PricingTier | null>(null);

  const isRTL = locale === "ar";
  const days  = daysBetween(pickupDate, returnDate);
  const title = [model.brand, model.model].filter(Boolean).join(" ") || model.name;

  useEffect(() => {
    if (!days) return;
    fetchActivePricingTiers(createClient()).then((tiers) => setTier(findMatchingTier(tiers, days)));
  }, [model.id, days]);

  const finalDailyPrice = applyDiscount(model.price, tier);
  const baseSubtotal    = model.price * days;
  const subtotal        = finalDailyPrice * days;
  const savings         = baseSubtotal - subtotal;

  // Per-unit prices
  const childSeatUnitPriceUSD     = days > 0 ? subtotal * 0.05 : 0;
  const additionalDriverPriceTRY  = ADDITIONAL_DRIVER_TRY;
  const extraKmPriceTRY           = EXTRA_KM_TRY;

  // Formatted price labels for cards
  const childSeatPriceLabel    = days > 0
    ? `${displayPrice(childSeatUnitPriceUSD)} ${t("perUnit")}`
    : `5% ${t("perUnit")}`;
  const additionalDriverLabel  = `${displayPriceTRY(additionalDriverPriceTRY)} ${t("perUnit")}`;
  const extraKmLabel           = displayPriceTRY(extraKmPriceTRY);

  // Summary extras list with prices
  const extraLines: { label: string; price: string }[] = [];
  if (childSeats > 0) extraLines.push({
    label: `${t("services.childSeat.title")} ×${childSeats}`,
    price: displayPrice(childSeatUnitPriceUSD * childSeats),
  });
  if (additionalDrivers > 0) extraLines.push({
    label: `${t("services.additionalDriver.title")} ×${additionalDrivers}`,
    price: displayPriceTRY(additionalDriverPriceTRY * additionalDrivers),
  });
  if (extraKm) extraLines.push({
    label: t("services.extraKm.title"),
    price: extraKmLabel,
  });

  function handleContinue() {
    const params = new URLSearchParams();
    if (pickupDate)             params.set("from",             pickupDate);
    if (returnDate)             params.set("to",               returnDate);
    params.set("insurance",                insurancePackage);
    if (childSeats > 0)        params.set("childSeat",         String(childSeats));
    if (additionalDrivers > 0) params.set("additionalDriver",  String(additionalDrivers));
    if (extraKm)               params.set("extraKm",           "1");
    router.push(`/booking/${model.id}/details?${params.toString()}`);
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <main className="min-h-screen bg-[#f9f9f9] pt-16">

        {/* ── Step progress bar ─────────────────────────────────────────── */}
        <div className="bg-white border-b border-[#e5e5e5]">
          <div className="max-w-[1200px] mx-auto px-6 py-5">
            <StepBar t={t} />
          </div>
        </div>

        {/* ── Page heading ──────────────────────────────────────────────── */}
        <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-6">
          <h1 className="text-[30px] font-bold tracking-tight text-[#0a0a0a] mb-1">
            {t("pageTitle")}
          </h1>
          <p className="text-[15px] text-[#6e6e73]">{t("pageSubtitle")}</p>
        </div>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <div className="max-w-[1200px] mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

            {/* ── Service cards ─────────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Child Seat */}
              <ServiceCard>
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-[#fff7ed] flex items-center justify-center shrink-0 text-[24px]">
                    🪑
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-[16px] font-bold text-[#0a0a0a] leading-snug">
                        {t("services.childSeat.title")}
                      </p>
                      <span className="text-[14px] font-semibold text-[#4ba6ea] shrink-0">
                        {childSeatPriceLabel}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#6e6e73] mt-0.5">
                      {t("services.childSeat.description")}
                    </p>
                  </div>
                </div>
                <QuantitySelector
                  value={childSeats}
                  max={2}
                  onChange={setChildSeats}
                />
              </ServiceCard>

              {/* Additional Driver */}
              <ServiceCard>
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-[#f0f9ff] flex items-center justify-center shrink-0 text-[24px]">
                    👤
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-[16px] font-bold text-[#0a0a0a] leading-snug">
                        {t("services.additionalDriver.title")}
                      </p>
                      <span className="text-[14px] font-semibold text-[#4ba6ea] shrink-0">
                        {additionalDriverLabel}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#6e6e73] mt-0.5">
                      {t("services.additionalDriver.description")}
                    </p>
                  </div>
                </div>
                <QuantitySelector
                  value={additionalDrivers}
                  max={3}
                  onChange={setAdditionalDrivers}
                />
              </ServiceCard>

              {/* Extra 500 KM */}
              <ServiceCard>
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-[#f0fdf4] flex items-center justify-center shrink-0 text-[24px]">
                    🛣️
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-[16px] font-bold text-[#0a0a0a] leading-snug">
                        {t("services.extraKm.title")}
                      </p>
                      <span className="text-[14px] font-semibold text-[#4ba6ea] shrink-0">
                        {extraKmLabel}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#6e6e73] mt-0.5">
                      {t("services.extraKm.description")}
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={extraKm}
                  onChange={setExtraKm}
                  labelOn={t("on")}
                  labelOff={t("off")}
                />
              </ServiceCard>

              {/* Continue button */}
              <button
                onClick={handleContinue}
                className="w-full h-13 rounded-2xl bg-[#4ba6ea] text-white text-[15px] font-semibold hover:bg-[#2d8fd4] active:scale-[0.99] transition-all duration-150 mt-4"
                style={{ height: 52 }}
              >
                {t("continue")}
              </button>
            </div>

            {/* ── Booking summary sidebar ───────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-md px-8 py-10 sticky top-20">
              <h2 className="text-[17px] font-bold text-[#0a0a0a] mb-7">
                {t("summaryTitle")}
              </h2>

              {/* Car image + name */}
              <div className="pb-7 mb-7 border-b border-[#f0f0f0]">
                {model.image_url ? (
                  <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-[#f5f5f7] mb-3">
                    <Image
                      src={model.image_url}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/2] rounded-xl bg-[#f5f5f7] flex items-center justify-center mb-3">
                    <Car className="w-8 h-8 text-[#b0b0b0]" />
                  </div>
                )}
                <p className="text-[15px] font-bold text-[#0a0a0a] leading-snug">{title}</p>
                <p className="text-[12px] text-[#86868b] capitalize mt-0.5">{model.category}</p>
              </div>

              {/* Dates + duration */}
              {pickupDate && returnDate ? (
                <div className="space-y-2.5 pb-7 mb-7 border-b border-[#f0f0f0]">
                  <SummaryRow label={t("summaryPickup")}  value={displayDate(pickupDate)} />
                  <SummaryRow label={t("summaryReturn")}  value={displayDate(returnDate)} />
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

              {/* Insurance */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#f0f0f0]">
                <span className="text-[13px] text-[#6e6e73]">{t("summaryInsurance")}</span>
                <InsuranceChip pkg={insurancePackage} />
              </div>

              {/* Price breakdown */}
              {days > 0 && (
                <div className="space-y-2 mb-6">
                  <SummaryRow
                    label={t("summaryBaseRate")}
                    value={`${displayPrice(model.price)} × ${days} ${days === 1 ? t("summaryDay") : t("summaryDays")}`}
                  />
                  {tier && savings > 0 && (
                    <SummaryRow
                      label={`${t("summaryDiscount")} (${tier.discount_percent}%)`}
                      value={`-${displayPrice(savings)}`}
                      discount
                    />
                  )}
                  <div className="border-t border-[#f0f0f0] pt-2">
                    <SummaryRow
                      label={t("summarySubtotal")}
                      value={displayPrice(subtotal)}
                      bold
                    />
                  </div>
                </div>
              )}

              {/* Extras summary */}
              <div className="pb-6 mb-6 border-t border-[#f5f5f7] pt-6">
                <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wide mb-2">
                  {t("summaryExtras")}
                </p>
                {extraLines.length > 0 ? (
                  <ul className="space-y-2">
                    {extraLines.map((line) => (
                      <li
                        key={line.label}
                        className="flex items-center justify-between gap-2 text-[13px]"
                      >
                        <span className="flex items-center gap-1.5 text-[#1d1d1f] min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ba6ea] shrink-0" />
                          <span className="truncate">{line.label}</span>
                        </span>
                        <span className="text-[#4ba6ea] font-semibold shrink-0">{line.price}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-[#b0b0b0] italic">{t("summaryNone")}</p>
                )}
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-[#86868b] leading-relaxed border-t border-[#f5f5f7] pt-6">
                {t("summaryNote")}
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
