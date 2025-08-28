/**
 * MaxiMax Mobile Advertising - Fleet Tracking API
 * @version 3.0.0
 * @description Real-time fleet tracking and management API
 */

import API_CONFIG from '../config/api.config.js';

// Mock fleet data for demonstration
const MOCK_FLEET = [
  {
    id: 'MX-001',
    name: 'MaxiMax Alpha',
    status: 'active',
    location: {
      lat: 25.7617,
      lng: -80.1918,
      heading: 45,
      speed: 28
    },
    driver: {
      id: 'D001',
      name: 'John Martinez',
      phone: '+1-305-555-0101'
    },
    campaign: {
      id: 'C2024001',
      client: 'Miami Beach Hotels',
      message: 'Summer Special - 30% Off',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    },
    metrics: {
      impressions: 45320,
      distance: 87.3,
      runtime: 5.2
    },
    route: {
      current: 'South Beach Circuit',
      waypoints: ['Ocean Drive', 'Collins Ave', 'Lincoln Road'],
      progress: 0.65
    },
    health: {
      fuel: 0.75,
      battery: 0.92,
      ledStatus: 'optimal',
      lastMaintenance: '2024-01-15'
    }
  },
  {
    id: 'MX-002',
    name: 'MaxiMax Beta',
    status: 'active',
    location: {
      lat: 25.8103,
      lng: -80.1751,
      heading: 180,
      speed: 35
    },
    driver: {
      id: 'D002',
      name: 'Sarah Johnson',
      phone: '+1-305-555-0102'
    },
    campaign: {
      id: 'C2024002',
      client: 'Aventura Mall',
      message: 'Grand Opening - New Store',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    },
    metrics: {
      impressions: 38945,
      distance: 62.1,
      runtime: 4.5
    },
    route: {
      current: 'Aventura Loop',
      waypoints: ['Biscayne Blvd', 'Aventura Mall', 'Sunny Isles'],
      progress: 0.45
    },
    health: {
      fuel: 0.60,
      battery: 0.88,
      ledStatus: 'optimal',
      lastMaintenance: '2024-01-20'
    }
  },
  {
    id: 'MX-003',
    name: 'MaxiMax Gamma',
    status: 'maintenance',
    location: {
      lat: 25.7917,
      lng: -80.1344,
      heading: 0,
      speed: 0
    },
    driver: null,
    campaign: null,
    metrics: {
      impressions: 0,
      distance: 0,
      runtime: 0
    },
    route: null,
    health: {
      fuel: 0.90,
      battery: 1.0,
      ledStatus: 'maintenance',
      lastMaintenance: '2024-01-25'
    }
  }
];

// Simulated real-time location updates
let fleetState = [...MOCK_FLEET];
const locationHistory = new Map();

// Initialize location history
fleetState.forEach(truck => {
  locationHistory.set(truck.id, []);
});

/**
 * Fleet API Class
 */
export class FleetAPI {
  constructor() {
    this.updateInterval = null;
    this.subscribers = new Set();
    this.initializeRealTimeUpdates();
  }

  /**
     * Initialize real-time location updates
     */
  initializeRealTimeUpdates() {
    if (typeof window !== 'undefined') {
      this.updateInterval = setInterval(() => {
        this.simulateMovement();
        this.notifySubscribers();
      }, API_CONFIG.fleet.updateInterval);
    }
  }

  /**
     * Simulate truck movement
     */
  simulateMovement() {
    fleetState = fleetState.map(truck => {
      if (truck.status !== 'active') {
        return truck;
      }

      // Simulate movement
      const deltaLat = (Math.random() - 0.5) * 0.001;
      const deltaLng = (Math.random() - 0.5) * 0.001;
      const speedVariation = (Math.random() - 0.5) * 10;
      const headingVariation = (Math.random() - 0.5) * 15;

      const updatedTruck = {
        ...truck,
        location: {
          lat: Math.max(25.6, Math.min(25.95, truck.location.lat + deltaLat)),
          lng: Math.max(-80.35, Math.min(-80.1, truck.location.lng + deltaLng)),
          heading: (truck.location.heading + headingVariation + 360) % 360,
          speed: Math.max(0, Math.min(65, truck.location.speed + speedVariation))
        },
        metrics: {
          ...truck.metrics,
          impressions: truck.metrics.impressions + Math.floor(Math.random() * 50),
          distance: truck.metrics.distance + (truck.location.speed / 3600) * 5,
          runtime: truck.metrics.runtime + 5 / 3600
        }
      };

      // Update route progress
      if (updatedTruck.route) {
        updatedTruck.route.progress = Math.min(1, updatedTruck.route.progress + 0.01);
      }

      // Store in history
      const history = locationHistory.get(truck.id) || [];
      history.push({
        timestamp: new Date().toISOString(),
        location: updatedTruck.location,
        metrics: updatedTruck.metrics
      });

      // Keep only last 24 hours of history
      const cutoff = Date.now() - API_CONFIG.fleet.historyRetention;
      locationHistory.set(
        truck.id,
        history.filter(h => new Date(h.timestamp).getTime() > cutoff)
      );

      return updatedTruck;
    });
  }

  /**
     * Subscribe to real-time updates
     */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
     * Notify all subscribers
     */
  notifySubscribers() {
    const data = this.getFleetStatus();
    this.subscribers.forEach(callback => callback(data));
  }

  /**
     * Get current fleet status
     */
  async getFleetStatus(options = {}) {
    const {
      status = null,
      bounds = null,
      campaignId = null
    } = options;

    let filtered = [...fleetState];

    // Filter by status
    if (status) {
      filtered = filtered.filter(truck => truck.status === status);
    }

    // Filter by campaign
    if (campaignId) {
      filtered = filtered.filter(truck => truck.campaign?.id === campaignId);
    }

    // Filter by bounds
    if (bounds) {
      const { north, south, east, west } = bounds;
      filtered = filtered.filter(truck =>
        truck.location.lat <= north &&
                truck.location.lat >= south &&
                truck.location.lng <= east &&
                truck.location.lng >= west
      );
    }

    return {
      success: true,
      data: {
        trucks: filtered,
        summary: {
          total: filtered.length,
          active: filtered.filter(t => t.status === 'active').length,
          idle: filtered.filter(t => t.status === 'idle').length,
          maintenance: filtered.filter(t => t.status === 'maintenance').length,
          totalImpressions: filtered.reduce((sum, t) => sum + t.metrics.impressions, 0),
          totalDistance: filtered.reduce((sum, t) => sum + t.metrics.distance, 0)
        },
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
     * Get specific truck details
     */
  async getTruckDetails(truckId) {
    const truck = fleetState.find(t => t.id === truckId);

    if (!truck) {
      return {
        success: false,
        error: {
          code: 'TRUCK_NOT_FOUND',
          message: `Truck ${truckId} not found`
        }
      };
    }

    const history = locationHistory.get(truckId) || [];

    return {
      success: true,
      data: {
        ...truck,
        history: history.slice(-100), // Last 100 data points
        analytics: this.calculateTruckAnalytics(truck, history)
      }
    };
  }

  /**
     * Calculate truck analytics
     */
  calculateTruckAnalytics(truck, history) {
    if (history.length < 2) {
      return {
        avgSpeed: truck.location?.speed || 0,
        maxSpeed: truck.location?.speed || 0,
        idleTime: 0,
        efficiency: 1.0
      };
    }

    const speeds = history.map(h => h.location.speed);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);
    const idleTime = speeds.filter(s => s < API_CONFIG.fleet.speedThreshold.min).length / speeds.length;
    const efficiency = 1 - idleTime;

    return {
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      idleTime: Math.round(idleTime * 100),
      efficiency: Math.round(efficiency * 100) / 100
    };
  }

  /**
     * Update truck status
     */
  async updateTruckStatus(truckId, status) {
    const truckIndex = fleetState.findIndex(t => t.id === truckId);

    if (truckIndex === -1) {
      return {
        success: false,
        error: {
          code: 'TRUCK_NOT_FOUND',
          message: `Truck ${truckId} not found`
        }
      };
    }

    const validStatuses = ['active', 'idle', 'maintenance', 'offline'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        }
      };
    }

    fleetState[truckIndex] = {
      ...fleetState[truckIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: fleetState[truckIndex]
    };
  }

  /**
     * Assign campaign to truck
     */
  async assignCampaign(truckId, campaignData) {
    const truckIndex = fleetState.findIndex(t => t.id === truckId);

    if (truckIndex === -1) {
      return {
        success: false,
        error: {
          code: 'TRUCK_NOT_FOUND',
          message: `Truck ${truckId} not found`
        }
      };
    }

    fleetState[truckIndex] = {
      ...fleetState[truckIndex],
      campaign: {
        ...campaignData,
        assignedAt: new Date().toISOString()
      },
      status: 'active'
    };

    return {
      success: true,
      data: fleetState[truckIndex]
    };
  }

  /**
     * Get fleet heat map data
     */
  async getHeatMapData(timeRange = '1h') {
    const heatMapData = [];

    fleetState.forEach(truck => {
      if (truck.status !== 'active') {
        return;
      }

      const history = locationHistory.get(truck.id) || [];
      history.forEach(point => {
        heatMapData.push({
          lat: point.location.lat,
          lng: point.location.lng,
          weight: Math.min(1, point.metrics.impressions / 1000)
        });
      });
    });

    return {
      success: true,
      data: {
        points: heatMapData,
        totalPoints: heatMapData.length,
        timeRange,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
     * Get geofence alerts
     */
  async getGeofenceAlerts(geofences) {
    const alerts = [];

    geofences.forEach(fence => {
      fleetState.forEach(truck => {
        if (truck.status !== 'active') {
          return;
        }

        const distance = this.calculateDistance(
          truck.location.lat,
          truck.location.lng,
          fence.center.lat,
          fence.center.lng
        );

        if (distance <= fence.radius) {
          alerts.push({
            truckId: truck.id,
            geofenceId: fence.id,
            type: fence.type || 'enter',
            distance,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    return {
      success: true,
      data: alerts
    };
  }

  /**
     * Calculate distance between two points (Haversine formula)
     */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
     * Clean up resources
     */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.subscribers.clear();
  }
}

// Export singleton instance
const fleetAPI = new FleetAPI();
export default fleetAPI;