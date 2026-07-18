"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { id: "partnership", emoji: "💼", key: "subjectPartnership" },
  { id: "inquiry",     emoji: "❓", key: "subjectInquiry"     },
  { id: "complaint",   emoji: "📋", key: "subjectComplaint"   },
  { id: "investment",  emoji: "💰", key: "subjectInvestment"  },
  { id: "other",       emoji: "💬", key: "subjectOther"       },
] as const;

// ─── Legal company info ─────────────────────────────────────────────────────────
// Fixed legal values. Fill in `mersisNo` and `kep` once available — rows with an
// empty value are hidden automatically.
const COMPANY = {
  name:     "HOMESTA GRUP DANIŞMANLIK HİZMETLERİ LİMİTED ŞİRKETİ",
  taxOffice:"BAŞAKŞEHİR",
  taxNo:    "4631515171",
  mersisNo: "",
  address:  "KAYABAŞI MAH. GAZİ YAŞARGİL CAD. T2 BLOK NO: 2 Y BAŞAKŞEHİR / İSTANBUL",
  kep:      "",
  phone:    "+90 542 843 40 91",
  email:    "info@homestacars.com",
} as const;

// ─── Social icons ─────────────────────────────────────────────────────────────

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = (error?: boolean) => cn(
  "w-full rounded-xl border px-4 text-[15px] text-[#0a0a0a] bg-white",
  "focus:outline-none transition-all duration-200 placeholder:text-[#c0c0c0]",
  error
    ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
    : "border-[#e5e5e5] focus:border-[#4ba6ea] focus:shadow-[0_0_0_3px_rgba(75,166,234,0.12)]",
);

function fadeUp(delay = 0) {
  return {
    initial:    { opacity: 0, y: 16 } as const,
    animate:    { opacity: 1, y: 0  } as const,
    transition: { duration: 0.5, ease: EASE as [number, number, number, number], delay },
  };
}

// ─── ContactPage ──────────────────────────────────────────────────────────────

export default function ContactPage() {
  const t      = useTranslations("contact");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  const [subject,     setSubject]     = useState("");
  const [form,        setForm]        = useState({ name: "", email: "", phone: "", message: "" });
  const [errors,      setErrors]      = useState<Record<string, boolean>>({});
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState("");

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  }

  function validate() {
    const next: Record<string, boolean> = {};
    if (!subject)             next.subject = true;
    if (!form.name.trim())    next.name    = true;
    if (!form.email.trim())   next.email   = true;
    if (!form.message.trim()) next.message = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");

    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name:    form.name.trim(),
      email:   form.email.trim(),
      phone:   form.phone.trim() || null,
      message: form.message.trim(),
      subject,
    });

    if (error) {
      setSubmitError(t("error"));
      setSubmitting(false);
      return;
    }

    // mailto notification fallback
    const subjectId = SUBJECTS.find((s) => s.id === subject)?.id ?? subject;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : null,
      `Subject: ${subjectId}`,
      `\nMessage:\n${form.message}`,
    ].filter(Boolean).join("\n");

    const mailto = `mailto:info@homestacars.com?subject=${encodeURIComponent(
      `[Homesta Cars] New message - ${subjectId}`
    )}&body=${encodeURIComponent(body)}`;
    setTimeout(() => window.open(mailto, "_blank"), 150);

    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen pt-16">
      <div className="min-h-[calc(100vh-64px)] lg:grid lg:grid-cols-[40%_60%] flex flex-col">

        {/* ── LEFT: Contact info ─────────────────────────────────────────── */}
        <div className="bg-[#f5f5f7] flex flex-col justify-center px-8 py-14 lg:px-12 lg:py-24">
          <motion.div className="max-w-sm mx-auto lg:mx-0 w-full" {...fadeUp(0)}>

            {/* Logo */}
            <div className="mb-8" dir="ltr">
              <Image
                src="/logo.svg"
                alt="Homesta Cars"
                width={229}
                height={48}
                className="h-12 w-auto"
              />
            </div>

            {/* Title */}
            <h1 className="text-[34px] lg:text-[40px] font-bold tracking-tight text-[#0a0a0a] leading-[1.1] mb-4">
              {t("title")}
            </h1>

            {/* Subtitle */}
            <p className="text-[16px] text-[#6e6e73] leading-relaxed mb-10 max-w-[280px]">
              {t("subtitle")}
            </p>

            {/* Contact details */}
            <div className="space-y-3.5 mb-10">
              <a
                href="mailto:info@homestacars.com"
                className="flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:shadow-md transition-shadow">
                  <Mail className="w-4 h-4 text-[#4ba6ea]" />
                </div>
                <span className="text-[15px] text-[#1d1d1f] group-hover:text-[#4ba6ea] transition-colors" dir="ltr">
                  info@homestacars.com
                </span>
              </a>

              <a
                href="https://wa.me/message/CUGF33QK7NX5C1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:shadow-md transition-shadow">
                  <MessageCircle className="w-4 h-4 text-[#25d366]" />
                </div>
                <span className="text-[15px] text-[#1d1d1f] group-hover:text-[#25d366] transition-colors">
                  {t("whatsapp")}
                </span>
              </a>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#86868b]" />
                </div>
                <span className="text-[15px] text-[#6e6e73]">{t("address")}</span>
              </div>
            </div>

            {/* Social links */}
            <div>
              <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-widest mb-3.5">
                {t("followUs")}
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://instagram.com/homestacars"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#6e6e73] hover:text-[#e1306c] hover:shadow-md transition-all"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com/homestacars"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#6e6e73] hover:text-[#1877f2] hover:shadow-md transition-all"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://tiktok.com/@homestacars"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#6e6e73] hover:text-[#0a0a0a] hover:shadow-md transition-all"
                >
                  <TikTokIcon className="w-[15px] h-[15px]" />
                </a>
              </div>
            </div>

            {/* Company / legal info */}
            <div className="mt-10 pt-8 border-t border-[#e0e0e2]">
              <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-widest mb-4">
                {t("companyInfoTitle")}
              </p>
              <dl className="space-y-3">
                {[
                  { label: t("labelCompanyName"),    value: COMPANY.name,      ltr: true  },
                  { label: t("labelTaxOffice"),      value: COMPANY.taxOffice, ltr: true  },
                  { label: t("labelTaxNo"),          value: COMPANY.taxNo,     ltr: true  },
                  { label: t("labelMersisNo"),       value: COMPANY.mersisNo,  ltr: true  },
                  { label: t("labelCompanyAddress"), value: COMPANY.address,   ltr: false },
                  { label: t("labelKep"),            value: COMPANY.kep,       ltr: true  },
                  { label: t("labelCompanyPhone"),   value: COMPANY.phone,     ltr: true, href: `tel:${COMPANY.phone.replace(/\s/g, "")}` },
                  { label: t("labelCompanyEmail"),   value: COMPANY.email,     ltr: true, href: `mailto:${COMPANY.email}` },
                ]
                  .filter((row) => row.value)
                  .map((row) => (
                    <div key={row.label} className="flex flex-col gap-0.5">
                      <dt className="text-[11px] font-medium text-[#86868b]">{row.label}</dt>
                      <dd
                        className="text-[13px] text-[#1d1d1f] leading-snug break-words"
                        dir={row.ltr ? "ltr" : undefined}
                      >
                        {row.href ? (
                          <a href={row.href} className="hover:text-[#4ba6ea] transition-colors">
                            {row.value}
                          </a>
                        ) : (
                          row.value
                        )}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>

          </motion.div>
        </div>

        {/* ── RIGHT: Form ────────────────────────────────────────────────── */}
        <div className="bg-white flex flex-col justify-center px-6 py-14 lg:px-16 lg:py-24">
          <div className="max-w-[560px] mx-auto w-full">

            {submitted ? (
              /* ── Success state ── */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: EASE as [number, number, number, number] }}
                className="flex flex-col items-center text-center py-20"
              >
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-[26px] font-bold text-[#0a0a0a] mb-3 leading-snug">
                  {t("success")}
                </h2>
              </motion.div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Subject pills */}
                <motion.div {...fadeUp(0.05)}>
                  <p className={cn(
                    "text-[12px] font-semibold uppercase tracking-widest mb-3",
                    errors.subject ? "text-red-500" : "text-[#86868b]",
                  )}>
                    {t("subjectLabel")} <span className="text-red-500">*</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSubject(s.id);
                          if (errors.subject) setErrors((prev) => ({ ...prev, subject: false }));
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-medium",
                          "border transition-all duration-150 focus:outline-none",
                          subject === s.id
                            ? "bg-[#4ba6ea] border-[#4ba6ea] text-white shadow-sm"
                            : errors.subject
                              ? "bg-white border-red-300 text-[#6e6e73] hover:border-[#4ba6ea] hover:text-[#4ba6ea]"
                              : "bg-white border-[#e5e5e5] text-[#6e6e73] hover:border-[#4ba6ea] hover:text-[#4ba6ea]",
                        )}
                      >
                        <span>{s.emoji}</span>
                        <span>{t(s.key)}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Full Name */}
                <motion.div {...fadeUp(0.1)}>
                  <label className="block text-[13px] font-medium text-[#6e6e73] mb-1.5">
                    {t("name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className={cn(inputCls(errors.name), "h-[52px]")}
                    autoComplete="name"
                  />
                </motion.div>

                {/* Email */}
                <motion.div {...fadeUp(0.15)}>
                  <label className="block text-[13px] font-medium text-[#6e6e73] mb-1.5">
                    {t("email")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={cn(inputCls(errors.email), "h-[52px]")}
                    autoComplete="email"
                    dir="ltr"
                  />
                </motion.div>

                {/* Phone (optional) */}
                <motion.div {...fadeUp(0.2)}>
                  <label className="block text-[13px] font-medium text-[#6e6e73] mb-1.5">
                    {t("phone")}
                    <span className="text-[12px] text-[#b0b0b0] ms-1.5">({t("phoneOptional")})</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className={cn(inputCls(), "h-[52px]")}
                    autoComplete="tel"
                    dir="ltr"
                  />
                </motion.div>

                {/* Message */}
                <motion.div {...fadeUp(0.25)}>
                  <label className="block text-[13px] font-medium text-[#6e6e73] mb-1.5">
                    {t("message")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    rows={5}
                    className={cn(
                      inputCls(errors.message),
                      "resize-none py-3.5 leading-relaxed",
                    )}
                  />
                </motion.div>

                {/* Submit error */}
                {submitError && (
                  <p className="text-[14px] text-red-600">{submitError}</p>
                )}

                {/* Submit button */}
                <motion.div {...fadeUp(0.3)}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      "w-full h-[52px] rounded-xl text-white text-[15px] font-semibold",
                      "bg-[#4ba6ea] hover:bg-[#3a95d9] active:scale-[0.99]",
                      "transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed",
                    )}
                  >
                    {submitting ? t("sending") : t("send")}
                  </button>
                </motion.div>

              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
