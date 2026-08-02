-- Inquiries submitted from /inquiry.
-- Apply with: supabase db push  (or paste into the SQL editor).
--
-- Column values are validated in the application (src/lib/inquiry.ts) rather
-- than pinned by CHECK constraints here. That is deliberate: `product` is
-- derived from the catalogue in src/lib/products.ts, so a constraint listing
-- its values would need a migration every time a product is added -- and the
-- failure mode is a rejected insert, meaning a lost customer inquiry. The only
-- constraints kept are ones that cannot drift with the catalogue: `status`,
-- which the website never writes, and the phone format, which is produced by
-- one function.

create table if not exists public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,
  submitted_at  timestamptz not null default now(),

  name          text not null,
  email         text not null,
  company       text not null,

  -- E.164 or nothing. Written only by toE164() in src/lib/countries.ts, which
  -- emits a leading + then 4-15 digits; the app sends null for a blank field.
  phone         text check (phone is null or phone ~ '^\+[1-9][0-9]{3,14}$'),

  -- Product slug from src/lib/products.ts, or 'other' for a custom enquiry.
  -- Nullable: the field is optional and can be deselected.
  product       text,

  application   text,
  volume        text,
  timeline      text,
  drawing_url   text,
  message       text not null,

  -- Internal triage state. Set by staff, never by the website.
  status        text not null default 'new'
                  check (status in ('new', 'triaged', 'answered', 'closed')),

  created_at    timestamptz not null default now()
);

create index if not exists inquiries_submitted_at_idx
  on public.inquiries (submitted_at desc);
create index if not exists inquiries_status_idx
  on public.inquiries (status);
create index if not exists inquiries_product_idx
  on public.inquiries (product);

-- RLS on, with no public policies: the app writes with the service role key
-- from the server action only. Add a policy per authenticated staff role when
-- an internal dashboard is built.
alter table public.inquiries enable row level security;
