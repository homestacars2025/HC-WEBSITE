import type { Currency, Locale } from "@/types";

const CURRENCY_MAP: Record<Currency, { symbol: string; locale: string }> = {
  USD: { symbol: "$",   locale: "en-US" },
  EUR: { symbol: "€",   locale: "de-DE" },
  LYD: { symbol: "د.ل", locale: "ar-LY" },
  TRY: { symbol: "₺",   locale: "tr-TR" },
};

const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatPrice(
  amount: number,
  currency: Currency = "USD",
  compact = false
): string {
  const key = `${currency}-${compact}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    const { locale } = CURRENCY_MAP[currency];
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: compact ? 0 : 2,
    });
    formatterCache.set(key, formatter);
  }
  return formatter.format(amount);
}

export function formatDate(dateStr: string, locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    en: "en-US",
    ar: "ar-SA",
    tr: "tr-TR",
  };

  return new Intl.DateTimeFormat(localeMap[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function calculateDays(pickup: string, returnDate: string): number {
  const diff =
    new Date(returnDate).getTime() - new Date(pickup).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function calculateTotalPrice(
  pricePerDay: number,
  pickup: string,
  returnDate: string
): number {
  return pricePerDay * calculateDays(pickup, returnDate);
}

export function getCarDescription(
  car: { description_en: string; description_ar: string; description_tr: string },
  locale: Locale
): string {
  const map: Record<Locale, string> = {
    en: car.description_en,
    ar: car.description_ar,
    tr: car.description_tr,
  };
  return map[locale] || car.description_en;
}
