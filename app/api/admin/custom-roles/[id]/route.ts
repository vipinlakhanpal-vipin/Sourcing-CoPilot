import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin, isErrorResponse } from "@/lib/api-helpers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireSuperAdmin();
  if (isErrorResponse(admin)) return admin;
  const { id } = await params;

  const { error } = await supabaseAdmin.from("custom_roles").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Could not delete the role" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
