"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Users, Gauge, ArrowRight } from "lucide-react";
import { useCurrency } from "@/lib/context/currency-context";
import { getCarDescription } from "@/lib/utils/format";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Car, Locale } from "@/types";

interface CarCardProps {
  car: Car;
  locale: Locale;
  index?: number;
}

const CATEGORY_META: Record<string, { label: string; bg: string }> = {
  luxury:   { label: "Luxury",   bg: "bg-amber-50   text-amber-700"   },
  suv:      { label: "SUV",      bg: "bg-emerald-50 text-emerald-700" },
  economy:  { label: "Economy",  bg: "bg-sky-50     text-sky-700"     },
  middle:   { label: "Middle",   bg: "bg-violet-50  text-violet-700"  },
  electric: { label: "Electric", bg: "bg-teal-50    text-teal-700"    },
  van:      { label: "Van",      bg: "bg-orange-50  text-orange-700"  },
};

export default function CarCard({ car, locale, index = 0 }: CarCardProps) {
  const t = useTranslations("fleet");
  const { displayPrice } = useCurrency();

  const hasImage = car.images.length > 0;
  const description = getCarDescription(car, locale);
  const meta = CATEGORY_META[car.category] ?? { label: car.category, bg: "bg-[#f5f5f7] text-[#6e6e73]" };

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay: index * 0.08, ease: EASE },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.10)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ willChange: "transform" }}
      className="group bg-white rounded-2xl overflow-hidden border border-[#e5e5e5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col hover:border-[#c8c8c8] transition-colors duration-200"
    >
      {/* ── Image ────────────────────────────────────────────────────────── */}
      <div className="relative h-[220px] bg-[#f5f5f7] overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <Image
            src={car.images[0]}
            alt={car.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full"
            style={{ background: "linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)" }}
          >
            <span className="text-5xl select-none" role="img" aria-label="Car">🚗</span>
          </div>
        )}

        {/* Category badge */}
        <div className={cn("absolute top-3 start-3 px-2.5 py-1 rounded-full text-[11px] font-semibold", meta.bg)}>
          {meta.label}
        </div>

        {/* Price badge */}
        <div className="absolute top-3 end-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
          <span className="text-[13px] font-bold text-[#1d1d1f]">
            {displayPrice(car.price_per_day)}
          </span>
          <span className="text-[11px] text-[#6e6e73]"> / {t("perDay").replace("/ ", "")}</span>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1.5 leading-snug">{car.name}</h3>

        <p className="text-[13px] text-[#6e6e73] leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>

        <div className="flex items-center gap-4 mb-4 mt-auto">
          <span className="flex items-center gap-1.5 text-[13px] text-[#6e6e73]">
            <Users className="w-3.5 h-3.5" />
            {car.seats} {t("seats")}
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-[#6e6e73] capitalize">
            <Gauge className="w-3.5 h-3.5" />
            {car.transmission}
          </span>
          {!car.available && (
            <span className="ms-auto text-[11px] font-medium text-red-500">
              {t("unavailable")}
            </span>
          )}
        </div>

        <Link
          href="/fleet"
          className="group/btn inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[13px] font-semibold hover:bg-brand-strong hover:text-white transition-colors duration-200"
        >
          {t("bookNow")}
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}
