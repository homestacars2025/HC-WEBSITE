import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Briefcase, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import CareersLanguageSwitch from "@/components/careers/CareersLanguageSwitch";
import { fetchOpenings } from "@/lib/careers";
import { WHATSAPP_URL } from "@/lib/whatsapp";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, tm] = await Promise.all([
    getTranslations({ locale, namespace: "careers" }),
    getTranslations({ locale, namespace: "metadata" }),
  ]);
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/careers`,
      languages: { ar: "/ar/careers", en: "/en/careers", tr: "/tr/careers" },
    },
    // Repeats the layout's image: a page-level openGraph replaces it entirely.
    openGraph: {
      title: `${t("metaTitle")} | ${tm("siteName")}`,
      description: t("metaDescription"),
      url: `/${locale}/careers`,
      siteName: tm("siteName"),
      locale,
      type: "website",
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: tm("siteName") }],
    },
  };
}

export default async function CareersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careers" });
  const openings = await fetchOpenings();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16">
        <section className="border-b border-[#ebebeb]">
          <div className="mx-auto max-w-[1120px] px-5 py-10 sm:px-6 sm:py-14">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-strong">
                {t("eyebrow")}
              </p>
              <CareersLanguageSwitch />
            </div>
            <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#0a0a0a] sm:text-[48px]">
              {t("heading")}
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[#6e6e73] sm:text-[18px]">
              {t("subheading")}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-5 py-10 sm:px-6 sm:py-14">
          {openings.length === 0 ? (
            <div className="mx-auto max-w-md rounded-3xl border border-dashed border-[#dddddd] px-6 py-14 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand-strong">
                <Briefcase className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="text-[20px] font-semibold text-[#0a0a0a]">{t("emptyTitle")}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6e6e73]">{t("emptyText")}</p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-700 px-6 text-[15px] font-semibold text-white hover:bg-green-800"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                {t("whatsappCta")}
              </a>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-[20px] font-semibold text-[#0a0a0a]">{t("openRoles")}</h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {openings.map((o) => (
                  <li key={o.public_slug}>
                    <Link
                      href={`/careers/${o.public_slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-[#ebebeb] bg-white p-5 transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/40 sm:p-6"
                    >
                      {o.department && (
                        <span dir="auto" className="self-start rounded-full bg-[#f2f2f2] px-3 py-1 text-[12px] font-medium text-[#3a3a3c]">
                          {o.department}
                        </span>
                      )}
                      <h3 dir="auto" className="mt-4 text-[19px] font-semibold leading-snug text-[#0a0a0a]">
                        {o.title}
                      </h3>
                      {o.description && (
                        <p dir="auto" className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-[#6e6e73]">
                          {o.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                        <span className="text-[13px] text-[#6e6e73]">
                          {o.positions_count ? t("positions", { count: o.positions_count }) : null}
                        </span>
                        <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-strong px-5 text-[14px] font-semibold text-white transition-colors group-hover:bg-brand-strong-hover">
                          {t("apply")}
                          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
