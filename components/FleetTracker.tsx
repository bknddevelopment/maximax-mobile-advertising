import React, { useState, useEffect, useRef } from 'react';

interface Truck {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'maintenance';
  location: { lat: number; lng: number };
  speed: number;
  route: string;
  driver: string;
  impressions: number;
  battery: number;
  nextStop: string;
  eta: string;
}

interface Route {
  id: string;
  name: string;
  path: { lat: number; lng: number }[];
  color: string;
}

const FleetTracker: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [mapView, setMapView] = useState<'map' | 'satellite' | 'hybrid'>('map');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [trucks, setTrucks] = useState<Truck[]>([
    {
      id: 'MX-001',
      name: 'Miami Express',
      status: 'active',
      location: { lat: 25.7617, lng: -80.1918 },
      speed: 35,
      route: 'Downtown Miami Loop',
      driver: 'Carlos Rodriguez',
      impressions: 12456,
      battery: 85,
      nextStop: 'Brickell Ave',
      eta: '14:30'
    },
    {
      id: 'MX-002',
      name: 'Beach Cruiser',
      status: 'active',
      location: { lat: 25.7906, lng: -80.1300 },
      speed: 28,
      route: 'Miami Beach Circuit',
      driver: 'Maria Santos',
      impressions: 18923,
      battery: 72,
      nextStop: 'Ocean Drive',
      eta: '14:45'
    },
    {
      id: 'MX-003',
      name: 'Wynwood Wonder',
      status: 'active',
      location: { lat: 25.8000, lng: -80.1990 },
      speed: 22,
      route: 'Wynwood Arts District',
      driver: 'James Wilson',
      impressions: 9845,
      battery: 91,
      nextStop: 'Wynwood Walls',
      eta: '14:35'
    },
    {
      id: 'MX-004',
      name: 'Aventura Star',
      status: 'idle',
      location: { lat: 25.9580, lng: -80.1420 },
      speed: 0,
      route: 'Aventura Mall Loop',
      driver: 'Sarah Johnson',
      impressions: 24567,
      battery: 100,
      nextStop: 'Break Time',
      eta: '15:00'
    },
    {
      id: 'MX-005',
      name: 'Coral Gables Elite',
      status: 'maintenance',
      location: { lat: 25.7215, lng: -80.2684 },
      speed: 0,
      route: 'Coral Gables Premium',
      driver: 'Michael Brown',
      impressions: 31245,
      battery: 45,
      nextStop: 'Service Center',
      eta: '16:00'
    }
  ]);

  const routes: Route[] = [
    {
      id: 'downtown',
      name: 'Downtown Miami Loop',
      color: '#EC008C',
      path: [
        { lat: 25.7700, lng: -80.1900 },
        { lat: 25.7650, lng: -80.1880 },
        { lat: 25.7600, lng: -80.1890 },
        { lat: 25.7550, lng: -80.1900 },
        { lat: 25.7600, lng: -80.1940 },
        { lat: 25.7650, lng: -80.1920 },
        { lat: 25.7700, lng: -80.1910 }
      ]
    },
    {
      id: 'beach',
      name: 'Miami Beach Circuit',
      color: '#00AEEF',
      path: [
        { lat: 25.7906, lng: -80.1300 },
        { lat: 25.7850, lng: -80.1280 },
        { lat: 25.7800, lng: -80.1290 },
        { lat: 25.7750, lng: -80.1300 },
        { lat: 25.7800, lng: -80.1380 },
        { lat: 25.7850, lng: -80.1350 },
        { lat: 25.7900, lng: -80.1320 }
      ]
    }
  ];

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        updateTruckPositions();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const updateTruckPositions = () => {
    setTrucks(prevTrucks =>
      prevTrucks.map(truck => {
        if (truck.status === 'active') {
          // Simulate movement
          const latChange = (Math.random() - 0.5) * 0.001;
          const lngChange = (Math.random() - 0.5) * 0.001;
          const speedChange = Math.random() * 10 - 5;
          const impressionIncrease = Math.floor(Math.random() * 100);
          const batteryDecrease = Math.random() * 0.5;

          return {
            ...truck,
            location: {
              lat: truck.location.lat + latChange,
              lng: truck.location.lng + lngChange
            },
            speed: Math.max(0, Math.min(50, truck.speed + speedChange)),
            impressions: truck.impressions + impressionIncrease,
            battery: Math.max(0, truck.battery - batteryDecrease)
          };
        }
        return truck;
      })
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'idle': return '#F59E0B';
      case 'maintenance': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const filteredTrucks = trucks.filter(truck => {
    const matchesStatus = filterStatus === 'all' || truck.status === filterStatus;
    const matchesSearch = truck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          truck.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          truck.driver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedTruckData = trucks.find(t => t.id === selectedTruck);

  return (
    <div className="fleet-tracker">
      <div className="tracker-header">
        <h2>Live Fleet Tracker</h2>
        <p>Real-time monitoring of all MaxiMax mobile billboard trucks</p>
      </div>

      <div className="tracker-container">
        <div className="tracker-sidebar">
          <div className="sidebar-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search trucks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="filter-buttons">
              <button
                className={filterStatus === 'all' ? 'active' : ''}
                onClick={() => setFilterStatus('all')}
              >
                All ({trucks.length})
              </button>
              <button
                className={filterStatus === 'active' ? 'active' : ''}
                onClick={() => setFilterStatus('active')}
              >
                Active ({trucks.filter(t => t.status === 'active').length})
              </button>
              <button
                className={filterStatus === 'idle' ? 'active' : ''}
                onClick={() => setFilterStatus('idle')}
              >
                Idle ({trucks.filter(t => t.status === 'idle').length})
              </button>
              <button
                className={filterStatus === 'maintenance' ? 'active' : ''}
                onClick={() => setFilterStatus('maintenance')}
              >
                Maintenance ({trucks.filter(t => t.status === 'maintenance').length})
              </button>
            </div>

            <div className="auto-refresh">
              <label>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto-refresh (5s)
              </label>
            </div>
          </div>

          <div className="trucks-list">
            {filteredTrucks.map(truck => (
              <div
                key={truck.id}
                className={`truck-card ${selectedTruck === truck.id ? 'selected' : ''}`}
                onClick={() => setSelectedTruck(truck.id)}
              >
                <div className="truck-header">
                  <div className="truck-info">
                    <h4>{truck.name}</h4>
                    <span className="truck-id">{truck.id}</span>
                  </div>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(truck.status) }}
                  >
                    {truck.status}
                  </div>
                </div>

                <div className="truck-metrics">
                  <div className="metric">
                    <span className="metric-icon">📍</span>
                    <span className="metric-value">{truck.route}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-icon">👁</span>
                    <span className="metric-value">{truck.impressions.toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-icon">🚗</span>
                    <span className="metric-value">{truck.speed} mph</span>
                  </div>
                  <div className="metric">
                    <span className="metric-icon">🔋</span>
                    <span className="metric-value">{truck.battery}%</span>
                  </div>
                </div>

                <div className="truck-footer">
                  <span className="driver">Driver: {truck.driver}</span>
                  <span className="next-stop">Next: {truck.nextStop}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="map-section">
          <div className="map-controls">
            <div className="view-buttons">
              <button
                className={mapView === 'map' ? 'active' : ''}
                onClick={() => setMapView('map')}
              >
                Map
              </button>
              <button
                className={mapView === 'satellite' ? 'active' : ''}
                onClick={() => setMapView('satellite')}
              >
                Satellite
              </button>
              <button
                className={mapView === 'hybrid' ? 'active' : ''}
                onClick={() => setMapView('hybrid')}
              >
                Hybrid
              </button>
            </div>

            <div className="map-tools">
              <button className="tool-btn" title="Center Map">
                <span>⊕</span>
              </button>
              <button className="tool-btn" title="Traffic Layer">
                <span>🚦</span>
              </button>
              <button className="tool-btn" title="Heat Map">
                <span>🔥</span>
              </button>
              <button className="tool-btn" title="Fullscreen">
                <span>⛶</span>
              </button>
            </div>
          </div>

          <div ref={mapRef} className="map-container">
            {/* Map visualization */}
            <svg className="map-svg" viewBox="0 0 800 600">
              {/* Draw routes */}
              {routes.map(route => (
                <g key={route.id}>
                  <polyline
                    points={route.path.map(p => 
                      `${(p.lng + 80.3) * 2000},${(26 - p.lat) * 2000}`
                    ).join(' ')}
                    stroke={route.color}
                    strokeWidth="3"
                    fill="none"
                    opacity="0.5"
                    strokeDasharray="5,5"
                  />
                </g>
              ))}

              {/* Draw trucks */}
              {filteredTrucks.map(truck => {
                const x = (truck.location.lng + 80.3) * 2000;
                const y = (26 - truck.location.lat) * 2000;
                
                return (
                  <g key={truck.id}>
                    {/* Pulse animation for active trucks */}
                    {truck.status === 'active' && (
                      <circle
                        cx={x}
                        cy={y}
                        r="20"
                        fill={getStatusColor(truck.status)}
                        opacity="0.3"
                        className="pulse-circle"
                      />
                    )}
                    
                    {/* Truck icon */}
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill={getStatusColor(truck.status)}
                      stroke="white"
                      strokeWidth="2"
                      className="truck-marker"
                      onClick={() => setSelectedTruck(truck.id)}
                    />
                    
                    {/* Truck label */}
                    <text
                      x={x}
                      y={y - 15}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#374151"
                    >
                      {truck.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map overlay info */}
            <div className="map-overlay">
              <div className="overlay-stats">
                <div className="stat">
                  <span className="stat-label">Total Fleet</span>
                  <span className="stat-value">{trucks.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Active Now</span>
                  <span className="stat-value">{trucks.filter(t => t.status === 'active').length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Today's Impressions</span>
                  <span className="stat-value">
                    {trucks.reduce((sum, t) => sum + t.impressions, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {selectedTruckData && (
            <div className="truck-details">
              <h3>Truck Details: {selectedTruckData.name}</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">ID</span>
                  <span className="detail-value">{selectedTruckData.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span 
                    className="detail-value status"
                    style={{ color: getStatusColor(selectedTruckData.status) }}
                  >
                    {selectedTruckData.status.toUpperCase()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Driver</span>
                  <span className="detail-value">{selectedTruckData.driver}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current Route</span>
                  <span className="detail-value">{selectedTruckData.route}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Speed</span>
                  <span className="detail-value">{selectedTruckData.speed} mph</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Battery</span>
                  <span className="detail-value">
                    <div className="battery-bar">
                      <div 
                        className="battery-fill"
                        style={{ 
                          width: `${selectedTruckData.battery}%`,
                          backgroundColor: selectedTruckData.battery > 50 ? '#10B981' : 
                                         selectedTruckData.battery > 20 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                    {selectedTruckData.battery}%
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Today's Impressions</span>
                  <span className="detail-value">{selectedTruckData.impressions.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Next Stop</span>
                  <span className="detail-value">{selectedTruckData.nextStop}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ETA</span>
                  <span className="detail-value">{selectedTruckData.eta}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">
                    {selectedTruckData.location.lat.toFixed(4)}°N, {Math.abs(selectedTruckData.location.lng).toFixed(4)}°W
                  </span>
                </div>
              </div>
              <div className="detail-actions">
                <button className="action-btn primary">Send Message</button>
                <button className="action-btn">View History</button>
                <button className="action-btn">Route Details</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .fleet-tracker {
          background: linear-gradient(135deg, #F8F9FA, #E9ECEF);
          border-radius: 20px;
          padding: 30px;
          margin: 20px 0;
        }

        .tracker-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .tracker-header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }

        .tracker-header p {
          color: #6B7280;
          font-size: 1.125rem;
        }

        .tracker-container {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 20px;
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .tracker-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sidebar-controls {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .search-box {
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 12px 40px 12px 15px;
          border: 2px solid #E5E7EB;
          border-radius: 10px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #EC008C;
        }

        .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
        }

        .filter-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .filter-buttons button {
          padding: 8px 12px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          color: #6B7280;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-buttons button:hover {
          border-color: #00AEEF;
        }

        .filter-buttons button.active {
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          color: white;
          border-color: transparent;
        }

        .auto-refresh label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #6B7280;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .trucks-list {
          flex: 1;
          overflow-y: auto;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .truck-card {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .truck-card:hover {
          border-color: #00AEEF;
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(0, 174, 239, 0.2);
        }

        .truck-card.selected {
          background: linear-gradient(135deg, #EC008C10, #00AEEF10);
          border-color: #EC008C;
        }

        .truck-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .truck-info h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #374151;
          margin: 0;
        }

        .truck-id {
          font-size: 0.75rem;
          color: #9CA3AF;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .truck-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: #6B7280;
        }

        .metric-icon {
          font-size: 0.875rem;
        }

        .truck-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #9CA3AF;
        }

        .map-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .map-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .view-buttons {
          display: flex;
          gap: 5px;
          background: #F8F9FA;
          padding: 5px;
          border-radius: 10px;
        }

        .view-buttons button {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #6B7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-buttons button.active {
          background: white;
          color: #EC008C;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .map-tools {
          display: flex;
          gap: 8px;
        }

        .tool-btn {
          width: 36px;
          height: 36px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.2rem;
        }

        .tool-btn:hover {
          border-color: #EC008C;
          color: #EC008C;
        }

        .map-container {
          position: relative;
          height: 500px;
          background: linear-gradient(135deg, #E0F2FE, #DBEAFE);
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #E5E7EB;
        }

        .map-svg {
          width: 100%;
          height: 100%;
        }

        .pulse-circle {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { r: 20; opacity: 0.3; }
          50% { r: 30; opacity: 0.1; }
        }

        .truck-marker {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .truck-marker:hover {
          r: 12;
        }

        .map-overlay {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 10px;
          padding: 15px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .overlay-stats {
          display: flex;
          gap: 20px;
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #9CA3AF;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
        }

        .truck-details {
          background: #F8F9FA;
          border-radius: 12px;
          padding: 20px;
        }

        .truck-details h3 {
          font-size: 1.125rem;
          color: #374151;
          margin-bottom: 15px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
        }

        .detail-item.full-width {
          grid-column: span 2;
        }

        .detail-label {
          font-size: 0.875rem;
          color: #6B7280;
        }

        .detail-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .detail-value.status {
          text-transform: uppercase;
        }

        .battery-bar {
          display: inline-block;
          width: 60px;
          height: 8px;
          background: #E5E7EB;
          border-radius: 4px;
          overflow: hidden;
          margin-right: 8px;
        }

        .battery-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .detail-actions {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          flex: 1;
          padding: 10px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          color: #6B7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          border-color: #00AEEF;
          color: #00AEEF;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          color: white;
          border: none;
        }

        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(236, 0, 140, 0.3);
        }

        @media (max-width: 1024px) {
          .tracker-container {
            grid-template-columns: 1fr;
          }

          .trucks-list {
            max-height: 300px;
          }
        }

        @media (max-width: 768px) {
          .filter-buttons {
            grid-template-columns: 1fr;
          }

          .overlay-stats {
            flex-direction: column;
            gap: 10px;
          }

          .detail-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FleetTracker;