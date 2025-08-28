import React, { useState, useEffect, useRef, useCallback } from 'react';

interface RouteData {
  name: string;
  impressions: number;
  hotspots: string[];
  peakHours: number[];
  coordinates: { lat: number; lng: number }[];
  color: string;
}

interface AnimatedTruck {
  id: string;
  position: { x: number; y: number };
  routeIndex: number;
  progress: number;
  impressions: number;
}

const RouteSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string>('miami-beach');
  const [isSimulating, setIsSimulating] = useState(false);
  const [totalImpressions, setTotalImpressions] = useState(0);
  const [currentHotspot, setCurrentHotspot] = useState('');
  const [trucks, setTrucks] = useState<AnimatedTruck[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'stats'>('map');

  const routes: Record<string, RouteData> = {
    'miami-beach': {
      name: 'Miami Beach Circuit',
      impressions: 75000,
      hotspots: ['Lincoln Road', 'Ocean Drive', 'Collins Ave', 'South Pointe'],
      peakHours: [11, 14, 18, 20],
      coordinates: [
        { lat: 25.7906, lng: -80.1300 },
        { lat: 25.7850, lng: -80.1280 },
        { lat: 25.7800, lng: -80.1290 },
        { lat: 25.7750, lng: -80.1300 },
        { lat: 25.7700, lng: -80.1320 },
        { lat: 25.7650, lng: -80.1350 },
        { lat: 25.7700, lng: -80.1380 },
        { lat: 25.7750, lng: -80.1400 },
        { lat: 25.7800, lng: -80.1380 },
        { lat: 25.7850, lng: -80.1350 },
        { lat: 25.7900, lng: -80.1320 },
      ],
      color: '#EC008C'
    },
    'downtown-miami': {
      name: 'Downtown Business District',
      impressions: 95000,
      hotspots: ['Brickell Ave', 'Bayside', 'AAA Arena', 'Bayfront Park'],
      peakHours: [8, 12, 17, 19],
      coordinates: [
        { lat: 25.7700, lng: -80.1900 },
        { lat: 25.7650, lng: -80.1880 },
        { lat: 25.7600, lng: -80.1890 },
        { lat: 25.7550, lng: -80.1900 },
        { lat: 25.7500, lng: -80.1920 },
        { lat: 25.7550, lng: -80.1950 },
        { lat: 25.7600, lng: -80.1940 },
        { lat: 25.7650, lng: -80.1920 },
        { lat: 25.7700, lng: -80.1910 },
      ],
      color: '#00AEEF'
    },
    'wynwood-arts': {
      name: 'Wynwood Arts District',
      impressions: 65000,
      hotspots: ['Wynwood Walls', '2nd Avenue', 'NW 23rd St', 'Midtown'],
      peakHours: [13, 16, 19, 22],
      coordinates: [
        { lat: 25.8000, lng: -80.1990 },
        { lat: 25.7980, lng: -80.1970 },
        { lat: 25.7960, lng: -80.1950 },
        { lat: 25.7940, lng: -80.1930 },
        { lat: 25.7920, lng: -80.1950 },
        { lat: 25.7940, lng: -80.1970 },
        { lat: 25.7960, lng: -80.1990 },
        { lat: 25.7980, lng: -80.2010 },
        { lat: 25.8000, lng: -80.2000 },
      ],
      color: '#FF6B9D'
    },
    'aventura-mall': {
      name: 'Aventura Shopping Loop',
      impressions: 85000,
      hotspots: ['Aventura Mall', 'Biscayne Blvd', 'Country Club Dr', 'Turnberry'],
      peakHours: [10, 14, 16, 18],
      coordinates: [
        { lat: 25.9580, lng: -80.1420 },
        { lat: 25.9550, lng: -80.1400 },
        { lat: 25.9520, lng: -80.1380 },
        { lat: 25.9490, lng: -80.1360 },
        { lat: 25.9460, lng: -80.1380 },
        { lat: 25.9490, lng: -80.1400 },
        { lat: 25.9520, lng: -80.1420 },
        { lat: 25.9550, lng: -80.1440 },
        { lat: 25.9580, lng: -80.1430 },
      ],
      color: '#7209B7'
    }
  };

  const initializeTrucks = useCallback(() => {
    const route = routes[selectedRoute];
    const newTrucks: AnimatedTruck[] = [
      {
        id: 'truck-1',
        position: { x: 0, y: 0 },
        routeIndex: 0,
        progress: 0,
        impressions: 0
      },
      {
        id: 'truck-2',
        position: { x: 0, y: 0 },
        routeIndex: Math.floor(route.coordinates.length / 2),
        progress: 0,
        impressions: 0
      }
    ];
    setTrucks(newTrucks);
  }, [selectedRoute]);

  const drawMap = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#F8F9FA');
    gradient.addColorStop(1, '#E9ECEF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const route = routes[selectedRoute];
    const padding = 50;
    
    // Calculate bounds
    const lats = route.coordinates.map(c => c.lat);
    const lngs = route.coordinates.map(c => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Convert coordinates to canvas positions
    const toCanvasX = (lng: number) => {
      return padding + ((lng - minLng) / (maxLng - minLng)) * (canvas.width - padding * 2);
    };

    const toCanvasY = (lat: number) => {
      return padding + ((maxLat - lat) / (maxLat - minLat)) * (canvas.height - padding * 2);
    };

    // Draw route path
    ctx.strokeStyle = route.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);
    
    ctx.beginPath();
    route.coordinates.forEach((coord, index) => {
      const x = toCanvasX(coord.lng);
      const y = toCanvasY(coord.lat);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw hotspots
    route.coordinates.forEach((coord, index) => {
      const x = toCanvasX(coord.lng);
      const y = toCanvasY(coord.lat);
      
      // Draw hotspot circle
      if (index < route.hotspots.length) {
        // Pulsing effect
        const pulseSize = Math.sin(Date.now() * 0.003) * 5 + 20;
        
        ctx.fillStyle = `${route.color}20`;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = route.color;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw hotspot label
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(route.hotspots[index], x, y - 25);
      }
    });

    // Draw animated trucks
    trucks.forEach((truck) => {
      const routeLength = route.coordinates.length;
      const currentIndex = truck.routeIndex % routeLength;
      const nextIndex = (truck.routeIndex + 1) % routeLength;
      
      const currentCoord = route.coordinates[currentIndex];
      const nextCoord = route.coordinates[nextIndex];
      
      const currentX = toCanvasX(currentCoord.lng);
      const currentY = toCanvasY(currentCoord.lat);
      const nextX = toCanvasX(nextCoord.lng);
      const nextY = toCanvasY(nextCoord.lat);
      
      // Interpolate position
      const x = currentX + (nextX - currentX) * truck.progress;
      const y = currentY + (nextY - currentY) * truck.progress;
      
      // Draw truck
      const angle = Math.atan2(nextY - currentY, nextX - currentX);
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Truck body
      const truckGradient = ctx.createLinearGradient(-15, -8, 15, 8);
      truckGradient.addColorStop(0, route.color);
      truckGradient.addColorStop(1, `${route.color}CC`);
      
      ctx.fillStyle = truckGradient;
      ctx.fillRect(-15, -8, 30, 16);
      
      // Billboard display
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-10, -6, 15, 12);
      
      // LED effect
      ctx.fillStyle = route.color;
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LED', -2.5, 0);
      
      // Windshield
      ctx.fillStyle = '#4A5568';
      ctx.fillRect(10, -6, 5, 12);
      
      ctx.restore();
      
      // Draw impression counter above truck
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(truck.impressions).toLocaleString()}`, x, y - 20);
    });

    // Draw stats overlay
    const statsHeight = 100;
    const statsY = canvas.height - statsHeight - 20;
    
    // Stats background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = route.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(20, statsY, canvas.width - 40, statsHeight, 10);
    ctx.fill();
    ctx.stroke();
    
    // Stats content
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(route.name, 40, statsY + 30);
    
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Total Impressions: ${totalImpressions.toLocaleString()}`, 40, statsY + 55);
    ctx.fillText(`Current Hotspot: ${currentHotspot || 'En Route'}`, 40, statsY + 80);
    
    // Speed indicator
    ctx.textAlign = 'right';
    ctx.fillText(`Active Trucks: ${trucks.length}`, canvas.width - 40, statsY + 55);
    ctx.fillText(`Coverage: ${Math.round((totalImpressions / route.impressions) * 100)}%`, canvas.width - 40, statsY + 80);
  }, [selectedRoute, trucks, totalImpressions, currentHotspot]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isSimulating) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const route = routes[selectedRoute];
    
    // Update trucks
    setTrucks(prevTrucks => {
      return prevTrucks.map(truck => {
        const newProgress = truck.progress + 0.02;
        const impressionRate = 50 + Math.random() * 50;
        
        if (newProgress >= 1) {
          const nextIndex = (truck.routeIndex + 1) % route.coordinates.length;
          
          // Update current hotspot
          if (nextIndex < route.hotspots.length) {
            setCurrentHotspot(route.hotspots[nextIndex]);
          }
          
          return {
            ...truck,
            routeIndex: nextIndex,
            progress: 0,
            impressions: truck.impressions + impressionRate
          };
        }
        
        return {
          ...truck,
          progress: newProgress,
          impressions: truck.impressions + impressionRate * 0.02
        };
      });
    });

    // Update total impressions
    setTotalImpressions(prev => {
      const increment = 20 + Math.random() * 30;
      return Math.min(prev + increment, route.impressions);
    });

    drawMap(ctx, canvas);
    animationRef.current = requestAnimationFrame(animate);
  }, [isSimulating, selectedRoute, drawMap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initial draw
    drawMap(ctx, canvas);

    // Initialize trucks when route changes
    initializeTrucks();
  }, [selectedRoute, drawMap, initializeTrucks]);

  useEffect(() => {
    if (isSimulating) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulating, animate]);

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setTotalImpressions(0);
    initializeTrucks();
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
  };

  const handleRouteChange = (routeId: string) => {
    setSelectedRoute(routeId);
    setIsSimulating(false);
    setTotalImpressions(0);
    setCurrentHotspot('');
  };

  return (
    <div className="route-simulator">
      <div className="simulator-header">
        <h2>Live Route Simulator</h2>
        <p>Experience real-time mobile billboard tracking and impression analytics</p>
      </div>

      <div className="simulator-controls">
        <div className="route-selector">
          <label>Select Route:</label>
          <div className="route-buttons">
            {Object.entries(routes).map(([id, route]) => (
              <button
                key={id}
                className={`route-btn ${selectedRoute === id ? 'active' : ''}`}
                onClick={() => handleRouteChange(id)}
                style={{ 
                  borderColor: route.color,
                  backgroundColor: selectedRoute === id ? route.color : 'transparent',
                  color: selectedRoute === id ? '#FFFFFF' : route.color
                }}
              >
                {route.name}
              </button>
            ))}
          </div>
        </div>

        <div className="simulation-controls">
          {!isSimulating ? (
            <button className="control-btn start" onClick={handleStartSimulation}>
              <span className="btn-icon">▶</span> Start Simulation
            </button>
          ) : (
            <button className="control-btn stop" onClick={handleStopSimulation}>
              <span className="btn-icon">⏸</span> Pause Simulation
            </button>
          )}
          <button 
            className="control-btn reset" 
            onClick={() => {
              setTotalImpressions(0);
              setCurrentHotspot('');
              initializeTrucks();
            }}
          >
            <span className="btn-icon">↺</span> Reset
          </button>
        </div>

        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            Map View
          </button>
          <button 
            className={`view-btn ${viewMode === 'stats' ? 'active' : ''}`}
            onClick={() => setViewMode('stats')}
          >
            Statistics
          </button>
        </div>
      </div>

      <div className="simulator-container">
        {viewMode === 'map' ? (
          <canvas 
            ref={canvasRef}
            className="route-canvas"
            width={800}
            height={600}
          />
        ) : (
          <div className="stats-view">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Route Performance</h3>
                <div className="stat-value">{routes[selectedRoute].name}</div>
                <div className="stat-progress">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${(totalImpressions / routes[selectedRoute].impressions) * 100}%`,
                      backgroundColor: routes[selectedRoute].color
                    }}
                  />
                </div>
                <div className="stat-label">
                  {totalImpressions.toLocaleString()} / {routes[selectedRoute].impressions.toLocaleString()} impressions
                </div>
              </div>

              <div className="stat-card">
                <h3>Peak Hours</h3>
                <div className="peak-hours">
                  {routes[selectedRoute].peakHours.map(hour => (
                    <div key={hour} className="peak-hour">
                      <div className="hour-bar" style={{ 
                        height: `${(hour / 24) * 100}%`,
                        backgroundColor: routes[selectedRoute].color 
                      }} />
                      <span>{hour}:00</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stat-card">
                <h3>Hotspots Coverage</h3>
                <ul className="hotspot-list">
                  {routes[selectedRoute].hotspots.map((hotspot, index) => (
                    <li key={index} className={currentHotspot === hotspot ? 'active' : ''}>
                      <span className="hotspot-indicator" style={{ backgroundColor: routes[selectedRoute].color }} />
                      {hotspot}
                      <span className="hotspot-impressions">
                        {Math.floor(Math.random() * 5000 + 10000).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="stat-card">
                <h3>Fleet Status</h3>
                <div className="fleet-status">
                  {trucks.map(truck => (
                    <div key={truck.id} className="truck-status">
                      <span className="truck-id">{truck.id.replace('-', ' ').toUpperCase()}</span>
                      <div className="status-indicator online" />
                      <span className="truck-impressions">
                        {Math.floor(truck.impressions).toLocaleString()} views
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .route-simulator {
          background: linear-gradient(135deg, #F8F9FA, #E9ECEF);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          margin: 20px 0;
        }

        .simulator-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .simulator-header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }

        .simulator-header p {
          color: #6B7280;
          font-size: 1.125rem;
        }

        .simulator-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .route-selector {
          flex: 1;
          min-width: 300px;
        }

        .route-selector label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
        }

        .route-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .route-btn {
          padding: 10px 20px;
          border: 2px solid;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .route-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .route-btn.active {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .simulation-controls {
          display: flex;
          gap: 10px;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .control-btn.start {
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
        }

        .control-btn.stop {
          background: linear-gradient(135deg, #F59E0B, #D97706);
          color: white;
        }

        .control-btn.reset {
          background: linear-gradient(135deg, #6B7280, #4B5563);
          color: white;
        }

        .control-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .btn-icon {
          font-size: 1.25rem;
        }

        .view-toggle {
          display: flex;
          gap: 5px;
          background: rgba(255, 255, 255, 0.5);
          padding: 5px;
          border-radius: 25px;
        }

        .view-btn {
          padding: 8px 20px;
          border: none;
          border-radius: 20px;
          background: transparent;
          color: #6B7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-btn.active {
          background: white;
          color: #EC008C;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .simulator-container {
          background: white;
          border-radius: 15px;
          padding: 20px;
          min-height: 600px;
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .route-canvas {
          width: 100%;
          height: 600px;
          border-radius: 10px;
        }

        .stats-view {
          padding: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: linear-gradient(135deg, #F8F9FA, #FFFFFF);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 15px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #EC008C;
          margin-bottom: 10px;
        }

        .stat-progress {
          height: 8px;
          background: #E5E7EB;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-bar {
          height: 100%;
          transition: width 0.5s ease;
          border-radius: 4px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6B7280;
        }

        .peak-hours {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 120px;
          padding: 10px 0;
        }

        .peak-hour {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .hour-bar {
          width: 30px;
          background: #EC008C;
          border-radius: 4px 4px 0 0;
          margin-bottom: 5px;
          transition: height 0.3s ease;
        }

        .peak-hour span {
          font-size: 0.75rem;
          color: #6B7280;
        }

        .hotspot-list {
          list-style: none;
          padding: 0;
        }

        .hotspot-list li {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 8px;
          background: #F8F9FA;
          transition: all 0.3s ease;
        }

        .hotspot-list li.active {
          background: linear-gradient(135deg, #EC008C20, #00AEEF20);
          transform: translateX(5px);
        }

        .hotspot-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 12px;
        }

        .hotspot-impressions {
          margin-left: auto;
          font-weight: 600;
          color: #374151;
        }

        .fleet-status {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .truck-status {
          display: flex;
          align-items: center;
          padding: 12px;
          background: #F8F9FA;
          border-radius: 8px;
          gap: 12px;
        }

        .truck-id {
          font-weight: 600;
          color: #374151;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-indicator.online {
          background: #10B981;
        }

        .truck-impressions {
          margin-left: auto;
          color: #6B7280;
          font-size: 0.875rem;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .simulator-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .route-selector {
            min-width: 100%;
          }

          .simulation-controls {
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RouteSimulator;