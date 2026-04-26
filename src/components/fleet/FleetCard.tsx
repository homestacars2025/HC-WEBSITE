"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Settings2,
  Fuel,
  Users,
  Briefcase,
  Route,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useCurrency } from "@/lib/context/currency-context";
import { findMatchingTier, applyDiscount, type PricingTier } from "@/lib/pricing";
import { calculateDays } from "@/lib/utils/format";
import { EASE } from "@/lib/motion";
import type { ModelGroup } from "@/types";
import DateSelectionModal from "@/components/shared/DateSelectionModal";


const CATEGORY_STYLES: Record<string, { background: string; color: string }> = {
  economy:  { background: "#dcfce7", color: "#16a34a" },
  middle:   { background: "#dbeafe", color: "#2563eb" },
  suv:      { background: "#ffedd5", color: "#ea580c" },
  luxury:   { background: "#f3e8ff", color: "#9333ea" },
  electric: { background: "#ccfbf1", color: "#0d9488" },
  van:      { background: "#fef9c3", color: "#ca8a04" },
};

function categoryStyle(cat: string): { background: string; color: string } {
  return CATEGORY_STYLES[cat.toLowerCase()] ?? { background: "#f3f4f6", color: "#6b7280" };
}

function formatKm(km: number): string {
  if (!km) return "—";
  return km >= 1000 ? `${(km / 1000).toFixed(0)}k km` : `${km} km`;
}

interface Props {
  car: ModelGroup;
  index?: number;
  tiers?: PricingTier[];
  pickupDate?: string;
  returnDate?: string;
}

export default function FleetCard({ car, index = 0, tiers = [], pickupDate, returnDate }: Props) {
  const t = useTranslations("fleet");
  const { displayPrice } = useCurrency();
  const [showModal, setShowModal] = useState(false);

  const title = [car.brand, car.model].filter(Boolean).join(" ") || car.name;

  const bookingHref = (() => {
    const params = new URLSearchParams();
    if (pickupDate) params.set("from", pickupDate);
    if (returnDate) params.set("to", returnDate);
    const qs = params.toString();
    return `/booking/${car.id}${qs ? `?${qs}` : ""}`;
  })();

  // ── Pricing ──────────────────────────────────────────────────────────────────
  const hasDates = Boolean(pickupDate && returnDate);
  const days      = hasDates ? calculateDays(pickupDate!, returnDate!) : 0;
  const tier      = hasDates ? findMatchingTier(tiers, days) : null;
  const finalPrice = applyDiscount(car.price, tier);
  const hasDiscount = tier !== null && tier.discount_percent > 0;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 36 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.52, delay: (index % 3) * 0.1, ease: EASE },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{ willChange: "transform" }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col"
    >
      {/* ── Image ────────────────────────────────────────────────────────────── */}
      <div className="relative h-[280px] bg-[#e8e8e8] shrink-0 overflow-hidden">
        {car.image_url ? (
          <Image
            src={car.image_url}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#efefef] to-[#dcdcdc]">
            <span className="text-6xl select-none opacity-60" role="img" aria-label="Car">🚗</span>
          </div>
        )}

        {/* Category badge — top start */}
        <span
          className="absolute top-3 start-3 text-[11px] font-semibold px-3 py-1 rounded-full capitalize select-none"
          style={categoryStyle(car.category)}
        >
          {car.category}
        </span>

        {/* Discount badge — bottom start, only when dates + tier match */}
        {hasDiscount && (
          <span className="absolute bottom-3 start-3 bg-green-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full select-none">
            -{tier!.discount_percent}% {t("discountOff")}
          </span>
        )}

        {/* Price pill — top end */}
        <div className="absolute top-3 end-3 bg-[#0a0a0a]/75 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/10">
          {hasDiscount && (
            <span className="text-[11px] text-white/40 line-through leading-none">
              {displayPrice(car.price)}
            </span>
          )}
          <span className="text-[15px] font-bold text-white leading-none">
            {displayPrice(finalPrice)}
          </span>
          <span className="text-[11px] text-white/50">{t("perDay")}</span>
        </div>

      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-5 pb-5 pt-3">

        <h3 className="text-[20px] font-bold text-[#0a0a0a] leading-snug mb-3 truncate">
          {title}
        </h3>

        {/* Specs 2×2 grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <SpecBox icon={<Settings2 className="w-4 h-4" />} label={t("cardTransmission")} value={car.transmission} />
          <SpecBox icon={<Fuel      className="w-4 h-4" />} label={t("cardFuel")}         value={car.fuel} />
          <SpecBox icon={<Users     className="w-4 h-4" />} label={t("cardSeats")}        value={`${car.seats} ${t("cardSeats")}`} />
          <SpecBox icon={<Briefcase className="w-4 h-4" />} label={t("cardLuggage")}      value={`${car.luggage} ${t("cardBags")}`} />
        </div>

        {/* KM pills */}
        <div className="flex items-center gap-2 mb-5 mt-auto flex-wrap">
          <KmPill icon={<Route        className="w-3 h-3" />} value={`${formatKm(car.daily_km)}${t("perDay")}`} />
          <KmPill icon={<Route        className="w-3 h-3" />} value={`${formatKm(car.monthly_km)}${t("perMonth")}`} />
          {car.min_age > 0 && (
            <KmPill icon={<ShieldCheck className="w-3 h-3" />} value={`${car.min_age}+ ${t("yearsOld")}`} />
          )}
        </div>

        {/* Book Now */}
        {hasDates ? (
          <Link
            href={bookingHref}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#4ba6ea] text-white text-[14px] font-semibold hover:bg-[#2d8fd4] active:scale-[0.98] transition-all duration-150"
            style={{ height: 48 }}
          >
            {t("bookNow")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#4ba6ea] text-white text-[14px] font-semibold hover:bg-[#2d8fd4] active:scale-[0.98] transition-all duration-150"
            style={{ height: 48 }}
          >
            {t("bookNow")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        )}
      </div>

      {showModal && (
        <DateSelectionModal carId={car.id} onClose={() => setShowModal(false)} />
      )}
    </motion.article>
  );
}

// ─── Spec box ─────────────────────────────────────────────────────────────────

function SpecBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-[#f5f5f7] rounded-xl px-3 py-2">
      <span className="text-[#4ba6ea]">{icon}</span>
      <span className="text-[11px] text-[#86868b] leading-none">{label}</span>
      <span className="text-[13px] font-bold text-[#1d1d1f] capitalize leading-none">{value}</span>
    </div>
  );
}

// ─── KM pill ──────────────────────────────────────────────────────────────────

function KmPill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white border border-[#e5e5e5] rounded-full px-3 py-1 text-[12px] text-[#86868b] whitespace-nowrap">
      <span className="text-[#b0b0b0]">{icon}</span>
      {value}
    </span>
  );
}
