alter table users
  add column if not exists role text not null default 'standard' check (role in ('standard', 'admin'));

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null default 'standard' check (role in ('standard', 'admin')),
  created_at timestamptz not null default now()
);

alter table invitations enable row level security;

-- Everyone defaults to 'standard'. Run this once, with your own Sourcing
-- CoPilot login email, to see the Admin Console under Settings:
-- update users set role = 'admin' where email = 'you@example.com';
