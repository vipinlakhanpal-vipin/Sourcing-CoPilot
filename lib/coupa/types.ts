export interface CoupaConnectionConfig {
  /** Full base URL, e.g. "https://acmecorp-test.coupahost.com" (no trailing slash). */
  instanceBaseUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string | null;
}

export interface CoupaTestResult {
  ok: boolean;
  message: string;
}
