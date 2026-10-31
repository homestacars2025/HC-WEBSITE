"use client";

import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, MessageCircle, Home, CreditCard } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { WHATSAPP_URL } from "@/lib/whatsapp";
import { ONLINE_PAYMENT_ENABLED } from "@/lib/feature-flags";

interface Props {
  bookingNumber: string;
  carName: string;
}

export default function SuccessPage({ bookingNumber, carName }: Props) {
  const t     = useTranslations("success");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  const displayRef = bookingNumber || "HC-??????";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <main className="min-h-screen bg-[#f9f9f9] pt-16 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-[560px]">

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-md border border-[#f0f0f0] px-8 py-10 text-center">

            {/* Check icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-11 h-11 text-green-500" strokeWidth={1.5} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-[26px] font-bold tracking-tight text-[#0a0a0a] mb-3 leading-snug">
              {t("title")}
            </h1>

            {/* Car name */}
            {carName && (
              <p className="text-[15px] text-[#86868b] mb-4">{carName}</p>
            )}

            {/* Registered line */}
            <p className="text-[15px] text-[#1d1d1f] mb-6">{t("registered")}</p>

            {/* Booking reference */}
            <div className="bg-[#f5f9ff] border border-[#dbeafe] rounded-2xl px-6 py-5 mb-6">
              <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-widest mb-2">
                {t("bookingRef")}
              </p>
              <p className="text-[32px] font-bold text-[#4ba6ea] tracking-[0.12em] font-mono tabular-nums">
                {displayRef}
              </p>
            </div>

            {/* WhatsApp message */}
            <p className="text-[14px] text-[#6e6e73] leading-relaxed mb-8 max-w-[420px] mx-auto">
              {t("message")}
            </p>

            {/* Pay online — amount is fixed by the booking, computed server-side.
                HIDDEN while ONLINE_PAYMENT_ENABLED is false: the team sends a
                payment link after reviewing availability. The payment flow
                itself is untouched and still works — see feature-flags.ts. */}
            {ONLINE_PAYMENT_ENABLED && bookingNumber && (
              <Link
                href={`/payment/checkout?booking=${encodeURIComponent(bookingNumber)}`}
                className="flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-2xl bg-[#4ba6ea] text-white text-[15px] font-semibold hover:bg-[#3a95d9] active:scale-[0.98] transition-all duration-150 mb-3"
              >
                <CreditCard className="w-5 h-5" />
                {t("payNow")}
              </Link>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-2xl bg-[#25d366] text-white text-[15px] font-semibold hover:bg-[#1fb855] active:scale-[0.98] transition-all duration-150"
              >
                <MessageCircle className="w-5 h-5" />
                {t("whatsapp")}
              </a>
              <Link
                href="/"
                className="flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-2xl bg-white border border-[#e5e5e5] text-[#0a0a0a] text-[15px] font-semibold hover:border-[#4ba6ea] hover:text-[#4ba6ea] active:scale-[0.98] transition-all duration-150"
              >
                <Home className="w-5 h-5" />
                {t("backHome")}
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
