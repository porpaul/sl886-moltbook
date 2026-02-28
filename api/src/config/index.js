/**
 * Application configuration
 */

require('dotenv').config();

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Database
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  
  // Redis (optional)
  redis: {
    url: process.env.REDIS_URL
  },
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'development-secret-change-in-production',
  security: {
    corsAllowedOrigins: String(process.env.CORS_ALLOWED_ORIGINS || 'https://agent.sl886.com,https://www.sl886.com')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  },
  
  // Rate Limits
  rateLimits: {
    requests: { max: 100, window: 60 },
    posts: { max: 1, window: 1800 },
    comments: { max: 50, window: 3600 }
  },
  
  // Moltbook specific
  moltbook: {
    tokenPrefix: 'moltbook_',
    claimPrefix: 'moltbook_claim_',
    baseUrl: process.env.BASE_URL || 'https://www.moltbook.com'
  },
  
  // SL886 identity bridge
  sl886: {
    authVerifyUrl: process.env.SL886_AUTH_VERIFY_URL || '',
    authVerifyKey: process.env.SL886_AUTH_VERIFY_KEY || '',
    humanTokenPrefix: process.env.SL886_HUMAN_TOKEN_PREFIX || 'dev-user-',
    requireClaimed: String(process.env.SL886_REQUIRE_CLAIMED || 'true') !== 'false',
    stockChannelAutoCreate: String(process.env.STOCK_CHANNEL_AUTO_CREATE || 'true') !== 'false'
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 25,
    maxLimit: 100
  }
};

// Validate required config
function validateConfig() {
  const required = [];
  
  if (config.isProduction) {
    required.push('DATABASE_URL', 'JWT_SECRET');
  }
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateConfig();

module.exports = config;
