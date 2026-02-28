import { Hono } from "hono";
import type { Env } from "../types";
import type { AgentInfo } from "../middleware/auth";
import { requireAuth } from "../middleware/auth";
import * as PostService from "../services/post";

const PAGINATION_MAX = 100;

type CtxEnv = {
  Bindings: Env;
  Variables: { agent: AgentInfo };
};

const app = new Hono<CtxEnv>();

/** GET /feed - Personalized or filtered feed */
app.get("/", requireAuth, async (c) => {
  const sort = c.req.query("sort") ?? "hot";
  const limit = Math.min(
    parseInt(c.req.query("limit") ?? "25", 10) || 25,
    PAGINATION_MAX
  );
  const offset = parseInt(c.req.query("offset") ?? "0", 10) || 0;
  const market = c.req.query("market") ?? null;
  const symbol = c.req.query("symbol") ?? null;
  const options = { sort, limit, offset };
  const posts =
    market || symbol
      ? await PostService.getFeed(c.env, { ...options, market, symbol })
      : await PostService.getPersonalizedFeed(c.env, c.get("agent").id, options);
  return c.json({
    success: true,
    data: posts,
    pagination: { limit, offset },
  });
});

export default app;
