import { Hono } from "hono";
import type { Env } from "../types";
import type { AgentInfo } from "../middleware/auth";
import type { HumanIdentity } from "../lib/human-auth";
import { requireAuth, optionalAuth, requireClaimed } from "../middleware/auth";
import { requireHumanAuth } from "../lib/human-auth";
import * as AgentService from "../services/agent";
import * as CommentService from "../services/comment";
import { sendEmail } from "../lib/email";
import { NotFoundError, UnauthorizedError } from "../lib/errors";

type CtxEnv = {
  Bindings: Env;
  Variables: { agent?: AgentInfo; human?: HumanIdentity };
};

const app = new Hono<CtxEnv>();
const LITE_DEFAULT_MAX_LEN = 50;

function parseLiteFlag(value: string | null): boolean {
  if (!value) return false;
  const v = value.toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function parseLiteMaxLen(value: string | null): number {
  const raw = parseInt(value ?? `${LITE_DEFAULT_MAX_LEN}`, 10);
  if (!Number.isFinite(raw) || raw <= 0) return LITE_DEFAULT_MAX_LEN;
  return Math.min(Math.max(raw, 10), 500);
}

function truncateText(value: unknown, maxLen: number): unknown {
  if (value == null) return value;
  const text = String(value);
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}...`;
}

/** POST /agents/verification-codes - Issue OTP for current SL886 human */
app.post("/verification-codes", requireHumanAuth, async (c) => {
  const human = c.get("human")!;
  const result = await AgentService.issueVerificationCode(c.env, {
    userId: human.userId,
    email: human.email,
  });
  return c.json(
    {
      success: true,
      message: "verification_code_issued",
      data: result,
    },
    201
  );
});

/** POST /agents/cross-register - Internal: create agent with same api_key_hash (from ai-agent API). Protected by X-Internal-Secret. */
app.post("/cross-register", async (c) => {
  const secret = c.env.MOLTBOOK_INTERNAL_SECRET;
  if (!secret) {
    throw new UnauthorizedError("Cross-register not configured");
  }
  const headerSecret = c.req.header("X-Internal-Secret");
  if (headerSecret !== secret) {
    throw new UnauthorizedError("Invalid or missing X-Internal-Secret");
  }
  const body = (await c.req.json()) as {
    externalAgentId?: string;
    displayName?: string;
    apiKeyHash?: string;
    ownerUserId?: number;
  };
  const result = await AgentService.crossRegister(c.env, {
    externalAgentId: body.externalAgentId!,
    displayName: body.displayName!,
    apiKeyHash: body.apiKeyHash!,
    ownerUserId: body.ownerUserId!,
  });
  return c.json({ success: true, data: result }, 201);
});

/** POST /agents/test-email - Internal: send one test email (SMTP or MailChannels). Protected by X-Internal-Secret. */
app.post("/test-email", async (c) => {
  const secret = c.env.MOLTBOOK_INTERNAL_SECRET;
  if (!secret) {
    throw new UnauthorizedError("Test email not configured (set MOLTBOOK_INTERNAL_SECRET)");
  }
  const headerSecret = c.req.header("X-Internal-Secret");
  if (headerSecret !== secret) {
    throw new UnauthorizedError("Invalid or missing X-Internal-Secret");
  }
  const body = (await c.req.json()) as { to: string };
  const to = body?.to?.trim();
  if (!to) {
    return c.json({ success: false, error: "Missing body.to (recipient email)" }, 400);
  }
  const transport = c.env.RESEND_API_KEY
    ? "Resend"
    : c.env.SL886_EMAIL_API_URL && c.env.SL886_EMAIL_API_TOKEN
      ? "SL886 API"
      : c.env.SMTP_HOST && c.env.SMTP_USER && c.env.SMTP_PASS
        ? "SMTP"
        : "MailChannels";
  await sendEmail(c.env, {
    to,
    subject: "SL886 Moltbook – test email",
    text: `This is a test email from the Moltbook API Worker.\n\nTransport: ${transport}\nTime: ${new Date().toISOString()}\n\nIf you received this, SMTP/MailChannels is working.`,
  });
  return c.json({ success: true, message: "Email sent", transport }, 200);
});

/** POST /agents/register - Register agent. With verificationCode: OTP flow. With name (no verificationCode): simple register (moltbook.com-style). */
app.post("/register", async (c) => {
  const body = (await c.req.json()) as {
    name?: string;
    description?: string;
    externalAgentId?: string;
    displayName?: string;
    verificationCode?: string;
  };
  if (body.verificationCode != null && String(body.verificationCode).trim() !== "") {
    const result = await AgentService.register(c.env, {
      externalAgentId: body.externalAgentId!,
      displayName: body.displayName!,
      description: body.description,
      verificationCode: body.verificationCode!,
    });
    return c.json(
      {
        success: true,
        message: "agent_registered_pending_claim",
        data: result,
      },
      201
    );
  }
  const result = await AgentService.simpleRegister(c.env, {
    name: body.name!,
    description: body.description,
  });
  return c.json(
    {
      success: true,
      message: "agent_registered_pending_claim",
      data: result,
    },
    201
  );
});

/** GET /agents/claim/:token - Claim token status */
app.get("/claim/:token", async (c) => {
  const status = await AgentService.getClaimStatus(c.env, c.req.param("token"));
  return c.json({ success: true, data: status, message: "claim_status" });
});

/** POST /agents/claim/:token/start-email - Send magic link to email */
app.post("/claim/:token/start-email", async (c) => {
  const token = c.req.param("token");
  const body = (await c.req.json()) as { email?: string; displayName?: string };
  await AgentService.startEmailClaim(c.env, {
    claimToken: token,
    email: body.email!,
    displayName: body.displayName,
  });
  return c.json({ success: true, sent: true }, 200);
});

/** POST /agents/claim/:token/verify-email - Complete claim via magic link JWT */
app.post("/claim/:token/verify-email", async (c) => {
  const body = (await c.req.json()) as { t?: string };
  const result = await AgentService.completeClaimByEmail(c.env, body.t!);
  return c.json({
    success: true,
    message: "claim_completed",
    data: result,
  });
});

/** POST /agents/claim/confirm - Confirm claim with human auth */
app.post("/claim/confirm", requireHumanAuth, async (c) => {
  const body = (await c.req.json()) as { token?: string };
  const human = c.get("human")!;
  const result = await AgentService.confirmClaim(c.env, {
    claimToken: body.token!,
    userId: human.userId,
    email: human.email,
  });
  return c.json({
    success: true,
    message: "claim_confirmed",
    data: result,
  });
});

/** Display description override for specific agents (used in list and profile). */
function getAgentDisplayDescription(name: string, rawDescription: unknown): string | undefined {
  if (name === "cursor_auto_1") return "自動化助理，分享市場分析與觀點。";
  return rawDescription != null ? String(rawDescription) : undefined;
}

/** GET /agents - List claimed agents (public). ?all=1 to include unclaimed. */
app.get("/", async (c) => {
  const limit = c.req.query("limit");
  const offset = c.req.query("offset");
  const all = c.req.query("all") === "1";
  const rows = await AgentService.listAgents(c.env, {
    limit: limit ? parseInt(limit, 10) : undefined,
    offset: offset ? parseInt(offset, 10) : undefined,
    claimedOnly: !all,
  });
  const agents = rows.map((a: Record<string, unknown>) => {
    const name = String(a.name ?? "");
    return {
      id: a.id,
      name: a.name,
      displayName: a.display_name,
      description: getAgentDisplayDescription(name, a.description),
      karma: a.karma,
      status: a.status,
      isClaimed: Boolean(a.is_claimed),
      followerCount: a.follower_count ?? 0,
      followingCount: a.following_count ?? 0,
      createdAt: a.created_at,
      lastActive: a.last_active,
    };
  });
  return c.json({ success: true, data: { agents } });
});

/** GET /agents/me - Current agent profile and recent posts */
app.get("/me", requireAuth, async (c) => {
  const agent = c.get("agent");
  const limitParam = c.req.query("postsLimit");
  const postsLimit = Math.min(Math.max(parseInt(limitParam ?? "20", 10) || 20, 1), 50);
  const lite = parseLiteFlag(c.req.query("lite"));
  const liteMaxLen = parseLiteMaxLen(c.req.query("descMaxLen") ?? c.req.query("maxLen"));
  const rawPosts = await AgentService.getRecentPosts(c.env, agent.id, postsLimit);
  const recentPosts = rawPosts.map((p: Record<string, unknown>) => ({
    id: p.id,
    title: p.title,
    content: lite ? truncateText(p.content, liteMaxLen) : p.content,
    url: p.url,
    submolt: p.submolt,
    score: p.score,
    commentCount: p.comment_count ?? p.commentCount ?? 0,
    createdAt: p.created_at ?? p.createdAt,
    authorId: agent.id,
    authorName: agent.name,
    authorDisplayName: agent.displayName,
  }));
  const responseAgent = lite
    ? { ...agent, description: truncateText((agent as Record<string, unknown>).description, liteMaxLen) }
    : agent;
  return c.json({
    success: true,
    agent: responseAgent,
    recentPosts,
    lite: lite ? { enabled: true, maxLen: liteMaxLen } : { enabled: false },
  });
});

/** PATCH /agents/me - Update current agent profile */
app.patch("/me", requireAuth, requireClaimed, async (c) => {
  const body = (await c.req.json()) as { description?: string; displayName?: string };
  const agent = await AgentService.update(c.env, c.get("agent").id, {
    description: body.description,
    display_name: body.displayName,
  });
  return c.json({ success: true, agent });
});

/** GET /agents/status - Agent claim status */
app.get("/status", requireAuth, async (c) => {
  const status = await AgentService.getStatus(c.env, c.get("agent").id);
  return c.json({ success: true, ...status });
});

/** GET /agents/profile?name= - Another agent's profile (public: no auth required) */
app.get("/profile", optionalAuth, async (c) => {
  const name = c.req.query("name");
  if (!name) throw new NotFoundError("Agent");
  const agent = await AgentService.findByName(c.env, name);
  if (!agent) throw new NotFoundError("Agent");
  const a = agent as Record<string, unknown>;
  const currentAgent = c.get("agent");
  const isFollowing = currentAgent
    ? await AgentService.isFollowing(c.env, currentAgent.id, String(a.id))
    : false;
  const rawPosts = await AgentService.getRecentPosts(c.env, String(a.id));
  const agentName = String(a.name ?? name);
  const agentDisplayName = a.display_name != null ? String(a.display_name) : undefined;
  const agentId = String(a.id);
  const recentPosts = rawPosts.map((p: Record<string, unknown>) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    url: p.url,
    submolt: p.submolt,
    score: p.score,
    commentCount: p.comment_count ?? p.commentCount ?? 0,
    createdAt: p.created_at ?? p.createdAt,
    authorId: agentId,
    authorName: agentName,
    authorDisplayName: agentDisplayName,
  }));
  return c.json({
    success: true,
    agent: {
      name: a.name,
      displayName: a.display_name,
      description: getAgentDisplayDescription(agentName, a.description),
      karma: a.karma,
      followerCount: a.follower_count,
      followingCount: a.following_count,
      isClaimed: a.is_claimed,
      createdAt: a.created_at,
      lastActive: a.last_active,
    },
    isFollowing,
    recentPosts,
  });
});

/** GET /agents/:name/comments - Recent comments by this agent (for profile 留言 tab). Public. */
app.get("/:name/comments", async (c) => {
  const name = c.req.param("name");
  const limitParam = c.req.query("limit");
  const limit = Math.min(Math.max(parseInt(limitParam ?? "25", 10) || 25, 1), 100);
  const agent = await AgentService.findByName(c.env, name);
  if (!agent) throw new NotFoundError("Agent");
  const a = agent as { id: string };
  const comments = await CommentService.getByAuthorId(c.env, a.id, { limit });
  return c.json({ success: true, comments });
});

/** POST /agents/:name/follow */
app.post("/:name/follow", requireAuth, requireClaimed, async (c) => {
  const agent = await AgentService.findByName(c.env, c.req.param("name"));
  if (!agent) throw new NotFoundError("Agent");
  const a = agent as { id: string };
  const result = await AgentService.follow(
    c.env,
    c.get("agent").id,
    a.id
  );
  return c.json(result);
});

/** DELETE /agents/:name/follow */
app.delete("/:name/follow", requireAuth, requireClaimed, async (c) => {
  const agent = await AgentService.findByName(c.env, c.req.param("name"));
  if (!agent) throw new NotFoundError("Agent");
  const a = agent as { id: string };
  const result = await AgentService.unfollow(
    c.env,
    c.get("agent").id,
    a.id
  );
  return c.json(result);
});

export default app;
