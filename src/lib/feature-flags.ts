/**
 * Customer-facing feature switches.
 *
 * These gate ENTRY POINTS only — never the underlying implementation. The code
 * behind a disabled flag stays deployed, tested and functional; it is simply not
 * reachable from the customer UI.
 */

/**
 * Online card payment (Kuveyt Türk 3D Secure).
 *
 * Currently OFF by product decision, not because anything is broken. The flow
 * is complete and verified end to end in production: book → 3DS → OTP →
 * provision → success, with the booking marked paid.
 *
 * The intended process right now is: customer books without paying → the team
 * reviews availability → the team sends a payment link later. So the "Pay
 * online now" button is hidden from the booking success page.
 *
 * Everything else remains live and unchanged:
 *   /[locale]/payment/checkout   — works from ?booking=<booking_number>
 *   /api/payment/initiate        — Request 1 (3DS enrollment)
 *   /api/payment/confirm         — bank callback + Request 2 (provision)
 *
 * To re-enable the customer-facing button, flip this to `true`. Before doing
 * so, confirm production still carries the Phase 1 environment values:
 *   KUVEYT_CUSTOMER_ID    = 90875132   (NOT the merchant id — that pair
 *                                       mismatch caused InvalidMetaData)
 *   KUVEYT_MERCHANT_ID    = 755408
 *   NEXT_PUBLIC_SITE_URL  = https://www.homestacars.com  (must be the www
 *                                       canonical host; the apex 307-redirects
 *                                       and would add a hop to the bank's
 *                                       cross-site 3DS callback POST)
 *   KUVEYT_PAYGATE_URL / KUVEYT_PROVISION_URL → the static-IP proxy
 *                                       (the bank IP-whitelists callers;
 *                                        Vercel egress is not whitelisted)
 */
export const ONLINE_PAYMENT_ENABLED = false;
