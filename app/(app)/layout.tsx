import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import VersionBadge from "@/components/VersionBadge";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-semibold text-slate-900">
              Sourcing CoPilot
            </Link>
            <VersionBadge />
            <Link href="/guide" className="ml-3 text-sm text-slate-500 hover:text-slate-900">
              Guide
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session && <span className="text-sm text-slate-500">{session.email}</span>}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
