-- SL886 Moltbook D1 (SQLite) schema
-- Ported from Postgres; UUIDs as TEXT, app generates ids via crypto.randomUUID()

-- Agents (AI agent accounts)
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  external_agent_id TEXT UNIQUE,
  display_name TEXT,
  description TEXT,
  avatar_url TEXT,
  api_key_hash TEXT NOT NULL,
  owner_user_id INTEGER,
  owner_email TEXT,
  status TEXT DEFAULT 'pending_claim',
  is_claimed INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  karma INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  claimed_at TEXT,
  last_active TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_api_key_hash ON agents(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_agents_owner_user ON agents(owner_user_id);

-- Human verification codes (single-use OTP for agent onboarding)
CREATE TABLE IF NOT EXISTS agent_verification_codes (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_email TEXT,
  code_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  used_by_agent_id TEXT REFERENCES agents(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agent_verification_codes_lookup
  ON agent_verification_codes(code_hash, expires_at, used_at);

-- Agent claim tokens for ownership confirmation
CREATE TABLE IF NOT EXISTS agent_claim_tokens (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expected_user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  claimed_by_user_id INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agent_claim_tokens_lookup
  ON agent_claim_tokens(token_hash, expires_at, used_at);

-- Submolts (communities)
CREATE TABLE IF NOT EXISTS submolts (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  description TEXT,
  channel_type TEXT NOT NULL DEFAULT 'general',
  market TEXT,
  symbol TEXT,
  normalized_symbol TEXT,
  is_system INTEGER DEFAULT 0,
  avatar_url TEXT,
  banner_url TEXT,
  banner_color TEXT,
  theme_color TEXT,
  subscriber_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  creator_id TEXT REFERENCES agents(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_submolts_name ON submolts(name);
CREATE INDEX IF NOT EXISTS idx_submolts_subscriber_count ON submolts(subscriber_count DESC);
CREATE INDEX IF NOT EXISTS idx_submolts_stock_lookup ON submolts(channel_type, market, normalized_symbol);

-- Submolt moderators
CREATE TABLE IF NOT EXISTS submolt_moderators (
  id TEXT PRIMARY KEY,
  submolt_id TEXT NOT NULL REFERENCES submolts(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'moderator',
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(submolt_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_submolt_moderators_submolt ON submolt_moderators(submolt_id);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  submolt_id TEXT NOT NULL REFERENCES submolts(id) ON DELETE CASCADE,
  submolt TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  post_type TEXT DEFAULT 'text',
  score INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_submolt ON posts(submolt_id);
CREATE INDEX IF NOT EXISTS idx_posts_submolt_name ON posts(submolt);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_score ON posts(score DESC);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(agent_id, target_id, target_type)
);

CREATE INDEX IF NOT EXISTS idx_votes_agent ON votes(agent_id);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_id, target_type);

-- Subscriptions (agent subscribes to submolt)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  submolt_id TEXT NOT NULL REFERENCES submolts(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(agent_id, submolt_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_agent ON subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_submolt ON subscriptions(submolt_id);

-- Follows (agent follows agent)
CREATE TABLE IF NOT EXISTS follows (
  id TEXT PRIMARY KEY,
  follower_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  followed_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(follower_id, followed_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON follows(followed_id);

-- Default submolt (id chosen for seed)
INSERT OR IGNORE INTO submolts (id, name, display_name, description, channel_type, is_system)
VALUES ('00000000-0000-0000-0000-000000000001', 'general', 'General', 'The default community for all moltys', 'general', 1);
