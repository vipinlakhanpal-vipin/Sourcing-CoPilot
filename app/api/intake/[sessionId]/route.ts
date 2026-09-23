import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUserId, isErrorResponse } from "@/lib/api-helpers";
import { INTAKE_AREAS, IntakeAnswers, isIntakeComplete } from "@/lib/intake-schema";

async function loadOwnedSession(sessionId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from("intake_sessions")
    .select(
      "id, status, current_step, answers, created_at, updated_at, completed_at, customers!inner(id, name, owner_id)"
    )
    .eq("id", sessionId)
    .eq("customers.owner_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;
  const { sessionId } = await params;

  const session = await loadOwnedSession(sessionId, userId);
  if (!session) {
    return NextResponse.json({ error: "Intake session not found" }, { status: 404 });
  }

  const { data: latestPackage } = await supabaseAdmin
    .from("config_packages")
    .select("id, summary_markdown, flags, generated_at")
    .eq("intake_session_id", sessionId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      currentStep: session.current_step,
      answers: session.answers,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      completedAt: session.completed_at,
    },
    customer: session.customers,
    areas: INTAKE_AREAS,
    latestPackage: latestPackage ?? null,
  });
}

const patchSchema = z.object({
  areaId: z.string(),
  values: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  advanceToStep: z.number().int().min(1).max(INTAKE_AREAS.length + 1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;
  const { sessionId } = await params;

  const session = await loadOwnedSession(sessionId, userId);
  if (!session) {
    return NextResponse.json({ error: "Intake session not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answer payload" }, { status: 400 });
  }

  const area = INTAKE_AREAS.find((a) => a.id === parsed.data.areaId);
  if (!area) {
    return NextResponse.json({ error: "Unknown intake area" }, { status: 400 });
  }

  const existingAnswers = (session.answers as IntakeAnswers) ?? {};
  const updatedAnswers: IntakeAnswers = {
    ...existingAnswers,
    [area.id]: { ...existingAnswers[area.id], ...parsed.data.values },
  };

  const updates: Record<string, unknown> = { answers: updatedAnswers };
  if (parsed.data.advanceToStep !== undefined) {
    updates.current_step = parsed.data.advanceToStep;
  }

  const { error: updateError } = await supabaseAdmin
    .from("intake_sessions")
    .update(updates)
    .eq("id", sessionId);

  if (updateError) {
    return NextResponse.json({ error: "Could not save answers" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, isComplete: isIntakeComplete(updatedAnswers) });
}
