"use client";

import { useTranslations, useLocale } from "next-intl";
import { CalendarDays, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FleetFilters } from "./FleetClient";

function shortDate(ymd: string, locale: string): string {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, { month: "short", day: "numeric" });
}

interface FiltersProps {
  filters: FleetFilters;
  options: {
    categories: string[];
    transmissions: string[];
    fuels: string[];
  };
  onChange: (f: FleetFilters) => void;
  totalCount: number;
  filteredCount: number;
  loading: boolean;
  pickupDate?: string;
  returnDate?: string;
  onClearDates?: () => void;
}

export default function Filters({
  filters,
  options,
  onChange,
  totalCount,
  filteredCount,
  loading,
  pickupDate,
  returnDate,
  onClearDates,
}: FiltersProps) {
  const t      = useTranslations("fleet");
  const locale = useLocale();

  const hasActive   = Boolean(filters.category || filters.transmission || filters.fuel);
  const datesActive = Boolean(pickupDate && returnDate);

  const countText = filteredCount === totalCount
    ? `${totalCount} ${totalCount !== 1 ? t("carsCount") : t("carCount")}`
    : `${filteredCount} ${t("filterOf")} ${totalCount}`;

  return (
    <div className="mb-8 space-y-3">

      {/* Date range indicator */}
      {datesActive && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#eff6ff] border border-[#bfdbfe]">
          <CalendarDays className="w-4 h-4 text-[#2563eb] shrink-0" />
          <span className="text-[13px] font-medium text-[#1d4ed8]">
            {t("showingAvailable")} · {shortDate(pickupDate!, locale)} – {shortDate(returnDate!, locale)}
          </span>
          <button
            onClick={onClearDates}
            className="ms-auto flex items-center gap-1 text-[12px] text-[#3b82f6] hover:text-[#1d4ed8] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {t("clearDates")}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">

        {/* Label */}
        <div className="flex items-center gap-1.5 text-[#86868b] shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[13px] font-medium">{t("filterLabel")}</span>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryPill
            label={t("filterAll")}
            active={!filters.category}
            onClick={() => onChange({ ...filters, category: "" })}
          />
          {options.categories.map((cat) => (
            <CategoryPill
              key={cat}
              label={t(cat.toLowerCase() as Parameters<typeof t>[0]) ?? cat}
              active={filters.category.toLowerCase() === cat.toLowerCase()}
              onClick={() =>
                onChange({ ...filters, category: filters.category.toLowerCase() === cat.toLowerCase() ? "" : cat })
              }
            />
          ))}
        </div>

        {/* Divider */}
        {(options.transmissions.length > 0 || options.fuels.length > 0) && (
          <div className="hidden sm:block w-px h-5 bg-[#e5e5e5] shrink-0" />
        )}

        {/* Transmission select */}
        {options.transmissions.length > 0 && (
          <SelectFilter
            value={filters.transmission}
            placeholder={t("filterTransmission")}
            options={options.transmissions}
            onChange={(v) => onChange({ ...filters, transmission: v })}
          />
        )}

        {/* Fuel select */}
        {options.fuels.length > 0 && (
          <SelectFilter
            value={filters.fuel}
            placeholder={t("filterFuel")}
            options={options.fuels}
            onChange={(v) => onChange({ ...filters, fuel: v })}
          />
        )}

        {/* Clear all */}
        {hasActive && (
          <button
            onClick={() => onChange({ category: "", transmission: "", fuel: "" })}
            className="flex items-center gap-1 text-[13px] text-[#86868b] hover:text-[#0a0a0a] transition-colors duration-150"
          >
            <X className="w-3.5 h-3.5" />
            {t("filterClear")}
          </button>
        )}

        {/* Count */}
        {!loading && (
          <span className="text-[13px] text-[#86868b] sm:ms-auto shrink-0">
            {countText}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-[13px] font-medium capitalize transition-all duration-150",
        active
          ? "bg-[#0a0a0a] text-white"
          : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8e8] hover:text-[#0a0a0a]"
      )}
    >
      {label}
    </button>
  );
}

function SelectFilter({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none text-[13px] font-medium rounded-full px-4 py-1.5 pe-8 cursor-pointer transition-colors duration-150 focus:outline-none",
          value
            ? "bg-[#0a0a0a] text-white"
            : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8e8]"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "absolute end-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none",
          value ? "text-white/70" : "text-[#86868b]"
        )}
      />
    </div>
  );
}
