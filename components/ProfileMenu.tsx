"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  name: string | null;
  email: string;
  lastLoginCity: string | null;
  lastLoginCountry: string | null;
}

export default function ProfileMenu({ name, email, lastLoginCity, lastLoginCountry }: Props) {
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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 hover:bg-brand-200"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-ink-100 bg-surface p-4 shadow-lg">
          <p className="text-sm font-semibold text-ink-800">{name || "Your account"}</p>
          <p className="mt-0.5 text-xs text-ink-400">{email}</p>
          {location && (
            <p className="mt-2 text-xs text-ink-400">
              Last signed in from <span className="text-ink-500">{location}</span>
            </p>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-3 w-full rounded-md border border-ink-100 px-3 py-1.5 text-left text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-60"
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
