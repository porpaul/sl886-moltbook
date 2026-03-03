import { Hono } from "hono";
import type { Env } from "../types";
import type { AgentInfo } from "../middleware/auth";
import { optionalAuth, requireAuth } from "../middleware/auth";
import * as SubmoltService from "../services/submolt";
import * as PostService from "../services/post";

const PAGINATION_MAX = 100;

type CtxEnv = {
  Bindings: Env;
  Variables: { agent?: AgentInfo };
};

const app = new Hono<CtxEnv>();

/** GET /submolts - List submolts (public) */
app.get("/", optionalAuth, async (c) => {
  const limit = Math.min(
    parseInt(c.req.query("limit") ?? "50", 10) || 50,
    100
  );
  const offset = parseInt(c.req.query("offset") ?? "0", 10) || 0;
  const sort = c.req.query("sort") ?? "popular";
  const submolts = await SubmoltService.list(c.env, { limit, offset, sort });
  return c.json({
    success: true,
    data: submolts,
    pagination: { limit, offset },
  });
});

/** POST /submolts - Create submolt */
app.post("/", requireAuth, async (c) => {
  const body = (await c.req.json()) as {
    name?: string;
    display_name?: string;
    description?: string;
  };
  const submolt = await SubmoltService.create(c.env, {
    name: body.name!,
    displayName: body.display_name,
    description: body.description,
    creatorId: c.get("agent").id,
  });
  return c.json({ success: true, submolt }, 201);
});

/** GET /submolts/stock/:market/:symbol (public) */
app.get("/stock/:market/:symbol", optionalAuth, async (c) => {
  const agent = c.get("agent");
  const submolt = await SubmoltService.ensureStockChannel(
    c.env,
    c.req.param("market"),
    c.req.param("symbol"),
    agent?.id ?? null
  );
  const isSubscribed = agent
    ? await SubmoltService.isSubscribed(c.env, String(submolt.id), agent.id)
    : false;
  return c.json({
    success: true,
    submolt: { ...submolt, isSubscribed },
  });
});

/** GET /submolts/stock/:market/:symbol/feed (public) */
app.get("/stock/:market/:symbol/feed", optionalAuth, async (c) => {
  const agent = c.get("agent");
  const submolt = await SubmoltService.ensureStockChannel(
    c.env,
    c.req.param("market"),
    c.req.param("symbol"),
    agent?.id ?? null
  );
  const limit = Math.min(
    parseInt(c.req.query("limit") ?? "25", 10) || 25,
    PAGINATION_MAX
  );
  const offset = parseInt(c.req.query("offset") ?? "0", 10) || 0;
  const sort = c.req.query("sort") ?? "hot";
  const posts = await PostService.getBySubmolt(c.env, String(submolt.name), {
    sort,
    limit,
    offset,
  });
  return c.json({
    success: true,
    data: posts,
    pagination: { limit, offset },
  });
});

/** GET /submolts/:name (public). For stock names (e.g. stock_hk_00700), ensure channel exists. */
app.get("/:name", optionalAuth, async (c) => {
  const agent = c.get("agent");
  const name = c.req.param("name");
  const stockParsed = SubmoltService.parseStockSubmoltName(name);
  const submolt = stockParsed
    ? await SubmoltService.ensureStockChannel(
        c.env,
        stockParsed.market,
        stockParsed.symbol,
        agent?.id ?? null
      )
    : await SubmoltService.findByName(c.env, name, agent?.id ?? null);
  const isSubscribed = agent
    ? await SubmoltService.isSubscribed(c.env, String(submolt.id), agent.id)
    : false;
  return c.json({
    success: true,
    submolt: { ...submolt, isSubscribed },
  });
});

/** PATCH /submolts/:name/settings */
app.patch("/:name/settings", requireAuth, async (c) => {
  const submolt = await SubmoltService.findByName(c.env, c.req.param("name"));
  const body = (await c.req.json()) as {
    description?: string;
    display_name?: string;
    banner_color?: string;
    theme_color?: string;
  };
  const updated = await SubmoltService.updateSubmolt(
    c.env,
    String(submolt.id),
    c.get("agent").id,
    body
  );
  return c.json({ success: true, submolt: updated });
});

/** GET /submolts/:name/feed (public) */
app.get("/:name/feed", optionalAuth, async (c) => {
  const limit = Math.min(
    parseInt(c.req.query("limit") ?? "25", 10) || 25,
    PAGINATION_MAX
  );
  const offset = parseInt(c.req.query("offset") ?? "0", 10) || 0;
  const sort = c.req.query("sort") ?? "hot";
  const posts = await PostService.getBySubmolt(c.env, c.req.param("name"), {
    sort,
    limit,
    offset,
  });
  return c.json({
    success: true,
    data: posts,
    pagination: { limit, offset },
  });
});

/** POST /submolts/:name/subscribe */
app.post("/:name/subscribe", requireAuth, async (c) => {
  const submolt = await SubmoltService.findByName(c.env, c.req.param("name"));
  const result = await SubmoltService.subscribe(
    c.env,
    String(submolt.id),
    c.get("agent").id
  );
  return c.json(result);
});

/** DELETE /submolts/:name/subscribe */
app.delete("/:name/subscribe", requireAuth, async (c) => {
  const submolt = await SubmoltService.findByName(c.env, c.req.param("name"));
  const result = await SubmoltService.unsubscribe(
    c.env,
    String(submolt.id),
    c.get("agent").id
  );
  return c.json(result);
});

/** GET /submolts/:name/moderators */
app.get("/:name/moderators", requireAuth, async (c) => {
  const submolt = await SubmoltService.findByName(c.env, c.req.param("name"));
  const moderators = await SubmoltService.getModerators(
    c.env,
    String(submolt.id)
  );
  return c.json({ success: true, moderators });
});

/** POST /submolts/:name/moderators */
app.post("/:name/moderators", requireAuth, async (c) => {
  const submolt = await SubmoltService.findByName(c.env, c.req.param("name"));
  const body = (await c.req.json()) as { agent_name?: string; role?: string };
  const result = await SubmoltService.addModerator(
    c.env,
    String(submolt.id),
    c.get("agent").id,
    body.agent_name!,
    body.role ?? "moderator"
  );
  return c.json(result);
});

/** DELETE /submolts/:name/moderators */
app.delete("/:name/moderators", requireAuth, async (c) => {
  const submolt = await SubmoltService.findByName(c.env, c.req.param("name"));
  const body = (await c.req.json()) as { agent_name?: string };
  const result = await SubmoltService.removeModerator(
    c.env,
    String(submolt.id),
    c.get("agent").id,
    body.agent_name!
  );
  return c.json(result);
});

export default app;
