import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUserId, isErrorResponse } from "@/lib/api-helpers";
import { decryptSecret } from "@/lib/crypto";
import { testConnection } from "@/lib/coupa/client";

const bodySchema = z.object({
  environment: z.enum(["test", "production"]).default("test"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;
  const { id } = await params;

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("id", id)
    .eq("owner_id", userId)
    .maybeSingle();
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  const environment = parsed.success ? parsed.data.environment : "test";

  const { data: connection } = await supabaseAdmin
    .from("coupa_connections")
    .select("instance_hostname, client_id, encrypted_client_secret, scope")
    .eq("customer_id", id)
    .eq("environment", environment)
    .maybeSingle();

  if (!connection) {
    return NextResponse.json({ error: "No Coupa connection configured for this environment yet" }, { status: 404 });
  }

  const result = await testConnection({
    instanceBaseUrl: connection.instance_hostname,
    clientId: connection.client_id,
    clientSecret: decryptSecret(connection.encrypted_client_secret),
    scope: connection.scope,
  });

  await supabaseAdmin
    .from("coupa_connections")
    .update({
      last_tested_at: new Date().toISOString(),
      last_test_ok: result.ok,
      last_test_message: result.message,
    })
    .eq("customer_id", id)
    .eq("environment", environment);

  return NextResponse.json(result);
}
