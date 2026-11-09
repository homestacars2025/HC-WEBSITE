"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, Check, FileText, Loader2, MessageCircle, Upload, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import NationalitySelect from "@/components/shared/NationalitySelect";
import { COUNTRY_CODES } from "@/lib/country-codes";
import { WHATSAPP_URL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import {
  CAREERS_API, FILE_SLOTS, MAX_FILE_BYTES, isFileSlot, optionLabel, optionValue, pickText,
  type FieldType, type FileSlot, type FormField,
} from "@/lib/careers";
import { readSource } from "./source";

type Answer = string | string[];
type Errors = Record<string, string>;
type T = ReturnType<typeof useTranslations<"careers">>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIXED_KEYS = ["full_name", "phone", "age", "nationality", "residence_city", "residence_district", "email"];

// Some Android pickers report an empty type; fall back to the extension.
const EXT_MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
};
const mimeOf = (file: File) =>
  file.type || EXT_MIME[file.name.split(".").pop()?.toLowerCase() ?? ""] || "";

const ACCEPT: Record<FileSlot, string> = {
  cv: ".pdf,.doc,.docx," + FILE_SLOTS.cv.join(","),
  license: ".jpg,.jpeg,.png,.webp,.pdf," + FILE_SLOTS.license.join(","),
  id_document: ".jpg,.jpeg,.png,.webp,.pdf," + FILE_SLOTS.id_document.join(","),
};

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      resolve(url.slice(url.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// short_text and anything unrecognised fall back to a plain text input.
const INPUT_PROPS: Partial<Record<FieldType, React.InputHTMLAttributes<HTMLInputElement>>> = {
  number: { type: "text", inputMode: "decimal", dir: "ltr" },
  date:   { type: "date", dir: "ltr" },
  phone:  { type: "tel", inputMode: "tel", dir: "ltr", autoComplete: "tel" },
};

const isEmpty = (v: Answer | undefined) => v === undefined || v === "" || (Array.isArray(v) && v.length === 0);

// ─── Primitives ───────────────────────────────────────────────────────────────

// 16px text stops iOS Safari from zooming into the field on focus.
const inputCls = (error?: boolean) => cn(
  "w-full h-[52px] rounded-xl border bg-white px-4 text-[16px] text-[#0a0a0a]",
  "transition-colors placeholder:text-[#b0b0b0] focus:outline-none focus:ring-[3px]",
  error
    ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
    : "border-[#dddddd] focus:border-brand focus:ring-brand/20",
);

function Field({
  id, label, required, optional, error, hint, group, children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: string;
  error?: string;
  hint?: string;
  group?: boolean;
  children: React.ReactNode;
}) {
  const caption = (
    <>
      <span dir="auto">{label}</span>
      {required && <span className="text-red-500" aria-hidden>*</span>}
      {optional && <span className="font-normal text-[#6e6e73]">({optional})</span>}
    </>
  );
  const after = (
    <>
      {hint && !error && <p className="mt-1.5 text-[12px] text-[#6e6e73]">{hint}</p>}
      {error && (
        <p id={`err-${id}`} className="mt-1.5 flex items-start gap-1.5 text-[13px] text-red-600">
          <AlertCircle className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </>
  );
  const labelCls = "mb-2 flex items-center gap-1 text-[14px] font-medium text-[#222222]";

  return group ? (
    <fieldset id={`field-${id}`} className="scroll-mt-24 min-w-0" aria-describedby={error ? `err-${id}` : undefined}>
      <legend className={labelCls}>{caption}</legend>
      {children}
      {after}
    </fieldset>
  ) : (
    <div id={`field-${id}`} className="scroll-mt-24 min-w-0">
      <label htmlFor={`in-${id}`} className={labelCls}>{caption}</label>
      {children}
      {after}
    </div>
  );
}

const describe = (id: string, error?: string) =>
  error ? { "aria-invalid": true as const, "aria-describedby": `err-${id}` } : {};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7">
      <h2 className="mb-5 text-[18px] font-semibold text-[#0a0a0a]">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

// ─── File picker ──────────────────────────────────────────────────────────────

function FilePicker({
  slot, file, error, t, onPick, onClear,
}: {
  slot: FileSlot;
  file?: File;
  error?: string;
  t: T;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(
    () => (file && mimeOf(file).startsWith("image/") ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <>
      <input
        ref={inputRef}
        id={`in-${slot}`}
        type="file"
        accept={ACCEPT[slot]}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const picked = e.target.files?.[0];
          e.target.value = ""; // let the same file be picked again after removing it
          if (picked) onPick(picked);
        }}
      />
      {file ? (
        <div className={cn(
          "flex items-center gap-3 rounded-xl border bg-white p-3",
          error ? "border-red-400" : "border-[#dddddd]",
        )}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={preview} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-strong">
              <FileText className="h-6 w-6" aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p dir="auto" className="truncate text-[14px] font-medium text-[#0a0a0a]">{file.name}</p>
            <p dir="ltr" className="text-[12px] text-[#6e6e73] text-start">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-9 shrink-0 rounded-lg px-3 text-[13px] font-semibold text-[#222222] underline underline-offset-2 hover:bg-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {t("fileChange")}
          </button>
          <button
            type="button"
            onClick={onClear}
            aria-label={t("fileRemove")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#6e6e73] hover:bg-[#f5f5f5] hover:text-[#0a0a0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          {...describe(slot, error)}
          className={cn(
            "flex min-h-[112px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors",
            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/30",
            error ? "border-red-300 bg-red-50/40" : "border-[#dddddd] hover:border-brand hover:bg-brand/5",
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand-strong">
            <Upload className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-[15px] font-semibold text-[#0a0a0a]">{t("filePick")}</span>
          <span className="text-[12px] text-[#6e6e73]">
            {slot === "cv" ? t("fileHintDoc") : t("fileHintImage")}
          </span>
        </button>
      )}
    </>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export default function ApplicationForm({ slug, fields }: { slug: string; fields: FormField[] }) {
  const t = useTranslations("careers");
  const lang = useLocale();

  const [fullName,    setFullName]    = useState("");
  const [countryCode, setCountryCode] = useState("+90");
  const [phone,       setPhone]       = useState("");
  const [age,         setAge]         = useState("");
  const [nationality, setNationality] = useState("");
  const [city,        setCity]        = useState("Istanbul");
  const [district,    setDistrict]    = useState("");
  const [email,       setEmail]       = useState("");
  const [answers,     setAnswers]     = useState<Record<string, Answer>>({});
  const [files,       setFiles]       = useState<Partial<Record<FileSlot, File>>>({});
  const [honeypot,    setHoneypot]    = useState("");
  const [errors,      setErrors]      = useState<Errors>({});
  const [formError,   setFormError]   = useState("");
  const [sending,     setSending]     = useState(false);
  const [success,     setSuccess]     = useState<string | null>(null);
  const sendingRef = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  // Unknown types and file keys the function can't store are dropped.
  const schema = useMemo(
    () => fields.filter((f) => f && typeof f.key === "string" && (f.type !== "file" || isFileSlot(f.key))),
    [fields],
  );

  useEffect(() => {
    if (success) successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [success]);

  // The "check the highlighted fields" banner goes once nothing is highlighted.
  const banner = formError === t("errFixFields") && Object.keys(errors).length === 0 ? "" : formError;

  const nationalDigits = phone.replace(/\D/g, "").replace(/^0+/, "");

  function clearError(key: string) {
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function setAnswer(key: string, value: Answer) {
    setAnswers((a) => ({ ...a, [key]: value }));
    clearError(key);
  }

  function pickFile(slot: FileSlot, file: File) {
    const mime = mimeOf(file);
    if (!(FILE_SLOTS[slot] as readonly string[]).includes(mime)) {
      setErrors((e) => ({ ...e, [slot]: t("errFileType") }));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrors((e) => ({ ...e, [slot]: t("errFileSize") }));
      return;
    }
    setFiles((f) => ({ ...f, [slot]: file }));
    clearError(slot);
  }

  function validate(): Errors {
    const e: Errors = {};
    if (fullName.trim().length < 2) e.full_name = t("errRequired");
    if (!nationalDigits) e.phone = t("errRequired");
    else if (nationalDigits.length < 7 || nationalDigits.length > 14) e.phone = t("errPhone");
    if (!age.trim()) e.age = t("errRequired");
    else {
      const n = Number(age);
      if (!Number.isInteger(n) || n < 15 || n > 80) e.age = t("errAge");
    }
    if (!nationality) e.nationality = t("errRequired");
    if (!city.trim()) e.residence_city = t("errRequired");
    if (email.trim() && !EMAIL_RE.test(email.trim())) e.email = t("errEmail");

    for (const f of schema) {
      if (f.type === "file") {
        if (f.required && !files[f.key as FileSlot]) e[f.key] = t("errRequired");
        continue;
      }
      const v = answers[f.key];
      if (isEmpty(v)) {
        if (f.required) e[f.key] = t("errRequired");
      } else if (f.type === "number" && Number.isNaN(Number(v))) {
        e[f.key] = t("errNumber");
      }
    }
    // Keep pick-time file errors (wrong type / too large) visible.
    for (const slot of Object.keys(FILE_SLOTS)) if (errors[slot] && !e[slot]) e[slot] = errors[slot];
    return e;
  }

  function showErrors(found: Errors) {
    setErrors(found);
    setFormError(t("errFixFields"));
    const order = [...FIXED_KEYS, ...schema.map((f) => f.key)];
    const first = order.find((k) => found[k]) ?? Object.keys(found)[0];
    requestAnimationFrame(() => {
      const el = document.getElementById(`field-${first}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("input:not([tabindex='-1']), textarea, select, button")?.focus({ preventScroll: true });
    });
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (sendingRef.current) return;
    setFormError("");

    const found = validate();
    if (Object.keys(found).length) {
      showErrors(found);
      return;
    }

    sendingRef.current = true;
    setSending(true);
    try {
      const filePayload: Record<string, { mime: string; data: string }> = {};
      for (const [slot, file] of Object.entries(files)) {
        if (file) filePayload[slot] = { mime: mimeOf(file), data: await toBase64(file) };
      }
      const cleanAnswers = Object.fromEntries(Object.entries(answers).filter(([, v]) => !isEmpty(v)));

      const res = await fetch(CAREERS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opening_slug: slug,
          full_name: fullName.trim(),
          phone: `${countryCode}${nationalDigits}`,
          age: Number(age),
          email: email.trim() || undefined,
          nationality,
          residence_city: city.trim(),
          residence_district: district.trim() || undefined,
          answers: cleanAnswers,
          files: filePayload,
          language: lang,
          source: readSource(),
          website: honeypot,
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok && body.ok) {
        setSuccess(typeof body.message === "string" && body.message ? body.message : t("successFallback"));
        return;
      }
      if (res.status === 404) setFormError(body.error || t("closedTitle"));
      else if (res.status === 429) setFormError(body.error || t("errRate"));
      else if (res.status === 400) {
        // File errors arrive as "cv: file exceeds 5 MB" with no `field`.
        const field: string | undefined =
          body.field ?? String(body.error ?? "").match(/^(cv|license|id_document):/)?.[1];
        if (field) showErrors({ [field]: t("errCheckField") });
        else setFormError(t("errCheckAnswers"));
      } else setFormError(t("errGeneric"));
    } catch {
      setFormError(t("errGeneric"));
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  if (success) {
    return (
      <div
        ref={successRef}
        role="status"
        className="rounded-2xl border border-[#ebebeb] bg-white px-6 py-10 text-center sm:px-10"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
        </div>
        <h2 className="text-[22px] font-semibold text-[#0a0a0a]">{t("successTitle")}</h2>
        <p dir="auto" className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-[#3a3a3c]">{success}</p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-700 px-6 text-[15px] font-semibold text-white hover:bg-green-800 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-green-700/30"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            {t("whatsappCta")}
          </a>
          <Link
            href="/careers"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#dddddd] px-6 text-[15px] font-semibold text-[#0a0a0a] hover:bg-[#f7f7f7]"
          >
            {t("allRoles")}
          </Link>
        </div>
      </div>
    );
  }

  const fileLabel: Record<FileSlot, string> = {
    cv: t("fileLabelCv"), license: t("fileLabelLicense"), id_document: t("fileLabelId"),
  };

  function renderField(f: FormField) {
    const label = pickText(f.label, lang) || (isFileSlot(f.key) ? fileLabel[f.key] : f.key);
    const error = errors[f.key];
    const value = answers[f.key];
    const common = { id: f.key, label, required: f.required, error };

    switch (f.type) {
      case "file": {
        const slot = f.key as FileSlot;
        return (
          <Field key={f.key} {...common}>
            <FilePicker
              slot={slot}
              file={files[slot]}
              error={error}
              t={t}
              onPick={(file) => pickFile(slot, file)}
              onClear={() => { setFiles((x) => ({ ...x, [slot]: undefined })); clearError(slot); }}
            />
          </Field>
        );
      }
      case "long_text":
        return (
          <Field key={f.key} {...common}>
            <textarea
              id={`in-${f.key}`}
              rows={4}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => setAnswer(f.key, e.target.value)}
              {...describe(f.key, error)}
              className={cn(inputCls(!!error), "h-auto min-h-[120px] py-3 leading-relaxed")}
            />
          </Field>
        );
      case "yes_no":
        return (
          <Field key={f.key} {...common} group>
            <div className="grid grid-cols-2 gap-3">
              {(["yes", "no"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={value === v}
                  onClick={() => setAnswer(f.key, v)}
                  className={cn(
                    "h-[52px] rounded-xl border text-[15px] font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/30",
                    value === v
                      ? "border-brand bg-brand/10 text-[#0a0a0a] ring-1 ring-brand"
                      : error ? "border-red-400 text-[#222222]" : "border-[#dddddd] text-[#222222] hover:border-[#b0b0b0]",
                  )}
                >
                  {t(v)}
                </button>
              ))}
            </div>
          </Field>
        );
      case "single_choice":
        return (
          <Field key={f.key} {...common} group>
            <div className="grid gap-2.5">
              {(f.options ?? []).map((o) => {
                const v = optionValue(o);
                const checked = value === v;
                return (
                  <label
                    key={v}
                    className={cn(
                      "flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                      "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-brand/30",
                      checked ? "border-brand bg-brand/10 ring-1 ring-brand"
                        : error ? "border-red-400" : "border-[#dddddd] hover:border-[#b0b0b0]",
                    )}
                  >
                    <input
                      type="radio"
                      name={f.key}
                      value={v}
                      checked={checked}
                      onChange={() => setAnswer(f.key, v)}
                      className="h-4 w-4 shrink-0 accent-brand-strong"
                    />
                    <span dir="auto" className="text-[15px] text-[#0a0a0a]">{optionLabel(o, lang)}</span>
                  </label>
                );
              })}
            </div>
          </Field>
        );
      case "multiple_choice": {
        const selected = Array.isArray(value) ? value : [];
        return (
          <Field key={f.key} {...common} group>
            <div className="flex flex-wrap gap-2">
              {(f.options ?? []).map((o) => {
                const v = optionValue(o);
                const checked = selected.includes(v);
                return (
                  <label
                    key={v}
                    className={cn(
                      "inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] transition-colors",
                      "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-brand/30",
                      checked ? "border-brand bg-brand/10 font-medium text-[#0a0a0a] ring-1 ring-brand"
                        : error ? "border-red-400 text-[#222222]" : "border-[#dddddd] text-[#222222] hover:border-[#b0b0b0]",
                    )}
                  >
                    <input
                      type="checkbox"
                      value={v}
                      checked={checked}
                      onChange={() => setAnswer(f.key, checked ? selected.filter((x) => x !== v) : [...selected, v])}
                      className="sr-only"
                    />
                    {checked && <Check className="h-3.5 w-3.5 text-brand-strong" strokeWidth={3} aria-hidden />}
                    <span dir="auto">{optionLabel(o, lang)}</span>
                  </label>
                );
              })}
            </div>
          </Field>
        );
      }
      default: {
        const input = INPUT_PROPS[f.type] ?? { type: "text" };
        return (
          <Field key={f.key} {...common}>
            <input
              id={`in-${f.key}`}
              {...input}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => setAnswer(f.key, e.target.value)}
              {...describe(f.key, error)}
              className={cn(inputCls(!!error), input.dir === "ltr" && "text-start")}
            />
          </Field>
        );
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="px-1">
        <h2 className="text-[22px] font-semibold text-[#0a0a0a]">{t("applyTitle")}</h2>
        <p className="mt-1 text-[14px] text-[#6e6e73]">{t("applySubtitle")}</p>
      </div>

      <Card title={t("sectionPersonal")}>
        <Field id="full_name" label={t("fullName")} required error={errors.full_name}>
          <input
            id="in-full_name"
            type="text"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); clearError("full_name"); }}
            autoComplete="name"
            {...describe("full_name", errors.full_name)}
            className={inputCls(!!errors.full_name)}
          />
        </Field>

        <Field id="phone" label={t("phone")} required error={errors.phone}>
          <div className="flex gap-2" dir="ltr">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              aria-label={t("countryCode")}
              className="h-[52px] w-[112px] shrink-0 rounded-xl border border-[#dddddd] bg-white px-3 text-[16px] text-[#0a0a0a] focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/20"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <input
              id="in-phone"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
              autoComplete="tel-national"
              inputMode="tel"
              placeholder={countryCode === "+90" ? "5XX XXX XX XX" : undefined}
              {...describe("phone", errors.phone)}
              className={cn(inputCls(!!errors.phone), "flex-1 min-w-0")}
            />
          </div>
        </Field>

        <div className="grid grid-cols-[100px_1fr] gap-3">
          <Field id="age" label={t("age")} required error={errors.age}>
            <input
              id="in-age"
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={age}
              onChange={(e) => { setAge(e.target.value.replace(/\D/g, "")); clearError("age"); }}
              dir="ltr"
              {...describe("age", errors.age)}
              className={cn(inputCls(!!errors.age), "text-start")}
            />
          </Field>
          <Field id="nationality" label={t("nationality")} required error={errors.nationality} group>
            <NationalitySelect
              value={nationality}
              onChange={(v) => { setNationality(v); clearError("nationality"); }}
              error={!!errors.nationality}
              placeholder={t("nationalityPlaceholder")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field id="residence_city" label={t("city")} required error={errors.residence_city}>
            <input
              id="in-residence_city"
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); clearError("residence_city"); }}
              autoComplete="address-level2"
              {...describe("residence_city", errors.residence_city)}
              className={inputCls(!!errors.residence_city)}
            />
          </Field>
          <Field id="residence_district" label={t("district")} optional={t("optional")}>
            <input
              id="in-residence_district"
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              autoComplete="address-level3"
              className={inputCls()}
            />
          </Field>
        </div>

        <Field id="email" label={t("email")} optional={t("optional")} error={errors.email}>
          <input
            id="in-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            {...describe("email", errors.email)}
            className={cn(inputCls(!!errors.email), "text-start")}
          />
        </Field>
      </Card>

      {schema.length > 0 && (
        <Card title={t("sectionQuestions")}>
          {schema.map(renderField)}
        </Card>
      )}

      {/* Honeypot: hidden from people, filled only by bots. */}
      <div aria-hidden className="sr-only">
        <label htmlFor="hc-website">{t("honeypot")}</label>
        <input
          id="hc-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {banner && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span dir="auto">{banner}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        aria-busy={sending}
        className={cn(
          "flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-strong text-[16px] font-semibold text-white transition-colors",
          "hover:bg-brand-strong-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/40",
          "disabled:cursor-not-allowed disabled:opacity-70",
        )}
      >
        {sending && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
        {sending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
