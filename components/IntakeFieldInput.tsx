"use client";

import { useState } from "react";
import { FieldValue, IntakeField, ROSTER_ROLE_OPTIONS, RosterEntry } from "@/lib/intake-schema";

interface Props {
  field: IntakeField;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  /** Required for "file" fields: where to POST the upload, e.g. `${apiBasePath}/uploads`. */
  uploadUrl?: string;
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
              className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {entry.name} <span className="font-normal text-slate-500">&lt;{entry.email}&gt;</span>
                </p>
                <p className="text-xs text-slate-500">
                  {entry.role}
                  {entry.note ? ` — ${entry.note}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="text-xs font-medium text-slate-400 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-2 rounded-md border border-dashed border-slate-300 p-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
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
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={addEntry}
          disabled={!name.trim() || !email.trim()}
          className="sm:col-span-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          + Add person
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
            className="ml-2 text-xs font-medium text-slate-400 hover:text-red-600"
          >
            Remove
          </button>
        </p>
      )}
      {!fileName && (
        <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 hover:border-slate-400">
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

  if (field.type === "file") {
    return <FileInput value={value} onChange={onChange} uploadUrl={uploadUrl} />;
  }

  if (field.type === "multiselect") {
    const selected = Array.isArray(value) && (value.length === 0 || typeof value[0] === "string") ? (value as string[]) : [];
    return (
      <div className="flex flex-wrap gap-2">
        {field.options?.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() =>
                onChange(
                  isSelected ? selected.filter((v) => v !== option) : [...selected, option]
                )
              }
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
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
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
    );
  }

  return (
    <input
      type="text"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
    />
  );
}
