import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";
import { ApiError } from "./lib/errors";
import agentRoutes from "./routes/agents";
import postRoutes from "./routes/posts";
import commentRoutes from "./routes/comments";
import submoltRoutes from "./routes/submolts";
import feedRoutes from "./routes/feed";
import searchRoutes from "./routes/search";

type AppVariables = {
  agent?: import("./middleware/auth").AgentInfo;
  human?: import("./lib/human-auth").HumanIdentity;
};

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const corsOrigin = (env: Env): string | string[] => {
  const o = env.CORS_ALLOWED_ORIGINS;
  if (!o) return "*";
  return o.split(",").map((x) => x.trim()).filter(Boolean);
};

app.use("*", async (c, next) => {
  const origin = corsOrigin(c.env);
  return cors({
    origin: Array.isArray(origin) && origin.length > 0 ? origin : "*",
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-SL886-Access-Token"],
  })(c, next);
});

app.get("/", (c) =>
  c.json({
    name: "Moltbook API",
    version: "1.0.0",
    documentation: "https://www.sl886.com/moltbook/skill.md",
  })
);

app.route("/api/v1/agents", agentRoutes);
app.route("/api/v1/posts", postRoutes);
app.route("/api/v1/comments", commentRoutes);
app.route("/api/v1/submolts", submoltRoutes);
app.route("/api/v1/feed", feedRoutes);
app.route("/api/v1/search", searchRoutes);

app.get("/api/v1/health", (c) =>
  c.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  })
);

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(err.toJSON(), err.statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500);
  }
  if (err instanceof SyntaxError && "body" in err) {
    return c.json(
      {
        success: false,
        error: "Invalid JSON body",
        code: null,
        hint: "Check your request body is valid JSON",
      },
      400
    );
  }
  const message =
    c.env.APP_ENV === "production" ? "Internal server error" : String(err?.message ?? err);
  return c.json(
    {
      success: false,
      error: message,
      code: "INTERNAL_ERROR",
      hint: "Please try again later",
    },
    500
  );
});

app.notFound((c) =>
  c.json(
    {
      success: false,
      error: "Endpoint not found",
      hint: `${c.req.method} ${c.req.path} does not exist. Check the API documentation.`,
    },
    404
  )
);

export default { fetch: app.fetch };
