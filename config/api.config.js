/**
 * MaxiMax Mobile Advertising - API Configuration
 * @version 3.0.0
 * @description Central configuration for all API endpoints and services
 */

export const API_CONFIG = {
  // Base URLs
  baseUrl: process.env.API_BASE_URL || 'https://api.maximax-advertising.com',
  cdnUrl: process.env.CDN_URL || 'https://cdn.maximax-advertising.com',

  // API Keys (Replace with environment variables in production)
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN || 'pk.test.maximax',
    style: 'mapbox://styles/mapbox/dark-v11'
  },

  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    region: 'US',
    language: 'en'
  },

  // Analytics Configuration
  analytics: {
    googleAnalytics: process.env.GA_TRACKING_ID || 'UA-XXXXXXX',
    mixpanel: process.env.MIXPANEL_TOKEN || '',
    segment: process.env.SEGMENT_WRITE_KEY || ''
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,

    // Tiered limits
    tiers: {
      anonymous: { max: 50, windowMs: 15 * 60 * 1000 },
      authenticated: { max: 200, windowMs: 15 * 60 * 1000 },
      premium: { max: 1000, windowMs: 15 * 60 * 1000 },
      admin: { max: -1, windowMs: 15 * 60 * 1000 } // Unlimited
    }
  },

  // Security Headers
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['https://maximax-advertising.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      maxAge: 86400 // 24 hours
    },

    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ['\'self\''],
          scriptSrc: ['\'self\'', '\'unsafe-inline\'', 'https://api.mapbox.com'],
          styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://api.mapbox.com'],
          imgSrc: ['\'self\'', 'data:', 'https:', 'blob:'],
          connectSrc: ['\'self\'', 'https://api.mapbox.com', 'https://maps.googleapis.com'],
          fontSrc: ['\'self\'', 'https:', 'data:'],
          objectSrc: ['\'none\''],
          mediaSrc: ['\'self\''],
          frameSrc: ['\'self\'', 'https://www.google.com']
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  },

  // Cache Configuration
  cache: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: process.env.REDIS_DB || 0,
      ttl: {
        default: 300, // 5 minutes
        fleetData: 30, // 30 seconds for real-time fleet data
        routes: 3600, // 1 hour for route calculations
        quotes: 1800, // 30 minutes for quotes
        static: 86400 // 24 hours for static content
      }
    },

    memory: {
      max: 500, // Maximum number of items
      maxAge: 1000 * 60 * 5, // 5 minutes
      stale: false,
      updateAgeOnGet: true
    }
  },

  // Fleet Configuration
  fleet: {
    updateInterval: 5000, // 5 seconds
    historyRetention: 24 * 60 * 60 * 1000, // 24 hours
    maxTrucksPerPage: 50,
    geofenceRadius: 100, // meters
    speedThreshold: {
      min: 5, // mph
      max: 65 // mph
    }
  },

  // Pricing Configuration
  pricing: {
    currency: 'USD',
    baseRates: {
      hourly: 150,
      daily: 1200,
      weekly: 5600,
      monthly: 18000
    },

    surcharges: {
      peakHours: 1.5, // 50% surcharge during peak hours
      weekend: 1.25, // 25% surcharge on weekends
      holiday: 2.0, // 100% surcharge on holidays
      rush: 1.75 // 75% surcharge for rush orders
    },

    discounts: {
      volume: {
        3: 0.05, // 5% discount for 3+ trucks
        5: 0.10, // 10% discount for 5+ trucks
        10: 0.15 // 15% discount for 10+ trucks
      },
      longTerm: {
        7: 0.05, // 5% discount for 7+ days
        14: 0.10, // 10% discount for 14+ days
        30: 0.15 // 15% discount for 30+ days
      }
    }
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    },

    from: {
      default: 'info@maximax-advertising.com',
      quotes: 'quotes@maximax-advertising.com',
      support: 'support@maximax-advertising.com',
      noreply: 'noreply@maximax-advertising.com'
    },

    templates: {
      quoteRequest: 'quote-request',
      quoteConfirmation: 'quote-confirmation',
      campaignStart: 'campaign-start',
      campaignEnd: 'campaign-end',
      invoice: 'invoice'
    }
  },

  // Payment Gateway Configuration
  payment: {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      currency: 'usd',
      paymentMethods: ['card', 'bank_transfer', 'ach_debit']
    },

    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      mode: process.env.PAYPAL_MODE || 'sandbox'
    }
  },

  // Webhooks Configuration
  webhooks: {
    maxRetries: 3,
    retryDelay: [1000, 5000, 15000], // Exponential backoff in ms
    timeout: 10000, // 10 seconds
    signatureHeader: 'X-MaxiMax-Signature',
    events: [
      'fleet.location.updated',
      'campaign.started',
      'campaign.completed',
      'quote.created',
      'quote.accepted',
      'payment.received',
      'truck.maintenance',
      'route.optimized'
    ]
  },

  // API Versioning
  versions: {
    current: 'v3',
    supported: ['v1', 'v2', 'v3'],
    deprecated: ['v1'],
    sunset: {
      v1: new Date('2024-12-31')
    }
  },

  // Feature Flags
  features: {
    realTimeTracking: true,
    advancedAnalytics: true,
    aiRoutePlanning: true,
    dynamicPricing: true,
    webhooks: true,
    threeD: true,
    ar: false, // Coming soon
    instantQuotes: true,
    selfService: true
  },

  // Error Messages
  errors: {
    INVALID_API_KEY: { code: 'AUTH001', message: 'Invalid API key' },
    RATE_LIMIT_EXCEEDED: { code: 'RATE001', message: 'Rate limit exceeded' },
    INVALID_REQUEST: { code: 'REQ001', message: 'Invalid request parameters' },
    RESOURCE_NOT_FOUND: { code: 'RES001', message: 'Resource not found' },
    SERVER_ERROR: { code: 'SRV001', message: 'Internal server error' },
    PAYMENT_FAILED: { code: 'PAY001', message: 'Payment processing failed' },
    QUOTA_EXCEEDED: { code: 'QUOTA001', message: 'API quota exceeded' }
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  API_CONFIG.rateLimit.max = 1000;
  API_CONFIG.security.cors.origin = ['http://localhost:3000', 'http://127.0.0.1:3000'];
}

export default API_CONFIG;