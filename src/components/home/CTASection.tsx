"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/whatsapp";
import { EASE } from "@/lib/motion";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const rise = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export default function CTASection() {
  const t = useTranslations("home");

  return (
    <section className="bg-[#0a0a0a] py-16">
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p variants={rise} className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#4ba6ea] mb-3">
            {t("ctaEyebrow")}
          </motion.p>

          <motion.h2 variants={rise} className="text-[36px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.03em] text-white mb-3">
            {t("ctaTitle")}
          </motion.h2>

          <motion.p variants={rise} className="text-[16px] text-white/50 leading-relaxed mb-7 max-w-[480px] mx-auto">
            {t("ctaSubtitle")}
          </motion.p>

          <motion.div variants={rise} className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/fleet"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#4ba6ea] text-white text-[15px] font-medium hover:bg-[#2d8fd4] transition-colors duration-150"
            >
              {t("ctaButton")}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-white/20 text-white/70 text-[15px] font-medium hover:border-white/40 hover:text-white transition-colors duration-150"
            >
              {t("bookOnWhatsApp")}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
