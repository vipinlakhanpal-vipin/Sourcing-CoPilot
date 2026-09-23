import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUserId, isErrorResponse } from "@/lib/api-helpers";
import { encryptSecret } from "@/lib/crypto";

async function loadOwnedCustomer(customerId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("owner_id", userId)
    .maybeSingle();
  return data;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;
  const { id } = await params;

  const customer = await loadOwnedCustomer(id, userId);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const { data: connections } = await supabaseAdmin
    .from("coupa_connections")
    .select(
      "environment, instance_hostname, client_id, scope, last_tested_at, last_test_ok, last_test_message"
    )
    .eq("customer_id", id);

  return NextResponse.json({
    connections: (connections ?? []).map((c) => ({
      environment: c.environment,
      instanceBaseUrl: c.instance_hostname,
      clientId: c.client_id,
      scope: c.scope,
      lastTestedAt: c.last_tested_at,
      lastTestOk: c.last_test_ok,
      lastTestMessage: c.last_test_message,
    })),
  });
}

const putSchema = z.object({
  environment: z.enum(["test", "production"]).default("test"),
  instanceBaseUrl: z
    .string()
    .trim()
    .url()
    .refine((u) => u.startsWith("https://"), "Must be an https:// URL"),
  clientId: z.string().trim().min(1).max(500),
  clientSecret: z.string().trim().min(1).max(2000),
  scope: z.string().trim().max(1000).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;
  const { id } = await params;

  const customer = await loadOwnedCustomer(id, userId);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid connection details" },
      { status: 400 }
    );
  }

  const encryptedSecret = encryptSecret(parsed.data.clientSecret);

  const { error } = await supabaseAdmin.from("coupa_connections").upsert(
    {
      customer_id: id,
      environment: parsed.data.environment,
      instance_hostname: parsed.data.instanceBaseUrl.replace(/\/+$/, ""),
      client_id: parsed.data.clientId,
      encrypted_client_secret: encryptedSecret,
      scope: parsed.data.scope ?? null,
      last_tested_at: null,
      last_test_ok: null,
      last_test_message: null,
    },
    { onConflict: "customer_id,environment" }
  );

  if (error) {
    return NextResponse.json({ error: "Could not save the connection" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
