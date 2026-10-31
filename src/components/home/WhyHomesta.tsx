"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Car, MapPin, Headphones, Zap } from "lucide-react";
import { EASE } from "@/lib/motion";
import SectionHeader from "@/components/shared/SectionHeader";
import type { ElementType } from "react";

interface WhyItem {
  icon: ElementType;
  num: string;
  titleKey: "whyPremiumFleet" | "whyIstanbulExperts" | "whySupport" | "whyEasyBooking";
  descKey: "whyPremiumFleetDesc" | "whyIstanbulExpertsDesc" | "whySupportDesc" | "whyEasyBookingDesc";
}

const ITEMS: WhyItem[] = [
  { icon: Car,        num: "01", titleKey: "whyPremiumFleet",    descKey: "whyPremiumFleetDesc" },
  { icon: MapPin,     num: "02", titleKey: "whyIstanbulExperts", descKey: "whyIstanbulExpertsDesc" },
  { icon: Headphones, num: "03", titleKey: "whySupport",         descKey: "whySupportDesc" },
  { icon: Zap,        num: "04", titleKey: "whyEasyBooking",     descKey: "whyEasyBookingDesc" },
];

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function WhyHomesta() {
  const t = useTranslations("home");

  return (
    <section className="py-14 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">

        <SectionHeader
          eyebrow={t("whySubtitle")}
          heading={t("whyTitle")}
          align="center"
        />

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {ITEMS.map(({ icon: Icon, num, titleKey, descKey }) => (
            <motion.div
              key={titleKey}
              variants={itemVariants}
              className="relative flex flex-col"
            >
              {/* Decorative number */}
              <span
                className="text-[64px] font-black leading-none select-none mb-1"
                style={{ color: "#f0f0f0" }}
                aria-hidden="true"
              >
                {num}
              </span>

              {/* Icon — overlaps number bottom */}
              <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center -mt-4 mb-3">
                <Icon className="w-5 h-5 text-brand" />
              </div>

              <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-2 leading-snug">
                {t(titleKey)}
              </h3>
              <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                {t(descKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
