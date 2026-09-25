"use client";

import { useEffect, useState } from "react";

interface CustomRole {
  id: string;
  name: string;
  created_at: string;
}

export default function RolesManager() {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/custom-roles", { cache: "no-store" });
      if (res.ok) setRoles((await res.json()).roles);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/custom-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create the role");
      setName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the role");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(role: CustomRole) {
    if (!confirm(`Delete the "${role.name}" role? Anyone assigned it will show "Not set" instead.`)) return;
    setDeletingId(role.id);
    try {
      const res = await fetch(`/api/admin/custom-roles/${role.id}`, { method: "DELETE" });
      if (res.ok) load();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <h2 className="field-title mb-3 text-sm">Roles</h2>
      <p className="mb-4 max-w-2xl text-sm text-ink-500">
        Consultant-type labels (Coupa Functional Consultant, Technical Consultant, Integration
        Consultant, QA Consultant, etc.) that can be assigned to any user from Admin Console.
        Adding or removing a role here is Super Admin only.
      </p>

      <form onSubmit={handleCreate} className="mb-6 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[220px]">
          <label className="mb-1 block text-sm font-medium text-ink-700">New role name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Coupa Functional Consultant"
            className="field-fill w-full rounded-md px-3 py-2 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {creating ? "Adding…" : "+ Add role"}
        </button>
      </form>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : roles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-200 bg-surface p-6 text-center text-sm text-ink-400">
          No roles defined yet. Add one above (e.g. Coupa Functional Consultant).
        </div>
      ) : (
        <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100 bg-surface shadow-sm">
          {roles.map((role) => (
            <li key={role.id} className="flex items-center justify-between px-4 py-3">
              <span className="role-badge role-badge--admin text-[11px]">{role.name}</span>
              <button
                onClick={() => handleDelete(role)}
                disabled={deletingId === role.id}
                className="icon-btn icon-btn--delete"
                title="Delete role"
                aria-label="Delete role"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <path d="M4 6h12M8 6V4h4v2m-6 0 .6 10.2a1 1 0 0 0 1 .8h4.8a1 1 0 0 0 1-.8L14 6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
