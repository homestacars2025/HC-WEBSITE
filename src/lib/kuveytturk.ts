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
  const password = process.env.KUVEYT_API_PASSWORD ?? "";

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
    siteUrl:
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://homestacars.com",
  };
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

/** Returns the inner text of the first occurrence of <tag>…</tag>, or "". */
export function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].trim() : "";
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

/** Generates a unique alphanumeric MerchantOrderId (ASCII, safe for hashing). */
export function generateMerchantOrderId(): string {
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `HC${Date.now()}${rand}`;
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
