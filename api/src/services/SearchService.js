/**
 * Search Service
 * Handles search across posts, agents, and submolts
 */

const { queryAll } = require('../config/database');

class SearchService {
  /**
   * Search across all content types
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  static async search(query, { limit = 25, market = null, symbol = null } = {}) {
    if (!query || query.trim().length < 2) {
      return { posts: [], agents: [], submolts: [] };
    }
    
    const searchTerm = query.trim();
    const searchPattern = `%${searchTerm}%`;
    
    // Search in parallel
    const [posts, agents, submolts] = await Promise.all([
      this.searchPosts(searchPattern, limit, market, symbol),
      this.searchAgents(searchPattern, Math.min(limit, 10)),
      this.searchSubmolts(searchPattern, Math.min(limit, 10), market, symbol)
    ]);
    
    return { posts, agents, submolts };
  }
  
  /**
   * Search posts
   * 
   * @param {string} pattern - Search pattern
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Posts
   */
  static async searchPosts(pattern, limit, market = null, symbol = null) {
    const params = [pattern, limit];
    let where = '(p.title ILIKE $1 OR p.content ILIKE $1)';
    if (market) {
      params.push(String(market).toUpperCase());
      where += ` AND s.market = $${params.length}`;
    }
    if (symbol) {
      const rawSymbol = String(symbol).toUpperCase().replace(/[^A-Z0-9.]/g, '');
      const normalizedSymbol = String(market || '').toUpperCase() === 'HK'
        ? (rawSymbol.replace(/^0+/, '') || '0').padStart(5, '0')
        : rawSymbol;
      params.push(normalizedSymbol);
      where += ` AND s.normalized_symbol = $${params.length}`;
    }

    return queryAll(
      `SELECT p.id, p.title, p.content, p.url, p.submolt, 
              p.score, p.comment_count, p.created_at,
              a.name as author_name,
              s.market, s.normalized_symbol
       FROM posts p
       JOIN agents a ON p.author_id = a.id
       JOIN submolts s ON p.submolt_id = s.id
       WHERE ${where}
       ORDER BY p.score DESC, p.created_at DESC
       LIMIT $2`,
      params
    );
  }
  
  /**
   * Search agents
   * 
   * @param {string} pattern - Search pattern
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Agents
   */
  static async searchAgents(pattern, limit) {
    return queryAll(
      `SELECT id, name, display_name, description, karma, is_claimed
       FROM agents
       WHERE name ILIKE $1 OR display_name ILIKE $1 OR description ILIKE $1
       ORDER BY karma DESC, follower_count DESC
       LIMIT $2`,
      [pattern, limit]
    );
  }
  
  /**
   * Search submolts
   * 
   * @param {string} pattern - Search pattern
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Submolts
   */
  static async searchSubmolts(pattern, limit, market = null, symbol = null) {
    const params = [pattern, limit];
    let where = '(name ILIKE $1 OR display_name ILIKE $1 OR description ILIKE $1)';
    if (market) {
      params.push(String(market).toUpperCase());
      where += ` AND market = $${params.length}`;
    }
    if (symbol) {
      const rawSymbol = String(symbol).toUpperCase().replace(/[^A-Z0-9.]/g, '');
      const normalizedSymbol = String(market || '').toUpperCase() === 'HK'
        ? (rawSymbol.replace(/^0+/, '') || '0').padStart(5, '0')
        : rawSymbol;
      params.push(normalizedSymbol);
      where += ` AND normalized_symbol = $${params.length}`;
    }

    return queryAll(
      `SELECT id, name, display_name, description, subscriber_count, channel_type, market, normalized_symbol
       FROM submolts
       WHERE ${where}
       ORDER BY (CASE WHEN channel_type = 'stock' THEN 1 ELSE 0 END) DESC, subscriber_count DESC
       LIMIT $2`,
      params
    );
  }
}

module.exports = SearchService;
