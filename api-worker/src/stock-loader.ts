/**
 * Stock loader Worker
 * Runs weekly (cron) or via GET /trigger. Fetches stock list from SL886 JSON API,
 * inserts only new stock submolts into D1 (uses stock name as part of channel name).
 */

import type { Env } from "./types";
import { queryAll, batch } from "./lib/db";
import { ensureStockChannel, normalizeStockSymbol } from "./services/submolt";

const WORKER_NAME = "sl886-moltbook-stock-loader";

interface StockItem {
  market: string;
  symbol: string;
  display_name?: string | null;
}

interface LoadResult {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
  deletedWrongHK?: number;
  deletedManually?: number;
}

async function loadStocks(env: Env): Promise<LoadResult> {
  const url = env.SL886_STOCKS_URL?.trim();
  if (!url) {
    throw new Error("SL886_STOCKS_URL is not set");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "MoltbookStockLoader/1.0 (Cloudflare Worker; +https://www.sl886.com)",
  };
  if (env.STOCK_LOADER_SECRET) {
    headers["X-Stock-Loader-Secret"] = env.STOCK_LOADER_SECRET;
  }

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    throw new Error(`SL886 stocks API returned ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { items?: StockItem[] };
  const items = Array.isArray(data.items) ? data.items : [];
  const result: LoadResult = { fetched: items.length, inserted: 0, skipped: 0, errors: 0 };

  const existingKeys = new Set<string>();
  const rows = await queryAll(
    env,
    "SELECT market, normalized_symbol FROM submolts WHERE channel_type = 'stock'"
  );
  for (const r of rows) {
    const m = r.market as string;
    const n = r.normalized_symbol as string;
    if (m != null && n != null) existingKeys.add(`${m}:${n}`);
  }

  for (const item of items) {
    const market = String(item?.market ?? "").trim() || "HK";
    const symbol = String(item?.symbol ?? "").trim();
    if (!symbol) {
      result.errors += 1;
      continue;
    }

    let key: string;
    try {
      const normalized = normalizeStockSymbol(market, symbol);
      key = `${normalized.market}:${normalized.normalizedSymbol}`;
    } catch {
      result.errors += 1;
      continue;
    }

    if (existingKeys.has(key)) {
      result.skipped += 1;
      continue;
    }

    try {
      await ensureStockChannel(
        env,
        market,
        symbol,
        null,
        item.display_name ?? null
      );
      existingKeys.add(key);
      result.inserted += 1;
    } catch {
      result.errors += 1;
    }
  }

  // Option B: delete wrong HK stock channels (created from tblmarket US symbols)
  result.deletedWrongHK = await deleteWrongHKStockChannels(env);

  return result;
}

/**
 * Delete HK stock submolts whose symbol (leading zeros stripped) matches a US stock.
 * These were wrongly created when tblmarket was emitted as HK.
 */
async function deleteWrongHKStockChannels(env: Env): Promise<number> {
  const usSymbols = new Set<string>();
  const usRows = await queryAll(
    env,
    "SELECT normalized_symbol FROM submolts WHERE channel_type = 'stock' AND market = 'US'"
  );
  for (const r of usRows) {
    const n = r.normalized_symbol as string;
    if (n != null && String(n).trim()) usSymbols.add(String(n).trim().toUpperCase());
  }
  if (usSymbols.size === 0) return 0;

  const hkRows = await queryAll(
    env,
    "SELECT id, normalized_symbol FROM submolts WHERE channel_type = 'stock' AND market = 'HK'"
  );
  const toDelete: string[] = [];
  for (const r of hkRows) {
    const n = String((r.normalized_symbol as string) ?? "").trim();
    const withoutLeadingZeros = n.replace(/^0+/, "") || n;
    if (withoutLeadingZeros && usSymbols.has(withoutLeadingZeros.toUpperCase())) {
      toDelete.push(r.id as string);
    }
  }
  if (toDelete.length === 0) return 0;
  await batch(
    env,
    toDelete.map((id) => ({ sql: "DELETE FROM submolts WHERE id = ?", params: [id] }))
  );
  return toDelete.length;
}

export default {
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    try {
      const result = await loadStocks(env);
      console.log(
        `${WORKER_NAME} scheduled: fetched=${result.fetched} inserted=${result.inserted} skipped=${result.skipped} errors=${result.errors} deletedWrongHK=${result.deletedWrongHK ?? 0}`
      );
    } catch (e) {
      console.error(`${WORKER_NAME} scheduled error:`, e);
      throw e;
    }
  },

  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/trigger") {
      const secret = url.searchParams.get("secret") ?? request.headers.get("X-Stock-Loader-Secret");
      if (env.STOCK_LOADER_SECRET && secret !== env.STOCK_LOADER_SECRET) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      let deletedManually = 0;
      const deleteParam = url.searchParams.get("delete");
      if (deleteParam && deleteParam.trim()) {
        const names = deleteParam.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
        if (names.length > 0) {
          await batch(
            env,
            names.map((name) => ({ sql: "DELETE FROM submolts WHERE name = ?", params: [name] }))
          );
          deletedManually = names.length;
        }
      }
      try {
        const result = await loadStocks(env);
        return new Response(
          JSON.stringify({ success: true, deletedManually, ...result }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return new Response(
          JSON.stringify({ success: false, error: message }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          worker: WORKER_NAME,
          timestamp: new Date().toISOString(),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      `${WORKER_NAME}\n\nEndpoints:\n  GET /trigger - Run load (optional: ?secret=... or X-Stock-Loader-Secret header; ?delete=name1,name2 to delete those submolts first)\n  GET /health - Health check`,
      { headers: { "Content-Type": "text/plain" } }
    );
  },
};
