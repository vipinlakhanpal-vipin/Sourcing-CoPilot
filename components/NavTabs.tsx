"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/guide", label: "Guide" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 min-w-0">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
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
    </nav>
  );
}
