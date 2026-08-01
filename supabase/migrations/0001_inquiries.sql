-- Inquiries submitted from /inquiry.
-- Apply with: supabase db push  (or paste into the SQL editor).

create table if not exists public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,
  submitted_at  timestamptz not null default now(),
  name          text not null,
  email         text not null,
  company       text not null,
  phone         text,
  division      text not null check (division in ('robotics', 'materials', 'energy', 'unsure')),
  application   text,
  volume        text check (volume in ('prototype', 'pilot', 'production', 'high-volume')),
  timeline      text check (timeline in ('exploring', '0-3m', '3-6m', '6m+')),
  drawing_url   text,
  message       text not null,
  status        text not null default 'new' check (status in ('new', 'triaged', 'answered', 'closed')),
  created_at    timestamptz not null default now()
);

create index if not exists inquiries_submitted_at_idx on public.inquiries (submitted_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);

-- RLS on, with no public policies: the app writes with the service role key
-- from the server action only. Add a policy per authenticated staff role when
-- an internal dashboard is built.
alter table public.inquiries enable row level security;
