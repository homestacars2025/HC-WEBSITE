"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils/format";
import { useGeoDetection } from "@/hooks/useGeoDetection";
import type { Currency } from "@/types";

const VALID_CURRENCIES: Currency[] = ["USD", "EUR", "LYD", "TRY"];

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  displayPrice: (priceUSD: number, compact?: boolean) => string;
  displayPriceTRY: (priceTRY: number, compact?: boolean) => string;
  toUSD: (priceTRY: number) => number;
  ratesLoaded: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
  displayPrice: (p) => formatPrice(p, "USD", true),
  displayPriceTRY: (p) => formatPrice(p, "TRY", true),
  toUSD: (p) => p / 34,
  ratesLoaded: false,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  // Map: currency code → rate_to_try (e.g. USD → 34.5, EUR → 37.2, LYD → 7.1)
  const [rates, setRates] = useState<Map<string, number>>(new Map());
  const [ratesLoaded, setRatesLoaded] = useState(false);

  // ── Restore persisted currency (geo-detects on first visit if nothing saved) ─
  useEffect(() => {
    const saved = localStorage.getItem("hc-currency") as Currency | null;
    if (saved && (VALID_CURRENCIES as string[]).includes(saved)) {
      setCurrencyState(saved);
    }
    // geo detection runs via useGeoDetection below when no saved preference
  }, []);

  // ── Fetch exchange rates once on mount ─────────────────────────────────────
  useEffect(() => {
    createClient()
      .from("exchange_rates")
      .select("currency, rate_to_try")
      .then(({ data }) => {
        if (!data) return;
        const map = new Map<string, number>();
        for (const row of data) {
          map.set(row.currency as string, row.rate_to_try as number);
        }
        // TRY is the base unit for all rate_to_try values, so its own rate is 1.
        // This lets the formula (usdRate / targetRate) work for TRY automatically.
        map.set("TRY", 1);
        setRates(map);
        setRatesLoaded(true);
      });
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("hc-currency", c);
  }, []);

  // ── Auto-detect currency from IP on first visit ────────────────────────────
  useGeoDetection(setCurrency);

  // ── Convert USD price → target currency ───────────────────────────────────
  // Formula: price_usd × (rate_USD_to_TRY / rate_target_to_TRY)
  const displayPrice = useCallback(
    (priceUSD: number, compact = true): string => {
      if (ratesLoaded && rates.size > 0) {
        const usdRate    = rates.get("USD") ?? 1;
        const targetRate = rates.get(currency) ?? usdRate;
        const converted  = priceUSD * (usdRate / targetRate);
        return formatPrice(converted, currency, compact);
      }
      return formatPrice(priceUSD, "USD", compact);
    },
    [currency, rates, ratesLoaded]
  );

  // ── Convert TRY price → target currency ───────────────────────────────────
  // Formula: price_try / rate_target_to_TRY
  const displayPriceTRY = useCallback(
    (priceTRY: number, compact = true): string => {
      if (ratesLoaded && rates.size > 0) {
        const targetRate = rates.get(currency) ?? 1;
        return formatPrice(priceTRY / targetRate, currency, compact);
      }
      return formatPrice(priceTRY, "TRY", compact);
    },
    [currency, rates, ratesLoaded]
  );

  // ── Convert TRY → USD (for grand-total computation before DB insert) ───────
  const toUSD = useCallback(
    (priceTRY: number): number => {
      const usdRate = rates.get("USD") ?? 34;
      return priceTRY / usdRate;
    },
    [rates]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, displayPrice, displayPriceTRY, toUSD, ratesLoaded }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
