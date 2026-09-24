// App-wide light/dark mode toggle (nav bar). Purely client-side (localStorage) —
// this is in-app styling only, no server state.

export type ThemeMode = "light" | "dark";

export const MODE_KEY = "sc_theme_mode";

export function getStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return (window.localStorage.getItem(MODE_KEY) as ThemeMode) || "light";
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
}

export function setStoredMode(mode: ThemeMode) {
  window.localStorage.setItem(MODE_KEY, mode);
  applyTheme(mode);
}
