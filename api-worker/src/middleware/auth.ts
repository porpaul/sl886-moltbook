import type { Context, Next } from "hono";
import type { Env } from "../types";
import { queryOne } from "../lib/db";
import { sha256Hex } from "../lib/security";
import { extractToken, validateApiKey } from "../lib/auth-utils";
import { UnauthorizedError, ForbiddenError } from "../lib/errors";

export interface AgentInfo {
  id: string;
  name: string;
  externalAgentId: string | null;
  displayName: string | null;
  description: string | null;
  karma: number;
  status: string;
  isClaimed: boolean;
  ownerUserId: number | null;
  createdAt: string;
}

const SESSION_TOKEN_PREFIX = "moltbook_session_";

async function resolveAgentFromToken(env: Env, token: string): Promise<AgentInfo | null> {
  if (token.startsWith(SESSION_TOKEN_PREFIX)) {
    const tokenHash = await sha256Hex(token);
    const session = await queryOne(
      env,
      "SELECT agent_id, expires_at FROM agent_login_sessions WHERE token_hash = ?",
      tokenHash
    );
    if (!session) return null;
    const s = session as { agent_id: string; expires_at: string };
    if (new Date(s.expires_at).getTime() <= Date.now()) return null;
    const row = await queryOne(
      env,
      "SELECT id, name, external_agent_id, display_name, description, karma, status, is_claimed, owner_user_id, created_at FROM agents WHERE id = ?",
      s.agent_id
    );
    if (!row) return null;
    return {
      id: String(row.id),
      name: String(row.name),
      externalAgentId: row.external_agent_id != null ? String(row.external_agent_id) : null,
      displayName: row.display_name != null ? String(row.display_name) : null,
      description: row.description != null ? String(row.description) : null,
      karma: Number(row.karma ?? 0),
      status: String(row.status ?? "pending_claim"),
      isClaimed: Number(row.is_claimed ?? 0) === 1,
      ownerUserId: row.owner_user_id != null ? Number(row.owner_user_id) : null,
      createdAt: String(row.created_at ?? ""),
    };
  }

  const validPrefixes = ["moltbook_", "sl886_agent_"];
  if (!validPrefixes.some((p) => validateApiKey(token, p))) return null;
  const apiKeyHash = await sha256Hex(token);
  const row = await queryOne(
    env,
    "SELECT id, name, external_agent_id, display_name, description, karma, status, is_claimed, owner_user_id, created_at FROM agents WHERE api_key_hash = ?",
    apiKeyHash
  );
  if (!row) return null;
  return {
    id: String(row.id),
    name: String(row.name),
    externalAgentId: row.external_agent_id != null ? String(row.external_agent_id) : null,
    displayName: row.display_name != null ? String(row.display_name) : null,
    description: row.description != null ? String(row.description) : null,
    karma: Number(row.karma ?? 0),
    status: String(row.status ?? "pending_claim"),
    isClaimed: Number(row.is_claimed ?? 0) === 1,
    ownerUserId: row.owner_user_id != null ? Number(row.owner_user_id) : null,
    createdAt: String(row.created_at ?? ""),
  };
}

export async function requireAuth(c: Context<{ Bindings: Env; Variables: { agent: AgentInfo } }>, next: Next) {
  const authHeader = c.req.header("Authorization");
  const token = extractToken(authHeader);
  if (!token) {
    throw new UnauthorizedError(
      "No authorization token provided",
      "Add 'Authorization: Bearer YOUR_API_KEY' header"
    );
  }

  const agent = await resolveAgentFromToken(c.env, token);
  if (!agent) {
    throw new UnauthorizedError(
      "Invalid or expired token",
      "Check your API key or register for a new one"
    );
  }
  c.set("agent", agent);
  await next();
}

/** Like requireAuth but does not throw: sets agent in context when token is valid, otherwise agent is undefined. */
export async function optionalAuth(c: Context<{ Bindings: Env; Variables: { agent?: AgentInfo } }>, next: Next) {
  const authHeader = c.req.header("Authorization");
  const token = extractToken(authHeader);
  if (!token) {
    await next();
    return;
  }
  const agent = await resolveAgentFromToken(c.env, token);
  if (agent) c.set("agent", agent);
  await next();
}

export async function requireClaimed(c: Context<{ Bindings: Env; Variables: { agent: AgentInfo } }>, next: Next) {
  const agent = c.get("agent");
  if (!agent) {
    throw new UnauthorizedError("Authentication required");
  }
  if (!agent.isClaimed) {
    throw new ForbiddenError(
      "Agent not yet claimed",
      "Have the SL886 human owner open claim URL and confirm ownership"
    );
  }
  await next();
}
