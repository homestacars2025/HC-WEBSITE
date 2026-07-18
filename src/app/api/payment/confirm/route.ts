import { NextRequest, NextResponse } from "next/server";
import {
  getKuveytConfig,
  buildProvisionHash,
  buildProvisionXml,
  extractTag,
  postToBank,
  requestOrigin,
  SUCCESS_CODE,
  type KuveytConfig,
} from "@/lib/kuveytturk";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// The bank POSTs the 3DS result here (see OkUrl/FailUrl in initiate). We finish
// the payment (provision) and 303-redirect the browser to the result page.
// A 303 forces the follow-up request to be a GET so the page renders normally.
// The base URL is derived from the request so the redirect stays on THIS
// deployment (the bank posted back to our OkUrl on this same host).
function redirectTo(origin: string, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, origin), 303);
}

function failUrl(order: string, code: string, message: string): string {
  const qs = new URLSearchParams({ order, code, message });
  return `/payment/fail?${qs.toString()}`;
}

export async function POST(req: NextRequest) {
  // Same host the bank just posted back to; used for every redirect below.
  const origin = requestOrigin(
    req.headers,
    process.env.NEXT_PUBLIC_SITE_URL || req.url,
  );

  let cfg: KuveytConfig;
  try {
    cfg = getKuveytConfig();
  } catch {
    return NextResponse.redirect(new URL("/payment/fail?code=config", origin), 303);
  }

  const supabase = await createClient();

  // ── Read the bank callback (application/x-www-form-urlencoded) ──
  let authXml = "";
  try {
    const form = await req.formData();
    const raw = form.get("AuthenticationResponse");
    if (raw) authXml = decodeURIComponent(String(raw));
  } catch {
    /* fall through — treated as missing below */
  }

  if (!authXml) {
    return redirectTo(origin, failUrl("", "no_response", "Missing authentication response"));
  }

  const responseCode = extractTag(authXml, "ResponseCode");
  const responseMessage = extractTag(authXml, "ResponseMessage");
  const merchantOrderId = extractTag(authXml, "MerchantOrderId");
  const md = extractTag(authXml, "MD");
  // Amount is echoed inside VPosMessage from our hash-protected Request 1, so it
  // is safe to reuse for the provision step.
  const amount = extractTag(authXml, "Amount");

  // ── Step 1 result: was the card verified? ──
  if (responseCode !== SUCCESS_CODE || !md) {
    return redirectTo(origin, failUrl(merchantOrderId, responseCode || "3ds_failed", responseMessage || "3D Secure failed"));
  }

  // ── Step 2: provision (collect the payment) ──
  const hashData = buildProvisionHash(cfg, { merchantOrderId, amount });
  const provisionXml = buildProvisionXml(cfg, { merchantOrderId, amount, md, hashData });

  let provisionResponse: string;
  try {
    provisionResponse = await postToBank(cfg.provisionUrl, provisionXml);
  } catch {
    return redirectTo(origin, failUrl(merchantOrderId, "gateway", "Payment gateway unreachable"));
  }

  const provisionCode = extractTag(provisionResponse, "ResponseCode");
  const provisionMessage = extractTag(provisionResponse, "ResponseMessage");

  if (provisionCode === SUCCESS_CODE) {
    const provisionNumber = extractTag(provisionResponse, "ProvisionNumber");
    const bankOrderId = extractTag(provisionResponse, "OrderId");

    // Mark the booking paid (merchantOrderId == booking_number). Best-effort:
    // the money is already collected, so a failed update must not fail the flow.
    try {
      await supabase
        .from("bookings")
        .update({ payment_status: "paid", status: "confirmed" } as never)
        .eq("booking_number", merchantOrderId);
    } catch (e) {
      console.error("[payment] booking mark-paid failed", { merchantOrderId, e });
    }

    const qs = new URLSearchParams({
      order: merchantOrderId,
      ref: provisionNumber,
      bankOrderId,
    });
    return redirectTo(origin, `/payment/success?${qs.toString()}`);
  }

  return redirectTo(
    origin,
    failUrl(merchantOrderId, provisionCode || "provision_failed", provisionMessage || "Payment declined"),
  );
}
