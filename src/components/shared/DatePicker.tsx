"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseYMD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format a stored YYYY-MM-DD value for display using the active locale */
function displayDate(s: string, locale: string): string {
  if (!s) return "";
  return parseYMD(s).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

/** Return the 7 weekday abbreviations (Sun-first) for a given locale */
function getWeekdayAbbrs(locale: string): string[] {
  // Jan 7 2024 is a Sunday — iterate through the week
  return Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 7 + i).toLocaleDateString(locale, { weekday: "short" })
  );
}

/** Return the full month name for a given year/month in the active locale */
function getMonthName(year: number, month: number, locale: string): string {
  return new Date(year, month, 1).toLocaleDateString(locale, { month: "long", year: "numeric" });
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

interface DatePickerProps {
  label:       string;
  value:       string;        // "YYYY-MM-DD"
  onChange:    (val: string) => void;
  min?:        string;        // dates before this are disabled
  rangeStart?: string;        // for range highlight strip
  rangeEnd?:   string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  min,
  rangeStart,
  rangeEnd,
}: DatePickerProps) {
  const t      = useTranslations("common");
  const locale = useLocale();

  const todayYMD  = toYMD(new Date());
  const initDate  = value ? parseYMD(value) : new Date();

  const [open,       setOpen]       = useState(false);
  const [viewYear,   setViewYear]   = useState(initDate.getFullYear());
  const [viewMonth,  setViewMonth]  = useState(initDate.getMonth());

  const rootRef = useRef<HTMLDivElement>(null);

  // Keep view in sync when value is changed externally
  useEffect(() => {
    if (value) {
      const d = parseYMD(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function onMouse(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown",   onKey);
    };
  }, [open]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(ymd: string) {
    onChange(ymd);
    setOpen(false);
  }

  // Build grid: leading empty cells + day numbers
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const hasRange  = !!(rangeStart && rangeEnd && rangeStart < rangeEnd);
  const weekdays  = getWeekdayAbbrs(locale);
  const monthName = getMonthName(viewYear, viewMonth, locale);

  return (
    <div ref={rootRef} className="relative">

      {/* ── Trigger button ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full bg-[#f5f5f7] rounded-xl px-4 h-14 flex flex-col gap-0.5 justify-center text-start transition-all",
          open ? "ring-2 ring-[#4ba6ea] bg-white" : "hover:bg-[#ebebeb]"
        )}
      >
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-[#86868b]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">
            {label}
          </span>
        </div>
        <span className={cn(
          "text-[15px] font-semibold leading-none",
          value ? "text-[#0a0a0a]" : "text-[#b0b0b0]"
        )}>
          {value ? displayDate(value, locale) : t("selectDate")}
        </span>
      </button>

      {/* ── Calendar dropdown ─────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 4,  scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute top-[calc(100%+8px)] start-0 z-50 bg-white rounded-2xl p-5 w-72"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.13)" }}
          >

            {/* Month / year navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[15px] font-bold text-[#0a0a0a] capitalize">
                {monthName}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {weekdays.map(d => (
                <div
                  key={d}
                  className="text-center text-[11px] font-semibold text-[#86868b] uppercase tracking-wide py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {cells.map((day, idx) => {
                if (day === null) return <div key={idx} className="h-9" />;

                const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                const isSelected   = ymd === value;
                const isToday      = ymd === todayYMD;
                const isDisabled   = !!(min && ymd < min);
                const isRangeStart = hasRange && ymd === rangeStart;
                const isRangeEnd   = hasRange && ymd === rangeEnd;
                const isInRange    = hasRange && ymd > rangeStart! && ymd < rangeEnd!;
                const isEndpoint   = isRangeStart || isRangeEnd || isSelected;

                let stripStyle: React.CSSProperties = {};
                if (hasRange) {
                  if (isRangeStart && !isRangeEnd)
                    stripStyle = { background: "linear-gradient(to right, transparent 50%, #dbeafe 50%)" };
                  else if (isRangeEnd && !isRangeStart)
                    stripStyle = { background: "linear-gradient(to left, transparent 50%, #dbeafe 50%)" };
                  else if (isInRange)
                    stripStyle = { backgroundColor: "#dbeafe" };
                }

                return (
                  <div
                    key={idx}
                    className="h-9 flex items-center justify-center"
                    style={stripStyle}
                  >
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => selectDay(ymd)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-colors",
                        isDisabled  && "text-[#d0d0d0] cursor-not-allowed",
                        isEndpoint  && "bg-[#4ba6ea] text-white",
                        isToday     && !isEndpoint && "ring-2 ring-[#4ba6ea] text-[#0a0a0a]",
                        isInRange   && !isEndpoint && "text-[#1d4ed8]",
                        !isDisabled && !isEndpoint && !isToday && "hover:bg-[#f5f5f7] text-[#0a0a0a] cursor-pointer",
                      )}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
