import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUserId, isErrorResponse } from "@/lib/api-helpers";

const updateCustomerSchema = z.object({
  name: z.string().trim().min(1).max(300).optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
});

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const { data: customer, error } = await supabaseAdmin
    .from("customers")
    .update(parsed.data)
    .eq("id", id)
    .eq("owner_id", userId)
    .select("id, name, notes, status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not update customer" }, { status: 500 });
  }
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json({ customer });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;
  const { id } = await params;

  const { error } = await supabaseAdmin.from("customers").delete().eq("id", id).eq("owner_id", userId);
  if (error) {
    return NextResponse.json({ error: "Could not delete customer" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
