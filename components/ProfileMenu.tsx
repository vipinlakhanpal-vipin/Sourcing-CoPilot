"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  name: string | null;
  email: string;
  role: string;
  location: string | null;
  createdAt: string | null;
  lastLoginCity: string | null;
  lastLoginCountry: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  standard: "Standard",
  super_admin: "Super Admin",
};
const ROLE_BADGE_CLASS: Record<string, string> = {
  admin: "role-badge--admin",
  super_admin: "role-badge--super",
};

export default function ProfileMenu({
  name,
  email,
  role,
  location,
  createdAt,
  lastLoginCity,
  lastLoginCountry,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationDraft, setLocationDraft] = useState(location ?? "");
  const [savingLocation, setSavingLocation] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditingLocation(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const detectedLocation = [lastLoginCity, lastLoginCountry].filter(Boolean).join(", ");

  async function saveLocation(value: string) {
    setSavingLocation(true);
    try {
      await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: value || null }),
      });
      setEditingLocation(false);
      router.refresh();
    } finally {
      setSavingLocation(false);
    }
  }

  const initials = (name?.trim() || email)
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative ml-1 shrink-0 sm:ml-2" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
        aria-label="Profile"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold">
          {initials}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-ink-100 bg-surface text-ink-800 shadow-lg">
          <div className="bg-ink-800 px-4 py-3">
            <p className="text-sm font-semibold text-white">{name || "Your account"}</p>
            <p className="text-xs text-white/60">{email}</p>
          </div>
          <div className="space-y-2.5 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-400">Role</span>
              <span className={`role-badge ${ROLE_BADGE_CLASS[role] ?? ""}`}>{ROLE_LABEL[role] || "Standard"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-400">Joined</span>
              <span className="font-medium text-ink-700">
                {createdAt ? new Date(createdAt).toLocaleDateString() : "Not set"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="pt-1 text-ink-400">Location</span>
              {editingLocation ? (
                <div className="flex flex-1 flex-col items-end gap-1.5">
                  <input
                    autoFocus
                    value={locationDraft}
                    onChange={(e) => setLocationDraft(e.target.value)}
                    placeholder={detectedLocation || "e.g. Austin, TX"}
                    className="field-fill w-full rounded-md px-2 py-1 text-xs"
                  />
                  <div className="flex gap-1.5">
                    {detectedLocation && (
                      <button
                        onClick={() => setLocationDraft(detectedLocation)}
                        className="rounded-md bg-ink-50 px-2 py-1 text-[11px] font-medium text-ink-500 hover:bg-ink-100"
                      >
                        Use {detectedLocation}
                      </button>
                    )}
                    <button
                      onClick={() => saveLocation(locationDraft)}
                      disabled={savingLocation}
                      className="rounded-md bg-brand-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                    >
                      {savingLocation ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setLocationDraft(location ?? "");
                    setEditingLocation(true);
                  }}
                  className="font-medium text-ink-700 underline decoration-dotted hover:text-brand-700"
                >
                  {location || detectedLocation || "Add location"}
                </button>
              )}
            </div>
          </div>
          <div className="border-t border-ink-100 p-2">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-lg px-2 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
