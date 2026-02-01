-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Users (profile) tied to Supabase Auth users
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  name text,
  email text,
  created_at timestamptz default now()
);

create index if not exists users_org_id_idx on users(org_id);

-- Tracked regions
create table if not exists tracked_regions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  geojson jsonb not null,
  created_at timestamptz default now()
);

create index if not exists tracked_regions_org_id_idx on tracked_regions(org_id);

-- Storm events
create table if not exists storm_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  provider text not null,
  type text not null check (type in ('hail', 'wind')),
  start_time timestamptz not null,
  end_time timestamptz not null,
  severity_score integer not null,
  created_at timestamptz default now()
);

create index if not exists storm_events_org_id_idx on storm_events(org_id);
create index if not exists storm_events_start_time_idx on storm_events(start_time);

-- Storm polygons
create table if not exists storm_polygons (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  storm_event_id uuid not null references storm_events(id) on delete cascade,
  geojson jsonb not null,
  max_hail_size numeric,
  max_wind_speed numeric,
  created_at timestamptz default now()
);

create index if not exists storm_polygons_org_id_idx on storm_polygons(org_id);
create index if not exists storm_polygons_event_id_idx on storm_polygons(storm_event_id);

-- Reports
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  storm_event_id uuid not null references storm_events(id) on delete cascade,
  address text not null,
  lat numeric not null,
  lon numeric not null,
  impacted boolean not null default false,
  distance_to_polygon_m numeric,
  pdf_path text,
  created_by_user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

create index if not exists reports_org_id_idx on reports(org_id);
create index if not exists reports_event_id_idx on reports(storm_event_id);

-- Row Level Security
alter table organizations enable row level security;
alter table users enable row level security;
alter table tracked_regions enable row level security;
alter table storm_events enable row level security;
alter table storm_polygons enable row level security;
alter table reports enable row level security;

-- Helper: current user's org_id
create or replace function current_org_id()
returns uuid
language sql
stable
as $$
  select org_id from users where id = auth.uid()
$$;

-- RLS Policies
create policy "Org members can read org" on organizations
  for select using (id = current_org_id());

create policy "Users can read own profile" on users
  for select using (id = auth.uid());

create policy "Users can update own profile" on users
  for update using (id = auth.uid());

create policy "Org members manage tracked regions" on tracked_regions
  for all using (org_id = current_org_id()) with check (org_id = current_org_id());

create policy "Org members manage storm events" on storm_events
  for all using (org_id = current_org_id()) with check (org_id = current_org_id());

create policy "Org members manage storm polygons" on storm_polygons
  for all using (org_id = current_org_id()) with check (org_id = current_org_id());

create policy "Org members manage reports" on reports
  for all using (org_id = current_org_id()) with check (org_id = current_org_id());
