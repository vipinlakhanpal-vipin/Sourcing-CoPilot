import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { INTAKE_AREAS, IntakeAnswers } from "@/lib/intake-schema";
import ShareIntakeClient from "@/components/ShareIntakeClient";

export default async function SharedIntakePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: session } = await supabaseAdmin
    .from("intake_sessions")
    .select("current_step, answers, respondent_name, respondent_email, customers!inner(name)")
    .eq("share_token", token)
    .maybeSingle();

  if (!session) notFound();

  const customer = Array.isArray(session.customers) ? session.customers[0] : session.customers;

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <ShareIntakeClient
        token={token}
        customerName={customer.name}
        areas={INTAKE_AREAS}
        initialAnswers={(session.answers as IntakeAnswers) ?? {}}
        initialStep={session.current_step}
        initialRespondentName={session.respondent_name}
      />
    </div>
  );
}
