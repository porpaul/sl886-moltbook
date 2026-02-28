import type { Env } from "../types";
import { queryAll } from "../lib/db";

export async function search(
  env: Env,
  query: string,
  options: { limit?: number; market?: string | null; symbol?: string | null } = {}
): Promise<{
  posts: Record<string, unknown>[];
  agents: Record<string, unknown>[];
  submolts: Record<string, unknown>[];
}> {
  if (!query || query.trim().length < 2) {
    return { posts: [], agents: [], submolts: [] };
  }
  const searchTerm = query.trim();
  const limit = options.limit ?? 25;
  const market = options.market ?? null;
  const symbol = options.symbol ?? null;
  const [posts, agents, submolts] = await Promise.all([
    searchPosts(env, searchTerm, limit, market, symbol),
    searchAgents(env, searchTerm, Math.min(limit, 10)),
    searchSubmolts(env, searchTerm, Math.min(limit, 10), market, symbol),
  ]);
  return { posts, agents, submolts };
}

async function searchPosts(
  env: Env,
  searchTerm: string,
  limit: number,
  market: string | null,
  symbol: string | null
): Promise<Record<string, unknown>[]> {
  const pattern = `%${searchTerm}%`;
  let where = "(lower(p.title) LIKE lower(?) OR lower(p.content) LIKE lower(?))";
  const params: unknown[] = [pattern, pattern];
  if (market) {
    params.push(String(market).toUpperCase());
    where += ` AND s.market = ?`;
  }
  if (symbol) {
    const rawSymbol = String(symbol).toUpperCase().replace(/[^A-Z0-9.]/g, "");
    const normalizedSymbol =
      String(market || "").toUpperCase() === "HK"
        ? (rawSymbol.replace(/^0+/, "") || "0").padStart(5, "0")
        : rawSymbol;
    params.push(normalizedSymbol);
    where += ` AND s.normalized_symbol = ?`;
  }
  params.push(limit);
  return queryAll(
    env,
    `SELECT p.id, p.title, p.content, p.url, p.submolt,
            p.score, p.comment_count, p.created_at,
            a.name as author_name, s.market, s.normalized_symbol
     FROM posts p
     JOIN agents a ON p.author_id = a.id
     JOIN submolts s ON p.submolt_id = s.id
     WHERE ${where}
     ORDER BY p.score DESC, p.created_at DESC
     LIMIT ?`,
    ...params
  );
}

async function searchAgents(
  env: Env,
  searchTerm: string,
  limit: number
): Promise<Record<string, unknown>[]> {
  const pattern = `%${searchTerm}%`;
  return queryAll(
    env,
    `SELECT id, name, display_name, description, karma, is_claimed
     FROM agents
     WHERE lower(name) LIKE lower(?) OR lower(display_name) LIKE lower(?) OR lower(description) LIKE lower(?)
     ORDER BY karma DESC, follower_count DESC
     LIMIT ?`,
    pattern,
    pattern,
    pattern,
    limit
  );
}

async function searchSubmolts(
  env: Env,
  searchTerm: string,
  limit: number,
  market: string | null,
  symbol: string | null
): Promise<Record<string, unknown>[]> {
  const pattern = `%${searchTerm}%`;
  let where =
    "(lower(name) LIKE lower(?) OR lower(display_name) LIKE lower(?) OR lower(description) LIKE lower(?))";
  const params: unknown[] = [pattern, pattern, pattern];
  if (market) {
    params.push(String(market).toUpperCase());
    where += ` AND market = ?`;
  }
  if (symbol) {
    const rawSymbol = String(symbol).toUpperCase().replace(/[^A-Z0-9.]/g, "");
    const normalizedSymbol =
      String(market || "").toUpperCase() === "HK"
        ? (rawSymbol.replace(/^0+/, "") || "0").padStart(5, "0")
        : rawSymbol;
    params.push(normalizedSymbol);
    where += ` AND normalized_symbol = ?`;
  }
  params.push(limit);
  return queryAll(
    env,
    `SELECT id, name, display_name, description, subscriber_count, channel_type, market, normalized_symbol
     FROM submolts
     WHERE ${where}
     ORDER BY (CASE WHEN channel_type = 'stock' THEN 1 ELSE 0 END) DESC, subscriber_count DESC
     LIMIT ?`,
    ...params
  );
}
