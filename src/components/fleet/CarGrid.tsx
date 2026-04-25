"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Car } from "lucide-react";
import FleetCard from "./FleetCard";
import type { ModelGroup } from "@/types";
import type { PricingTier } from "@/lib/pricing";

interface CarGridProps {
  cars: ModelGroup[];
  tiers?: PricingTier[];
  loading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  datesActive?: boolean;
  pickupDate?: string;
  returnDate?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
      <div className="h-[230px] bg-[#ebebeb]" />
      <div className="px-5 pb-5 pt-3 space-y-3">
        <div className="h-5 bg-[#ebebeb] rounded-full w-3/5" />
        <div className="flex gap-1.5 flex-wrap">
          {[52, 48, 44, 52].map((w, i) => (
            <div key={i} className="h-6 bg-[#ebebeb] rounded-full" style={{ width: w }} />
          ))}
        </div>
        <div className="h-3.5 bg-[#ebebeb] rounded-full w-2/5" />
        <div className="h-12 bg-[#ebebeb] rounded-xl mt-1" />
      </div>
    </div>
  );
}

// ─── Empty / Error states ─────────────────────────────────────────────────────

function EmptyState({ filtered, datesActive }: { filtered: boolean; datesActive?: boolean }) {
  const t = useTranslations("fleet");

  const heading = datesActive
    ? t("noDateTitle")
    : filtered
    ? t("noResults")
    : t("comingSoonTitle");

  const body = datesActive
    ? t("noDateBody")
    : filtered
    ? t("noResultsBody")
    : t("comingSoonBody");

  return (
    <div className="flex flex-col items-center justify-center py-28 text-center col-span-full">
      <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-5">
        <Car className="w-7 h-7 text-[#b0b0b0]" />
      </div>
      <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-2">{heading}</h3>
      <p className="text-[14px] text-[#6e6e73] max-w-[300px] leading-relaxed">{body}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const t = useTranslations("fleet");
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center col-span-full">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-2">
        {t("errorTitle")}
      </h3>
      <p className="text-[12px] text-[#86868b] font-mono max-w-[440px] break-all leading-relaxed">
        {message}
      </p>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export default function CarGrid({
  cars,
  tiers = [],
  loading,
  error,
  hasActiveFilters,
  datesActive,
  pickupDate,
  returnDate,
}: CarGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1">
        <ErrorState message={error} />
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState filtered={hasActiveFilters} datesActive={datesActive} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car, i) => (
        <FleetCard key={car.id} car={car} index={i} tiers={tiers} pickupDate={pickupDate} returnDate={returnDate} />
      ))}
    </div>
  );
}
