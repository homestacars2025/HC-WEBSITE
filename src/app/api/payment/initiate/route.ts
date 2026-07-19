import { NextRequest, NextResponse } from "next/server";
import {
  getKuveytConfig,
  buildEnrollmentHash,
  buildEnrollmentXml,
  toKurus,
  postToBank,
  buildMerchantOrderId,
} from "@/lib/kuveytturk";
import { createClient } from "@/lib/supabase/server";

// Handles card data — must never be cached or statically rendered.
export const dynamic = "force-dynamic";

interface InitiateBody {
  // The amount is NEVER accepted from the client — it is read from the booking.
  bookingNumber?: string;
  cardNumber?: string;
  cardHolderName?: string;
  expireMonth?: string; // "MM"
  expireYear?: string; // "YY" or "YYYY"
  cvv?: string;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

export async function POST(req: NextRequest) {
  let cfg;
  try {
    cfg = getKuveytConfig();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Payment is not configured." },
      { status: 503 },
    );
  }

  let body: InitiateBody;
  try {
    body = (await req.json()) as InitiateBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // ── Resolve the amount from the BOOKING, never from the client ──
  // The browser sends only a booking number; the payable total was computed and
  // stored server-side at booking creation. This closes the price-tampering hole
  // where a user could edit the amount in the checkout form.
  const bookingNumber = (body.bookingNumber ?? "").trim();
  if (!bookingNumber) {
    return NextResponse.json({ error: "missing_booking" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .select("booking_number, total_amount, currency, payment_status, customer_id")
    .eq("booking_number", bookingNumber)
    .maybeSingle();

  if (bookingErr || !booking) {
    return NextResponse.json({ error: "booking_not_found" }, { status: 404 });
  }
  if ((booking as { payment_status?: string }).payment_status === "paid") {
    return NextResponse.json({ error: "already_paid" }, { status: 409 });
  }

  const amountTl = Number((booking as { total_amount?: number | null }).total_amount);
  const currency = (booking as { currency?: string }).currency ?? "TRY";
  if (!Number.isFinite(amountTl) || amountTl <= 0 || currency !== "TRY") {
    // Pricing missing/invalid (or a non-TRY booking) — refuse rather than guess.
    return NextResponse.json({ error: "amount_unavailable" }, { status: 409 });
  }
  const amount = toKurus(amountTl);

  // ── CardHolderData (3DS 2.0): source Email/phone from the booking's customer,
  //    sane defaults for the rest. ──
  const { data: customer } = await supabase
    .from("customers")
    .select("email, phone")
    .eq("id", (booking as { customer_id?: string | number }).customer_id)
    .maybeSingle();

  const custEmail = (customer as { email?: string } | null)?.email?.trim() || "";
  const custPhone = (customer as { phone?: string } | null)?.phone ?? "";
  const phoneDigits = custPhone.replace(/\D/g, "");
  const phoneSubscriber = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits;
  const phoneCc = phoneDigits.length > 10 ? phoneDigits.slice(0, -10) : "90";

  const cardHolderData = {
    billAddrCity: "Istanbul",
    billAddrCountry: "792", // Türkiye
    billAddrLine1: "Istanbul",
    billAddrPostCode: "34000",
    billAddrState: "34",
    email: custEmail || "info@homestacars.com",
    phoneCc: phoneCc || "90",
    phoneSubscriber: phoneSubscriber || "5000000000",
  };

  // ── Validate card ──
  const cardNumber = (body.cardNumber ?? "").replace(/\s+/g, "");
  const cardHolderName = (body.cardHolderName ?? "").trim();
  const expireMonth = (body.expireMonth ?? "").padStart(2, "0").slice(-2);
  const expireYear = (body.expireYear ?? "").slice(-2); // bank wants 2-digit year
  const cvv = (body.cvv ?? "").trim();

  if (!/^\d{15,16}$/.test(cardNumber)) {
    return NextResponse.json({ error: "invalid_card" }, { status: 400 });
  }
  if (!/^(0[1-9]|1[0-2])$/.test(expireMonth) || !/^\d{2}$/.test(expireYear)) {
    return NextResponse.json({ error: "invalid_expiry" }, { status: 400 });
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    return NextResponse.json({ error: "invalid_cvv" }, { status: 400 });
  }
  if (cardHolderName.length < 2 || cardHolderName.length > 45) {
    return NextResponse.json({ error: "invalid_holder" }, { status: 400 });
  }

  // Unique per ATTEMPT — the bank rejects a reused MerchantOrderId, which broke
  // every retry back when this was just `bookingNumber`. The booking number stays
  // the order id's prefix, so confirm can trace it back for reconciliation.
  const merchantOrderId = buildMerchantOrderId(bookingNumber);

  // The bank posts the auth result to these URLs; /api/payment/confirm parses
  // it, runs the provision step, then forwards the browser to the result page.
  // ONE canonical origin (cfg.siteUrl / NEXT_PUBLIC_SITE_URL) is used for BOTH
  // the hash string and the XML tag, so they are byte-identical and resolve on
  // a single live domain (avoids the www/non-www hash mismatch).
  // On a protected Vercel PREVIEW, the bank's 3DS result is a cross-site top-level
  // POST to OkUrl. A query-param protection bypass would 302→GET-downgrade that
  // POST (losing the body/MD). So OkUrl points at a PUBLIC proxy path with NO
  // query string; the proxy relays the POST server-to-server to
  // /api/payment/confirm adding `x-vercel-protection-bypass` as a HEADER, which
  // does not redirect and preserves method + body. No query string ⇒ esc() can't
  // alter it ⇒ hashed OkUrl stays byte-identical to the <OkUrl> tag. On
  // production, OkUrl is the direct (unprotected) canonical callback.
  const previewCallback =
    process.env.VERCEL_ENV === "preview"
      ? process.env.KUVEYT_PREVIEW_CALLBACK_URL?.trim()
      : undefined;
  const okUrl = previewCallback || `${cfg.siteUrl}/api/payment/confirm`;
  const failUrl = okUrl;

  const hashData = buildEnrollmentHash(cfg, { merchantOrderId, amount, okUrl, failUrl });
  const xml = buildEnrollmentXml(cfg, {
    merchantOrderId,
    amount,
    okUrl,
    failUrl,
    clientIp: clientIp(req),
    cardNumber,
    cardExpireDateYear: expireYear,
    cardExpireDateMonth: expireMonth,
    cardCVV2: cvv,
    cardHolderName,
    cardHolderData,
    hashData,
  });

  let html: string;
  try {
    html = await postToBank(cfg.payGateUrl, xml);
  } catch (e) {
    // A connect timeout here (UND_ERR_CONNECT_TIMEOUT) almost always means the
    // bank's firewall is dropping our egress IP — Kuveyt Türk whitelists caller
    // IPs, and Vercel's dynamic serverless IPs are not registered. Log the cause
    // for diagnosis; the client only needs a generic failure.
    const err = e as Error & { cause?: { code?: string; message?: string } };
    console.error("[kuveyt] paygate fetch failed", {
      url: cfg.payGateUrl,
      name: err?.name,
      message: err?.message,
      cause: err?.cause?.code || err?.cause?.message,
    });
    return NextResponse.json({ error: "gateway_unreachable" }, { status: 502 });
  }

  // The bank returns an HTML document that renders the 3D Secure / OTP screen.
  // If it returned something else (e.g. an error), surface it as an error.
  if (!/<html|<form|<!doctype/i.test(html)) {
    return NextResponse.json(
      { error: "gateway_error", detail: html.slice(0, 2000) },
      { status: 502 },
    );
  }

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
