/**
 * MaxiMax Mobile Advertising - Analytics API
 * @version 3.0.0
 * @description Comprehensive analytics tracking and metrics API
 */

import API_CONFIG from '../config/api.config.js';

/**
 * Analytics API Class
 */
export class AnalyticsAPI {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.events = [];
    this.pageViews = [];
    this.campaignMetrics = new Map();
    this.initializeTracking();
  }

  /**
     * Initialize analytics tracking
     */
  initializeTracking() {
    if (typeof window === 'undefined') {
      return;
    }

    // Track page views
    this.trackPageView();

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { duration: this.getSessionDuration() });
      } else {
        this.trackEvent('page_visible');
      }
    });

    // Track scroll depth
    this.trackScrollDepth();

    // Track click events
    this.trackClicks();

    // Track form interactions
    this.trackFormInteractions();

    // Initialize third-party analytics if configured
    this.initializeThirdPartyAnalytics();

    // Start performance monitoring
    this.startPerformanceMonitoring();
  }

  /**
     * Generate unique session ID
     */
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
     * Get or create user ID
     */
  getUserId() {
    if (typeof window === 'undefined') {
      return null;
    }

    let userId = localStorage.getItem('maximax_user_id');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('maximax_user_id', userId);
    }
    return userId;
  }

  /**
     * Track page view
     */
  trackPageView(page = window.location.pathname) {
    const pageView = {
      sessionId: this.sessionId,
      userId: this.userId,
      page,
      title: document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth
      },
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    };

    this.pageViews.push(pageView);
    this.sendAnalytics('pageview', pageView);

    return pageView;
  }

  /**
     * Track custom event
     */
  trackEvent(eventName, properties = {}) {
    const event = {
      sessionId: this.sessionId,
      userId: this.userId,
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      context: {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        scrollY: window.scrollY,
        scrollX: window.scrollX
      }
    };

    this.events.push(event);
    this.sendAnalytics('event', event);

    return event;
  }

  /**
     * Track scroll depth
     */
  trackScrollDepth() {
    let maxScroll = 0;
    const scrollThresholds = [25, 50, 75, 90, 100];
    const triggeredThresholds = new Set();

    const handleScroll = () => {
      const scrollPercent = this.getScrollPercentage();

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        scrollThresholds.forEach(threshold => {
          if (scrollPercent >= threshold && !triggeredThresholds.has(threshold)) {
            triggeredThresholds.add(threshold);
            this.trackEvent('scroll_depth', {
              depth: threshold,
              page: window.location.pathname
            });
          }
        });
      }
    };

    // Throttle scroll tracking
    let scrollTimer;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScroll, 100);
    }, { passive: true });
  }

  /**
     * Get scroll percentage
     */
  getScrollPercentage() {
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );

    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const trackLength = documentHeight - viewportHeight;

    return Math.min(100, Math.round((scrollTop / trackLength) * 100));
  }

  /**
     * Track click events
     */
  trackClicks() {
    document.addEventListener('click', e => {
      const target = e.target.closest('a, button, [role="button"]');
      if (!target) {
        return;
      }

      const clickData = {
        element: target.tagName,
        text: target.textContent?.trim().substring(0, 50),
        href: target.href,
        id: target.id,
        classes: target.className,
        position: {
          x: e.pageX,
          y: e.pageY
        }
      };

      // Track CTA clicks specially
      if (target.classList.contains('cta-button') || target.classList.contains('primary-button')) {
        this.trackEvent('cta_click', clickData);
      } else {
        this.trackEvent('click', clickData);
      }
    });
  }

  /**
     * Track form interactions
     */
  trackFormInteractions() {
    // Track form starts
    document.addEventListener('focusin', e => {
      const form = e.target.closest('form');
      if (form && !form.dataset.trackingStarted) {
        form.dataset.trackingStarted = 'true';
        this.trackEvent('form_start', {
          formId: form.id,
          formName: form.name,
          fields: form.elements.length
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', e => {
      const form = e.target;
      const formData = new FormData(form);

      this.trackEvent('form_submit', {
        formId: form.id,
        formName: form.name,
        fields: Array.from(formData.keys())
      });
    });

    // Track form abandonment
    window.addEventListener('beforeunload', () => {
      const forms = document.querySelectorAll('form[data-tracking-started]');
      forms.forEach(form => {
        if (!form.dataset.submitted) {
          this.trackEvent('form_abandon', {
            formId: form.id,
            formName: form.name
          });
        }
      });
    });
  }

  /**
     * Track campaign metrics
     */
  trackCampaignMetrics(campaignId, metrics) {
    const existing = this.campaignMetrics.get(campaignId) || {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      cost: 0,
      roi: 0
    };

    const updated = {
      ...existing,
      ...metrics,
      lastUpdated: new Date().toISOString()
    };

    // Calculate ROI
    if (updated.revenue && updated.cost) {
      updated.roi = ((updated.revenue - updated.cost) / updated.cost) * 100;
    }

    // Calculate CTR
    if (updated.clicks && updated.impressions) {
      updated.ctr = (updated.clicks / updated.impressions) * 100;
    }

    // Calculate conversion rate
    if (updated.conversions && updated.clicks) {
      updated.conversionRate = (updated.conversions / updated.clicks) * 100;
    }

    this.campaignMetrics.set(campaignId, updated);
    this.sendAnalytics('campaign_metrics', { campaignId, metrics: updated });

    return updated;
  }

  /**
     * Get campaign performance
     */
  getCampaignPerformance(campaignId) {
    const metrics = this.campaignMetrics.get(campaignId);

    if (!metrics) {
      return {
        success: false,
        error: 'Campaign not found'
      };
    }

    return {
      success: true,
      data: {
        ...metrics,
        performance: this.calculatePerformanceScore(metrics)
      }
    };
  }

  /**
     * Calculate performance score
     */
  calculatePerformanceScore(metrics) {
    let score = 0;
    let factors = 0;

    // CTR factor (0-40 points)
    if (metrics.ctr !== undefined) {
      score += Math.min(40, metrics.ctr * 10);
      factors++;
    }

    // Conversion rate factor (0-30 points)
    if (metrics.conversionRate !== undefined) {
      score += Math.min(30, metrics.conversionRate * 3);
      factors++;
    }

    // ROI factor (0-30 points)
    if (metrics.roi !== undefined) {
      score += Math.min(30, metrics.roi / 10);
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }

  /**
     * Get audience insights
     */
  getAudienceInsights() {
    const insights = {
      totalSessions: this.pageViews.length,
      uniqueUsers: new Set(this.pageViews.map(pv => pv.userId)).size,
      averageSessionDuration: this.getAverageSessionDuration(),
      topPages: this.getTopPages(),
      deviceBreakdown: this.getDeviceBreakdown(),
      trafficSources: this.getTrafficSources(),
      geographicData: this.getGeographicData(),
      behaviorFlow: this.getBehaviorFlow()
    };

    return {
      success: true,
      data: insights
    };
  }

  /**
     * Get average session duration
     */
  getAverageSessionDuration() {
    if (this.pageViews.length === 0) {
      return 0;
    }

    const sessionDurations = {};
    this.pageViews.forEach(pv => {
      if (!sessionDurations[pv.sessionId]) {
        sessionDurations[pv.sessionId] = {
          start: new Date(pv.timestamp),
          end: new Date(pv.timestamp)
        };
      } else {
        const time = new Date(pv.timestamp);
        if (time > sessionDurations[pv.sessionId].end) {
          sessionDurations[pv.sessionId].end = time;
        }
      }
    });

    const durations = Object.values(sessionDurations).map(s => s.end - s.start);
    const average = durations.reduce((a, b) => a + b, 0) / durations.length;

    return Math.round(average / 1000); // Return in seconds
  }

  /**
     * Get top pages
     */
  getTopPages() {
    const pageCounts = {};
    this.pageViews.forEach(pv => {
      pageCounts[pv.page] = (pageCounts[pv.page] || 0) + 1;
    });

    return Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));
  }

  /**
     * Get device breakdown
     */
  getDeviceBreakdown() {
    const devices = { mobile: 0, tablet: 0, desktop: 0 };

    this.pageViews.forEach(pv => {
      if (pv.viewport.width < 768) {
        devices.mobile++;
      } else if (pv.viewport.width < 1024) {
        devices.tablet++;
      } else {
        devices.desktop++;
      }
    });

    const total = this.pageViews.length;
    return {
      mobile: { count: devices.mobile, percentage: (devices.mobile / total) * 100 },
      tablet: { count: devices.tablet, percentage: (devices.tablet / total) * 100 },
      desktop: { count: devices.desktop, percentage: (devices.desktop / total) * 100 }
    };
  }

  /**
     * Get traffic sources
     */
  getTrafficSources() {
    const sources = { direct: 0, organic: 0, referral: 0, social: 0 };
    const referrers = {};

    this.pageViews.forEach(pv => {
      if (!pv.referrer) {
        sources.direct++;
      } else if (pv.referrer.includes('google') || pv.referrer.includes('bing')) {
        sources.organic++;
      } else if (pv.referrer.includes('facebook') || pv.referrer.includes('twitter') || pv.referrer.includes('instagram')) {
        sources.social++;
      } else {
        sources.referral++;
        const domain = new URL(pv.referrer).hostname;
        referrers[domain] = (referrers[domain] || 0) + 1;
      }
    });

    return {
      sources,
      topReferrers: Object.entries(referrers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([domain, visits]) => ({ domain, visits }))
    };
  }

  /**
     * Get geographic data (mock for demo)
     */
  getGeographicData() {
    // In production, this would use IP geolocation
    return {
      countries: [
        { code: 'US', name: 'United States', sessions: 850, percentage: 85 },
        { code: 'CA', name: 'Canada', sessions: 50, percentage: 5 },
        { code: 'UK', name: 'United Kingdom', sessions: 30, percentage: 3 }
      ],
      cities: [
        { name: 'Miami', state: 'FL', sessions: 450, percentage: 45 },
        { name: 'Fort Lauderdale', state: 'FL', sessions: 200, percentage: 20 },
        { name: 'West Palm Beach', state: 'FL', sessions: 150, percentage: 15 }
      ]
    };
  }

  /**
     * Get behavior flow
     */
  getBehaviorFlow() {
    const flows = {};
    const sessionPaths = {};

    // Group events by session
    this.events.forEach(event => {
      if (!sessionPaths[event.sessionId]) {
        sessionPaths[event.sessionId] = [];
      }
      sessionPaths[event.sessionId].push(event);
    });

    // Analyze common paths
    Object.values(sessionPaths).forEach(path => {
      if (path.length < 2) {
        return;
      }

      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i].name;
        const to = path[i + 1].name;
        const key = `${from} → ${to}`;
        flows[key] = (flows[key] || 0) + 1;
      }
    });

    return Object.entries(flows)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));
  }

  /**
     * Get real-time metrics
     */
  getRealTimeMetrics() {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    const recentViews = this.pageViews.filter(pv =>
      new Date(pv.timestamp).getTime() > fiveMinutesAgo
    );

    const recentEvents = this.events.filter(e =>
      new Date(e.timestamp).getTime() > fiveMinutesAgo
    );

    return {
      success: true,
      data: {
        activeUsers: new Set(recentViews.map(pv => pv.userId)).size,
        pageViewsPerMinute: Math.round(recentViews.length / 5),
        eventsPerMinute: Math.round(recentEvents.length / 5),
        topPages: this.getTopPages(),
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
     * Initialize third-party analytics
     */
  initializeThirdPartyAnalytics() {
    // Google Analytics
    if (API_CONFIG.analytics.googleAnalytics && window.gtag) {
      window.gtag('config', API_CONFIG.analytics.googleAnalytics);
    }

    // Mixpanel
    if (API_CONFIG.analytics.mixpanel && window.mixpanel) {
      window.mixpanel.init(API_CONFIG.analytics.mixpanel);
      window.mixpanel.identify(this.userId);
    }

    // Segment
    if (API_CONFIG.analytics.segment && window.analytics) {
      window.analytics.identify(this.userId);
    }
  }

  /**
     * Start performance monitoring
     */
  startPerformanceMonitoring() {
    if (!window.performance || !window.PerformanceObserver) {
      return;
    }

    // Monitor Core Web Vitals
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackEvent('web_vitals', {
          metric: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: this.getVitalRating('LCP', lastEntry.renderTime || lastEntry.loadTime)
        });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fid = entry.processingStart - entry.startTime;
          this.trackEvent('web_vitals', {
            metric: 'FID',
            value: fid,
            rating: this.getVitalRating('FID', fid)
          });
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift
      let clsScore = 0;
      const clsObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Report CLS after page load
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.trackEvent('web_vitals', {
            metric: 'CLS',
            value: clsScore,
            rating: this.getVitalRating('CLS', clsScore)
          });
        }, 5000);
      });
    } catch (error) {
      console.error('Error setting up performance monitoring:', error);
    }
  }

  /**
     * Get Core Web Vital rating
     */
  getVitalRating(metric, value) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 }
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) {
      return 'good';
    }
    if (value <= threshold.poor) {
      return 'needs improvement';
    }
    return 'poor';
  }

  /**
     * Get session duration
     */
  getSessionDuration() {
    if (this.pageViews.length === 0) {
      return 0;
    }
    const firstView = this.pageViews[0];
    const now = new Date();
    const start = new Date(firstView.timestamp);
    return Math.round((now - start) / 1000); // Return in seconds
  }

  /**
     * Send analytics data
     */
  async sendAnalytics(type, data) {
    // In production, this would send to analytics endpoint
    if (API_CONFIG.features.advancedAnalytics) {
      console.log(`Analytics [${type}]:`, data);
    }

    // Send to third-party services
    if (window.gtag) {
      window.gtag('event', type, data);
    }

    if (window.mixpanel) {
      window.mixpanel.track(type, data);
    }

    if (window.analytics) {
      window.analytics.track(type, data);
    }
  }

  /**
     * Export analytics data
     */
  exportData(format = 'json') {
    const data = {
      sessionId: this.sessionId,
      userId: this.userId,
      pageViews: this.pageViews,
      events: this.events,
      campaignMetrics: Array.from(this.campaignMetrics.entries()),
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      // Convert to CSV format
      const csv = [];
      csv.push('Type,Timestamp,Page,Event,Properties');

      this.pageViews.forEach(pv => {
        csv.push(`pageview,${pv.timestamp},${pv.page},,`);
      });

      this.events.forEach(e => {
        csv.push(`event,${e.timestamp},${e.page},${e.name},"${JSON.stringify(e.properties)}"`);
      });

      return csv.join('\n');
    }

    return data;
  }
}

// Export singleton instance
const analyticsAPI = new AnalyticsAPI();
export default analyticsAPI;