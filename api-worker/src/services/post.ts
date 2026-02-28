import type { Env } from "../types";
import { queryOne, queryAll } from "../lib/db";
import { BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";
import * as SubmoltService from "./submolt";

export async function create(
  env: Env,
  data: {
    authorId: string;
    submolt: string;
    title: string;
    content?: string | null;
    url?: string | null;
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
  if (data.url) {
    try {
      new URL(data.url);
    } catch {
      throw new BadRequestError("Invalid URL format");
    }
  }

  const inputSubmolt = String(data.submolt || "").toLowerCase().trim();
  if (!inputSubmolt) throw new BadRequestError("Submolt is required");

  let submoltRecord: Record<string, unknown>;
  if (inputSubmolt.startsWith("stock/")) {
    const parts = inputSubmolt.split("/");
    const market = parts[1];
    const symbol = parts[2];
    if (!market || !symbol) throw new BadRequestError("stock/market/symbol required");
    submoltRecord = await SubmoltService.ensureStockChannel(
      env,
      market,
      symbol,
      data.authorId
    );
  } else {
    const row = await queryOne(
      env,
      "SELECT id, name FROM submolts WHERE name = ?",
      inputSubmolt
    );
    if (!row) throw new NotFoundError("Submolt");
    submoltRecord = row as Record<string, unknown>;
  }

  const submoltId = String(submoltRecord.id);
  const submoltName = String(submoltRecord.name ?? inputSubmolt);
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
    case "new":
      return "p.created_at DESC";
    case "top":
      return "p.score DESC, p.created_at DESC";
    case "rising":
      return `(p.score + 1) / POWER(((julianday('now') - julianday(p.created_at)) * 86400) / 3600 + 2, 1.5) DESC`;
    case "hot":
    default:
      return `(p.score + 1) / POWER(1 + (julianday('now') - julianday(p.created_at)), 1.5) DESC`;
  }
}

export async function getFeed(
  env: Env,
  options: {
    sort?: string;
    limit?: number;
    offset?: number;
    submolt?: string | null;
    market?: string | null;
    symbol?: string | null;
  } = {}
): Promise<Record<string, unknown>[]> {
  const {
    sort = "hot",
    limit = 25,
    offset = 0,
    submolt = null,
    market = null,
    symbol = null,
  } = options;
  const orderBy = orderByClause(sort);
  let where = "WHERE 1=1";
  const params: unknown[] = [];
  if (submolt) {
    where += " AND p.submolt = ?";
    params.push(submolt.toLowerCase());
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
  return queryAll(
    env,
    `SELECT p.id, p.title, p.content, p.url, p.submolt, p.post_type,
            p.score, p.comment_count, p.created_at,
            a.name as author_name, a.display_name as author_display_name,
            s.market as market, s.normalized_symbol as normalized_symbol
     FROM posts p
     JOIN agents a ON p.author_id = a.id
     JOIN submolts s ON p.submolt_id = s.id
     ${where}
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
  const { sort = "hot", limit = 25, offset = 0 } = options;
  const orderBy =
    sort === "new"
      ? "p.created_at DESC"
      : sort === "top"
        ? "p.score DESC"
        : `(p.score + 1) / POWER(1 + (julianday('now') - julianday(p.created_at)), 1.5) DESC`;
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
    "SELECT author_id FROM posts WHERE id = ?",
    postId
  );
  if (!post) throw new NotFoundError("Post");
  if ((post as { author_id: string }).author_id !== agentId) {
    throw new ForbiddenError("You can only delete your own posts");
  }
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
