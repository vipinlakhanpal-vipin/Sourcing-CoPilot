"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AriaPanel from "./AriaPanel";

const TABS = [
  { href: "/guide", label: "Guide", match: ["/guide"] },
  { href: "/dashboard", label: "Dashboard", match: ["/dashboard"] },
  { href: "/projects", label: "Projects", match: ["/projects", "/customers", "/intake"] },
  { href: "/settings", label: "Settings", match: ["/settings"] },
];

function AriaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <rect x="7" y="8" width="10" height="9" rx="3" />
      <rect x="10" y="3" width="4" height="4" rx="2" />
      <circle cx="9.5" cy="12.5" r="1.2" fill="#7c3aed" />
      <circle cx="14.5" cy="12.5" r="1.2" fill="#7c3aed" />
    </svg>
  );
}

export default function NavTabs() {
  const pathname = usePathname();
  const [ariaOpen, setAriaOpen] = useState(false);

  return (
    <>
      <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 min-w-0">
        {TABS.map((tab) => {
          const active = tab.match.some((p) => pathname === p || pathname?.startsWith(`${p}/`));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`nav-pill relative rounded-xl px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                active ? "text-white nav-pill-breathe" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              style={active ? { background: "linear-gradient(135deg, rgba(47,184,166,0.9), rgba(46,116,181,0.65))" } : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
        <button
          onClick={() => setAriaOpen((o) => !o)}
          title="Aria"
          aria-label="Aria"
          className={`relative ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
            ariaOpen ? "bg-violet-500 ring-2 ring-violet-300/60" : "bg-violet-600/80 hover:bg-violet-500"
          }`}
        >
          <span className="aria-orbit flex text-white">
            <AriaIcon />
          </span>
        </button>
      </nav>
      <AriaPanel open={ariaOpen} onClose={() => setAriaOpen(false)} />
    </>
  );
}
