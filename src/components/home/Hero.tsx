"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Car, Search, Check, Clock, ChevronDown } from "lucide-react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import DatePicker from "@/components/shared/DatePicker";
import {
  HagiaSophia,
  GalataTower,
  BosphorusBridge,
  OttomanTulip,
} from "@/components/illustrations/Istanbul";
import type { CarCategory } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_DAYS = 5;
const TODAY = new Date().toISOString().split("T")[0];

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const rise = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const t          = useTranslations("home");
  const tFleet     = useTranslations("fleet");
  const router     = useRouter();
  const locale     = useLocale();
  const reduceMotion = useReducedMotion();

  const [pickup,         setPickup]         = useState(TODAY);
  const [returnDate,     setReturnDate]      = useState(addDays(TODAY, MIN_DAYS));
  const [category,       setCategory]        = useState<CarCategory | "">("");
  const [minNoteVisible, setMinNoteVisible]  = useState(false);

  const CATEGORIES: { value: CarCategory | ""; label: string }[] = [
    { value: "",          label: t("allCarTypes") },
    { value: "economy",   label: tFleet("economy") },
    { value: "middle",    label: tFleet("middle") },
    { value: "suv",       label: tFleet("suv") },
    { value: "luxury",    label: tFleet("luxury") },
    { value: "electric",  label: tFleet("electric") },
    { value: "van",       label: tFleet("van") },
  ];

  const TRUST_ITEMS = [
    { icon: Check, text: t("trustFullInsurance") },
    { icon: Check, text: t("trustNoHiddenFees") },
    { icon: Clock, text: t("trust247Support")   },
  ];

  function handlePickupChange(val: string) {
    setPickup(val);
    const minReturn = addDays(val, MIN_DAYS);
    if (returnDate < minReturn) {
      setReturnDate(minReturn);
      setMinNoteVisible(true);
      setTimeout(() => setMinNoteVisible(false), 3000);
    }
  }

  function handleReturnChange(val: string) {
    const minReturn = addDays(pickup, MIN_DAYS);
    if (val < minReturn) {
      setMinNoteVisible(true);
      setTimeout(() => setMinNoteVisible(false), 3000);
      return;
    }
    setMinNoteVisible(false);
    setReturnDate(val);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (pickup)     params.set("from",     pickup);
    if (returnDate) params.set("to",       returnDate);
    if (category)   params.set("category", category);
    router.push(`/fleet?${params.toString()}`);
  }

  const isRTL = locale === "ar";

  return (
    <section className="bg-[#f9f9f9] pt-16 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Background Istanbul illustrations ───────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <HagiaSophia  className="absolute right-[-6%] bottom-0 w-[52%] max-w-[600px] opacity-[0.07]" />
        <GalataTower  className="absolute left-[-2%] bottom-0 w-[11%] max-w-[130px] opacity-[0.07]" />
        <BosphorusBridge className="absolute inset-x-0 bottom-0 w-full opacity-[0.05]" />
        <OttomanTulip className="absolute left-[6%] top-[12%] w-[5%] max-w-[64px] opacity-[0.08]" />
        <OttomanTulip className="absolute right-[6%] top-[12%] w-[5%] max-w-[64px] opacity-[0.06] scale-x-[-1]" />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 text-center">
        <motion.div
          variants={stagger}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
        >

          {/* Badge */}
          <motion.div
            variants={rise}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5e5e5] shadow-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#4ba6ea] shrink-0" />
            <span className="text-[13px] text-[#6e6e73] font-medium">
              {t("heroBadge")}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={rise}
            className="text-[48px] sm:text-[58px] font-bold tracking-[-0.03em] leading-[1.06] text-[#0a0a0a] mb-3"
          >
            {t("heroTitle1")}{" "}
            <span className="text-[#4ba6ea]">{t("heroTitleHighlight")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={rise}
            className="text-[16px] text-[#6e6e73] leading-relaxed mb-8 max-w-[440px] mx-auto"
          >
            {t("heroSubtitle")}
          </motion.p>

          {/* ── Search card ───────────────────────────────────────────────── */}
          <motion.div
            variants={rise}
            className="bg-white rounded-2xl border border-[#e5e5e5] shadow-xl p-8 text-start mb-5"
          >
            {/* Row 1 — Date pickers */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <DatePicker
                label={t("searchPickupDate")}
                value={pickup}
                onChange={handlePickupChange}
                min={TODAY}
                rangeStart={pickup}
                rangeEnd={returnDate}
              />
              <DatePicker
                label={t("searchReturnDate")}
                value={returnDate}
                onChange={handleReturnChange}
                min={addDays(pickup, MIN_DAYS)}
                rangeStart={pickup}
                rangeEnd={returnDate}
              />
            </div>

            {/* Row 2 — Car type */}
            <div className="relative mb-4">
              <Car className="absolute start-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#86868b] pointer-events-none" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CarCategory | "")}
                className={cn(
                  "w-full appearance-none bg-[#f5f5f7] rounded-xl h-14 ps-11 pe-10 text-[16px] font-medium focus:outline-none cursor-pointer transition-colors",
                  category ? "text-[#0a0a0a]" : "text-[#6e6e73]"
                )}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b] pointer-events-none" />
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="w-full h-14 rounded-xl bg-[#4ba6ea] text-white text-[17px] font-[600] hover:bg-[#2d8fd4] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2.5"
            >
              <Search className="w-5 h-5" />
              {t("searchButton")}
            </button>

            {/* Footnote */}
            <p className={cn(
              "text-center text-[12px] mt-3.5 transition-colors duration-300",
              minNoteVisible ? "text-red-500 font-medium" : "text-[#b0b0b0]"
            )}>
              {minNoteVisible ? t("minRentalNote") : t("freeCancellation")}
            </p>
          </motion.div>

          {/* ── Trust badges ──────────────────────────────────────────────── */}
          <motion.div
            variants={rise}
            className="flex items-center justify-center gap-6 flex-wrap"
          >
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 text-[13px] text-[#86868b]"
              >
                <Icon className="w-3.5 h-3.5 text-[#4ba6ea]" />
                {text}
              </span>
            ))}
          </motion.div>

        </motion.div>
      </div>

    </section>
  );
}
