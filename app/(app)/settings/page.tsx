import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import PageBanner from "@/components/PageBanner";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("name, email, created_at, last_login_at, last_login_city, last_login_country")
    .eq("id", session.userId)
    .maybeSingle();

  const location = [user?.last_login_city, user?.last_login_country].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <PageBanner
        title="Settings"
        description="Your account details. Team access and roles are coming once we've settled how they should work."
      />

      <div className="max-w-lg rounded-lg border border-ink-100 bg-surface p-5">
        <h2 className="font-display text-base font-semibold text-ink-800">Account</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="text-xs text-ink-400">Name</dt>
            <dd className="text-ink-700">{user?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-400">Email</dt>
            <dd className="text-ink-700">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-400">Member since</dt>
            <dd className="text-ink-700">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-400">Last signed in</dt>
            <dd className="text-ink-700">
              {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : "—"}
              {location && <span className="text-ink-400"> from {location}</span>}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
