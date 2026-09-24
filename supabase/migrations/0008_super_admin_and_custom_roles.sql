alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role in ('standard', 'admin', 'super_admin'));

alter table users add column if not exists location text;

create table if not exists custom_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table users add column if not exists custom_role_id uuid references custom_roles(id) on delete set null;

alter table custom_roles enable row level security;

-- Run this once, with your own Sourcing CoPilot login email, to become Super Admin:
-- update users set role = 'super_admin' where email = 'you@example.com';
