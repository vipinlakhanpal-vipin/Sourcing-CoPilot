"use client";

import { useState } from "react";
import Link from "next/link";
import StartIntakeButton from "./StartIntakeButton";
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

type ConnectionSummary = {
  instanceBaseUrl: string;
  clientId: string;
  lastTestedAt: string | null;
} | null;

const PRIMARY_TABS = [
  { key: "overview", label: "Overview" },
  { key: "sessions", label: "Intake Sessions" },
  { key: "coupa", label: "Coupa Connection" },
] as const;

type PrimaryTab = (typeof PRIMARY_TABS)[number]["key"];

function SessionActions({ session, resultsPath }: { session: IntakeSession; resultsPath: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {session.status !== "completed" && <CopyShareLinkButton token={session.share_token} />}
      {session.status === "completed" ? (
        <>
          <Link
            href={resultsPath}
            className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            View config package
          </Link>
          <Link
            href={`/intake/${session.id}`}
            className="rounded-md bg-slate-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600"
          >
            Edit answers
          </Link>
        </>
      ) : (
        <Link
          href={`/intake/${session.id}`}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Continue intake →
        </Link>
      )}
    </div>
  );
}

export default function ProjectDetailTabs({
  customerId,
  intakeSessions,
  connection,
}: {
  customerId: string;
  intakeSessions: IntakeSession[];
  connection: ConnectionSummary;
}) {
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>("overview");
  const [activeSessionId, setActiveSessionId] = useState(intakeSessions[0]?.id ?? null);
  const activeSession = intakeSessions.find((s) => s.id === activeSessionId) ?? intakeSessions[0] ?? null;
  const mostRecent = intakeSessions[0] ?? null;

  return (
    <div>
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
      <div className="primary-tab-divider" />

      {primaryTab === "sessions" && intakeSessions.length > 1 && (
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
        {primaryTab === "overview" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-ink-100">
              <div className="strip-carbon panel-head">Intake Session</div>
              <div className="space-y-3 bg-surface p-4">
                {mostRecent ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-400">Started</span>
                      <span className="font-medium text-ink-700">
                        {new Date(mostRecent.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-400">Status</span>
                      <span
                        className={`status-pill ${
                          mostRecent.status === "completed" ? "status-pill--active" : "status-pill--pending"
                        }`}
                      >
                        {mostRecent.status === "completed" ? "Completed" : "In progress"}
                      </span>
                    </div>
                    {mostRecent.respondent_name && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink-400">Filled in by</span>
                        <span className="font-medium text-ink-700">{mostRecent.respondent_name}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <SessionActions session={mostRecent} resultsPath={`/intake/${mostRecent.id}/results`} />
                      <StartIntakeButton customerId={customerId} />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-ink-400">No intake session yet.</p>
                    <StartIntakeButton customerId={customerId} />
                  </>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-brand-200">
              <div className="panel-head panel-head--teal">Coupa Test Connection</div>
              <div className="space-y-3 bg-surface p-4">
                {connection ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-400">Instance</span>
                      <span className="truncate font-medium text-ink-700">{connection.instanceBaseUrl}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-400">Client ID</span>
                      <span className="truncate font-medium text-ink-700">{connection.clientId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-400">Last tested</span>
                      <span className="font-medium text-ink-700">
                        {connection.lastTestedAt ? new Date(connection.lastTestedAt).toLocaleString() : "Never"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-ink-400">Not connected yet.</p>
                )}
                <button
                  onClick={() => setPrimaryTab("coupa")}
                  className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  {connection ? "Manage connection" : "Set up connection"}
                </button>
              </div>
            </div>
          </div>
        )}

        {primaryTab === "sessions" && (
          <div className="space-y-4">
            {intakeSessions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-ink-200 bg-surface p-6 text-center text-sm text-ink-400">
                No intake sessions yet.
              </div>
            ) : (
              activeSession && (
                <div className="rounded-lg border border-ink-100 bg-surface p-4">
                  <p className="text-sm font-medium text-ink-800">
                    Started {new Date(activeSession.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-ink-400">
                    {activeSession.status.replace("_", " ")}
                    {activeSession.respondent_name && ` · filled in by ${activeSession.respondent_name}`}
                  </p>
                  <div className="mt-3">
                    <SessionActions session={activeSession} resultsPath={`/intake/${activeSession.id}/results`} />
                  </div>
                </div>
              )
            )}
            <StartIntakeButton customerId={customerId} />
          </div>
        )}

        {primaryTab === "coupa" && <CoupaConnectionCard customerId={customerId} />}
      </div>
    </div>
  );
}
