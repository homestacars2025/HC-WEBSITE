"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Check, Car, AlertCircle, ChevronDown, Search } from "lucide-react";
import Image from "next/image";

import { useCurrency } from "@/lib/context/currency-context";
import { createClient } from "@/lib/supabase/client";
import { fetchActivePricingTiers, findMatchingTier, applyDiscount, type PricingTier } from "@/lib/pricing";
import { NATIONALITIES } from "@/lib/nationalities";
import { cn } from "@/lib/utils";
import type { ModelGroup } from "@/types";
import DateSelectionModal from "@/components/shared/DateSelectionModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const ADDITIONAL_DRIVER_TRY = 1500;
const EXTRA_KM_TRY          = 5000;

const INSURANCE_PCT: Record<string, number> = {
  none: 0, basic: 10, medium: 15, full: 20,
};

const COUNTRY_CODES = [
  { code: "+90",  flag: "🇹🇷", name: "Turkey"        },
  { code: "+218", flag: "🇱🇾", name: "Libya"         },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia"  },
  { code: "+971", flag: "🇦🇪", name: "UAE"           },
  { code: "+962", flag: "🇯🇴", name: "Jordan"        },
  { code: "+965", flag: "🇰🇼", name: "Kuwait"        },
  { code: "+974", flag: "🇶🇦", name: "Qatar"         },
  { code: "+973", flag: "🇧🇭", name: "Bahrain"       },
  { code: "+968", flag: "🇴🇲", name: "Oman"          },
  { code: "+20",  flag: "🇪🇬", name: "Egypt"         },
  { code: "+213", flag: "🇩🇿", name: "Algeria"       },
  { code: "+216", flag: "🇹🇳", name: "Tunisia"       },
  { code: "+212", flag: "🇲🇦", name: "Morocco"       },
  { code: "+1",   flag: "🇺🇸", name: "United States" },
  { code: "+44",  flag: "🇬🇧", name: "United Kingdom"},
  { code: "+49",  flag: "🇩🇪", name: "Germany"       },
  { code: "+33",  flag: "🇫🇷", name: "France"        },
  { code: "+39",  flag: "🇮🇹", name: "Italy"         },
  { code: "+7",   flag: "🇷🇺", name: "Russia"        },
];

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

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ t }: { t: ReturnType<typeof useTranslations<"details">> }) {
  const steps = [
    { n: 1, label: t("stepCar") },
    { n: 2, label: t("stepInsurance") },
    { n: 3, label: t("stepExtras") },
    { n: 4, label: t("stepDetails") },
  ];
  const current = 4;

  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2 shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors",
              step.n < current   && "bg-green-500 text-white",
              step.n === current && "bg-[#4ba6ea] text-white",
              step.n > current   && "bg-[#f0f0f0] text-[#86868b]",
            )}>
              {step.n < current ? <Check className="w-4 h-4" /> : step.n}
            </div>
            <span className={cn(
              "text-[14px] font-medium whitespace-nowrap",
              step.n === current ? "text-[#0a0a0a]" : "text-[#86868b]",
            )}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-px mx-4",
              step.n < current ? "bg-green-300" : "bg-[#e5e5e5]",
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Form primitives ──────────────────────────────────────────────────────────

const inputCls = (error?: boolean) => cn(
  "w-full h-[52px] rounded-xl border px-4 text-[15px] text-[#0a0a0a] bg-white",
  "focus:outline-none transition-colors placeholder:text-[#c0c0c0]",
  error
    ? "border-red-400 focus:border-red-500"
    : "border-[#e5e5e5] focus:border-[#4ba6ea]",
);

function FieldLabel({
  label,
  required,
  optional,
}: {
  label: string;
  required?: boolean;
  optional?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-[13px] font-medium text-[#6e6e73]">{label}</span>
      {required && <span className="text-red-500 text-[12px]">*</span>}
      {optional && <span className="text-[12px] text-[#b0b0b0]">({optional})</span>}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] p-6">
      <h2 className="text-[16px] font-bold text-[#0a0a0a] mb-5">{title}</h2>
      {children}
    </div>
  );
}

// ─── Nationality searchable select ────────────────────────────────────────────

function NationalitySelect({
  value,
  onChange,
  error,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  placeholder: string;
}) {
  const locale   = useLocale();
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return NATIONALITIES;
    return NATIONALITIES.filter((n) =>
      n.en.toLowerCase().includes(q) ||
      n.ar.includes(search.trim()) ||
      n.tr.toLowerCase().includes(q)
    );
  }, [search]);

  const selected     = NATIONALITIES.find((n) => n.value === value);
  const displayName  = selected
    ? (locale === "ar" ? selected.ar : locale === "tr" ? selected.tr : selected.en)
    : "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full h-[52px] rounded-xl border px-4 text-[15px] bg-white",
          "flex items-center justify-between gap-2 transition-colors focus:outline-none",
          open
            ? "border-[#4ba6ea]"
            : error
              ? "border-red-400"
              : "border-[#e5e5e5] hover:border-[#c0c0c0]",
          displayName ? "text-[#0a0a0a]" : "text-[#c0c0c0]",
        )}
      >
        <span className="truncate text-start">{displayName || placeholder}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-[#86868b] shrink-0 transition-transform duration-150",
          open && "rotate-180",
        )} />
      </button>

      {open && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 bg-white rounded-2xl border border-[#e5e5e5] shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2.5 border-b border-[#f0f0f0] flex items-center gap-2 px-3">
            <Search className="w-4 h-4 text-[#86868b] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-[14px] text-[#0a0a0a] bg-transparent focus:outline-none placeholder:text-[#c0c0c0]"
              placeholder="..."
            />
          </div>
          {/* List */}
          <div className="overflow-y-auto max-h-56">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-[#86868b] text-center">—</div>
            ) : (
              filtered.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => { onChange(n.value); setOpen(false); }}
                  className={cn(
                    "w-full text-start px-4 py-2.5 text-[14px] transition-colors",
                    n.value === value
                      ? "bg-[#4ba6ea]/10 text-[#4ba6ea] font-semibold"
                      : "text-[#1d1d1f] hover:bg-[#f5f5f7]",
                  )}
                >
                  {locale === "ar" ? n.ar : locale === "tr" ? n.tr : n.en}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Summary helpers ──────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  bold = false,
  discount = false,
  large = false,
  money = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  discount?: boolean;
  large?: boolean;
  money?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn(
        discount ? "text-green-600 text-[13px]" :
        large    ? "text-[15px] font-bold text-[#0a0a0a]" :
        bold     ? "text-[13px] font-semibold text-[#0a0a0a]" :
                   "text-[13px] text-[#6e6e73]",
      )}>
        {label}
      </span>
      <span className={cn(
        money && "font-mono tabular-nums",
        discount ? "font-semibold text-green-600 text-[13px]" :
        large    ? "text-[17px] font-bold text-[#0a0a0a]" :
        bold     ? "text-[13px] font-bold text-[#0a0a0a]" :
                   "text-[13px] text-[#1d1d1f]",
      )}>
        {value}
      </span>
    </div>
  );
}

const INSURANCE_CHIP_STYLE: Record<string, { bg: string; color: string }> = {
  none:   { bg: "#f5f5f7", color: "#9ca3af" },
  basic:  { bg: "#dcfce7", color: "#16a34a" },
  medium: { bg: "#dbeafe", color: "#2563eb" },
  full:   { bg: "#1d1d1f", color: "#ffffff" },
};

// ─── DetailsPage ──────────────────────────────────────────────────────────────

interface Props {
  model: ModelGroup;
  pickupDate: string;
  returnDate: string;
  insurancePackage: string;
  childSeats: number;
  additionalDrivers: number;
  extraKm: boolean;
}

export default function DetailsPage({
  model,
  pickupDate,
  returnDate,
  insurancePackage,
  childSeats,
  additionalDrivers,
  extraKm,
}: Props) {
  const t      = useTranslations("details");
  const locale = useLocale();
  const router = useRouter();
  const { currency, displayPrice, displayPriceTRY, toUSD } = useCurrency();

  const isRTL = locale === "ar";
  const days  = daysBetween(pickupDate, returnDate);
  const title = [model.brand, model.model].filter(Boolean).join(" ") || model.name;

  // ── Pricing tier ────────────────────────────────────────────────────────────
  const [tier, setTier] = useState<PricingTier | null>(null);
  useEffect(() => {
    if (!days) return;
    fetchActivePricingTiers(createClient()).then((tiers) =>
      setTier(findMatchingTier(tiers, days))
    );
  }, [model.id, days]);

  const finalDailyPrice   = applyDiscount(model.price, tier);
  const baseSubtotal      = model.price * days;
  const carSubtotal       = finalDailyPrice * days;
  const savings           = baseSubtotal - carSubtotal;
  const insurancePct      = INSURANCE_PCT[insurancePackage] ?? 0;
  const insuranceCostUSD  = carSubtotal * (insurancePct / 100);
  const childSeatCostUSD  = carSubtotal * 0.05 * childSeats;
  const driverCostUSD     = toUSD(ADDITIONAL_DRIVER_TRY * additionalDrivers);
  const extraKmCostUSD    = extraKm ? toUSD(EXTRA_KM_TRY) : 0;
  const totalUSD          = carSubtotal + insuranceCostUSD + childSeatCostUSD + driverCostUSD + extraKmCostUSD;

  const insuranceName: Record<string, string> = {
    none: t("insuranceNone"), basic: t("insuranceBasic"),
    medium: t("insuranceMedium"), full: t("insuranceFull"),
  };
  const chipStyle = INSURANCE_CHIP_STYLE[insurancePackage] ?? INSURANCE_CHIP_STYLE.medium;

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    first_name:              "",
    last_name:               "",
    birth_date:              "",
    nationality:             "",
    country_code:            "+90",
    phone:                   "",
    email:                   "",
    address:                 "",
    id_type:                 "",
    id_number:               "",
    driving_license_number:  "",
    license_issue_date:      "",
  });
  const [errors,        setErrors]        = useState<Record<string, boolean>>({});
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState("");
  // Set when the booking insert fails with the 23P01 exclusion-constraint
  // violation (the selected dates were taken by another customer first).
  const [datesConflict, setDatesConflict] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  }

  function validate(): boolean {
    const required = [
      "first_name", "last_name", "birth_date", "nationality",
      "phone", "id_type", "id_number", "driving_license_number",
      "license_issue_date",
    ];
    const next: Record<string, boolean> = {};
    for (const f of required) {
      if (!(form as Record<string, string>)[f]?.trim()) next[f] = true;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    setDatesConflict(false);

    const supabase = createClient();

    // 1 ── Insert customer ────────────────────────────────────────────────────
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        first_name:             form.first_name.trim(),
        last_name:              form.last_name.trim(),
        birth_date:             form.birth_date,
        nationality:            form.nationality,
        phone:                  `${form.country_code}${form.phone.trim()}`,
        email:                  form.email.trim() || null,
        address:                form.address.trim() || null,
        id_type:                form.id_type,
        id_number:              form.id_number.trim(),
        driving_license_number: form.driving_license_number.trim(),
        license_issue_date:     form.license_issue_date,
      })
      .select("id")
      .single();

    if (customerError || !customer) {
      console.error("❌ Customer insert error:", JSON.stringify(customerError, null, 2));
      setSubmitError(t("errorSubmit"));
      setSubmitting(false);
      return;
    }

    // 2 ── Create the booking SERVER-SIDE ─────────────────────────────────────
    //   The server picks a specific ACTIVE car in this model group, re-verifies
    //   is_active, generates the booking number and inserts the row. Car
    //   selection and the sold-car guard are never trusted to the client — a
    //   sold / removed car (is_active = false) can never be booked from here.
    let bookingNumber = "";
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelGroupId:  model.id,
          pickupDate,
          returnDate,
          customerId:    customer.id,
          insuranceType: insurancePackage,
          // Extras — the server re-prices from these; never sends a raw amount.
          childSeats,
          additionalDrivers,
          extraKm,
        }),
      });

      const result = (await res.json().catch(() => ({}))) as {
        bookingNumber?: string;
        error?: string;
      };

      if (!res.ok || !result.bookingNumber) {
        // dates_conflict = the car was taken for these dates (race / overlap);
        // unavailable = the model has no active, free car (e.g. just sold out).
        if (result.error === "dates_conflict" || result.error === "unavailable") {
          setDatesConflict(true);
          setSubmitError(t("errorUnavailable"));
        } else {
          setSubmitError(t("errorSubmit"));
        }
        setSubmitting(false);
        return;
      }

      bookingNumber = result.bookingNumber;
    } catch {
      setSubmitError(t("errorSubmit"));
      setSubmitting(false);
      return;
    }

    router.push(
      `/booking/success?ref=${encodeURIComponent(bookingNumber)}&car=${encodeURIComponent(title)}`
    );
  }

  // Navigate to the fleet page, preserving the selected date range so the
  // customer can pick a different car for the same dates.
  function handleBrowseOtherCars() {
    const params = new URLSearchParams();
    if (pickupDate) params.set("from", pickupDate);
    if (returnDate) params.set("to", returnDate);
    const qs = params.toString();
    router.push(qs ? `/fleet?${qs}` : "/fleet");
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <main className="min-h-screen bg-[#f9f9f9] pt-16">

        {/* Step bar */}
        <div className="bg-white border-b border-[#e5e5e5]">
          <div className="max-w-[1200px] mx-auto px-6 py-5">
            <StepBar t={t} />
          </div>
        </div>

        {/* Page heading */}
        <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-6">
          <h1 className="text-[30px] font-bold tracking-tight text-[#0a0a0a] mb-1">
            {t("pageTitle")}
          </h1>
          <p className="text-[15px] text-[#6e6e73]">{t("pageSubtitle")}</p>
        </div>

        {/* Main grid */}
        <div className="max-w-[1200px] mx-auto px-6 pb-24">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start"
          >
            {/* ── LEFT: form sections ──────────────────────────────────── */}
            <div className="space-y-5">

              {/* Personal Information */}
              <SectionCard title={t("sectionPersonal")}>
                <div className="space-y-4">

                  {/* First + Last name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel label={t("firstName")} required />
                      <input
                        type="text"
                        value={form.first_name}
                        onChange={(e) => setField("first_name", e.target.value)}
                        className={inputCls(errors.first_name)}
                        autoComplete="given-name"
                      />
                    </div>
                    <div>
                      <FieldLabel label={t("lastName")} required />
                      <input
                        type="text"
                        value={form.last_name}
                        onChange={(e) => setField("last_name", e.target.value)}
                        className={inputCls(errors.last_name)}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  {/* Birth date + Nationality */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel label={t("birthDate")} required />
                      <input
                        type="date"
                        value={form.birth_date}
                        onChange={(e) => setField("birth_date", e.target.value)}
                        max={new Date().toISOString().slice(0, 10)}
                        className={cn(inputCls(errors.birth_date), "text-[14px]")}
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <FieldLabel label={t("nationality")} required />
                      <NationalitySelect
                        value={form.nationality}
                        onChange={(v) => setField("nationality", v)}
                        error={errors.nationality}
                        placeholder={t("idTypePlaceholder")}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <FieldLabel label={t("phoneNumber")} required />
                    <div className="flex gap-2" dir="ltr">
                      <select
                        value={form.country_code}
                        onChange={(e) => setField("country_code", e.target.value)}
                        className={cn(
                          "h-[52px] rounded-xl border border-[#e5e5e5] px-3 text-[14px] text-[#0a0a0a] bg-white",
                          "focus:outline-none focus:border-[#4ba6ea] transition-colors shrink-0 w-[120px]",
                        )}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        className={cn(inputCls(errors.phone), "flex-1")}
                        autoComplete="tel-national"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  {/* Email (optional) */}
                  <div>
                    <FieldLabel label={t("email")} optional={t("addressPlaceholder")} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      className={inputCls()}
                      autoComplete="email"
                      inputMode="email"
                      dir="ltr"
                    />
                  </div>

                  {/* Address (optional) */}
                  <div>
                    <FieldLabel label={t("address")} optional={t("addressPlaceholder")} />
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setField("address", e.target.value)}
                      className={inputCls()}
                      autoComplete="street-address"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* ID Document */}
              <SectionCard title={t("sectionDocument")}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label={t("idType")} required />
                    <select
                      value={form.id_type}
                      onChange={(e) => setField("id_type", e.target.value)}
                      className={cn(
                        "w-full h-[52px] rounded-xl border px-4 text-[15px] text-[#0a0a0a] bg-white",
                        "focus:outline-none transition-colors",
                        errors.id_type
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#e5e5e5] focus:border-[#4ba6ea]",
                      )}
                    >
                      <option value="">{t("idTypePlaceholder")}</option>
                      <option value="passport">{t("passport")}</option>
                      <option value="national_id">{t("nationalId")}</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel label={t("idNumber")} required />
                    <input
                      type="text"
                      value={form.id_number}
                      onChange={(e) => setField("id_number", e.target.value)}
                      className={inputCls(errors.id_number)}
                      dir="ltr"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* Driving License */}
              <SectionCard title={t("sectionLicense")}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label={t("drivingLicenseNumber")} required />
                    <input
                      type="text"
                      value={form.driving_license_number}
                      onChange={(e) => setField("driving_license_number", e.target.value)}
                      className={inputCls(errors.driving_license_number)}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <FieldLabel label={t("licenseIssueDate")} required />
                    <input
                      type="date"
                      value={form.license_issue_date}
                      onChange={(e) => setField("license_issue_date", e.target.value)}
                      max={new Date().toISOString().slice(0, 10)}
                      className={cn(inputCls(errors.license_issue_date), "text-[14px]")}
                      dir="ltr"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* Dates-taken conflict (23P01): actionable message + recovery buttons */}
              {datesConflict ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[14px] text-red-600 font-medium leading-relaxed">
                      {submitError}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      type="button"
                      onClick={handleBrowseOtherCars}
                      className="flex-1 h-12 rounded-xl bg-[#4ba6ea] text-white text-[14px] font-semibold hover:bg-[#2d8fd4] active:scale-[0.98] transition-all duration-150"
                    >
                      {t("errorBrowseOtherCars")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDateModal(true)}
                      className="flex-1 h-12 rounded-xl bg-white border border-[#e5e5e5] text-[#1d1d1f] text-[14px] font-semibold hover:bg-[#f5f5f7] active:scale-[0.98] transition-all duration-150"
                    >
                      {t("errorChangeDates")}
                    </button>
                  </div>
                </div>
              ) : (
                (Object.values(errors).some(Boolean) || submitError) && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-[14px] text-red-600 font-medium">
                      {submitError || t("errorRequired")}
                    </p>
                  </div>
                )
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "w-full rounded-2xl text-white text-[16px] font-semibold transition-all duration-150",
                  "active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed",
                  "bg-[#1d1d1f] hover:bg-[#333]",
                )}
                style={{ height: 56 }}
              >
                {submitting ? t("submitting") : t("submit")}
              </button>
            </div>

            {/* ── RIGHT: Booking summary ────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-md px-8 py-10 sticky top-20">
              <h2 className="text-[17px] font-bold text-[#0a0a0a] mb-7">
                {t("summaryTitle")}
              </h2>

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
                <div className="space-y-2.5 pb-7 mb-7 border-b border-[#f0f0f0]">
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
                <div className="space-y-2 pb-7 mb-7 border-b border-[#f0f0f0]">
                  <SummaryRow
                    label={t("summaryBaseRate")}
                    value={`${displayPrice(model.price)} × ${days} ${days === 1 ? t("summaryDay") : t("summaryDays")}`}
                    money
                  />
                  {tier && savings > 0 && (
                    <SummaryRow
                      label={`${t("summaryDiscount")} (${tier.discount_percent}%)`}
                      value={`-${displayPrice(savings)}`}
                      discount
                      money
                    />
                  )}
                  <SummaryRow label={t("summaryRental")} value={displayPrice(carSubtotal)} bold money />

                  {insurancePct > 0 ? (
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-[#6e6e73]">{t("summaryInsurance")}</span>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: chipStyle.bg, color: chipStyle.color }}
                        >
                          {insuranceName[insurancePackage] ?? insurancePackage}
                        </span>
                      </div>
                      <span className="text-[13px] text-[#1d1d1f]">
                        +{displayPrice(insuranceCostUSD)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-[13px] text-[#6e6e73]">{t("summaryInsurance")}</span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: chipStyle.bg, color: chipStyle.color }}
                      >
                        {insuranceName[insurancePackage] ?? insurancePackage}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Extras */}
              <div className="space-y-2 pb-7 mb-7 border-b border-[#f0f0f0]">
                <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wide mb-2">
                  {t("summaryExtras")}
                </p>
                {childSeats === 0 && additionalDrivers === 0 && !extraKm ? (
                  <p className="text-[13px] text-[#b0b0b0] italic">{t("summaryNoExtras")}</p>
                ) : (
                  <div className="space-y-2">
                    {childSeats > 0 && (
                      <SummaryRow
                        label={`${t("childSeat")} ×${childSeats}`}
                        value={`+${displayPrice(childSeatCostUSD)}`}
                        money
                      />
                    )}
                    {additionalDrivers > 0 && (
                      <SummaryRow
                        label={`${t("additionalDriver")} ×${additionalDrivers}`}
                        value={`+${displayPriceTRY(ADDITIONAL_DRIVER_TRY * additionalDrivers)}`}
                        money
                      />
                    )}
                    {extraKm && (
                      <SummaryRow
                        label={t("extraKm")}
                        value={`+${displayPriceTRY(EXTRA_KM_TRY)}`}
                        money
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Total */}
              {days > 0 && (
                <div className="pt-1">
                  <SummaryRow
                    label={t("summaryTotal")}
                    value={displayPrice(totalUSD)}
                    large
                    money
                  />
                </div>
              )}
            </div>
          </form>
        </div>

      </main>

      {/* Change-dates flow reuses the existing booking date modal */}
      {showDateModal && (
        <DateSelectionModal
          carId={String(model.id)}
          onClose={() => setShowDateModal(false)}
        />
      )}
    </div>
  );
}
