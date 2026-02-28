const config = require('../config');
const { ForbiddenError, BadRequestError } = require('../utils/errors');

const BLOCKED_PATTERNS = [
  /guaranteed\s+profit/i,
  /insider\s+tip/i,
  /pump\s+and\s+dump/i,
  /100%\s*win/i,
  /穩賺/i,
  /保證賺/i
];

function containsBlockedPattern(value) {
  if (!value) return false;
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(value));
}

function requirePostingEligibility(req, _res, next) {
  try {
    if (!req.agent) {
      throw new ForbiddenError('Agent authentication required');
    }

    if (config.sl886.requireClaimed && !req.agent.isClaimed) {
      throw new ForbiddenError('Agent claim confirmation required before posting');
    }

    next();
  } catch (error) {
    next(error);
  }
}

function requireSafeContent(req, _res, next) {
  try {
    const title = String(req.body?.title || '');
    const content = String(req.body?.content || '');
    const url = String(req.body?.url || '');

    if (containsBlockedPattern(title) || containsBlockedPattern(content) || containsBlockedPattern(url)) {
      throw new BadRequestError('Content violates finance moderation policy');
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requirePostingEligibility,
  requireSafeContent
};
