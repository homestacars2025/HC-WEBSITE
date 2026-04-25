"use client";

import { useEffect } from "react";
import type { Currency } from "@/types";

const CURRENCY_KEY = "hc-currency";

const COUNTRY_CURRENCY: Record<string, Currency> = {
  TR: "TRY",
  LY: "LYD",
  // Gulf
  SA: "USD", AE: "USD", QA: "USD", KW: "USD", BH: "USD", OM: "USD",
  // Europe
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
  BE: "EUR", AT: "EUR", PT: "EUR", GR: "EUR", PL: "EUR",
  // English-speaking / default USD
  US: "USD", CA: "USD", AU: "USD", GB: "USD",
};

export function useGeoDetection(setCurrency: (c: Currency) => void) {
  useEffect(() => {
    // Only run once — skip if preference already stored
    if (localStorage.getItem(CURRENCY_KEY)) return;

    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const country = data?.country_code as string | undefined;
        if (!country) return;
        const detected: Currency = COUNTRY_CURRENCY[country] ?? "USD";
        setCurrency(detected);
        // setCurrency writes to localStorage via the context
      })
      .catch(() => {
        // silently fail — keep default USD
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
