"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ProjectRow {
  id: string;
  name: string;
  notes: string | null;
  status: "active" | "inactive" | "pending";
  updated_at: string;
}

const STATUS_LABEL: Record<ProjectRow["status"], string> = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
};

function StatusPill({ status }: { status: ProjectRow["status"] }) {
  return <span className={`status-pill status-pill--${status}`}>● {STATUS_LABEL[status]}</span>;
}

function EditProjectModal({
  project,
  onClose,
  onSaved,
}: {
  project: ProjectRow;
  onClose: () => void;
  onSaved: (updated: ProjectRow) => void;
}) {
  const [name, setName] = useState(project.name);
  const [notes, setNotes] = useState(project.notes ?? "");
  const [status, setStatus] = useState<ProjectRow["status"]>(project.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, notes: notes || null, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save changes");
        return;
      }
      onSaved({ ...project, name, notes: notes || null, status });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-ink-100 bg-surface p-5 shadow-lg">
        <h3 className="field-title text-sm">Edit project</h3>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-fill w-full rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="field-fill w-full rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectRow["status"])}
              className="field-fill w-full rounded-md px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-ink-500 hover:text-ink-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsList({ initialProjects }: { initialProjects: ProjectRow[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(project: ProjectRow) {
    if (!confirm(`Delete "${project.name}"? This removes its intake sessions and Coupa connection too. This cannot be undone.`)) {
      return;
    }
    setDeletingId(project.id);
    try {
      const res = await fetch(`/api/customers/${project.id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-200 bg-surface p-8 text-center text-sm text-ink-400">
        No projects yet. Create one to start an intake.
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100 bg-surface shadow-sm">
        {projects.map((project) => (
          <li key={project.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <Link href={`/customers/${project.id}`} className="min-w-0 flex-1 hover:opacity-80">
              <p className="truncate text-sm font-medium text-ink-800">{project.name}</p>
              <p className="text-xs text-ink-400">
                Updated {new Date(project.updated_at).toLocaleDateString()}
              </p>
            </Link>
            <StatusPill status={project.status} />
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => router.push(`/customers/${project.id}`)}
                className="icon-btn icon-btn--view"
                title="View"
                aria-label="View project"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Z" />
                  <circle cx="10" cy="10" r="2.5" />
                </svg>
              </button>
              <button
                onClick={() => setEditing(project)}
                className="icon-btn icon-btn--edit"
                title="Edit"
                aria-label="Edit project"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <path d="M13.5 3.5 16.5 6.5 6 17H3v-3L13.5 3.5Z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(project)}
                disabled={deletingId === project.id}
                className="icon-btn icon-btn--delete"
                title="Delete"
                aria-label="Delete project"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <path d="M4 6h12M8 6V4h4v2m-6 0 .6 10.2a1 1 0 0 0 1 .8h4.8a1 1 0 0 0 1-.8L14 6" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <EditProjectModal
          project={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
