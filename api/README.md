# MaxiMax Mobile Advertising API Documentation

## Version 3.0.0

### Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Endpoints](#endpoints)
5. [Error Handling](#error-handling)
6. [WebSocket Events](#websocket-events)
7. [Testing](#testing)

---

## Overview

The MaxiMax API provides comprehensive access to mobile billboard advertising services including real-time fleet tracking, campaign management, analytics, and instant quote generation.

### Base URL
```
Production: https://api.maximax-advertising.com
Development: http://localhost:3000/api
```

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "timestamp": "2024-01-25T12:00:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

---

## Authentication

### API Key Authentication

Include your API key in the request headers:
```
X-API-Key: your-api-key-here
```

### Authentication Tiers

| Tier | Rate Limit | Features |
|------|-----------|----------|
| Anonymous | 50 req/15min | Basic endpoints only |
| Authenticated | 200 req/15min | Full API access |
| Premium | 1000 req/15min | Priority queue, advanced features |
| Admin | Unlimited | All features + admin endpoints |

### Obtaining API Keys

```javascript
// Request API key
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'client@example.com',
    company: 'Example Corp',
    plan: 'authenticated'
  })
});
```

---

## Rate Limiting

Rate limits are enforced per API key or IP address.

### Rate Limit Headers

All API responses include rate limit information:
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 2024-01-25T12:15:00Z
```

### Handling Rate Limits

```javascript
// Example rate limit handling
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  // Retry request
}
```

---

## Endpoints

### Fleet Management

#### Get Fleet Status
```http
GET /api/fleet/status
```

Query Parameters:
- `status` (string): Filter by status (active, idle, maintenance)
- `bounds` (object): Geographic bounds {north, south, east, west}
- `campaignId` (string): Filter by campaign

Response:
```json
{
  "success": true,
  "data": {
    "trucks": [...],
    "summary": {
      "total": 10,
      "active": 7,
      "idle": 2,
      "maintenance": 1,
      "totalImpressions": 450000,
      "totalDistance": 1234.5
    }
  }
}
```

#### Get Truck Details
```http
GET /api/fleet/trucks/:truckId
```

Response includes real-time location, campaign info, metrics, and health status.

#### Update Truck Status
```http
PUT /api/fleet/trucks/:truckId/status
```

Body:
```json
{
  "status": "active|idle|maintenance|offline"
}
```

#### Assign Campaign to Truck
```http
POST /api/fleet/trucks/:truckId/campaign
```

Body:
```json
{
  "id": "C2024001",
  "client": "Client Name",
  "message": "Campaign Message",
  "startTime": "2024-01-25T12:00:00Z",
  "endTime": "2024-01-26T20:00:00Z"
}
```

### Maps & Routes

#### Initialize Map
```http
POST /api/maps/initialize
```

Body:
```json
{
  "containerId": "map-container",
  "provider": "mapbox|google",
  "options": {
    "center": { "lat": 25.7617, "lng": -80.1918 },
    "zoom": 11
  }
}
```

#### Calculate Route
```http
POST /api/maps/route
```

Body:
```json
{
  "waypoints": [
    { "lat": 25.7617, "lng": -80.1918 },
    { "lat": 25.8103, "lng": -80.1751 }
  ],
  "optimize": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "routeId": "route-123",
    "distance": 15.3,
    "duration": 25,
    "geometry": {...}
  }
}
```

#### Add Heat Map
```http
POST /api/maps/heatmap
```

Body:
```json
{
  "data": [
    { "lat": 25.7617, "lng": -80.1918, "weight": 0.8 }
  ],
  "options": {
    "radius": 20,
    "opacity": 0.7
  }
}
```

### Quotes & Pricing

#### Generate Instant Quote
```http
POST /api/quotes/generate
```

Body:
```json
{
  "campaignType": "standard|premium|basic|event",
  "duration": 7,
  "durationUnit": "hours|days|weeks|months",
  "trucks": 3,
  "routes": ["South Beach", "Downtown Miami"],
  "startDate": "2024-02-01T09:00:00Z",
  "targetImpressions": 500000,
  "specialRequests": ["exclusive-route", "night-display"],
  "clientInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Example Corp"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "Q2024001234",
    "status": "pending",
    "expiresAt": "2024-02-01T00:00:00Z",
    "pricing": {
      "basePrice": 5600,
      "modifiers": {...},
      "subtotal": 6720,
      "tax": 470.40,
      "total": 7190.40,
      "breakdown": {
        "perTruck": 2240,
        "perHour": 120,
        "perDay": 960
      }
    },
    "metrics": {
      "estimatedImpressions": 504000,
      "cpm": 13.33,
      "reachEstimate": 352800
    },
    "roi": {
      "estimatedValue": 1008,
      "projectedROI": -86,
      "comparisonToStatic": {...},
      "comparisonToDigital": {...}
    },
    "savings": {
      "items": [...],
      "total": 840
    },
    "addons": [...],
    "terms": {...}
  }
}
```

#### Get Quote
```http
GET /api/quotes/:quoteId
```

#### Accept Quote
```http
POST /api/quotes/:quoteId/accept
```

Body:
```json
{
  "paymentInfo": {
    "method": "card|bank_transfer|ach_debit",
    "amount": 3595.20
  }
}
```

### Analytics

#### Get Campaign Metrics
```http
GET /api/analytics/campaigns/:campaignId
```

Response:
```json
{
  "success": true,
  "data": {
    "impressions": 450000,
    "clicks": 4500,
    "conversions": 45,
    "revenue": 45000,
    "cost": 7000,
    "roi": 542.86,
    "ctr": 1.0,
    "conversionRate": 1.0,
    "performance": 75
  }
}
```

#### Get Audience Insights
```http
GET /api/analytics/audience
```

Returns detailed audience demographics, behavior patterns, and engagement metrics.

#### Get Real-time Metrics
```http
GET /api/analytics/realtime
```

Response:
```json
{
  "success": true,
  "data": {
    "activeUsers": 127,
    "pageViewsPerMinute": 45,
    "eventsPerMinute": 156,
    "topPages": [...],
    "timestamp": "2024-01-25T12:00:00Z"
  }
}
```

#### Track Event
```http
POST /api/analytics/events
```

Body:
```json
{
  "name": "quote_requested",
  "properties": {
    "value": 7500,
    "trucks": 3,
    "duration": "1 week"
  }
}
```

### Forms & Contact

#### Submit Contact Form
```http
POST /api/forms/contact
```

Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(305) 555-0123",
  "company": "Example Corp",
  "message": "I'm interested in mobile billboard advertising"
}
```

#### Submit Quote Request
```http
POST /api/forms/quote-request
```

Similar to quote generation but with form validation and lead tracking.

---

## Error Handling

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| AUTH001 | 401 | Invalid API key |
| AUTH002 | 401 | Token expired |
| RATE001 | 429 | Rate limit exceeded |
| REQ001 | 400 | Invalid request parameters |
| RES001 | 404 | Resource not found |
| SRV001 | 500 | Internal server error |
| PAY001 | 402 | Payment processing failed |
| QUOTA001 | 402 | API quota exceeded |

### Error Response Example
```json
{
  "success": false,
  "error": {
    "code": "REQ001",
    "message": "Invalid request parameters",
    "details": {
      "field": "trucks",
      "issue": "Must be between 1 and 20"
    }
  }
}
```

---

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://api.maximax-advertising.com/ws');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    data: { apiKey: 'your-api-key' }
  }));
};
```

### Events

#### Fleet Updates
```javascript
// Subscribe to fleet updates
ws.send(JSON.stringify({
  type: 'subscribe',
  data: { channel: 'fleet' }
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'fleet.location.updated') {
    // Handle truck location update
  }
};
```

#### Available Events
- `fleet.location.updated` - Truck location changed
- `campaign.started` - Campaign has started
- `campaign.completed` - Campaign completed
- `quote.created` - New quote generated
- `quote.accepted` - Quote accepted by client
- `payment.received` - Payment processed
- `truck.maintenance` - Truck requires maintenance
- `route.optimized` - Route has been optimized
- `alert` - System alert or notification

---

## Testing

### Test Endpoints

#### Health Check
```http
GET /api/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "3.0.0",
    "uptime": 123456,
    "timestamp": "2024-01-25T12:00:00Z"
  }
}
```

#### API Status
```http
GET /api/status
```

Returns detailed API status including service availability and response times.

### Test API Keys

For development and testing:

| Key | Tier | Description |
|-----|------|-------------|
| `demo-key-001` | Authenticated | General testing |
| `premium-key-001` | Premium | Premium features testing |

### Example Test Script

```javascript
// Test all major endpoints
import dataService from './services/dataService.js';

async function testAPI() {
  console.log('Testing MaxiMax API...\n');
  
  // Test Fleet API
  console.log('1. Testing Fleet API...');
  const fleetStatus = await dataService.getFleetStatus();
  console.assert(fleetStatus.success, 'Fleet status should succeed');
  
  // Test Quote Generation
  console.log('2. Testing Quote API...');
  const quote = await dataService.generateQuote({
    duration: 7,
    durationUnit: 'days',
    trucks: 2,
    routes: ['South Beach'],
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  console.assert(quote.success, 'Quote generation should succeed');
  
  // Test Analytics
  console.log('3. Testing Analytics API...');
  const analytics = await dataService.getAnalyticsSummary();
  console.assert(analytics.success, 'Analytics should return data');
  
  console.log('\nAll tests passed! ✓');
}

// Run tests
testAPI().catch(console.error);
```

### Postman Collection

Import this collection for API testing:
```json
{
  "info": {
    "name": "MaxiMax API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Fleet",
      "item": [
        {
          "name": "Get Fleet Status",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "X-API-Key",
                "value": "{{apiKey}}"
              }
            ],
            "url": "{{baseUrl}}/api/fleet/status"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://api.maximax-advertising.com"
    },
    {
      "key": "apiKey",
      "value": "demo-key-001"
    }
  ]
}
```

---

## Support

For API support and questions:
- Email: api-support@maximax-advertising.com
- Documentation: https://docs.maximax-advertising.com
- Status Page: https://status.maximax-advertising.com

## License

Copyright © 2024 MaxiMax Mobile Advertising. All rights reserved.