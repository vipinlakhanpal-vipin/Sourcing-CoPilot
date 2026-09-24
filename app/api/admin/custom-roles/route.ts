import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin, requireSuperAdmin, isErrorResponse } from "@/lib/api-helpers";

export async function GET() {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  const { data, error } = await supabaseAdmin
    .from("custom_roles")
    .select("id, name, created_at")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load roles" }, { status: 500 });
  }
  return NextResponse.json({ roles: data });
}

const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export async function POST(request: NextRequest) {
  const admin = await requireSuperAdmin();
  if (isErrorResponse(admin)) return admin;

  const body = await request.json().catch(() => null);
  const parsed = createRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A role name is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("custom_roles")
    .insert({ name: parsed.data.name })
    .select("id, name, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.code === "23505" ? "That role already exists" : "Could not create the role" },
      { status: error.code === "23505" ? 409 : 500 }
    );
  }
  return NextResponse.json({ role: data });
}
