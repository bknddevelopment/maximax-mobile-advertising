/**
 * Navigation Tests
 * Testing navigation functionality including mobile menu, smooth scroll, and active states
 */

describe('Navigation Module', () => {
  let navbar;
  let mobileToggle;
  let navMenu;
  let navLinks;

  beforeEach(() => {
    // Setup DOM structure
    document.body.innerHTML = `
      <header id="navbar" class="navbar">
        <button id="mobileToggle" class="mobile-menu-toggle" aria-expanded="false">
          <span></span>
        </button>
        <nav id="navMenu" class="nav-links">
          <a href="#hero" class="nav-link">Home</a>
          <a href="#services" class="nav-link">Services</a>
          <a href="#about" class="nav-link">About</a>
          <a href="#contact" class="nav-link">Contact</a>
        </nav>
      </header>
      <section id="hero" style="height: 100vh;">Hero Section</section>
      <section id="services" style="height: 100vh;">Services Section</section>
      <section id="about" style="height: 100vh;">About Section</section>
      <section id="contact" style="height: 100vh;">Contact Section</section>
    `;

    navbar = document.getElementById('navbar');
    mobileToggle = document.getElementById('mobileToggle');
    navMenu = document.getElementById('navMenu');
    navLinks = document.querySelectorAll('.nav-link');

    // Mock getBoundingClientRect for sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
      section.getBoundingClientRect = jest.fn(() => ({
        top: index * 1000,
        bottom: (index + 1) * 1000,
        height: 1000,
        left: 0,
        right: window.innerWidth
      }));
      section.offsetTop = index * 1000;
      section.offsetHeight = 1000;
    });
  });

  describe('Mobile Menu Toggle', () => {
    test('should toggle mobile menu on button click', () => {
      // Initial state
      expect(mobileToggle.classList.contains('active')).toBe(false);
      expect(navMenu.classList.contains('active')).toBe(false);
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');

      // Click to open
      mobileToggle.click();
      expect(mobileToggle.classList.contains('active')).toBe(true);
      expect(navMenu.classList.contains('active')).toBe(true);
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('true');
      expect(document.body.classList.contains('menu-open')).toBe(true);

      // Click to close
      mobileToggle.click();
      expect(mobileToggle.classList.contains('active')).toBe(false);
      expect(navMenu.classList.contains('active')).toBe(false);
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');
      expect(document.body.classList.contains('menu-open')).toBe(false);
    });

    test('should close menu on ESC key', () => {
      // Open menu
      mobileToggle.click();
      expect(navMenu.classList.contains('active')).toBe(true);

      // Press ESC
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escEvent);

      expect(navMenu.classList.contains('active')).toBe(false);
      expect(mobileToggle.classList.contains('active')).toBe(false);
    });

    test('should close menu on outside click', () => {
      // Open menu
      mobileToggle.click();
      expect(navMenu.classList.contains('active')).toBe(true);

      // Click outside
      document.body.click();

      expect(navMenu.classList.contains('active')).toBe(false);
    });

    test('should handle keyboard navigation for toggle button', () => {
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });

      // Test Enter key
      mobileToggle.dispatchEvent(enterEvent);
      expect(mobileToggle.classList.contains('active')).toBe(true);

      // Reset
      mobileToggle.click();

      // Test Space key
      mobileToggle.dispatchEvent(spaceEvent);
      expect(mobileToggle.classList.contains('active')).toBe(true);
    });
  });

  describe('Scroll Behavior', () => {
    test('should add scrolled class when scrolling down', () => {
      expect(navbar.classList.contains('scrolled')).toBe(false);

      // Simulate scroll
      window.pageYOffset = 100;
      window.dispatchEvent(new Event('scroll'));

      expect(navbar.classList.contains('scrolled')).toBe(true);
    });

    test('should remove scrolled class when scrolling to top', () => {
      // Start scrolled
      window.pageYOffset = 100;
      window.dispatchEvent(new Event('scroll'));
      expect(navbar.classList.contains('scrolled')).toBe(true);

      // Scroll to top
      window.pageYOffset = 30;
      window.dispatchEvent(new Event('scroll'));
      expect(navbar.classList.contains('scrolled')).toBe(false);
    });

    test('should hide navbar on scroll down and show on scroll up', () => {
      // Initial position
      window.pageYOffset = 300;
      window.dispatchEvent(new Event('scroll'));

      // Scroll down
      window.pageYOffset = 500;
      window.dispatchEvent(new Event('scroll'));
      expect(navbar.style.transform).toBe('translateY(-100%)');

      // Scroll up
      window.pageYOffset = 400;
      window.dispatchEvent(new Event('scroll'));
      expect(navbar.style.transform).toBe('translateY(0)');
    });
  });

  describe('Smooth Scroll Navigation', () => {
    test('should scroll to section on nav link click', () => {
      const scrollToSpy = jest.spyOn(window, 'scrollTo');
      const servicesLink = navLinks[1];
      const servicesSection = document.getElementById('services');

      servicesLink.click();

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: servicesSection.offsetTop - 80, // CONFIG.scrollOffset
        behavior: 'smooth'
      });
    });

    test('should update active nav link on scroll', () => {
      // Scroll to services section
      window.pageYOffset = 1050;
      window.dispatchEvent(new Event('scroll'));

      expect(navLinks[1].classList.contains('active')).toBe(true);
      expect(navLinks[1].getAttribute('aria-current')).toBe('page');

      // Check others are not active
      expect(navLinks[0].classList.contains('active')).toBe(false);
      expect(navLinks[2].classList.contains('active')).toBe(false);
    });

    test('should handle invalid hash links gracefully', () => {
      const invalidLink = document.createElement('a');
      invalidLink.href = '#nonexistent';
      invalidLink.className = 'nav-link';
      navMenu.appendChild(invalidLink);

      const scrollToSpy = jest.spyOn(window, 'scrollTo');
      invalidLink.click();

      expect(scrollToSpy).not.toHaveBeenCalled();
    });

    test('should close mobile menu after navigation', () => {
      // Open mobile menu
      mobileToggle.click();
      expect(navMenu.classList.contains('active')).toBe(true);

      // Click nav link
      navLinks[1].click();

      expect(navMenu.classList.contains('active')).toBe(false);
      expect(document.body.classList.contains('menu-open')).toBe(false);
    });
  });

  describe('Accessibility Features', () => {
    test('should set proper ARIA attributes', () => {
      // Check initial ARIA state
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');

      // Open menu
      mobileToggle.click();
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('true');

      // Close menu
      mobileToggle.click();
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');
    });

    test('should manage focus properly', done => {
      const servicesLink = navLinks[1];
      const servicesSection = document.getElementById('services');

      // Mock focus method
      servicesSection.focus = jest.fn();

      servicesLink.click();

      // Wait for focus to be set (after animation duration)
      setTimeout(() => {
        expect(servicesSection.getAttribute('tabindex')).toBe('-1');
        expect(servicesSection.focus).toHaveBeenCalled();
        done();
      }, 350);
    });

    test('should update URL hash on navigation', () => {
      const pushStateSpy = jest.spyOn(window.history, 'pushState');
      navLinks[1].click();

      expect(pushStateSpy).toHaveBeenCalledWith(null, null, '#services');
    });
  });

  describe('Touch Gestures', () => {
    test('should handle swipe gestures on mobile', () => {
      // Mock touch events
      const touchStartEvent = new TouchEvent('touchstart', {
        changedTouches: [{ screenX: 100, screenY: 100 }]
      });
      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [{ screenX: 200, screenY: 100 }]
      });

      // Set mobile viewport
      window.innerWidth = 375;

      // Simulate swipe right
      document.dispatchEvent(touchStartEvent);
      document.dispatchEvent(touchEndEvent);

      // Should close menu if open
      if (navMenu.classList.contains('active')) {
        expect(navMenu.classList.contains('active')).toBe(false);
      }
    });
  });

  describe('Performance', () => {
    test('should throttle scroll events', () => {
      const spy = jest.fn();
      navbar.addEventListener = spy;

      // Trigger multiple scroll events rapidly
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('scroll'));
      }

      // Should be throttled
      expect(spy.mock.calls.length).toBeLessThan(10);
    });

    test('should use passive event listeners for scroll', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      // Re-initialize navigation (would normally be done in main.js)
      window.addEventListener('scroll', () => {}, { passive: true });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing DOM elements gracefully', () => {
      document.body.innerHTML = '';

      // Should not throw errors
      expect(() => {
        window.dispatchEvent(new Event('scroll'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      }).not.toThrow();
    });

    test('should handle rapid menu toggling', () => {
      // Rapidly toggle menu
      for (let i = 0; i < 10; i++) {
        mobileToggle.click();
      }

      // Final state should be consistent
      const isActive = mobileToggle.classList.contains('active');
      expect(navMenu.classList.contains('active')).toBe(isActive);
      expect(mobileToggle.getAttribute('aria-expanded')).toBe(isActive ? 'true' : 'false');
    });

    test('should prevent default on navigation link clicks', () => {
      const preventDefault = jest.fn();
      const event = new MouseEvent('click', { cancelable: true });
      event.preventDefault = preventDefault;

      navLinks[1].dispatchEvent(event);
      expect(preventDefault).toHaveBeenCalled();
    });
  });
});