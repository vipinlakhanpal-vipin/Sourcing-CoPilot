import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import SettingsTabs from "@/components/SettingsTabs";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("name, email, role, created_at, last_login_at, last_login_city, last_login_country")
    .eq("id", session.userId)
    .maybeSingle();

  const location = [user?.last_login_city, user?.last_login_country].filter(Boolean).join(", ");
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="hero-carbon rounded-xl p-6">
        <h1 className="font-display text-2xl text-white">Settings</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-white/70">
          Manage your account{isAdmin ? " and team access." : "."}
        </p>
      </div>

      <SettingsTabs
        account={{
          name: user?.name ?? null,
          email: user?.email ?? session.email,
          role: user?.role ?? "standard",
          createdAt: user?.created_at ?? null,
          lastLoginAt: user?.last_login_at ?? null,
          location,
        }}
      />
    </div>
  );
}
