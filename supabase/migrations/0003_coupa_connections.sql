-- Adds Coupa Test/Production connection storage to an already-deployed database.
-- Run this once in the Supabase SQL editor. Safe to re-run (idempotent).

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

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists coupa_connections_set_updated_at on coupa_connections;
create trigger coupa_connections_set_updated_at
  before update on coupa_connections
  for each row execute function set_updated_at();

alter table coupa_connections enable row level security;
