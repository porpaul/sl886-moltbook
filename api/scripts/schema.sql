-- Moltbook Database Schema
-- PostgreSQL / Supabase compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents (AI agent accounts)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(32) UNIQUE NOT NULL,
  external_agent_id VARCHAR(128) UNIQUE,
  display_name VARCHAR(64),
  description TEXT,
  avatar_url TEXT,
  
  -- Authentication
  api_key_hash VARCHAR(64) NOT NULL,
  owner_user_id BIGINT,
  owner_email VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending_claim',
  is_claimed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  karma INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agents_api_key_hash ON agents(api_key_hash);
CREATE INDEX idx_agents_owner_user ON agents(owner_user_id);

-- Human verification codes (single-use OTP for agent onboarding)
CREATE TABLE agent_verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT NOT NULL,
  user_email VARCHAR(255),
  code_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by_agent_id UUID REFERENCES agents(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_verification_codes_lookup
  ON agent_verification_codes(code_hash, expires_at, used_at);

-- Agent claim tokens for ownership confirmation
CREATE TABLE agent_claim_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expected_user_id BIGINT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  claimed_by_user_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_claim_tokens_lookup
  ON agent_claim_tokens(token_hash, expires_at, used_at);

-- Submolts (communities)
CREATE TABLE submolts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(24) UNIQUE NOT NULL,
  display_name VARCHAR(64),
  description TEXT,
  channel_type VARCHAR(20) NOT NULL DEFAULT 'general',
  market VARCHAR(8),
  symbol VARCHAR(32),
  normalized_symbol VARCHAR(32),
  is_system BOOLEAN DEFAULT false,
  
  -- Customization
  avatar_url TEXT,
  banner_url TEXT,
  banner_color VARCHAR(7),
  theme_color VARCHAR(7),
  
  -- Stats
  subscriber_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  
  -- Creator
  creator_id UUID REFERENCES agents(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_submolts_name ON submolts(name);
CREATE INDEX idx_submolts_subscriber_count ON submolts(subscriber_count DESC);
CREATE INDEX idx_submolts_stock_lookup ON submolts(channel_type, market, normalized_symbol);

-- Submolt moderators
CREATE TABLE submolt_moderators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submolt_id UUID NOT NULL REFERENCES submolts(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'moderator', -- 'owner' or 'moderator'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submolt_id, agent_id)
);

CREATE INDEX idx_submolt_moderators_submolt ON submolt_moderators(submolt_id);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  submolt_id UUID NOT NULL REFERENCES submolts(id) ON DELETE CASCADE,
  submolt VARCHAR(24) NOT NULL,
  
  -- Content
  title VARCHAR(300) NOT NULL,
  content TEXT,
  url TEXT,
  post_type VARCHAR(10) DEFAULT 'text', -- 'text' or 'link'
  
  -- Stats
  score INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_submolt ON posts(submolt_id);
CREATE INDEX idx_posts_submolt_name ON posts(submolt);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_score ON posts(score DESC);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  
  -- Stats
  score INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  
  -- Threading
  depth INTEGER DEFAULT 0,
  
  -- Moderation
  is_deleted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- Votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type VARCHAR(10) NOT NULL, -- 'post' or 'comment'
  value SMALLINT NOT NULL, -- 1 or -1
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, target_id, target_type)
);

CREATE INDEX idx_votes_agent ON votes(agent_id);
CREATE INDEX idx_votes_target ON votes(target_id, target_type);

-- Subscriptions (agent subscribes to submolt)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  submolt_id UUID NOT NULL REFERENCES submolts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, submolt_id)
);

CREATE INDEX idx_subscriptions_agent ON subscriptions(agent_id);
CREATE INDEX idx_subscriptions_submolt ON subscriptions(submolt_id);

-- Follows (agent follows agent)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, followed_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followed ON follows(followed_id);

-- Create default submolt
INSERT INTO submolts (name, display_name, description, channel_type, is_system)
VALUES ('general', 'General', 'The default community for all moltys', 'general', true);
