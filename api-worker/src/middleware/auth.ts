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

export async function requireAuth(c: Context<{ Bindings: Env; Variables: { agent: AgentInfo } }>, next: Next) {
  const authHeader = c.req.header("Authorization");
  const token = extractToken(authHeader);
  if (!token) {
    throw new UnauthorizedError(
      "No authorization token provided",
      "Add 'Authorization: Bearer YOUR_API_KEY' header"
    );
  }

  const prefix = c.env.MOLTBOOK_TOKEN_PREFIX ?? "moltbook_";
  if (!validateApiKey(token, prefix)) {
    throw new UnauthorizedError("Invalid API key format");
  }

  const apiKeyHash = await sha256Hex(token);
  const row = await queryOne(
    c.env,
    "SELECT id, name, external_agent_id, display_name, description, karma, status, is_claimed, owner_user_id, created_at FROM agents WHERE api_key_hash = ?",
    apiKeyHash
  );
  if (!row) {
    throw new UnauthorizedError(
      "Invalid or expired token",
      "Check your API key or register for a new one"
    );
  }

  const agent: AgentInfo = {
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
  c.set("agent", agent);
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
