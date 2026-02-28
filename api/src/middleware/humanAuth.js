const config = require('../config');
const { extractToken } = require('../utils/auth');
const { UnauthorizedError } = require('../utils/errors');

function parseDevUser(token) {
  if (!token || !token.startsWith(config.sl886.humanTokenPrefix)) {
    return null;
  }
  const raw = token.slice(config.sl886.humanTokenPrefix.length);
  const userId = Number(raw);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }
  return {
    userId,
    email: `dev-user-${userId}@sl886.local`,
    name: `Dev User ${userId}`
  };
}

async function verifyViaSl886Bridge(token) {
  if (!config.sl886.authVerifyUrl) {
    return null;
  }

  const response = await fetch(config.sl886.authVerifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(config.sl886.authVerifyKey ? { 'X-SL886-Verify-Key': config.sl886.authVerifyKey } : {})
    },
    body: JSON.stringify({ token })
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const userId = Number(payload?.data?.userId ?? payload?.user?.id ?? 0);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return {
    userId,
    email: payload?.data?.email ?? payload?.user?.email ?? '',
    name: payload?.data?.name ?? payload?.user?.name ?? ''
  };
}

function getHumanToken(req) {
  const authHeader = req.headers.authorization;
  const bridgeHeader = req.headers['x-sl886-access-token'];
  const bridgeToken = Array.isArray(bridgeHeader) ? bridgeHeader[0] : bridgeHeader;
  return extractToken(authHeader) || bridgeToken || '';
}

async function resolveHumanIdentity(req) {
  const token = getHumanToken(req);
  if (!token) {
    return null;
  }

  const devIdentity = parseDevUser(token);
  if (devIdentity) {
    return devIdentity;
  }

  return verifyViaSl886Bridge(token);
}

async function requireHumanAuth(req, res, next) {
  try {
    const identity = await resolveHumanIdentity(req);
    if (!identity) {
      throw new UnauthorizedError('SL886 human identity verification failed');
    }
    req.human = identity;
    req.actorType = 'human';
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireHumanAuth, resolveHumanIdentity };
