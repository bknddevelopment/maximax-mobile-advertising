/**
 * MaxiMax Advertising - Main JavaScript
 * Core functionality and initialization
 * @version 2.0.0
 * @description Production-ready vanilla JavaScript with optimized performance
 */

(function () {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    scrollOffset: 80,
    animationDuration: 300,
    debounceDelay: 150,
    throttleDelay: 16,
    lazyLoadOffset: 100,
    mobileBreakpoint: 768,
    tabletBreakpoint: 1024,
    counterDuration: 2000,
    parallaxSpeed: {
      slow: 0.3,
      medium: 0.5,
      fast: 0.8
    }
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const state = {
    isScrolling: false,
    lastScrollPosition: 0,
    isMobileMenuOpen: false,
    countersInitialized: new Set(),
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    touchStartX: 0,
    touchStartY: 0
  };

  // ============================================
  // DOM CACHE
  // ============================================

  const dom = {
    navbar: null,
    mobileToggle: null,
    navMenu: null,
    navLinks: null,
    sections: null,
    counters: null,
    parallaxElements: null,
    lazyImages: null,
    forms: null
  };

  // ============================================
  // INITIALIZATION
  // ============================================

  document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();

    if (!state.prefersReducedMotion) {
      initAnimations();
      initParallax();
    }

    initNavigation();
    initCounters();
    initScrollAnimations();
    initFormHandling();
    initModals();
    initTruckAnimations();
    initLazyLoading();
    initTouchGestures();
    initKeyboardShortcuts();
    initPerformanceMonitoring();


    console.log('MaxiMax JavaScript initialized successfully');
  });

  // ============================================
  // DOM CACHING
  // ============================================

  function cacheDOMElements() {
    dom.navbar = document.getElementById('navbar') || document.querySelector('header');
    dom.mobileToggle = document.getElementById('mobileToggle') || document.querySelector('.mobile-menu-toggle');
    dom.navMenu = document.getElementById('navMenu') || document.querySelector('.nav-links');
    dom.navLinks = document.querySelectorAll('.nav-link');
    dom.sections = document.querySelectorAll('section[id]');
    dom.counters = document.querySelectorAll('.stat-number, .result-number');
    dom.parallaxElements = document.querySelectorAll('.parallax-slow, .parallax-medium, .parallax-fast, [data-parallax]');
    dom.lazyImages = document.querySelectorAll('img[data-src]');
    dom.forms = document.querySelectorAll('form');
  }

  // ============================================
  // NAVIGATION
  // ============================================

  function initNavigation() {
    if (!dom.navbar) {
      return;
    }

    // Optimized scroll handler with throttling
    const handleScroll = throttle(() => {
      const currentScroll = window.pageYOffset;

      // Add scrolled class
      if (currentScroll > 50) {
        dom.navbar.classList.add('scrolled');
      } else {
        dom.navbar.classList.remove('scrolled');
      }

      // Hide/show on scroll direction
      if (currentScroll > state.lastScrollPosition && currentScroll > 200) {
        dom.navbar.style.transform = 'translateY(-100%)';
      } else {
        dom.navbar.style.transform = 'translateY(0)';
      }

      state.lastScrollPosition = currentScroll;
      updateActiveNavigation();
    }, CONFIG.throttleDelay);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile menu toggle with accessibility
    if (dom.mobileToggle) {
      dom.mobileToggle.addEventListener('click', toggleMobileMenu);
      dom.mobileToggle.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleMobileMenu();
        }
      });
    }

    // Smooth scroll with accessibility
    dom.navLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });

    // Close mobile menu on outside click
    document.addEventListener('click', e => {
      if (state.isMobileMenuOpen &&
                dom.navMenu && !dom.navMenu.contains(e.target) &&
                dom.mobileToggle && !dom.mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // ESC key to close mobile menu
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && state.isMobileMenuOpen) {
        closeMobileMenu();
      }
    });
  }

  function toggleMobileMenu() {
    state.isMobileMenuOpen = !state.isMobileMenuOpen;

    if (state.isMobileMenuOpen) {
      openMobileMenu();
    } else {
      closeMobileMenu();
    }
  }

  function openMobileMenu() {
    state.isMobileMenuOpen = true;
    dom.mobileToggle?.classList.add('active');
    dom.navMenu?.classList.add('active');
    document.body.classList.add('menu-open');
    dom.mobileToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    state.isMobileMenuOpen = false;
    dom.mobileToggle?.classList.remove('active');
    dom.navMenu?.classList.remove('active');
    document.body.classList.remove('menu-open');
    dom.mobileToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function handleSmoothScroll(e) {
    const link = e.currentTarget;
    const href = link.getAttribute('href');

    if (!href || !href.startsWith('#')) {
      return;
    }

    e.preventDefault();

    const targetSection = document.querySelector(href);
    if (!targetSection) {
      return;
    }

    const targetPosition = targetSection.offsetTop - CONFIG.scrollOffset;

    // Close mobile menu if open
    if (state.isMobileMenuOpen) {
      closeMobileMenu();
    }

    // Smooth scroll
    if (!state.prefersReducedMotion) {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, targetPosition);
    }

    // Update URL
    if (history.pushState) {
      history.pushState(null, null, href);
    }

    // Update active link
    dom.navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Set focus for accessibility
    setTimeout(() => {
      targetSection.setAttribute('tabindex', '-1');
      targetSection.focus();
    }, CONFIG.animationDuration);
  }

  function updateActiveNavigation() {
    const scrollPosition = window.pageYOffset;
    let currentSection = '';

    dom.sections.forEach(section => {
      const sectionTop = section.offsetTop - CONFIG.scrollOffset - 100;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        currentSection = section.getAttribute('id');
      }
    });

    dom.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  // ============================================
  // NUMBER COUNTERS
  // ============================================

  function initCounters() {
    if (!dom.counters || dom.counters.length === 0) {
      return;
    }

    const options = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !state.countersInitialized.has(entry.target)) {
          const counter = entry.target;
          const target = parseFloat(counter.getAttribute('data-target') || counter.getAttribute('data-count') || counter.textContent);

          if (!isNaN(target)) {
            animateCounter(counter, target);
            state.countersInitialized.add(counter);
            observer.unobserve(counter);
          }
        }
      });
    }, options);

    dom.counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(element, target) {
    if (state.prefersReducedMotion) {
      element.textContent = formatNumber(target);
      return;
    }

    const duration = CONFIG.counterDuration;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;
    const decimals = isDecimal ? (target.toString().split('.')[1] || '').length : 0;

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = target * easeOutCubic;

      if (progress < 1) {
        element.textContent = formatNumber(current, isDecimal, decimals);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = formatNumber(target, isDecimal, decimals);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  function formatNumber(num, isDecimal = false, decimals = 1) {
    if (isDecimal) {
      return num.toFixed(decimals);
    }

    // Add thousand separators for large numbers
    if (num >= 1000) {
      return num.toLocaleString();
    }

    return Math.floor(num).toString();
  }

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .reveal, [data-animate]');

    if (animatedElements.length === 0) {
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const animateObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const delay = element.dataset.animateDelay || 0;

          setTimeout(() => {
            element.classList.add('in-view', 'active');

            // Trigger animation event
            element.dispatchEvent(new CustomEvent('animationstart'));
          }, delay);

          // Only animate once unless specified
          if (!element.hasAttribute('data-animate-repeat')) {
            animateObserver.unobserve(element);
          }
        }
      });
    }, observerOptions);

    animatedElements.forEach(element => {
      animateObserver.observe(element);
    });

    // Stagger animations for grids
    const grids = document.querySelectorAll('.services-grid, .results-grid, [data-stagger]');
    grids.forEach(grid => {
      const children = grid.children;
      Array.from(children).forEach((child, index) => {
        child.style.animationDelay = `${index * 0.1}s`;
        child.classList.add('animate-on-scroll');
        child.dataset.animateDelay = index * 100;
      });
    });
  }

  // Initialize general animations
  function initAnimations() {
    // Add animation classes to elements
    const fadeElements = document.querySelectorAll('[data-fade]');
    fadeElements.forEach(el => {
      el.classList.add('animate-on-scroll');
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
    });
  }

  // ============================================
  // PARALLAX EFFECTS
  // ============================================

  function initParallax() {
    if (!dom.parallaxElements || dom.parallaxElements.length === 0) {
      return;
    }
    if (state.prefersReducedMotion) {
      return;
    }

    let ticking = false;

    function updateParallax() {
      const scrolled = window.pageYOffset;
      const windowHeight = window.innerHeight;

      dom.parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.bottom >= 0 && rect.top <= windowHeight;

        if (!isVisible) {
          return;
        }

        const speed = element.dataset.parallax ||
                            (element.classList.contains('parallax-fast') ? CONFIG.parallaxSpeed.fast :
                              element.classList.contains('parallax-medium') ? CONFIG.parallaxSpeed.medium :
                                CONFIG.parallaxSpeed.slow);

        const yPos = -(scrolled * speed);

        // Use transform3d for better performance
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        element.style.willChange = 'transform';
      });

      ticking = false;
    }

    const handleParallaxScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleParallaxScroll, { passive: true });

    // Initial call
    updateParallax();
  }

  // ============================================
  // FORM HANDLING
  // ============================================

  function initFormHandling() {
    if (!dom.forms || dom.forms.length === 0) {
      return;
    }

    dom.forms.forEach(form => {
      // Real-time validation
      const inputs = form.querySelectorAll('input, textarea, select');

      inputs.forEach(input => {
        // Character counter for textareas
        if (input.tagName === 'TEXTAREA' && input.maxLength > 0) {
          addCharacterCounter(input);
        }

        // Add validation on blur
        input.addEventListener('blur', () => validateField(input));

        // Live validation for certain fields
        if (input.type === 'email' || input.type === 'tel') {
          input.addEventListener('input', debounce(() => validateField(input), 500));
        }

        // Float label animation
        if (input.classList.contains('form-input')) {
          input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
          });

          input.addEventListener('blur', () => {
            if (!input.value) {
              input.parentElement.classList.remove('focused');
            }
          });
        }
      });

      // Handle form submission
      form.addEventListener('submit', handleFormSubmit);
    });
  }

  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.required;

    // Remove previous validation states
    field.classList.remove('valid', 'invalid');

    // Check if empty and required
    if (required && !value) {
      field.classList.add('invalid');
      showFieldError(field, 'This field is required');
      return false;
    }

    // Type-specific validation
    let isValid = true;

    switch (type) {
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!isValid) {
          showFieldError(field, 'Please enter a valid email');
        }
        break;

      case 'tel':
        isValid = /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10;
        if (!isValid) {
          showFieldError(field, 'Please enter a valid phone number');
        }
        break;
    }

    if (isValid && value) {
      field.classList.add('valid');
      hideFieldError(field);
    } else if (!isValid) {
      field.classList.add('invalid');
    }

    return isValid;
  }

  function showFieldError(field, message) {
    let errorElement = field.parentElement.querySelector('.field-error');

    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'field-error';
      errorElement.style.cssText = 'color: var(--maximax-pink, #EC008C); font-size: 0.875rem; margin-top: 0.25rem; display: block;';
      field.parentElement.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
  }

  function hideFieldError(field) {
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  function addCharacterCounter(textarea) {
    const maxLength = textarea.maxLength;
    const counter = document.createElement('span');
    counter.className = 'char-counter';
    counter.style.cssText = 'font-size: 0.75rem; color: var(--gray-500, #6B7280); display: block; text-align: right; margin-top: 0.25rem;';
    counter.textContent = `0 / ${maxLength}`;

    textarea.parentElement.appendChild(counter);

    textarea.addEventListener('input', () => {
      const length = textarea.value.length;
      counter.textContent = `${length} / ${maxLength}`;

      if (length > maxLength * 0.8) {
        counter.style.color = 'var(--maximax-pink, #EC008C)';
      } else {
        counter.style.color = 'var(--gray-500, #6B7280)';
      }
    });
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    // Validate all fields
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        showNotification('Please correct the errors in the form', 'error');
      }
      return;
    }

    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Submit form
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
    submitBtn.classList.add('loading');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Success state
    submitBtn.innerHTML = '✓ Sent Successfully!';
    submitBtn.classList.remove('loading');
    submitBtn.classList.add('success');

    // Show success message
    showNotification('Thank you! We\'ll contact you within 2 hours.', 'success');

    // Reset form
    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.classList.remove('success');

      // Clear validation states
      form.querySelectorAll('.valid, .invalid').forEach(field => {
        field.classList.remove('valid', 'invalid');
      });
    }, 3000);

    // Log form data (for debugging)
    console.log('Form submitted:', data);
  }

  // ============================================
  // MODALS
  // ============================================

  function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');

    if (modalTriggers.length === 0 && modals.length === 0) {
      return;
    }

    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', e => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
          openModal(modal);
        }
      });
    });

    modals.forEach(modal => {
      const closeBtn = modal.querySelector('.modal-close');

      closeBtn?.addEventListener('click', () => closeModal(modal));

      modal.addEventListener('click', e => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // ESC key to close modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
          closeModal(activeModal);
        }
      }
    });
  }

  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Trap focus
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Announce to screen readers
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    modal.setAttribute('aria-hidden', 'true');

    // Return focus to trigger element
    const trigger = document.querySelector(`[data-modal="${modal.id}"]`);
    if (trigger) {
      trigger.focus();
    }
  }

  // ============================================
  // TRUCK ANIMATIONS
  // ============================================

  function initTruckAnimations() {
    // Animated truck screen content
    const adSlides = document.querySelectorAll('.ad-slide');
    const truckVisuals = document.querySelectorAll('.truck-visual, .truck-body, .moving-truck');

    if (adSlides.length > 0) {
      let currentSlide = 0;

      setInterval(() => {
        adSlides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % adSlides.length;
        adSlides[currentSlide].classList.add('active');
      }, 3000);
    }

    // GPS tracking visualization
    const gpsPoints = document.querySelectorAll('.coverage-point');
    if (gpsPoints.length > 0) {
      gpsPoints.forEach((point, index) => {
        point.style.animationDelay = `${index * 0.5}s`;
      });
    }

    // 3D truck interaction
    const truck3d = document.querySelector('.truck-3d, .truck-visual');
    if (truck3d && !state.prefersReducedMotion) {
      let mouseX = 0;
      let mouseY = 0;
      let currentX = 0;
      let currentY = 0;
      let animationId = null;

      const handleMouseMove = throttle(e => {
        const rect = truck3d.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        mouseX = (e.clientX - centerX) / 10;
        mouseY = (e.clientY - centerY) / 10;
      }, 50);

      function animate3DTruck() {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        truck3d.style.transform = `perspective(1000px) rotateY(${currentX}deg) rotateX(${-currentY}deg)`;

        animationId = requestAnimationFrame(animate3DTruck);
      }

      // Start/stop animation based on visibility
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            document.addEventListener('mousemove', handleMouseMove);
            animate3DTruck();
          } else {
            document.removeEventListener('mousemove', handleMouseMove);
            if (animationId) {
              cancelAnimationFrame(animationId);
            }
          }
        });
      });

      observer.observe(truck3d);
    }

    // Animate moving trucks on map
    truckVisuals.forEach(truck => {
      if (truck.classList.contains('moving-truck')) {
        truck.style.animationDuration = `${15 + Math.random() * 10}s`;
      }
    });
  }

  // ============================================
  // NOTIFICATION SYSTEM
  // ============================================

  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // Add styles inline for independence
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 350px;
            padding: 16px 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 12px;
            border-left: 4px solid ${getNotificationColor(type)};
        `;

    notification.innerHTML = `
            <span class="notification-icon" style="font-size: 20px; color: ${getNotificationColor(type)};">
                ${getNotificationIcon(type)}
            </span>
            <span class="notification-message" style="flex: 1; color: #1A1A1A; font-size: 14px;">
                ${message}
            </span>
            <button class="notification-close" style="background: none; border: none; cursor: pointer; padding: 4px; color: #6B7280;">
                ✕
            </button>
        `;

    document.body.appendChild(notification);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
      closeNotification(notification);
    });

    // Show animation
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });

    // Auto remove
    setTimeout(() => {
      closeNotification(notification);
    }, 5000);
  }

  function closeNotification(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 300);
  }

  function getNotificationIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  function getNotificationColor(type) {
    const colors = {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    };
    return colors[type] || colors.info;
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function (...args) {
      const context = this;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  function isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= -offset &&
            rect.left >= -offset &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  }

  // ============================================
  // TOUCH GESTURES
  // ============================================

  function initTouchGestures() {
    if (!('ontouchstart' in window)) {
      return;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          // Swipe right
          handleSwipeRight();
        } else {
          // Swipe left
          handleSwipeLeft();
        }
      }
    }

    function handleSwipeRight() {
      // Close mobile menu if open
      if (state.isMobileMenuOpen) {
        closeMobileMenu();
      }
    }

    function handleSwipeLeft() {
      // Open mobile menu if on mobile
      if (window.innerWidth <= CONFIG.mobileBreakpoint && !state.isMobileMenuOpen) {
        openMobileMenu();
      }
    }
  }

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Skip if user is typing in input
      if (e.target.matches('input, textarea, select')) {
        return;
      }

      // Keyboard shortcuts
      switch (e.key) {
        case '/':
          // Focus search or first input
          e.preventDefault();
          const firstInput = document.querySelector('input:not([type="hidden"])');
          if (firstInput) {
            firstInput.focus();
          }
          break;

        case 'g':
          if (e.ctrlKey || e.metaKey) {
            // Go to top
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          break;
      }
    });

    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#hero';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
            position: fixed;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--maximax-pink, #EC008C);
            color: white;
            padding: 12px 24px;
            border-radius: 0 0 8px 8px;
            text-decoration: none;
            z-index: 10000;
            transition: top 0.3s;
        `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-100px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }


  // ============================================
  // LAZY LOADING
  // ============================================

  function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');

    if (lazyImages.length === 0) {
      return;
    }

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            loadImage(img);
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: `${CONFIG.lazyLoadOffset}px`
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      lazyImages.forEach(img => loadImage(img));
    }
  }

  function loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src) {
      return;
    }

    // Preload image
    const newImg = new Image();

    newImg.addEventListener('load', () => {
      img.src = src;
      if (srcset) {
        img.srcset = srcset;
      }
      img.classList.add('loaded');
      delete img.dataset.src;
      delete img.dataset.srcset;
    });

    newImg.addEventListener('error', () => {
      img.classList.add('error');
      console.error(`Failed to load image: ${src}`);
    });

    newImg.src = src;
  }

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================

  function initPerformanceMonitoring() {
    if (!window.performance || !window.performance.getEntriesByType) {
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];

        if (perfData) {
          const metrics = {
            'DNS Lookup': `${Math.round(perfData.domainLookupEnd - perfData.domainLookupStart)}ms`,
            'TCP Connection': `${Math.round(perfData.connectEnd - perfData.connectStart)}ms`,
            'Response Time': `${Math.round(perfData.responseEnd - perfData.responseStart)}ms`,
            'DOM Interactive': `${Math.round(perfData.domInteractive)}ms`,
            'DOM Complete': `${Math.round(perfData.domComplete)}ms`,
            'Load Complete': `${Math.round(perfData.loadEventEnd)}ms`
          };

          console.log('🚀 MaxiMax Performance Metrics:', metrics);

          // Check Core Web Vitals
          if ('PerformanceObserver' in window) {
            try {
              // Observe Largest Contentful Paint
              const lcpObserver = new PerformanceObserver(list => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', `${Math.round(lastEntry.renderTime || lastEntry.loadTime)}ms`);
              });
              lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

              // Observe First Input Delay
              const fidObserver = new PerformanceObserver(list => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                  console.log('FID:', `${Math.round(entry.processingStart - entry.startTime)}ms`);
                });
              });
              fidObserver.observe({ type: 'first-input', buffered: true });

              // Observe Cumulative Layout Shift
              let clsScore = 0;
              const clsObserver = new PerformanceObserver(list => {
                list.getEntries().forEach(entry => {
                  if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                  }
                });
              });
              clsObserver.observe({ type: 'layout-shift', buffered: true });

              setTimeout(() => {
                console.log('CLS Score:', clsScore.toFixed(3));
              }, 5000);
            } catch (e) {
              // Silent fail for unsupported metrics
            }
          }
        }
      }, 0);
    });

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const taskObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: `${Math.round(entry.duration)}ms`,
                startTime: `${Math.round(entry.startTime)}ms`
              });
            }
          }
        });
        taskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Silent fail
      }
    }
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  window.addEventListener('error', e => {
    console.error('JavaScript Error:', e.error);
  });

  window.addEventListener('unhandledrejection', e => {
    console.error('Unhandled Promise Rejection:', e.reason);
  });

  // ============================================
  // PUBLIC API
  // ============================================

  // Expose API for external use
  window.MaxiMax = window.MaxiMax || {};
  window.MaxiMax.main = {
    state,
    config: CONFIG,
    utils: {
      debounce,
      throttle,
      isInViewport,
      showNotification
    },
    openModal,
    closeModal
  };
})(); // End of IIFE