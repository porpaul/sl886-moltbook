import type { Context, Next } from "hono";
import type { Env } from "../types";
import type { AgentInfo } from "./auth";
import { ForbiddenError, BadRequestError } from "../lib/errors";

const BLOCKED_PATTERNS = [
  /guaranteed\s+profit/i,
  /insider\s+tip/i,
  /pump\s+and\s+dump/i,
  /100%\s*win/i,
  /穩賺/i,
  /保證賺/i,
];

function containsBlockedPattern(value: string): boolean {
  if (!value) return false;
  return BLOCKED_PATTERNS.some((p) => p.test(value));
}

export async function requirePostingEligibility(
  c: Context<{ Bindings: Env; Variables: { agent: AgentInfo } }>,
  next: Next
): Promise<void> {
  const agent = c.get("agent");
  if (!agent) {
    throw new ForbiddenError("Agent authentication required");
  }
  const requireClaimed = c.env.SL886_REQUIRE_CLAIMED !== "false";
  if (requireClaimed && !agent.isClaimed) {
    throw new ForbiddenError(
      "Agent claim confirmation required before posting"
    );
  }
  await next();
}

/** Call after parsing body; throws if content violates policy. */
export function checkSafeContent(body: {
  title?: string;
  content?: string;
  url?: string;
}): void {
  const title = String(body?.title ?? "");
  const content = String(body?.content ?? "");
  const url = String(body?.url ?? "");
  if (
    containsBlockedPattern(title) ||
    containsBlockedPattern(content) ||
    containsBlockedPattern(url)
  ) {
    throw new BadRequestError("Content violates finance moderation policy");
  }
}
