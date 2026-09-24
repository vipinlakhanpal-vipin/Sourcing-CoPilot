import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUserId, isErrorResponse } from "@/lib/api-helpers";

const updateMeSchema = z.object({
  location: z.string().trim().max(200).nullable(),
});

export async function PATCH(request: NextRequest) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const body = await request.json().catch(() => null);
  const parsed = updateMeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid location" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({ location: parsed.data.location })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: "Could not save location" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
