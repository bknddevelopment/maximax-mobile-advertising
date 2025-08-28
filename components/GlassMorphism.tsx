// GlassMorphism Component
// Advanced glass morphism effects with noise texture and depth

interface GlassMorphismProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'intense' | 'dark';
  className?: string;
  animate?: boolean;
}

const GlassMorphism: React.FC<GlassMorphismProps> = ({
  children,
  intensity = 'medium',
  className = '',
  animate = false
}) => {
  const getIntensityClass = () => {
    switch (intensity) {
      case 'light':
        return 'premium-glass';
      case 'intense':
        return 'glass-intense';
      case 'dark':
        return 'glass-dark';
      default:
        return 'premium-glass';
    }
  };

  const animationClass = animate ? 'glass-animate' : '';

  return (
    <div className={`${getIntensityClass()} ${animationClass} ${className}`}>
      <div className="glass-content">
        {children}
      </div>
      <div className="glass-noise"></div>
    </div>
  );
};

// Vanilla JavaScript implementation for static sites
function createGlassMorphism(element, options = {}) {
  const {
    intensity = 'medium',
    animate = false,
    noiseOpacity = 0.02
  } = options;

  // Add base glass class
  element.classList.add('premium-glass');
  
  // Add intensity variant
  if (intensity === 'intense') {
    element.classList.add('glass-intense');
  } else if (intensity === 'dark') {
    element.classList.add('glass-dark');
  }

  // Create noise overlay
  const noiseOverlay = document.createElement('div');
  noiseOverlay.style.position = 'absolute';
  noiseOverlay.style.inset = '0';
  noiseOverlay.style.pointerEvents = 'none';
  noiseOverlay.style.opacity = noiseOpacity;
  noiseOverlay.style.mixBlendMode = 'overlay';
  noiseOverlay.style.backgroundImage = `
    url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
  `;
  
  element.appendChild(noiseOverlay);

  // Add animation if requested
  if (animate) {
    element.style.animation = 'glass-shimmer 3s ease-in-out infinite';
    
    // Define animation if not already in CSS
    if (!document.querySelector('#glass-animations')) {
      const style = document.createElement('style');
      style.id = 'glass-animations';
      style.textContent = `
        @keyframes glass-shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Add hover effect
  element.addEventListener('mouseenter', () => {
    element.style.backdropFilter = 'blur(25px) saturate(200%)';
    element.style.webkitBackdropFilter = 'blur(25px) saturate(200%)';
  });

  element.addEventListener('mouseleave', () => {
    element.style.backdropFilter = '';
    element.style.webkitBackdropFilter = '';
  });

  return element;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GlassMorphism, createGlassMorphism };
}