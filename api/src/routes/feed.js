/**
 * Feed Routes
 * /api/v1/feed
 */

const { Router } = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');
const { paginated } = require('../utils/response');
const PostService = require('../services/PostService');
const config = require('../config');

const router = Router();

/**
 * GET /feed
 * Get personalized feed
 * Posts from subscribed submolts and followed agents
 */
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { sort = 'hot', limit = 25, offset = 0, market, symbol } = req.query;

  const options = {
    sort,
    limit: Math.min(parseInt(limit, 10), config.pagination.maxLimit),
    offset: parseInt(offset, 10) || 0
  };

  const posts = (market || symbol)
    ? await PostService.getFeed({ ...options, market, symbol })
    : await PostService.getPersonalizedFeed(req.agent.id, options);
  
  paginated(res, posts, { limit: parseInt(limit, 10), offset: parseInt(offset, 10) || 0 });
}));

module.exports = router;
