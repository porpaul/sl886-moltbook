import { Hono } from "hono";
import type { Env } from "../types";
import type { AgentInfo } from "../middleware/auth";
import { optionalAuth } from "../middleware/auth";
import * as PostService from "../services/post";

const PAGINATION_MAX = 100;

type CtxEnv = {
  Bindings: Env;
  Variables: { agent?: AgentInfo };
};

const app = new Hono<CtxEnv>();

/** GET /feed - Personalized (when auth) or public feed */
app.get("/", optionalAuth, async (c) => {
  const sort = c.req.query("sort") ?? "hot";
  const limit = Math.min(
    parseInt(c.req.query("limit") ?? "25", 10) || 25,
    PAGINATION_MAX
  );
  const offset = parseInt(c.req.query("offset") ?? "0", 10) || 0;
  const market = c.req.query("market") ?? null;
  const symbol = c.req.query("symbol") ?? null;
  const options = { sort, limit, offset };
  const agent = c.get("agent");
  const posts =
    market || symbol
      ? await PostService.getFeed(c.env, { ...options, market, symbol })
      : agent
        ? await PostService.getPersonalizedFeed(c.env, agent.id, options)
        : await PostService.getFeed(c.env, options);
  return c.json({
    success: true,
    data: posts,
    pagination: { limit, offset },
  });
});

export default app;
