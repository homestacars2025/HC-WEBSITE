"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { X, CalendarDays } from "lucide-react";
import DatePicker from "@/components/shared/DatePicker";

const MIN_DAYS = 5;

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

interface Props {
  carId: string;
  onClose: () => void;
}

export default function DateSelectionModal({ carId, onClose }: Props) {
  const t      = useTranslations("booking");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const TODAY = new Date().toISOString().split("T")[0];

  const [pickup,     setPickup]     = useState(TODAY);
  const [returnDate, setReturnDate] = useState(addDays(TODAY, MIN_DAYS));

  function handlePickupChange(val: string) {
    setPickup(val);
    const minReturn = addDays(val, MIN_DAYS);
    if (!returnDate || returnDate < minReturn) {
      setReturnDate(minReturn);
    }
  }

  function handleContinue() {
    const params = new URLSearchParams();
    params.set("from", pickup);
    params.set("to",   returnDate);
    router.push(`/booking/${carId}?${params.toString()}`);
    onClose();
  }

  const canContinue = Boolean(pickup && returnDate && returnDate >= addDays(pickup, MIN_DAYS));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.94, y: 8  }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eef7ff] flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-[#4ba6ea]" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#0a0a0a] leading-tight">
                  {t("dateModal.title")}
                </h2>
                <p className="text-[13px] text-[#86868b] mt-0.5 leading-snug">
                  {t("dateModal.subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={tCommon("close")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#0a0a0a] transition-colors shrink-0 -mt-0.5 -me-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Date pickers */}
          <div className="p-6 space-y-3">
            <DatePicker
              label={t("dateModal.pickupDate")}
              value={pickup}
              onChange={handlePickupChange}
              min={TODAY}
              rangeStart={pickup}
              rangeEnd={returnDate}
            />
            <DatePicker
              label={t("dateModal.returnDate")}
              value={returnDate}
              onChange={setReturnDate}
              min={addDays(pickup, MIN_DAYS)}
              rangeStart={pickup}
              rangeEnd={returnDate}
            />

            <p className="text-[12px] text-[#86868b] text-center pt-1">
              {t("dateModal.minRental")}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 pt-0">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full h-12 rounded-xl bg-[#4ba6ea] text-white text-[14px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2d8fd4] active:scale-[0.98] transition-all duration-150"
            >
              {t("dateModal.continue")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
