"use client";

import { motion } from "motion/react";
import { EASE } from "@/lib/motion";

interface SectionHeaderProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  align?: "center" | "left";
}

export default function SectionHeader({
  eyebrow,
  heading,
  subheading,
  align = "center",
}: SectionHeaderProps) {
  const alignClass = align === "center"
    ? "items-center text-center"
    : "items-start text-start";

  return (
    <div className={`flex flex-col ${alignClass} mb-8`}>
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#6e6e73] mb-2"
        >
          {eyebrow}
        </motion.p>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, delay: eyebrow ? 0.06 : 0, ease: EASE }}
        className="font-sans text-[#1d1d1f] leading-tight tracking-tight text-balance"
        style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}
      >
        {heading}
      </motion.h2>

      {subheading && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
          className="mt-2 text-[16px] text-[#6e6e73] max-w-[540px] leading-relaxed text-balance"
        >
          {subheading}
        </motion.p>
      )}
    </div>
  );
}
