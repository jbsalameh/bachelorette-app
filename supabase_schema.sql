-- Run this entire script in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)

-- Members table
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

-- Expenses table
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric(10,2) not null,
  paid_by text not null,
  split_with text[] not null default '{}',
  cat text default '🍽️',
  date text,
  created_at timestamptz default now()
);

-- Allow anonymous read/write (public trip, no accounts needed)
alter table members enable row level security;
alter table expenses enable row level security;

create policy "Public read members" on members for select using (true);
create policy "Public insert members" on members for insert with check (true);
create policy "Public delete members" on members for delete using (true);

create policy "Public read expenses" on expenses for select using (true);
create policy "Public insert expenses" on expenses for insert with check (true);
create policy "Public delete expenses" on expenses for delete using (true);

-- Enable Realtime for live updates
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table expenses;
