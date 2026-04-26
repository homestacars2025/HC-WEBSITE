"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { motion, useScroll } from "motion/react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/lib/context/currency-context";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Currency, Locale } from "@/types";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$", EUR: "€", LYD: "د.ل", TRY: "₺",
};
const CURRENCY_KEYS: Record<Currency, "currencyUSD" | "currencyEUR" | "currencyLYD" | "currencyTRY"> = {
  USD: "currencyUSD", EUR: "currencyEUR", LYD: "currencyLYD", TRY: "currencyTRY",
};
const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English",  flag: "🇬🇧" },
  { value: "ar", label: "العربية",  flag: "🇸🇦" },
  { value: "tr", label: "Türkçe",   flag: "🇹🇷" },
];
const ALL_CURRENCIES: Currency[] = ["USD", "EUR", "LYD", "TRY"];

export default function Navbar() {
  const t        = useTranslations("nav");
  const locale   = useLocale() as Locale;
  const isRTL    = locale === "ar";
  const router   = useRouter();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 20)), [scrollY]);
  useEffect(() => { setOpen(false); }, [pathname]);

  const navLinks = useMemo(() => [
    { href: "/"        as const, label: t("home")    },
    { href: "/fleet"   as const, label: t("fleet")   },
    { href: "/about"   as const, label: t("about")   },
    { href: "/contact" as const, label: t("contact") },
  ], [t]);

  const dropdownAlign = isRTL ? "start" : "end";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 bg-white transition-all duration-300",
        scrolled
          ? "border-b border-[#e5e5e5] shadow-[0_1px_4px_rgba(0,0,0,0.07)]"
          : "border-b border-transparent"
      )}
    >
      {/* ── Desktop ──────────────────────────────────────────────────────── */}
      <div className="hidden md:flex items-center max-w-[1200px] mx-auto px-6 h-16">

        {/* Logo */}
        <Link href="/" className="shrink-0 me-8">
          <img
            src="/logo.svg"
            alt="Homesta Cars"
            className="w-[130px] h-auto"
          />
        </Link>

        {/* Center nav */}
        <nav className="flex items-center gap-0.5 flex-1 justify-center" aria-label={t("mainNavigation")}>
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-4 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150",
                  active
                    ? "text-[#0a0a0a] bg-[#f5f5f7]"
                    : "text-[#6e6e73] hover:text-[#0a0a0a] hover:bg-[#f5f5f7]"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1 shrink-0 ms-8">

          {/* Currency */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#6e6e73] hover:text-[#0a0a0a] hover:bg-[#f5f5f7] transition-colors cursor-pointer outline-none">
              <span>{CURRENCY_SYMBOLS[currency]} {currency}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={dropdownAlign} className="w-44">
              {ALL_CURRENCIES.map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn("gap-2 cursor-pointer text-[13px]", currency === c && "text-[#4ba6ea] font-semibold")}
                >
                  <span>{CURRENCY_SYMBOLS[c]}</span>
                  <span>{c}</span>
                  <span className="text-[#86868b] text-[11px] ms-auto">{t(CURRENCY_KEYS[c])}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#6e6e73] hover:text-[#0a0a0a] hover:bg-[#f5f5f7] transition-colors cursor-pointer outline-none">
              <Globe className="w-3.5 h-3.5" />
              <span>{locale.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={dropdownAlign} className="w-36">
              {LOCALES.map((l) => (
                <DropdownMenuItem
                  key={l.value}
                  onClick={() => router.replace(pathname, { locale: l.value })}
                  className={cn("gap-2 cursor-pointer text-[13px]", locale === l.value && "text-[#4ba6ea] font-semibold")}
                >
                  <span>{l.flag}</span><span>{l.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Book Now */}
          <Link
            href="/fleet"
            className="ms-2 px-5 py-2 rounded-full bg-[#4ba6ea] text-white text-[13px] font-semibold hover:bg-[#2d8fd4] transition-colors duration-150 whitespace-nowrap"
          >
            {t("bookNow")}
          </Link>
        </div>
      </div>

      {/* ── Mobile bar ───────────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-4 h-14">
        <Link href="/" className="shrink-0">
          <img
            src="/logo.svg"
            alt="Homesta Cars"
            className="w-[110px] h-auto"
          />
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg text-[#6e6e73] hover:text-[#0a0a0a] hover:bg-[#f5f5f7] transition-colors"
          aria-label={t("openMenu")}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────────── */}
      {open && (
        <div className="md:hidden border-t border-[#f0f0f0] bg-white pb-3">

          {/* Nav links */}
          <nav className="flex flex-col gap-0.5 px-3 py-2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-[15px] font-medium transition-colors",
                  pathname === href
                    ? "bg-[#f5f5f7] text-[#0a0a0a]"
                    : "text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#0a0a0a]"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Selectors + CTA */}
          <div className="flex flex-col gap-2 px-3 pt-2 border-t border-[#f0f0f0]">

            {/* Language */}
            <div className="flex gap-1.5">
              {LOCALES.map((l) => (
                <button
                  key={l.value}
                  onClick={() => { router.replace(pathname, { locale: l.value }); setOpen(false); }}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                    locale === l.value
                      ? "bg-[#0a0a0a] text-white"
                      : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8e8]"
                  )}
                >
                  {l.flag} {l.value.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Currency */}
            <div className="flex gap-1.5">
              {ALL_CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                    currency === c
                      ? "bg-[#4ba6ea] text-white"
                      : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8e8]"
                  )}
                >
                  {CURRENCY_SYMBOLS[c]} {c}
                </button>
              ))}
            </div>

            {/* Book Now */}
            <Link
              href="/fleet"
              onClick={() => setOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#4ba6ea] text-white text-[14px] font-semibold text-center hover:bg-[#2d8fd4] transition-colors"
            >
              {t("bookNow")}
            </Link>
          </div>
        </div>
      )}
    </motion.header>
  );
}
