import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import VersionBadge from "@/components/VersionBadge";
import BrandMark from "@/components/BrandMark";
import NavTabs from "@/components/NavTabs";
import ProfileMenu from "@/components/ProfileMenu";
import ModeToggle from "@/components/ModeToggle";
import AriaWidget from "@/components/AriaWidget";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const { data: user } = session
    ? await supabaseAdmin
        .from("users")
        .select("name, role, location, created_at, last_login_city, last_login_country")
        .eq("id", session.userId)
        .maybeSingle()
    : { data: null };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <header className="strip-carbon sticky top-0 z-10 px-2 py-2.5 shadow-md sm:px-4 sm:py-3.5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:px-5 sm:py-2.5">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <span className="relative shrink-0">
              <span
                className="absolute -inset-1 -z-10 rounded-xl blur-sm"
                style={{ background: "radial-gradient(circle, rgba(94,234,212,0.5), transparent 70%)" }}
                aria-hidden="true"
              />
              <BrandMark />
            </span>
            <span className="font-display hidden text-sm tracking-tight text-white/90 md:block">
              Sourcing CoPilot
            </span>
          </Link>
          <VersionBadge />
          <div className="mx-auto flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <NavTabs />
          </div>
          <ModeToggle />
          {session && (
            <ProfileMenu
              name={user?.name ?? null}
              email={session.email}
              role={user?.role ?? "standard"}
              location={user?.location ?? null}
              createdAt={user?.created_at ?? null}
              lastLoginCity={user?.last_login_city ?? null}
              lastLoginCountry={user?.last_login_country ?? null}
            />
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
      {session && <AriaWidget />}
    </div>
  );
}
