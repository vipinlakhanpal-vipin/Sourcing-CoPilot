import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import PageBanner from "@/components/PageBanner";
import KpiTile from "@/components/KpiTile";
import ProjectChartsSection, { ProjectChartData } from "@/components/ProjectChartsSection";
import { INTAKE_AREAS } from "@/lib/intake-schema";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const { data: customers } = await supabaseAdmin
    .from("customers")
    .select("id, name, status, created_at, updated_at")
    .eq("owner_id", session.userId)
    .order("updated_at", { ascending: false });

  const customerIds = (customers ?? []).map((c) => c.id);
  const totalSteps = INTAKE_AREAS.length;

  const [{ count: inProgressCount }, { count: packageCount }, { data: sessions }, { data: connections }] =
    customerIds.length
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
          supabaseAdmin
            .from("intake_sessions")
            .select("customer_id, current_step, status, created_at")
            .in("customer_id", customerIds)
            .order("created_at", { ascending: false }),
          supabaseAdmin
            .from("coupa_connections")
            .select("customer_id")
            .in("customer_id", customerIds)
            .eq("environment", "test"),
        ])
      : [{ count: 0 }, { count: 0 }, { data: [] }, { data: [] }];

  const latestSessionByCustomer = new Map<string, { current_step: number; status: string }>();
  for (const s of sessions ?? []) {
    if (!latestSessionByCustomer.has(s.customer_id)) {
      latestSessionByCustomer.set(s.customer_id, s);
    }
  }
  const connectedCustomerIds = new Set((connections ?? []).map((c) => c.customer_id));

  const projectCharts: ProjectChartData[] = (customers ?? []).map((c) => {
    const latest = latestSessionByCustomer.get(c.id);
    const stepsCompleted = latest
      ? latest.status === "completed"
        ? totalSteps
        : Math.min(latest.current_step, totalSteps)
      : 0;
    return {
      id: c.id,
      name: c.name,
      status: (c.status ?? "active") as ProjectChartData["status"],
      stepsCompleted,
      totalSteps,
      coupaConnected: connectedCustomerIds.has(c.id),
    };
  });

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

      <ProjectChartsSection projects={projectCharts} />
    </div>
  );
}
