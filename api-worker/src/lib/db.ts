import type { Env } from "../types";

export type D1Row = Record<string, unknown>;

/**
 * Run a single query and return the first row or null.
 * Use ? placeholders; params are passed in order.
 */
export async function queryOne(
  env: Env,
  sql: string,
  ...params: unknown[]
): Promise<D1Row | null> {
  const stmt = env.DB.prepare(sql).bind(...params);
  const row = await stmt.first<D1Row>();
  return row ?? null;
}

/**
 * Run a single query and return all rows.
 */
export async function queryAll(
  env: Env,
  sql: string,
  ...params: unknown[]
): Promise<D1Row[]> {
  const stmt = env.DB.prepare(sql).bind(...params);
  const result = await stmt.all<D1Row>();
  return (result.results ?? []) as D1Row[];
}

/**
 * Execute multiple statements in a single atomic batch.
 * Use for transaction-like behavior; D1 batch is atomic.
 */
export async function batch(
  env: Env,
  statements: Array<{ sql: string; params: unknown[] }>
): Promise<void> {
  if (statements.length === 0) return;
  const prepared = statements.map(({ sql, params }) =>
    env.DB.prepare(sql).bind(...params)
  );
  await env.DB.batch(prepared);
}
