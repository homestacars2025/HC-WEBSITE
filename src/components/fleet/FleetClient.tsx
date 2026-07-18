"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAvailableModels, activeCarCountByModel } from "@/lib/supabase/availability";
import { fetchActivePricingTiers, type PricingTier } from "@/lib/pricing";
import Filters from "./Filters";
import CarGrid from "./CarGrid";
import type { ModelGroup } from "@/types";

export interface FleetFilters {
  category: string;
  transmission: string;
  fuel: string;
}

const EMPTY_FILTERS: FleetFilters = { category: "", transmission: "", fuel: "" };

export default function FleetClient() {
  const searchParams = useSearchParams();

  // Date range — drives server-side availability filtering (re-fetches on change)
  const [pickupDate, setPickupDate] = useState(searchParams.get("from") ?? "");
  const [returnDate, setReturnDate] = useState(searchParams.get("to")   ?? "");

  // Category / transmission / fuel — applied in memory on top of fetched data
  const [filters, setFilters] = useState<FleetFilters>({
    ...EMPTY_FILTERS,
    category: searchParams.get("category") ?? "",
  });

  const [allCars, setAllCars] = useState<ModelGroup[]>([]);
  const [tiers,   setTiers]   = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Fetch pricing tiers once (they don't depend on date range) ───────────────
  useEffect(() => {
    fetchActivePricingTiers(createClient()).then(setTiers);
  }, []);

  // ── Re-fetch whenever the date range changes ─────────────────────────────────
  useEffect(() => {
    const client = createClient();
    setLoading(true);
    setError(null);

    const run = async () => {
      if (pickupDate && returnDate) {
        // Availability-aware fetch — returns only models with free cars
        const models = await getAvailableModels(client, pickupDate, returnDate);
        setAllCars(models);
      } else {
        // No date range — show every model group that still has an active car
        // (groups whose cars were all sold / removed must not appear in stock).
        const [{ data, error: err }, activeCounts] = await Promise.all([
          client.from("model_group").select("*").order("created_at", { ascending: false }),
          activeCarCountByModel(client),
        ]);

        if (err) setError(err.message);
        else
          setAllCars(
            ((data ?? []) as ModelGroup[]).filter(
              (m) => (activeCounts.get(String(m.id)) ?? 0) > 0,
            ),
          );
      }
      setLoading(false);
    };

    run().catch((err) => {
      setError(String(err));
      setLoading(false);
    });
  }, [pickupDate, returnDate]);

  // ── Derive unique filter options from loaded data ────────────────────────────
  const options = useMemo(() => {
    const categories    = [...new Set(allCars.map((c) => c.category).filter(Boolean))].sort();
    const transmissions = [...new Set(allCars.map((c) => c.transmission).filter(Boolean))].sort();
    const fuels         = [...new Set(allCars.map((c) => c.fuel).filter(Boolean))].sort();
    return { categories, transmissions, fuels };
  }, [allCars]);

  // ── Apply in-memory filters (category / transmission / fuel) ─────────────────
  const filtered = useMemo(() => {
    return allCars.filter((car) => {
      if (filters.category     && car.category.toLowerCase()     !== filters.category.toLowerCase())     return false;
      if (filters.transmission && car.transmission.toLowerCase() !== filters.transmission.toLowerCase()) return false;
      if (filters.fuel         && car.fuel.toLowerCase()         !== filters.fuel.toLowerCase())         return false;
      return true;
    });
  }, [allCars, filters]);

  const hasActiveFilters = Boolean(filters.category || filters.transmission || filters.fuel);
  const datesActive      = Boolean(pickupDate && returnDate);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <Filters
        filters={filters}
        options={options}
        onChange={setFilters}
        totalCount={allCars.length}
        filteredCount={filtered.length}
        loading={loading}
        pickupDate={pickupDate}
        returnDate={returnDate}
        onClearDates={() => { setPickupDate(""); setReturnDate(""); }}
      />
      <CarGrid
        cars={filtered}
        tiers={tiers}
        loading={loading}
        error={error}
        hasActiveFilters={hasActiveFilters || datesActive}
        datesActive={datesActive}
        pickupDate={pickupDate}
        returnDate={returnDate}
      />
    </div>
  );
}
