import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Rendered inside the [locale] layout, so it has <html>/<body> and the correct
// locale/dir. Text is localized inline to avoid depending on message keys.
const COPY = {
  en: { title: "Page not found", desc: "The page you’re looking for doesn’t exist or has moved.", home: "Back to Home" },
  ar: { title: "الصفحة غير موجودة", desc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", home: "العودة إلى الرئيسية" },
  tr: { title: "Sayfa bulunamadı", desc: "Aradığınız sayfa mevcut değil veya taşınmış olabilir.", home: "Ana Sayfaya Dön" },
} as const;

export default async function NotFound() {
  const locale = await getLocale();
  const t = COPY[locale as keyof typeof COPY] ?? COPY.en;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#f9f9f9]">
      <p className="text-[80px] font-bold leading-none text-[#4ba6ea]">404</p>
      <h1 className="mt-4 text-[24px] font-bold text-[#0a0a0a]">{t.title}</h1>
      <p className="mt-2 text-[15px] text-[#6e6e73] max-w-[340px]">{t.desc}</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center h-12 px-6 rounded-full bg-[#4ba6ea] text-white text-[14px] font-semibold hover:bg-[#2d8fd4] transition-colors"
      >
        {t.home}
      </Link>
    </main>
  );
}
