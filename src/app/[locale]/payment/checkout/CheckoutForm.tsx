"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border border-[#e5e5e5] px-4 h-[52px] text-[15px] text-[#0a0a0a] bg-white " +
  "focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/12 " +
  "transition-all duration-200 placeholder:text-[#c0c0c0]";

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export default function CheckoutForm({
  bookingNumber,
  amount,
}: {
  bookingNumber: string;
  amount: string;
}) {
  const t = useTranslations("payment");
  const locale = useLocale();
  const isRTL = locale === "ar";

  // SECURITY: the customer never types or edits the amount. It is loaded from
  // the booking (read-only display) and the server re-reads it from the booking
  // via `bookingNumber` in /api/payment/initiate — the amount below is display
  // only and is never sent.
  const bookingValid = Boolean(bookingNumber) && Boolean(amount);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expireMonth, setExpireMonth] = useState("");
  const [expireYear, setExpireYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const errorKey: Record<string, string> = {
    invalid_amount: t("errorAmount"),
    amount_unavailable: t("errorAmount"),
    missing_booking: t("errorGeneric"),
    booking_not_found: t("errorGeneric"),
    already_paid: t("errorGeneric"),
    invalid_card: t("errorCard"),
    invalid_expiry: t("errorExpiry"),
    invalid_cvv: t("errorCvv"),
    invalid_holder: t("errorHolder"),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingValid) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Amount is intentionally NOT sent — the server reads it from the booking.
          bookingNumber,
          cardNumber,
          cardHolderName: cardHolder,
          expireMonth,
          expireYear,
          cvv,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!res.ok || contentType.includes("application/json")) {
        const data = await res.json().catch(() => ({}));
        setError(errorKey[data.error] || t("errorGeneric"));
        setSubmitting(false);
        return;
      }

      // The bank's 3D Secure HTML must be rendered top-level (iframes are
      // blocked). Replace the current document with it — it auto-submits to
      // the bank's OTP page.
      const html = await res.text();
      document.open();
      document.write(html);
      document.close();
    } catch {
      setError(t("errorGeneric"));
      setSubmitting(false);
    }
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen pt-16 bg-[#f5f5f7]">
      <div className="max-w-[480px] mx-auto px-6 py-14">
        <h1 className="text-[30px] font-bold tracking-tight text-[#0a0a0a] mb-2">
          {t("checkoutTitle")}
        </h1>
        <p className="text-[15px] text-[#6e6e73] mb-8">{t("checkoutSubtitle")}</p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
        >
          {/* Amount — read-only. The total is fixed by the booking, never typed
              by the customer. Editing is disabled to prevent price tampering. */}
          <div>
            <label className="block text-[13px] font-medium text-[#6e6e73] mb-1.5">
              {t("amount")} (₺)
            </label>
            <input
              type="text"
              readOnly
              tabIndex={-1}
              aria-readonly="true"
              value={amount ? `₺${amount}` : "—"}
              className={cn(inputCls, "bg-[#f5f5f7] text-[#6e6e73] cursor-not-allowed")}
              dir="ltr"
            />
          </div>

          {/* Card number */}
          <div>
            <label className="block text-[13px] font-medium text-[#6e6e73] mb-1.5">
              {t("cardNumber")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              required
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className={inputCls}
              dir="ltr"
            />
          </div>

          {/* Cardholder */}
          <div>
            <label className="block text-[13px] font-medium text-[#6e6e73] mb-1.5">
              {t("cardHolder")}
            </label>
            <input
              type="text"
              autoComplete="cc-name"
              required
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Expiry + CVV */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[13px] font-medium text-[#6e6e73] mb-1.5">
                {t("expiry")}
              </label>
              <div className="flex gap-2" dir="ltr">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp-month"
                  required
                  placeholder={t("expiryMonth")}
                  maxLength={2}
                  value={expireMonth}
                  onChange={(e) => setExpireMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  className={cn(inputCls, "text-center")}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp-year"
                  required
                  placeholder={t("expiryYear")}
                  maxLength={2}
                  value={expireYear}
                  onChange={(e) => setExpireYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  className={cn(inputCls, "text-center")}
                />
              </div>
            </div>
            <div className="w-[110px]">
              <label className="block text-[13px] font-medium text-[#6e6e73] mb-1.5">
                {t("cvv")}
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                required
                placeholder="000"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={cn(inputCls, "text-center")}
                dir="ltr"
              />
            </div>
          </div>

          {!bookingValid && (
            <p className="text-[14px] text-red-600">{t("noBooking")}</p>
          )}
          {error && <p className="text-[14px] text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !bookingValid}
            className={cn(
              "w-full h-[52px] rounded-xl text-white text-[15px] font-semibold",
              "bg-brand-strong hover:bg-brand-strong-hover active:scale-[0.99]",
              "transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed",
            )}
          >
            {submitting
              ? t("processing")
              : `${t("payNow")}${amount ? ` ₺${amount}` : ""}`}
          </button>

          <p className="text-[12px] text-[#86868b] text-center pt-1">
            🔒 {t("secured")}
          </p>
        </form>
      </div>
    </div>
  );
}
