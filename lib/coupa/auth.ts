import { CoupaConnectionConfig } from "./types";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * OAuth2 client-credentials token exchange, per Coupa's documented flow:
 * https://compass.coupa.com/en-us/products/product-documentation/integration-technical-documentation/the-coupa-core-api/oauth-2.0-and-oidc
 * Coupa's legacy API-key header (OAUTH_KEY) is deprecated — this is the current method.
 */
export async function getAccessToken(config: CoupaConnectionConfig): Promise<string> {
  const baseUrl = normalizeBaseUrl(config.instanceBaseUrl);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  if (config.scope) body.set("scope", config.scope);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    throw new Error(
      `Could not reach ${baseUrl}/oauth2/token — check the instance URL. (${(err as Error).message})`
    );
  }

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Coupa rejected the OAuth2 token request (HTTP ${response.status}): ${text.slice(0, 500)}`);
  }

  let data: { access_token?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Coupa's token response wasn't valid JSON: ${text.slice(0, 500)}`);
  }

  if (!data.access_token) {
    throw new Error(`Coupa's token response had no access_token: ${text.slice(0, 500)}`);
  }

  return data.access_token;
}
