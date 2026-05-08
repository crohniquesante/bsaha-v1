create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now(),
  consent_signed_at timestamptz,
  consent_ip_address text,
  stripe_customer_id text,
  access_active boolean not null default false
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  bristol_type smallint not null check (bristol_type between 1 and 7),
  stool_count text not null,
  pain_level smallint not null check (pain_level between 0 and 5),
  fatigue text not null,
  mood text not null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.calendar_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  module text not null,
  description text not null,
  bunny_video_id text not null,
  duration_sec integer not null,
  order_index integer not null,
  is_bonus boolean not null default false
);

create table if not exists public.video_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  watched_percent integer not null default 0 check (watched_percent between 0 and 100),
  is_complete boolean not null default false,
  personal_note text,
  updated_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create table if not exists public.ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  storage_path text not null,
  is_free boolean not null default false,
  order_index integer not null
);

create table if not exists public.ebook_downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  ebook_id uuid not null references public.ebooks(id) on delete cascade,
  downloaded_at timestamptz not null default now()
);

create index if not exists idx_daily_logs_user_date on public.daily_logs(user_id, date desc);
create index if not exists idx_calendar_notes_user_date on public.calendar_notes(user_id, date desc);
create index if not exists idx_videos_slug on public.videos(slug);
create index if not exists idx_video_progress_user on public.video_progress(user_id);
create index if not exists idx_ebook_downloads_user on public.ebook_downloads(user_id);

alter table public.users enable row level security;
alter table public.daily_logs enable row level security;
alter table public.calendar_notes enable row level security;
alter table public.video_progress enable row level security;
alter table public.ebook_downloads enable row level security;

create policy "users_select_own" on public.users
for select using (auth.uid() = id);
create policy "users_update_own" on public.users
for update using (auth.uid() = id);

create policy "daily_logs_all_own" on public.daily_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "calendar_notes_all_own" on public.calendar_notes
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "video_progress_all_own" on public.video_progress
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ebook_downloads_all_own" on public.ebook_downloads
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.videos enable row level security;
alter table public.ebooks enable row level security;
create policy "videos_read_all" on public.videos for select using (true);
create policy "ebooks_read_all" on public.ebooks for select using (true);
