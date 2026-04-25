"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { motion, useScroll } from "motion/react";
import { Menu, Globe, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

const CURRENCY_SYMBOLS: Record<Currency, string> = { USD: "$", EUR: "€", LYD: "د.ل", TRY: "₺" };
const CURRENCY_KEYS: Record<Currency, "currencyUSD" | "currencyEUR" | "currencyLYD" | "currencyTRY"> = {
  USD: "currencyUSD", EUR: "currencyEUR", LYD: "currencyLYD", TRY: "currencyTRY",
};

const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
  { value: "tr", label: "Türkçe", flag: "🇹🇷" },
];

const ALL_CURRENCIES: Currency[] = ["USD", "EUR", "LYD", "TRY"];

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Blur backdrop on scroll
  const { scrollY } = useScroll();
  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 24));
  }, [scrollY]);

  const navLinks = useMemo(
    () => [
      { href: "/" as const, label: t("home") },
      { href: "/fleet" as const, label: t("fleet") },
      { href: "/about" as const, label: t("about") },
      { href: "/contact" as const, label: t("contact") },
    ],
    [t]
  );

  const currentSymbol = CURRENCY_SYMBOLS[currency];

  // Sync current locale to localStorage so client code can read it
  useEffect(() => {
    localStorage.setItem("preferred_locale", locale);
  }, [locale]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-[#e5e5e5]"
          : "bg-white border-b border-transparent"
      )}
      style={scrolled ? { boxShadow: "0 1px 0 rgba(0,0,0,0.1)" } : undefined}
    >
      <div className="max-w-[1200px] mx-auto py-4 px-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">

        {/* Logo */}
        <Link href="/">
          <Image
            src="/HC LOGO.png"
            alt="Homesta Cars"
            width={320}
            height={104}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Center nav — links with #4ba6ea underline on hover/active */}
        <nav className="hidden md:flex items-center gap-7" aria-label={t("mainNavigation")}>
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-2 text-[16px] font-[500] transition-colors duration-150 group",
                  active ? "text-[#1d1d1f]" : "text-[#1d1d1f]/60 hover:text-[#1d1d1f]"
                )}
              >
                {link.label}
                {/* Animated underline */}
                <span
                  className={cn(
                    "absolute bottom-0 inset-x-4 h-[2px] bg-[#4ba6ea] rounded-full transition-transform duration-200 origin-left",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center justify-end gap-1">

          {/* Currency selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-[14px] text-[#6e6e73] hover:text-[#0a0a0a] hover:bg-[#f5f5f7] rounded-lg transition-colors cursor-pointer">
              <span>{currentSymbol} {currency}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {ALL_CURRENCIES.map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn("gap-2 cursor-pointer text-[14px]", currency === c && "text-[#4ba6ea] font-medium")}
                >
                  <span>{CURRENCY_SYMBOLS[c]}</span><span>{c}</span>
                  <span className="text-[#86868b] text-xs ms-auto">{t(CURRENCY_KEYS[c])}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-[14px] text-[#6e6e73] hover:text-[#0a0a0a] hover:bg-[#f5f5f7] rounded-lg transition-colors cursor-pointer">
              <Globe className="w-4 h-4" />
              <span>{locale.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {LOCALES.map((l) => (
                <DropdownMenuItem
                  key={l.value}
                  onClick={() => router.replace(pathname, { locale: l.value })}
                  className={cn("gap-2 cursor-pointer text-[14px]", locale === l.value && "text-[#4ba6ea] font-medium")}
                >
                  <span>{l.flag}</span><span>{l.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Book Now pill */}
          <Link
            href="/fleet"
            className="hidden sm:inline-flex ms-1 items-center whitespace-nowrap px-5 py-2 rounded-full bg-[#4ba6ea] text-white text-[13px] font-semibold hover:bg-[#2d8fd4] transition-colors duration-150"
          >
            {t("bookNow")}
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="md:hidden p-2 text-[#6e6e73] hover:text-[#0a0a0a] rounded-lg hover:bg-[#f5f5f7] transition-colors" aria-label={t("openMenu")}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0" showCloseButton={false}>
              <div className="flex flex-col h-full">
                <nav className="flex flex-col gap-0.5 p-4 flex-1">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                      className={cn("px-4 py-3 text-[15px] font-medium rounded-xl transition-colors",
                        pathname === link.href ? "bg-[#f5f5f7] text-[#0a0a0a]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"
                      )}>
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-[#e5e5e5] p-4 flex flex-col gap-2">
                  <div className="flex gap-1">
                    {LOCALES.map((l) => (
                      <button key={l.value}
                        onClick={() => { router.replace(pathname, { locale: l.value }); setMobileOpen(false); }}
                        className={cn("flex-1 py-2.5 text-sm rounded-lg font-medium transition-colors",
                          locale === l.value ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f7] text-[#6e6e73]"
                        )}>
                        {l.flag} {l.value.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {ALL_CURRENCIES.map((c) => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className={cn("flex-1 py-2.5 text-sm rounded-lg font-medium transition-colors",
                          currency === c ? "bg-[#4ba6ea] text-white" : "bg-[#f5f5f7] text-[#6e6e73]"
                        )}>
                        {CURRENCY_SYMBOLS[c]} {c}
                      </button>
                    ))}
                  </div>
                  <Link href="/fleet" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-2.5 mt-1 rounded-full bg-[#4ba6ea] text-white text-sm font-semibold">
                      {t("bookNow")}
                    </button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
