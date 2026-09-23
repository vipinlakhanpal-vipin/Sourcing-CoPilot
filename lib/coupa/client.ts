import { getAccessToken } from "./auth";
import { CoupaConnectionConfig, CoupaTestResult } from "./types";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * Verifies a connection is real and usable: fetches an OAuth2 token, then makes
 * one safe, read-only call (list commodities, limit 1) to confirm the token
 * actually has API access. Never creates, updates, or deletes anything.
 */
export async function testConnection(config: CoupaConnectionConfig): Promise<CoupaTestResult> {
  let token: string;
  try {
    token = await getAccessToken(config);
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }

  const baseUrl = normalizeBaseUrl(config.instanceBaseUrl);
  try {
    const response = await fetch(`${baseUrl}/api/commodities?limit=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    const text = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        message: `Got a token, but the API call failed (HTTP ${response.status}): ${text.slice(0, 500)}`,
      };
    }
    return { ok: true, message: "Connected — token issued and API access confirmed." };
  } catch (err) {
    return {
      ok: false,
      message: `Got a token, but could not reach the API: ${(err as Error).message}`,
    };
  }
}
