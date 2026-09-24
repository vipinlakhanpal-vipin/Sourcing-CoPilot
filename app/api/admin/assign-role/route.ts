import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin, isErrorResponse } from "@/lib/api-helpers";

const assignSchema = z.object({
  userId: z.string().uuid(),
  customRoleId: z.string().uuid().nullable(),
});

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  const body = await request.json().catch(() => null);
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({ custom_role_id: parsed.data.customRoleId })
    .eq("id", parsed.data.userId);

  if (error) {
    return NextResponse.json({ error: "Could not assign the role" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
