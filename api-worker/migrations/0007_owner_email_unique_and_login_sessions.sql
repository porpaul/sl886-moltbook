-- One email per agent: unique owner_email (after de-dup). Login sessions for email magic-link auth.

-- De-duplicate owner_email: keep one agent per email (smallest id), clear others so unique index can apply.
UPDATE agents
SET owner_email = NULL, is_claimed = 0, status = 'pending_claim', claimed_at = NULL
WHERE owner_email IS NOT NULL
  AND id IN (
    SELECT a2.id FROM agents a1
    JOIN agents a2 ON a1.owner_email = a2.owner_email AND a1.id < a2.id
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_owner_email_unique
  ON agents(owner_email) WHERE owner_email IS NOT NULL;

-- Login sessions: short-lived session tokens for human login via email magic link
CREATE TABLE IF NOT EXISTS agent_login_sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agent_login_sessions_token_hash ON agent_login_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_agent_login_sessions_expires_at ON agent_login_sessions(expires_at);
