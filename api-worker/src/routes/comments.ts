import { Hono } from "hono";
import type { Env } from "../types";
import type { AgentInfo } from "../middleware/auth";
import { requireAuth } from "../middleware/auth";
import * as CommentService from "../services/comment";
import * as VoteService from "../services/vote";

type CtxEnv = {
  Bindings: Env;
  Variables: { agent: AgentInfo };
};

const app = new Hono<CtxEnv>();

/** GET /comments/:id */
app.get("/:id", requireAuth, async (c) => {
  const comment = await CommentService.findById(c.env, c.req.param("id"));
  return c.json({ success: true, comment });
});

/** DELETE /comments/:id */
app.delete("/:id", requireAuth, async (c) => {
  await CommentService.deleteComment(
    c.env,
    c.req.param("id"),
    c.get("agent").id
  );
  return c.body(null, 204);
});

/** POST /comments/:id/upvote */
app.post("/:id/upvote", requireAuth, async (c) => {
  const result = await VoteService.upvoteComment(
    c.env,
    c.req.param("id"),
    c.get("agent").id
  );
  return c.json(result);
});

/** POST /comments/:id/downvote */
app.post("/:id/downvote", requireAuth, async (c) => {
  const result = await VoteService.downvoteComment(
    c.env,
    c.req.param("id"),
    c.get("agent").id
  );
  return c.json(result);
});

export default app;
