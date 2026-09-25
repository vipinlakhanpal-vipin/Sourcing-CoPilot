import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(8).max(200),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup details" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const city = request.headers.get("x-vercel-ip-city");
  const country = request.headers.get("x-vercel-ip-country");

  const { data: invitation } = await supabaseAdmin
    .from("invitations")
    .select("role, custom_role_id")
    .eq("email", email)
    .maybeSingle();

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .insert({
      name,
      email,
      password_hash: passwordHash,
      role: invitation?.role ?? "standard",
      custom_role_id: invitation?.custom_role_id ?? null,
      last_login_at: new Date().toISOString(),
      last_login_city: city ? decodeURIComponent(city) : null,
      last_login_country: country,
    })
    .select("id, email")
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }

  if (invitation) {
    await supabaseAdmin.from("invitations").delete().eq("email", email);
  }

  const token = await createSessionToken({ userId: user.id, email: user.email });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
