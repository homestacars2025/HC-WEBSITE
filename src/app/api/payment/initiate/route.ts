import { NextRequest, NextResponse } from "next/server";
import {
  getKuveytConfig,
  buildEnrollmentHash,
  buildEnrollmentXml,
  toKurus,
  postToBank,
  generateMerchantOrderId,
  requestOrigin,
} from "@/lib/kuveytturk";

// Handles card data — must never be cached or statically rendered.
export const dynamic = "force-dynamic";

interface InitiateBody {
  amount?: number | string;
  orderId?: string;
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

  // ── Validate amount ──
  const amountTl = Number(body.amount);
  if (!Number.isFinite(amountTl) || amountTl <= 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }
  const amount = toKurus(amountTl);

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

  const merchantOrderId = (body.orderId ?? "").trim() || generateMerchantOrderId();

  // The bank posts the auth result to these URLs; /api/payment/confirm parses
  // it, runs the provision step, then forwards the browser to the result page.
  // Derive the origin from the request so the callback returns to THIS
  // deployment (e.g. a Vercel preview URL), not the configured production host.
  const origin = requestOrigin(req.headers, cfg.siteUrl);
  const okUrl = `${origin}/api/payment/confirm`;
  const failUrl = `${origin}/api/payment/confirm`;

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
