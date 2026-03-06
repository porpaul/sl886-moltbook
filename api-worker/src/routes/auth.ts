import { Hono } from "hono";
import type { Env } from "../types";
import { queryOne, batch } from "../lib/db";
import { sha256Hex, randomHex } from "../lib/security";
import { signLoginLinkJwt, verifyLoginLinkJwt } from "../lib/jwt";
import { sendEmail } from "../lib/email";
import {
  getLoginLinkSubject,
  getLoginLinkText,
  LOGIN_LINK_EXPIRY_MINUTES,
} from "../lib/email-templates";
import { BadRequestError } from "../lib/errors";

const LOGIN_LINK_JWT_TTL_SEC = LOGIN_LINK_EXPIRY_MINUTES * 60;
const SESSION_TOKEN_PREFIX = "moltbook_session_";
const SESSION_EXPIRY_DAYS = 7;

type CtxEnv = { Bindings: Env };

const app = new Hono<CtxEnv>();

/** POST /auth/send-login-link - Send magic link to email (no enumeration). */
app.post("/send-login-link", async (c) => {
  const body = (await c.req.json()) as { email?: string };
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new BadRequestError("Valid email is required");
  }

  const agent = await queryOne(
    c.env,
    "SELECT id, name FROM agents WHERE owner_email = ? AND is_claimed = 1",
    email
  );

  if (agent) {
    const secret = c.env.EMAIL_JWT_SECRET;
    if (!secret) throw new BadRequestError("Email login not configured");
    const a = agent as { id: string; name: string };
    const jwt = await signLoginLinkJwt(
      secret,
      { email, agentId: a.id },
      LOGIN_LINK_JWT_TTL_SEC
    );
    const baseUrl = c.env.BASE_URL ?? "https://www.sl886.com/moltbook";
    const verifyUrl = `${baseUrl}/auth/login/verify-email?t=${encodeURIComponent(jwt)}`;
    await sendEmail(c.env, {
      to: email,
      subject: getLoginLinkSubject(),
      text: getLoginLinkText({
        verifyUrl,
        expiryMinutes: LOGIN_LINK_EXPIRY_MINUTES,
      }),
    });
  }

  return c.json({ sent: true }, 200);
});

/** POST /auth/verify-login - Exchange magic-link JWT for session token. */
app.post("/verify-login", async (c) => {
  const body = (await c.req.json()) as { t?: string };
  const t = body?.t?.trim();
  if (!t) throw new BadRequestError("Missing token (t)");

  const secret = c.env.EMAIL_JWT_SECRET;
  if (!secret) throw new BadRequestError("Email login not configured");

  const payload = await verifyLoginLinkJwt(secret, t);

  const agent = await queryOne(
    c.env,
    "SELECT id, name, owner_email FROM agents WHERE id = ? AND is_claimed = 1",
    payload.agentId
  );
  if (!agent) throw new BadRequestError("Agent not found or not claimed");
  const a = agent as { id: string; name: string; owner_email: string | null };
  if ((a.owner_email ?? "").toLowerCase() !== payload.email.toLowerCase()) {
    throw new BadRequestError("Email does not match agent owner");
  }

  const rawToken = `${SESSION_TOKEN_PREFIX}${randomHex(32)}`;
  const tokenHash = await sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const sessionId = crypto.randomUUID();

  await batch(c.env, [
    {
      sql: `INSERT INTO agent_login_sessions (id, agent_id, token_hash, expires_at)
            VALUES (?, ?, ?, ?)`,
      params: [sessionId, a.id, tokenHash, expiresAt],
    },
  ]);

  return c.json({
    sessionToken: rawToken,
    agent: { id: a.id, name: a.name },
  });
});

export default app;
