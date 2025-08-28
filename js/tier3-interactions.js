/**
 * Tier 3 Advanced Interactions and Animations
 * MaxiMax Mobile Advertising
 * Premium interactions, scroll animations, and visual effects
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initTier3Features();
});

/**
 * Main initialization function
 */
function initTier3Features() {
  // Initialize all premium features
  initScrollRevealAnimations();
  initMagneticButtons();
  initParticleEffects();
  initGlassMorphismEffects();
  init3DCardEffects();
  initLEDAnimations();
  initHeatMapInteractions();
  initProgressiveLoading();
  initSmoothScrolling();
}

/**
 * Scroll-triggered reveal animations
 */
function initScrollRevealAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');

        // Stagger children animations
        const children = entry.target.querySelectorAll('.stagger-child');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('revealed');
          }, index * 100);
        });
      }
    });
  }, observerOptions);

  // Observe all elements with scroll animations
  document.querySelectorAll('.scroll-reveal, .scroll-scale, .scroll-rotate').forEach(el => {
    scrollObserver.observe(el);
  });
}

/**
 * Magnetic button interactions
 */
function initMagneticButtons() {
  const magneticButtons = document.querySelectorAll('.btn-tier3.magnetic, .magnetic-area');

  magneticButtons.forEach(button => {
    const magneticStrength = 0.3;
    const buttonRect = button.getBoundingClientRect();

    button.addEventListener('mousemove', e => {
      const centerX = buttonRect.left + buttonRect.width / 2;
      const centerY = buttonRect.top + buttonRect.height / 2;

      const deltaX = (e.clientX - centerX) * magneticStrength;
      const deltaY = (e.clientY - centerY) * magneticStrength;

      button.style.setProperty('--magnetic-x', deltaX);
      button.style.setProperty('--magnetic-y', deltaY);
      button.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    button.addEventListener('mouseleave', () => {
      button.style.setProperty('--magnetic-x', 0);
      button.style.setProperty('--magnetic-y', 0);
      button.style.transform = 'translate(0, 0)';
    });
  });
}

/**
 * Particle effects system
 */
function initParticleEffects() {
  const particleContainers = document.querySelectorAll('.particle-container');

  particleContainers.forEach(container => {
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 15}s`;
      particle.style.animationDuration = `${15 + Math.random() * 10}s`;

      // Random size
      const size = 2 + Math.random() * 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      container.appendChild(particle);
    }
  });

  // Impact particles on CTA clicks
  document.querySelectorAll('.cta-btn, .primary-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      createImpactParticles(e.clientX, e.clientY);
    });
  });
}

/**
 * Create impact particles at specific position
 */
function createImpactParticles(x, y) {
  const colors = ['#EC008C', '#00AEEF', '#FFFFFF'];
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = '6px';
    particle.style.height = '6px';
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';

    document.body.appendChild(particle);

    // Animate particle
    const angle = (Math.PI * 2 * i) / particleCount;
    const velocity = 50 + Math.random() * 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    let opacity = 1;
    let scale = 1;
    let posX = 0;
    let posY = 0;

    function animateParticle() {
      posX += vx * 0.02;
      posY += vy * 0.02;
      opacity -= 0.02;
      scale -= 0.01;

      if (opacity <= 0) {
        particle.remove();
        return;
      }

      particle.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
      particle.style.opacity = opacity;

      requestAnimationFrame(animateParticle);
    }

    requestAnimationFrame(animateParticle);
  }
}

/**
 * Enhanced glass morphism effects
 */
function initGlassMorphismEffects() {
  const glassElements = document.querySelectorAll('.premium-glass, .glass-intense, .card-premium');

  glassElements.forEach(element => {
    // Add dynamic blur on scroll
    let ticking = false;

    function updateBlur() {
      const scrolled = window.pageYOffset;
      const blur = Math.min(30, 10 + scrolled * 0.02);
      element.style.backdropFilter = `blur(${blur}px) saturate(180%)`;
      element.style.webkitBackdropFilter = `blur(${blur}px) saturate(180%)`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateBlur);
        ticking = true;
      }
    });
  });
}

/**
 * 3D card tilt effects
 */
function init3DCardEffects() {
  const cards = document.querySelectorAll('.card-3d, .depth-container');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(20px)
            `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });
}

/**
 * LED display animations
 */
function initLEDAnimations() {
  const ledDisplays = document.querySelectorAll('.led-pixel-grid');

  ledDisplays.forEach(display => {
    const pixels = display.querySelectorAll('.led-pixel');
    const messages = [
      'MAXIMAX',
      'MOBILE',
      'BILLBOARD',
      'SOUTH FLORIDA'
    ];

    let currentMessage = 0;

    // Create scrolling text effect
    function scrollMessage() {
      const message = messages[currentMessage];
      const pixelGroups = [];

      // Group pixels into columns
      for (let i = 0; i < 20; i++) {
        pixelGroups[i] = [];
        for (let j = 0; j < pixels.length / 20; j++) {
          pixelGroups[i].push(pixels[j * 20 + i]);
        }
      }

      // Animate columns
      pixelGroups.forEach((group, index) => {
        setTimeout(() => {
          group.forEach(pixel => {
            pixel.classList.add('active');
            setTimeout(() => {
              pixel.classList.remove('active');
            }, 2000);
          });
        }, index * 100);
      });

      currentMessage = (currentMessage + 1) % messages.length;
    }

    // Run animation every 4 seconds
    setInterval(scrollMessage, 4000);
    scrollMessage(); // Initial run
  });
}

/**
 * Heat map interactions
 */
function initHeatMapInteractions() {
  const heatZones = document.querySelectorAll('.heat-zone');

  heatZones.forEach(zone => {
    zone.style.cursor = 'pointer';

    zone.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.1)';
      this.querySelector('circle').style.filter = 'brightness(1.3)';
    });

    zone.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1)';
      this.querySelector('circle').style.filter = 'brightness(1)';
    });

    zone.addEventListener('click', function () {
      const zoneName = this.querySelector('text').textContent;
      showZoneDetails(zoneName);
    });
  });
}

/**
 * Show zone details modal
 */
function showZoneDetails(zoneName) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'zone-modal premium-glass';
  modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 2rem;
        border-radius: 20px;
        z-index: 10000;
        min-width: 300px;
        text-align: center;
    `;

  modal.innerHTML = `
        <h3 style="color: #EC008C; margin-bottom: 1rem;">${zoneName}</h3>
        <p style="color: #fff; margin-bottom: 0.5rem;">High-traffic zone with premium visibility</p>
        <p style="color: #00AEEF;">Daily Impressions: 50,000+</p>
        <button class="btn-tier3 aurora" style="margin-top: 1rem;" onclick="this.parentElement.remove()">
            Close
        </button>
    `;

  document.body.appendChild(modal);

  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
    `;
  backdrop.onclick = () => {
    modal.remove();
    backdrop.remove();
  };
  document.body.appendChild(backdrop);
}

/**
 * Progressive image loading
 */
function initProgressiveLoading() {
  const images = document.querySelectorAll('img[data-src]');

  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('fade-in');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });

  images.forEach(img => imageObserver.observe(img));
}

/**
 * Smooth scrolling with easing
 */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));

      if (target) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        function animation(currentTime) {
          if (start === null) {
            start = currentTime;
          }
          const timeElapsed = currentTime - start;
          const run = ease(timeElapsed, startPosition, distance, duration);
          window.scrollTo(0, run);
          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          }
        }

        function ease(t, b, c, d) {
          t /= d / 2;
          if (t < 1) {
            return c / 2 * t * t * t + b;
          }
          t -= 2;
          return c / 2 * (t * t * t + 2) + b;
        }

        requestAnimationFrame(animation);
      }
    });
  });
}

/**
 * Cursor glow effect
 */
function initCursorGlow() {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.style.cssText = `
        position: fixed;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(236, 0, 140, 0.3), transparent);
        pointer-events: none;
        z-index: 10000;
        transition: transform 0.1s ease;
        mix-blend-mode: screen;
    `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = `${e.clientX - 20}px`;
    glow.style.top = `${e.clientY - 20}px`;
  });

  document.addEventListener('mousedown', () => {
    glow.style.transform = 'scale(0.5)';
  });

  document.addEventListener('mouseup', () => {
    glow.style.transform = 'scale(1)';
  });
}

/**
 * Performance monitor (dev mode only)
 */
function initPerformanceMonitor() {
  if (window.location.hostname === 'localhost') {
    const monitor = document.createElement('div');
    monitor.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            border-radius: 5px;
            z-index: 10000;
        `;

    setInterval(() => {
      const fps = performance.now();
      monitor.textContent = `FPS: ${Math.round(1000 / (fps % 1000))}`;
    }, 100);

    document.body.appendChild(monitor);
  }
}

// Initialize cursor glow on desktop only
if (window.innerWidth > 768) {
  initCursorGlow();
}

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initTier3Features,
    createImpactParticles,
    showZoneDetails
  };
}