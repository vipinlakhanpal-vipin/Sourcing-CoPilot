import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUserId, isErrorResponse } from "@/lib/api-helpers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;
  const { id } = await params;

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("id", id)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const { data: session, error } = await supabaseAdmin
    .from("intake_sessions")
    .insert({ customer_id: id })
    .select("id")
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Could not start intake" }, { status: 500 });
  }

  return NextResponse.json({ intakeSessionId: session.id });
}
