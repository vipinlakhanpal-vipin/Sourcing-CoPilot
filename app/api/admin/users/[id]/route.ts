import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin, isErrorResponse } from "@/lib/api-helpers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;
  const { id } = await params;

  if (id === admin.userId) {
    return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Could not delete the user" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
