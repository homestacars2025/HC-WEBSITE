import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CurrencyProvider } from "@/lib/context/currency-context";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
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
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// This is the top-level layout for every page and the single place that renders
// <html> and <body>. The locale comes from the route param (reliable for
// lang/dir), so Arabic correctly gets dir="rtl" and the Cairo font.
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
  const isArabic = locale === "ar";

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
      className={`h-full antialiased ${isArabic ? cairo.variable : inter.variable}`}
    >
      <body
        className={`min-h-full flex flex-col bg-background text-foreground${isArabic ? " font-cairo" : ""}`}
        style={isArabic ? { fontFamily: "var(--font-cairo), sans-serif" } : undefined}
      >
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
