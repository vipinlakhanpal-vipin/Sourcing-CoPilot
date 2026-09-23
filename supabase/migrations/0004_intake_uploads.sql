-- Adds master-data file upload tracking to an already-deployed database.
-- Run this once in the Supabase SQL editor. Safe to re-run (idempotent).
--
-- Also create a Storage bucket named "intake-uploads" (private) in the
-- Supabase dashboard: Storage -> New bucket -> name "intake-uploads",
-- Public bucket: OFF.

create table if not exists intake_uploads (
  id uuid primary key default gen_random_uuid(),
  intake_session_id uuid not null references intake_sessions(id) on delete cascade,
  area_id text not null,
  field_id text not null,
  file_name text not null,
  storage_path text not null,
  size_bytes bigint not null,
  uploaded_at timestamptz not null default now()
);

create index if not exists intake_uploads_session_idx on intake_uploads(intake_session_id);

alter table intake_uploads enable row level security;
