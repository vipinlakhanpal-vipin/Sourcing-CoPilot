"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  name: string | null;
  email: string;
  role: string;
  lastLoginCity: string | null;
  lastLoginCountry: string | null;
}

const ROLE_LABEL: Record<string, string> = { admin: "Admin", standard: "Standard" };

export default function ProfileMenu({ name, email, role, lastLoginCity, lastLoginCountry }: Props) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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

  const initials = (name?.trim() || email)
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const location = [lastLoginCity, lastLoginCountry].filter(Boolean).join(", ");

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
        <div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-xl border border-ink-100 bg-surface text-ink-800 shadow-lg">
          <div className="bg-ink-800 px-4 py-3">
            <p className="text-sm font-semibold text-white">{name || "Your account"}</p>
            <p className="text-xs text-white/60">{email}</p>
          </div>
          <div className="space-y-2 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-400">Role</span>
              <span className="role-badge">{ROLE_LABEL[role] || "Standard"}</span>
            </div>
            {location && (
              <div className="flex items-center justify-between">
                <span className="text-ink-400">Last signed in</span>
                <span className="font-medium text-ink-700">{location}</span>
              </div>
            )}
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
