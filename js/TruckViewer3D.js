/**
 * MaxiMax Advertising - Interactive 3D Truck Viewer
 * WebGL/Three.js implementation for 3D truck billboard visualization
 * @version 4.0.0
 * @description Production-ready 3D viewer with realistic truck model and advanced features
 */

class TruckViewer3D {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ?
      document.querySelector(container) : container;

    if (!this.container) {
      console.error('TruckViewer3D: Container not found');
      return;
    }

    // Enhanced Configuration
    this.options = {
      // Rotation & Controls
      autoRotate: options.autoRotate !== false,
      rotationSpeed: options.rotationSpeed || 0.5,
      enableControls: options.enableControls !== false,
      enableZoom: options.enableZoom !== false,
      enablePan: options.enablePan || false,
      
      // Display Settings
      showLEDDisplay: options.showLEDDisplay !== false,
      displayContent: options.displayContent || 'MAXIMAX',
      ledAnimationSpeed: options.ledAnimationSpeed || 1,
      
      // Colors & Appearance
      truckColor: options.truckColor || '#2e3440',
      brandColor: options.brandColor || '#ff6b6b',
      displayColors: options.displayColors || ['#EC008C', '#00AEEF', '#FFC107'],
      
      // Lighting
      dayMode: options.dayMode !== undefined ? options.dayMode : true,
      enableShadows: options.enableShadows !== false,
      
      // Performance
      quality: options.quality || 'high', // high, medium, low
      useLOD: options.useLOD !== false,
      mobileOptimized: this.detectMobile(),
      
      // Animations
      enableDrivingAnimation: options.enableDrivingAnimation || false,
      enableWheelRotation: options.enableWheelRotation !== false,
      enableLEDAnimations: options.enableLEDAnimations !== false,
      
      // Other
      responsive: options.responsive !== false,
      showStats: options.showStats || false
    };

    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.truck = null;
    this.wheels = [];
    this.ledDisplay = null;
    this.ledTexture = null;
    this.ledCanvas = null;
    this.ledContext = null;
    this.lights = {};
    this.animationId = null;
    this.clock = null;
    this.mixer = null;
    this.stats = null;

    // State Management
    this.isLoaded = false;
    this.isAnimating = false;
    this.isDriving = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.wheelRotation = 0;
    this.ledAnimationTime = 0;
    this.currentLEDPattern = 0;
    this.ledPatterns = [];

    this.init();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  async init() {
    // Check WebGL support first
    if (!this.checkWebGLSupport()) {
      this.fallbackTo2D();
      return;
    }

    await this.loadThree();
    if (window.THREE) {
      this.setupScene();
      this.createGround();
      this.createTruck();
      this.setupLights();
      this.setupControls();
      this.bindEvents();
      this.initializeLEDPatterns();
      this.adjustQuality();
      
      if (this.options.showStats) {
        this.setupStats();
      }
      
      this.animate();

      this.isLoaded = true;
      console.log('TruckViewer3D: Initialized successfully');
    }
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
               (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  async loadThree() {
    if (window.THREE) {
      return;
    }

    try {
      // Load latest Three.js version
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r152/three.min.js');
      await this.loadScript('https://cdn.jsdelivr.net/npm/three@0.152.0/examples/js/controls/OrbitControls.js');
      
      // Load Stats.js if needed
      if (this.options.showStats) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js');
      }
    } catch (error) {
      console.error('Failed to load Three.js:', error);
      this.fallbackTo2D();
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setupScene() {
    const THREE = window.THREE;

    // Scene with day/night mode
    this.scene = new THREE.Scene();
    this.scene.background = this.options.dayMode ? 
      new THREE.Color(0x87CEEB) : new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(
      this.options.dayMode ? 0x87CEEB : 0x1a1a2e,
      10,
      100
    );

    // Camera with better positioning
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(20, 12, 20);
    this.camera.lookAt(0, 2, 0);

    // Enhanced Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.options.mobileOptimized && this.options.quality === 'high',
      alpha: true,
      powerPreference: this.options.mobileOptimized ? 'low-power' : 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(this.options.mobileOptimized ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = this.options.enableShadows && this.options.quality !== 'low';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Clock for animations
    this.clock = new THREE.Clock();
  }

  createTruck() {
    const THREE = window.THREE;
    const truckGroup = new THREE.Group();

    // Enhanced truck body with realistic proportions
    const bodyGeometry = new THREE.BoxGeometry(12, 4, 3.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: this.options.truckColor,
      metalness: 0.6,
      roughness: 0.4,
      envMapIntensity: 1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    truckGroup.add(body);

    // Realistic truck cabin with details
    const cabinGeometry = new THREE.BoxGeometry(3, 3.2, 3.4);
    const cabinMaterial = new THREE.MeshPhongMaterial({
      color: this.options.truckColor,
      metalness: 0.7,
      roughness: 0.3
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(-7, 1.8, 0);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    truckGroup.add(cabin);

    // Add cabin roof detail
    const roofGeometry = new THREE.BoxGeometry(2.8, 0.3, 3.2);
    const roof = new THREE.Mesh(roofGeometry, cabinMaterial);
    roof.position.set(-7, 3.5, 0);
    truckGroup.add(roof);

    // Realistic windows with better material
    const windowGeometry = new THREE.PlaneGeometry(2.5, 1.8);
    const windowMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      metalness: 0,
      roughness: 0,
      transmission: 0.9,
      transparent: true,
      opacity: 0.4,
      reflectivity: 0.5
    });
    
    // Front window
    const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow.position.set(-8.5, 2.2, 0);
    frontWindow.rotation.y = Math.PI / 2;
    truckGroup.add(frontWindow);
    
    // Side windows
    const sideWindow1 = new THREE.Mesh(windowGeometry.clone(), windowMaterial);
    sideWindow1.scale.set(0.8, 0.8, 1);
    sideWindow1.position.set(-7, 2.2, 1.71);
    truckGroup.add(sideWindow1);
    
    const sideWindow2 = new THREE.Mesh(windowGeometry.clone(), windowMaterial);
    sideWindow2.scale.set(0.8, 0.8, 1);
    sideWindow2.position.set(-7, 2.2, -1.71);
    sideWindow2.rotation.y = Math.PI;
    truckGroup.add(sideWindow2);

    // Side mirrors
    const mirrorGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
    const mirrorMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    leftMirror.position.set(-7.5, 2, 1.8);
    truckGroup.add(leftMirror);
    
    const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    rightMirror.position.set(-7.5, 2, -1.8);
    truckGroup.add(rightMirror);

    // Realistic wheels with rims
    this.wheels = [];
    const wheelPositions = [
      { x: -6.5, y: 0, z: 1.6 },  // Front left
      { x: -6.5, y: 0, z: -1.6 }, // Front right
      { x: 4.5, y: 0, z: 1.6 },   // Rear left outer
      { x: 4.5, y: 0, z: -1.6 },  // Rear right outer
      { x: 3.2, y: 0, z: 1.6 },   // Rear left inner
      { x: 3.2, y: 0, z: -1.6 }   // Rear right inner
    ];

    wheelPositions.forEach(pos => {
      const wheelGroup = new THREE.Group();
      
      // Tire
      const tireGeometry = new THREE.TorusGeometry(0.8, 0.3, 8, 18);
      const tireMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a,
        roughness: 0.8
      });
      const tire = new THREE.Mesh(tireGeometry, tireMaterial);
      tire.rotation.y = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);
      
      // Rim
      const rimGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 8);
      const rimMaterial = new THREE.MeshPhongMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.1
      });
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);
      
      // Hubcap with logo
      const hubGeometry = new THREE.CircleGeometry(0.3, 16);
      const hubMaterial = new THREE.MeshPhongMaterial({
        color: this.options.brandColor,
        metalness: 1,
        roughness: 0.2
      });
      const hub = new THREE.Mesh(hubGeometry, hubMaterial);
      hub.position.z = 0.21;
      hub.rotation.y = Math.PI / 2;
      wheelGroup.add(hub);
      
      wheelGroup.position.set(pos.x, pos.y, pos.z);
      this.wheels.push(wheelGroup);
      truckGroup.add(wheelGroup);
    });

    // LED Display on truck sides
    if (this.options.showLEDDisplay) {
      this.createLEDDisplay(truckGroup);
    }

    // Add MaxiMax branding
    this.addBranding(truckGroup);
    
    // Add truck details
    this.addTruckDetails(truckGroup);

    // Setup LOD if enabled
    if (this.options.useLOD && !this.options.mobileOptimized) {
      this.truck = this.setupLOD(truckGroup);
    } else {
      this.truck = truckGroup;
    }
    
    this.truck.position.y = 0.5;
    this.scene.add(this.truck);
  }

  createLEDDisplay(parent) {
    const THREE = window.THREE;

    // Create canvas for LED content
    this.ledCanvas = document.createElement('canvas');
    this.ledCanvas.width = 1024;
    this.ledCanvas.height = 384;
    this.ledContext = this.ledCanvas.getContext('2d');
    
    // Initial LED content
    this.updateLEDContent();
    
    this.ledTexture = new THREE.CanvasTexture(this.ledCanvas);
    this.ledTexture.minFilter = THREE.LinearFilter;
    this.ledTexture.magFilter = THREE.LinearFilter;
    
    // Display panel with emissive material
    const displayGeometry = new THREE.PlaneGeometry(10, 3.5);
    const displayMaterial = new THREE.MeshBasicMaterial({
      map: this.ledTexture,
      emissive: 0xffffff,
      emissiveIntensity: this.options.dayMode ? 0.5 : 2
    });
    
    // Right side display
    const displayRight = new THREE.Mesh(displayGeometry, displayMaterial);
    displayRight.position.set(0, 2, 1.76);
    parent.add(displayRight);
    
    // Left side display
    const displayLeft = new THREE.Mesh(displayGeometry, displayMaterial.clone());
    displayLeft.position.set(0, 2, -1.76);
    displayLeft.rotation.y = Math.PI;
    parent.add(displayLeft);
    
    this.ledDisplay = { right: displayRight, left: displayLeft };

  }

  updateLEDContent() {
    if (!this.ledContext || !this.ledCanvas) return;
    
    const ctx = this.ledContext;
    const canvas = this.ledCanvas;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Animated gradient background
    const time = Date.now() / 50;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const hue1 = (time + this.ledAnimationTime * 10) % 360;
    const hue2 = (hue1 + 120) % 360;
    const hue3 = (hue1 + 240) % 360;
    
    gradient.addColorStop(0, `hsl(${hue1}, 100%, 50%)`);
    gradient.addColorStop(0.5, `hsl(${hue2}, 100%, 50%)`);
    gradient.addColorStop(1, `hsl(${hue3}, 100%, 50%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add content based on current pattern
    const pattern = this.ledPatterns[this.currentLEDPattern] || {
      text: 'MAXIMAX',
      subtext: 'MOBILE ADVERTISING'
    };
    
    // Add text with shadow
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText(pattern.text, canvas.width / 2, canvas.height / 2 - 60);
    
    if (pattern.subtext) {
      ctx.font = 'bold 48px Arial';
      ctx.fillText(pattern.subtext, canvas.width / 2, canvas.height / 2 + 50);
    }
    
    // Add animated border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Add LED pixel effect for higher quality
    if (this.options.quality !== 'low' && this.options.enableLEDAnimations) {
      this.addLEDPixelEffect(ctx, canvas);
    }
    
    // Update texture
    if (this.ledTexture) {
      this.ledTexture.needsUpdate = true;
    }
  }

  addLEDPixelEffect(ctx, canvas) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const pixelSize = 4;
    
    for (let y = 0; y < canvas.height; y += pixelSize) {
      for (let x = 0; x < canvas.width; x += pixelSize) {
        const index = (y * canvas.width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // Create LED-like blocks
        for (let py = 0; py < pixelSize - 1; py++) {
          for (let px = 0; px < pixelSize - 1; px++) {
            const pixelIndex = ((y + py) * canvas.width + (x + px)) * 4;
            if (pixelIndex < data.length - 3) {
              data[pixelIndex] = r * 0.95;
              data[pixelIndex + 1] = g * 0.95;
              data[pixelIndex + 2] = b * 0.95;
            }
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  initializeLEDPatterns() {
    this.ledPatterns = [
      { text: 'MAXIMAX', subtext: 'MOBILE ADVERTISING' },
      { text: 'YOUR AD', subtext: 'HERE' },
      { text: '24/7', subtext: 'VISIBILITY' },
      { text: 'REACH', subtext: 'MILLIONS' },
      { text: 'FLORIDA', subtext: 'COVERAGE' }
    ];
    
    // Cycle through patterns if enabled
    if (this.options.enableLEDAnimations) {
      setInterval(() => {
        this.currentLEDPattern = (this.currentLEDPattern + 1) % this.ledPatterns.length;
        this.updateLEDContent();
      }, 5000);
    }
  }

  addBranding(parent) {
    const THREE = window.THREE;
    
    // Create MaxiMax logo texture
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = 256;
    logoCanvas.height = 102;
    const logoCtx = logoCanvas.getContext('2d');
    
    // Draw logo background
    logoCtx.fillStyle = this.options.brandColor;
    logoCtx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
    
    // Draw logo text
    logoCtx.fillStyle = '#FFFFFF';
    logoCtx.font = 'bold 48px Arial';
    logoCtx.textAlign = 'center';
    logoCtx.textBaseline = 'middle';
    logoCtx.fillText('MAXIMAX', logoCanvas.width / 2, logoCanvas.height / 2);
    
    const logoTexture = new THREE.CanvasTexture(logoCanvas);
    const logoMaterial = new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true
    });
    
    // Front logo
    const frontLogoGeometry = new THREE.PlaneGeometry(2, 0.8);
    const frontLogo = new THREE.Mesh(frontLogoGeometry, logoMaterial);
    frontLogo.position.set(-8.5, 3, 0);
    frontLogo.rotation.y = Math.PI / 2;
    parent.add(frontLogo);
    
    // Back logo
    const backLogo = new THREE.Mesh(frontLogoGeometry, logoMaterial.clone());
    backLogo.position.set(6.01, 2, 0);
    backLogo.rotation.y = -Math.PI / 2;
    parent.add(backLogo);
  }

  addTruckDetails(parent) {
    const THREE = window.THREE;
    
    // Add bumpers
    const bumperMaterial = new THREE.MeshPhongMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.3
    });
    
    // Front bumper
    const frontBumper = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.4, 0.2),
      bumperMaterial
    );
    frontBumper.position.set(-8.5, 0.2, 0);
    parent.add(frontBumper);
    
    // Rear bumper
    const rearBumper = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.4, 0.2),
      bumperMaterial
    );
    rearBumper.position.set(6, 0.2, 0);
    parent.add(rearBumper);
    
    // Add exhaust pipes
    const exhaustGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const exhaustMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      metalness: 0.9,
      roughness: 0.2
    });
    
    const exhaust1 = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust1.position.set(-6, 0, 1.5);
    exhaust1.rotation.z = Math.PI / 2;
    parent.add(exhaust1);
    
    const exhaust2 = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust2.position.set(-6, 0, -1.5);
    exhaust2.rotation.z = Math.PI / 2;
    parent.add(exhaust2);
    
    // Add headlights if night mode
    if (!this.options.dayMode) {
      this.createHeadlights(parent);
    }
  }

  createHeadlights(parent) {
    const THREE = window.THREE;
    
    const headlightPositions = [
      { x: -8.6, y: 1, z: 1 },
      { x: -8.6, y: 1, z: -1 }
    ];

    headlightPositions.forEach(pos => {
      // Spotlight
      const spotlight = new THREE.SpotLight(0xffffcc, 2, 30, Math.PI / 6, 0.5);
      spotlight.position.set(pos.x, pos.y, pos.z);
      spotlight.target.position.set(pos.x - 15, pos.y - 2, pos.z);
      spotlight.castShadow = this.options.enableShadows && this.options.quality === 'high';
      
      parent.add(spotlight);
      parent.add(spotlight.target);
      
      // Visible light bulb
      const bulbGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const bulbMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffcc,
        emissive: 0xffffcc,
        emissiveIntensity: 3
      });
      const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
      bulb.position.copy(spotlight.position);
      parent.add(bulb);
    });
  }

  createGround() {
    const THREE = window.THREE;
    
    // Road surface
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: this.options.dayMode ? 0x3a3a3a : 0x1a1a1a,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add road markings if quality permits
    if (this.options.quality !== 'low') {
      this.addRoadMarkings();
    }
    
    // Add grid for reference
    const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  addRoadMarkings() {
    const THREE = window.THREE;
    
    const markingGeometry = new THREE.PlaneGeometry(1.5, 10);
    const markingMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide
    });

    for (let i = -40; i <= 40; i += 15) {
      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(i, 0.02, 0);
      this.scene.add(marking);
    }
  }

  setupLOD(highDetailTruck) {
    const THREE = window.THREE;
    const lod = new THREE.LOD();
    
    // High detail (close)
    lod.addLevel(highDetailTruck, 0);
    
    // Medium detail (mid-distance)
    const mediumTruck = this.createSimplifiedTruck('medium');
    lod.addLevel(mediumTruck, 30);
    
    // Low detail (far)
    const lowTruck = this.createSimplifiedTruck('low');
    lod.addLevel(lowTruck, 60);
    
    return lod;
  }

  createSimplifiedTruck(detail) {
    const THREE = window.THREE;
    const group = new THREE.Group();
    
    if (detail === 'medium') {
      // Simplified truck with basic shapes
      const bodyGeometry = new THREE.BoxGeometry(12, 4, 3.5);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: this.options.truckColor });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 2;
      group.add(body);
      
      const cabGeometry = new THREE.BoxGeometry(3, 3.2, 3.4);
      const cab = new THREE.Mesh(cabGeometry, bodyMaterial);
      cab.position.set(-7, 1.8, 0);
      group.add(cab);
      
      // Simplified wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 8);
      const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
      
      const wheelPositions = [
        { x: -6.5, y: 0, z: 1.6 },
        { x: -6.5, y: 0, z: -1.6 },
        { x: 4, y: 0, z: 1.6 },
        { x: 4, y: 0, z: -1.6 }
      ];
      
      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(pos.x, pos.y, pos.z);
        wheel.rotation.z = Math.PI / 2;
        group.add(wheel);
      });
    } else {
      // Very low detail - just boxes
      const geometry = new THREE.BoxGeometry(14, 4, 3.5);
      const material = new THREE.MeshBasicMaterial({ color: this.options.truckColor });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 2;
      group.add(mesh);
    }
    
    return group;
  }

  setupLights() {
    const THREE = window.THREE;

    // Ambient light based on day/night mode
    const ambientLight = new THREE.AmbientLight(
      this.options.dayMode ? 0xffffff : 0x404040,
      this.options.dayMode ? 0.6 : 0.3
    );
    this.scene.add(ambientLight);
    this.lights.ambient = ambientLight;

    // Directional light (sun/moon)
    const directionalLight = new THREE.DirectionalLight(
      this.options.dayMode ? 0xffffff : 0x8888ff,
      this.options.dayMode ? 1 : 0.5
    );
    directionalLight.position.set(15, 25, 15);
    directionalLight.castShadow = this.options.enableShadows && this.options.quality !== 'low';
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 60;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.mapSize.width = this.options.quality === 'high' ? 2048 : 1024;
    directionalLight.shadow.mapSize.height = this.options.quality === 'high' ? 2048 : 1024;
    this.scene.add(directionalLight);
    this.lights.directional = directionalLight;

    // Hemisphere light for natural lighting
    const hemisphereLight = new THREE.HemisphereLight(
      this.options.dayMode ? 0x87CEEB : 0x222244,
      this.options.dayMode ? 0xffffff : 0x111122,
      this.options.dayMode ? 0.4 : 0.2
    );
    this.scene.add(hemisphereLight);
    this.lights.hemisphere = hemisphereLight;

    // LED display glow lights
    if (this.options.showLEDDisplay) {
      const ledLight1 = new THREE.PointLight(this.options.displayColors[0], 0.8, 15);
      ledLight1.position.set(0, 2, 5);
      this.scene.add(ledLight1);
      
      const ledLight2 = new THREE.PointLight(this.options.displayColors[1], 0.8, 15);
      ledLight2.position.set(0, 2, -5);
      this.scene.add(ledLight2);
      
      this.lights.led1 = ledLight1;
      this.lights.led2 = ledLight2;
    }
  }

  setupControls() {
    if (!this.options.enableControls || !window.THREE.OrbitControls) {
      return;
    }

    this.controls = new window.THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 60;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.autoRotate = this.options.autoRotate;
    this.controls.autoRotateSpeed = this.options.rotationSpeed;
    this.controls.enableZoom = this.options.enableZoom;
    this.controls.enablePan = this.options.enablePan;
  }

  setupStats() {
    if (typeof Stats !== 'undefined') {
      this.stats = new Stats();
      this.stats.showPanel(0); // FPS panel
      this.container.appendChild(this.stats.dom);
      this.stats.dom.style.position = 'absolute';
      this.stats.dom.style.top = '0';
      this.stats.dom.style.left = '0';
    }
  }

  bindEvents() {
    // Resize handler
    window.addEventListener('resize', () => this.handleResize());

    // Mouse/touch interaction for manual control
    this.renderer.domElement.addEventListener('mousedown', () => {
      if (this.controls) {
        this.controls.autoRotate = false;
      }
    });
    
    this.renderer.domElement.addEventListener('touchstart', () => {
      if (this.controls) {
        this.controls.autoRotate = false;
      }
    });
    
    // Double click to reset camera
    this.renderer.domElement.addEventListener('dblclick', () => {
      this.resetCamera();
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'd':
        case 'D':
          this.toggleDayMode();
          break;
        case 'r':
        case 'R':
          this.toggleAutoRotate();
          break;
        case ' ':
          this.toggleDriving();
          break;
      }
    });

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  handleResize() {
    if (!this.camera || !this.renderer) {
      return;
    }

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  adjustQuality() {
    const isLowEnd = navigator.hardwareConcurrency <= 2;
    const memoryLimited = navigator.deviceMemory && navigator.deviceMemory <= 4;

    if (this.options.mobileOptimized || isLowEnd || memoryLimited) {
      // Auto-adjust to lower quality
      if (this.options.quality === 'high') {
        this.options.quality = 'medium';
      }
      
      // Disable expensive features
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = false;
      this.options.enableShadows = false;
      this.options.useLOD = false;
      
      // Simplify LED animations
      this.options.enableLEDAnimations = false;
      
      console.log('TruckViewer3D: Adjusted quality for performance');
    }
  }

  animate() {
    if (!this.isAnimating) {
      this.isAnimating = true;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.stats) this.stats.begin();

    const delta = this.clock ? this.clock.getDelta() : 0.016;
    
    // Update mixer for driving animation
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Animate wheels
    if (this.options.enableWheelRotation && (this.isDriving || this.options.autoRotate)) {
      this.animateWheels(delta);
    }
    
    // Truck bobbing when driving
    if (this.truck && this.isDriving) {
      this.truck.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.05;
      this.truck.rotation.z = Math.sin(Date.now() * 0.002) * 0.01;
    }
    
    // Update LED animation
    if (this.options.enableLEDAnimations && this.ledContext) {
      this.ledAnimationTime += delta * this.options.ledAnimationSpeed;
      if (this.ledAnimationTime > 0.1) {
        this.updateLEDContent();
        this.ledAnimationTime = 0;
      }
    }
    
    // Animate LED glow lights
    if (this.lights.led1 && this.lights.led2) {
      const time = Date.now() * 0.001;
      this.lights.led1.intensity = 0.5 + Math.sin(time) * 0.3;
      this.lights.led2.intensity = 0.5 + Math.cos(time) * 0.3;
    }

    // Update controls
    if (this.controls) {
      this.controls.update();
    }

    // Render scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
    
    if (this.stats) this.stats.end();
  }

  animateWheels(delta) {
    this.wheelRotation += delta * (this.isDriving ? 5 : 2);
    this.wheels.forEach(wheelGroup => {
      // Rotate the entire wheel group
      wheelGroup.rotation.x = this.wheelRotation;
      
      // Add slight steering to front wheels when turning
      if (this.wheels.indexOf(wheelGroup) < 2 && this.controls && this.controls.autoRotate) {
        wheelGroup.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
      }
    });
  }

  fallbackTo2D() {
    // Create 2D fallback visualization
    console.log('Falling back to 2D truck visualization');

    const canvas = document.createElement('canvas');
    canvas.width = this.container.clientWidth;
    canvas.height = this.container.clientHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    this.container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Simple 2D truck drawing
    const drawTruck = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Truck body
      ctx.fillStyle = this.options.truckColor;
      ctx.fillRect(canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.4, canvas.height * 0.2);

      // Cabin
      ctx.fillRect(canvas.width * 0.2, canvas.height * 0.45, canvas.width * 0.15, canvas.height * 0.15);

      // Wheels
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.3, canvas.height * 0.65, 15, 0, Math.PI * 2);
      ctx.arc(canvas.width * 0.6, canvas.height * 0.65, 15, 0, Math.PI * 2);
      ctx.fill();

      // LED Display
      const gradient = ctx.createLinearGradient(
        canvas.width * 0.35, 0,
        canvas.width * 0.65, 0
      );
      gradient.addColorStop(0, this.options.displayColors[0]);
      gradient.addColorStop(1, this.options.displayColors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(canvas.width * 0.35, canvas.height * 0.42, canvas.width * 0.3, canvas.height * 0.15);

      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Montserrat';
      ctx.textAlign = 'center';
      ctx.fillText(this.options.displayContent, canvas.width * 0.5, canvas.height * 0.5);
    };

    drawTruck();
  }

  // Public API methods
  
  resetCamera() {
    this.camera.position.set(20, 12, 20);
    this.camera.lookAt(0, 2, 0);
    if (this.controls) {
      this.controls.target.set(0, 2, 0);
      this.controls.autoRotate = this.options.autoRotate;
      this.controls.update();
    }
  }
  
  toggleDayMode() {
    this.setDayMode(!this.options.dayMode);
  }
  
  setDayMode(dayMode) {
    this.options.dayMode = dayMode;
    
    // Update scene
    this.scene.background = dayMode ? 
      new window.THREE.Color(0x87CEEB) : new window.THREE.Color(0x1a1a2e);
    this.scene.fog.color = dayMode ? 
      new window.THREE.Color(0x87CEEB) : new window.THREE.Color(0x1a1a2e);
    
    // Update lights
    if (this.lights.ambient) {
      this.lights.ambient.intensity = dayMode ? 0.6 : 0.3;
    }
    if (this.lights.directional) {
      this.lights.directional.intensity = dayMode ? 1 : 0.5;
    }
    if (this.lights.hemisphere) {
      this.lights.hemisphere.intensity = dayMode ? 0.4 : 0.2;
    }
    
    // Update LED display intensity
    if (this.ledDisplay) {
      const intensity = dayMode ? 0.5 : 2;
      if (this.ledDisplay.right) {
        this.ledDisplay.right.material.emissiveIntensity = intensity;
      }
      if (this.ledDisplay.left) {
        this.ledDisplay.left.material.emissiveIntensity = intensity;
      }
    }
  }
  
  toggleAutoRotate() {
    this.options.autoRotate = !this.options.autoRotate;
    if (this.controls) {
      this.controls.autoRotate = this.options.autoRotate;
    }
  }
  
  toggleDriving() {
    if (this.isDriving) {
      this.stopDriving();
    } else {
      this.startDriving();
    }
  }
  
  startDriving() {
    this.isDriving = true;
    
    if (!this.mixer && window.THREE) {
      const THREE = window.THREE;
      
      // Create simple forward movement animation
      this.mixer = new THREE.AnimationMixer(this.truck);
      
      const times = [0, 2, 4];
      const values = [
        this.truck.position.x, 0, 0,
        this.truck.position.x + 10, 0, 0.5,
        this.truck.position.x - 10, 0, 0.5
      ];
      
      const positionKF = new THREE.VectorKeyframeTrack(
        '.position',
        times,
        values,
        THREE.InterpolateSmooth
      );
      
      const clip = new THREE.AnimationClip('drive', 4, [positionKF]);
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat);
      action.play();
    }
  }
  
  stopDriving() {
    this.isDriving = false;
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    // Reset truck position
    if (this.truck) {
      this.truck.position.set(0, 0.5, 0);
      this.truck.rotation.z = 0;
    }
  }
  
  changeLEDContent(text, subtext) {
    // Update current LED pattern
    this.ledPatterns[this.currentLEDPattern] = { text, subtext };
    this.updateLEDContent();
  }
  
  updateDisplay(content) {
    this.options.displayContent = content;
    this.changeLEDContent(content, 'MOBILE ADVERTISING');
  }

  setTruckColor(color) {
    this.options.truckColor = color;
    const THREE = window.THREE;
    const newColor = new THREE.Color(color);
    
    if (this.truck) {
      this.truck.traverse((child) => {
        if (child.isMesh && child.material && child.material.color) {
          // Don't change wheel, window, or LED display colors
          if (!child.material.transparent && 
              child.material.color.getHex() !== 0x222222 &&
              child.material.color.getHex() !== 0x888888) {
            child.material.color.copy(newColor);
          }
        }
      });
    }
  }
  
  changeColors(truckColor, displayColors) {
    if (truckColor) {
      this.setTruckColor(truckColor);
    }

    if (displayColors) {
      this.options.displayColors = displayColors;
      this.updateLEDContent();
      
      // Update LED glow lights
      if (this.lights.led1 && displayColors[0]) {
        this.lights.led1.color.set(displayColors[0]);
      }
      if (this.lights.led2 && displayColors[1]) {
        this.lights.led2.color.set(displayColors[1]);
      }
    }
  }

  start() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  pause() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  resume() {
    this.start();
  }

  destroy() {
    this.pause();

    // Cleanup Three.js resources
    if (this.scene) {
      this.scene.traverse(child => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.truck = null;

    console.log('TruckViewer3D: Destroyed');
  }

  // Export screenshot
  getScreenshot() {
    if (!this.renderer) {
      return null;
    }

    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }
}

// Auto-initialize 3D viewers on elements with data-truck-3d attribute
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-truck-3d]').forEach(element => {
    const options = {
      autoRotate: element.dataset.autoRotate !== 'false',
      showLEDDisplay: element.dataset.ledDisplay !== 'false',
      displayContent: element.dataset.displayContent || 'MAXIMAX',
      quality: element.dataset.quality || 'high'
    };

    const viewer = new TruckViewer3D(element, options);
    element.truckViewer = viewer;
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TruckViewer3D;
}