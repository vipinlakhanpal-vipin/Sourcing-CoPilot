-- Adds last-login location tracking for the profile menu.
-- Run this once in the Supabase SQL editor. Safe to re-run (idempotent).

alter table users
  add column if not exists last_login_at timestamptz,
  add column if not exists last_login_city text,
  add column if not exists last_login_country text;
