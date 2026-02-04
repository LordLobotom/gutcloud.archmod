-- Supabase schema for Archmod
-- Run in the Supabase SQL editor

create table if not exists public.entities (
  id text primary key,
  type text not null,
  name text not null,
  description text not null default '',
  status text not null,
  owner text not null default '',
  criticality text not null default 'medium',
  tags jsonb not null default '[]',
  metadata jsonb not null default '{}',
  children jsonb,
  zone_id text,
  position jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.relationships (
  id text primary key,
  from_entity_id text not null references public.entities(id) on delete cascade,
  to_entity_id text not null references public.entities(id) on delete cascade,
  type text not null,
  bidirectional boolean not null default false,
  strength text not null default 'normal',
  notes text,
  crosses_zone boolean,
  from_zone text,
  to_zone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: update timestamps
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists entities_updated_at
before update on public.entities
for each row execute function public.set_updated_at();

create trigger if not exists relationships_updated_at
before update on public.relationships
for each row execute function public.set_updated_at();

-- Enable Row Level Security (adjust policies to your needs)
-- alter table public.entities enable row level security;
-- alter table public.relationships enable row level security;

-- Example policy to allow authenticated users full access
-- create policy "Entities full access" on public.entities
-- for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- create policy "Relationships full access" on public.relationships
-- for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
