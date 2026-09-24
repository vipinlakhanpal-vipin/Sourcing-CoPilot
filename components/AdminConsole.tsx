"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: "standard" | "admin";
  created_at: string;
  last_login_at: string | null;
  last_login_city: string | null;
  last_login_country: string | null;
}

interface Overview {
  totalUsers: number;
  totalStandard: number;
  totalAdmin: number;
  users: Member[];
}

export default function AdminConsole({ myEmail }: { myEmail: string }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"standard" | "admin">("standard");
  const [sending, setSending] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const [roleBusyId, setRoleBusyId] = useState<string | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);

  async function loadOverview() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (res.ok) setOverview(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOverview();
  }, []);

  async function handleSetRole(member: Member, role: "standard" | "admin") {
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
      <h2 className="mb-3 font-display text-lg text-ink-800">Admin Console</h2>
      <p className="mb-4 max-w-2xl text-sm text-ink-500">
        Invite team members and see who&apos;s using the app — every user here has their own
        account (email + password), so this reflects real sign-ups and sign-ins.
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : (
        overview && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-ink-100 bg-brand-50 p-4 text-center">
                <div className="text-2xl font-bold text-ink-800">{overview.totalUsers}</div>
                <div className="mt-1 text-xs text-ink-500">Registered users</div>
              </div>
              <div className="rounded-xl border border-ink-100 bg-ink-50 p-4 text-center">
                <div className="text-2xl font-bold text-ink-800">
                  {overview.totalStandard}
                  <span className="mx-1 text-ink-300">/</span>
                  {overview.totalAdmin}
                </div>
                <div className="mt-1 text-xs text-ink-500">Standard / Admin</div>
              </div>
            </div>

            <div className="mb-6 overflow-x-auto rounded-xl border border-ink-100 bg-surface shadow-sm">
              <table className="min-w-full text-xs">
                <thead className="bg-ink-800 text-white">
                  <tr>
                    <th className="whitespace-nowrap p-2 text-left">Name</th>
                    <th className="whitespace-nowrap p-2 text-left">Email</th>
                    <th className="whitespace-nowrap p-2 text-left">Role</th>
                    <th className="whitespace-nowrap p-2 text-left">Joined</th>
                    <th className="whitespace-nowrap p-2 text-left">Last signed in</th>
                    <th className="whitespace-nowrap p-2 text-left">Location</th>
                    <th className="whitespace-nowrap p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-ink-400">
                        No one has signed up yet.
                      </td>
                    </tr>
                  ) : (
                    overview.users.map((m) => {
                      const location = [m.last_login_city, m.last_login_country].filter(Boolean).join(", ");
                      const isSelf = m.email === myEmail;
                      return (
                        <tr key={m.id} className="border-t border-ink-100">
                          <td className="whitespace-nowrap p-2 font-medium text-ink-800">{m.name || "—"}</td>
                          <td className="whitespace-nowrap p-2 text-ink-700">{m.email}</td>
                          <td className="whitespace-nowrap p-2">
                            {isSelf ? (
                              <span className={`role-badge ${m.role === "admin" ? "role-badge--admin" : ""}`}>
                                {m.role === "admin" ? "Admin" : "Standard"}
                              </span>
                            ) : (
                              <select
                                value={m.role}
                                disabled={roleBusyId === m.id}
                                onChange={(e) => handleSetRole(m, e.target.value as "standard" | "admin")}
                                className={`role-select-fill role-select-fill--${m.role} rounded-full px-2.5 py-1 text-[11px]`}
                              >
                                <option value="standard">Standard</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
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
                              className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-30"
                            >
                              Delete
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
            Applied automatically as soon as they sign up with this email.
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
          No automated email is sent yet — this creates the invitation record and gives you a
          message below to send them yourself.
        </p>
      </form>

      {inviteMessage && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
          <p className="mb-2 text-sm font-medium text-brand-700">
            Invitation created — copy this message to send them:
          </p>
          <pre className="whitespace-pre-wrap rounded-lg border border-ink-100 bg-surface p-3 text-xs text-ink-700">
            {inviteMessage}
          </pre>
        </div>
      )}
    </section>
  );
}
