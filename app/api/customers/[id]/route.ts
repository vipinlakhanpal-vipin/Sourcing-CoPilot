import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUserId, isErrorResponse } from "@/lib/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;
  const { id } = await params;

  const { data: customer, error: customerError } = await supabaseAdmin
    .from("customers")
    .select("id, name, notes, status, created_at, updated_at")
    .eq("id", id)
    .eq("owner_id", userId)
    .maybeSingle();

  if (customerError) {
    return NextResponse.json({ error: "Could not load customer" }, { status: 500 });
  }
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const { data: sessions, error: sessionsError } = await supabaseAdmin
    .from("intake_sessions")
    .select("id, status, current_step, created_at, updated_at, completed_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  if (sessionsError) {
    return NextResponse.json({ error: "Could not load intake sessions" }, { status: 500 });
  }

  return NextResponse.json({ customer, intakeSessions: sessions });
}
