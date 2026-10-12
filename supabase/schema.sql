-- Rumbo cloud sync schema. Run this once in the Supabase project's
-- SQL Editor (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- One row per user, holding their entire app state as JSON — the same
-- shape as a local backup export (see lib/storage.js / IMPORT_STATE).
-- Row Level Security means a user can only ever read or write their own
-- row, even though the anon key embedded in the app is public.

create table if not exists public.rumbo_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.rumbo_state enable row level security;

create policy "Users can read their own state"
  on public.rumbo_state for select
  using (auth.uid() = user_id);

create policy "Users can insert their own state"
  on public.rumbo_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own state"
  on public.rumbo_state for update
  using (auth.uid() = user_id);
