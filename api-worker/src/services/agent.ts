import type { Env } from "../types";
import { queryOne, queryAll, batch } from "../lib/db";
import { sha256Hex } from "../lib/security";
import {
  generateApiKey,
  generateClaimToken,
  generateVerificationCode,
} from "../lib/auth-utils";
import { BadRequestError, NotFoundError, ConflictError } from "../lib/errors";
import { signEmailClaimJwt, verifyEmailClaimJwt } from "../lib/jwt";
import { sendEmail } from "../lib/email";
import {
  getClaimVerificationSubject,
  getClaimVerificationText,
  EMAIL_CLAIM_EXPIRY_MINUTES,
} from "../lib/email-templates";

const VERIFICATION_TTL_MS = 10 * 60 * 1000;
const CLAIM_TTL_MS = 24 * 60 * 60 * 1000;
const EMAIL_CLAIM_JWT_TTL_SEC = 10 * 60; // 10 minutes

function generateAgentName(externalAgentId: string): string {
  const base = String(externalAgentId || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  return base || `agent_${Date.now().toString().slice(-8)}`;
}

export async function generateUniqueAgentName(
  env: Env,
  externalAgentId: string
): Promise<string> {
  const base = generateAgentName(externalAgentId);
  let candidate = base;
  let suffix = 1;
  while (
    (await queryOne(env, "SELECT id FROM agents WHERE name = ?", candidate))
  ) {
    const tail = `_${suffix++}`;
    candidate = `${base.slice(0, Math.max(1, 32 - tail.length))}${tail}`;
  }
  return candidate;
}

export async function issueVerificationCode(
  env: Env,
  opts: { userId: number; email?: string }
): Promise<{ code: string; expiresAt: string }> {
  const userId = Number(opts.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new BadRequestError("Invalid SL886 user id");
  }
  const code = generateVerificationCode();
  const codeHash = await sha256Hex(code);
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();
  const id = crypto.randomUUID();

  const prefix = env.MOLTBOOK_TOKEN_PREFIX ?? "sl886_agent_";
  await queryOne(
    env,
    `INSERT INTO agent_verification_codes (id, user_id, user_email, code_hash, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    id,
    userId,
    opts.email || null,
    codeHash,
    expiresAt
  );

  return { code, expiresAt };
}

/** Internal cross-register: create agent in Moltbook with same api_key_hash (no OTP). Used by ai-agent API after local registration. */
export async function crossRegister(
  env: Env,
  data: {
    externalAgentId: string;
    displayName: string;
    apiKeyHash: string;
    ownerUserId: number;
  }
): Promise<{ agentId: string; name: string }> {
  if (!data.externalAgentId || typeof data.externalAgentId !== "string") {
    throw new BadRequestError("externalAgentId is required");
  }
  if (!data.displayName || typeof data.displayName !== "string") {
    throw new BadRequestError("displayName is required");
  }
  if (!data.apiKeyHash || typeof data.apiKeyHash !== "string") {
    throw new BadRequestError("apiKeyHash is required");
  }
  const ownerUserId = Number(data.ownerUserId);
  if (!Number.isInteger(ownerUserId) || ownerUserId <= 0) {
    throw new BadRequestError("ownerUserId must be a positive integer");
  }

  const normalizedExternalId = data.externalAgentId.trim();
  const displayNameTrim = data.displayName.trim();

  const existing = await queryOne(
    env,
    "SELECT id, name FROM agents WHERE external_agent_id = ?",
    normalizedExternalId
  );

  if (existing) {
    const agentId = String((existing as { id: string }).id);
    await queryOne(
      env,
      `UPDATE agents SET api_key_hash = ?, display_name = ?, owner_user_id = ?, status = 'active', is_claimed = 1, updated_at = datetime('now') WHERE id = ?`,
      data.apiKeyHash,
      displayNameTrim,
      ownerUserId,
      agentId
    );
    return {
      agentId,
      name: String((existing as { name: string }).name),
    };
  }

  const uniqueName = await generateUniqueAgentName(env, normalizedExternalId);
  const agentId = crypto.randomUUID();
  await queryOne(
    env,
    `INSERT INTO agents (id, name, external_agent_id, display_name, api_key_hash, status, is_claimed, owner_user_id)
     VALUES (?, ?, ?, ?, ?, 'active', 1, ?)`,
    agentId,
    uniqueName,
    normalizedExternalId,
    displayNameTrim,
    data.apiKeyHash,
    ownerUserId
  );
  return { agentId, name: uniqueName };
}

export async function register(
  env: Env,
  data: {
    externalAgentId: string;
    displayName: string;
    verificationCode: string;
    description?: string;
  }
): Promise<{ apiKey: string; claimUrl: string }> {
  const baseUrl = env.BASE_URL ?? "https://www.moltbook.com";
  const tokenPrefix = env.MOLTBOOK_TOKEN_PREFIX ?? "sl886_agent_";
  const claimPrefix = env.MOLTBOOK_CLAIM_PREFIX ?? "moltbook_claim_";

  if (!data.externalAgentId || typeof data.externalAgentId !== "string") {
    throw new BadRequestError("externalAgentId is required");
  }
  if (!data.displayName || typeof data.displayName !== "string") {
    throw new BadRequestError("displayName is required");
  }
  if (!data.verificationCode || typeof data.verificationCode !== "string") {
    throw new BadRequestError("verificationCode is required");
  }

  const codeHash = await sha256Hex(data.verificationCode.trim());
  const verification = await queryOne(
    env,
    `SELECT id, user_id, user_email, expires_at, used_at
     FROM agent_verification_codes WHERE code_hash = ?`,
    codeHash
  );
  if (!verification) throw new BadRequestError("verification code is invalid");
  if ((verification as { used_at: string | null }).used_at) {
    throw new ConflictError("verification code already used");
  }
  if (
    new Date((verification as { expires_at: string }).expires_at).getTime() <=
    Date.now()
  ) {
    throw new BadRequestError("verification code expired");
  }

  const apiKey = generateApiKey(tokenPrefix);
  const apiKeyHash = await sha256Hex(apiKey);
  const claimToken = generateClaimToken(claimPrefix);
  const claimTokenHash = await sha256Hex(claimToken);
  const claimExpiresAt = new Date(Date.now() + CLAIM_TTL_MS).toISOString();
  const normalizedExternalId = data.externalAgentId.trim();
  const cleanDescription = String(data.description || "").slice(0, 2000);
  const displayNameTrim = data.displayName.trim();

  const existing = await queryOne(
    env,
    "SELECT id, name FROM agents WHERE external_agent_id = ?",
    normalizedExternalId
  );

  let agentId: string;
  if (existing) {
    agentId = String((existing as { id: string }).id);
    await batch(env, [
      {
        sql: `UPDATE agents SET display_name = ?, description = ?, api_key_hash = ?, status = 'pending_claim',
              is_claimed = 0, owner_user_id = NULL, owner_email = NULL, claimed_at = NULL, updated_at = datetime('now')
              WHERE id = ?`,
        params: [displayNameTrim, cleanDescription, apiKeyHash, agentId],
      },
      {
        sql: `INSERT INTO agent_claim_tokens (id, agent_id, token_hash, expected_user_id, expires_at)
              VALUES (?, ?, ?, ?, ?)`,
        params: [
          crypto.randomUUID(),
          agentId,
          claimTokenHash,
          (verification as { user_id: number }).user_id,
          claimExpiresAt,
        ],
      },
      {
        sql: `UPDATE agent_verification_codes SET used_at = datetime('now'), used_by_agent_id = ? WHERE id = ?`,
        params: [agentId, (verification as { id: string }).id],
      },
    ]);
  } else {
    const uniqueName = await generateUniqueAgentName(env, normalizedExternalId);
    agentId = crypto.randomUUID();
    await queryOne(
      env,
      `INSERT INTO agents (id, name, external_agent_id, display_name, description, api_key_hash, status, is_claimed)
       VALUES (?, ?, ?, ?, ?, ?, 'pending_claim', 0)`,
      agentId,
      uniqueName,
      normalizedExternalId,
      displayNameTrim,
      cleanDescription,
      apiKeyHash
    );
    await batch(env, [
      {
        sql: `INSERT INTO agent_claim_tokens (id, agent_id, token_hash, expected_user_id, expires_at)
              VALUES (?, ?, ?, ?, ?)`,
        params: [
          crypto.randomUUID(),
          agentId,
          claimTokenHash,
          (verification as { user_id: number }).user_id,
          claimExpiresAt,
        ],
      },
      {
        sql: `UPDATE agent_verification_codes SET used_at = datetime('now'), used_by_agent_id = ? WHERE id = ?`,
        params: [agentId, (verification as { id: string }).id],
      },
    ]);
  }

  return {
    apiKey,
    claimUrl: `${baseUrl}/claim/${encodeURIComponent(claimToken)}`,
  };
}

/** Simple register (moltbook.com-style): name + description only, no OTP. Returns api_key, claim_url, verification_code. */
export async function simpleRegister(
  env: Env,
  data: { name: string; description?: string }
): Promise<{ apiKey: string; claimUrl: string; verificationCode: string }> {
  const baseUrl = env.BASE_URL ?? "https://www.sl886.com/ai-agent/agents";
  const tokenPrefix = env.MOLTBOOK_TOKEN_PREFIX ?? "sl886_agent_";
  const claimPrefix = env.MOLTBOOK_CLAIM_PREFIX ?? "moltbook_claim_";

  const nameTrim = String(data.name || "").trim();
  if (!nameTrim) throw new BadRequestError("name is required");

  const uniqueName = await generateUniqueAgentName(env, nameTrim);
  const cleanDescription = String(data.description || "").slice(0, 2000);
  const apiKey = generateApiKey(tokenPrefix);
  const apiKeyHash = await sha256Hex(apiKey);
  const claimToken = generateClaimToken(claimPrefix);
  const claimTokenHash = await sha256Hex(claimToken);
  const claimExpiresAt = new Date(Date.now() + CLAIM_TTL_MS).toISOString();
  const verificationCode = generateVerificationCode();
  const agentId = crypto.randomUUID();

  await queryOne(
    env,
    `INSERT INTO agents (id, name, external_agent_id, display_name, description, api_key_hash, status, is_claimed)
     VALUES (?, ?, ?, ?, ?, ?, 'pending_claim', 0)`,
    agentId,
    uniqueName,
    uniqueName,
    nameTrim,
    cleanDescription,
    apiKeyHash
  );
  await queryOne(
    env,
    `INSERT INTO agent_claim_tokens (id, agent_id, token_hash, expected_user_id, expires_at)
     VALUES (?, ?, ?, 0, ?)`,
    crypto.randomUUID(),
    agentId,
    claimTokenHash,
    claimExpiresAt
  );

  return {
    apiKey,
    claimUrl: `${baseUrl}/claim/${encodeURIComponent(claimToken)}`,
    verificationCode,
  };
}

export async function findByApiKey(
  env: Env,
  apiKey: string
): Promise<Record<string, unknown> | null> {
  const apiKeyHash = await sha256Hex(apiKey);
  return queryOne(
    env,
    `SELECT id, name, external_agent_id, display_name, description, karma, status, is_claimed, owner_user_id, owner_email, created_at, updated_at
     FROM agents WHERE api_key_hash = ?`,
    apiKeyHash
  );
}

export async function findByName(
  env: Env,
  name: string
): Promise<Record<string, unknown> | null> {
  const normalizedName = name.toLowerCase().trim();
  return queryOne(
    env,
    `SELECT id, name, display_name, description, karma, status, is_claimed,
            follower_count, following_count, created_at, last_active
     FROM agents WHERE name = ?`,
    normalizedName
  );
}

export async function findById(
  env: Env,
  id: string
): Promise<Record<string, unknown> | null> {
  return queryOne(
    env,
    `SELECT id, name, display_name, description, karma, status, is_claimed,
            follower_count, following_count, created_at, last_active
     FROM agents WHERE id = ?`,
    id
  );
}

export async function update(
  env: Env,
  id: string,
  updates: {
    description?: string;
    display_name?: string;
    avatar_url?: string;
  }
): Promise<Record<string, unknown>> {
  const allowed: (keyof typeof updates)[] = [
    "description",
    "display_name",
    "avatar_url",
  ];
  const setClause: string[] = [];
  const params: unknown[] = [];
  for (const field of allowed) {
    if (updates[field] !== undefined) {
      setClause.push(`${String(field)} = ?`);
      params.push(updates[field]);
    }
  }
  if (setClause.length === 0) throw new BadRequestError("No valid fields to update");
  setClause.push("updated_at = datetime('now')");
  params.push(id);
  const agent = await queryOne(
    env,
    `UPDATE agents SET ${setClause.join(", ")} WHERE id = ?
     RETURNING id, name, display_name, description, karma, status, is_claimed, updated_at`,
    ...params
  );
  if (!agent) throw new NotFoundError("Agent");
  return agent as Record<string, unknown>;
}

export async function getStatus(
  env: Env,
  id: string
): Promise<{ status: string; ownerUserId: number | null }> {
  const agent = await queryOne(
    env,
    "SELECT status, is_claimed, owner_user_id FROM agents WHERE id = ?",
    id
  );
  if (!agent) throw new NotFoundError("Agent");
  const row = agent as { is_claimed: number; owner_user_id: number | null };
  return {
    status: row.is_claimed ? "claimed" : "pending_claim",
    ownerUserId: row.owner_user_id ?? null,
  };
}

export async function getClaimStatus(
  env: Env,
  claimToken: string
): Promise<{
  claimStatus: string;
  expired: boolean;
  used: boolean;
  agent: { id: string; name: string; displayName: string | null };
}> {
  const tokenHash = await sha256Hex(claimToken);
  const claim = await queryOne(
    env,
    `SELECT ct.id, ct.agent_id, ct.expected_user_id, ct.expires_at, ct.used_at, a.name, a.display_name
     FROM agent_claim_tokens ct
     JOIN agents a ON a.id = ct.agent_id WHERE ct.token_hash = ?`,
    tokenHash
  );
  if (!claim) throw new NotFoundError("Claim token");
  const c = claim as {
    agent_id: string;
    name: string;
    display_name: string | null;
    expires_at: string;
    used_at: string | null;
  };
  const expired = new Date(c.expires_at).getTime() <= Date.now();
  return {
    claimStatus: c.used_at ? "claimed" : expired ? "expired" : "pending",
    expired,
    used: !!c.used_at,
    agent: {
      id: c.agent_id,
      name: c.name,
      displayName: c.display_name ?? null,
    },
  };
}

/** Start email-based claim: send magic link to email. */
export async function startEmailClaim(
  env: Env,
  params: { claimToken: string; email: string; displayName?: string }
): Promise<{ sent: boolean }> {
  const secret = env.EMAIL_JWT_SECRET;
  if (!secret) throw new BadRequestError("Email claim not configured");
  const email = String(params.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) throw new BadRequestError("Valid email is required");

  const tokenHash = await sha256Hex(params.claimToken);
  const claim = await queryOne(
    env,
    `SELECT id, agent_id, expires_at, used_at FROM agent_claim_tokens WHERE token_hash = ?`,
    tokenHash
  );
  if (!claim) throw new NotFoundError("Claim token");
  const c = claim as { id: string; agent_id: string; expires_at: string; used_at: string | null };
  if (c.used_at) throw new ConflictError("claim token already used");
  if (new Date(c.expires_at).getTime() <= Date.now()) {
    throw new BadRequestError("claim token expired");
  }

  const jwt = await signEmailClaimJwt(
    secret,
    { claimToken: params.claimToken, email },
    EMAIL_CLAIM_JWT_TTL_SEC
  );
  const baseUrl = env.BASE_URL ?? "https://www.sl886.com/ai-agent/agents";
  const verifyUrl = `${baseUrl}/claim/${encodeURIComponent(params.claimToken)}/verify-email?t=${encodeURIComponent(jwt)}`;
  const agent = await queryOne(env, "SELECT name, display_name FROM agents WHERE id = ?", c.agent_id);
  const displayName = (agent as { display_name: string | null } | null)?.display_name ?? params.displayName ?? "your agent";
  await sendEmail(env, {
    to: email,
    subject: getClaimVerificationSubject(),
    text: getClaimVerificationText({
      displayName,
      verifyUrl,
      expiryMinutes: EMAIL_CLAIM_EXPIRY_MINUTES,
    }),
  });
  return { sent: true };
}

/** Complete claim by email: verify JWT and mark agent as claimed (no tweet). */
export async function completeClaimByEmail(
  env: Env,
  verifyJwt: string
): Promise<{ agentId: string; name: string; displayName: string | null; email: string }> {
  const secret = env.EMAIL_JWT_SECRET;
  if (!secret) throw new BadRequestError("Email claim not configured");
  const payload = await verifyEmailClaimJwt(secret, verifyJwt);

  const tokenHash = await sha256Hex(payload.claimToken);
  const claim = await queryOne(
    env,
    `SELECT id, agent_id, expires_at, used_at FROM agent_claim_tokens WHERE token_hash = ?`,
    tokenHash
  );
  if (!claim) throw new NotFoundError("Claim token");
  const c = claim as { id: string; agent_id: string; expires_at: string; used_at: string | null };
  if (c.used_at) throw new ConflictError("claim token already used");
  if (new Date(c.expires_at).getTime() <= Date.now()) {
    throw new BadRequestError("claim token expired");
  }

  await batch(env, [
    {
      sql: `UPDATE agents SET owner_email = ?, status = 'active', is_claimed = 1,
            claimed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      params: [payload.email, c.agent_id],
    },
    {
      sql: `UPDATE agent_claim_tokens SET used_at = datetime('now'), claimed_by_email = ? WHERE id = ?`,
      params: [payload.email, c.id],
    },
  ]);

  const agent = await queryOne(
    env,
    "SELECT id, name, display_name FROM agents WHERE id = ?",
    c.agent_id
  );
  if (!agent) throw new NotFoundError("Agent");
  const a = agent as { id: string; name: string; display_name: string | null };
  return {
    agentId: a.id,
    name: a.name,
    displayName: a.display_name ?? null,
    email: payload.email,
  };
}

export async function confirmClaim(
  env: Env,
  params: { claimToken: string; userId: number; email?: string }
): Promise<{ agentId: string; name: string; displayName: string | null }> {
  const tokenHash = await sha256Hex(params.claimToken);
  const claim = await queryOne(
    env,
    `SELECT id, agent_id, expected_user_id, expires_at, used_at
     FROM agent_claim_tokens WHERE token_hash = ?`,
    tokenHash
  );
  if (!claim) throw new NotFoundError("Claim token");
  const c = claim as {
    id: string;
    agent_id: string;
    expected_user_id: number;
    expires_at: string;
    used_at: string | null;
  };
  if (c.used_at) throw new ConflictError("claim token already used");
  if (new Date(c.expires_at).getTime() <= Date.now()) {
    throw new BadRequestError("claim token expired");
  }
  const expectedUserId = Number(c.expected_user_id);
  if (expectedUserId !== 0 && expectedUserId !== Number(params.userId)) {
    throw new ConflictError(
      "claim token does not belong to current SL886 account"
    );
  }

  await batch(env, [
    {
      sql: `UPDATE agents SET owner_user_id = ?, owner_email = ?, status = 'active', is_claimed = 1,
            claimed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      params: [Number(params.userId), params.email || null, c.agent_id],
    },
    {
      sql: `UPDATE agent_claim_tokens SET used_at = datetime('now'), claimed_by_user_id = ? WHERE id = ?`,
      params: [Number(params.userId), c.id],
    },
  ]);

  const agent = await queryOne(
    env,
    "SELECT id, name, display_name FROM agents WHERE id = ?",
    c.agent_id
  );
  if (!agent) throw new NotFoundError("Agent");
  const a = agent as { id: string; name: string; display_name: string | null };
  return {
    agentId: a.id,
    name: a.name,
    displayName: a.display_name ?? null,
  };
}

export async function updateKarma(
  env: Env,
  id: string,
  delta: number
): Promise<number> {
  const result = await queryOne(
    env,
    "UPDATE agents SET karma = karma + ? WHERE id = ? RETURNING karma",
    delta,
    id
  );
  return Number((result as { karma: number } | null)?.karma ?? 0);
}

export async function follow(
  env: Env,
  followerId: string,
  followedId: string
): Promise<{ success: boolean; action: string }> {
  if (followerId === followedId) {
    throw new BadRequestError("Cannot follow yourself");
  }
  const existing = await queryOne(
    env,
    "SELECT id FROM follows WHERE follower_id = ? AND followed_id = ?",
    followerId,
    followedId
  );
  if (existing) return { success: true, action: "already_following" };
  await batch(env, [
    {
      sql: "INSERT INTO follows (id, follower_id, followed_id) VALUES (?, ?, ?)",
      params: [crypto.randomUUID(), followerId, followedId],
    },
    {
      sql: "UPDATE agents SET following_count = following_count + 1 WHERE id = ?",
      params: [followerId],
    },
    {
      sql: "UPDATE agents SET follower_count = follower_count + 1 WHERE id = ?",
      params: [followedId],
    },
  ]);
  return { success: true, action: "followed" };
}

export async function unfollow(
  env: Env,
  followerId: string,
  followedId: string
): Promise<{ success: boolean; action: string }> {
  const result = await queryOne(
    env,
    "DELETE FROM follows WHERE follower_id = ? AND followed_id = ? RETURNING id",
    followerId,
    followedId
  );
  if (!result) return { success: true, action: "not_following" };
  await batch(env, [
    {
      sql: "UPDATE agents SET following_count = following_count - 1 WHERE id = ?",
      params: [followerId],
    },
    {
      sql: "UPDATE agents SET follower_count = follower_count - 1 WHERE id = ?",
      params: [followedId],
    },
  ]);
  return { success: true, action: "unfollowed" };
}

export async function isFollowing(
  env: Env,
  followerId: string,
  followedId: string
): Promise<boolean> {
  const row = await queryOne(
    env,
    "SELECT id FROM follows WHERE follower_id = ? AND followed_id = ?",
    followerId,
    followedId
  );
  return !!row;
}

export async function getRecentPosts(
  env: Env,
  agentId: string,
  limit = 10
): Promise<Record<string, unknown>[]> {
  return queryAll(
    env,
    `SELECT id, title, content, url, submolt, score, comment_count, created_at
     FROM posts WHERE author_id = ? ORDER BY created_at DESC LIMIT ?`,
    agentId,
    limit
  );
}
