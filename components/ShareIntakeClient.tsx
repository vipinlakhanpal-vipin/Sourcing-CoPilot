"use client";

import { useState, FormEvent } from "react";
import { IntakeArea, IntakeAnswers } from "@/lib/intake-schema";
import IntakeFlow from "./IntakeFlow";

interface Props {
  token: string;
  customerName: string;
  areas: IntakeArea[];
  initialAnswers: IntakeAnswers;
  initialStep: number;
  initialRespondentName: string | null;
}

export default function ShareIntakeClient({
  token,
  customerName,
  areas,
  initialAnswers,
  initialStep,
  initialRespondentName,
}: Props) {
  const [respondentKnown, setRespondentKnown] = useState(!!initialRespondentName);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleStart(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/share/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respondentName: name, respondentEmail: email || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not start the intake");
        return;
      }
      setRespondentKnown(true);
    } finally {
      setLoading(false);
    }
  }

  if (!respondentKnown) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-ink-800">Sourcing CoPilot</h1>
          <p className="mt-1 text-sm text-ink-400">
            {customerName} is scoping a Coupa Sourcing deployment. This should take about
            10 to 15 minutes. You can leave and come back any time using this same link.
          </p>
        </div>
        <form onSubmit={handleStart} className="space-y-4 rounded-lg border border-ink-100 bg-surface p-5">
          <div>
            <label className="block text-sm font-medium text-ink-700">Your name</label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700">Your email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Starting…" : "Start"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <IntakeFlow
      mode="share"
      apiBasePath={`/api/share/${token}`}
      customerName={customerName}
      areas={areas}
      initialAnswers={initialAnswers}
      initialStep={initialStep}
      initialStatus="in_progress"
    />
  );
}
