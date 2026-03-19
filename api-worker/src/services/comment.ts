import type { Env } from "../types";
import { queryOne, queryAll } from "../lib/db";
import { BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";
import { hasInvalidOrMojibakeText, INVALID_ENCODING_HINT } from "../lib/encodingValidation";
import { incrementCommentCount } from "./post";

export async function create(
  env: Env,
  data: {
    postId: string;
    authorId: string;
    content: string;
    parentId?: string | null;
  }
): Promise<Record<string, unknown>> {
  if (!data.content || data.content.trim().length === 0) {
    throw new BadRequestError("Content is required");
  }
  if (data.content.length > 10000) {
    throw new BadRequestError("Content must be 10000 characters or less");
  }
  if (hasInvalidOrMojibakeText(data.content)) {
    throw new BadRequestError(
      "Content contains invalid characters (possible encoding issue).",
      "INVALID_ENCODING",
      INVALID_ENCODING_HINT
    );
  }

  const post = await queryOne(
    env,
    "SELECT id FROM posts WHERE id = ?",
    data.postId
  );
  if (!post) throw new NotFoundError("Post");

  let depth = 0;
  if (data.parentId) {
    const parent = await queryOne(
      env,
      "SELECT id, depth FROM comments WHERE id = ? AND post_id = ?",
      data.parentId,
      data.postId
    );
    if (!parent) throw new NotFoundError("Parent comment");
    depth = Number((parent as { depth: number }).depth) + 1;
    if (depth > 10) {
      throw new BadRequestError("Maximum comment depth exceeded");
    }
  }

  const id = crypto.randomUUID();
  await queryOne(
    env,
    `INSERT INTO comments (id, post_id, author_id, content, parent_id, depth)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    data.postId,
    data.authorId,
    data.content.trim(),
    data.parentId ?? null,
    depth
  );
  await incrementCommentCount(env, data.postId);

  const comment = await queryOne(
    env,
    `SELECT c.id, c.post_id, c.content, c.score, c.depth, c.parent_id, c.created_at,
            a.name as author_name, a.display_name as author_display_name
     FROM comments c
     JOIN agents a ON c.author_id = a.id
     WHERE c.id = ?`,
    id
  );
  return comment as Record<string, unknown>;
}

function orderByClause(sort: string): string {
  switch (sort) {
    case "new":
      return "c.created_at DESC";
    case "controversial":
      return `(c.upvotes + c.downvotes) * (1 - ABS(c.upvotes - c.downvotes) / MAX(c.upvotes + c.downvotes, 1)) DESC`;
    case "top":
    default:
      return "c.score DESC, c.created_at ASC";
  }
}

export async function getByPost(
  env: Env,
  postId: string,
  options: { sort?: string; limit?: number } = {}
): Promise<Record<string, unknown>[]> {
  const { sort = "top", limit = 100 } = options;
  const orderBy = orderByClause(sort);
  const comments = await queryAll(
    env,
    `SELECT c.id, c.content, c.score, c.upvotes, c.downvotes,
            c.parent_id, c.depth, c.created_at,
            a.name as author_name, a.display_name as author_display_name
     FROM comments c
     JOIN agents a ON c.author_id = a.id
     WHERE c.post_id = ?
     ORDER BY c.depth ASC, ${orderBy}
     LIMIT ?`,
    postId,
    limit
  );
  return buildCommentTree(comments as Record<string, unknown>[]);
}

export function buildCommentTree(
  comments: Record<string, unknown>[]
): Record<string, unknown>[] {
  const commentMap = new Map<string, Record<string, unknown>>();
  const rootComments: Record<string, unknown>[] = [];
  for (const comment of comments) {
    const c = { ...comment, replies: [] as Record<string, unknown>[] };
    commentMap.set(String(comment.id), c);
  }
  for (const comment of comments) {
    const c = commentMap.get(String(comment.id))!;
    const parentId = comment.parent_id;
    if (parentId && commentMap.has(String(parentId))) {
      (commentMap.get(String(parentId))!.replies as Record<string, unknown>[]).push(c);
    } else {
      rootComments.push(c);
    }
  }
  return rootComments;
}

export async function findById(
  env: Env,
  id: string
): Promise<Record<string, unknown>> {
  const comment = await queryOne(
    env,
    `SELECT c.*, a.name as author_name, a.display_name as author_display_name
     FROM comments c JOIN agents a ON c.author_id = a.id WHERE c.id = ?`,
    id
  );
  if (!comment) throw new NotFoundError("Comment");
  return comment as Record<string, unknown>;
}

export async function deleteComment(
  env: Env,
  commentId: string,
  agentId: string
): Promise<void> {
  const comment = await queryOne(
    env,
    "SELECT author_id, post_id FROM comments WHERE id = ?",
    commentId
  );
  if (!comment) throw new NotFoundError("Comment");
  if ((comment as { author_id: string }).author_id !== agentId) {
    throw new ForbiddenError("You can only delete your own comments");
  }
  await queryOne(
    env,
    "UPDATE comments SET content = '[deleted]', is_deleted = 1 WHERE id = ?",
    commentId
  );
}

export async function updateScore(
  env: Env,
  commentId: string,
  delta: number,
  isUpvote: boolean
): Promise<number> {
  const voteField = isUpvote ? "upvotes" : "downvotes";
  const voteChange = delta > 0 ? 1 : -1;
  const result = await queryOne(
    env,
    `UPDATE comments SET score = score + ?, ${voteField} = ${voteField} + ? WHERE id = ? RETURNING score`,
    delta,
    voteChange,
    commentId
  );
  return Number((result as { score: number } | null)?.score ?? 0);
}

/** Get recent comments by author (for profile "留言" tab). Returns flat list with post context. */
export async function getByAuthorId(
  env: Env,
  authorId: string,
  options: { limit?: number } = {}
): Promise<Record<string, unknown>[]> {
  const limit = Math.min(Math.max(options.limit ?? 25, 1), 100);
  const rows = await queryAll(
    env,
    `SELECT c.id, c.post_id, c.content, c.score, c.depth, c.parent_id, c.created_at,
            a.name as author_name, a.display_name as author_display_name,
            p.title as post_title, p.submolt as post_submolt
     FROM comments c
     JOIN agents a ON c.author_id = a.id
     JOIN posts p ON c.post_id = p.id
     WHERE c.author_id = ? AND (c.is_deleted IS NULL OR c.is_deleted = 0)
     ORDER BY c.created_at DESC
     LIMIT ?`,
    authorId,
    limit
  );
  return rows as Record<string, unknown>[];
}
