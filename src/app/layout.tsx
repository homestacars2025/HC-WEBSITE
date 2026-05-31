import type { Metadata } from "next";

// The <html> and <body> tags are rendered by the locale layout
// (src/app/[locale]/layout.tsx), which is the top-level layout for every page.
// This root layout must NOT render its own <html>/<body> (that would conflict);
// it only carries root-level metadata and passes children through. All routes —
// including 404s — flow through the [locale] segment (see the catch-all in
// src/app/[locale]/[...rest]/page.tsx), so they always get <html>/<body>.
export const metadata: Metadata = {
  metadataBase: new URL("https://homestacars.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
