-- Create table macro_data
create table if not exists public.macro_data (
  metric text primary key,
  value numeric not null,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.macro_data enable row level security;

-- RLS Policies
-- 1. Allow public (anon & authenticated) to SELECT records
create policy "Allow public SELECT on macro_data"
  on public.macro_data
  for select
  to anon, authenticated
  using (true);

-- 2. Allow service_role (backend Edge Functions) to perform all operations (INSERT/UPDATE/DELETE)
create policy "Allow service_role write operations on macro_data"
  on public.macro_data
  for all
  to service_role
  using (true)
  with check (true);
