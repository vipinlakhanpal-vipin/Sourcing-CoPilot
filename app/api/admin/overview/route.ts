import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin, isErrorResponse } from "@/lib/api-helpers";

export async function GET() {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("id, name, email, role, created_at, last_login_at, last_login_city, last_login_country")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load users" }, { status: 500 });
  }

  const totalAdmin = users.filter((u) => u.role === "admin").length;

  return NextResponse.json({
    totalUsers: users.length,
    totalStandard: users.length - totalAdmin,
    totalAdmin,
    users,
  });
}
