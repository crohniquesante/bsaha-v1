alter table public.users
add column if not exists is_admin boolean not null default false;

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  number smallint not null check (number between 1 and 3),
  scheduled_at timestamptz,
  duration_min integer,
  status text not null default 'A venir',
  notes_pdf_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  promo_code text not null,
  description text not null,
  affiliate_url text not null,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_consultations_user on public.consultations(user_id);
create index if not exists idx_deals_active on public.deals(is_active);

alter table public.consultations enable row level security;
alter table public.deals enable row level security;

create policy "consultations_select_own" on public.consultations
for select using (auth.uid() = user_id);

create policy "deals_read_all_active" on public.deals
for select using (is_active = true);
