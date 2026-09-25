"use client";

import { useEffect, useState } from "react";

type PermissionRole = "standard" | "admin" | "super_admin";

interface CustomRole {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: PermissionRole;
  custom_role_id: string | null;
  custom_role_name: string | null;
  created_at: string;
  last_login_at: string | null;
  last_login_city: string | null;
  last_login_country: string | null;
}

interface Overview {
  totalUsers: number;
  totalStandard: number;
  totalAdmin: number;
  totalSuperAdmin: number;
  users: Member[];
}

const ROLE_LABEL: Record<PermissionRole, string> = {
  standard: "Standard",
  admin: "Admin",
  super_admin: "Super Admin",
};

export default function AdminConsole({ myEmail, myRole }: { myEmail: string; myRole: PermissionRole }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"standard" | "admin">("standard");
  const [sending, setSending] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const [roleBusyId, setRoleBusyId] = useState<string | null>(null);
  const [consultantBusyId, setConsultantBusyId] = useState<string | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);

  const canGrantSuperAdmin = myRole === "super_admin";

  async function loadOverview() {
    setLoading(true);
    try {
      const [overviewRes, rolesRes] = await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch("/api/admin/custom-roles", { cache: "no-store" }),
      ]);
      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (rolesRes.ok) setRoles((await rolesRes.json()).roles);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOverview();
  }, []);

  async function handleSetRole(member: Member, role: PermissionRole) {
    if (role === member.role) return;
    setRoleBusyId(member.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: member.email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update role");
      loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role");
    } finally {
      setRoleBusyId(null);
    }
  }

  async function handleAssignConsultantRole(member: Member, customRoleId: string) {
    setConsultantBusyId(member.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/assign-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.id, customRoleId: customRoleId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not assign the role");
      loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not assign the role");
    } finally {
      setConsultantBusyId(null);
    }
  }

  async function handleDelete(member: Member) {
    if (!confirm(`Delete the account for "${member.email}"? This cannot be undone.`)) return;
    setDeleteBusyId(member.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${member.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete the user");
      loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the user");
    } finally {
      setDeleteBusyId(null);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInviteMessage(null);
    setSending(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create the invitation");
      setInviteMessage(data.message);
      setName("");
      setEmail("");
      setInviteRole("standard");
      loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the invitation");
    } finally {
      setSending(false);
    }
  }

  return (
    <section>
      <h2 className="field-title mb-3 text-sm">Admin Console</h2>
      <p className="mb-4 max-w-2xl text-sm text-ink-500">
        Invite team members and see who&apos;s using the app. Every user here has their own
        account (email + password), so this reflects real sign-ups and sign-ins. Consultant type
        (Coupa Functional, Technical, Integration, QA, etc.) is defined under{" "}
        <span className="font-semibold text-ink-700">Settings → Roles</span>.
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : (
        overview && (
          <>
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-ink-100 bg-brand-50 p-4 text-center">
                <div className="text-2xl font-bold text-ink-800">{overview.totalUsers}</div>
                <div className="mt-1 text-xs text-ink-500">Registered users</div>
              </div>
              <div className="rounded-xl border border-ink-100 bg-ink-50 p-4 text-center">
                <div className="text-2xl font-bold text-ink-800">{overview.totalStandard}</div>
                <div className="mt-1 text-xs text-ink-500">Standard</div>
              </div>
              <div className="rounded-xl border border-ink-100 bg-ink-50 p-4 text-center">
                <div className="text-2xl font-bold text-ink-800">
                  {overview.totalAdmin}
                  <span className="mx-1 text-ink-300">/</span>
                  {overview.totalSuperAdmin}
                </div>
                <div className="mt-1 text-xs text-ink-500">Admin / Super Admin</div>
              </div>
            </div>

            <div className="mb-6 overflow-x-auto rounded-xl border border-ink-100 bg-surface shadow-sm">
              <table className="min-w-full text-xs">
                <thead className="bg-ink-800 text-white">
                  <tr>
                    <th className="whitespace-nowrap p-2 text-left">Name</th>
                    <th className="whitespace-nowrap p-2 text-left">Email</th>
                    <th className="whitespace-nowrap p-2 text-left">Role</th>
                    <th className="whitespace-nowrap p-2 text-left">Consultant type</th>
                    <th className="whitespace-nowrap p-2 text-left">Joined</th>
                    <th className="whitespace-nowrap p-2 text-left">Last signed in</th>
                    <th className="whitespace-nowrap p-2 text-left">Location</th>
                    <th className="whitespace-nowrap p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-ink-400">
                        No one has signed up yet.
                      </td>
                    </tr>
                  ) : (
                    overview.users.map((m) => {
                      const location = [m.last_login_city, m.last_login_country].filter(Boolean).join(", ");
                      const isSelf = m.email === myEmail;
                      const badgeClass =
                        m.role === "super_admin" ? "role-badge--super" : m.role === "admin" ? "role-badge--admin" : "";
                      return (
                        <tr key={m.id} className="border-t border-ink-100">
                          <td className="whitespace-nowrap p-2 font-medium text-ink-800">{m.name || "—"}</td>
                          <td className="whitespace-nowrap p-2 text-ink-700">{m.email}</td>
                          <td className="whitespace-nowrap p-2">
                            {isSelf || (m.role === "super_admin" && !canGrantSuperAdmin) ? (
                              <span className={`role-badge ${badgeClass}`}>{ROLE_LABEL[m.role]}</span>
                            ) : (
                              <select
                                value={m.role}
                                disabled={roleBusyId === m.id}
                                onChange={(e) => handleSetRole(m, e.target.value as PermissionRole)}
                                className={`role-select-fill role-select-fill--${m.role} rounded-full px-2.5 py-1 text-[11px]`}
                              >
                                <option value="standard">Standard</option>
                                <option value="admin">Admin</option>
                                {canGrantSuperAdmin && <option value="super_admin">Super Admin</option>}
                              </select>
                            )}
                          </td>
                          <td className="whitespace-nowrap p-2">
                            <select
                              value={m.custom_role_id ?? ""}
                              disabled={consultantBusyId === m.id}
                              onChange={(e) => handleAssignConsultantRole(m, e.target.value)}
                              className="field-fill rounded-md px-2 py-1 text-[11px]"
                            >
                              <option value="">— Not set —</option>
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="whitespace-nowrap p-2 text-ink-500">
                            {new Date(m.created_at).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap p-2 text-ink-500">
                            {m.last_login_at ? new Date(m.last_login_at).toLocaleString() : "Never"}
                          </td>
                          <td className="whitespace-nowrap p-2 text-ink-500">{location || "—"}</td>
                          <td className="whitespace-nowrap p-2">
                            <button
                              onClick={() => handleDelete(m)}
                              disabled={isSelf || deleteBusyId === m.id}
                              title={isSelf ? "You can't delete your own account" : "Delete user"}
                              className="icon-btn icon-btn--delete"
                              aria-label="Delete user"
                            >
                              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                                <path d="M4 6h12M8 6V4h4v2m-6 0 .6 10.2a1 1 0 0 0 1 .8h4.8a1 1 0 0 0 1-.8L14 6" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )
      )}

      <h3 className="mb-3 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
        Invite a team member
      </h3>
      <form onSubmit={handleInvite} className="mb-4 space-y-3 rounded-xl border border-ink-100 bg-surface p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Name</label>
          <input
            className="invite-field-fill w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
          <input
            type="email"
            className="invite-field-fill w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Role</label>
          <select
            className={`role-select-fill role-select-fill--${inviteRole} w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500`}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "standard" | "admin")}
          >
            <option value="standard">Standard</option>
            <option value="admin">Admin</option>
          </select>
          <p className="mt-1 text-xs text-ink-400">
            Applied automatically as soon as they sign up with this email. Super Admin is granted
            separately, from the table above.
          </p>
        </div>
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-brand-600 px-5 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {sending ? "Creating…" : "Create Invitation"}
        </button>
        <p className="text-xs text-ink-400">
          No automated email is sent yet. This creates the invitation record and gives you a
          message below to send them yourself.
        </p>
      </form>

      {inviteMessage && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
          <p className="mb-2 text-sm font-medium text-brand-700">
            Invitation created. Copy this message to send them:
          </p>
          <pre className="whitespace-pre-wrap rounded-lg border border-ink-100 bg-surface p-3 text-xs text-ink-700">
            {inviteMessage}
          </pre>
        </div>
      )}
    </section>
  );
}
