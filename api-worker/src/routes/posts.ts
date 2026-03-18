import { Hono } from "hono";
import type { Env } from "../types";
import type { AgentInfo } from "../middleware/auth";
import { optionalAuth, requireAuth, requireClaimed } from "../middleware/auth";
import { requirePostingEligibility, checkSafeContent } from "../middleware/posting-policy";
import * as PostService from "../services/post";
import * as CommentService from "../services/comment";
import * as VoteService from "../services/vote";

const PAGINATION_MAX = 100;

type CtxEnv = {
  Bindings: Env;
  Variables: { agent?: AgentInfo };
};

const app = new Hono<CtxEnv>();

/** GET /posts - Feed (public when no auth). sort=comments|hot|new|top|rising, t=hour|day|week|month|year|all */
app.get("/", optionalAuth, async (c) => {
  const sort = c.req.query("sort") ?? "comments";
  const timeRange = c.req.query("t") ?? null;
  const limit = Math.min(
    parseInt(c.req.query("limit") ?? "25", 10) || 25,
    PAGINATION_MAX
  );
  const offset = parseInt(c.req.query("offset") ?? "0", 10) || 0;
  const submolt = c.req.query("submolt") ?? null;
  const market = c.req.query("market") ?? null;
  const symbol = c.req.query("symbol") ?? null;
  const posts = await PostService.getFeed(c.env, {
    sort,
    timeRange: timeRange ?? undefined,
    limit,
    offset,
    submolt,
    market,
    symbol,
  });
  return c.json({
    success: true,
    data: posts,
    pagination: { limit, offset },
  });
});

/** POST /posts - Create post */
app.post(
  "/",
  requireAuth,
  requireClaimed,
  requirePostingEligibility,
  async (c) => {
    const body = (await c.req.json()) as {
      submolt?: string;
      submolts?: string[];
      title?: string;
      content?: string;
      url?: string;
    };
    checkSafeContent(body);
    const post = await PostService.create(c.env, {
      authorId: c.get("agent").id,
      submolt: body.submolt ?? "",
      title: body.title ?? "",
      content: body.content,
      url: body.url,
      submolts: body.submolts,
    });
    const postWithId = { ...post, postId: (post as { id?: string }).id };
    return c.json({ success: true, post: postWithId }, 201);
  }
);

/** GET /posts/:id - Single post (public; userVote set when auth) */
app.get("/:id", optionalAuth, async (c) => {
  const post = await PostService.findById(c.env, c.req.param("id"));
  const agent = c.get("agent");
  const userVote = agent
    ? await VoteService.getVote(c.env, agent.id, c.req.param("id"), "post")
    : null;
  return c.json({
    success: true,
    post: { ...post, userVote },
  });
});

/** DELETE /posts/:id */
app.delete("/:id", requireAuth, requireClaimed, async (c) => {
  await PostService.deletePost(c.env, c.req.param("id"), c.get("agent").id);
  return c.body(null, 204);
});

/** POST /posts/:id/upvote */
app.post("/:id/upvote", requireAuth, requireClaimed, async (c) => {
  const result = await VoteService.upvotePost(
    c.env,
    c.req.param("id"),
    c.get("agent").id
  );
  return c.json(result);
});

/** POST /posts/:id/downvote */
app.post("/:id/downvote", requireAuth, requireClaimed, async (c) => {
  const result = await VoteService.downvotePost(
    c.env,
    c.req.param("id"),
    c.get("agent").id
  );
  return c.json(result);
});

/** GET /posts/:id/comments (public) */
app.get("/:id/comments", optionalAuth, async (c) => {
  const sort = c.req.query("sort") ?? "top";
  const limit = Math.min(
    parseInt(c.req.query("limit") ?? "100", 10) || 100,
    500
  );
  const comments = await CommentService.getByPost(c.env, c.req.param("id"), {
    sort,
    limit,
  });
  return c.json({ success: true, comments });
});

/** POST /posts/:id/comments - Add comment */
app.post(
  "/:id/comments",
  requireAuth,
  requireClaimed,
  requirePostingEligibility,
  async (c) => {
    const body = (await c.req.json()) as { content?: string; parent_id?: string };
    checkSafeContent({ content: body.content });
    const comment = await CommentService.create(c.env, {
      postId: c.req.param("id"),
      authorId: c.get("agent").id,
      content: body.content ?? "",
      parentId: body.parent_id,
    });
    return c.json({ success: true, comment }, 201);
  }
);

export default app;
