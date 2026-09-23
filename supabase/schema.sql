-- Sourcing CoPilot schema
-- Run this in the Supabase SQL editor (or `supabase db push`) against a fresh project.
-- All access goes through Next.js API routes using the service_role key, so RLS is
-- enabled with no policies: the anon key alone can read/write nothing.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users: self-service email+password auth, not Supabase Auth
-- ---------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- customers: one row per customer/opportunity
-- ---------------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  name text not null,
  notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_owner_id_idx on customers(owner_id);

-- ---------------------------------------------------------------------------
-- intake_sessions: a customer's in-progress or completed answers to the
-- 7-area intake question set. `answers` is keyed by area id, e.g.
-- { "spend_categories": { "categories": [...], ... }, "event_types": {...} }
-- ---------------------------------------------------------------------------
create table if not exists intake_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  current_step int not null default 1,
  answers jsonb not null default '{}'::jsonb,
  -- Unguessable token for the customer-facing self-service link (/share/<token>).
  -- Distinct from `id` so the internal id shown in rep-facing URLs is never the
  -- same value handed to a customer.
  share_token uuid not null default gen_random_uuid() unique,
  respondent_name text,
  respondent_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists intake_sessions_customer_id_idx on intake_sessions(customer_id);
create index if not exists intake_sessions_share_token_idx on intake_sessions(share_token);

-- ---------------------------------------------------------------------------
-- config_packages: generated structured output per completed intake session
-- ---------------------------------------------------------------------------
create table if not exists config_packages (
  id uuid primary key default gen_random_uuid(),
  intake_session_id uuid not null references intake_sessions(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  summary_markdown text not null,
  structured_data jsonb not null,
  flags jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);

create index if not exists config_packages_intake_session_id_idx on config_packages(intake_session_id);
create index if not exists config_packages_customer_id_idx on config_packages(customer_id);

-- ---------------------------------------------------------------------------
-- coupa_connections: one Coupa tenant connection per customer per environment.
-- client_secret is encrypted at rest (see lib/crypto.ts) — this table never
-- holds a plaintext secret, and only server-side code with the service_role
-- key and COUPA_CREDENTIAL_ENCRYPTION_KEY can decrypt it.
-- ---------------------------------------------------------------------------
create table if not exists coupa_connections (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  environment text not null default 'test' check (environment in ('test', 'production')),
  instance_hostname text not null,
  client_id text not null,
  encrypted_client_secret text not null,
  scope text,
  last_tested_at timestamptz,
  last_test_ok boolean,
  last_test_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, environment)
);

create index if not exists coupa_connections_customer_id_idx on coupa_connections(customer_id);

-- ---------------------------------------------------------------------------
-- updated_at bookkeeping
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists customers_set_updated_at on customers;
create trigger customers_set_updated_at
  before update on customers
  for each row execute function set_updated_at();

drop trigger if exists intake_sessions_set_updated_at on intake_sessions;
create trigger intake_sessions_set_updated_at
  before update on intake_sessions
  for each row execute function set_updated_at();

drop trigger if exists coupa_connections_set_updated_at on coupa_connections;
create trigger coupa_connections_set_updated_at
  before update on coupa_connections
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: deny-by-default. All reads/writes happen server-side with the
-- service_role key, which bypasses RLS entirely.
-- ---------------------------------------------------------------------------
alter table users enable row level security;
alter table customers enable row level security;
alter table intake_sessions enable row level security;
alter table config_packages enable row level security;
alter table coupa_connections enable row level security;
