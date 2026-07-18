-- Server-authoritative payment amount for bookings.
--
-- The payable total is computed and stored when the booking is created, so the
-- payment endpoint charges THIS value instead of anything supplied by the
-- browser. Amount is stored in the currency Kuveyt Türk charges (TRY).
--
-- Apply to the project the app actually uses: edsyoxqsnsxfftnbsjgq
-- (the Supabase MCP points at a different project, so run this by hand in the
--  Supabase Dashboard → SQL editor of edsyoxqsnsxfftnbsjgq).

alter table public.bookings
  add column if not exists total_amount   numeric(12,2),
  add column if not exists currency       text not null default 'TRY',
  add column if not exists payment_status text not null default 'unpaid';

comment on column public.bookings.total_amount is
  'Authoritative charge amount (in `currency`), computed server-side at booking creation. Never trust a client-supplied amount.';
comment on column public.bookings.payment_status is
  'unpaid | paid | failed — set by the payment flow.';
