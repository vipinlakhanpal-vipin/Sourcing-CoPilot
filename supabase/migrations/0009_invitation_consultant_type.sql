alter table invitations
  add column if not exists custom_role_id uuid references custom_roles(id) on delete set null;
