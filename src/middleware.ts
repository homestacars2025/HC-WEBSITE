import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const LOCALES = ["en", "ar", "tr"] as const;
type SupportedLocale = (typeof LOCALES)[number];

const LOCALE_COOKIE = "hc-locale";

function parseAcceptLanguage(header: string | null): SupportedLocale {
  if (!header) return "en";
  const lang = header.split(",")[0].split(";")[0].trim().toLowerCase();
  if (lang.startsWith("ar")) return "ar";
  if (lang.startsWith("tr")) return "tr";
  return "en";
}

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find if URL already has a supported locale prefix
  const urlLocale = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (urlLocale) {
    // URL is already locale-prefixed: run next-intl normally and persist preference
    const response = intlMiddleware(request);
    const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
    if (savedLocale !== urlLocale) {
      response.cookies.set(LOCALE_COOKIE, urlLocale, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
    }
    return response;
  }

  // Root or un-prefixed path: determine target locale and redirect
  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value as
    | SupportedLocale
    | undefined;

  // Careers links are shared on WhatsApp with mostly Arabic-speaking
  // applicants, so they open in Arabic unless a language was already chosen.
  const isCareers = pathname === "/careers" || pathname.startsWith("/careers/");

  const targetLocale: SupportedLocale =
    savedLocale && (LOCALES as readonly string[]).includes(savedLocale)
      ? savedLocale
      : isCareers
        ? "ar"
        : parseAcceptLanguage(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;

  const redirect = NextResponse.redirect(url);

  // Set cookie only on first visit (no existing preference)
  if (!savedLocale) {
    redirect.cookies.set(LOCALE_COOKIE, targetLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return redirect;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
