import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this project so it doesn't infer a
  // parent directory (e.g. from a stray lockfile) and fail to resolve modules.
  turbopack: {
    root: __dirname,
  },
  // There is no public careers listing: roles are reached only by their
  // direct link (/{locale}/careers/{slug}), so the index goes to the home page.
  async redirects() {
    return [
      { source: "/careers", destination: "/", permanent: false },
      { source: "/:locale(ar|en|tr)/careers", destination: "/:locale", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "edsyoxqsnsxfftnbsjgq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
