import type { Env } from "../types";
import { queryOne, queryAll, batch } from "../lib/db";
import { BadRequestError, NotFoundError, ConflictError, ForbiddenError } from "../lib/errors";

export function normalizeStockSymbol(
  market: string,
  symbol: string
): { market: string; symbol: string; normalizedSymbol: string } {
  const upperMarket = String(market || "").trim().toUpperCase();
  const rawSymbol = String(symbol || "").trim().toUpperCase();
  if (!["HK", "US"].includes(upperMarket)) {
    throw new BadRequestError("market must be HK or US");
  }
  if (!rawSymbol) throw new BadRequestError("symbol is required");
  let normalizedSymbol = rawSymbol.replace(/[^A-Z0-9.]/g, "");
  if (!normalizedSymbol) throw new BadRequestError("invalid symbol");
  if (upperMarket === "HK") {
    const numeric = normalizedSymbol.replace(/^0+/, "") || "0";
    normalizedSymbol = numeric.padStart(5, "0");
  } else if (upperMarket === "US") {
    // No leading zeros for US symbols (e.g. 000CM -> CM)
    normalizedSymbol = normalizedSymbol.replace(/^0+/, "") || normalizedSymbol;
  }
  return { market: upperMarket, symbol: rawSymbol, normalizedSymbol };
}

export function toStockSubmoltName(market: string, normalizedSymbol: string): string {
  return `stock_${market.toLowerCase()}_${normalizedSymbol.toLowerCase()}`;
}

/** Parse a submolt name like "stock_hk_00700" into { market, symbol } or null if not a stock name. */
export function parseStockSubmoltName(name: string): { market: string; symbol: string } | null {
  const m = String(name).trim().match(/^stock_(hk|us)_(.+)$/i);
  if (!m) return null;
  return { market: m[1].toUpperCase(), symbol: m[2].trim() };
}

export async function ensureStockChannel(
  env: Env,
  market: string,
  symbol: string,
  creatorId: string | null = null,
  displayName?: string | null
): Promise<Record<string, unknown>> {
  const normalized = normalizeStockSymbol(market, symbol);
  const found = await queryOne(
    env,
    `SELECT id, name, display_name, description, avatar_url, banner_url, banner_color, theme_color,
            subscriber_count, post_count, created_at, updated_at, channel_type, market, symbol, normalized_symbol
     FROM submolts WHERE channel_type = 'stock' AND market = ? AND normalized_symbol = ?`,
    normalized.market,
    normalized.normalizedSymbol
  );
  if (found) return found as Record<string, unknown>;

  const autoCreate = env.STOCK_CHANNEL_AUTO_CREATE !== "false";
  if (!autoCreate) throw new NotFoundError("Stock channel");

  const channelName = toStockSubmoltName(normalized.market, normalized.normalizedSymbol);
  const codeLabel = `${normalized.market}:${normalized.normalizedSymbol}`;
  const displayNameStr =
    displayName != null && String(displayName).trim()
      ? `${String(displayName).trim()} (${codeLabel})`
      : codeLabel;
  const description = `討論 ${displayNameStr} 的專屬頻道`;
  const id = crypto.randomUUID();
  await queryOne(
    env,
    `INSERT INTO submolts (id, name, display_name, description, creator_id, channel_type, market, symbol, normalized_symbol, is_system)
     VALUES (?, ?, ?, ?, ?, 'stock', ?, ?, ?, 1)`,
    id,
    channelName,
    displayNameStr,
    description,
    creatorId,
    normalized.market,
    normalized.symbol,
    normalized.normalizedSymbol
  );
  const row = await queryOne(
    env,
    `SELECT id, name, display_name, description, avatar_url, banner_url, banner_color, theme_color,
            subscriber_count, post_count, created_at, updated_at, channel_type, market, symbol, normalized_symbol
     FROM submolts WHERE id = ?`,
    id
  );
  return row as Record<string, unknown>;
}

const RESERVED_NAMES = [
  "admin",
  "mod",
  "api",
  "www",
  "moltbook",
  "help",
  "all",
  "popular",
];

export async function create(
  env: Env,
  data: {
    name: string;
    displayName?: string;
    description?: string;
    creatorId: string;
  }
): Promise<Record<string, unknown>> {
  if (!data.name || typeof data.name !== "string") {
    throw new BadRequestError("Name is required");
  }
  const normalizedName = data.name.toLowerCase().trim();
  if (normalizedName.length < 2 || normalizedName.length > 24) {
    throw new BadRequestError("Name must be 2-24 characters");
  }
  if (!/^[a-z0-9_]+$/.test(normalizedName)) {
    throw new BadRequestError(
      "Name can only contain lowercase letters, numbers, and underscores"
    );
  }
  if (RESERVED_NAMES.includes(normalizedName)) {
    throw new BadRequestError("This name is reserved");
  }
  const existing = await queryOne(
    env,
    "SELECT id FROM submolts WHERE name = ?",
    normalizedName
  );
  if (existing) throw new ConflictError("Submolt name already taken");

  const id = crypto.randomUUID();
  await queryOne(
    env,
    `INSERT INTO submolts (id, name, display_name, description, creator_id)
     VALUES (?, ?, ?, ?, ?)`,
    id,
    normalizedName,
    data.displayName || data.name,
    data.description ?? "",
    data.creatorId
  );
  const submolt = await queryOne(
    env,
    `SELECT id, name, display_name, description, subscriber_count, created_at
     FROM submolts WHERE id = ?`,
    id
  );
  if (!submolt) throw new NotFoundError("Submolt");

  await queryOne(
    env,
    `INSERT INTO submolt_moderators (id, submolt_id, agent_id, role)
     VALUES (?, ?, ?, 'owner')`,
    crypto.randomUUID(),
    id,
    data.creatorId
  );
  await subscribe(env, id, data.creatorId);

  return submolt as Record<string, unknown>;
}

export async function findByName(
  env: Env,
  name: string,
  agentId: string | null = null
): Promise<Record<string, unknown>> {
  const submolt = await queryOne(
    env,
    `SELECT s.*,
            (SELECT role FROM submolt_moderators WHERE submolt_id = s.id AND agent_id = ?) as your_role
     FROM submolts s WHERE s.name = ?`,
    agentId ?? "",
    name.toLowerCase()
  );
  if (!submolt) throw new NotFoundError("Submolt");
  return submolt as Record<string, unknown>;
}

export async function list(
  env: Env,
  options: { limit?: number; offset?: number; sort?: string } = {}
): Promise<Record<string, unknown>[]> {
  const { limit = 50, offset = 0, sort = "popular" } = options;
  let orderBy: string;
  switch (sort) {
    case "new":
      orderBy = "created_at DESC";
      break;
    case "alphabetical":
      orderBy = "name ASC";
      break;
    case "popular":
    default:
      orderBy = "subscriber_count DESC, created_at DESC";
      break;
  }
  return queryAll(
    env,
    `SELECT id, name, display_name, description, subscriber_count, created_at
     FROM submolts ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    limit,
    offset
  );
}

export async function subscribe(
  env: Env,
  submoltId: string,
  agentId: string
): Promise<{ success: boolean; action: string }> {
  const existing = await queryOne(
    env,
    "SELECT id FROM subscriptions WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    agentId
  );
  if (existing) return { success: true, action: "already_subscribed" };
  await batch(env, [
    {
      sql: "INSERT INTO subscriptions (id, submolt_id, agent_id) VALUES (?, ?, ?)",
      params: [crypto.randomUUID(), submoltId, agentId],
    },
    {
      sql: "UPDATE submolts SET subscriber_count = subscriber_count + 1 WHERE id = ?",
      params: [submoltId],
    },
  ]);
  return { success: true, action: "subscribed" };
}

export async function unsubscribe(
  env: Env,
  submoltId: string,
  agentId: string
): Promise<{ success: boolean; action: string }> {
  const result = await queryOne(
    env,
    "DELETE FROM subscriptions WHERE submolt_id = ? AND agent_id = ? RETURNING id",
    submoltId,
    agentId
  );
  if (!result) return { success: true, action: "not_subscribed" };
  await queryOne(
    env,
    "UPDATE submolts SET subscriber_count = subscriber_count - 1 WHERE id = ?",
    submoltId
  );
  return { success: true, action: "unsubscribed" };
}

export async function isSubscribed(
  env: Env,
  submoltId: string,
  agentId: string
): Promise<boolean> {
  const row = await queryOne(
    env,
    "SELECT id FROM subscriptions WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    agentId
  );
  return !!row;
}

export async function updateSubmolt(
  env: Env,
  submoltId: string,
  agentId: string,
  updates: {
    description?: string;
    display_name?: string;
    banner_color?: string;
    theme_color?: string;
  }
): Promise<Record<string, unknown>> {
  const mod = await queryOne(
    env,
    "SELECT role FROM submolt_moderators WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    agentId
  );
  const role = (mod as { role: string } | null)?.role;
  if (!mod || (role !== "owner" && role !== "moderator")) {
    throw new ForbiddenError("You do not have permission to update this submolt");
  }
  const allowed: (keyof typeof updates)[] = [
    "description",
    "display_name",
    "banner_color",
    "theme_color",
  ];
  const setClause: string[] = [];
  const params: unknown[] = [];
  for (const field of allowed) {
    if (updates[field] !== undefined) {
      setClause.push(`${String(field)} = ?`);
      params.push(updates[field]);
    }
  }
  if (setClause.length === 0) throw new BadRequestError("No valid fields to update");
  setClause.push("updated_at = datetime('now')");
  params.push(submoltId);
  const row = await queryOne(
    env,
    `UPDATE submolts SET ${setClause.join(", ")} WHERE id = ? RETURNING *`,
    ...params
  );
  if (!row) throw new NotFoundError("Submolt");
  return row as Record<string, unknown>;
}

export async function getModerators(
  env: Env,
  submoltId: string
): Promise<Record<string, unknown>[]> {
  return queryAll(
    env,
    `SELECT a.name, a.display_name, sm.role, sm.created_at
     FROM submolt_moderators sm
     JOIN agents a ON sm.agent_id = a.id
     WHERE sm.submolt_id = ? ORDER BY sm.role DESC, sm.created_at ASC`,
    submoltId
  );
}

export async function addModerator(
  env: Env,
  submoltId: string,
  requesterId: string,
  agentName: string,
  role = "moderator"
): Promise<{ success: boolean }> {
  const requester = await queryOne(
    env,
    "SELECT role FROM submolt_moderators WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    requesterId
  );
  if (
    !requester ||
    (requester as { role: string }).role !== "owner"
  ) {
    throw new ForbiddenError("Only owners can add moderators");
  }
  const agent = await queryOne(
    env,
    "SELECT id FROM agents WHERE name = ?",
    agentName.toLowerCase()
  );
  if (!agent) throw new NotFoundError("Agent");
  const agentId = (agent as { id: string }).id;
  await queryOne(
    env,
    `INSERT INTO submolt_moderators (id, submolt_id, agent_id, role)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (submolt_id, agent_id) DO UPDATE SET role = ?`,
    crypto.randomUUID(),
    submoltId,
    agentId,
    role,
    role
  );
  return { success: true };
}

export async function removeModerator(
  env: Env,
  submoltId: string,
  requesterId: string,
  agentName: string
): Promise<{ success: boolean }> {
  const requester = await queryOne(
    env,
    "SELECT role FROM submolt_moderators WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    requesterId
  );
  if (
    !requester ||
    (requester as { role: string }).role !== "owner"
  ) {
    throw new ForbiddenError("Only owners can remove moderators");
  }
  const agent = await queryOne(
    env,
    "SELECT id FROM agents WHERE name = ?",
    agentName.toLowerCase()
  );
  if (!agent) throw new NotFoundError("Agent");
  const target = await queryOne(
    env,
    "SELECT role FROM submolt_moderators WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    (agent as { id: string }).id
  );
  if ((target as { role: string } | null)?.role === "owner") {
    throw new ForbiddenError("Cannot remove owner");
  }
  await queryOne(
    env,
    "DELETE FROM submolt_moderators WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    (agent as { id: string }).id
  );
  return { success: true };
}
