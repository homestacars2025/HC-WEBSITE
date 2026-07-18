import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; code?: string; message?: string }>;
};

export default async function PaymentFailPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { order = "", code = "", message = "" } = await searchParams;
  const t = await getTranslations({ locale, namespace: "payment" });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-[#f5f5f7] flex items-center justify-center px-6">
        <div className="max-w-[440px] w-full bg-white rounded-2xl shadow-sm p-10 text-center my-14">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h1 className="text-[26px] font-bold text-[#0a0a0a] mb-3">{t("failTitle")}</h1>
          <p className="text-[15px] text-[#6e6e73] mb-6">
            {message || t("failMessage")}
          </p>

          {(order || code) && (
            <dl className="text-[14px] text-[#1d1d1f] space-y-2 mb-8 text-start bg-[#f5f5f7] rounded-xl p-4">
              {order && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#86868b]">{t("orderNo")}</dt>
                  <dd className="font-medium" dir="ltr">{order}</dd>
                </div>
              )}
              {code && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#86868b]">{t("errorCode")}</dt>
                  <dd className="font-medium" dir="ltr">{code}</dd>
                </div>
              )}
            </dl>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href="/payment/checkout"
              className="inline-flex items-center justify-center w-full h-[52px] rounded-xl bg-[#4ba6ea] text-white text-[15px] font-semibold hover:bg-[#3a95d9] transition-colors"
            >
              {t("tryAgain")}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full h-[52px] rounded-xl border border-[#e5e5e5] text-[#1d1d1f] text-[15px] font-semibold hover:bg-[#f5f5f7] transition-colors"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
