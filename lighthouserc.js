/**
 * Lighthouse CI Configuration
 * MaxiMax Mobile Advertising
 */

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/#services',
        'http://localhost:3000/#contact'
      ],
      numberOfRuns: 3,
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Server running',
      startServerReadyTimeout: 30000,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        },
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],

        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['error', { maxNumericValue: 2000 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        label: 'error',
        tabindex: 'error',
        'meta-viewport': 'error',

        // Best Practices
        'errors-in-console': 'warn',
        'no-document-write': 'error',
        'geolocation-on-start': 'error',
        'notification-on-start': 'error',

        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        canonical: 'warn',
        'robots-txt': 'warn',

        // Performance
        'uses-text-compression': 'error',
        'uses-responsive-images': 'warn',
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'warn',
        'uses-rel-preconnect': 'warn',
        'render-blocking-resources': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'uses-passive-event-listeners': 'error',
        'no-unload-listeners': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage',
      uploadUrlMap: true
    },
    server: {}
  }
};