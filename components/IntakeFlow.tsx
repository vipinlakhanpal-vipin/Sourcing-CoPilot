"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IntakeArea,
  IntakeAnswers,
  isAreaComplete,
  isFieldFilled,
} from "@/lib/intake-schema";
import IntakeFieldInput from "./IntakeFieldInput";

interface Props {
  sessionId: string;
  customerName: string;
  areas: IntakeArea[];
  initialAnswers: IntakeAnswers;
  initialStep: number;
  initialStatus: "in_progress" | "completed";
}

function summarizeAnswer(value: string | string[] | undefined): string {
  if (!isFieldFilled(value)) return "—";
  return Array.isArray(value) ? value.join(", ") : (value as string);
}

export default function IntakeFlow({
  sessionId,
  customerName,
  areas,
  initialAnswers,
  initialStep,
  initialStatus,
}: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<IntakeAnswers>(initialAnswers);
  const [stepIndex, setStepIndex] = useState(
    Math.min(Math.max(initialStep - 1, 0), areas.length)
  );
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(initialStatus);

  const currentArea = stepIndex < areas.length ? areas[stepIndex] : null;
  const allComplete = useMemo(
    () => areas.every((area) => isAreaComplete(area, answers)),
    [areas, answers]
  );

  function updateField(areaId: string, fieldId: string, value: string | string[]) {
    setAnswers((prev) => ({
      ...prev,
      [areaId]: { ...prev[areaId], [fieldId]: value },
    }));
  }

  async function saveArea(area: IntakeArea, nextStep: number) {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/intake/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areaId: area.id,
          values: answers[area.id] ?? {},
          advanceToStep: nextStep,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not save your answers");
        return false;
      }
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function handleContinue() {
    if (!currentArea) return;
    if (!isAreaComplete(currentArea, answers)) {
      setError("Please fill in the required fields before continuing.");
      return;
    }
    const ok = await saveArea(currentArea, stepIndex + 2);
    if (ok) setStepIndex((i) => i + 1);
  }

  function goToStep(index: number) {
    setError(null);
    setStepIndex(index);
  }

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch(`/api/intake/${sessionId}/generate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not generate the configuration package");
        return;
      }
      setStatus("completed");
      router.push(`/intake/${sessionId}/results`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
          ← All customers
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">{customerName}</h1>
        <p className="text-sm text-slate-500">Coupa Sourcing intake — 7 areas</p>
      </div>

      {status === "completed" && (
        <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          <span>This intake is complete. Editing an answer here does not regenerate the config package.</span>
          <Link href={`/intake/${sessionId}/results`} className="font-medium underline">
            View package
          </Link>
        </div>
      )}

      <div className="flex gap-1.5">
        {areas.map((area, i) => (
          <button
            key={area.id}
            onClick={() => goToStep(i)}
            title={area.title}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i === stepIndex
                ? "bg-slate-900"
                : isAreaComplete(area, answers)
                  ? "bg-slate-400"
                  : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className="space-y-4">
        {areas.slice(0, stepIndex).map((area, i) => (
          <div key={area.id} className="space-y-2">
            <div className="max-w-lg rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
              {area.agentIntro}
            </div>
            <div className="ml-auto max-w-lg space-y-1 rounded-2xl rounded-tr-sm bg-slate-900 px-4 py-2.5 text-sm text-white">
              {area.fields.map((field) => (
                <p key={field.id}>
                  <span className="text-slate-300">{field.label}: </span>
                  {summarizeAnswer(answers[area.id]?.[field.id])}
                </p>
              ))}
            </div>
            <button
              onClick={() => goToStep(i)}
              className="text-xs font-medium text-slate-400 hover:text-slate-700"
            >
              Edit
            </button>
          </div>
        ))}

        {currentArea && (
          <div className="space-y-4">
            <div className="max-w-lg rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
              {currentArea.agentIntro}
            </div>
            <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">{currentArea.title}</h2>
              {currentArea.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {field.helpText && <p className="mb-1 text-xs text-slate-400">{field.helpText}</p>}
                  <div className="mt-1">
                    <IntakeFieldInput
                      field={field}
                      value={answers[currentArea.id]?.[field.id]}
                      onChange={(value) => updateField(currentArea.id, field.id, value)}
                    />
                  </div>
                </div>
              ))}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex items-center gap-3 pt-2">
                {stepIndex > 0 && (
                  <button
                    onClick={() => goToStep(stepIndex - 1)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleContinue}
                  disabled={saving}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving…" : stepIndex === areas.length - 1 ? "Save & review" : "Continue"}
                </button>
              </div>
            </div>
          </div>
        )}

        {!currentArea && (
          <div className="space-y-4">
            <div className="max-w-lg rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
              That&apos;s everything. Ready to generate the configuration package?
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              {!allComplete && (
                <p className="mb-3 text-sm text-amber-600">
                  Some required fields are still missing — go back and fill them in before generating.
                </p>
              )}
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goToStep(areas.length - 1)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!allComplete || generating}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {generating ? "Generating…" : "Generate configuration package"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
