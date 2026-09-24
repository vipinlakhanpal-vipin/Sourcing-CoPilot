import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import PageBanner from "@/components/PageBanner";
import KpiTile from "@/components/KpiTile";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const { data: customers } = await supabaseAdmin
    .from("customers")
    .select("id, name, status, created_at, updated_at")
    .eq("owner_id", session.userId)
    .order("updated_at", { ascending: false });

  const customerIds = (customers ?? []).map((c) => c.id);

  const [{ count: inProgressCount }, { count: packageCount }] = customerIds.length
    ? await Promise.all([
        supabaseAdmin
          .from("intake_sessions")
          .select("id", { count: "exact", head: true })
          .in("customer_id", customerIds)
          .eq("status", "in_progress"),
        supabaseAdmin
          .from("config_packages")
          .select("id", { count: "exact", head: true })
          .in("customer_id", customerIds),
      ])
    : [{ count: 0 }, { count: 0 }];

  return (
    <div className="space-y-6">
      <PageBanner
        title="Dashboard"
        description="Scope a Coupa Sourcing deployment for each customer or opportunity — from first conversation to a ready-to-configure package."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <KpiTile label="Total projects" value={customers?.length ?? 0} tone="brand" />
        <KpiTile label="Intakes in progress" value={inProgressCount ?? 0} tone="warn" />
        <KpiTile label="Packages generated" value={packageCount ?? 0} tone="good" />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-ink-100 bg-surface p-5">
        <div>
          <h2 className="font-display text-base text-ink-800">Projects</h2>
          <p className="mt-0.5 text-sm text-ink-400">
            Every customer or opportunity you&apos;re scoping — view, continue, or start a new one.
          </p>
        </div>
        <Link
          href="/projects"
          className="shrink-0 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          View projects
        </Link>
      </div>
    </div>
  );
}
