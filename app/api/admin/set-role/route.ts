import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin, isErrorResponse } from "@/lib/api-helpers";

const setRoleSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["standard", "admin"]),
});

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  const body = await request.json().catch(() => null);
  const parsed = setRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email and role are required" }, { status: 400 });
  }
  const { email, role } = parsed.data;

  if (email === admin.email) {
    return NextResponse.json({ error: "You can't change your own role" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("users").update({ role }).eq("email", email);
  if (error) {
    return NextResponse.json({ error: "Could not update role" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
