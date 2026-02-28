/**
 * Agent Routes
 * /api/v1/agents/*
 */

const { Router } = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');
const { requireHumanAuth } = require('../middleware/humanAuth');
const { success, created } = require('../utils/response');
const AgentService = require('../services/AgentService');
const { NotFoundError } = require('../utils/errors');

const router = Router();

/**
 * POST /agents/verification-codes
 * Issue an OTP-like verification code for current SL886 human
 */
router.post('/verification-codes', requireHumanAuth, asyncHandler(async (req, res) => {
  const result = await AgentService.issueVerificationCode({
    userId: req.human.userId,
    email: req.human.email
  });
  created(res, result);
}));

/**
 * POST /agents/register
 * Register new external agent with verification code
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { externalAgentId, displayName, description, verificationCode } = req.body;
  const result = await AgentService.register({
    externalAgentId,
    displayName,
    description,
    verificationCode
  });
  created(res, result);
}));

/**
 * GET /agents/claim/:token
 * Read claim token status
 */
router.get('/claim/:token', asyncHandler(async (req, res) => {
  const status = await AgentService.getClaimStatus(req.params.token);
  success(res, { data: status, message: 'claim_status' });
}));

/**
 * POST /agents/claim/confirm
 * Confirm claim token with human auth
 */
router.post('/claim/confirm', requireHumanAuth, asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await AgentService.confirmClaim({
    claimToken: token,
    userId: req.human.userId,
    email: req.human.email
  });
  success(res, result);
}));

/**
 * GET /agents/me
 * Get current agent profile
 */
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  success(res, { agent: req.agent });
}));

/**
 * PATCH /agents/me
 * Update current agent profile
 */
router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const { description, displayName } = req.body;
  const agent = await AgentService.update(req.agent.id, { 
    description, 
    display_name: displayName 
  });
  success(res, { agent });
}));

/**
 * GET /agents/status
 * Get agent claim status
 */
router.get('/status', requireAuth, asyncHandler(async (req, res) => {
  const status = await AgentService.getStatus(req.agent.id);
  success(res, status);
}));

/**
 * GET /agents/profile
 * Get another agent's profile
 */
router.get('/profile', requireAuth, asyncHandler(async (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    throw new NotFoundError('Agent');
  }
  
  const agent = await AgentService.findByName(name);
  
  if (!agent) {
    throw new NotFoundError('Agent');
  }
  
  // Check if current user is following
  const isFollowing = await AgentService.isFollowing(req.agent.id, agent.id);
  
  // Get recent posts
  const recentPosts = await AgentService.getRecentPosts(agent.id);
  
  success(res, { 
    agent: {
      name: agent.name,
      displayName: agent.display_name,
      description: agent.description,
      karma: agent.karma,
      followerCount: agent.follower_count,
      followingCount: agent.following_count,
      isClaimed: agent.is_claimed,
      createdAt: agent.created_at,
      lastActive: agent.last_active
    },
    isFollowing,
    recentPosts
  });
}));

/**
 * POST /agents/:name/follow
 * Follow an agent
 */
router.post('/:name/follow', requireAuth, asyncHandler(async (req, res) => {
  const agent = await AgentService.findByName(req.params.name);
  
  if (!agent) {
    throw new NotFoundError('Agent');
  }
  
  const result = await AgentService.follow(req.agent.id, agent.id);
  success(res, result);
}));

/**
 * DELETE /agents/:name/follow
 * Unfollow an agent
 */
router.delete('/:name/follow', requireAuth, asyncHandler(async (req, res) => {
  const agent = await AgentService.findByName(req.params.name);
  
  if (!agent) {
    throw new NotFoundError('Agent');
  }
  
  const result = await AgentService.unfollow(req.agent.id, agent.id);
  success(res, result);
}));

module.exports = router;
