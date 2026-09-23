import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUserId, isErrorResponse } from "@/lib/api-helpers";

const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(300),
  notes: z.string().trim().max(5000).optional(),
});

export async function GET() {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("id, name, notes, status, created_at, updated_at")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load customers" }, { status: 500 });
  }

  return NextResponse.json({ customers: data });
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const body = await request.json().catch(() => null);
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A customer/opportunity name is required" }, { status: 400 });
  }

  const { data: customer, error: customerError } = await supabaseAdmin
    .from("customers")
    .insert({ owner_id: userId, name: parsed.data.name, notes: parsed.data.notes ?? null })
    .select("id, name")
    .single();

  if (customerError || !customer) {
    return NextResponse.json({ error: "Could not create customer" }, { status: 500 });
  }

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("intake_sessions")
    .insert({ customer_id: customer.id })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Customer created, but could not start intake" }, { status: 500 });
  }

  return NextResponse.json({ customerId: customer.id, intakeSessionId: session.id });
}
