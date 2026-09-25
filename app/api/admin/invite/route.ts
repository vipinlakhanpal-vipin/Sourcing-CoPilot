import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin, isErrorResponse } from "@/lib/api-helpers";

const inviteSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().toLowerCase().email().max(320),
  role: z.enum(["standard", "admin"]),
});

// Records a pending invitation and hands back a ready-to-send message — there's
// no email-sending service configured, so this doesn't send anything itself.
// The role is applied automatically at signup (see app/api/auth/signup/route.ts),
// which looks up a pending invitation by email.
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  const body = await request.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A name, email, and role are required" }, { status: 400 });
  }
  const { name, email, role } = parsed.data;

  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingUser) {
    return NextResponse.json({ error: "That email already has an account" }, { status: 409 });
  }

  const { error } = await supabaseAdmin
    .from("invitations")
    .upsert({ name, email, role }, { onConflict: "email" });
  if (error) {
    return NextResponse.json({ error: "Could not create the invitation" }, { status: 500 });
  }

  const appUrl = `${request.nextUrl.protocol}//${request.headers.get("host") ?? request.nextUrl.host}`;
  const message = `Hi ${name},

You've been invited to Sourcing CoPilot.

1. Go to ${appUrl}/signup
2. Create your account with this email (${email}) and a password of your choice.
3. Sign in. Your access level is already set up and applies automatically.

Thanks!`;

  return NextResponse.json({ message });
}
