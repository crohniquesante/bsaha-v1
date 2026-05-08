-- Projections (objectifs personnelles, max 5 applique cote app)
create table if not exists public.projections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  condition_text text not null,
  action_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_projections_user on public.projections(user_id, created_at desc);

alter table public.projections enable row level security;

create policy "projections_select_own" on public.projections
for select using (auth.uid() = user_id);

create policy "projections_insert_own" on public.projections
for insert with check (auth.uid() = user_id);

create policy "projections_update_own" on public.projections
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projections_delete_own" on public.projections
for delete using (auth.uid() = user_id);

-- Lives (calendrier Youtube / liens)
create table if not exists public.lives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  scheduled_at timestamptz not null,
  meeting_url text not null,
  theme text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_lives_scheduled on public.lives(scheduled_at asc);

alter table public.lives enable row level security;

create policy "lives_select_authenticated" on public.lives
for select to authenticated using (true);

-- Une consultation par numero par membre (evite doublons admin)
create unique index if not exists consultations_user_number_unique_idx
  on public.consultations (user_id, number);
