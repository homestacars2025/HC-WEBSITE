"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight, Settings2, Users, ArrowRight, Fuel } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCurrency } from "@/lib/context/currency-context";
import { fetchActivePricingTiers, findMatchingTier, applyDiscount, type PricingTier } from "@/lib/pricing";
import { calculateDays } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { ModelGroup } from "@/types";
import DateSelectionModal from "@/components/shared/DateSelectionModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_W  = 380;
const CARD_H  = 480;
const IMAGE_H = Math.round(CARD_H * 0.65); // 312px — edge-to-edge, covers 260px minimum
const BODY_H  = CARD_H - IMAGE_H;          // 168px
const SPRING  = { type: "spring" as const, stiffness: 300, damping: 30 };

const CATEGORY_STYLES: Record<string, { background: string; color: string }> = {
  economy:  { background: "#dcfce7", color: "#16a34a" },
  middle:   { background: "#dbeafe", color: "#2563eb" },
  suv:      { background: "#ffedd5", color: "#ea580c" },
  luxury:   { background: "#f3e8ff", color: "#9333ea" },
  electric: { background: "#ccfbf1", color: "#0d9488" },
  van:      { background: "#fef9c3", color: "#ca8a04" },
};

function catStyle(cat: string) {
  return CATEGORY_STYLES[cat.toLowerCase()] ?? { background: "#f3f4f6", color: "#6b7280" };
}

// ─── Slot config ──────────────────────────────────────────────────────────────

type Slot = { x: number; scale: number; opacity: number; zIndex: number };

function slotForOffset(offset: number): Slot {
  const abs = Math.abs(offset);
  const dir = offset < 0 ? -1 : 1;
  if (abs === 0) return { x: 0,         scale: 1,    opacity: 1,   zIndex: 5 };
  if (abs === 1) return { x: dir * 280, scale: 0.75, opacity: 0.6, zIndex: 4 };
  if (abs === 2) return { x: dir * 480, scale: 0.55, opacity: 0.3, zIndex: 3 };
  return               { x: dir * 650, scale: 0.4,  opacity: 0,   zIndex: 0 };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="absolute bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse"
      style={{ width: CARD_W, height: CARD_H, top: "50%", left: "50%", marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2 }}
    >
      <div style={{ height: IMAGE_H }} className="bg-[#ebebeb]" />
      <div className="p-4 space-y-2.5">
        <div className="h-5 w-2/3 bg-[#ebebeb] rounded-full" />
        <div className="h-3.5 w-1/2 bg-[#ebebeb] rounded-full" />
        <div className="flex gap-3">
          <div className="h-3.5 w-14 bg-[#ebebeb] rounded-full" />
          <div className="h-3.5 w-18 bg-[#ebebeb] rounded-full" />
        </div>
        <div className="h-5 w-24 bg-[#ebebeb] rounded-full" />
        <div className="h-9 bg-[#ebebeb] rounded-xl" />
      </div>
    </div>
  );
}

// ─── Carousel card ────────────────────────────────────────────────────────────

function CarouselCard({
  car,
  offset,
  onSideClick,
  tiers,
  days,
  pickupDate,
  returnDate,
}: {
  car: ModelGroup;
  offset: number;
  onSideClick: () => void;
  tiers: PricingTier[];
  days: number;
  pickupDate: string;
  returnDate: string;
}) {
  const t        = useTranslations("home");
  const { displayPrice } = useCurrency();
  const slot     = slotForOffset(offset);
  const title    = [car.brand, car.model].filter(Boolean).join(" ") || car.name;
  const isCenter = offset === 0;
  const [showModal, setShowModal] = useState(false);
  const hasDates = Boolean(pickupDate && returnDate);

  const tier        = findMatchingTier(tiers, days);
  const finalPrice  = applyDiscount(car.price, tier);
  const hasDiscount = tier !== null && tier.discount_percent > 0;

  return (
    <motion.article
      initial={{ x: slot.x, scale: slot.scale, opacity: slot.opacity }}
      animate={{ x: slot.x, scale: slot.scale, opacity: slot.opacity }}
      transition={SPRING}
      onClick={!isCenter ? onSideClick : undefined}
      style={{
        position:    "absolute",
        width:       CARD_W,
        height:      CARD_H,
        top:         "50%",
        left:        "50%",
        marginLeft:  -CARD_W / 2,
        marginTop:   -CARD_H / 2,
        zIndex:      slot.zIndex,
        cursor:      !isCenter ? "pointer" : "default",
        willChange:  "transform, opacity",
      }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden select-none"
    >
      {/* ── Image — edge-to-edge, object-cover ──────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: IMAGE_H }}>
        {car.image_url ? (
          <Image
            src={car.image_url}
            alt={title}
            fill
            sizes="340px"
            className="object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-[#f5f5f7] flex items-center justify-center">
            <span className="text-6xl opacity-20 select-none">🚗</span>
          </div>
        )}

        {/* Category badge */}
        <span
          className="absolute top-3 start-3 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize"
          style={catStyle(car.category)}
        >
          {car.category}
        </span>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col p-4" style={{ height: BODY_H }}>
        <h3 className="text-[20px] font-bold text-[#0a0a0a] leading-tight truncate">
          {title}
        </h3>
        <p className="text-[12px] text-[#86868b] capitalize truncate mt-0.5">
          {car.brand} · {car.category}
        </p>

        {/* Specs row */}
        <div className="flex items-center gap-2 mt-2 text-[11px] text-[#6e6e73]">
          <span className="inline-flex items-center gap-1">
            <Users className="w-3 h-3 text-[#4ba6ea]" />
            {car.seats} {t("seatsUnit")}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#d0d0d0] shrink-0" />
          <span className="inline-flex items-center gap-1 capitalize">
            <Settings2 className="w-3 h-3 text-[#4ba6ea]" />
            {car.transmission}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#d0d0d0] shrink-0" />
          <span className="inline-flex items-center gap-1 capitalize">
            <Fuel className="w-3 h-3 text-[#4ba6ea]" />
            {car.fuel}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {hasDiscount && (
            <span className="text-[13px] text-[#b0b0b0] line-through leading-none">
              {displayPrice(car.price)}
            </span>
          )}
          <span className="text-[20px] font-bold text-[#0a0a0a] leading-none">
            {displayPrice(finalPrice)}
          </span>
          <span className="text-[11px] text-[#86868b]">{t("perDay")}</span>
          {hasDiscount && (
            <span className="text-[11px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
              -{tier!.discount_percent}%
            </span>
          )}
        </div>

        {/* Book Now */}
        {isCenter && hasDates ? (
          <Link
            href={`/booking/${car.id}?from=${pickupDate}&to=${returnDate}`}
            className="mt-auto flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-[#4ba6ea] text-white text-[13px] font-semibold hover:bg-[#2d8fd4] active:scale-[0.98] transition-all duration-150"
          >
            {t("bookNow")}
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={isCenter ? () => setShowModal(true) : undefined}
            className="mt-auto flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-[#4ba6ea] text-white text-[13px] font-semibold hover:bg-[#2d8fd4] active:scale-[0.98] transition-all duration-150"
            style={{ pointerEvents: isCenter ? "auto" : "none" }}
          >
            {t("bookNow")}
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        )}
      </div>

      {showModal && (
        <DateSelectionModal carId={car.id} onClose={() => setShowModal(false)} />
      )}
    </motion.article>
  );
}

// ─── Arrow button ─────────────────────────────────────────────────────────────

function ArrowBtn({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      animate={{ opacity: disabled ? 0.25 : 1, scale: disabled ? 0.9 : 1 }}
      transition={{ duration: 0.2 }}
      aria-label={label}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] hover:bg-[#f5f5f7] transition-colors disabled:pointer-events-none",
        direction === "left" ? "left-4" : "right-4"
      )}
    >
      {direction === "left"
        ? <ChevronLeft  className="w-5 h-5" />
        : <ChevronRight className="w-5 h-5" />}
    </motion.button>
  );
}

// ─── FeaturedCarousel ─────────────────────────────────────────────────────────

export default function FeaturedCarousel() {
  const t = useTranslations("home");
  const searchParams = useSearchParams();

  const pickupDate = searchParams.get("from") ?? "";
  const returnDate = searchParams.get("to")   ?? "";
  const days = pickupDate && returnDate ? calculateDays(pickupDate, returnDate) : 0;

  const [cars,        setCars]        = useState<ModelGroup[]>([]);
  const [tiers,       setTiers]       = useState<PricingTier[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const dragStartX = useRef<number | null>(null);
  const hasDragged = useRef(false);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const client = createClient();
    Promise.all([
      client.from("model_group").select("*").order("created_at", { ascending: false }).limit(10),
      fetchActivePricingTiers(client),
    ]).then(([{ data }, pricingTiers]) => {
      setCars((data ?? []) as ModelGroup[]);
      setTiers(pricingTiers);
      setLoading(false);
    });
  }, []);

  function goTo(idx: number) {
    setActiveIndex(Math.max(0, Math.min(idx, cars.length - 1)));
  }

  // ── Pointer drag handlers ────────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX;
    hasDragged.current = false;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    if (Math.abs(e.clientX - dragStartX.current) > 8) hasDragged.current = true;
  }
  function onPointerUp(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (!hasDragged.current || Math.abs(delta) < 50) return;
    if (delta < 0) goTo(activeIndex + 1);
    else           goTo(activeIndex - 1);
  }
  function onPointerLeave() {
    dragStartX.current = null;
    hasDragged.current = false;
  }

  const dotCount = Math.min(cars.length, 8);

  // ── Skeleton ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="py-4 bg-white">
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-[#ddd] rounded-full animate-pulse" />
            <div className="h-7 w-44 bg-[#ddd] rounded-full animate-pulse" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto overflow-hidden">
          <div className="relative" style={{ height: CARD_H + 40 }}>
            <SkeletonCard />
          </div>
        </div>
      </section>
    );
  }

  if (cars.length === 0) return null;

  return (
    <section className="py-4 bg-white">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#86868b] mb-1.5">
            {t("ourFleet")}
          </p>
          <h2 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">
            {t("featuredTitle")}
          </h2>
        </div>
        <Link
          href="/fleet"
          className="inline-flex items-center gap-1.5 text-[#4ba6ea] text-[14px] font-medium hover:underline underline-offset-4"
        >
          {t("viewAllCars")}
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>

      {/* ── Stage ───────────────────────────────────────────────────────── */}
      {/* max-w-4xl clips far cards at the container boundary */}
      <div className="max-w-4xl mx-auto overflow-hidden">
        <div
          className="relative"
          style={{ height: CARD_H + 40, touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
        >
          <ArrowBtn
            direction="left"
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            label={t("prevSlide")}
          />
          <ArrowBtn
            direction="right"
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === cars.length - 1}
            label={t("nextSlide")}
          />

          {cars.map((car, i) => (
            <CarouselCard
              key={car.id}
              car={car}
              offset={i - activeIndex}
              onSideClick={() => goTo(i)}
              tiers={tiers}
              days={days}
              pickupDate={pickupDate}
              returnDate={returnDate}
            />
          ))}
        </div>
      </div>

      {/* ── Dots ────────────────────────────────────────────────────────── */}
      {dotCount > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`${t("goToSlide")} ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-200",
                activeIndex === i
                  ? "w-6 h-2 bg-[#4ba6ea]"
                  : "w-2 h-2 bg-[#c8c8c8] hover:bg-[#a0a0a0]"
              )}
            />
          ))}
        </div>
      )}

    </section>
  );
}
