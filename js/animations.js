/**
 * MaxiMax Advertising - Advanced Animation Controllers
 * Scroll animations, parallax effects, and visual enhancements
 * @version 2.0.0
 * @description Production-ready animation system with performance optimizations
 */

(function () {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    observerThreshold: 0.1,
    observerRootMargin: '0px 0px -50px 0px',
    animationDuration: 800,
    parallaxSpeed: {
      slow: 0.3,
      medium: 0.5,
      fast: 0.8
    },
    counterSpeed: 2000,
    typewriterSpeed: 100,
    particleCount: 50,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // ============================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ============================================

  class ScrollAnimationController {
    constructor() {
      this.animatedElements = new WeakSet();
      this.observers = new Map();
      this.init();
    }

    init() {
      if (CONFIG.reducedMotion) {
        this.disableAnimations();
        return;
      }

      this.setupObservers();
      this.initializeElements();
      this.setupStaggerAnimations();
    }

    setupObservers() {
      // Main animation observer
      const animationObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
            this.animateElement(entry.target);
            this.animatedElements.add(entry.target);

            // Unobserve if not repeating
            if (!entry.target.hasAttribute('data-animate-repeat')) {
              animationObserver.unobserve(entry.target);
            }
          }
        });
      }, {
        threshold: CONFIG.observerThreshold,
        rootMargin: CONFIG.observerRootMargin
      });

      this.observers.set('animation', animationObserver);

      // Counter observer
      const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
            this.animateCounter(entry.target);
            this.animatedElements.add(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.5
      });

      this.observers.set('counter', counterObserver);
    }

    initializeElements() {
      // Fade animations
      this.observeElements('.fade-in, [data-fade]', 'animation', el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
      });

      // Slide animations
      this.observeElements('.slide-left, [data-slide="left"]', 'animation', el => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50px)';
      });

      this.observeElements('.slide-right, [data-slide="right"]', 'animation', el => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(50px)';
      });

      this.observeElements('.slide-up, [data-slide="up"]', 'animation', el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
      });

      // Scale animations
      this.observeElements('.scale-in, [data-scale]', 'animation', el => {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.8)';
      });

      // Rotate animations
      this.observeElements('.rotate-in, [data-rotate]', 'animation', el => {
        el.style.opacity = '0';
        el.style.transform = 'rotate(-10deg) scale(0.9)';
      });

      // Counter animations
      this.observeElements('.stat-number, .counter, [data-count]', 'counter');
    }

    observeElements(selector, observerType, prepareCallback = null) {
      const elements = document.querySelectorAll(selector);
      const observer = this.observers.get(observerType);

      if (!observer) {
        return;
      }

      elements.forEach(element => {
        if (prepareCallback) {
          prepareCallback(element);
        }

        // Set initial transition
        element.style.transition = `all ${CONFIG.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

        observer.observe(element);
      });
    }

    animateElement(element) {
      const delay = parseInt(element.dataset.animateDelay) || 0;

      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'none';
        element.classList.add('animated', 'in-view');

        // Dispatch custom event
        element.dispatchEvent(new CustomEvent('animation:complete'));
      }, delay);
    }

    animateCounter(element) {
      const target = parseFloat(element.dataset.count || element.dataset.target || element.textContent);
      if (isNaN(target)) {
        return;
      }

      const duration = parseInt(element.dataset.duration) || CONFIG.counterSpeed;
      const startTime = performance.now();
      const isDecimal = target % 1 !== 0;
      const decimals = isDecimal ? (target.toString().split('.')[1] || '').length : 0;

      const updateCounter = currentTime => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = target * easeOutCubic;

        if (progress < 1) {
          element.textContent = this.formatNumber(current, isDecimal, decimals);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = this.formatNumber(target, isDecimal, decimals);
          element.classList.add('counted');
        }
      };

      requestAnimationFrame(updateCounter);
    }

    formatNumber(num, isDecimal = false, decimals = 1) {
      if (isDecimal) {
        return num.toFixed(decimals);
      }
      return num >= 1000 ? num.toLocaleString() : Math.floor(num).toString();
    }

    setupStaggerAnimations() {
      const staggerContainers = document.querySelectorAll('[data-stagger]');

      staggerContainers.forEach(container => {
        const children = container.children;
        const staggerDelay = parseInt(container.dataset.stagger) || 100;

        Array.from(children).forEach((child, index) => {
          child.dataset.animateDelay = index * staggerDelay;
          child.classList.add('fade-in');
        });
      });
    }

    disableAnimations() {
      document.documentElement.classList.add('no-animations');
    }
  }

  // ============================================
  // PARALLAX CONTROLLER
  // ============================================

  class ParallaxController {
    constructor() {
      this.parallaxElements = [];
      this.ticking = false;
      this.init();
    }

    init() {
      if (CONFIG.reducedMotion) {
        return;
      }

      this.collectElements();
      this.bindEvents();
      this.updateParallax();
    }

    collectElements() {
      const elements = document.querySelectorAll('[data-parallax], .parallax-slow, .parallax-medium, .parallax-fast');

      this.parallaxElements = Array.from(elements).map(element => {
        const speed = element.dataset.parallax ||
                           (element.classList.contains('parallax-fast') ? CONFIG.parallaxSpeed.fast :
                             element.classList.contains('parallax-medium') ? CONFIG.parallaxSpeed.medium :
                               CONFIG.parallaxSpeed.slow);

        return {
          element,
          speed: parseFloat(speed),
          offset: element.getBoundingClientRect().top + window.pageYOffset
        };
      });
    }

    bindEvents() {
      window.addEventListener('scroll', () => this.requestUpdate(), { passive: true });
      window.addEventListener('resize', () => this.handleResize(), { passive: true });
    }

    requestUpdate() {
      if (!this.ticking) {
        requestAnimationFrame(() => this.updateParallax());
        this.ticking = true;
      }
    }

    updateParallax() {
      const scrollY = window.pageYOffset;
      const windowHeight = window.innerHeight;

      this.parallaxElements.forEach(({ element, speed, offset }) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.bottom >= 0 && rect.top <= windowHeight;

        if (isVisible) {
          const yPos = -(scrollY - offset) * speed;
          element.style.transform = `translate3d(0, ${yPos}px, 0)`;
          element.style.willChange = 'transform';
        }
      });

      this.ticking = false;
    }

    handleResize() {
      this.collectElements();
      this.updateParallax();
    }
  }

  // ============================================
  // CAROUSEL CONTROLLER
  // ============================================

  class CarouselController {
    constructor() {
      this.carousels = new Map();
      this.init();
    }

    init() {
      this.setupCarousels();
    }

    setupCarousels() {
      // Client logos carousel
      const clientsTrack = document.querySelector('.clients-track');
      if (clientsTrack) {
        this.createInfiniteScroll(clientsTrack);
      }

      // Any other carousels with data-carousel attribute
      document.querySelectorAll('[data-carousel]').forEach(carousel => {
        this.initCarousel(carousel);
      });
    }

    createInfiniteScroll(track) {
      const items = track.children;
      if (items.length === 0) {
        return;
      }

      // Clone items for seamless loop
      Array.from(items).forEach(item => {
        const clone = item.cloneNode(true);
        track.appendChild(clone);
      });

      // Auto-scroll animation
      let scrollPos = 0;
      const scrollSpeed = 1;

      const scroll = () => {
        scrollPos += scrollSpeed;

        if (scrollPos >= track.scrollWidth / 2) {
          scrollPos = 0;
        }

        track.style.transform = `translateX(-${scrollPos}px)`;

        if (!CONFIG.reducedMotion) {
          requestAnimationFrame(scroll);
        }
      };

      // Pause on hover
      track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
      });

      track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
      });

      if (!CONFIG.reducedMotion) {
        requestAnimationFrame(scroll);
      }
    }

    initCarousel(carousel) {
      const slides = carousel.querySelectorAll('[data-slide]');
      const autoPlay = carousel.dataset.autoplay !== 'false';
      const interval = parseInt(carousel.dataset.interval) || 5000;

      let currentSlide = 0;
      let autoPlayTimer = null;

      const showSlide = index => {
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === index);
        });
      };

      const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      };

      const prevSlide = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      };

      // Navigation buttons
      const nextBtn = carousel.querySelector('.carousel-next');
      const prevBtn = carousel.querySelector('.carousel-prev');

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          nextSlide();
          resetAutoPlay();
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          prevSlide();
          resetAutoPlay();
        });
      }

      // Auto-play
      const startAutoPlay = () => {
        if (autoPlay && !CONFIG.reducedMotion) {
          autoPlayTimer = setInterval(nextSlide, interval);
        }
      };

      const resetAutoPlay = () => {
        clearInterval(autoPlayTimer);
        startAutoPlay();
      };

      // Pause on hover
      carousel.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
      carousel.addEventListener('mouseleave', startAutoPlay);

      // Initialize
      showSlide(0);
      startAutoPlay();

      this.carousels.set(carousel, { currentSlide, nextSlide, prevSlide });
    }
  }

  // ============================================
  // TRUCK ANIMATION CONTROLLER
  // ============================================

  class TruckAnimationController {
    constructor() {
      this.trucks = [];
      this.init();
    }

    init() {
      this.setupMovingTrucks();
      this.setupGPSVisualization();
      this.setup3DTruckEffect();
    }

    setupMovingTrucks() {
      const movingTrucks = document.querySelectorAll('.moving-truck, .truck-visual');

      movingTrucks.forEach((truck, index) => {
        // Randomize animation for variety
        const duration = 15 + Math.random() * 10;
        const delay = index * 2;

        truck.style.animationDuration = `${duration}s`;
        truck.style.animationDelay = `${delay}s`;

        // Add wheel rotation
        const wheels = truck.querySelectorAll('.wheel');
        wheels.forEach(wheel => {
          wheel.style.animationDuration = '1s';
        });
      });
    }

    setupGPSVisualization() {
      const gpsPoints = document.querySelectorAll('.coverage-point');
      const paths = document.querySelectorAll('.gps-path');

      // Animate GPS points with stagger
      gpsPoints.forEach((point, index) => {
        point.style.animationDelay = `${index * 0.5}s`;

        // Add pulse effect on hover
        point.addEventListener('mouseenter', () => {
          point.style.animationIterationCount = 'infinite';
        });

        point.addEventListener('mouseleave', () => {
          point.style.animationIterationCount = '1';
        });
      });

      // Animate paths
      paths.forEach((path, index) => {
        if (path instanceof SVGPathElement) {
          const length = path.getTotalLength();
          path.style.strokeDasharray = length;
          path.style.strokeDashoffset = length;
          path.style.animation = `draw-path 2s ease-in-out ${index * 0.5}s forwards`;
        }
      });
    }

    setup3DTruckEffect() {
      const truck3d = document.querySelector('.truck-3d, .truck-visual');
      if (!truck3d || CONFIG.reducedMotion) {
        return;
      }

      let mouseX = 0;
      let mouseY = 0;
      let currentX = 0;
      let currentY = 0;
      let animationId = null;

      const handleMouseMove = e => {
        const rect = truck3d.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        mouseX = ((e.clientX - centerX) / rect.width) * 20;
        mouseY = ((e.clientY - centerY) / rect.height) * 20;
      };

      const animate3D = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        truck3d.style.transform = `
                    perspective(1000px)
                    rotateY(${currentX}deg)
                    rotateX(${-currentY}deg)
                    translateZ(50px)
                `;

        animationId = requestAnimationFrame(animate3D);
      };

      // Start animation on hover
      truck3d.addEventListener('mouseenter', () => {
        document.addEventListener('mousemove', handleMouseMove);
        animate3D();
      });

      truck3d.addEventListener('mouseleave', () => {
        document.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationId);

        // Reset position
        truck3d.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateZ(0)';
      });
    }
  }

  // ============================================
  // TEXT ANIMATION CONTROLLER
  // ============================================

  class TextAnimationController {
    constructor() {
      this.init();
    }

    init() {
      this.setupTypewriter();
      this.setupSplitText();
      this.setupTextHighlight();
    }

    setupTypewriter() {
      const typewriters = document.querySelectorAll('.typewriter, [data-typewriter]');

      typewriters.forEach(element => {
        const text = element.textContent;
        const speed = parseInt(element.dataset.speed) || CONFIG.typewriterSpeed;

        element.textContent = '';
        element.style.minHeight = `${element.offsetHeight}px`;

        let index = 0;

        const type = () => {
          if (index < text.length) {
            element.textContent += text[index];
            index++;
            setTimeout(type, speed);
          }
        };

        // Start typing when visible
        const observer = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            type();
            observer.disconnect();
          }
        });

        observer.observe(element);
      });
    }

    setupSplitText() {
      const splitTexts = document.querySelectorAll('.split-text, [data-split]');

      splitTexts.forEach(element => {
        const text = element.textContent;
        element.innerHTML = '';

        text.split('').forEach((char, index) => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.display = 'inline-block';
          span.style.opacity = '0';
          span.style.transform = 'translateY(20px)';
          span.style.transition = `all 0.5s ease ${index * 0.03}s`;
          element.appendChild(span);
        });

        // Animate on visibility
        const observer = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            element.querySelectorAll('span').forEach(span => {
              span.style.opacity = '1';
              span.style.transform = 'translateY(0)';
            });
            observer.disconnect();
          }
        });

        observer.observe(element);
      });
    }

    setupTextHighlight() {
      const highlights = document.querySelectorAll('.highlight, [data-highlight]');

      highlights.forEach(element => {
        const color = element.dataset.highlight || 'var(--maximax-pink)';

        element.style.position = 'relative';
        element.style.zIndex = '1';

        const highlighter = document.createElement('span');
        highlighter.style.cssText = `
                    position: absolute;
                    left: -2px;
                    right: -2px;
                    bottom: 0;
                    height: 40%;
                    background: ${color};
                    opacity: 0.3;
                    z-index: -1;
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.5s ease;
                `;

        element.appendChild(highlighter);

        // Animate on visibility
        const observer = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            highlighter.style.transform = 'scaleX(1)';
            observer.disconnect();
          }
        });

        observer.observe(element);
      });
    }
  }

  // ============================================
  // HOVER EFFECTS CONTROLLER
  // ============================================

  class HoverEffectsController {
    constructor() {
      this.init();
    }

    init() {
      this.setupMagneticButtons();
      this.setup3DCards();
      this.setupRippleEffect();
      this.setupGlowEffect();
    }

    setupMagneticButtons() {
      const magneticButtons = document.querySelectorAll('.btn, button, [data-magnetic]');

      magneticButtons.forEach(button => {
        let boundingRect = button.getBoundingClientRect();

        button.addEventListener('mouseenter', () => {
          boundingRect = button.getBoundingClientRect();
        });

        button.addEventListener('mousemove', e => {
          const x = (e.clientX - boundingRect.left - boundingRect.width / 2) * 0.3;
          const y = (e.clientY - boundingRect.top - boundingRect.height / 2) * 0.3;

          button.style.transform = `translate(${x}px, ${y}px)`;
          button.style.transition = 'transform 0.1s ease-out';
        });

        button.addEventListener('mouseleave', () => {
          button.style.transform = 'translate(0, 0)';
          button.style.transition = 'transform 0.3s ease-out';
        });
      });
    }

    setup3DCards() {
      const cards = document.querySelectorAll('.service-card, .result-card, [data-tilt]');

      cards.forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;

          const tiltX = (y - 0.5) * 10;
          const tiltY = (x - 0.5) * -10;

          card.style.transform = `
                        perspective(1000px)
                        rotateX(${tiltX}deg)
                        rotateY(${tiltY}deg)
                        translateZ(10px)
                    `;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
      });
    }

    setupRippleEffect() {
      const rippleElements = document.querySelectorAll('.ripple, [data-ripple]');

      rippleElements.forEach(element => {
        element.style.position = 'relative';
        element.style.overflow = 'hidden';

        element.addEventListener('click', function (e) {
          const ripple = document.createElement('span');
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple-animation 0.6s ease-out;
                        pointer-events: none;
                    `;

          this.appendChild(ripple);

          setTimeout(() => ripple.remove(), 600);
        });
      });
    }

    setupGlowEffect() {
      const glowElements = document.querySelectorAll('[data-glow]');

      glowElements.forEach(element => {
        const color = element.dataset.glow || '#EC008C';

        element.addEventListener('mouseenter', () => {
          element.style.boxShadow = `0 0 30px ${color}40`;
          element.style.transition = 'box-shadow 0.3s ease';
        });

        element.addEventListener('mouseleave', () => {
          element.style.boxShadow = 'none';
        });
      });
    }
  }

  // ============================================
  // PERFORMANCE OPTIMIZATION
  // ============================================

  class PerformanceOptimizer {
    constructor() {
      this.init();
    }

    init() {
      this.detectLowEndDevice();
      this.optimizeAnimations();
      this.handleVisibilityChange();
    }

    detectLowEndDevice() {
      const isLowEnd = navigator.hardwareConcurrency <= 2 ||
                           navigator.deviceMemory <= 4 ||
                           navigator.connection?.effectiveType === 'slow-2g' ||
                           navigator.connection?.effectiveType === '2g';

      if (isLowEnd) {
        document.documentElement.classList.add('low-end-device');
        CONFIG.reducedMotion = true;
      }
    }

    optimizeAnimations() {
      // Reduce particle count on mobile
      if (window.innerWidth <= 768) {
        CONFIG.particleCount = 20;
      }

      // Disable complex animations on touch devices
      if ('ontouchstart' in window) {
        document.documentElement.classList.add('touch-device');
      }
    }

    handleVisibilityChange() {
      document.addEventListener('visibilitychange', () => {
        const animatedElements = document.querySelectorAll('[style*="animation"]');

        if (document.hidden) {
          animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
          });
        } else {
          animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
          });
        }
      });
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  document.addEventListener('DOMContentLoaded', () => {
    // Initialize all controllers
    const scrollAnimations = new ScrollAnimationController();
    const parallax = new ParallaxController();
    const carousel = new CarouselController();
    const truckAnimations = new TruckAnimationController();
    const textAnimations = new TextAnimationController();
    const hoverEffects = new HoverEffectsController();
    const optimizer = new PerformanceOptimizer();

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes draw-path {
                to {
                    stroke-dashoffset: 0;
                }
            }
            
            .no-animations * {
                animation: none !important;
                transition: none !important;
            }
            
            .low-end-device [data-parallax],
            .low-end-device .parallax-slow,
            .low-end-device .parallax-medium,
            .low-end-device .parallax-fast {
                transform: none !important;
            }
        `;
    document.head.appendChild(style);

    // Expose API
    window.MaxiMax = window.MaxiMax || {};
    window.MaxiMax.animations = {
      scrollAnimations,
      parallax,
      carousel,
      truckAnimations,
      textAnimations,
      hoverEffects
    };

    console.log('MaxiMax Animations initialized successfully');
  });
})();