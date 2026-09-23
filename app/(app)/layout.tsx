import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import VersionBadge from "@/components/VersionBadge";
import BrandMark from "@/components/BrandMark";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-ink-50">
      <header className="border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BrandMark />
              <span className="font-display text-base font-semibold tracking-tight text-ink-800">
                Sourcing CoPilot
              </span>
            </Link>
            <VersionBadge />
            <Link href="/guide" className="ml-2 text-sm text-ink-400 hover:text-ink-800">
              Guide
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session && <span className="text-sm text-ink-400">{session.email}</span>}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
