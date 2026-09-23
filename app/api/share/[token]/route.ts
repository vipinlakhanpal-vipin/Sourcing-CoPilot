import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { INTAKE_AREAS, IntakeAnswers, isIntakeComplete, fieldValueSchema } from "@/lib/intake-schema";

async function loadSessionByToken(token: string) {
  const { data, error } = await supabaseAdmin
    .from("intake_sessions")
    .select(
      "id, status, current_step, answers, respondent_name, respondent_email, customers!inner(name)"
    )
    .eq("share_token", token)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const session = await loadSessionByToken(token);
  if (!session) {
    return NextResponse.json({ error: "This link is invalid or has expired" }, { status: 404 });
  }

  const customer = Array.isArray(session.customers) ? session.customers[0] : session.customers;

  return NextResponse.json({
    session: {
      currentStep: session.current_step,
      answers: session.answers,
    },
    customerName: customer.name,
    respondentName: session.respondent_name,
    respondentEmail: session.respondent_email,
    areas: INTAKE_AREAS,
  });
}

const patchSchema = z
  .object({
    areaId: z.string().optional(),
    values: z.record(z.string(), fieldValueSchema).optional(),
    advanceToStep: z.number().int().min(1).max(INTAKE_AREAS.length + 1).optional(),
    respondentName: z.string().trim().min(1).max(200).optional(),
    respondentEmail: z.string().trim().toLowerCase().email().max(320).optional(),
  })
  .refine(
    (data) => (data.areaId && data.values) || data.respondentName,
    "Provide either an area update or respondent info"
  );

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const session = await loadSessionByToken(token);
  if (!session) {
    return NextResponse.json({ error: "This link is invalid or has expired" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answer payload" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  let updatedAnswers = (session.answers as IntakeAnswers) ?? {};

  if (parsed.data.areaId && parsed.data.values) {
    const area = INTAKE_AREAS.find((a) => a.id === parsed.data.areaId);
    if (!area) {
      return NextResponse.json({ error: "Unknown intake area" }, { status: 400 });
    }
    updatedAnswers = {
      ...updatedAnswers,
      [area.id]: { ...updatedAnswers[area.id], ...parsed.data.values },
    };
    updates.answers = updatedAnswers;
    if (parsed.data.advanceToStep !== undefined) {
      updates.current_step = parsed.data.advanceToStep;
    }
  }

  if (parsed.data.respondentName) updates.respondent_name = parsed.data.respondentName;
  if (parsed.data.respondentEmail) updates.respondent_email = parsed.data.respondentEmail;

  const { error: updateError } = await supabaseAdmin
    .from("intake_sessions")
    .update(updates)
    .eq("share_token", token);

  if (updateError) {
    return NextResponse.json({ error: "Could not save answers" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, isComplete: isIntakeComplete(updatedAnswers) });
}
