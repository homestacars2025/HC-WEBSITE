import { notFound } from "next/navigation";

// Catch-all for any unmatched path under a locale (e.g. /ar/login). Without
// this, such paths fall back to the bare root layout (no <html>/<body>) and
// throw "Missing <html> and <body> tags in the root layout". Routing them here
// keeps them inside the [locale] layout, so notFound() renders the localized
// not-found page WITH <html>/<body>.
export default function CatchAllNotFound() {
  notFound();
}
