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
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isArabic = locale === "ar";

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
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider>{children}</CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
