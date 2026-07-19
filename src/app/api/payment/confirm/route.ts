import { NextRequest, NextResponse } from "next/server";
import {
  getKuveytConfig,
  buildProvisionHash,
  buildProvisionXml,
  extractTag,
  formUrlDecode,
  bookingNumberFromOrderId,
  postToBank,
  requestOrigin,
  toKurus,
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
  const url = new URL(path, origin);
  // On a protected Vercel preview, the post-callback redirect to the result page
  // is a fresh navigation with no SSO cookie — carry the automation-bypass secret
  // so it renders instead of 401ing. (Not hashed; safe to use "&" here.)
  const bypass =
    process.env.VERCEL_ENV === "preview"
      ? process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim()
      : undefined;
  if (bypass) url.searchParams.set("x-vercel-protection-bypass", bypass);
  return NextResponse.redirect(url, 303);
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
  // `req.formData()` undoes the TRANSPORT encoding (the browser form-encoded the
  // bank's auto-submit form). `formUrlDecode` then undoes the BANK's own
  // UrlEncode of the XML — doc §5.2.4. Two layers, two decodes.
  let authXml = "";
  try {
    const form = await req.formData();
    const raw = form.get("AuthenticationResponse");
    if (raw) authXml = formUrlDecode(String(raw));
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

  // ── Step 1 result: was the card verified? ──
  if (responseCode !== SUCCESS_CODE || !md) {
    return redirectTo(origin, failUrl(merchantOrderId, responseCode || "3ds_failed", responseMessage || "3D Secure failed"));
  }

  // ── Re-derive the AUTHORITATIVE amount from the booking (identical to what
  //    initiate sent in Request 1), NOT scraped from the callback — so Request 2's
  //    Amount is provably the same value the MD was bound to. ──
  // MerchantOrderId is now "<booking_number>-<nonce>" (unique per attempt), so
  // the booking is looked up by the recovered prefix, not the raw order id.
  const bookingNumber = bookingNumberFromOrderId(merchantOrderId);
  const { data: bkg } = await supabase
    .from("bookings")
    .select("total_amount")
    .eq("booking_number", bookingNumber)
    .maybeSingle();
  const bookingTl = Number((bkg as { total_amount?: number | null } | null)?.total_amount);
  if (!Number.isFinite(bookingTl) || bookingTl <= 0) {
    console.error("[kuveyt] provision: booking amount unavailable", {
      merchantOrderId,
      bookingNumber,
    });
    return redirectTo(origin, failUrl(merchantOrderId, "amount_unavailable", "Amount unavailable"));
  }
  const amount = toKurus(bookingTl);

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

  const provisionNumber = extractTag(provisionResponse, "ProvisionNumber");
  const rrn = extractTag(provisionResponse, "RRN");
  const bankOrderId = extractTag(provisionResponse, "OrderId");

  // Ops record of the outcome. Deliberately no raw XML, no MD, no HashData —
  // those were temporary diagnostics and must not be retained in Vercel logs.
  console.log("[kuveyt] provision result", {
    merchantOrderId,
    responseCode: provisionCode || "(none)",
    responseMessage: provisionMessage,
    provisionNumber,
    rrn,
  });

  if (provisionCode === SUCCESS_CODE) {

    // Mark the booking paid. Best-effort: the money is already collected, so a
    // failed update must not fail the flow.
    try {
      await supabase
        .from("bookings")
        .update({ payment_status: "paid", status: "confirmed" } as never)
        .eq("booking_number", bookingNumber);
    } catch (e) {
      console.error("[payment] booking mark-paid failed", {
        merchantOrderId,
        bookingNumber,
        e,
      });
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
