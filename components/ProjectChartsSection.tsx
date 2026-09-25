"use client";

import { useState } from "react";
import Link from "next/link";

export interface ProjectChartData {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  stepsCompleted: number;
  totalSteps: number;
  coupaConnected: boolean;
}

function StatusPill({ status }: { status: ProjectChartData["status"] }) {
  const label = status === "active" ? "Active" : status === "pending" ? "Pending" : "Inactive";
  return <span className={`status-pill status-pill--${status}`}>● {label}</span>;
}

export default function ProjectChartsSection({ projects }: { projects: ProjectChartData[] }) {
  const [mode, setMode] = useState<"h" | "v">("h");

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-ink-100 bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="field-title text-sm">Projects at a glance</h2>
        <div className="inline-flex gap-0.5 rounded-full bg-ink-50 p-1">
          <button
            onClick={() => setMode("h")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
              mode === "h" ? "bg-ink-800 text-white" : "text-ink-500 hover:text-ink-800"
            }`}
          >
            Horizontal
          </button>
          <button
            onClick={() => setMode("v")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
              mode === "v" ? "bg-ink-800 text-white" : "text-ink-500 hover:text-ink-800"
            }`}
          >
            Vertical
          </button>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        {projects.map((project) => {
          const intakePct = Math.round((project.stepsCompleted / project.totalSteps) * 100);
          return (
            <Link
              key={project.id}
              href={`/customers/${project.id}`}
              className="rounded-lg border border-ink-100 p-4 transition-colors hover:border-brand-300"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-ink-800">{project.name}</span>
                <StatusPill status={project.status} />
              </div>
              <div className={mode === "h" ? "bars-h" : "bars-v"}>
                <div className="bar-item">
                  <span className="bar-label">Intake progress</span>
                  <div className="bar-track">
                    <div className="bar-fill fill-intake" style={{ "--pct": `${intakePct}%` } as React.CSSProperties} />
                  </div>
                  <span className="bar-value">
                    {project.stepsCompleted}/{project.totalSteps}
                  </span>
                </div>
                <div className="bar-item">
                  <span className="bar-label">Coupa connected</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${project.coupaConnected ? "fill-coupa-yes" : "fill-coupa-no"}`}
                      style={{ "--pct": "100%" } as React.CSSProperties}
                    />
                  </div>
                  <span className="bar-value">{project.coupaConnected ? "Yes" : "No"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
