/**
 * MaxiMax Mobile Advertising - Data Service Layer
 * @version 3.0.0
 * @description Comprehensive data service handling all API interactions, caching, and state management
 */

import API_CONFIG from '../config/api.config.js';
import fleetAPI from '../api/fleet.js';
import { mapboxAPI, googleMapsAPI } from '../api/maps.js';
import analyticsAPI from '../api/analytics.js';
import quoteAPI from '../api/quotes.js';
import { APIValidator, ValidationError } from '../utils/validation.js';

/**
 * Cache Manager Class
 */
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  /**
     * Set cache with TTL
     */
  set(key, value, ttl = 300000) { // Default 5 minutes
    this.cache.set(key, value);
    this.ttls.set(key, Date.now() + ttl);

    // Auto-cleanup expired entries
    setTimeout(() => this.delete(key), ttl);

    return value;
  }

  /**
     * Get from cache
     */
  get(key) {
    const ttl = this.ttls.get(key);

    if (!ttl || Date.now() > ttl) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
     * Delete from cache
     */
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  /**
     * Clear all cache
     */
  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  /**
     * Check if key exists and is valid
     */
  has(key) {
    const ttl = this.ttls.get(key);
    if (!ttl || Date.now() > ttl) {
      this.delete(key);
      return false;
    }
    return this.cache.has(key);
  }
}

/**
 * Request Queue Manager
 */
class RequestQueue {
  constructor(maxConcurrent = 5) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
  }

  /**
     * Add request to queue
     */
  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }

  /**
     * Process queue
     */
  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { request, resolve, reject } = this.queue.shift();

    try {
      const result = await request();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

/**
 * WebSocket Manager for real-time updates
 */
class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
  }

  /**
     * Connect to WebSocket
     */
  connect() {
    if (this.ws && this.isConnected) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type || 'message', data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.ws.onerror = error => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.attemptReconnect();
    }
  }

  /**
     * Attempt to reconnect
     */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnectFailed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }

  /**
     * Send message
     */
  send(type, data) {
    if (!this.isConnected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify({ type, data, timestamp: Date.now() }));
      return true;
    } catch (error) {
      console.error('WebSocket send error:', error);
      return false;
    }
  }

  /**
     * Subscribe to events
     */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => this.off(event, callback);
  }

  /**
     * Unsubscribe from events
     */
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
     * Emit event
     */
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
     * Disconnect WebSocket
     */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}

/**
 * Main Data Service Class
 */
export class DataService {
  constructor() {
    this.cache = new CacheManager();
    this.requestQueue = new RequestQueue();
    this.wsManager = null;
    this.subscribers = new Map();
    this.state = {
      fleet: [],
      quotes: [],
      campaigns: [],
      analytics: {}
    };

    this.initialize();
  }

  /**
     * Initialize service
     */
  async initialize() {
    // Initialize WebSocket for real-time updates
    if (API_CONFIG.features.realTimeTracking) {
      this.initializeWebSocket();
    }

    // Subscribe to fleet updates
    fleetAPI.subscribe(data => {
      this.state.fleet = data.trucks;
      this.emit('fleetUpdate', data);
    });

    // Initialize analytics tracking
    this.initializeAnalytics();
  }

  /**
     * Initialize WebSocket connection
     */
  initializeWebSocket() {
    const wsUrl = `${API_CONFIG.baseUrl.replace('https://', 'wss://').replace('http://', 'ws://')}/ws`;
    this.wsManager = new WebSocketManager(wsUrl);

    // Setup WebSocket event handlers
    this.wsManager.on('fleetUpdate', data => {
      this.handleFleetUpdate(data);
    });

    this.wsManager.on('campaignUpdate', data => {
      this.handleCampaignUpdate(data);
    });

    this.wsManager.on('alert', data => {
      this.handleAlert(data);
    });

    // Connect
    this.wsManager.connect();
  }

  /**
     * Initialize analytics
     */
  initializeAnalytics() {
    // Track page views
    analyticsAPI.trackPageView();

    // Track service initialization
    analyticsAPI.trackEvent('service_initialized', {
      features: Object.keys(API_CONFIG.features).filter(f => API_CONFIG.features[f])
    });
  }

  /**
     * Fleet Management Methods
     */
  async getFleetStatus(options = {}) {
    const cacheKey = `fleet-${JSON.stringify(options)}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const result = await this.requestQueue.add(() => fleetAPI.getFleetStatus(options));

    // Cache result
    this.cache.set(cacheKey, result, 30000); // 30 seconds for fleet data

    return result;
  }

  async getTruckDetails(truckId) {
    const cacheKey = `truck-${truckId}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.requestQueue.add(() => fleetAPI.getTruckDetails(truckId));
    this.cache.set(cacheKey, result, 30000);

    return result;
  }

  async updateTruckStatus(truckId, status) {
    // Validate input
    APIValidator.validateRequest({ truckId, status }, {
      truckId: ['required'],
      status: ['required', { type: 'pattern', params: /^(active|idle|maintenance|offline)$/ }]
    });

    const result = await fleetAPI.updateTruckStatus(truckId, status);

    // Clear related cache
    this.cache.delete(`truck-${truckId}`);
    this.cache.clear(); // Clear all fleet cache

    // Notify subscribers
    this.emit('truckStatusUpdate', { truckId, status });

    return result;
  }

  async assignCampaign(truckId, campaignData) {
    // Validate campaign data
    APIValidator.validateRequest(campaignData, {
      id: ['required'],
      client: ['required', { type: 'minLength', params: 3 }],
      message: ['required', { type: 'maxLength', params: 100 }],
      startTime: ['required', 'date', 'futureDate'],
      endTime: ['required', 'date', 'futureDate']
    });

    const result = await fleetAPI.assignCampaign(truckId, campaignData);

    // Clear cache
    this.cache.delete(`truck-${truckId}`);

    // Track event
    analyticsAPI.trackEvent('campaign_assigned', {
      truckId,
      campaignId: campaignData.id,
      client: campaignData.client
    });

    return result;
  }

  /**
     * Maps Methods
     */
  async initializeMap(containerId, options = {}) {
    const provider = options.provider || 'mapbox';
    const mapAPI = provider === 'mapbox' ? mapboxAPI : googleMapsAPI;

    const result = await mapAPI.initializeMap(containerId, options);

    if (result.success) {
      // Track map initialization
      analyticsAPI.trackEvent('map_initialized', {
        provider,
        containerId
      });
    }

    return result;
  }

  async addTruckToMap(truck, mapProvider = 'mapbox') {
    const mapAPI = mapProvider === 'mapbox' ? mapboxAPI : googleMapsAPI;
    return await mapAPI.addTruckMarker(truck);
  }

  async updateTruckOnMap(truckId, location, mapProvider = 'mapbox') {
    const mapAPI = mapProvider === 'mapbox' ? mapboxAPI : googleMapsAPI;
    return await mapAPI.updateTruckMarker(truckId, location);
  }

  async calculateRoute(waypoints, options = {}) {
    const mapAPI = options.provider === 'google' ? googleMapsAPI : mapboxAPI;

    const result = await mapAPI.calculateRoute(waypoints, options);

    if (result.success) {
      // Track route calculation
      analyticsAPI.trackEvent('route_calculated', {
        waypoints: waypoints.length,
        distance: result.data.distance,
        duration: result.data.duration
      });
    }

    return result;
  }

  async addHeatMap(data, options = {}) {
    const mapAPI = options.provider === 'google' ? googleMapsAPI : mapboxAPI;
    return await mapAPI.addHeatMap(data, options);
  }

  /**
     * Quote Methods
     */
  async generateQuote(params) {
    // Validate quote parameters
    try {
      APIValidator.validateRequest(params, {
        duration: ['required', { type: 'minValue', params: 1 }],
        durationUnit: ['required'],
        trucks: ['required', { type: 'minValue', params: 1 }, { type: 'maxValue', params: 20 }],
        startDate: ['date', 'futureDate']
      });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }

    const result = await quoteAPI.generateQuote(params);

    if (result.success) {
      // Store in state
      this.state.quotes.push(result.data);

      // Track quote generation
      analyticsAPI.trackEvent('quote_generated', {
        quoteId: result.data.id,
        total: result.data.pricing.total,
        trucks: params.trucks,
        duration: params.duration
      });

      // Notify subscribers
      this.emit('quoteGenerated', result.data);
    }

    return result;
  }

  async getQuote(quoteId) {
    const cacheKey = `quote-${quoteId}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await quoteAPI.getQuote(quoteId);

    if (result.success) {
      this.cache.set(cacheKey, result, 1800000); // 30 minutes for quotes
    }

    return result;
  }

  async acceptQuote(quoteId, paymentInfo) {
    // Validate payment info
    APIValidator.validateRequest(paymentInfo, {
      method: ['required'],
      amount: ['required', { type: 'minValue', params: 0 }]
    });

    const result = await quoteAPI.acceptQuote(quoteId, paymentInfo);

    if (result.success) {
      // Clear cache
      this.cache.delete(`quote-${quoteId}`);

      // Track acceptance
      analyticsAPI.trackEvent('quote_accepted', {
        quoteId,
        amount: paymentInfo.amount,
        method: paymentInfo.method
      });

      // Track conversion
      analyticsAPI.trackEvent('conversion', {
        type: 'quote_to_campaign',
        value: paymentInfo.amount
      });
    }

    return result;
  }

  /**
     * Campaign Methods
     */
  async getCampaigns(filters = {}) {
    const cacheKey = `campaigns-${JSON.stringify(filters)}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // In production, this would fetch from API
    const mockCampaigns = [
      {
        id: 'C2024001',
        client: 'Miami Beach Hotels',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        trucks: 3,
        budget: 15000,
        impressions: 450000,
        routes: ['South Beach', 'Ocean Drive']
      },
      {
        id: 'C2024002',
        client: 'Aventura Mall',
        status: 'scheduled',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        trucks: 2,
        budget: 8500,
        impressions: 0,
        routes: ['Aventura', 'Sunny Isles']
      }
    ];

    const result = {
      success: true,
      data: mockCampaigns
    };

    this.cache.set(cacheKey, result, 60000); // 1 minute
    return result;
  }

  async getCampaignMetrics(campaignId) {
    const metrics = analyticsAPI.getCampaignPerformance(campaignId);

    if (!metrics.success) {
      // Generate mock metrics
      const mockMetrics = {
        impressions: Math.floor(Math.random() * 500000) + 100000,
        clicks: Math.floor(Math.random() * 5000) + 1000,
        conversions: Math.floor(Math.random() * 100) + 10,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        cost: Math.floor(Math.random() * 10000) + 5000
      };

      analyticsAPI.trackCampaignMetrics(campaignId, mockMetrics);
      return analyticsAPI.getCampaignPerformance(campaignId);
    }

    return metrics;
  }

  /**
     * Analytics Methods
     */
  async getAnalyticsSummary() {
    const insights = analyticsAPI.getAudienceInsights();
    const realTime = analyticsAPI.getRealTimeMetrics();

    return {
      success: true,
      data: {
        insights: insights.data,
        realTime: realTime.data,
        campaigns: await this.getAllCampaignMetrics()
      }
    };
  }

  async getAllCampaignMetrics() {
    const campaigns = await this.getCampaigns();
    const metrics = [];

    for (const campaign of campaigns.data) {
      const metric = await this.getCampaignMetrics(campaign.id);
      metrics.push({
        ...campaign,
        metrics: metric.data
      });
    }

    return metrics;
  }

  async trackEvent(eventName, properties = {}) {
    return analyticsAPI.trackEvent(eventName, properties);
  }

  /**
     * Form Handling
     */
  async submitContactForm(formData) {
    // Validate form data
    try {
      APIValidator.validateRequest(formData, {
        name: ['required', { type: 'minLength', params: 2 }],
        email: ['required', 'email'],
        phone: ['phone'],
        company: [{ type: 'minLength', params: 2 }],
        message: ['required', { type: 'minLength', params: 10 }]
      });
    } catch (error) {
      return {
        success: false,
        error: error.errors
      };
    }

    // Sanitize data
    const sanitized = APIValidator.sanitize(formData);

    // Track form submission
    analyticsAPI.trackEvent('form_submit', {
      formType: 'contact',
      company: sanitized.company
    });

    // In production, this would send to API
    await this.simulateAPICall(2000);

    // Send confirmation email (mock)
    console.log('Sending confirmation email to:', sanitized.email);

    return {
      success: true,
      message: 'Thank you for your inquiry. We will contact you within 2 hours.',
      data: sanitized
    };
  }

  async submitQuoteRequest(formData) {
    // Generate quote based on form data
    const quoteParams = {
      ...formData,
      clientInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company
      }
    };

    const result = await this.generateQuote(quoteParams);

    if (result.success) {
      // Track conversion funnel
      analyticsAPI.trackEvent('quote_requested', {
        quoteId: result.data.id,
        value: result.data.pricing.total
      });
    }

    return result;
  }

  /**
     * Subscription Management
     */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }

    this.subscribers.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  emit(event, data) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber for event ${event}:`, error);
        }
      });
    }
  }

  /**
     * Event Handlers
     */
  handleFleetUpdate(data) {
    this.state.fleet = data.trucks || this.state.fleet;
    this.cache.clear(); // Clear fleet-related cache
    this.emit('fleetUpdate', data);
  }

  handleCampaignUpdate(data) {
    const index = this.state.campaigns.findIndex(c => c.id === data.id);
    if (index !== -1) {
      this.state.campaigns[index] = { ...this.state.campaigns[index], ...data };
    } else {
      this.state.campaigns.push(data);
    }
    this.emit('campaignUpdate', data);
  }

  handleAlert(data) {
    // Handle different alert types
    switch (data.type) {
      case 'maintenance':
        this.emit('maintenanceAlert', data);
        break;
      case 'geofence':
        this.emit('geofenceAlert', data);
        break;
      case 'emergency':
        this.emit('emergencyAlert', data);
        break;
      default:
        this.emit('alert', data);
    }

    // Track alert
    analyticsAPI.trackEvent('alert_received', {
      type: data.type,
      severity: data.severity
    });
  }

  /**
     * Utility Methods
     */
  async simulateAPICall(delay = 1000) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  clearCache(pattern) {
    if (pattern) {
      // Clear specific pattern
      for (const key of this.cache.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all
      this.cache.clear();
    }
  }

  getState() {
    return { ...this.state };
  }

  /**
     * Cleanup
     */
  destroy() {
    // Disconnect WebSocket
    if (this.wsManager) {
      this.wsManager.disconnect();
    }

    // Clear cache
    this.cache.clear();

    // Clear subscribers
    this.subscribers.clear();

    // Cleanup APIs
    fleetAPI.destroy();
    mapboxAPI.destroy();
    googleMapsAPI.destroy();
  }
}

// Export singleton instance
const dataService = new DataService();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.MaxiMax = window.MaxiMax || {};
  window.MaxiMax.dataService = dataService;
}

export default dataService;