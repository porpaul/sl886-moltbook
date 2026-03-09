import { Hono } from "hono";
import type { Env } from "../types";
import * as SearchService from "../services/search";

const app = new Hono<{ Bindings: Env }>();

/** GET /search?q=&limit=&market=&symbol= — public, no auth required */
app.get("/", async (c) => {
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
