-- Inscriptions lead magnet (capture email, pas d acces RLS public: service role uniquement)
create table if not exists public.lead_magnet_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'stopper_crise',
  created_at timestamptz not null default now()
);

create unique index if not exists lead_magnet_submissions_email_source_idx
  on public.lead_magnet_submissions (lower(trim(email)), source);

alter table public.lead_magnet_submissions enable row level security;

-- Rappel envoye 1h avant chaque live (un envoi par live)
create table if not exists public.live_reminders (
  live_id uuid primary key references public.lives(id) on delete cascade,
  sent_at timestamptz not null default now()
);

alter table public.live_reminders enable row level security;
