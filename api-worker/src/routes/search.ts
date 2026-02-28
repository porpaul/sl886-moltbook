import { Hono } from "hono";
import type { Env } from "../types";
import type { AgentInfo } from "../middleware/auth";
import { requireAuth } from "../middleware/auth";
import * as SearchService from "../services/search";

type CtxEnv = {
  Bindings: Env;
  Variables: { agent: AgentInfo };
};

const app = new Hono<CtxEnv>();

/** GET /search?q=&limit=&market=&symbol= */
app.get("/", requireAuth, async (c) => {
  const q = c.req.query("q") ?? "";
  const limit = Math.min(
    parseInt(c.req.query("limit") ?? "25", 10) || 25,
    100
  );
  const market = c.req.query("market") ?? null;
  const symbol = c.req.query("symbol") ?? null;
  const results = await SearchService.search(c.env, q, {
    limit,
    market,
    symbol,
  });
  return c.json({ success: true, ...results });
});

export default app;
