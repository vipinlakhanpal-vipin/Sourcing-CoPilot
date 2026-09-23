import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUserId, isErrorResponse } from "@/lib/api-helpers";
import { IntakeAnswers, getIncompleteAreas, INTAKE_AREAS } from "@/lib/intake-schema";
import { generateConfigPackage } from "@/lib/anthropic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;
  const { sessionId } = await params;

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("intake_sessions")
    .select("id, answers, customers!inner(id, name, owner_id)")
    .eq("id", sessionId)
    .eq("customers.owner_id", userId)
    .maybeSingle();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Intake session not found" }, { status: 404 });
  }

  const answers = (session.answers as IntakeAnswers) ?? {};
  const incompleteAreas = getIncompleteAreas(answers);
  if (incompleteAreas.length > 0) {
    const areaTitles = INTAKE_AREAS.filter((a) => incompleteAreas.includes(a.id)).map((a) => a.title);
    return NextResponse.json(
      { error: `Complete these areas before generating: ${areaTitles.join(", ")}` },
      { status: 400 }
    );
  }

  const customer = Array.isArray(session.customers) ? session.customers[0] : session.customers;

  let generated;
  try {
    generated = await generateConfigPackage(customer.name, answers);
  } catch {
    return NextResponse.json({ error: "Could not generate configuration package" }, { status: 502 });
  }

  const { data: configPackage, error: insertError } = await supabaseAdmin
    .from("config_packages")
    .insert({
      intake_session_id: sessionId,
      customer_id: customer.id,
      summary_markdown: generated.summaryMarkdown,
      structured_data: answers,
      flags: generated.flags,
    })
    .select("id, summary_markdown, flags, generated_at")
    .single();

  if (insertError || !configPackage) {
    return NextResponse.json({ error: "Could not save configuration package" }, { status: 500 });
  }

  await supabaseAdmin
    .from("intake_sessions")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", sessionId);

  return NextResponse.json({ configPackage });
}
