-- Adds the customer-facing self-service share link to an already-deployed database.
-- Run this once in the Supabase SQL editor. Safe to re-run (idempotent).

alter table intake_sessions
  add column if not exists share_token uuid not null default gen_random_uuid() unique,
  add column if not exists respondent_name text,
  add column if not exists respondent_email text;

create index if not exists intake_sessions_share_token_idx on intake_sessions(share_token);
