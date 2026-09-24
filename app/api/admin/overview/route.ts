import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin, isErrorResponse } from "@/lib/api-helpers";

export async function GET() {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, name, email, role, custom_role_id, created_at, last_login_at, last_login_city, last_login_country, custom_roles(name)"
    )
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load users" }, { status: 500 });
  }

  const totalAdmin = users.filter((u) => u.role === "admin").length;
  const totalSuperAdmin = users.filter((u) => u.role === "super_admin").length;

  return NextResponse.json({
    totalUsers: users.length,
    totalStandard: users.length - totalAdmin - totalSuperAdmin,
    totalAdmin,
    totalSuperAdmin,
    users: users.map((u) => ({
      ...u,
      custom_role_name: (u.custom_roles as unknown as { name: string } | null)?.name ?? null,
      custom_roles: undefined,
    })),
  });
}
