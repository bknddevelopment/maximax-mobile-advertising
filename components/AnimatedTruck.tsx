// AnimatedTruck Component
// Custom SVG LED Billboard Truck with realistic animations

const AnimatedTruck = () => {
  const createLEDAnimation = () => {
    const pixels = [];
    const rows = 8;
    const cols = 20;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const delay = (i * cols + j) * 0.05;
        pixels.push({
          x: j * 12 + 10,
          y: i * 12 + 10,
          delay: delay
        });
      }
    }
    return pixels;
  };

  const ledPixels = createLEDAnimation();

  return (
    <svg 
      className="animated-truck"
      viewBox="0 0 800 400" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', maxWidth: '800px' }}
    >
      {/* Truck Body */}
      <g className="truck-body">
        {/* Main Cabin */}
        <rect x="50" y="200" width="120" height="120" fill="#2C3E50" rx="5"/>
        <rect x="60" y="210" width="50" height="40" fill="#34495E" opacity="0.8"/>
        <rect x="120" y="210" width="40" height="40" fill="#34495E" opacity="0.8"/>
        
        {/* Truck Container/Billboard */}
        <rect x="170" y="140" width="280" height="180" fill="#1A1A1A" rx="5"/>
        
        {/* LED Display Screen */}
        <rect x="180" y="150" width="260" height="160" fill="#000000" rx="3"/>
        
        {/* LED Pixels */}
        <g className="led-display">
          {ledPixels.map((pixel, index) => (
            <rect
              key={index}
              x={pixel.x + 180}
              y={pixel.y + 150}
              width="10"
              height="10"
              fill="#EC008C"
              opacity="0"
              rx="2"
            >
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="3s"
                begin={`${pixel.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill"
                values="#EC008C;#00AEEF;#FFFFFF;#EC008C"
                dur="6s"
                begin={`${pixel.delay}s`}
                repeatCount="indefinite"
              />
            </rect>
          ))}
        </g>

        {/* MaxiMax Branding */}
        <text x="310" y="250" 
          fontFamily="Montserrat, sans-serif" 
          fontSize="24" 
          fontWeight="bold" 
          fill="#FFFFFF"
          textAnchor="middle"
          className="truck-brand"
        >
          MAXIMAX
        </text>
        
        {/* Wheels */}
        <g className="wheels">
          {/* Front Wheel */}
          <circle cx="100" cy="340" r="25" fill="#2C3E50">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 100 340"
              to="360 100 340"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="100" cy="340" r="15" fill="#34495E"/>
          <circle cx="100" cy="340" r="8" fill="#1A1A1A"/>
          
          {/* Rear Wheels */}
          <circle cx="380" cy="340" r="25" fill="#2C3E50">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 380 340"
              to="360 380 340"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="380" cy="340" r="15" fill="#34495E"/>
          <circle cx="380" cy="340" r="8" fill="#1A1A1A"/>
          
          <circle cx="420" cy="340" r="25" fill="#2C3E50">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 420 340"
              to="360 420 340"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="420" cy="340" r="15" fill="#34495E"/>
          <circle cx="420" cy="340" r="8" fill="#1A1A1A"/>
        </g>

        {/* Motion Lines */}
        <g className="motion-lines" opacity="0.6">
          <line x1="480" y1="200" x2="550" y2="200" stroke="#00AEEF" strokeWidth="3">
            <animate
              attributeName="x2"
              values="480;550;480"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="480" y1="250" x2="530" y2="250" stroke="#EC008C" strokeWidth="3">
            <animate
              attributeName="x2"
              values="480;530;480"
              dur="1.5s"
              begin="0.3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0"
              dur="1.5s"
              begin="0.3s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="480" y1="300" x2="540" y2="300" stroke="#00AEEF" strokeWidth="3">
            <animate
              attributeName="x2"
              values="480;540;480"
              dur="1.5s"
              begin="0.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0"
              dur="1.5s"
              begin="0.6s"
              repeatCount="indefinite"
            />
          </line>
        </g>

        {/* Glow Effect */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </g>
      
      {/* Road */}
      <rect x="0" y="365" width="800" height="35" fill="#2C3E50" opacity="0.3"/>
      <rect x="0" y="380" width="800" height="2" fill="#FFD700" opacity="0.5"/>
    </svg>
  );
};

// Vanilla JavaScript implementation
function createAnimatedTruck(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 800 400");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "auto");
  svg.style.maxWidth = "800px";

  // Create truck body
  const truckGroup = document.createElementNS(svgNS, "g");
  truckGroup.setAttribute("class", "truck-body");

  // Main cabin
  const cabin = document.createElementNS(svgNS, "rect");
  cabin.setAttribute("x", "50");
  cabin.setAttribute("y", "200");
  cabin.setAttribute("width", "120");
  cabin.setAttribute("height", "120");
  cabin.setAttribute("fill", "#2C3E50");
  cabin.setAttribute("rx", "5");
  truckGroup.appendChild(cabin);

  // Billboard container
  const billboard = document.createElementNS(svgNS, "rect");
  billboard.setAttribute("x", "170");
  billboard.setAttribute("y", "140");
  billboard.setAttribute("width", "280");
  billboard.setAttribute("height", "180");
  billboard.setAttribute("fill", "#1A1A1A");
  billboard.setAttribute("rx", "5");
  truckGroup.appendChild(billboard);

  // LED Screen
  const screen = document.createElementNS(svgNS, "rect");
  screen.setAttribute("x", "180");
  screen.setAttribute("y", "150");
  screen.setAttribute("width", "260");
  screen.setAttribute("height", "160");
  screen.setAttribute("fill", "#000000");
  screen.setAttribute("rx", "3");
  truckGroup.appendChild(screen);

  // Create LED pixels with animation
  const ledGroup = document.createElementNS(svgNS, "g");
  ledGroup.setAttribute("class", "led-display");

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 20; j++) {
      const pixel = document.createElementNS(svgNS, "rect");
      const x = j * 12 + 190;
      const y = i * 12 + 160;
      const delay = (i * 20 + j) * 0.05;

      pixel.setAttribute("x", x);
      pixel.setAttribute("y", y);
      pixel.setAttribute("width", "10");
      pixel.setAttribute("height", "10");
      pixel.setAttribute("fill", "#EC008C");
      pixel.setAttribute("opacity", "0");
      pixel.setAttribute("rx", "2");

      // Opacity animation
      const animateOpacity = document.createElementNS(svgNS, "animate");
      animateOpacity.setAttribute("attributeName", "opacity");
      animateOpacity.setAttribute("values", "0;1;1;0");
      animateOpacity.setAttribute("dur", "3s");
      animateOpacity.setAttribute("begin", `${delay}s`);
      animateOpacity.setAttribute("repeatCount", "indefinite");
      pixel.appendChild(animateOpacity);

      // Color animation
      const animateColor = document.createElementNS(svgNS, "animate");
      animateColor.setAttribute("attributeName", "fill");
      animateColor.setAttribute("values", "#EC008C;#00AEEF;#FFFFFF;#EC008C");
      animateColor.setAttribute("dur", "6s");
      animateColor.setAttribute("begin", `${delay}s`);
      animateColor.setAttribute("repeatCount", "indefinite");
      pixel.appendChild(animateColor);

      ledGroup.appendChild(pixel);
    }
  }
  truckGroup.appendChild(ledGroup);

  // Add MaxiMax branding
  const brandText = document.createElementNS(svgNS, "text");
  brandText.setAttribute("x", "310");
  brandText.setAttribute("y", "250");
  brandText.setAttribute("font-family", "Montserrat, sans-serif");
  brandText.setAttribute("font-size", "24");
  brandText.setAttribute("font-weight", "bold");
  brandText.setAttribute("fill", "#FFFFFF");
  brandText.setAttribute("text-anchor", "middle");
  brandText.textContent = "MAXIMAX";
  truckGroup.appendChild(brandText);

  // Create wheels with rotation
  const wheelsGroup = document.createElementNS(svgNS, "g");
  wheelsGroup.setAttribute("class", "wheels");

  const wheelPositions = [
    { cx: 100, cy: 340 },
    { cx: 380, cy: 340 },
    { cx: 420, cy: 340 }
  ];

  wheelPositions.forEach(pos => {
    // Outer wheel
    const wheel = document.createElementNS(svgNS, "circle");
    wheel.setAttribute("cx", pos.cx);
    wheel.setAttribute("cy", pos.cy);
    wheel.setAttribute("r", "25");
    wheel.setAttribute("fill", "#2C3E50");

    // Rotation animation
    const rotate = document.createElementNS(svgNS, "animateTransform");
    rotate.setAttribute("attributeName", "transform");
    rotate.setAttribute("type", "rotate");
    rotate.setAttribute("from", `0 ${pos.cx} ${pos.cy}`);
    rotate.setAttribute("to", `360 ${pos.cx} ${pos.cy}`);
    rotate.setAttribute("dur", "2s");
    rotate.setAttribute("repeatCount", "indefinite");
    wheel.appendChild(rotate);

    wheelsGroup.appendChild(wheel);

    // Inner wheel parts
    const inner = document.createElementNS(svgNS, "circle");
    inner.setAttribute("cx", pos.cx);
    inner.setAttribute("cy", pos.cy);
    inner.setAttribute("r", "15");
    inner.setAttribute("fill", "#34495E");
    wheelsGroup.appendChild(inner);

    const center = document.createElementNS(svgNS, "circle");
    center.setAttribute("cx", pos.cx);
    center.setAttribute("cy", pos.cy);
    center.setAttribute("r", "8");
    center.setAttribute("fill", "#1A1A1A");
    wheelsGroup.appendChild(center);
  });

  truckGroup.appendChild(wheelsGroup);

  // Add motion lines
  const motionGroup = document.createElementNS(svgNS, "g");
  motionGroup.setAttribute("class", "motion-lines");
  motionGroup.setAttribute("opacity", "0.6");

  const lineColors = ["#00AEEF", "#EC008C", "#00AEEF"];
  const lineYPositions = [200, 250, 300];
  const delays = ["0", "0.3", "0.6"];

  lineColors.forEach((color, i) => {
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", "480");
    line.setAttribute("y1", lineYPositions[i]);
    line.setAttribute("x2", "480");
    line.setAttribute("y2", lineYPositions[i]);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "3");

    // X2 animation
    const animateX = document.createElementNS(svgNS, "animate");
    animateX.setAttribute("attributeName", "x2");
    animateX.setAttribute("values", `480;${530 + i * 10};480`);
    animateX.setAttribute("dur", "1.5s");
    animateX.setAttribute("begin", `${delays[i]}s`);
    animateX.setAttribute("repeatCount", "indefinite");
    line.appendChild(animateX);

    // Opacity animation
    const animateOpacity = document.createElementNS(svgNS, "animate");
    animateOpacity.setAttribute("attributeName", "opacity");
    animateOpacity.setAttribute("values", "0;0.8;0");
    animateOpacity.setAttribute("dur", "1.5s");
    animateOpacity.setAttribute("begin", `${delays[i]}s`);
    animateOpacity.setAttribute("repeatCount", "indefinite");
    line.appendChild(animateOpacity);

    motionGroup.appendChild(line);
  });

  truckGroup.appendChild(motionGroup);
  svg.appendChild(truckGroup);

  // Add road
  const road = document.createElementNS(svgNS, "rect");
  road.setAttribute("x", "0");
  road.setAttribute("y", "365");
  road.setAttribute("width", "800");
  road.setAttribute("height", "35");
  road.setAttribute("fill", "#2C3E50");
  road.setAttribute("opacity", "0.3");
  svg.appendChild(road);

  const roadLine = document.createElementNS(svgNS, "rect");
  roadLine.setAttribute("x", "0");
  roadLine.setAttribute("y", "380");
  roadLine.setAttribute("width", "800");
  roadLine.setAttribute("height", "2");
  roadLine.setAttribute("fill", "#FFD700");
  roadLine.setAttribute("opacity", "0.5");
  svg.appendChild(roadLine);

  container.appendChild(svg);
  return svg;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimatedTruck, createAnimatedTruck };
}