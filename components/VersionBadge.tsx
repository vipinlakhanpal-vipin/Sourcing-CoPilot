"use client";

import { useEffect, useState } from "react";
import { APP_VERSION } from "@/lib/version";

const POLL_INTERVAL_MS = 60_000;

export default function VersionBadge() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkVersion() {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.version && data.version !== APP_VERSION) {
          setUpdateAvailable(true);
        }
      } catch {
        // Offline or transient error — just skip this check.
      }
    }

    checkVersion();
    const interval = setInterval(checkVersion, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", checkVersion);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", checkVersion);
    };
  }, []);

  return (
    <button
      onClick={() => window.location.reload()}
      title={updateAvailable ? "A new version is available — click to refresh" : "Refresh"}
      className="relative flex items-center gap-1 rounded-full border border-ink-100 px-2 py-0.5 text-xs font-medium text-ink-400 hover:bg-ink-50 hover:text-ink-800"
    >
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.89M13.5 2v3.5H10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>v{APP_VERSION}</span>
      {updateAvailable && (
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
      )}
    </button>
  );
}
