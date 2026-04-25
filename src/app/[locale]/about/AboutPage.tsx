"use client";

import { useEffect, useRef } from "react";
import { motion, animate, useInView } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

const E = EASE as [number, number, number, number];


// ─── Count-up number ──────────────────────────────────────────────────────────

interface StatConfig {
  target:  number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  comma?:  boolean;
}

function CountUp({ target, decimals = 0, prefix = "", suffix = "", comma = false }: StatConfig) {
  const ref       = useRef<HTMLSpanElement>(null);
  const isInView  = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const controls = animate(0, target, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        if (!ref.current) return;
        let display = decimals > 0
          ? v.toFixed(decimals)
          : Math.floor(v).toString();
        if (comma && !decimals) {
          display = Math.floor(v).toLocaleString();
        }
        ref.current.textContent = prefix + display + suffix;
      },
    });
    return () => controls.stop();
  }, [isInView, target, decimals, prefix, suffix, comma]);

  return (
    <span ref={ref}>
      {prefix}0{suffix}
    </span>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS: Array<StatConfig & { labelKey: string }> = [
  { target: 1000, suffix: "+", comma: true,  labelKey: "statsCustomers" },
  { target: 50,   suffix: "+",               labelKey: "statsVehicles"  },
  { target: 2,    suffix: "",                labelKey: "statsBranches"  },
  { target: 4.9,  suffix: " ⭐", decimals: 1, labelKey: "statsRating"   },
];

const WHY_ITEMS = [
  { n: "01", emoji: "🚗", titleKey: "why1Title", descKey: "why1Desc" },
  { n: "02", emoji: "💰", titleKey: "why2Title", descKey: "why2Desc" },
  { n: "03", emoji: "🤝", titleKey: "why3Title", descKey: "why3Desc" },
  { n: "04", emoji: "✈️", titleKey: "why4Title", descKey: "why4Desc" },
] as const;

const BRANCHES = [
  {
    nameKey:     "branch1Name",
    locationKey: "branch1Location",
    href:        "https://maps.app.goo.gl/75yniBfsNxpR1p2e7?g_st=ic",
  },
  {
    nameKey:     "branch2Name",
    locationKey: "branch2Location",
    href:        "https://maps.app.goo.gl/uEyPagwcDzJo18eX8?g_st=ic",
  },
] as const;

// ─── AboutPage ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const t      = useTranslations("about");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  const heroTitle = t("heroTitle");
  const words     = heroTitle.split(" ");

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="bg-white overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════════════
          HERO — 100vh, split layout, staggered words + Istanbul silhouette
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#f9f9f9] pt-16 pb-[60px]">

        <div className="w-full max-w-[1200px] mx-auto px-8 lg:px-16 grid lg:grid-cols-[55%_45%] gap-16 lg:gap-20 items-center py-10 lg:py-14">

          {/* Left: text */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: E }}
              className={cn(
                "text-[13px] font-semibold uppercase tracking-[0.2em] text-[#4ba6ea] mb-6",
                isRTL && "text-right",
              )}
            >
              Homesta Cars
            </motion.p>

            <h1
              className={cn(
                "tracking-tight text-[#0a0a0a] mb-7",
                isRTL
                  ? "text-[42px] sm:text-[50px] lg:text-[56px] font-semibold leading-[1.4] text-right"
                  : "text-[56px] sm:text-[70px] lg:text-[80px] font-bold leading-[1.07]",
              )}
            >
              {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden me-[0.25em] last:me-0">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%",   opacity: 1 }}
                    transition={{ duration: 0.65, ease: E, delay: 0.15 + i * 0.09 }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: E, delay: 0.15 + words.length * 0.09 + 0.1 }}
              className={cn(
                "text-[18px] lg:text-[20px] text-[#6e6e73] leading-relaxed max-w-[480px]",
                isRTL && "text-right",
              )}
            >
              {t("heroSubtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: E, delay: 0.15 + words.length * 0.09 + 0.3 }}
              className={cn("mt-10", isRTL && "flex justify-end")}
            >
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 h-[52px] px-8 rounded-2xl bg-[#4ba6ea] text-white text-[15px] font-semibold hover:bg-[#3a95d9] active:scale-[0.98] transition-all duration-150"
              >
                {t("ctaButton")}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right: Istanbul photo */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: E, delay: 0.25 }}
            className="relative w-full h-[340px] lg:h-[450px] rounded-2xl overflow-hidden shadow-xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80"
              alt="Hagia Sophia, Istanbul"
              fill
              className="object-cover"
              priority
              unoptimized
            />
            {/* Left-edge fade to blend with page background */}
            <div
              aria-hidden
              className="absolute inset-y-0 start-0 w-20 pointer-events-none"
              style={{
                background: isRTL
                  ? "linear-gradient(to left, #f9f9f9, transparent)"
                  : "linear-gradient(to right, #f9f9f9, transparent)",
              }}
            />
          </motion.div>
        </div>

      </section>

      {/* ════════════════════════════════════════════════════════════════════
          STATS — dark section, count-up, vertical dividers
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0a0a0a] py-0 mt-10">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: E, delay: i * 0.1 }}
              className={cn(
                "flex flex-col items-center justify-center text-center px-8 py-16 lg:py-20",
                "border-[#1e1e1e]",
                i < STATS.length - 1 && "border-e",
                i >= 2 && "border-t lg:border-t-0",
              )}
            >
              <span className="text-[60px] lg:text-[72px] font-bold text-white leading-none tracking-tight mb-3">
                <CountUp
                  target={stat.target}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                  comma={stat.comma}
                />
              </span>
              <span className="text-[15px] lg:text-[16px] text-[#86868b] font-medium leading-snug max-w-[130px]">
                {t(stat.labelKey)}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          WHY — #f5f5f7, alternating full-width rows
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f5f5f7] py-24 lg:py-32 px-6">
        <div className="max-w-[1100px] mx-auto">

          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: E }}
            className="mb-16"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#4ba6ea] mb-4">
              {locale === "ar" ? "مميزاتنا" : locale === "tr" ? "Avantajlar" : "Why us"}
            </p>
            <h2 className="text-[36px] lg:text-[48px] font-bold tracking-tight text-[#0a0a0a]">
              {t("whyTitle")}
            </h2>
          </motion.div>

          {/* Rows */}
          <div className="space-y-0">
            {WHY_ITEMS.map((item, i) => {
              const isEven    = i % 2 === 1;
              // In LTR: even rows flip so the number moves to the right
              // In RTL: natural flow reverses the base, even rows bring it back to right
              const xNumber  = isEven ? (isRTL ? -50 : 50) : (isRTL ? 50 : -50);
              const xDesc    = isEven ? (isRTL ? 50 : -50) : (isRTL ? -50 : 50);

              return (
                <div key={item.n}>
                  {i > 0 && <div className="h-px bg-[#e5e5e5]" />}
                  <div
                    className={cn(
                      "grid grid-cols-1 lg:grid-cols-2 gap-8 py-12 lg:py-14",
                      isEven && "lg:[direction:rtl]",
                    )}
                    style={isEven ? { direction: isRTL ? "ltr" : "rtl" } : undefined}
                  >
                    {/* Number + icon + title side */}
                    <motion.div
                      initial={{ opacity: 0, x: xNumber }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.65, ease: E, delay: 0.05 }}
                      style={isEven ? { direction: isRTL ? "rtl" : "ltr" } : undefined}
                      className="flex items-start gap-6"
                    >
                      <span
                        className="text-[80px] lg:text-[100px] font-black leading-none select-none shrink-0"
                        style={{ color: "rgba(0,0,0,0.05)", letterSpacing: "-0.04em" }}
                        aria-hidden
                      >
                        {item.n}
                      </span>
                      <div className="pt-2">
                        <div className="text-[32px] mb-3 leading-none">{item.emoji}</div>
                        <h3 className="text-[22px] lg:text-[26px] font-bold text-[#0a0a0a] tracking-tight">
                          {t(item.titleKey)}
                        </h3>
                      </div>
                    </motion.div>

                    {/* Description side */}
                    <motion.div
                      initial={{ opacity: 0, x: xDesc }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.65, ease: E, delay: 0.15 }}
                      style={isEven ? { direction: isRTL ? "rtl" : "ltr" } : undefined}
                      className="flex items-center"
                    >
                      <p className="text-[17px] lg:text-[18px] text-[#6e6e73] leading-relaxed">
                        {t(item.descKey)}
                      </p>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          BRANCHES — white bg, dark cards with map grid pattern
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 lg:py-32 px-6">
        <div className="max-w-[1100px] mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: E }}
            className="mb-14"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#4ba6ea] mb-4">
              {locale === "ar" ? "المواقع" : locale === "tr" ? "Konumlar" : "Locations"}
            </p>
            <h2 className="text-[36px] lg:text-[48px] font-bold tracking-tight text-[#0a0a0a]">
              {t("branchesTitle")}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {BRANCHES.map((branch, i) => (
              <motion.a
                key={branch.nameKey}
                href={branch.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: E, delay: i * 0.12 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl overflow-hidden bg-[#0a0a0a] p-8 flex flex-col justify-between min-h-[260px] cursor-pointer"
                style={{
                  backgroundImage: [
                    "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
                    "linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                  ].join(","),
                  backgroundSize: "32px 32px",
                }}
              >
                {/* Top: icon + name */}
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#4ba6ea]/15 flex items-center justify-center mb-6">
                    <MapPin className="w-5 h-5 text-[#4ba6ea]" />
                  </div>
                  <h3 className="text-[22px] font-bold text-white leading-snug mb-1.5">
                    {t(branch.nameKey)}
                  </h3>
                  <p className="text-[14px] text-[#6e6e73]">{t(branch.locationKey)}</p>
                </div>

                {/* Bottom: CTA button */}
                <div className="mt-8">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-white/20 text-[13px] font-semibold text-white",
                      "transition-all duration-200",
                      "group-hover:bg-[#4ba6ea] group-hover:border-[#4ba6ea]",
                    )}
                  >
                    {t("getDirections")}
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>

                {/* Subtle corner glow on hover */}
                <div
                  aria-hidden
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#4ba6ea] opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 blur-2xl pointer-events-none"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA — dark, centered
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0a0a0a] px-6 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: E }}
          className="max-w-[680px] mx-auto text-center"
        >
          <h2 className="text-[38px] lg:text-[52px] font-bold tracking-tight text-white leading-[1.07] mb-9">
            {t("ctaTitle")}
          </h2>
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2.5 h-[54px] px-10 rounded-2xl bg-[#4ba6ea] text-white text-[15px] font-semibold hover:bg-[#3a95d9] active:scale-[0.98] transition-all duration-150"
          >
            {t("ctaButton")}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
