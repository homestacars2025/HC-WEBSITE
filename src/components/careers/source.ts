import { SOURCES } from "@/lib/careers";

const KEY = "hc-careers-src";
const isSource = (v: string | null): v is string =>
  !!v && (SOURCES as readonly string[]).includes(v);

/**
 * Where the applicant came from: `?src=` on the current URL, else the value
 * remembered earlier this session (so it survives a language switch, which
 * drops the query string), else "website".
 */
export function readSource(): string {
  if (typeof window === "undefined") return "website";
  const fromUrl = new URLSearchParams(window.location.search).get("src");
  try {
    if (isSource(fromUrl)) {
      sessionStorage.setItem(KEY, fromUrl);
      return fromUrl;
    }
    const saved = sessionStorage.getItem(KEY);
    if (isSource(saved)) return saved;
  } catch {
    // Storage blocked (private mode): fall through to the URL value or default.
  }
  return isSource(fromUrl) ? fromUrl : "website";
}
