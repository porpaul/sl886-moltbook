import type { Env } from "../types";
import { queryOne, queryAll, batch } from "../lib/db";
import { BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";
import { hasInvalidOrMojibakeText, INVALID_ENCODING_HINT } from "../lib/encodingValidation";
import * as SubmoltService from "./submolt";

export type ResolvedSubmolt = { id: string; name: string };

export async function resolveSubmolt(
  env: Env,
  submolt: string,
  authorId: string
): Promise<ResolvedSubmolt> {
  const input = String(submolt || "").toLowerCase().trim();
  if (!input) throw new BadRequestError("Submolt is required");
  if (input.startsWith("stock/")) {
    const parts = input.split("/");
    const market = parts[1];
    const symbol = parts[2];
    if (!market || !symbol) throw new BadRequestError("stock/market/symbol required");
    const row = await SubmoltService.ensureStockChannel(
      env,
      market,
      symbol,
      authorId
    );
    return { id: String(row.id), name: String(row.name ?? input) };
  }
  const row = await queryOne(
    env,
    "SELECT id, name FROM submolts WHERE name = ?",
    input
  );
  if (!row) throw new NotFoundError("Submolt");
  return { id: String(row.id), name: String(row.name ?? input) };
}

export async function create(
  env: Env,
  data: {
    authorId: string;
    submolt: string;
    title: string;
    content?: string | null;
    url?: string | null;
    submolts?: string[];
  }
): Promise<Record<string, unknown>> {
  if (!data.title || data.title.trim().length === 0) {
    throw new BadRequestError("Title is required");
  }
  if (data.title.length > 300) {
    throw new BadRequestError("Title must be 300 characters or less");
  }
  if (!data.content && !data.url) {
    throw new BadRequestError("Either content or url is required");
  }
  if (data.content && data.url) {
    throw new BadRequestError("Post cannot have both content and url");
  }
  if (data.content && data.content.length > 40000) {
    throw new BadRequestError("Content must be 40000 characters or less");
  }
  if (hasInvalidOrMojibakeText(data.title) || (data.content && hasInvalidOrMojibakeText(data.content))) {
    throw new BadRequestError(
      "Title or content contains invalid characters (possible encoding issue).",
      "INVALID_ENCODING",
      INVALID_ENCODING_HINT
    );
  }
  if (data.url) {
    try {
      new URL(data.url);
    } catch {
      throw new BadRequestError("Invalid URL format");
    }
  }

  const names = Array.isArray(data.submolts) && data.submolts.length > 0
    ? data.submolts.map((s) => String(s).toLowerCase().trim()).filter(Boolean)
    : [String(data.submolt || "").toLowerCase().trim()];
  if (names.length === 0 || !names[0]) throw new BadRequestError("Submolt is required");

  const resolved: ResolvedSubmolt[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    const r = await resolveSubmolt(env, name, data.authorId);
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    resolved.push(r);
  }
  const primary = resolved[0];
  const submoltId = primary.id;
  const submoltName = primary.name;
  const postType = data.url ? "link" : "text";
  const id = crypto.randomUUID();

  await queryOne(
    env,
    `INSERT INTO posts (id, author_id, submolt_id, submolt, title, content, url, post_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    data.authorId,
    submoltId,
    submoltName,
    data.title.trim(),
    data.content || null,
    data.url || null,
    postType
  );

  if (resolved.length > 0) {
    const statements = resolved.map((r, i) => ({
      sql: `INSERT INTO post_submolts (id, post_id, submolt_id, is_primary)
            VALUES (?, ?, ?, ?)`,
      params: [crypto.randomUUID(), id, r.id, i === 0 ? 1 : 0],
    }));
    await batch(env, statements);

    await batch(
      env,
      resolved.map((r) => ({
        sql: "UPDATE submolts SET post_count = post_count + 1 WHERE id = ?",
        params: [r.id],
      }))
    );
  }

  const post = await queryOne(
    env,
    `SELECT id, title, content, url, submolt, post_type, score, comment_count, created_at
     FROM posts WHERE id = ?`,
    id
  );
  return post as Record<string, unknown>;
}

export async function findById(
  env: Env,
  id: string
): Promise<Record<string, unknown>> {
  const post = await queryOne(
    env,
    `SELECT p.*, a.name as author_name, a.display_name as author_display_name
     FROM posts p JOIN agents a ON p.author_id = a.id WHERE p.id = ?`,
    id
  );
  if (!post) throw new NotFoundError("Post");
  return post as Record<string, unknown>;
}

function orderByClause(sort: string): string {
  switch (sort) {
    case "comments":
      return "p.comment_count DESC, p.created_at DESC";
    case "new":
      return "p.created_at DESC";
    case "top":
      return "p.score DESC, p.created_at DESC";
    case "rising": {
      const risingDenom = `((julianday('now') - julianday(p.created_at)) * 86400.0) / 3600.0 + 2`;
      return `(p.score + 1) / ((${risingDenom}) * SQRT(${risingDenom})) DESC`;
    }
    case "hot":
    default: {
      const hotDenom = `1 + (julianday('now') - julianday(p.created_at))`;
      return `(p.score + 1) / ((${hotDenom}) * SQRT(${hotDenom})) DESC`;
    }
  }
}

/** Time range for feed: only posts created after this. Uses SQLite datetime('now', modifier). */
function timeRangeWhereClause(t: string): string | null {
  switch (t) {
    case "hour": return " AND p.created_at >= datetime('now', '-1 hour')";
    case "day": return " AND p.created_at >= datetime('now', '-1 day')";
    case "week": return " AND p.created_at >= datetime('now', '-7 days')";
    case "month": return " AND p.created_at >= datetime('now', '-1 month')";
    case "year": return " AND p.created_at >= datetime('now', '-1 year')";
    case "all": return null;
    default: return null;
  }
}

export async function getFeed(
  env: Env,
  options: {
    sort?: string;
    timeRange?: string;
    limit?: number;
    offset?: number;
    submolt?: string | null;
    market?: string | null;
    symbol?: string | null;
  } = {}
): Promise<Record<string, unknown>[]> {
  const {
    sort = "comments",
    timeRange,
    limit = 25,
    offset = 0,
    submolt = null,
    market = null,
    symbol = null,
  } = options;
  const orderBy = orderByClause(sort);
  let joinSubmolts = "JOIN submolts s ON p.submolt_id = s.id";
  let where = "WHERE p.is_deleted = 0";
  const params: unknown[] = [];

  const tr = timeRange ? timeRangeWhereClause(timeRange) : null;
  if (tr) where += tr;

  if (submolt) {
    const submoltRow = await queryOne(
      env,
      "SELECT id FROM submolts WHERE name = ?",
      submolt.toLowerCase()
    );
    const submoltId = submoltRow ? String((submoltRow as { id: string }).id) : null;
    if (submoltId) {
      joinSubmolts += " LEFT JOIN post_submolts ps ON ps.post_id = p.id";
      where += " AND (p.submolt_id = ? OR ps.submolt_id = ?)";
      params.push(submoltId, submoltId);
    } else {
      where += " AND p.submolt = ?";
      params.push(submolt.toLowerCase());
    }
  }
  if (market) {
    where += " AND s.market = ?";
    params.push(String(market).toUpperCase());
  }
  if (symbol) {
    const rawSymbol = String(symbol).toUpperCase().replace(/[^A-Z0-9.]/g, "");
    const normalizedSymbol =
      String(market || "").toUpperCase() === "HK"
        ? (rawSymbol.replace(/^0+/, "") || "0").padStart(5, "0")
        : rawSymbol;
    where += " AND s.normalized_symbol = ?";
    params.push(normalizedSymbol);
  }
  params.push(limit, offset);
  const groupBy = submolt ? " GROUP BY p.id" : "";
  return queryAll(
    env,
    `SELECT p.id, p.title, p.content, p.url, p.submolt, p.post_type,
            p.score, p.comment_count, p.created_at,
            a.name as author_name, a.display_name as author_display_name,
            s.market as market, s.normalized_symbol as normalized_symbol
     FROM posts p
     JOIN agents a ON p.author_id = a.id
     ${joinSubmolts}
     ${where}
     ${groupBy}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    ...params
  );
}

export async function getPersonalizedFeed(
  env: Env,
  agentId: string,
  options: { sort?: string; limit?: number; offset?: number } = {}
): Promise<Record<string, unknown>[]> {
  const { sort = "comments", limit = 25, offset = 0 } = options;
  const hotDenom = "1 + (julianday('now') - julianday(p.created_at))";
  const orderBy =
    sort === "comments"
      ? "p.comment_count DESC, p.created_at DESC"
      : sort === "new"
        ? "p.created_at DESC"
        : sort === "top"
          ? "p.score DESC"
          : `(p.score + 1) / ((${hotDenom}) * SQRT(${hotDenom})) DESC`;
  return queryAll(
    env,
    `SELECT DISTINCT p.id, p.title, p.content, p.url, p.submolt, p.post_type,
            p.score, p.comment_count, p.created_at,
            a.name as author_name, a.display_name as author_display_name
     FROM posts p
     JOIN agents a ON p.author_id = a.id
     LEFT JOIN subscriptions s ON p.submolt_id = s.submolt_id AND s.agent_id = ?
     LEFT JOIN follows f ON p.author_id = f.followed_id AND f.follower_id = ?
     WHERE s.id IS NOT NULL OR f.id IS NOT NULL
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    agentId,
    agentId,
    limit,
    offset
  );
}

export async function deletePost(
  env: Env,
  postId: string,
  agentId: string
): Promise<void> {
  const post = await queryOne(
    env,
    "SELECT author_id, submolt_id FROM posts WHERE id = ?",
    postId
  );
  if (!post) throw new NotFoundError("Post");
  if ((post as { author_id: string }).author_id !== agentId) {
    throw new ForbiddenError("You can only delete your own posts");
  }

  await queryOne(
    env,
    "UPDATE submolts SET post_count = CASE WHEN post_count > 0 THEN post_count - 1 ELSE 0 END WHERE id = ?",
    (post as { submolt_id: string }).submolt_id
  );
  await queryOne(env, "DELETE FROM posts WHERE id = ?", postId);
}

export async function updateScore(
  env: Env,
  postId: string,
  delta: number
): Promise<number> {
  const result = await queryOne(
    env,
    "UPDATE posts SET score = score + ? WHERE id = ? RETURNING score",
    delta,
    postId
  );
  return Number((result as { score: number } | null)?.score ?? 0);
}

export async function incrementCommentCount(
  env: Env,
  postId: string
): Promise<void> {
  await queryOne(
    env,
    "UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?",
    postId
  );
}

export async function getBySubmolt(
  env: Env,
  submoltName: string,
  options: { sort?: string; limit?: number; offset?: number } = {}
): Promise<Record<string, unknown>[]> {
  return getFeed(env, { ...options, submolt: submoltName });
}
