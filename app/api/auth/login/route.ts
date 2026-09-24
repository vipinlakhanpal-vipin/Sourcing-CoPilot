import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, email, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionToken({ userId: user.id, email: user.email });
  await setSessionCookie(token);

  // Vercel injects these headers at the edge; both are absent in local dev.
  const city = request.headers.get("x-vercel-ip-city");
  const country = request.headers.get("x-vercel-ip-country");
  await supabaseAdmin
    .from("users")
    .update({
      last_login_at: new Date().toISOString(),
      last_login_city: city ? decodeURIComponent(city) : null,
      last_login_country: country,
    })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
