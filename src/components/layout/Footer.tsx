"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { WHATSAPP_URL } from "@/lib/whatsapp";
import GalataTower from "@/components/illustrations/GalataTower";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const quickLinks = [
    { href: "/" as const, label: tNav("home") },
    { href: "/fleet" as const, label: tNav("fleet") },
    { href: "/about" as const, label: tNav("about") },
    { href: "/contact" as const, label: tNav("contact") },
  ];

  const socialLinks = [
    { href: "https://www.instagram.com/homesta.cars/",                          label: "Instagram", Icon: InstagramIcon },
    { href: "https://www.facebook.com/profile.php?id=61578291325834",           label: "Facebook",  Icon: FacebookIcon  },
    { href: "https://www.tiktok.com/@homesta.cars?_r=1&_t=ZS-95aLrjXzG6O",     label: "TikTok",    Icon: TikTokIcon    },
    { href: WHATSAPP_URL,                                                        label: "WhatsApp",  Icon: WhatsAppIcon  },
  ];

  return (
    <footer className="bg-white border-t border-[#e5e5e5] relative overflow-hidden">
      {/* Decorative Galata Tower — far right edge */}
      <GalataTower className="absolute right-0 bottom-0 h-full max-h-[220px] opacity-[0.06] pointer-events-none select-none hidden lg:block" />

      <div className="max-w-[1200px] mx-auto px-6 pt-14 pb-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr] gap-10 mb-10">

          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start">
            <Link href="/" dir="ltr" aria-label="Homesta Cars">
              <Image
                src="/logo.svg"
                alt="Homesta Cars"
                width={205}
                height={43}
                className="h-10 md:h-11 w-auto mb-5"
              />
            </Link>
            <p className="text-[13px] text-[#86868b] leading-relaxed max-w-[240px] text-center sm:text-start">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-2 mt-5">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] hover:bg-[#e5e5e5] hover:text-[#0a0a0a] transition-colors duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links + Contact — side by side on mobile, separate columns on sm+ */}
          <div className="grid grid-cols-2 gap-6 sm:contents">

            {/* Quick links */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#86868b] mb-4">
                {t("quickLinks")}
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[13px] text-[#6e6e73] hover:text-[#0a0a0a] transition-colors duration-150">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#86868b] mb-4">
                {t("contact")}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="mailto:info@homestacars.com" className="text-[13px] text-[#6e6e73] hover:text-[#0a0a0a] transition-colors duration-150 break-all">
                    info@homestacars.com
                  </a>
                </li>
                <li>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#6e6e73] hover:text-[#0a0a0a] transition-colors duration-150">
                    {t("whatsapp")}
                  </a>
                </li>
                <li className="text-[13px] text-[#86868b]">
                  {t("istanbul")}
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#e5e5e5] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#86868b]">
            Copyright © {new Date().getFullYear()} Homesta Cars. {t("allRightsReserved")}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-[11px] text-[#86868b] hover:text-[#0a0a0a] transition-colors">
              {t("privacy")}
            </Link>
            <span className="text-[#e5e5e5] text-[11px]">|</span>
            <Link href="/terms" className="text-[11px] text-[#86868b] hover:text-[#0a0a0a] transition-colors">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
