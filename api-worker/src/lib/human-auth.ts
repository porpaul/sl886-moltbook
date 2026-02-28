import type { Context, Next } from "hono";
import type { Env } from "../types";
import { UnauthorizedError } from "./errors";

export interface HumanIdentity {
  userId: number;
  email?: string;
  name?: string;
}

function parseDevIdentity(
  c: Context<{ Bindings: Env }>,
  token: string
): HumanIdentity | null {
  const prefix = c.env.SL886_HUMAN_TOKEN_PREFIX ?? "dev-user-";
  if (!token.startsWith(prefix)) return null;
  const raw = token.slice(prefix.length);
  const userId = Number(raw);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  return {
    userId,
    email: c.req.header("X-SL886-Email") ?? `dev-user-${userId}@sl886.local`,
    name: c.req.header("X-SL886-Name") ?? `Dev User ${userId}`,
  };
}

export async function resolveHumanIdentity(
  c: Context<{ Bindings: Env }>
): Promise<HumanIdentity | null> {
  const auth = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  const bridge = c.req.header("X-SL886-Access-Token");
  const token = auth ?? bridge ?? "";
  if (!token) return null;

  const devIdentity = parseDevIdentity(c, token);
  if (devIdentity) return devIdentity;

  if (!c.env.SL886_AUTH_VERIFY_URL) return null;

  const verifyRes = await fetch(c.env.SL886_AUTH_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(c.env.SL886_AUTH_VERIFY_KEY
        ? { "X-SL886-Verify-Key": c.env.SL886_AUTH_VERIFY_KEY }
        : {}),
    },
    body: JSON.stringify({ token }),
  });
  if (!verifyRes.ok) return null;

  const payload = (await verifyRes.json()) as
    | { success?: boolean; data?: { userId?: number; email?: string; name?: string } }
    | { valid?: boolean; user?: { id?: number; email?: string; name?: string } };
  const dataUser = "data" in payload ? payload.data?.userId : undefined;
  const userUser = "user" in payload ? (payload as { user?: { id?: number } }).user?.id : undefined;
  const userId = Number(dataUser ?? userUser ?? 0);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  const email = "data" in payload ? (payload as { data?: { email?: string } }).data?.email : (payload as { user?: { email?: string } }).user?.email;
  const name = "data" in payload ? (payload as { data?: { name?: string } }).data?.name : (payload as { user?: { name?: string } }).user?.name;
  return { userId, email: email ?? undefined, name: name ?? undefined };
}

export async function requireHumanAuth(
  c: Context<{ Bindings: Env; Variables: { human?: HumanIdentity } }>,
  next: Next
): Promise<void> {
  const identity = await resolveHumanIdentity(c as unknown as Context<{ Bindings: Env }>);
  if (!identity) {
    throw new UnauthorizedError("SL886 human identity verification failed");
  }
  c.set("human", identity);
  await next();
}
