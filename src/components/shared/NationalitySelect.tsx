"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useLocale } from "next-intl";
import { ChevronDown, Search } from "lucide-react";
import { NATIONALITIES } from "@/lib/nationalities";
import { cn } from "@/lib/utils";

export default function NationalitySelect({
  value,
  onChange,
  error,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  placeholder: string;
}) {
  const locale   = useLocale();
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return NATIONALITIES;
    return NATIONALITIES.filter((n) =>
      n.en.toLowerCase().includes(q) ||
      n.ar.includes(search.trim()) ||
      n.tr.toLowerCase().includes(q)
    );
  }, [search]);

  const selected     = NATIONALITIES.find((n) => n.value === value);
  const displayName  = selected
    ? (locale === "ar" ? selected.ar : locale === "tr" ? selected.tr : selected.en)
    : "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full h-[52px] rounded-xl border px-4 text-[15px] bg-white",
          "flex items-center justify-between gap-2 transition-colors focus:outline-none",
          open
            ? "border-brand"
            : error
              ? "border-red-400"
              : "border-[#e5e5e5] hover:border-[#c0c0c0]",
          displayName ? "text-[#0a0a0a]" : "text-[#c0c0c0]",
        )}
      >
        <span className="truncate text-start">{displayName || placeholder}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-[#86868b] shrink-0 transition-transform duration-150",
          open && "rotate-180",
        )} />
      </button>

      {open && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 bg-white rounded-2xl border border-[#e5e5e5] shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2.5 border-b border-[#f0f0f0] flex items-center gap-2 px-3">
            <Search className="w-4 h-4 text-[#86868b] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-[14px] text-[#0a0a0a] bg-transparent focus:outline-none placeholder:text-[#c0c0c0]"
              placeholder="..."
            />
          </div>
          {/* List */}
          <div className="overflow-y-auto max-h-56">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-[#86868b] text-center">—</div>
            ) : (
              filtered.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => { onChange(n.value); setOpen(false); }}
                  className={cn(
                    "w-full text-start px-4 py-2.5 text-[14px] transition-colors",
                    n.value === value
                      ? "bg-brand/10 text-brand-strong font-semibold"
                      : "text-[#1d1d1f] hover:bg-[#f5f5f7]",
                  )}
                >
                  {locale === "ar" ? n.ar : locale === "tr" ? n.tr : n.en}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
