import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import VersionBadge from "@/components/VersionBadge";
import BrandMark from "@/components/BrandMark";
import NavTabs from "@/components/NavTabs";
import ProfileMenu from "@/components/ProfileMenu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const { data: user } = session
    ? await supabaseAdmin
        .from("users")
        .select("name, last_login_city, last_login_country")
        .eq("id", session.userId)
        .maybeSingle()
    : { data: null };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-ink-50">
      <header className="border-b border-ink-100 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BrandMark />
              <span className="font-display text-base font-semibold tracking-tight text-ink-800">
                Sourcing CoPilot
              </span>
            </Link>
            <VersionBadge />
          </div>
          <NavTabs />
          {session && (
            <ProfileMenu
              name={user?.name ?? null}
              email={session.email}
              lastLoginCity={user?.last_login_city ?? null}
              lastLoginCountry={user?.last_login_country ?? null}
            />
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
