-- Enums
create type public.space_type as enum ('garden', 'backyard', 'lawn', 'courtyard');
create type public.catering_mode as enum ('none', 'optional', 'required');
create type public.listing_status as enum ('draft', 'active', 'archived');
create type public.vendor_category as enum ('sound', 'catering', 'photo', 'tents');
create type public.booking_status as enum ('inquiry', 'quoting', 'deposit_paid', 'confirmed', 'cancelled');
create type public.fulfillment_type as enum ('venue_included', 'platform_vendor', 'bring_your_own');
create type public.recipient_type as enum ('venue_owner', 'vendor', 'client');
create type public.dispatch_channel as enum ('simulated_whatsapp', 'simulated_sms');

-- Keeps updated_at current
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Venues
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  space_type public.space_type not null,
  area text not null,
  capacity_max integer not null check (capacity_max > 0),
  base_price_kes integer not null check (base_price_kes >= 0),
  includes_tents boolean not null default false,
  includes_chairs boolean not null default false,
  in_house_catering public.catering_mode not null default 'none',
  allows_outside_vendors boolean not null default true,
  owner_private_phone text,
  images text[] not null default '{}',
  status public.listing_status not null default 'draft',
  is_simulated boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Vendors
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category public.vendor_category not null,
  area_coverage text[] not null default '{}',
  partner_cost_kes integer not null check (partner_cost_kes >= 0),
  client_price_kes integer not null check (client_price_kes >= 0),
  private_phone text,
  portfolio_images text[] not null default '{}',
  status public.listing_status not null default 'draft',
  is_simulated boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (client_price_kes >= partner_cost_kes)
);

-- Bookings
create sequence public.booking_reference_seq start with 101;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique
    default ('GRD-' || nextval('public.booking_reference_seq')),
  venue_id uuid not null references public.venues (id) on delete restrict,
  client_name text not null,
  client_phone text not null,
  event_date date not null,
  guest_count integer not null check (guest_count > 0),
  event_type text not null,
  status public.booking_status not null default 'inquiry',
  total_client_kes integer not null default 0 check (total_client_kes >= 0),
  total_internal_cost_kes integer not null default 0 check (total_internal_cost_kes >= 0),
  estimated_margin_kes integer generated always as (total_client_kes - total_internal_cost_kes) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Booking add-ons
create table public.booking_addons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  category public.vendor_category not null,
  fulfillment_type public.fulfillment_type not null,
  vendor_id uuid references public.vendors (id) on delete restrict,
  client_price_kes integer not null default 0 check (client_price_kes >= 0),
  partner_cost_kes integer not null default 0 check (partner_cost_kes >= 0),
  created_at timestamptz not null default now(),
  check ((fulfillment_type = 'platform_vendor') = (vendor_id is not null))
);

-- Dispatch logs (simulated WhatsApp / SMS)
create table public.dispatch_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  recipient_type public.recipient_type not null,
  channel public.dispatch_channel not null,
  message_payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index venues_status_area_idx on public.venues (status, area);
create index vendors_status_category_idx on public.vendors (status, category);
create index bookings_venue_id_idx on public.bookings (venue_id);
create index bookings_status_idx on public.bookings (status);
create index bookings_event_date_idx on public.bookings (event_date);
create index booking_addons_booking_id_idx on public.booking_addons (booking_id);
create index booking_addons_vendor_id_idx on public.booking_addons (vendor_id);
create index dispatch_logs_booking_id_idx on public.dispatch_logs (booking_id);

-- updated_at triggers
create trigger venues_set_updated_at before update on public.venues
  for each row execute function public.set_updated_at();
create trigger vendors_set_updated_at before update on public.vendors
  for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- Row level security
alter table public.venues enable row level security;
alter table public.vendors enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_addons enable row level security;
alter table public.dispatch_logs enable row level security;

create policy "Public can read active venues" on public.venues
  for select to anon, authenticated using (status = 'active');
create policy "Public can read active vendors" on public.vendors
  for select to anon, authenticated using (status = 'active');

-- Column-level privacy: public roles never see phones or wholesale costs
revoke all on public.venues from anon, authenticated;
revoke all on public.vendors from anon, authenticated;
revoke all on public.bookings from anon, authenticated;
revoke all on public.booking_addons from anon, authenticated;
revoke all on public.dispatch_logs from anon, authenticated;

grant select (
  id, title, slug, description, space_type, area, capacity_max, base_price_kes,
  includes_tents, includes_chairs, in_house_catering, allows_outside_vendors,
  images, status, is_simulated, created_at, updated_at
) on public.venues to anon, authenticated;

grant select (
  id, name, description, category, area_coverage, client_price_kes,
  portfolio_images, status, is_simulated, created_at, updated_at
) on public.vendors to anon, authenticated;

-- The server (secret key) keeps full access
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;