"use client";

import { useEffect, useState } from "react";
import { getStoredMode, setStoredMode, ThemeMode } from "@/lib/theme";
import AdminConsole from "./AdminConsole";

interface AccountInfo {
  name: string | null;
  email: string;
  role: string;
  createdAt: string | null;
  lastLoginAt: string | null;
  location: string;
}

const TABS = [
  { key: "account", label: "Account", adminOnly: false },
  { key: "appearance", label: "Appearance", adminOnly: false },
  { key: "admin", label: "Admin Console", adminOnly: true },
] as const;

function AccountSection({ account }: { account: AccountInfo }) {
  return (
    <section>
      <div className="max-w-lg rounded-xl border border-ink-100 bg-surface p-5 shadow-sm">
        <h2 className="font-display text-base text-ink-800">Account</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-ink-400">Name</dt>
            <dd className="text-ink-700">{account.name || "—"}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-400">Email</dt>
            <dd className="text-ink-700">{account.email}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-400">Role</dt>
            <dd>
              <span className={`role-badge ${account.role === "admin" ? "role-badge--admin" : ""}`}>
                {account.role === "admin" ? "Admin" : "Standard"}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-400">Member since</dt>
            <dd className="text-ink-700">
              {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-400">Last signed in</dt>
            <dd className="text-right text-ink-700">
              {account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : "—"}
              {account.location && <div className="text-xs text-ink-400">{account.location}</div>}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function AppearanceSection() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(getStoredMode());
  }, []);

  function chooseMode(next: ThemeMode) {
    setMode(next);
    setStoredMode(next);
  }

  return (
    <section>
      <div className="max-w-lg rounded-xl border border-ink-100 bg-surface p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-ink-800">Mode</h3>
        <p className="mb-4 text-xs text-ink-400">Personal display preference — saved in this browser only.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => chooseMode("light")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "light" ? "bg-ink-800 text-white" : "bg-ink-50 text-ink-500 hover:bg-ink-100"
            }`}
          >
            ☀ Light
          </button>
          <button
            type="button"
            onClick={() => chooseMode("dark")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "dark" ? "bg-ink-800 text-white" : "bg-ink-50 text-ink-500 hover:bg-ink-100"
            }`}
          >
            ☾ Dark
          </button>
        </div>
      </div>
    </section>
  );
}

export default function SettingsTabs({ account }: { account: AccountInfo }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("account");
  const isAdmin = account.role === "admin";
  const tabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-ink-800 text-white"
                : "border border-ink-100 bg-surface text-ink-500 hover:bg-ink-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "account" && <AccountSection account={account} />}
      {tab === "appearance" && <AppearanceSection />}
      {tab === "admin" && isAdmin && <AdminConsole myEmail={account.email} />}
    </>
  );
}
