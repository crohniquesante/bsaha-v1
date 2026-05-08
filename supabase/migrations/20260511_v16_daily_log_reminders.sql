create table if not exists public.daily_log_reminder_sent (
  user_id uuid not null references public.users(id) on delete cascade,
  calendar_date date not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, calendar_date)
);

create index if not exists idx_daily_log_reminder_date on public.daily_log_reminder_sent(calendar_date);

alter table public.daily_log_reminder_sent enable row level security;
