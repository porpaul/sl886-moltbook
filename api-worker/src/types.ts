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
}
