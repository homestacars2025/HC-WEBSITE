"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion } from "motion/react";
import { CalendarDays, ChevronDown, Search } from "lucide-react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CarCategory } from "@/types";

const TODAY = new Date().toISOString().split("T")[0];

const CATEGORIES: { value: CarCategory | ""; labelKey: string }[] = [
  { value: "",         labelKey: "allCategories" },
  { value: "economy",  labelKey: "economy"       },
  { value: "middle",   labelKey: "middle"        },
  { value: "suv",      labelKey: "suv"           },
  { value: "luxury",   labelKey: "luxury"        },
  { value: "electric", labelKey: "electric"      },
  { value: "van",      labelKey: "van"           },
];

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function SearchBar() {
  const t = useTranslations("fleet");
  const router = useRouter();
  const [pickup, setPickup] = useState(TODAY);
  const [returnDate, setReturnDate] = useState(tomorrow());
  const [category, setCategory] = useState<CarCategory | "">("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (pickup) params.set("from", pickup);
    if (returnDate) params.set("to", returnDate);
    if (category) params.set("category", category);
    router.push(`/fleet?${params.toString()}`);
  }

  function handlePickupChange(val: string) {
    setPickup(val);
    if (returnDate && val >= returnDate) {
      const d = new Date(val);
      d.setDate(d.getDate() + 1);
      setReturnDate(d.toISOString().split("T")[0]);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-2xl border border-[#e5e5e5] shadow-xl bg-white overflow-hidden"
    >
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto]">

            {/* Pickup date */}
            <DateField
              icon={<CalendarDays className="w-4 h-4 text-[#86868b]" />}
              label={t("pickupDate")}
              value={pickup}
              min={TODAY}
              onChange={handlePickupChange}
              bordered
            />

            {/* Return date */}
            <DateField
              icon={<CalendarDays className="w-4 h-4 text-[#86868b]" />}
              label={t("returnDate")}
              value={returnDate}
              min={pickup || TODAY}
              onChange={setReturnDate}
              bordered
            />

            {/* Category */}
            <div className={cn(
              "flex items-center gap-3 px-5 py-4 sm:min-w-[180px]",
              "border-b sm:border-b-0 sm:border-e border-[#e5e5e5]",
            )}>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868b] mb-1.5">
                  {t("category")}
                </p>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CarCategory | "")}
                    className={cn(
                      "w-full appearance-none bg-transparent text-[14px] font-medium pr-5 cursor-pointer focus:outline-none",
                      category ? "text-[#0a0a0a]" : "text-[#86868b]"
                    )}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {t(c.labelKey as Parameters<typeof t>[0])}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute end-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Search button */}
            <div className="flex items-center p-3">
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#4ba6ea] text-white text-[14px] font-medium hover:bg-[#2d8fd4] active:scale-[0.98] transition-all duration-150"
              >
                <Search className="w-4 h-4" />
                {t("searchCta")}
              </button>
            </div>
          </div>
    </motion.div>
  );
}

function DateField({
  icon, label, value, min, onChange, bordered,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  min: string;
  onChange: (val: string) => void;
  bordered?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-5 py-4",
      bordered && "border-b sm:border-b-0 sm:border-e border-[#e5e5e5]"
    )}>
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868b] mb-1.5">
          {label}
        </p>
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[14px] font-medium text-[#0a0a0a] focus:outline-none cursor-pointer"
        />
      </div>
    </div>
  );
}
