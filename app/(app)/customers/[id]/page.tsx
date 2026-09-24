import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ProjectDetailTabs from "@/components/ProjectDetailTabs";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("id, name, notes, status, created_at")
    .eq("id", id)
    .eq("owner_id", session.userId)
    .maybeSingle();

  if (!customer) notFound();

  const [{ data: intakeSessions }, { data: connections }] = await Promise.all([
    supabaseAdmin
      .from("intake_sessions")
      .select("id, status, current_step, created_at, completed_at, share_token, respondent_name")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("coupa_connections")
      .select("instance_hostname, client_id, last_tested_at")
      .eq("customer_id", id)
      .eq("environment", "test")
      .maybeSingle(),
  ]);

  const connection = connections
    ? {
        instanceBaseUrl: connections.instance_hostname,
        clientId: connections.client_id,
        lastTestedAt: connections.last_tested_at,
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/projects" className="text-sm text-ink-400 hover:text-ink-800">
          ← All projects
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-ink-800">{customer.name}</h1>
        {customer.notes && <p className="mt-1 text-sm text-ink-400">{customer.notes}</p>}
      </div>

      <ProjectDetailTabs customerId={customer.id} intakeSessions={intakeSessions ?? []} connection={connection} />
    </div>
  );
}
