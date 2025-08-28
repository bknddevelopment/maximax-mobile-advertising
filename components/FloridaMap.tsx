// FloridaMap Component
// South Florida map with animated heat zones and route visualization

const FloridaMap = () => {
  const heatZones = [
    { name: 'Miami Beach', cx: 520, cy: 420, intensity: 0.9, impressions: '75K' },
    { name: 'Downtown Miami', cx: 480, cy: 400, intensity: 0.85, impressions: '68K' },
    { name: 'Brickell', cx: 470, cy: 410, intensity: 0.88, impressions: '71K' },
    { name: 'Coral Gables', cx: 450, cy: 420, intensity: 0.75, impressions: '52K' },
    { name: 'Aventura', cx: 500, cy: 360, intensity: 0.8, impressions: '61K' },
    { name: 'Fort Lauderdale', cx: 480, cy: 320, intensity: 0.82, impressions: '64K' },
    { name: 'Boca Raton', cx: 460, cy: 270, intensity: 0.7, impressions: '48K' },
    { name: 'West Palm Beach', cx: 440, cy: 220, intensity: 0.72, impressions: '50K' }
  ];

  const routes = [
    { 
      id: 'beach-route',
      name: 'Beach Circuit',
      path: 'M520,420 Q510,390 500,360 T480,320',
      color: '#00AEEF'
    },
    {
      id: 'downtown-route',
      name: 'Downtown Loop',
      path: 'M480,400 Q460,390 450,420 T470,410',
      color: '#EC008C'
    }
  ];

  return (
    <svg 
      className="florida-map"
      viewBox="0 0 600 500" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', maxWidth: '600px' }}
    >
      <defs>
        {/* Gradient definitions */}
        <radialGradient id="heatGradientHigh">
          <stop offset="0%" stopColor="#EC008C" stopOpacity="0.8"/>
          <stop offset="50%" stopColor="#EC008C" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#EC008C" stopOpacity="0"/>
        </radialGradient>
        
        <radialGradient id="heatGradientMedium">
          <stop offset="0%" stopColor="#00AEEF" stopOpacity="0.7"/>
          <stop offset="50%" stopColor="#00AEEF" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#00AEEF" stopOpacity="0"/>
        </radialGradient>

        {/* Glow filter */}
        <filter id="mapGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Pattern for water */}
        <pattern id="waterPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="#00AEEF" opacity="0.2">
            <animate attributeName="r" values="1;2;1" dur="3s" repeatCount="indefinite"/>
          </circle>
        </pattern>
      </defs>

      {/* Background Ocean */}
      <rect x="0" y="0" width="600" height="500" fill="url(#waterPattern)" opacity="0.1"/>

      {/* South Florida Outline (simplified) */}
      <g className="florida-outline">
        <path 
          d="M 380,150 
             Q 420,140 450,160
             L 460,200
             L 470,250
             L 480,300
             Q 490,350 500,380
             L 510,410
             Q 520,430 530,450
             L 520,470
             Q 500,480 480,470
             L 460,450
             Q 440,430 420,410
             L 400,380
             L 380,350
             L 370,300
             L 365,250
             L 370,200
             Z"
          fill="#1A1A1A"
          opacity="0.1"
          stroke="#00AEEF"
          strokeWidth="2"
          filter="url(#mapGlow)"
        />
        
        {/* Coastline glow effect */}
        <path 
          d="M 380,150 
             Q 420,140 450,160
             L 460,200
             L 470,250
             L 480,300
             Q 490,350 500,380
             L 510,410
             Q 520,430 530,450"
          fill="none"
          stroke="#00AEEF"
          strokeWidth="3"
          opacity="0.6"
          strokeDasharray="10,5"
        >
          <animate 
            attributeName="stroke-dashoffset" 
            values="0;15" 
            dur="2s" 
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* Animated Routes */}
      <g className="route-paths">
        {routes.map((route) => (
          <g key={route.id}>
            <path
              d={route.path}
              fill="none"
              stroke={route.color}
              strokeWidth="3"
              opacity="0.4"
              strokeDasharray="10,5"
            >
              <animate 
                attributeName="stroke-dashoffset" 
                values="0;15" 
                dur="1.5s" 
                repeatCount="indefinite"
              />
            </path>
            {/* Moving truck icon along route */}
            <circle r="5" fill={route.color}>
              <animateMotion
                dur="10s"
                repeatCount="indefinite"
                path={route.path}
                rotate="auto"
              />
            </circle>
          </g>
        ))}
      </g>

      {/* Heat Zones */}
      <g className="heat-zones">
        {heatZones.map((zone, index) => (
          <g key={zone.name} className="heat-zone">
            {/* Pulsing heat circle */}
            <circle
              cx={zone.cx}
              cy={zone.cy}
              r="30"
              fill={zone.intensity > 0.8 ? "url(#heatGradientHigh)" : "url(#heatGradientMedium)"}
            >
              <animate
                attributeName="r"
                values="25;40;25"
                dur={`${3 + index * 0.2}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values={`${zone.intensity};${zone.intensity * 0.5};${zone.intensity}`}
                dur={`${3 + index * 0.2}s`}
                repeatCount="indefinite"
              />
            </circle>
            
            {/* Center dot */}
            <circle
              cx={zone.cx}
              cy={zone.cy}
              r="5"
              fill={zone.intensity > 0.8 ? "#EC008C" : "#00AEEF"}
              filter="url(#mapGlow)"
            />
            
            {/* Zone label */}
            <text
              x={zone.cx}
              y={zone.cy - 40}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="600"
              fontFamily="Montserrat, sans-serif"
              opacity="0"
              className="zone-label"
            >
              {zone.name}
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="4s"
                begin={`${index * 0.5}s`}
                repeatCount="indefinite"
              />
            </text>
            
            {/* Impressions count */}
            <text
              x={zone.cx}
              y={zone.cy - 25}
              textAnchor="middle"
              fill="#00AEEF"
              fontSize="10"
              fontWeight="500"
              fontFamily="Inter, sans-serif"
              opacity="0"
            >
              {zone.impressions}/day
              <animate
                attributeName="opacity"
                values="0;0.8;0.8;0"
                dur="4s"
                begin={`${index * 0.5 + 0.5}s`}
                repeatCount="indefinite"
              />
            </text>
          </g>
        ))}
      </g>

      {/* Major Roads/Highways */}
      <g className="highways" opacity="0.3">
        <line x1="440" y1="150" x2="480" y2="450" stroke="#666" strokeWidth="2" strokeDasharray="5,3"/>
        <line x1="380" y1="200" x2="530" y2="400" stroke="#666" strokeWidth="2" strokeDasharray="5,3"/>
        <text x="445" y="300" fill="#999" fontSize="10" fontFamily="Inter, sans-serif">I-95</text>
      </g>

      {/* Legend */}
      <g className="map-legend" transform="translate(20, 430)">
        <rect x="0" y="0" width="150" height="60" fill="#1A1A1A" opacity="0.8" rx="5"/>
        <text x="10" y="20" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="Montserrat, sans-serif">
          Traffic Density
        </text>
        <circle cx="20" cy="35" r="5" fill="#EC008C"/>
        <text x="30" y="40" fill="#FFFFFF" fontSize="10" fontFamily="Inter, sans-serif">High (70K+)</text>
        <circle cx="20" cy="50" r="5" fill="#00AEEF"/>
        <text x="30" y="55" fill="#FFFFFF" fontSize="10" fontFamily="Inter, sans-serif">Medium (40-70K)</text>
      </g>

      {/* Interactive tooltip area (placeholder for hover interactions) */}
      <g className="tooltip-layer" pointerEvents="none">
        {/* Tooltip content will be dynamically inserted here */}
      </g>
    </svg>
  );
};

// Vanilla JavaScript implementation with interactivity
function createFloridaMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 600 500");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "auto");
  svg.style.maxWidth = "600px";

  // Create defs for gradients and filters
  const defs = document.createElementNS(svgNS, "defs");
  
  // Heat gradient high
  const gradientHigh = document.createElementNS(svgNS, "radialGradient");
  gradientHigh.setAttribute("id", "heatGradientHigh");
  
  const stopHigh1 = document.createElementNS(svgNS, "stop");
  stopHigh1.setAttribute("offset", "0%");
  stopHigh1.setAttribute("stop-color", "#EC008C");
  stopHigh1.setAttribute("stop-opacity", "0.8");
  gradientHigh.appendChild(stopHigh1);
  
  const stopHigh2 = document.createElementNS(svgNS, "stop");
  stopHigh2.setAttribute("offset", "50%");
  stopHigh2.setAttribute("stop-color", "#EC008C");
  stopHigh2.setAttribute("stop-opacity", "0.4");
  gradientHigh.appendChild(stopHigh2);
  
  const stopHigh3 = document.createElementNS(svgNS, "stop");
  stopHigh3.setAttribute("offset", "100%");
  stopHigh3.setAttribute("stop-color", "#EC008C");
  stopHigh3.setAttribute("stop-opacity", "0");
  gradientHigh.appendChild(stopHigh3);
  
  defs.appendChild(gradientHigh);

  // Heat gradient medium
  const gradientMedium = document.createElementNS(svgNS, "radialGradient");
  gradientMedium.setAttribute("id", "heatGradientMedium");
  
  const stopMed1 = document.createElementNS(svgNS, "stop");
  stopMed1.setAttribute("offset", "0%");
  stopMed1.setAttribute("stop-color", "#00AEEF");
  stopMed1.setAttribute("stop-opacity", "0.7");
  gradientMedium.appendChild(stopMed1);
  
  const stopMed2 = document.createElementNS(svgNS, "stop");
  stopMed2.setAttribute("offset", "50%");
  stopMed2.setAttribute("stop-color", "#00AEEF");
  stopMed2.setAttribute("stop-opacity", "0.35");
  gradientMedium.appendChild(stopMed2);
  
  const stopMed3 = document.createElementNS(svgNS, "stop");
  stopMed3.setAttribute("offset", "100%");
  stopMed3.setAttribute("stop-color", "#00AEEF");
  stopMed3.setAttribute("stop-opacity", "0");
  gradientMedium.appendChild(stopMed3);
  
  defs.appendChild(gradientMedium);

  // Add glow filter
  const filter = document.createElementNS(svgNS, "filter");
  filter.setAttribute("id", "mapGlow");
  
  const feGaussianBlur = document.createElementNS(svgNS, "feGaussianBlur");
  feGaussianBlur.setAttribute("stdDeviation", "3");
  feGaussianBlur.setAttribute("result", "coloredBlur");
  filter.appendChild(feGaussianBlur);
  
  const feMerge = document.createElementNS(svgNS, "feMerge");
  const feMergeNode1 = document.createElementNS(svgNS, "feMergeNode");
  feMergeNode1.setAttribute("in", "coloredBlur");
  feMerge.appendChild(feMergeNode1);
  
  const feMergeNode2 = document.createElementNS(svgNS, "feMergeNode");
  feMergeNode2.setAttribute("in", "SourceGraphic");
  feMerge.appendChild(feMergeNode2);
  
  filter.appendChild(feMerge);
  defs.appendChild(filter);
  
  svg.appendChild(defs);

  // Florida outline
  const floridaPath = document.createElementNS(svgNS, "path");
  floridaPath.setAttribute("d", `M 380,150 
    Q 420,140 450,160
    L 460,200
    L 470,250
    L 480,300
    Q 490,350 500,380
    L 510,410
    Q 520,430 530,450
    L 520,470
    Q 500,480 480,470
    L 460,450
    Q 440,430 420,410
    L 400,380
    L 380,350
    L 370,300
    L 365,250
    L 370,200
    Z`);
  floridaPath.setAttribute("fill", "#1A1A1A");
  floridaPath.setAttribute("opacity", "0.1");
  floridaPath.setAttribute("stroke", "#00AEEF");
  floridaPath.setAttribute("stroke-width", "2");
  floridaPath.setAttribute("filter", "url(#mapGlow)");
  svg.appendChild(floridaPath);

  // Heat zones data
  const heatZones = [
    { name: 'Miami Beach', cx: 520, cy: 420, intensity: 0.9, impressions: '75K' },
    { name: 'Downtown Miami', cx: 480, cy: 400, intensity: 0.85, impressions: '68K' },
    { name: 'Brickell', cx: 470, cy: 410, intensity: 0.88, impressions: '71K' },
    { name: 'Coral Gables', cx: 450, cy: 420, intensity: 0.75, impressions: '52K' },
    { name: 'Aventura', cx: 500, cy: 360, intensity: 0.8, impressions: '61K' },
    { name: 'Fort Lauderdale', cx: 480, cy: 320, intensity: 0.82, impressions: '64K' },
    { name: 'Boca Raton', cx: 460, cy: 270, intensity: 0.7, impressions: '48K' },
    { name: 'West Palm Beach', cx: 440, cy: 220, intensity: 0.72, impressions: '50K' }
  ];

  // Create heat zones
  const heatZonesGroup = document.createElementNS(svgNS, "g");
  heatZonesGroup.setAttribute("class", "heat-zones");

  heatZones.forEach((zone, index) => {
    const zoneGroup = document.createElementNS(svgNS, "g");
    zoneGroup.setAttribute("class", "heat-zone");
    zoneGroup.style.cursor = "pointer";

    // Pulsing circle
    const pulseCircle = document.createElementNS(svgNS, "circle");
    pulseCircle.setAttribute("cx", zone.cx);
    pulseCircle.setAttribute("cy", zone.cy);
    pulseCircle.setAttribute("r", "30");
    pulseCircle.setAttribute("fill", zone.intensity > 0.8 ? "url(#heatGradientHigh)" : "url(#heatGradientMedium)");

    // Animate radius
    const animateR = document.createElementNS(svgNS, "animate");
    animateR.setAttribute("attributeName", "r");
    animateR.setAttribute("values", "25;40;25");
    animateR.setAttribute("dur", `${3 + index * 0.2}s`);
    animateR.setAttribute("repeatCount", "indefinite");
    pulseCircle.appendChild(animateR);

    // Animate opacity
    const animateOpacity = document.createElementNS(svgNS, "animate");
    animateOpacity.setAttribute("attributeName", "opacity");
    animateOpacity.setAttribute("values", `${zone.intensity};${zone.intensity * 0.5};${zone.intensity}`);
    animateOpacity.setAttribute("dur", `${3 + index * 0.2}s`);
    animateOpacity.setAttribute("repeatCount", "indefinite");
    pulseCircle.appendChild(animateOpacity);

    zoneGroup.appendChild(pulseCircle);

    // Center dot
    const centerDot = document.createElementNS(svgNS, "circle");
    centerDot.setAttribute("cx", zone.cx);
    centerDot.setAttribute("cy", zone.cy);
    centerDot.setAttribute("r", "5");
    centerDot.setAttribute("fill", zone.intensity > 0.8 ? "#EC008C" : "#00AEEF");
    centerDot.setAttribute("filter", "url(#mapGlow)");
    zoneGroup.appendChild(centerDot);

    // Zone label
    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", zone.cx);
    label.setAttribute("y", zone.cy - 40);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", "#FFFFFF");
    label.setAttribute("font-size", "12");
    label.setAttribute("font-weight", "600");
    label.setAttribute("font-family", "Montserrat, sans-serif");
    label.textContent = zone.name;

    // Initially hidden, show on hover
    label.style.opacity = "0";
    label.style.transition = "opacity 300ms";

    zoneGroup.appendChild(label);

    // Impressions text
    const impressions = document.createElementNS(svgNS, "text");
    impressions.setAttribute("x", zone.cx);
    impressions.setAttribute("y", zone.cy - 25);
    impressions.setAttribute("text-anchor", "middle");
    impressions.setAttribute("fill", "#00AEEF");
    impressions.setAttribute("font-size", "10");
    impressions.setAttribute("font-weight", "500");
    impressions.setAttribute("font-family", "Inter, sans-serif");
    impressions.textContent = `${zone.impressions}/day`;
    impressions.style.opacity = "0";
    impressions.style.transition = "opacity 300ms";

    zoneGroup.appendChild(impressions);

    // Add hover interaction
    zoneGroup.addEventListener("mouseenter", () => {
      label.style.opacity = "1";
      impressions.style.opacity = "0.8";
      pulseCircle.setAttribute("r", "45");
    });

    zoneGroup.addEventListener("mouseleave", () => {
      label.style.opacity = "0";
      impressions.style.opacity = "0";
      pulseCircle.setAttribute("r", "30");
    });

    // Add click interaction
    zoneGroup.addEventListener("click", () => {
      alert(`${zone.name}\nDaily Impressions: ${zone.impressions}\nTraffic Intensity: ${(zone.intensity * 100).toFixed(0)}%`);
    });

    heatZonesGroup.appendChild(zoneGroup);
  });

  svg.appendChild(heatZonesGroup);

  // Add legend
  const legendGroup = document.createElementNS(svgNS, "g");
  legendGroup.setAttribute("transform", "translate(20, 430)");

  const legendBg = document.createElementNS(svgNS, "rect");
  legendBg.setAttribute("x", "0");
  legendBg.setAttribute("y", "0");
  legendBg.setAttribute("width", "150");
  legendBg.setAttribute("height", "60");
  legendBg.setAttribute("fill", "#1A1A1A");
  legendBg.setAttribute("opacity", "0.8");
  legendBg.setAttribute("rx", "5");
  legendGroup.appendChild(legendBg);

  const legendTitle = document.createElementNS(svgNS, "text");
  legendTitle.setAttribute("x", "10");
  legendTitle.setAttribute("y", "20");
  legendTitle.setAttribute("fill", "#FFFFFF");
  legendTitle.setAttribute("font-size", "12");
  legendTitle.setAttribute("font-weight", "600");
  legendTitle.setAttribute("font-family", "Montserrat, sans-serif");
  legendTitle.textContent = "Traffic Density";
  legendGroup.appendChild(legendTitle);

  svg.appendChild(legendGroup);

  container.appendChild(svg);
  return svg;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FloridaMap, createFloridaMap };
}