/**
 * Kuveyt Türk Sanal POS — 3D Secure (3D Model), API version TDV2.0.0
 * Server-only module. Never import into a client component.
 *
 * Flow (per official "Sanal Pos Entegrasyon Dokümanı — 3D Secure Model"):
 *   1. Card verification (Request 1) → POST XML to ThreeDModelPayGate.
 *      Bank returns an HTML page → we hand it to the browser to render the
 *      3D Secure / OTP screen (iframes are blocked by the bank, so it must be
 *      rendered top-level).
 *   2. The bank POSTs the auth result to OkUrl/FailUrl as
 *      `application/x-www-form-urlencoded` with an `AuthenticationResponse`
 *      field holding URL-encoded XML.
 *   3. Provision (Request 2) → if card verified (ResponseCode "00"), POST XML
 *      including the returned `MD` to ThreeDModelProvisionGate. ResponseCode
 *      "00" on this response means the payment succeeded.
 *
 * HashData (doc §6):
 *   HashedPassword = base64(sha1(Password))
 *   Request 1 hash = base64(sha1(MerchantId + MerchantOrderId + Amount +
 *                                OkUrl + FailUrl + UserName + HashedPassword))
 *   Request 2 hash = base64(sha1(MerchantId + MerchantOrderId + Amount +
 *                                UserName + HashedPassword))   // no Ok/Fail URL
 */

import crypto from "crypto";

export const API_VERSION = "TDV2.0.0";
export const SUCCESS_CODE = "00";

// ─── Config ─────────────────────────────────────────────────────────────────

export interface KuveytConfig {
  merchantId: string;
  customerId: string;
  userName: string;
  password: string;
  payGateUrl: string;
  provisionUrl: string;
  currencyCode: string;
  siteUrl: string;
}

/** Reads config from env. Throws if a required secret is missing. */
export function getKuveytConfig(): KuveytConfig {
  const merchantId = process.env.KUVEYT_MERCHANT_ID?.trim() ?? "";
  const customerId = process.env.KUVEYT_CUSTOMER_ID?.trim() ?? "";
  const userName = process.env.KUVEYT_API_USERNAME?.trim() ?? "";
  // Trim like every other hashed field — a stray newline/space in the env value
  // would otherwise change the hashed bytes and break HashData.
  const password = process.env.KUVEYT_API_PASSWORD?.trim() ?? "";

  const missing = [
    ["KUVEYT_MERCHANT_ID", merchantId],
    ["KUVEYT_CUSTOMER_ID", customerId],
    ["KUVEYT_API_USERNAME", userName],
    ["KUVEYT_API_PASSWORD", password],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    throw new Error(`Kuveyt Türk POS not configured. Missing env: ${missing.join(", ")}`);
  }

  return {
    merchantId,
    customerId,
    userName,
    password,
    payGateUrl:
      process.env.KUVEYT_PAYGATE_URL?.trim() ||
      "https://boa.kuveytturk.com.tr/sanalposservice/Home/ThreeDModelPayGate",
    provisionUrl:
      process.env.KUVEYT_PROVISION_URL?.trim() ||
      "https://boa.kuveytturk.com.tr/sanalposservice/Home/ThreeDModelProvisionGate",
    currencyCode: process.env.KUVEYT_CURRENCY_CODE?.trim() || "0949", // TL
    siteUrl: resolveSiteUrl(),
  };
}

/**
 * The origin used for OkUrl/FailUrl. On a Vercel PREVIEW deployment it must be
 * the deployment's OWN origin (VERCEL_BRANCH_URL / VERCEL_URL) so the bank's 3DS
 * callback returns to THIS preview — not to production. Everywhere else
 * (production, local) it is the canonical NEXT_PUBLIC_SITE_URL. Computed once and
 * used for BOTH the hash string and the <OkUrl> tag, so they stay byte-identical.
 */
function resolveSiteUrl(): string {
  if (process.env.VERCEL_ENV === "preview") {
    const own =
      process.env.VERCEL_BRANCH_URL?.trim() || process.env.VERCEL_URL?.trim();
    if (own) return `https://${own}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://homestacars.com";
}

// ─── Hashing ────────────────────────────────────────────────────────────────

// The bank hashes with ISO-8859-9; all hashed fields (ids, amounts, urls,
// username, password) are ASCII, for which latin1 is byte-identical.
function sha1Base64(input: string): string {
  return crypto.createHash("sha1").update(input, "latin1").digest("base64");
}

export function hashPassword(password: string): string {
  return sha1Base64(password);
}

export function buildEnrollmentHash(
  cfg: KuveytConfig,
  p: { merchantOrderId: string; amount: number; okUrl: string; failUrl: string },
): string {
  const hp = hashPassword(cfg.password);
  return sha1Base64(
    `${cfg.merchantId}${p.merchantOrderId}${p.amount}${p.okUrl}${p.failUrl}${cfg.userName}${hp}`,
  );
}

export function buildProvisionHash(
  cfg: KuveytConfig,
  p: { merchantOrderId: string; amount: string | number },
): string {
  const hp = hashPassword(cfg.password);
  return sha1Base64(
    `${cfg.merchantId}${p.merchantOrderId}${p.amount}${cfg.userName}${hp}`,
  );
}

// ─── Amounts ──────────────────────────────────────────────────────────────────

/** Turkish lira → integer kuruş, as the bank expects (1 TL → 100, 102.65 → 10265). */
export function toKurus(tl: number): number {
  return Math.round(tl * 100);
}

// ─── XML helpers ──────────────────────────────────────────────────────────────

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Decodes an `application/x-www-form-urlencoded` VALUE the way the bank encoded
 * it (doc §5.2.4: the AuthenticationResponse payload is UrlEncoded).
 *
 * The bank uses .NET `HttpUtility.UrlEncode`, which is FORM-style: a space
 * becomes "+", and a literal "+" becomes "%2b". `decodeURIComponent` is the
 * RFC3986 decoder — it resolves %XX but leaves "+" as a literal plus, so a
 * decoded message reads "Kart+doğrulandı." instead of "Kart doğrulandı.".
 * Mapping "+" → "%20" first restores HttpUtility.UrlDecode semantics.
 *
 * Note this is decode #2. `req.formData()` already undid the transport-level
 * form encoding the browser applied when it POSTed the bank's auto-submit form;
 * this undoes the bank's own encoding of the XML, exactly as the doc instructs.
 */
export function formUrlDecode(value: string): string {
  return decodeURIComponent(value.replace(/\+/g, "%20"));
}

/** Returns the inner text of the first occurrence of <tag>…</tag>, or "". */
export function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

export interface CardHolderData {
  billAddrCity: string;
  billAddrCountry: string; // ISO-3166 numeric, "792" = Türkiye
  billAddrLine1: string;
  billAddrPostCode: string;
  billAddrState: string;
  email: string;
  phoneCc: string; // country calling code, e.g. "90"
  phoneSubscriber: string; // national number without the country code
}

export interface EnrollmentParams {
  merchantOrderId: string;
  amount: number; // kuruş
  okUrl: string;
  failUrl: string;
  clientIp: string;
  cardNumber: string;
  cardExpireDateYear: string; // "YY"
  cardExpireDateMonth: string; // "MM"
  cardCVV2: string;
  cardHolderName: string;
  hashData: string;
  cardHolderData?: CardHolderData; // 3DS 2.0 (mandatory per bank docs)
}

/** Request 1 — card verification message (ThreeDModelPayGate). */
export function buildEnrollmentXml(cfg: KuveytConfig, p: EnrollmentParams): string {
  return (
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">` +
    `<APIVersion>${API_VERSION}</APIVersion>` +
    `<OkUrl>${esc(p.okUrl)}</OkUrl>` +
    `<FailUrl>${esc(p.failUrl)}</FailUrl>` +
    `<HashData>${esc(p.hashData)}</HashData>` +
    `<MerchantId>${esc(cfg.merchantId)}</MerchantId>` +
    `<CustomerId>${esc(cfg.customerId)}</CustomerId>` +
    `<UserName>${esc(cfg.userName)}</UserName>` +
    `<DeviceData><DeviceChannel>02</DeviceChannel><ClientIP>${esc(p.clientIp)}</ClientIP></DeviceData>` +
    (p.cardHolderData
      ? `<CardHolderData>` +
        `<BillAddrCity>${esc(p.cardHolderData.billAddrCity)}</BillAddrCity>` +
        `<BillAddrCountry>${esc(p.cardHolderData.billAddrCountry)}</BillAddrCountry>` +
        `<BillAddrLine1>${esc(p.cardHolderData.billAddrLine1)}</BillAddrLine1>` +
        `<BillAddrPostCode>${esc(p.cardHolderData.billAddrPostCode)}</BillAddrPostCode>` +
        `<BillAddrState>${esc(p.cardHolderData.billAddrState)}</BillAddrState>` +
        `<Email>${esc(p.cardHolderData.email)}</Email>` +
        `<MobilePhone><Cc>${esc(p.cardHolderData.phoneCc)}</Cc><Subscriber>${esc(p.cardHolderData.phoneSubscriber)}</Subscriber></MobilePhone>` +
        `</CardHolderData>`
      : "") +
    `<CardNumber>${esc(p.cardNumber)}</CardNumber>` +
    `<CardExpireDateYear>${esc(p.cardExpireDateYear)}</CardExpireDateYear>` +
    `<CardExpireDateMonth>${esc(p.cardExpireDateMonth)}</CardExpireDateMonth>` +
    `<CardCVV2>${esc(p.cardCVV2)}</CardCVV2>` +
    `<CardHolderName>${esc(p.cardHolderName)}</CardHolderName>` +
    `<TransactionType>Sale</TransactionType>` +
    `<InstallmentCount>0</InstallmentCount>` +
    `<Amount>${p.amount}</Amount>` +
    `<DisplayAmount>${p.amount}</DisplayAmount>` +
    `<CurrencyCode>${esc(cfg.currencyCode)}</CurrencyCode>` +
    `<MerchantOrderId>${esc(p.merchantOrderId)}</MerchantOrderId>` +
    `<TransactionSecurity>3</TransactionSecurity>` +
    `</KuveytTurkVPosMessage>`
  );
}

export interface ProvisionParams {
  merchantOrderId: string;
  amount: string | number; // kuruş (echoed from the verified Request 1)
  md: string;
  hashData: string;
}

/** Request 2 — provision / payment collection message (ThreeDModelProvisionGate). */
export function buildProvisionXml(cfg: KuveytConfig, p: ProvisionParams): string {
  return (
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">` +
    `<APIVersion>${API_VERSION}</APIVersion>` +
    `<HashData>${esc(p.hashData)}</HashData>` +
    `<MerchantId>${esc(cfg.merchantId)}</MerchantId>` +
    `<CustomerId>${esc(cfg.customerId)}</CustomerId>` +
    `<UserName>${esc(cfg.userName)}</UserName>` +
    `<TransactionType>Sale</TransactionType>` +
    `<InstallmentCount>0</InstallmentCount>` +
    `<Amount>${p.amount}</Amount>` +
    `<MerchantOrderId>${esc(p.merchantOrderId)}</MerchantOrderId>` +
    `<TransactionSecurity>3</TransactionSecurity>` +
    `<KuveytTurkVPosAdditionalData><AdditionalData><Key>MD</Key><Data>${esc(p.md)}</Data></AdditionalData></KuveytTurkVPosAdditionalData>` +
    `</KuveytTurkVPosMessage>`
  );
}

// ─── Transport ────────────────────────────────────────────────────────────────

/** POSTs an XML message to the bank and returns the raw response body. */
export async function postToBank(url: string, xml: string): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=UTF-8" },
    body: xml,
    cache: "no-store",
  });
  return res.text();
}

// ─── MerchantOrderId ──────────────────────────────────────────────────────────
//
// The bank requires a UNIQUE MerchantOrderId per attempt — reusing one (which we
// did while it was just the booking number) gets the retry rejected at the 3DS
// step. So each attempt gets a fresh nonce, appended to the booking number:
//
//     HOM-07-26-001  ──►  HOM-07-26-001-9F3A21C4
//
// Traceability is preserved without a schema change: the booking number IS the
// order id's prefix, so `bookingNumberFromOrderId` recovers it exactly. The
// nonce is uppercase hex — never a "-" — so "everything before the last dash"
// is an unambiguous split.

/** Fresh, unique MerchantOrderId for one payment attempt on `bookingNumber`. */
export function buildMerchantOrderId(bookingNumber: string): string {
  const nonce = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${bookingNumber}-${nonce}`;
}

/** Inverse of `buildMerchantOrderId` — recovers the booking number. */
export function bookingNumberFromOrderId(merchantOrderId: string): string {
  const i = merchantOrderId.lastIndexOf("-");
  return i > 0 ? merchantOrderId.slice(0, i) : merchantOrderId;
}

/**
 * The public origin of the current deployment (e.g. https://foo.vercel.app),
 * derived from the incoming request. Used to build OkUrl/FailUrl and the
 * post-3DS redirect targets so the whole round-trip stays on THIS deployment —
 * essential on Vercel preview URLs, where the configured siteUrl (production)
 * would otherwise send the bank callback to the wrong deployment.
 * Falls back to the configured siteUrl when no host header is present.
 */
export function requestOrigin(headers: Headers, fallback: string): string {
  const proto = headers.get("x-forwarded-proto")?.split(",")[0].trim() || "https";
  const host =
    headers.get("x-forwarded-host")?.split(",")[0].trim() ||
    headers.get("host")?.trim();
  return host ? `${proto}://${host}` : fallback;
}
