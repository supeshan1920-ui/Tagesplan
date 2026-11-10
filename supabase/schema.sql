-- Tagesplan — Supabase schema
--
-- Design choice: one row per (user, feature) instead of one table per
-- feature. Each row's `data` is a JSONB blob the client reads/writes whole.
-- Reasoning: the feature set here (tasks, notes, calendar entries, habits,
-- zeitrechner log, settings) is still evolving fast — a JSONB-per-feature
-- row means new fields inside a feature never need a migration, while RLS
-- still cleanly isolates data per user at the row level. If a feature later
-- needs real relational queries (e.g. filtering/joining calendar entries
-- server-side at scale), split that one feature out into its own proper
-- table — the others can stay as they are.
--
-- Run this once in the Supabase SQL editor for a fresh project.

create table if not exists public.app_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (key in (
    'profile', 'theme', 'zeitrechner', 'calendar', 'tasks', 'notes', 'habits', 'focus', 'pausenzeiten', 'blockzeiten'
  )),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.app_data enable row level security;

create policy "Users read their own data"
  on public.app_data for select
  using (auth.uid() = user_id);

create policy "Users insert their own data"
  on public.app_data for insert
  with check (auth.uid() = user_id);

create policy "Users update their own data"
  on public.app_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete their own data"
  on public.app_data for delete
  using (auth.uid() = user_id);

-- Keep updated_at current on every write.
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger app_data_touch_updated_at
  before update on public.app_data
  for each row execute function public.touch_updated_at();
