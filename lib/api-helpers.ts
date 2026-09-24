import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { supabaseAdmin } from "./supabase-admin";

export async function requireUserId(): Promise<string | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return session.userId;
}

export async function requireAdmin(): Promise<
  { userId: string; email: string } | NextResponse
> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", session.userId)
    .maybeSingle();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Admin access only" }, { status: 403 });
  }
  return { userId: session.userId, email: session.email };
}

export function isErrorResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
