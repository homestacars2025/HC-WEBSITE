import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; ref?: string; bankOrderId?: string }>;
};

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { order = "", ref = "" } = await searchParams;
  const t = await getTranslations({ locale, namespace: "payment" });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-[#f5f5f7] flex items-center justify-center px-6">
        <div className="max-w-[440px] w-full bg-white rounded-2xl shadow-sm p-10 text-center my-14">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-[26px] font-bold text-[#0a0a0a] mb-3">{t("successTitle")}</h1>
          <p className="text-[15px] text-[#6e6e73] mb-6">{t("successMessage")}</p>

          {(order || ref) && (
            <dl className="text-[14px] text-[#1d1d1f] space-y-2 mb-8 text-start bg-[#f5f5f7] rounded-xl p-4">
              {order && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#86868b]">{t("orderNo")}</dt>
                  <dd className="font-medium" dir="ltr">{order}</dd>
                </div>
              )}
              {ref && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#86868b]">{t("refNo")}</dt>
                  <dd className="font-medium" dir="ltr">{ref}</dd>
                </div>
              )}
            </dl>
          )}

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full h-[52px] rounded-xl bg-[#4ba6ea] text-white text-[15px] font-semibold hover:bg-[#3a95d9] transition-colors"
          >
            {t("backHome")}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
