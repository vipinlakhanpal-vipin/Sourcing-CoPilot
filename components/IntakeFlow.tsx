"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FieldValue, IntakeArea, IntakeAnswers, isAreaComplete, personalize } from "@/lib/intake-schema";
import IntakeFieldInput from "./IntakeFieldInput";

interface Props {
  /** Base path for save/generate requests, e.g. `/api/intake/<id>` or `/api/share/<token>`. */
  apiBasePath: string;
  /** "rep" is the authenticated internal flow (can generate a package). "share" is the
   * customer-facing public link (intake only — generation stays rep-only). */
  mode: "rep" | "share";
  customerName: string;
  areas: IntakeArea[];
  initialAnswers: IntakeAnswers;
  initialStep: number;
  initialStatus: "in_progress" | "completed";
  resultsHref?: string;
}

export default function IntakeFlow({
  apiBasePath,
  mode,
  customerName,
  areas,
  initialAnswers,
  initialStep,
  initialStatus,
  resultsHref,
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

  function updateField(areaId: string, fieldId: string, value: FieldValue) {
    setAnswers((prev) => ({
      ...prev,
      [areaId]: { ...prev[areaId], [fieldId]: value },
    }));
  }

  async function saveArea(area: IntakeArea, nextStep: number) {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(apiBasePath, {
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
    if (mode !== "rep" || !resultsHref) return;
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch(`${apiBasePath}/generate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not generate the configuration package");
        return;
      }
      setStatus("completed");
      router.push(resultsHref);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        {mode === "rep" && (
          <Link href="/dashboard" className="text-sm text-ink-400 hover:text-ink-800">
            ← All customers
          </Link>
        )}
        <h1 className="mt-1 text-lg font-semibold text-ink-800">{customerName}</h1>
        <p className="text-sm text-ink-400">Coupa Sourcing intake — {areas.length} areas</p>
      </div>

      {mode === "rep" && status === "completed" && resultsHref && (
        <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          <span>This intake is complete. Editing an answer here does not regenerate the config package.</span>
          <Link href={resultsHref} className="font-medium underline">
            View package
          </Link>
        </div>
      )}

      <div>
        <div className="flex items-center gap-1.5 px-1 pb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
          Process
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-ink-100 pb-px">
          {areas.map((area, i) => {
            const complete = isAreaComplete(area, answers);
            const active = i === stepIndex;
            return (
              <button
                key={area.id}
                onClick={() => goToStep(i)}
                title={area.title}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-brand-600 text-ink-800"
                    : "border-transparent text-ink-400 hover:text-ink-700"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold ${
                    complete
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-brand-600 text-white"
                        : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {complete ? "✓" : i + 1}
                </span>
                {area.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {currentArea && (
          <div className="space-y-4">
            <div className="max-w-lg rounded-2xl rounded-tl-sm bg-ink-50 px-4 py-2.5 text-sm text-ink-700">
              {personalize(currentArea.agentIntro, customerName)}
            </div>
            <div className="space-y-5 rounded-lg border border-ink-100 bg-white p-5">
              <h2 className="text-sm font-semibold text-ink-800">{currentArea.title}</h2>
              {currentArea.fields.map((field) => {
                const dynamicOptions = field.optionsFromField
                  ? (answers[field.optionsFromField.areaId]?.[field.optionsFromField.fieldId] as
                      | string[]
                      | undefined)
                  : undefined;
                const effectiveField = dynamicOptions ? { ...field, options: dynamicOptions } : field;
                return (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-ink-700">
                    {personalize(field.label, customerName)}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {field.helpText && (
                    <p className="mb-1 text-xs text-ink-400">{personalize(field.helpText, customerName)}</p>
                  )}
                  <div className="mt-1">
                    <IntakeFieldInput
                      field={effectiveField}
                      value={answers[currentArea.id]?.[field.id]}
                      onChange={(value) => updateField(currentArea.id, field.id, value)}
                      uploadUrl={
                        field.type === "file"
                          ? `${apiBasePath}/uploads?areaId=${currentArea.id}&fieldId=${field.id}`
                          : undefined
                      }
                    />
                  </div>
                </div>
                );
              })}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex items-center gap-3 pt-2">
                {stepIndex > 0 && (
                  <button
                    onClick={() => goToStep(stepIndex - 1)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-ink-500 hover:text-ink-800"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleContinue}
                  disabled={saving}
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : stepIndex === areas.length - 1 ? "Save & review" : "Continue"}
                </button>
              </div>
            </div>
          </div>
        )}

        {!currentArea && mode === "rep" && (
          <div className="space-y-4">
            <div className="max-w-lg rounded-2xl rounded-tl-sm bg-ink-50 px-4 py-2.5 text-sm text-ink-700">
              That&apos;s everything. Ready to generate the configuration package?
            </div>
            <div className="rounded-lg border border-ink-100 bg-white p-5">
              <ul className="mb-4 grid gap-1.5 sm:grid-cols-2">
                {areas.map((area, i) => {
                  const complete = isAreaComplete(area, answers);
                  return (
                    <li key={area.id}>
                      <button
                        onClick={() => goToStep(i)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-ink-50"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                            complete ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {complete ? "✓" : "!"}
                        </span>
                        <span className="text-ink-700">{area.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {!allComplete && (
                <p className="mb-3 text-sm text-amber-600">
                  Some required fields are still missing — go back and fill them in before generating.
                </p>
              )}
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goToStep(areas.length - 1)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-ink-500 hover:text-ink-800"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!allComplete || generating}
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {generating ? "Generating…" : "Generate configuration package"}
                </button>
              </div>
            </div>
          </div>
        )}

        {!currentArea && mode === "share" && (
          <div className="space-y-4">
            <div className="max-w-lg rounded-2xl rounded-tl-sm bg-ink-50 px-4 py-2.5 text-sm text-ink-700">
              That&apos;s everything — thank you.
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              {allComplete ? (
                <p>
                  Your answers have been submitted. Our team will review them and follow up with
                  next steps — you don&apos;t need to do anything else here.
                </p>
              ) : (
                <p className="text-amber-700">
                  A few required fields are still missing — go back and fill them in.
                </p>
              )}
              <button
                onClick={() => goToStep(areas.length - 1)}
                className="mt-3 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                Back to last section
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
