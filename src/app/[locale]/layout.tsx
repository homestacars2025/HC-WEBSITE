import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CurrencyProvider } from "@/lib/context/currency-context";
import "../globals.css";

// Same files as geist/font/sans and geist/font/mono, loaded directly: those
// wrappers put Arial / Courier New fallbacks inside their CSS variables, and
// those fonts catch Arabic glyphs before --font-plex-arabic can.
const geistSans = localFont({
  src: "../../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  adjustFontFallback: false,
});

const geistMono = localFont({
  src: "../../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  adjustFontFallback: false,
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: {
      template: `%s | ${t("siteName")}`,
      default: t("defaultTitle"),
    },
    description: t("description"),
    keywords: t("keywords"),
    metadataBase: new URL("https://homestacars.com"),
    openGraph: {
      siteName: t("siteName"),
      locale,
      // Referenced explicitly because the opengraph-image.png file lives at the
      // app root (it can't sit in this dynamic [locale] segment — Turbopack
      // fails to resolve metadata images nested under a dynamic route). Defining
      // openGraph here would otherwise drop the inherited root-level og:image.
      images: [
        { url: "/opengraph-image.png", width: 1200, height: 630, alt: t("siteName") },
      ],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// This is the top-level layout for every page and the single place that renders
// <html> and <body>. The locale comes from the route param (reliable for
// lang/dir), so Arabic correctly gets dir="rtl" and IBM Plex Sans Arabic.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "metadata" });
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Organization structured data — references the official brand logo.
  const SITE_URL = "https://homestacars.com";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t("siteName"),
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description: t("description"),
  };

  return (
    <html
      lang={locale}
      dir={dir}
      className={`h-full antialiased ${geistSans.variable} ${geistMono.variable} ${plexArabic.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider>{children}</CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
