import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";

// No caching: this must always reflect whatever build is currently deployed,
// even for a browser tab that loaded an older bundle before a redeploy.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ version: APP_VERSION });
}
