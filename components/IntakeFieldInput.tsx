"use client";

import { useState } from "react";
import {
  CategoryRuleEntry,
  EVENT_RIGOR_OPTIONS,
  FieldValue,
  IntakeField,
  RFX_TYPE_OPTIONS,
  ROSTER_ROLE_OPTIONS,
  RosterEntry,
} from "@/lib/intake-schema";

interface Props {
  field: IntakeField;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  /** Required for "file" fields: where to POST the upload, e.g. `${apiBasePath}/uploads`. */
  uploadUrl?: string;
}

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-ink-200 bg-surface text-ink-500 hover:border-brand-300"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function RosterInput({
  value,
  onChange,
}: {
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
}) {
  const entries: RosterEntry[] = Array.isArray(value) && value.length > 0 && typeof value[0] === "object"
    ? (value as RosterEntry[])
    : [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(ROSTER_ROLE_OPTIONS[0]);
  const [note, setNote] = useState("");

  function addEntry() {
    if (!name.trim() || !email.trim()) return;
    onChange([...entries, { name: name.trim(), email: email.trim(), role, note: note.trim() || undefined }]);
    setName("");
    setEmail("");
    setNote("");
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((entry, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-3 rounded-md border border-ink-100 bg-ink-50 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-ink-800">
                  {entry.name} <span className="font-normal text-ink-400">&lt;{entry.email}&gt;</span>
                </p>
                <p className="text-xs text-ink-400">
                  {entry.role}
                  {entry.note ? ` — ${entry.note}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="text-xs font-medium text-ink-400 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-2 rounded-md border border-dashed border-brand-200 bg-brand-50/50 p-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="field-fill rounded-md px-3 py-2 text-sm"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="field-fill rounded-md px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="field-fill rounded-md px-3 py-2 text-sm"
        >
          {ROSTER_ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Scope / threshold (optional)"
          className="field-fill rounded-md px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addEntry}
          disabled={!name.trim() || !email.trim()}
          className="sm:col-span-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          + Add person
        </button>
      </div>
    </div>
  );
}

function CategoryRulesInput({
  value,
  onChange,
  categoryOptions,
}: {
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  categoryOptions: string[];
}) {
  const entries: CategoryRuleEntry[] =
    Array.isArray(value) && value.length > 0 && typeof value[0] === "object"
      ? (value as CategoryRuleEntry[])
      : [];
  const [category, setCategory] = useState("");
  const [threshold, setThreshold] = useState("");
  const [rfxTypes, setRfxTypes] = useState<string[]>([]);
  const [rigor, setRigor] = useState<string>(EVENT_RIGOR_OPTIONS[0]);

  function addEntry() {
    if (!category || rfxTypes.length === 0) return;
    onChange([...entries, { category, threshold: threshold.trim(), rfxTypes, rigor }]);
    setThreshold("");
    setRfxTypes([]);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((entry, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-3 rounded-md border border-ink-100 bg-ink-50 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-ink-800">
                  {entry.category}
                  {entry.threshold ? ` — ${entry.threshold}` : ""}
                </p>
                <p className="text-xs text-ink-400">
                  {entry.rfxTypes.join(", ")} &middot; {entry.rigor}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="text-xs font-medium text-ink-400 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2.5 rounded-md border border-dashed border-brand-200 bg-brand-50/50 p-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="field-fill rounded-md px-3 py-2 text-sm"
          >
            <option value="">Category…</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="Spend threshold (e.g. >$500k)"
            className="field-fill rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-ink-500">Event type(s)</p>
          <Chips
            options={RFX_TYPE_OPTIONS}
            selected={rfxTypes}
            onToggle={(o) =>
              setRfxTypes((prev) => (prev.includes(o) ? prev.filter((v) => v !== o) : [...prev, o]))
            }
          />
        </div>
        <select
          value={rigor}
          onChange={(e) => setRigor(e.target.value)}
          className="field-fill w-full rounded-md px-3 py-2 text-sm"
        >
          {EVENT_RIGOR_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addEntry}
          disabled={!category || rfxTypes.length === 0}
          className="w-full rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          + Add rule
        </button>
      </div>
    </div>
  );
}

function FileInput({
  value,
  onChange,
  uploadUrl,
}: {
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  uploadUrl?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileName = typeof value === "string" ? value : "";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadUrl) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      onChange(data.fileName ?? file.name);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      {fileName && (
        <p className="text-sm text-emerald-700">
          &#10003; {fileName}
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-2 text-xs font-medium text-ink-400 hover:text-red-600"
          >
            Remove
          </button>
        </p>
      )}
      {!fileName && (
        <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-brand-200 bg-brand-50/50 px-3 py-4 text-sm text-ink-500 hover:border-brand-400">
          {uploading ? "Uploading…" : "Click to upload a file (CSV, XLSX)"}
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function IntakeFieldInput({ field, value, onChange, uploadUrl }: Props) {
  if (field.type === "roster") {
    return <RosterInput value={value} onChange={onChange} />;
  }

  if (field.type === "category_rules") {
    return <CategoryRulesInput value={value} onChange={onChange} categoryOptions={field.options ?? []} />;
  }

  if (field.type === "file") {
    return <FileInput value={value} onChange={onChange} uploadUrl={uploadUrl} />;
  }

  if (field.type === "multiselect") {
    const selected = Array.isArray(value) && (value.length === 0 || typeof value[0] === "string") ? (value as string[]) : [];
    return (
      <Chips
        options={field.options ?? []}
        selected={selected}
        onToggle={(option) =>
          onChange(selected.includes(option) ? selected.filter((v) => v !== option) : [...selected, option])
        }
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="field-fill w-full rounded-md px-3 py-2 text-sm"
      >
        <option value="" disabled>
          Select one…
        </option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className="field-fill w-full rounded-md px-3 py-2 text-sm"
      />
    );
  }

  return (
    <input
      type="text"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="field-fill w-full rounded-md px-3 py-2 text-sm"
    />
  );
}
