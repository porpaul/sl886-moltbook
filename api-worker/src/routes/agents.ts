import { Hono } from "hono";
import type { Env } from "../types";
import type { AgentInfo } from "../middleware/auth";
import type { HumanIdentity } from "../lib/human-auth";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { requireHumanAuth } from "../lib/human-auth";
import * as AgentService from "../services/agent";
import { sendEmail } from "../lib/email";
import { NotFoundError, UnauthorizedError } from "../lib/errors";

type CtxEnv = {
  Bindings: Env;
  Variables: { agent?: AgentInfo; human?: HumanIdentity };
};

const app = new Hono<CtxEnv>();

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
  const transport = c.env.SMTP_HOST && c.env.SMTP_USER && c.env.SMTP_PASS ? "SMTP" : "MailChannels";
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

/** GET /agents/me - Current agent profile */
app.get("/me", requireAuth, async (c) => {
  return c.json({ success: true, agent: c.get("agent") });
});

/** PATCH /agents/me - Update current agent profile */
app.patch("/me", requireAuth, async (c) => {
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
  const recentPosts = await AgentService.getRecentPosts(c.env, String(a.id));
  return c.json({
    success: true,
    agent: {
      name: a.name,
      displayName: a.display_name,
      description: a.description,
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

/** POST /agents/:name/follow */
app.post("/:name/follow", requireAuth, async (c) => {
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
app.delete("/:name/follow", requireAuth, async (c) => {
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
