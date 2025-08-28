/**
 * MaxiMax Mobile Advertising - API Middleware
 * @version 3.0.0
 * @description Rate limiting, security, authentication, and error handling middleware
 */

import API_CONFIG from '../config/api.config.js';

/**
 * Rate Limiter Class
 */
export class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || API_CONFIG.rateLimit.windowMs;
    this.max = options.max || API_CONFIG.rateLimit.max;
    this.message = options.message || API_CONFIG.rateLimit.message;
    this.clients = new Map();
    this.tiers = API_CONFIG.rateLimit.tiers;

    // Cleanup expired entries periodically
    setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
     * Check rate limit for client
     */
  async checkLimit(clientId, tier = 'anonymous') {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get client's request history
    let clientData = this.clients.get(clientId);

    if (!clientData) {
      clientData = {
        requests: [],
        tier: tier
      };
      this.clients.set(clientId, clientData);
    }

    // Filter out expired requests
    clientData.requests = clientData.requests.filter(timestamp => timestamp > windowStart);

    // Get limit for tier
    const limit = this.tiers[tier]?.max || this.max;

    // Check if limit exceeded
    if (limit !== -1 && clientData.requests.length >= limit) {
      return {
        allowed: false,
        limit: limit,
        remaining: 0,
        reset: new Date(windowStart + this.windowMs).toISOString(),
        retryAfter: Math.ceil((windowStart + this.windowMs - now) / 1000)
      };
    }

    // Add current request
    clientData.requests.push(now);

    return {
      allowed: true,
      limit: limit,
      remaining: limit === -1 ? -1 : Math.max(0, limit - clientData.requests.length),
      reset: new Date(windowStart + this.windowMs).toISOString()
    };
  }

  /**
     * Reset limit for client
     */
  reset(clientId) {
    this.clients.delete(clientId);
  }

  /**
     * Cleanup expired entries
     */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [clientId, data] of this.clients.entries()) {
      data.requests = data.requests.filter(timestamp => timestamp > windowStart);

      if (data.requests.length === 0) {
        this.clients.delete(clientId);
      }
    }
  }

  /**
     * Get client statistics
     */
  getStats(clientId) {
    const clientData = this.clients.get(clientId);
    if (!clientData) {
      return null;
    }

    const now = Date.now();
    const windowStart = now - this.windowMs;
    const recentRequests = clientData.requests.filter(t => t > windowStart);

    return {
      totalRequests: recentRequests.length,
      tier: clientData.tier,
      oldestRequest: recentRequests[0] ? new Date(recentRequests[0]).toISOString() : null,
      newestRequest: recentRequests[recentRequests.length - 1] ?
        new Date(recentRequests[recentRequests.length - 1]).toISOString() : null
    };
  }
}

/**
 * Authentication Manager
 */
export class AuthManager {
  constructor() {
    this.apiKeys = new Map();
    this.sessions = new Map();
    this.tokens = new Map();

    // Initialize with demo API keys
    this.initializeDemoKeys();
  }

  /**
     * Initialize demo API keys
     */
  initializeDemoKeys() {
    // Demo keys for testing
    this.apiKeys.set('demo-key-001', {
      id: 'demo-001',
      name: 'Demo Client',
      tier: 'authenticated',
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString()
    });

    this.apiKeys.set('premium-key-001', {
      id: 'premium-001',
      name: 'Premium Client',
      tier: 'premium',
      permissions: ['read', 'write', 'admin'],
      createdAt: new Date().toISOString()
    });
  }

  /**
     * Validate API key
     */
  validateApiKey(apiKey) {
    const keyData = this.apiKeys.get(apiKey);

    if (!keyData) {
      return {
        valid: false,
        error: API_CONFIG.errors.INVALID_API_KEY
      };
    }

    return {
      valid: true,
      data: keyData
    };
  }

  /**
     * Generate session token
     */
  generateToken(userId, expiresIn = 3600000) { // 1 hour default
    const token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + expiresIn;

    this.tokens.set(token, {
      userId,
      createdAt: Date.now(),
      expiresAt,
      lastUsed: Date.now()
    });

    // Auto-cleanup expired token
    setTimeout(() => this.tokens.delete(token), expiresIn);

    return {
      token,
      expiresAt: new Date(expiresAt).toISOString()
    };
  }

  /**
     * Validate session token
     */
  validateToken(token) {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      return {
        valid: false,
        error: 'Invalid or expired token'
      };
    }

    if (Date.now() > tokenData.expiresAt) {
      this.tokens.delete(token);
      return {
        valid: false,
        error: 'Token expired'
      };
    }

    // Update last used
    tokenData.lastUsed = Date.now();

    return {
      valid: true,
      data: tokenData
    };
  }

  /**
     * Revoke token
     */
  revokeToken(token) {
    return this.tokens.delete(token);
  }

  /**
     * Create session
     */
  createSession(userId, metadata = {}) {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.sessions.set(sessionId, {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      metadata
    });

    return sessionId;
  }

  /**
     * Get session
     */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);

    if (session) {
      // Update last activity
      session.lastActivity = Date.now();
    }

    return session;
  }

  /**
     * Destroy session
     */
  destroySession(sessionId) {
    return this.sessions.delete(sessionId);
  }
}

/**
 * Security Middleware
 */
export class SecurityMiddleware {
  constructor() {
    this.blockedIPs = new Set();
    this.suspiciousActivity = new Map();
    this.securityHeaders = API_CONFIG.security.helmet;
  }

  /**
     * Apply security headers
     */
  applySecurityHeaders(response) {
    const headers = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': `max-age=${this.securityHeaders.hsts.maxAge}; includeSubDomains; preload`,
      'Content-Security-Policy': this.buildCSP(),
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
      'X-Powered-By': 'MaxiMax Secure API'
    };

    Object.entries(headers).forEach(([key, value]) => {
      response.setHeader(key, value);
    });

    return response;
  }

  /**
     * Build Content Security Policy
     */
  buildCSP() {
    const directives = this.securityHeaders.contentSecurityPolicy.directives;
    const csp = [];

    for (const [directive, sources] of Object.entries(directives)) {
      const directiveName = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      csp.push(`${directiveName} ${sources.join(' ')}`);
    }

    return csp.join('; ');
  }

  /**
     * Check for suspicious activity
     */
  checkSuspiciousActivity(clientId, request) {
    const activity = this.suspiciousActivity.get(clientId) || {
      failedAttempts: 0,
      suspiciousPatterns: [],
      lastCheck: Date.now()
    };

    // Check for SQL injection patterns
    const sqlPatterns = /(\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|--|;|\*|\'|\")/gi;
    if (sqlPatterns.test(JSON.stringify(request))) {
      activity.suspiciousPatterns.push({
        type: 'sql_injection',
        timestamp: Date.now()
      });
    }

    // Check for XSS patterns
    const xssPatterns = /<script|<iframe|javascript:|onerror=|onclick=/gi;
    if (xssPatterns.test(JSON.stringify(request))) {
      activity.suspiciousPatterns.push({
        type: 'xss_attempt',
        timestamp: Date.now()
      });
    }

    // Check for path traversal
    const pathPatterns = /\.\.[\/\\]|\.\.%2F|\.\.%5C/gi;
    if (pathPatterns.test(JSON.stringify(request))) {
      activity.suspiciousPatterns.push({
        type: 'path_traversal',
        timestamp: Date.now()
      });
    }

    // Update activity
    this.suspiciousActivity.set(clientId, activity);

    // Block if too many suspicious patterns
    if (activity.suspiciousPatterns.length > 5) {
      this.blockIP(clientId);
      return {
        suspicious: true,
        blocked: true,
        reason: 'Multiple security violations detected'
      };
    }

    return {
      suspicious: activity.suspiciousPatterns.length > 0,
      blocked: false,
      patterns: activity.suspiciousPatterns
    };
  }

  /**
     * Block IP address
     */
  blockIP(ip, duration = 3600000) { // 1 hour default
    this.blockedIPs.add(ip);

    // Auto-unblock after duration
    setTimeout(() => this.unblockIP(ip), duration);

    return true;
  }

  /**
     * Unblock IP address
     */
  unblockIP(ip) {
    return this.blockedIPs.delete(ip);
  }

  /**
     * Check if IP is blocked
     */
  isBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  /**
     * Sanitize input
     */
  sanitizeInput(input) {
    if (typeof input === 'string') {
      // Remove HTML tags
      input = input.replace(/<[^>]*>/g, '');

      // Escape special characters
      input = input.replace(/[&<>"']/g, char => {
        const escapes = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          '\'': '&#39;'
        };
        return escapes[char];
      });
    } else if (typeof input === 'object' && input !== null) {
      // Recursively sanitize object
      for (const key in input) {
        input[key] = this.sanitizeInput(input[key]);
      }
    }

    return input;
  }
}

/**
 * CORS Manager
 */
export class CORSManager {
  constructor(options = {}) {
    this.config = { ...API_CONFIG.security.cors, ...options };
  }

  /**
     * Apply CORS headers
     */
  applyCORS(request, response) {
    const origin = request.headers.origin;

    // Check if origin is allowed
    if (this.isOriginAllowed(origin)) {
      response.setHeader('Access-Control-Allow-Origin', origin);
    } else if (this.config.origin === '*') {
      response.setHeader('Access-Control-Allow-Origin', '*');
    }

    // Apply other CORS headers
    if (this.config.credentials) {
      response.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    response.setHeader('Access-Control-Allow-Methods', this.config.methods.join(', '));
    response.setHeader('Access-Control-Allow-Headers', this.config.allowedHeaders.join(', '));
    response.setHeader('Access-Control-Expose-Headers', this.config.exposedHeaders.join(', '));
    response.setHeader('Access-Control-Max-Age', this.config.maxAge.toString());

    return response;
  }

  /**
     * Check if origin is allowed
     */
  isOriginAllowed(origin) {
    if (!origin) {
      return false;
    }

    if (Array.isArray(this.config.origin)) {
      return this.config.origin.includes(origin);
    }

    if (typeof this.config.origin === 'string') {
      return this.config.origin === origin;
    }

    if (this.config.origin instanceof RegExp) {
      return this.config.origin.test(origin);
    }

    return false;
  }

  /**
     * Handle preflight request
     */
  handlePreflight(request, response) {
    this.applyCORS(request, response);
    response.status = 204;
    return response;
  }
}

/**
 * Error Handler
 */
export class ErrorHandler {
  /**
     * Handle API error
     */
  static handleError(error, context = {}) {
    const errorResponse = {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }
    };

    // Add context in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error.stack = error.stack;
      errorResponse.error.context = context;
    }

    // Log error
    console.error('API Error:', {
      ...errorResponse.error,
      context
    });

    // Determine HTTP status code
    let statusCode = 500;

    switch (error.code) {
      case 'AUTH001':
      case 'AUTH002':
        statusCode = 401;
        break;
      case 'RATE001':
        statusCode = 429;
        break;
      case 'REQ001':
        statusCode = 400;
        break;
      case 'RES001':
        statusCode = 404;
        break;
      case 'QUOTA001':
        statusCode = 402;
        break;
      default:
        statusCode = 500;
    }

    return {
      statusCode,
      body: errorResponse
    };
  }

  /**
     * Create error response
     */
  static createErrorResponse(code, message, statusCode = 500) {
    return {
      statusCode,
      body: {
        success: false,
        error: {
          code,
          message,
          timestamp: new Date().toISOString()
        }
      }
    };
  }
}

/**
 * Request Logger
 */
export class RequestLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 10000;
  }

  /**
     * Log request
     */
  logRequest(request, response, duration) {
    const log = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.path,
      query: request.query,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      statusCode: response.statusCode,
      duration: duration,
      size: response.size
    };

    this.logs.push(log);

    // Trim logs if too many
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${log.timestamp}] ${log.method} ${log.path} - ${log.statusCode} (${log.duration}ms)`);
    }

    return log;
  }

  /**
     * Get logs
     */
  getLogs(filters = {}) {
    let filtered = [...this.logs];

    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    if (filters.statusCode) {
      filtered = filtered.filter(log => log.statusCode === filters.statusCode);
    }

    if (filters.method) {
      filtered = filtered.filter(log => log.method === filters.method);
    }

    if (filters.path) {
      filtered = filtered.filter(log => log.path.includes(filters.path));
    }

    return filtered;
  }

  /**
     * Get statistics
     */
  getStats() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    const recentLogs = this.logs.filter(log => new Date(log.timestamp).getTime() > oneHourAgo);
    const dailyLogs = this.logs.filter(log => new Date(log.timestamp).getTime() > oneDayAgo);

    const statusCodes = {};
    const methods = {};
    let totalDuration = 0;

    recentLogs.forEach(log => {
      statusCodes[log.statusCode] = (statusCodes[log.statusCode] || 0) + 1;
      methods[log.method] = (methods[log.method] || 0) + 1;
      totalDuration += log.duration;
    });

    return {
      totalRequests: this.logs.length,
      requestsLastHour: recentLogs.length,
      requestsLastDay: dailyLogs.length,
      averageResponseTime: recentLogs.length > 0 ? totalDuration / recentLogs.length : 0,
      statusCodes,
      methods
    };
  }
}

/**
 * Middleware Chain Manager
 */
export class MiddlewareChain {
  constructor() {
    this.rateLimiter = new RateLimiter();
    this.authManager = new AuthManager();
    this.security = new SecurityMiddleware();
    this.cors = new CORSManager();
    this.logger = new RequestLogger();
  }

  /**
     * Process request through middleware chain
     */
  async processRequest(request) {
    const startTime = Date.now();
    const clientId = this.getClientId(request);

    try {
      // 1. Check if IP is blocked
      if (this.security.isBlocked(clientId)) {
        return ErrorHandler.createErrorResponse(
          'BLOCKED',
          'Your IP has been blocked due to suspicious activity',
          403
        );
      }

      // 2. Check for suspicious activity
      const suspiciousCheck = this.security.checkSuspiciousActivity(clientId, request);
      if (suspiciousCheck.blocked) {
        return ErrorHandler.createErrorResponse(
          'SECURITY_VIOLATION',
          suspiciousCheck.reason,
          403
        );
      }

      // 3. Validate API key if provided
      let tier = 'anonymous';
      const apiKey = request.headers['x-api-key'];

      if (apiKey) {
        const validation = this.authManager.validateApiKey(apiKey);
        if (!validation.valid) {
          return ErrorHandler.createErrorResponse(
            validation.error.code,
            validation.error.message,
            401
          );
        }
        tier = validation.data.tier;
      }

      // 4. Check rate limit
      const rateCheck = await this.rateLimiter.checkLimit(clientId, tier);
      if (!rateCheck.allowed) {
        const response = ErrorHandler.createErrorResponse(
          API_CONFIG.errors.RATE_LIMIT_EXCEEDED.code,
          API_CONFIG.errors.RATE_LIMIT_EXCEEDED.message,
          429
        );

        // Add rate limit headers
        response.headers = {
          'X-RateLimit-Limit': rateCheck.limit,
          'X-RateLimit-Remaining': rateCheck.remaining,
          'X-RateLimit-Reset': rateCheck.reset,
          'Retry-After': rateCheck.retryAfter
        };

        return response;
      }

      // 5. Sanitize input
      if (request.body) {
        request.body = this.security.sanitizeInput(request.body);
      }
      if (request.query) {
        request.query = this.security.sanitizeInput(request.query);
      }

      // Request is valid and can proceed
      return {
        success: true,
        clientId,
        tier,
        rateLimit: rateCheck
      };
    } finally {
      // Log request
      const duration = Date.now() - startTime;
      this.logger.logRequest(request, { statusCode: 200 }, duration);
    }
  }

  /**
     * Get client ID from request
     */
  getClientId(request) {
    // Try to get from various sources
    return request.headers['x-client-id'] ||
               request.headers['x-forwarded-for'] ||
               request.ip ||
               'unknown';
  }
}

// Export singleton instances
export const middleware = new MiddlewareChain();

export default {
  RateLimiter,
  AuthManager,
  SecurityMiddleware,
  CORSManager,
  ErrorHandler,
  RequestLogger,
  MiddlewareChain,
  middleware
};