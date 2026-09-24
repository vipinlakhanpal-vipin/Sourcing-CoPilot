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
    <nav className="strip-carbon flex items-center gap-1 rounded-full border border-[color:var(--color-strip-border)] p-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-500 text-[color:var(--color-strip-accent-foreground)]"
                : "text-[color:var(--color-strip-muted)] hover:text-[color:var(--color-strip-foreground)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
