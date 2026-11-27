alter table public.bookings
  add column deposit_kes integer check (deposit_kes >= 0),
  add column payment_reference text;