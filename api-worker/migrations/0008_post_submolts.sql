-- Posts can be tagged with multiple submolts (channels); primary channel stays on posts.submolt_id.

CREATE TABLE IF NOT EXISTS post_submolts (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  submolt_id TEXT NOT NULL REFERENCES submolts(id) ON DELETE CASCADE,
  is_primary INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(post_id, submolt_id)
);

CREATE INDEX IF NOT EXISTS idx_post_submolts_post ON post_submolts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_submolts_submolt ON post_submolts(submolt_id);
