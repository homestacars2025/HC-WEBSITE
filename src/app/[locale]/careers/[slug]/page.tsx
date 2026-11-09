import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Briefcase } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ApplicationForm from "@/components/careers/ApplicationForm";
import { fetchOpening } from "@/lib/careers";

type Props = { params: Promise<{ locale: string; slug: string }> };

// Roles are shared by direct link only and kept out of search results.
const NO_INDEX: Metadata["robots"] = { index: false, follow: false };

// One line for link previews: WhatsApp shows roughly the first 160 characters.
function summarize(text: string | null): string {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  return flat.length > 160 ? `${flat.slice(0, 157).trimEnd()}…` : flat;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const [t, tm, opening] = await Promise.all([
    getTranslations({ locale, namespace: "careers" }),
    getTranslations({ locale, namespace: "metadata" }),
    fetchOpening(slug),
  ]);
  if (!opening) return { title: t("closedTitle"), robots: NO_INDEX };

  const description = summarize(opening.description) || t("roleMetaFallback");
  const url = `/${locale}/careers/${slug}`;
  return {
    title: opening.title,
    description,
    robots: NO_INDEX,
    // Repeats the layout's image: a page-level openGraph replaces it entirely.
    openGraph: {
      title: `${opening.title} | ${tm("siteName")}`,
      description,
      url,
      siteName: tm("siteName"),
      locale,
      type: "website",
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: tm("siteName") }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${opening.title} | ${tm("siteName")}`,
      description,
    },
  };
}

export default async function CareerRolePage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "careers" });
  const opening = await fetchOpening(slug);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafafa] pt-16">
        <div className="mx-auto max-w-[720px] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
          {opening ? (
            <div className="space-y-8">
              <header className="px-1">
                {opening.department && (
                  <span dir="auto" className="inline-block rounded-full bg-brand/10 px-3 py-1 text-[12px] font-medium text-[#1d3f6e]">
                    {opening.department}
                  </span>
                )}
                <h1 dir="auto" className="mt-3 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0a0a0a] sm:text-[40px]">
                  {opening.title}
                </h1>
              </header>

              {opening.description && (
                <section className="rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7">
                  <h2 className="mb-3 text-[18px] font-semibold text-[#0a0a0a]">{t("aboutRole")}</h2>
                  <p dir="auto" className="whitespace-pre-line text-[15px] leading-7 text-[#3a3a3c]">
                    {opening.description}
                  </p>
                </section>
              )}

              <ApplicationForm slug={opening.public_slug} fields={Array.isArray(opening.form_schema) ? opening.form_schema : []} />
            </div>
          ) : (
            <div className="rounded-2xl border border-[#ebebeb] bg-white px-6 py-14 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#f2f2f2] text-[#6e6e73]">
                <Briefcase className="h-6 w-6" aria-hidden />
              </div>
              <h1 className="text-[22px] font-semibold text-[#0a0a0a]">{t("closedTitle")}</h1>
              <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[#6e6e73]">{t("closedText")}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
