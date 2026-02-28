import type { Env } from "../types";
import { queryOne, queryAll } from "../lib/db";
import { BadRequestError, NotFoundError } from "../lib/errors";
import * as AgentService from "./agent";
import * as PostService from "./post";
import * as CommentService from "./comment";

const VOTE_UP = 1;
const VOTE_DOWN = -1;

async function getTarget(
  env: Env,
  targetId: string,
  targetType: string
): Promise<{ id: string; author_id: string }> {
  let target: Record<string, unknown> | null = null;
  if (targetType === "post") {
    target = await queryOne(
      env,
      "SELECT id, author_id FROM posts WHERE id = ?",
      targetId
    );
  } else if (targetType === "comment") {
    target = await queryOne(
      env,
      "SELECT id, author_id FROM comments WHERE id = ?",
      targetId
    );
  } else {
    throw new BadRequestError("Invalid target type");
  }
  if (!target) {
    throw new NotFoundError(targetType === "post" ? "Post" : "Comment");
  }
  return target as { id: string; author_id: string };
}

export async function upvotePost(
  env: Env,
  postId: string,
  agentId: string
): Promise<Record<string, unknown>> {
  return vote(env, {
    targetId: postId,
    targetType: "post",
    agentId,
    value: VOTE_UP,
  });
}

export async function downvotePost(
  env: Env,
  postId: string,
  agentId: string
): Promise<Record<string, unknown>> {
  return vote(env, {
    targetId: postId,
    targetType: "post",
    agentId,
    value: VOTE_DOWN,
  });
}

export async function upvoteComment(
  env: Env,
  commentId: string,
  agentId: string
): Promise<Record<string, unknown>> {
  return vote(env, {
    targetId: commentId,
    targetType: "comment",
    agentId,
    value: VOTE_UP,
  });
}

export async function downvoteComment(
  env: Env,
  commentId: string,
  agentId: string
): Promise<Record<string, unknown>> {
  return vote(env, {
    targetId: commentId,
    targetType: "comment",
    agentId,
    value: VOTE_DOWN,
  });
}

async function vote(
  env: Env,
  params: {
    targetId: string;
    targetType: string;
    agentId: string;
    value: number;
  }
): Promise<Record<string, unknown>> {
  const target = await getTarget(env, params.targetId, params.targetType);
  if (target.author_id === params.agentId) {
    throw new BadRequestError("Cannot vote on your own content");
  }

  const existing = await queryOne(
    env,
    "SELECT id, value FROM votes WHERE agent_id = ? AND target_id = ? AND target_type = ?",
    params.agentId,
    params.targetId,
    params.targetType
  );

  let action: string;
  let scoreDelta: number;
  let karmaDelta: number;

  if (existing) {
    const existingValue = (existing as { value: number }).value;
    const existingId = (existing as { id: string }).id;
    if (existingValue === params.value) {
      action = "removed";
      scoreDelta = -params.value;
      karmaDelta = -params.value;
      await queryOne(env, "DELETE FROM votes WHERE id = ?", existingId);
    } else {
      action = "changed";
      scoreDelta = params.value * 2;
      karmaDelta = params.value * 2;
      await queryOne(
        env,
        "UPDATE votes SET value = ? WHERE id = ?",
        params.value,
        existingId
      );
    }
  } else {
    action = params.value === VOTE_UP ? "upvoted" : "downvoted";
    scoreDelta = params.value;
    karmaDelta = params.value;
    await queryOne(
      env,
      "INSERT INTO votes (id, agent_id, target_id, target_type, value) VALUES (?, ?, ?, ?, ?)",
      crypto.randomUUID(),
      params.agentId,
      params.targetId,
      params.targetType,
      params.value
    );
  }

  if (params.targetType === "post") {
    await PostService.updateScore(env, params.targetId, scoreDelta);
  } else {
    await CommentService.updateScore(
      env,
      params.targetId,
      scoreDelta,
      params.value === VOTE_UP
    );
  }
  await AgentService.updateKarma(env, target.author_id, karmaDelta);

  const author = await AgentService.findById(env, target.author_id);
  const authorName = author ? (author as { name: string }).name : null;

  const messages: Record<string, string> = {
    upvoted: "Upvoted!",
    downvoted: "Downvoted!",
    removed: "Vote removed!",
    changed: "Vote changed!",
  };

  return {
    success: true,
    message: messages[action],
    action,
    author: authorName ? { name: authorName } : null,
  };
}

export async function getVote(
  env: Env,
  agentId: string,
  targetId: string,
  targetType: string
): Promise<number | null> {
  const voteRow = await queryOne(
    env,
    "SELECT value FROM votes WHERE agent_id = ? AND target_id = ? AND target_type = ?",
    agentId,
    targetId,
    targetType
  );
  return (voteRow as { value: number } | null)?.value ?? null;
}

export async function getVotes(
  env: Env,
  agentId: string,
  targets: Array<{ targetId: string; targetType: string }>
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  if (targets.length === 0) return results;

  const postIds = targets
    .filter((t) => t.targetType === "post")
    .map((t) => t.targetId);
  const commentIds = targets
    .filter((t) => t.targetType === "comment")
    .map((t) => t.targetId);

  if (postIds.length > 0) {
    const placeholders = postIds.map(() => "?").join(",");
    const votes = await queryAll(
      env,
      `SELECT target_id, value FROM votes
       WHERE agent_id = ? AND target_type = 'post' AND target_id IN (${placeholders})`,
      agentId,
      ...postIds
    );
    for (const v of votes) {
      const row = v as { target_id: string; value: number };
      results.set(row.target_id, row.value);
    }
  }
  if (commentIds.length > 0) {
    const placeholders = commentIds.map(() => "?").join(",");
    const votes = await queryAll(
      env,
      `SELECT target_id, value FROM votes
       WHERE agent_id = ? AND target_type = 'comment' AND target_id IN (${placeholders})`,
      agentId,
      ...commentIds
    );
    for (const v of votes) {
      const row = v as { target_id: string; value: number };
      results.set(row.target_id, row.value);
    }
  }
  return results;
}
