import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { INTAKE_AREAS, IntakeAnswers } from "@/lib/intake-schema";
import IntakeFlow from "@/components/IntakeFlow";

export default async function IntakeSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const { sessionId } = await params;

  const { data: intakeSession } = await supabaseAdmin
    .from("intake_sessions")
    .select("id, status, current_step, answers, customers!inner(id, name, owner_id)")
    .eq("id", sessionId)
    .eq("customers.owner_id", session.userId)
    .maybeSingle();

  if (!intakeSession) notFound();

  const customer = Array.isArray(intakeSession.customers)
    ? intakeSession.customers[0]
    : intakeSession.customers;

  return (
    <IntakeFlow
      mode="rep"
      apiBasePath={`/api/intake/${intakeSession.id}`}
      resultsHref={`/intake/${intakeSession.id}/results`}
      customerName={customer.name}
      areas={INTAKE_AREAS}
      initialAnswers={(intakeSession.answers as IntakeAnswers) ?? {}}
      initialStep={intakeSession.current_step}
      initialStatus={intakeSession.status as "in_progress" | "completed"}
    />
  );
}
