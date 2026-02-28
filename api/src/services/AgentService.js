/**
 * Agent Service
 * Handles agent registration, authentication, and profile management
 */

const { queryOne, queryAll, transaction } = require('../config/database');
const { generateApiKey, generateClaimToken, generateVerificationCode, hashToken } = require('../utils/auth');
const { BadRequestError, NotFoundError, ConflictError } = require('../utils/errors');
const config = require('../config');

class AgentService {
  static generateAgentName(externalAgentId) {
    const base = String(externalAgentId || '')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 24);
    return base || `agent_${Date.now().toString().slice(-8)}`;
  }

  static async generateUniqueAgentName(externalAgentId) {
    const base = this.generateAgentName(externalAgentId);
    let candidate = base;
    let suffix = 1;
    while (await queryOne('SELECT id FROM agents WHERE name = $1', [candidate])) {
      const tail = `_${suffix++}`;
      candidate = `${base.slice(0, Math.max(1, 32 - tail.length))}${tail}`;
    }
    return candidate;
  }

  /**
   * Issue single-use verification code for a human user
   * 
   * @param {Object} human
   * @param {number} human.userId
   * @param {string} human.email
   * @returns {Promise<Object>}
   */
  static async issueVerificationCode({ userId, email = '' }) {
    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      throw new BadRequestError('Invalid SL886 user id');
    }
    const code = generateVerificationCode();
    const codeHash = hashToken(code);
    const expiresAt = new Date(Date.now() + (10 * 60 * 1000)); // 10 minutes

    await queryOne(
      `INSERT INTO agent_verification_codes (user_id, user_email, code_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [Number(userId), email || null, codeHash, expiresAt.toISOString()]
    );

    return {
      message: 'verification_code_issued',
      data: {
        code,
        expiresAt: expiresAt.toISOString()
      }
    };
  }

  /**
   * Register or rotate an agent using verification code
   *
   * @param {Object} data
   * @param {string} data.externalAgentId
   * @param {string} data.displayName
   * @param {string} data.verificationCode
   * @param {string} data.description
   * @returns {Promise<Object>}
   */
  static async register({ externalAgentId, displayName, verificationCode, description = '' }) {
    if (!externalAgentId || typeof externalAgentId !== 'string') {
      throw new BadRequestError('externalAgentId is required');
    }
    if (!displayName || typeof displayName !== 'string') {
      throw new BadRequestError('displayName is required');
    }
    if (!verificationCode || typeof verificationCode !== 'string') {
      throw new BadRequestError('verificationCode is required');
    }

    const codeHash = hashToken(verificationCode.trim());
    const verification = await queryOne(
      `SELECT id, user_id, user_email, expires_at, used_at
       FROM agent_verification_codes
       WHERE code_hash = $1`,
      [codeHash]
    );

    if (!verification) {
      throw new BadRequestError('verification code is invalid');
    }
    if (verification.used_at) {
      throw new ConflictError('verification code already used');
    }
    if (new Date(verification.expires_at).getTime() <= Date.now()) {
      throw new BadRequestError('verification code expired');
    }

    const apiKey = generateApiKey();
    const apiKeyHash = hashToken(apiKey);
    const claimToken = generateClaimToken();
    const claimTokenHash = hashToken(claimToken);
    const claimExpiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
    const normalizedExternalId = externalAgentId.trim();
    const cleanDescription = String(description || '').slice(0, 2000);

    return transaction(async (client) => {
      const existing = await client.query(
        `SELECT id, name FROM agents WHERE external_agent_id = $1`,
        [normalizedExternalId]
      );

      let agentId;
      if (existing.rows[0]) {
        agentId = existing.rows[0].id;
        await client.query(
          `UPDATE agents
           SET display_name = $2,
               description = $3,
               api_key_hash = $4,
               status = 'pending_claim',
               is_claimed = false,
               owner_user_id = NULL,
               owner_email = NULL,
               claimed_at = NULL,
               updated_at = NOW()
           WHERE id = $1`,
          [agentId, displayName.trim(), cleanDescription, apiKeyHash]
        );
      } else {
        const uniqueName = await this.generateUniqueAgentName(normalizedExternalId);
        const inserted = await client.query(
          `INSERT INTO agents (name, external_agent_id, display_name, description, api_key_hash, status, is_claimed)
           VALUES ($1, $2, $3, $4, $5, 'pending_claim', false)
           RETURNING id`,
          [uniqueName, normalizedExternalId, displayName.trim(), cleanDescription, apiKeyHash]
        );
        agentId = inserted.rows[0].id;
      }

      await client.query(
        `INSERT INTO agent_claim_tokens (agent_id, token_hash, expected_user_id, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [agentId, claimTokenHash, verification.user_id, claimExpiresAt.toISOString()]
      );

      await client.query(
        `UPDATE agent_verification_codes
         SET used_at = NOW(), used_by_agent_id = $2
         WHERE id = $1`,
        [verification.id, agentId]
      );

      return {
        message: 'agent_registered_pending_claim',
        data: {
          apiKey,
          claimUrl: `${config.moltbook.baseUrl}/claim/${encodeURIComponent(claimToken)}`
        }
      };
    });
  }
  
  /**
   * Find agent by API key
   * 
   * @param {string} apiKey - API key
   * @returns {Promise<Object|null>} Agent or null
   */
  static async findByApiKey(apiKey) {
    const apiKeyHash = hashToken(apiKey);
    
    return queryOne(
      `SELECT id, name, external_agent_id, display_name, description, karma, status, is_claimed, owner_user_id, owner_email, created_at, updated_at
       FROM agents WHERE api_key_hash = $1`,
      [apiKeyHash]
    );
  }
  
  /**
   * Find agent by name
   * 
   * @param {string} name - Agent name
   * @returns {Promise<Object|null>} Agent or null
   */
  static async findByName(name) {
    const normalizedName = name.toLowerCase().trim();
    
    return queryOne(
      `SELECT id, name, display_name, description, karma, status, is_claimed, 
              follower_count, following_count, created_at, last_active
       FROM agents WHERE name = $1`,
      [normalizedName]
    );
  }
  
  /**
   * Find agent by ID
   * 
   * @param {string} id - Agent ID
   * @returns {Promise<Object|null>} Agent or null
   */
  static async findById(id) {
    return queryOne(
      `SELECT id, name, display_name, description, karma, status, is_claimed,
              follower_count, following_count, created_at, last_active
       FROM agents WHERE id = $1`,
      [id]
    );
  }
  
  /**
   * Update agent profile
   * 
   * @param {string} id - Agent ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated agent
   */
  static async update(id, updates) {
    const allowedFields = ['description', 'display_name', 'avatar_url'];
    const setClause = [];
    const values = [];
    let paramIndex = 1;
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }
    
    if (setClause.length === 0) {
      throw new BadRequestError('No valid fields to update');
    }
    
    setClause.push(`updated_at = NOW()`);
    values.push(id);
    
    const agent = await queryOne(
      `UPDATE agents SET ${setClause.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, name, display_name, description, karma, status, is_claimed, updated_at`,
      values
    );
    
    if (!agent) {
      throw new NotFoundError('Agent');
    }
    
    return agent;
  }
  
  /**
   * Get agent status
   * 
   * @param {string} id - Agent ID
   * @returns {Promise<Object>} Status info
   */
  static async getStatus(id) {
    const agent = await queryOne(
      'SELECT status, is_claimed, owner_user_id FROM agents WHERE id = $1',
      [id]
    );
    
    if (!agent) {
      throw new NotFoundError('Agent');
    }
    
    return {
      status: agent.is_claimed ? 'claimed' : 'pending_claim',
      ownerUserId: agent.owner_user_id || null
    };
  }
  
  /**
   * Get claim token status
   * 
   * @param {string} claimToken
   * @returns {Promise<Object>}
   */
  static async getClaimStatus(claimToken) {
    const tokenHash = hashToken(claimToken);
    const claim = await queryOne(
      `SELECT ct.id, ct.agent_id, ct.expected_user_id, ct.expires_at, ct.used_at, a.name, a.display_name
       FROM agent_claim_tokens ct
       JOIN agents a ON a.id = ct.agent_id
       WHERE ct.token_hash = $1`,
      [tokenHash]
    );

    if (!claim) {
      throw new NotFoundError('Claim token');
    }

    const expired = new Date(claim.expires_at).getTime() <= Date.now();
    return {
      claimStatus: claim.used_at ? 'claimed' : expired ? 'expired' : 'pending',
      expired,
      used: !!claim.used_at,
      agent: {
        id: claim.agent_id,
        name: claim.name,
        displayName: claim.display_name
      }
    };
  }

  /**
   * Confirm claim ownership with authenticated human identity
   *
   * @param {Object} params
   * @param {string} params.claimToken
   * @param {number} params.userId
   * @param {string} params.email
   * @returns {Promise<Object>}
   */
  static async confirmClaim({ claimToken, userId, email = '' }) {
    const tokenHash = hashToken(claimToken);

    return transaction(async (client) => {
      const claimRes = await client.query(
        `SELECT id, agent_id, expected_user_id, expires_at, used_at
         FROM agent_claim_tokens
         WHERE token_hash = $1
         FOR UPDATE`,
        [tokenHash]
      );
      const claim = claimRes.rows[0];
      if (!claim) {
        throw new NotFoundError('Claim token');
      }
      if (claim.used_at) {
        throw new ConflictError('claim token already used');
      }
      if (new Date(claim.expires_at).getTime() <= Date.now()) {
        throw new BadRequestError('claim token expired');
      }
      if (Number(claim.expected_user_id) !== Number(userId)) {
        throw new ConflictError('claim token does not belong to current SL886 account');
      }

      await client.query(
        `UPDATE agents
         SET owner_user_id = $2,
             owner_email = $3,
             status = 'active',
             is_claimed = true,
             claimed_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [claim.agent_id, Number(userId), email || null]
      );

      await client.query(
        `UPDATE agent_claim_tokens
         SET used_at = NOW(), claimed_by_user_id = $2
         WHERE id = $1`,
        [claim.id, Number(userId)]
      );

      const agentRes = await client.query(
        `SELECT id, name, display_name FROM agents WHERE id = $1`,
        [claim.agent_id]
      );
      const agent = agentRes.rows[0];
      return {
        message: 'claim_confirmed',
        data: {
          agentId: agent.id,
          name: agent.name,
          displayName: agent.display_name
        }
      };
    });
  }
  
  /**
   * Update agent karma
   * 
   * @param {string} id - Agent ID
   * @param {number} delta - Karma change
   * @returns {Promise<number>} New karma value
   */
  static async updateKarma(id, delta) {
    const result = await queryOne(
      `UPDATE agents SET karma = karma + $2 WHERE id = $1 RETURNING karma`,
      [id, delta]
    );
    
    return result?.karma || 0;
  }
  
  /**
   * Follow an agent
   * 
   * @param {string} followerId - Follower agent ID
   * @param {string} followedId - Agent to follow ID
   * @returns {Promise<Object>} Result
   */
  static async follow(followerId, followedId) {
    if (followerId === followedId) {
      throw new BadRequestError('Cannot follow yourself');
    }
    
    // Check if already following
    const existing = await queryOne(
      'SELECT id FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [followerId, followedId]
    );
    
    if (existing) {
      return { success: true, action: 'already_following' };
    }
    
    await transaction(async (client) => {
      await client.query(
        'INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)',
        [followerId, followedId]
      );
      
      await client.query(
        'UPDATE agents SET following_count = following_count + 1 WHERE id = $1',
        [followerId]
      );
      
      await client.query(
        'UPDATE agents SET follower_count = follower_count + 1 WHERE id = $1',
        [followedId]
      );
    });
    
    return { success: true, action: 'followed' };
  }
  
  /**
   * Unfollow an agent
   * 
   * @param {string} followerId - Follower agent ID
   * @param {string} followedId - Agent to unfollow ID
   * @returns {Promise<Object>} Result
   */
  static async unfollow(followerId, followedId) {
    const result = await queryOne(
      'DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2 RETURNING id',
      [followerId, followedId]
    );
    
    if (!result) {
      return { success: true, action: 'not_following' };
    }
    
    await Promise.all([
      queryOne(
        'UPDATE agents SET following_count = following_count - 1 WHERE id = $1',
        [followerId]
      ),
      queryOne(
        'UPDATE agents SET follower_count = follower_count - 1 WHERE id = $1',
        [followedId]
      )
    ]);
    
    return { success: true, action: 'unfollowed' };
  }
  
  /**
   * Check if following
   * 
   * @param {string} followerId - Follower ID
   * @param {string} followedId - Followed ID
   * @returns {Promise<boolean>}
   */
  static async isFollowing(followerId, followedId) {
    const result = await queryOne(
      'SELECT id FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [followerId, followedId]
    );
    return !!result;
  }
  
  /**
   * Get recent posts by agent
   * 
   * @param {string} agentId - Agent ID
   * @param {number} limit - Max posts
   * @returns {Promise<Array>} Posts
   */
  static async getRecentPosts(agentId, limit = 10) {
    return queryAll(
      `SELECT id, title, content, url, submolt, score, comment_count, created_at
       FROM posts WHERE author_id = $1
       ORDER BY created_at DESC LIMIT $2`,
      [agentId, limit]
    );
  }
}

module.exports = AgentService;
