"use client";

import { useState } from "react";
import Link from "next/link";
import CopyShareLinkButton from "./CopyShareLinkButton";
import CoupaConnectionCard from "./CoupaConnectionCard";

interface IntakeSession {
  id: string;
  status: "in_progress" | "completed";
  current_step: number;
  created_at: string;
  completed_at: string | null;
  share_token: string;
  respondent_name: string | null;
}

const PRIMARY_TABS = [
  { key: "session", label: "Intake Session" },
  { key: "coupa", label: "Coupa Connection" },
] as const;

type PrimaryTab = (typeof PRIMARY_TABS)[number]["key"];

export default function ProjectDetailTabs({
  customerId,
  intakeSessions,
}: {
  customerId: string;
  intakeSessions: IntakeSession[];
}) {
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>("session");
  const [activeSessionId, setActiveSessionId] = useState(intakeSessions[0]?.id ?? null);
  const activeSession = intakeSessions.find((s) => s.id === activeSessionId) ?? intakeSessions[0] ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {PRIMARY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPrimaryTab(tab.key)}
              className={`primary-tab ${primaryTab === tab.key ? "primary-tab--active" : "hover:text-ink-800"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSession && activeSession.status !== "completed" && (
            <CopyShareLinkButton token={activeSession.share_token} />
          )}
          {activeSession &&
            (activeSession.status === "completed" ? (
              <>
                <Link
                  href={`/intake/${activeSession.id}/results`}
                  className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  View config package
                </Link>
                <Link
                  href={`/intake/${activeSession.id}`}
                  className="rounded-md bg-slate-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600"
                >
                  Edit answers
                </Link>
              </>
            ) : (
              <Link
                href={`/intake/${activeSession.id}`}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Continue intake →
              </Link>
            ))}
        </div>
      </div>
      <div className="primary-tab-divider" />

      {primaryTab === "session" && intakeSessions.length > 1 && (
        <div className="mt-3 flex gap-6 border-b border-ink-100 pb-0">
          {intakeSessions.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`sub-tab ${activeSession?.id === s.id ? "sub-tab--active" : "hover:text-ink-700"}`}
            >
              Session {intakeSessions.length - i}
            </button>
          ))}
        </div>
      )}

      <div className="pt-5">
        {primaryTab === "session" &&
          (activeSession ? (
            <div className="overflow-hidden rounded-xl border border-ink-100">
              <div className="strip-carbon panel-head flex items-center justify-between">
                <span>Intake Session</span>
                {activeSession.respondent_name ? (
                  <span className="fill-badge fill-badge--customer">
                    🏢 Filled in by {activeSession.respondent_name} (Customer)
                  </span>
                ) : (
                  <span className="fill-badge fill-badge--consultant">👤 Filled in by you (Consultant)</span>
                )}
              </div>
              <div className="space-y-3 bg-surface p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-400">Started</span>
                  <span className="font-medium text-ink-700">
                    {new Date(activeSession.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-400">Status</span>
                  <span
                    className={`status-pill ${
                      activeSession.status === "completed" ? "status-pill--active" : "status-pill--pending"
                    }`}
                  >
                    {activeSession.status === "completed" ? "Completed" : "In progress"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-ink-200 bg-surface p-6 text-center text-sm text-ink-400">
              No intake session yet — click &quot;Start new intake session&quot; above.
            </div>
          ))}

        {primaryTab === "coupa" && <CoupaConnectionCard customerId={customerId} />}
      </div>
    </div>
  );
}
