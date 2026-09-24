"use client";

import { useEffect, useState, FormEvent } from "react";

interface ConnectionInfo {
  environment: string;
  instanceBaseUrl: string;
  clientId: string;
  scope: string | null;
  lastTestedAt: string | null;
  lastTestOk: boolean | null;
  lastTestMessage: string | null;
}

export default function CoupaConnectionCard({ customerId }: { customerId: string }) {
  const [connection, setConnection] = useState<ConnectionInfo | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [instanceBaseUrl, setInstanceBaseUrl] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [scope, setScope] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean | null; message: string | null } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/customers/${customerId}/coupa-connection`)
      .then((res) => res.json())
      .then((data) => {
        const test = (data.connections ?? []).find((c: ConnectionInfo) => c.environment === "test");
        setConnection(test ?? null);
        if (test) {
          setInstanceBaseUrl(test.instanceBaseUrl);
          setClientId(test.clientId);
          setScope(test.scope ?? "");
          setTestResult(
            test.lastTestedAt ? { ok: test.lastTestOk, message: test.lastTestMessage } : null
          );
        }
      })
      .catch(() => setConnection(null));
  }, [customerId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/coupa-connection`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment: "test",
          instanceBaseUrl,
          clientId,
          clientSecret,
          scope: scope || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save the connection");
        return;
      }
      setConnection({
        environment: "test",
        instanceBaseUrl,
        clientId,
        scope: scope || null,
        lastTestedAt: null,
        lastTestOk: null,
        lastTestMessage: null,
      });
      setTestResult(null);
      setClientSecret("");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setError(null);
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/customers/${customerId}/coupa-connection/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment: "test" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not test the connection");
        return;
      }
      setTestResult(data);
    } finally {
      setTesting(false);
    }
  }

  if (connection === undefined) return null;

  const showForm = editing || connection === null;

  return (
    <div className="rounded-lg border border-ink-100 bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-800">Coupa Test connection</h2>
        {connection && !editing && (
          <button onClick={() => setEditing(true)} className="text-xs font-medium text-ink-400 hover:text-ink-800">
            Edit
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-400">
        OAuth2 client-credentials connection to the customer&apos;s Coupa Test tenant. Nothing is
        pushed automatically — this only enables the connector once you choose to use it.
      </p>

      {!showForm && connection && (
        <div className="mt-4 space-y-2 text-sm">
          <p>
            <span className="text-ink-400">Instance: </span>
            {connection.instanceBaseUrl}
          </p>
          <p>
            <span className="text-ink-400">Client ID: </span>
            {connection.clientId}
          </p>
          <button
            onClick={handleTest}
            disabled={testing}
            className="mt-2 rounded-md border border-ink-200 bg-surface px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-60"
          >
            {testing ? "Testing…" : "Test connection"}
          </button>
          {testResult && (
            <p className={`text-sm ${testResult.ok ? "text-emerald-700" : "text-red-600"}`}>
              {testResult.message}
            </p>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-700">Instance base URL</label>
            <input
              required
              value={instanceBaseUrl}
              onChange={(e) => setInstanceBaseUrl(e.target.value)}
              placeholder="https://customername-test.coupahost.com"
              className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700">OAuth2 client ID</label>
            <input
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700">OAuth2 client secret</label>
            <input
              required={!connection}
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder={connection ? "Leave blank to keep the saved secret" : ""}
              className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700">Scope (optional)</label>
            <input
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="As configured on the OAuth2 client in Coupa Setup"
              className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save connection"}
            </button>
            {connection && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-400 hover:text-ink-800"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
