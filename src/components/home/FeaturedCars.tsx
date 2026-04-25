"use client";

import { motion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import CarCard from "@/components/fleet/CarCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { EASE } from "@/lib/motion";
import type { Car, Locale } from "@/types";

interface FeaturedCarsProps {
  cars: Car[];
}

// Stagger container
const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export default function FeaturedCars({ cars }: FeaturedCarsProps) {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;

  return (
    <section className="py-14 bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">

        {/* Centered Apple-style section header */}
        <SectionHeader
          eyebrow={t("featuredSubtitle")}
          heading={t("featuredTitle")}
          subheading={undefined}
          align="center"
        />

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {cars.map((car, i) => (
            <CarCard key={car.id} car={car} locale={locale} index={i} />
          ))}
        </motion.div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          className="flex justify-end mt-6"
        >
          <Link
            href="/fleet"
            className="inline-flex items-center gap-1.5 text-[#4ba6ea] text-[15px] font-medium hover:underline underline-offset-4 transition-all duration-150"
          >
            {t("viewAllCars")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
