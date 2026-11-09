// Public careers intake: a Supabase Edge Function that needs no key.
// Its CORS allows only homestacars.com and www.homestacars.com, so the browser
// POST works in production only; the role GET below runs on the server.

export const CAREERS_API =
  "https://edsyoxqsnsxfftnbsjgq.supabase.co/functions/v1/submit-application";

// How long a fetched role page is reused before refetching.
const REVALIDATE_SECONDS = 60;

export type CareersLang = "ar" | "en" | "tr";
export type Localized = string | Partial<Record<CareersLang, string>>;

export type FieldType =
  | "short_text" | "long_text" | "number" | "date" | "phone"
  | "yes_no" | "single_choice" | "multiple_choice" | "file";

export type FieldOption = string | { value: string; label?: Localized };

export interface FormField {
  key: string;
  type: FieldType;
  required?: boolean;
  label?: Localized;
  options?: FieldOption[];
}

export interface Opening {
  title: string;
  department: string | null;
  description: string | null;
  public_slug: string;
  form_schema: FormField[] | null;
}

// File slots the function accepts, with the MIME types each one allows.
export const FILE_SLOTS = {
  cv: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  license: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  id_document: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
} as const;
export type FileSlot = keyof typeof FILE_SLOTS;
export const isFileSlot = (key: string): key is FileSlot => key in FILE_SLOTS;

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export const SOURCES = ["website", "referral", "linkedin", "instagram", "walk_in", "agency", "whatsapp", "other"] as const;

/** The visitor's language, then English, then the first value present. */
export function pickText(value: Localized | undefined, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang as CareersLang] || value.en || Object.values(value).find(Boolean) || "";
}

export const optionValue = (o: FieldOption) => (typeof o === "string" ? o : String(o.value));
export const optionLabel = (o: FieldOption, lang: string) =>
  typeof o === "string" ? o : pickText(o.label, lang) || String(o.value);

/** One published role, or null when it is closed, unknown or unreachable. */
export async function fetchOpening(slug: string): Promise<Opening | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  try {
    const res = await fetch(`${CAREERS_API}/opening/${slug}`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const body = await res.json();
    return body.opening ?? null;
  } catch {
    return null;
  }
}
