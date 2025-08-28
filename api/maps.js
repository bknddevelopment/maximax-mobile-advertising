/**
 * MaxiMax Mobile Advertising - Maps API Integration
 * @version 3.0.0
 * @description Mapbox and Google Maps integration for route planning and visualization
 */

import API_CONFIG from '../config/api.config.js';

/**
 * Maps API Class - Handles both Mapbox and Google Maps
 */
export class MapsAPI {
  constructor(provider = 'mapbox') {
    this.provider = provider;
    this.config = provider === 'mapbox' ? API_CONFIG.mapbox : API_CONFIG.googleMaps;
    this.mapInstance = null;
    this.markers = new Map();
    this.routes = new Map();
    this.heatmapLayer = null;
  }

  /**
     * Initialize map instance
     */
  async initializeMap(containerId, options = {}) {
    const defaultOptions = {
      center: { lat: 25.7617, lng: -80.1918 }, // Miami
      zoom: 11,
      style: this.provider === 'mapbox' ? 'dark-v11' : 'roadmap',
      interactive: true,
      ...options
    };

    try {
      if (this.provider === 'mapbox') {
        await this.initMapbox(containerId, defaultOptions);
      } else {
        await this.initGoogleMaps(containerId, defaultOptions);
      }

      return {
        success: true,
        mapInstance: this.mapInstance
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MAP_INIT_FAILED',
          message: error.message
        }
      };
    }
  }

  /**
     * Initialize Mapbox
     */
  async initMapbox(containerId, options) {
    if (!window.mapboxgl) {
      throw new Error('Mapbox GL JS not loaded');
    }

    mapboxgl.accessToken = this.config.accessToken;

    this.mapInstance = new mapboxgl.Map({
      container: containerId,
      style: `mapbox://styles/mapbox/${options.style}`,
      center: [options.center.lng, options.center.lat],
      zoom: options.zoom,
      pitch: options.pitch || 45,
      bearing: options.bearing || 0,
      antialias: true
    });

    // Add navigation controls
    this.mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
    this.mapInstance.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add custom MaxiMax styling
    this.mapInstance.on('load', () => {
      this.addCustomLayers();
      this.add3DBuildings();
    });

    return new Promise(resolve => {
      this.mapInstance.on('load', resolve);
    });
  }

  /**
     * Initialize Google Maps
     */
  async initGoogleMaps(containerId, options) {
    if (!window.google?.maps) {
      throw new Error('Google Maps API not loaded');
    }

    this.mapInstance = new google.maps.Map(document.getElementById(containerId), {
      center: options.center,
      zoom: options.zoom,
      mapTypeId: options.style,
      styles: this.getGoogleMapStyles(),
      fullscreenControl: true,
      streetViewControl: false,
      mapTypeControl: false
    });
  }

  /**
     * Add custom Mapbox layers
     */
  addCustomLayers() {
    if (!this.mapInstance || this.provider !== 'mapbox') {
      return;
    }

    // Add traffic layer
    this.mapInstance.addSource('traffic', {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-traffic-v1'
    });

    this.mapInstance.addLayer({
      id: 'traffic-layer',
      type: 'line',
      source: 'traffic',
      'source-layer': 'traffic',
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'congestion'], 'heavy'], '#EC008C',
          ['==', ['get', 'congestion'], 'moderate'], '#FFA500',
          ['==', ['get', 'congestion'], 'low'], '#00AEEF',
          '#4CAF50'
        ],
        'line-width': 2,
        'line-opacity': 0.7
      }
    });
  }

  /**
     * Add 3D buildings for Mapbox
     */
  add3DBuildings() {
    if (!this.mapInstance || this.provider !== 'mapbox') {
      return;
    }

    this.mapInstance.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#1A1A1A',
        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
        'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
        'fill-extrusion-opacity': 0.6
      }
    });
  }

  /**
     * Get Google Maps custom styles
     */
  getGoogleMapStyles() {
    return [
      {
        elementType: 'geometry',
        stylers: [{ color: '#212121' }]
      },
      {
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{ color: '#757575' }]
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#212121' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#2c2c2c' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212121' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#8a8a8a' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#000000' }]
      }
    ];
  }

  /**
     * Add truck marker to map
     */
  addTruckMarker(truck, options = {}) {
    const markerId = truck.id;

    if (this.provider === 'mapbox') {
      // Create custom HTML element for truck
      const el = document.createElement('div');
      el.className = 'truck-marker';
      el.innerHTML = `
                <div class="truck-icon" style="
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #EC008C, #00AEEF);
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    transform: rotate(${truck.location.heading}deg);
                ">
                    <svg width="20" height="20" fill="white">
                        <path d="M10,0 L15,15 L10,12 L5,15 Z"/>
                    </svg>
                    ${truck.status === 'active' ? '<div class="pulse"></div>' : ''}
                </div>
                <div class="truck-label" style="
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    white-space: nowrap;
                ">${truck.name}</div>
            `;

      const marker = new mapboxgl.Marker(el, {
        anchor: 'center',
        rotationAlignment: 'map'
      })
        .setLngLat([truck.location.lng, truck.location.lat])
        .addTo(this.mapInstance);

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
                    <div style="padding: 10px;">
                        <h4 style="margin: 0 0 10px 0;">${truck.name}</h4>
                        <p style="margin: 5px 0;">Status: <strong>${truck.status}</strong></p>
                        ${truck.campaign ? `
                            <p style="margin: 5px 0;">Campaign: ${truck.campaign.client}</p>
                            <p style="margin: 5px 0;">Impressions: ${truck.metrics.impressions.toLocaleString()}</p>
                        ` : ''}
                        <p style="margin: 5px 0;">Speed: ${truck.location.speed} mph</p>
                    </div>
                `);

      marker.setPopup(popup);
      this.markers.set(markerId, marker);
    } else {
      // Google Maps marker
      const marker = new google.maps.Marker({
        position: { lat: truck.location.lat, lng: truck.location.lng },
        map: this.mapInstance,
        title: truck.name,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: truck.status === 'active' ? '#00AEEF' : '#666',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
          rotation: truck.location.heading
        },
        ...options
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
                    <div>
                        <h4>${truck.name}</h4>
                        <p>Status: ${truck.status}</p>
                        ${truck.campaign ? `<p>Campaign: ${truck.campaign.client}</p>` : ''}
                    </div>
                `
      });

      marker.addListener('click', () => {
        infoWindow.open(this.mapInstance, marker);
      });

      this.markers.set(markerId, marker);
    }

    return {
      success: true,
      markerId
    };
  }

  /**
     * Update truck marker position
     */
  updateTruckMarker(truckId, location) {
    const marker = this.markers.get(truckId);
    if (!marker) {
      return { success: false, error: 'Marker not found' };
    }

    if (this.provider === 'mapbox') {
      marker.setLngLat([location.lng, location.lat]);

      // Update rotation if applicable
      const element = marker.getElement();
      if (element) {
        const icon = element.querySelector('.truck-icon');
        if (icon) {
          icon.style.transform = `rotate(${location.heading}deg)`;
        }
      }
    } else {
      marker.setPosition({ lat: location.lat, lng: location.lng });
      const icon = marker.getIcon();
      icon.rotation = location.heading;
      marker.setIcon(icon);
    }

    return { success: true };
  }

  /**
     * Calculate and display route
     */
  async calculateRoute(waypoints, options = {}) {
    const routeId = options.routeId || `route-${Date.now()}`;

    try {
      if (this.provider === 'mapbox') {
        return await this.calculateMapboxRoute(waypoints, routeId, options);
      } else {
        return await this.calculateGoogleRoute(waypoints, routeId, options);
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ROUTE_CALC_FAILED',
          message: error.message
        }
      };
    }
  }

  /**
     * Calculate Mapbox route
     */
  async calculateMapboxRoute(waypoints, routeId, options) {
    const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?geometries=geojson&access_token=${this.config.accessToken}&overview=full&steps=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok') {
      throw new Error(data.message || 'Route calculation failed');
    }

    const route = data.routes[0];

    // Add route to map
    if (this.mapInstance.getSource(routeId)) {
      this.mapInstance.removeLayer(routeId);
      this.mapInstance.removeSource(routeId);
    }

    this.mapInstance.addSource(routeId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: route.geometry
      }
    });

    this.mapInstance.addLayer({
      id: routeId,
      type: 'line',
      source: routeId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': options.color || '#00AEEF',
        'line-width': options.width || 4,
        'line-opacity': options.opacity || 0.8
      }
    });

    this.routes.set(routeId, route);

    return {
      success: true,
      data: {
        routeId,
        distance: route.distance / 1609.34, // Convert to miles
        duration: route.duration / 60, // Convert to minutes
        geometry: route.geometry,
        steps: route.legs[0]?.steps || []
      }
    };
  }

  /**
     * Calculate Google Maps route
     */
  async calculateGoogleRoute(waypoints, routeId, options) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.mapInstance,
      polylineOptions: {
        strokeColor: options.color || '#00AEEF',
        strokeWeight: options.width || 4,
        strokeOpacity: options.opacity || 0.8
      },
      suppressMarkers: true
    });

    const request = {
      origin: waypoints[0],
      destination: waypoints[waypoints.length - 1],
      waypoints: waypoints.slice(1, -1).map(wp => ({ location: wp, stopover: true })),
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: options.optimize || false
    };

    return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          this.routes.set(routeId, result);

          const route = result.routes[0];
          const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
          const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);

          resolve({
            success: true,
            data: {
              routeId,
              distance: totalDistance / 1609.34, // Convert to miles
              duration: totalDuration / 60, // Convert to minutes
              legs: route.legs
            }
          });
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      });
    });
  }

  /**
     * Add heat map layer
     */
  async addHeatMap(data, options = {}) {
    if (this.provider === 'mapbox') {
      const heatmapId = options.id || 'heatmap';

      if (this.mapInstance.getSource(heatmapId)) {
        this.mapInstance.removeLayer(heatmapId);
        this.mapInstance.removeSource(heatmapId);
      }

      this.mapInstance.addSource(heatmapId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: data.map(point => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [point.lng, point.lat]
            },
            properties: {
              weight: point.weight || 1
            }
          }))
        }
      });

      this.mapInstance.addLayer({
        id: heatmapId,
        type: 'heatmap',
        source: heatmapId,
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': options.intensity || 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, '#00AEEF',
            0.4, '#00D4FF',
            0.6, '#FFA500',
            0.8, '#EC008C',
            1, '#FFFFFF'
          ],
          'heatmap-radius': options.radius || 20,
          'heatmap-opacity': options.opacity || 0.7
        }
      });
    } else {
      // Google Maps heatmap
      if (!window.google?.maps?.visualization) {
        throw new Error('Google Maps Visualization library not loaded');
      }

      if (this.heatmapLayer) {
        this.heatmapLayer.setMap(null);
      }

      this.heatmapLayer = new google.maps.visualization.HeatmapLayer({
        data: data.map(point => ({
          location: new google.maps.LatLng(point.lat, point.lng),
          weight: point.weight || 1
        })),
        map: this.mapInstance,
        radius: options.radius || 20,
        opacity: options.opacity || 0.7
      });
    }

    return { success: true };
  }

  /**
     * Add geofence
     */
  addGeofence(center, radius, options = {}) {
    const fenceId = options.id || `fence-${Date.now()}`;

    if (this.provider === 'mapbox') {
      const circle = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [center.lng, center.lat]
        }
      };

      if (this.mapInstance.getSource(fenceId)) {
        this.mapInstance.removeLayer(`${fenceId}-fill`);
        this.mapInstance.removeLayer(`${fenceId}-outline`);
        this.mapInstance.removeSource(fenceId);
      }

      this.mapInstance.addSource(fenceId, {
        type: 'geojson',
        data: circle
      });

      this.mapInstance.addLayer({
        id: `${fenceId}-fill`,
        type: 'circle',
        source: fenceId,
        paint: {
          'circle-radius': radius / 10, // Approximate conversion
          'circle-color': options.fillColor || '#EC008C',
          'circle-opacity': options.fillOpacity || 0.2
        }
      });

      this.mapInstance.addLayer({
        id: `${fenceId}-outline`,
        type: 'circle',
        source: fenceId,
        paint: {
          'circle-radius': radius / 10,
          'circle-color': options.strokeColor || '#EC008C',
          'circle-opacity': options.strokeOpacity || 0.8,
          'circle-stroke-width': 2
        }
      });
    } else {
      // Google Maps circle
      new google.maps.Circle({
        center: center,
        radius: radius,
        fillColor: options.fillColor || '#EC008C',
        fillOpacity: options.fillOpacity || 0.2,
        strokeColor: options.strokeColor || '#EC008C',
        strokeOpacity: options.strokeOpacity || 0.8,
        strokeWeight: 2,
        map: this.mapInstance
      });
    }

    return { success: true, fenceId };
  }

  /**
     * Fly to location (smooth animation)
     */
  flyTo(location, zoom = 15) {
    if (this.provider === 'mapbox') {
      this.mapInstance.flyTo({
        center: [location.lng, location.lat],
        zoom: zoom,
        speed: 1.2,
        curve: 1.42,
        essential: true
      });
    } else {
      this.mapInstance.panTo(location);
      this.mapInstance.setZoom(zoom);
    }

    return { success: true };
  }

  /**
     * Clean up map resources
     */
  destroy() {
    this.markers.forEach(marker => {
      if (this.provider === 'mapbox') {
        marker.remove();
      } else {
        marker.setMap(null);
      }
    });

    this.markers.clear();
    this.routes.clear();

    if (this.heatmapLayer) {
      this.heatmapLayer.setMap(null);
    }

    if (this.mapInstance && this.provider === 'mapbox') {
      this.mapInstance.remove();
    }

    this.mapInstance = null;
  }
}

// Export singleton instances
export const mapboxAPI = new MapsAPI('mapbox');
export const googleMapsAPI = new MapsAPI('google');

export default MapsAPI;