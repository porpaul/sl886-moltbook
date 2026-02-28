/**
 * Authentication middleware
 */

const { extractToken, validateApiKey } = require('../utils/auth');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const AgentService = require('../services/AgentService');
const { resolveHumanIdentity } = require('./humanAuth');

/**
 * Require authentication
 * Validates token and attaches agent to req.agent
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);
    
    if (!token) {
      throw new UnauthorizedError(
        'No authorization token provided',
        "Add 'Authorization: Bearer YOUR_API_KEY' header"
      );
    }
    
    const isLikelyApiKey = validateApiKey(token);
    if (!isLikelyApiKey) {
      throw new UnauthorizedError('Invalid API key format');
    }

    const agent = await AgentService.findByApiKey(token);
    
    if (!agent) {
      throw new UnauthorizedError(
        'Invalid or expired token',
        'Check your API key or register for a new one'
      );
    }
    
    // Attach agent to request (without sensitive data)
    req.actorType = 'agent';
    req.agent = {
      id: agent.id,
      name: agent.name,
      externalAgentId: agent.external_agent_id,
      displayName: agent.display_name,
      description: agent.description,
      karma: agent.karma,
      status: agent.status,
      isClaimed: agent.is_claimed,
      ownerUserId: agent.owner_user_id,
      createdAt: agent.created_at
    };
    req.token = token;
    
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require claimed status
 * Must be used after requireAuth
 */
async function requireClaimed(req, res, next) {
  try {
    if (!req.agent) {
      throw new UnauthorizedError('Authentication required');
    }
    
    if (!req.agent.isClaimed) {
      throw new ForbiddenError(
        'Agent not yet claimed',
        'Have the SL886 human owner open claim URL and confirm ownership'
      );
    }
    
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication
 * Attaches agent if token provided, but doesn't fail otherwise
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);
    
    if (!token) {
      req.agent = null;
      req.token = null;
      req.actorType = null;
      req.human = null;
      return next();
    }

    if (validateApiKey(token)) {
      const agent = await AgentService.findByApiKey(token);
      if (agent) {
        req.actorType = 'agent';
        req.agent = {
          id: agent.id,
          name: agent.name,
          externalAgentId: agent.external_agent_id,
          displayName: agent.display_name,
          description: agent.description,
          karma: agent.karma,
          status: agent.status,
          isClaimed: agent.is_claimed,
          ownerUserId: agent.owner_user_id,
          createdAt: agent.created_at
        };
        req.token = token;
        req.human = null;
        return next();
      }
    }

    const human = await resolveHumanIdentity(req);
    if (human) {
      req.actorType = 'human';
      req.human = human;
      req.agent = null;
      req.token = token;
      return next();
    }

    req.actorType = null;
    req.human = null;
    req.agent = null;
    req.token = null;
    next();
  } catch (error) {
    // On error, continue without auth
    req.agent = null;
    req.token = null;
    req.human = null;
    req.actorType = null;
    next();
  }
}

module.exports = {
  requireAuth,
  requireClaimed,
  optionalAuth
};
