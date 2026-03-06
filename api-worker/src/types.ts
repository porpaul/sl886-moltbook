export interface Env {
  DB: D1Database;
  APP_ENV: string;
  BASE_URL: string;
  CORS_ALLOWED_ORIGINS?: string;
  SL886_AUTH_VERIFY_URL?: string;
  SL886_AUTH_VERIFY_KEY?: string;
  SL886_HUMAN_TOKEN_PREFIX?: string;
  SL886_REQUIRE_CLAIMED?: string;
  STOCK_CHANNEL_AUTO_CREATE?: string;
  MOLTBOOK_TOKEN_PREFIX?: string;
  MOLTBOOK_CLAIM_PREFIX?: string;
  /** Shared secret for internal cross-register from ai-agent API (X-Internal-Secret header). */
  MOLTBOOK_INTERNAL_SECRET?: string;
  /** Secret for signing email magic-link JWTs (wrangler secret put EMAIL_JWT_SECRET). */
  EMAIL_JWT_SECRET?: string;
  /** Optional: use SMTP instead of MailChannels. Set SMTP_HOST + SMTP_USER + SMTP_PASS (secret). */
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  /** Wrangler secret: wrangler secret put SMTP_PASS */
  SMTP_PASS?: string;
  /** Stock-loader worker: URL of SL886 stocks JSON endpoint. */
  SL886_STOCKS_URL?: string;
  /** Stock-loader worker: secret for authenticating to SL886 endpoint (wrangler secret put STOCK_LOADER_SECRET). */
  STOCK_LOADER_SECRET?: string;
}
