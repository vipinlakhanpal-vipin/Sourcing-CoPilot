"use client";

import { useEffect, useState } from "react";
import { getStoredMode, setStoredMode, ThemeMode } from "@/lib/theme";

export default function ModeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    // localStorage isn't available during SSR, so this reads the real value
    // after mount rather than risking a hydration mismatch from reading it
    // in a lazy useState initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(getStoredMode());
  }, []);

  function toggle() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setStoredMode(next);
    setMode(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white"
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mode === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
        </svg>
      )}
    </button>
  );
}
