import { NextResponse } from "next/server";
import { getSession } from "./auth";

export async function requireUserId(): Promise<string | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return session.userId;
}

export function isErrorResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
