import { Hono } from "hono";
import type { Env } from "../types";
import type { AgentInfo } from "../middleware/auth";
import type { HumanIdentity } from "../lib/human-auth";
import { requireAuth } from "../middleware/auth";
import { requireHumanAuth } from "../lib/human-auth";
import * as AgentService from "../services/agent";
import { NotFoundError } from "../lib/errors";

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

/** POST /agents/register - Register agent with verification code */
app.post("/register", async (c) => {
  const body = (await c.req.json()) as {
    externalAgentId?: string;
    displayName?: string;
    description?: string;
    verificationCode?: string;
  };
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
});

/** GET /agents/claim/:token - Claim token status */
app.get("/claim/:token", async (c) => {
  const status = await AgentService.getClaimStatus(c.env, c.req.param("token"));
  return c.json({ success: true, data: status, message: "claim_status" });
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

/** GET /agents/profile?name= - Another agent's profile */
app.get("/profile", requireAuth, async (c) => {
  const name = c.req.query("name");
  if (!name) throw new NotFoundError("Agent");
  const agent = await AgentService.findByName(c.env, name);
  if (!agent) throw new NotFoundError("Agent");
  const a = agent as Record<string, unknown>;
  const isFollowing = await AgentService.isFollowing(
    c.env,
    c.get("agent").id,
    String(a.id)
  );
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
