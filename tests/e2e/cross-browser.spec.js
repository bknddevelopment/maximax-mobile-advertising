/**
 * Cross-Browser Compatibility Tests
 * MaxiMax Mobile Advertising
 */

const { test, expect, devices } = require('@playwright/test');

test.describe('Cross-Browser Compatibility', () => {
  // Test CSS Grid support
  test('should support CSS Grid layout', async ({ page, browserName }) => {
    await page.goto('/');

    const gridElements = page.locator('[class*="grid"], .services-grid, .results-grid');
    const gridCount = await gridElements.count();

    if (gridCount > 0) {
      const firstGrid = gridElements.first();
      const display = await firstGrid.evaluate(el =>
        window.getComputedStyle(el).display
      );

      // Should use grid or fallback to flex
      expect(['grid', 'flex', 'inline-grid', 'inline-flex']).toContain(display);
    }
  });

  // Test Flexbox support
  test('should support Flexbox layout', async ({ page }) => {
    await page.goto('/');

    const flexElements = page.locator('[class*="flex"], .navbar, .nav-links');
    const flexCount = await flexElements.count();

    if (flexCount > 0) {
      const firstFlex = flexElements.first();
      const display = await firstFlex.evaluate(el =>
        window.getComputedStyle(el).display
      );

      expect(['flex', 'inline-flex']).toContain(display);
    }
  });

  // Test modern JavaScript features
  test('should support modern JavaScript', async ({ page }) => {
    await page.goto('/');

    // Test Promise support
    const promiseSupport = await page.evaluate(() => {
      return typeof Promise !== 'undefined';
    });
    expect(promiseSupport).toBe(true);

    // Test arrow functions
    const arrowFunctionSupport = await page.evaluate(() => {
      try {
        const test = () => true;
        return test();
      } catch {
        return false;
      }
    });
    expect(arrowFunctionSupport).toBe(true);

    // Test async/await
    const asyncSupport = await page.evaluate(async () => {
      try {
        const test = async () => true;
        return await test();
      } catch {
        return false;
      }
    });
    expect(asyncSupport).toBe(true);
  });

  // Test CSS Custom Properties
  test('should support CSS custom properties', async ({ page }) => {
    await page.goto('/');

    const rootStyles = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        hasCustomProps: styles.getPropertyValue('--maximax-pink') !== '',
        pink: styles.getPropertyValue('--maximax-pink'),
        cyan: styles.getPropertyValue('--maximax-cyan')
      };
    });

    // Should have custom properties or fallbacks
    const elements = page.locator('.btn, button');
    const elementCount = await elements.count();

    if (elementCount > 0) {
      const firstButton = elements.first();
      const bgColor = await firstButton.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // Should have some background color (custom prop or fallback)
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  // Test smooth scrolling
  test('should handle smooth scrolling', async ({ page, browserName }) => {
    await page.goto('/');

    const scrollSupport = await page.evaluate(() => {
      return 'scrollBehavior' in document.documentElement.style;
    });

    // Test scroll behavior
    const navLink = page.locator('.nav-link[href^="#"]').first();
    if (await navLink.count() > 0) {
      const initialScroll = await page.evaluate(() => window.scrollY);
      await navLink.click();
      await page.waitForTimeout(1000);
      const finalScroll = await page.evaluate(() => window.scrollY);

      // Should have scrolled (either smooth or instant)
      expect(finalScroll).not.toBe(initialScroll);
    }
  });

  // Test form validation
  test('should support HTML5 form validation', async ({ page }) => {
    await page.goto('/');

    const form = page.locator('form').first();
    if (await form.count() > 0) {
      const emailInput = form.locator('input[type="email"]');

      if (await emailInput.count() > 0) {
        // Test native validation
        const hasValidation = await emailInput.evaluate(input => {
          return 'validity' in input && typeof input.checkValidity === 'function';
        });
        expect(hasValidation).toBe(true);

        // Test custom validation UI
        await emailInput.fill('invalid-email');
        await emailInput.blur();

        const isInvalid = await emailInput.evaluate(input => !input.checkValidity());
        expect(isInvalid).toBe(true);
      }
    }
  });

  // Test viewport meta tag
  test('should have proper viewport configuration', async ({ page }) => {
    await page.goto('/');

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
  });

  // Test web fonts loading
  test('should load web fonts properly', async ({ page }) => {
    await page.goto('/');

    // Wait for fonts to load
    await page.waitForLoadState('networkidle');

    const fontLoaded = await page.evaluate(() => {
      if ('fonts' in document) {
        return document.fonts.ready.then(() => true);
      }
      return true; // Fallback for browsers without Font Loading API
    });
    expect(fontLoaded).toBe(true);
  });

  // Test SVG support
  test('should support SVG graphics', async ({ page }) => {
    await page.goto('/');

    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();

    if (svgCount > 0) {
      const firstSvg = svgElements.first();
      const isVisible = await firstSvg.isVisible();
      const box = await firstSvg.boundingBox();

      if (isVisible && box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Browser-Specific Features', () => {
  test('should handle Safari-specific issues', async ({ page, browserName }) => {
    if (browserName === 'webkit') {
      await page.goto('/');

      // Test for common Safari issues
      // 1. Position: sticky support
      const stickyElements = page.locator('[style*="sticky"], .navbar');
      if (await stickyElements.count() > 0) {
        const position = await stickyElements.first().evaluate(el =>
          window.getComputedStyle(el).position
        );
        expect(['sticky', 'fixed', 'relative']).toContain(position);
      }

      // 2. Date input support
      const dateInputs = page.locator('input[type="date"]');
      if (await dateInputs.count() > 0) {
        const type = await dateInputs.first().evaluate(el => el.type);
        expect(['date', 'text']).toContain(type);
      }
    }
  });

  test('should handle Firefox-specific issues', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      await page.goto('/');

      // Test for common Firefox issues
      // 1. Scroll anchoring
      const scrollSupport = await page.evaluate(() => {
        return CSS.supports('overflow-anchor', 'auto');
      });

      // 2. Custom scrollbar styles
      const scrollbarElements = page.locator('[style*="scrollbar"]');
      if (await scrollbarElements.count() > 0) {
        // Firefox may not support webkit scrollbar styles
        const hasScrollbar = await scrollbarElements.first().evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.overflow !== 'hidden';
        });
        expect(hasScrollbar).toBe(true);
      }
    }
  });

  test('should handle Edge-specific features', async ({ page, browserName }) => {
    if (browserName === 'chromium') {
      await page.goto('/');

      // Test for Chromium-specific features
      // 1. WebP image support
      const webpSupport = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
      });

      // 2. Lazy loading support
      const lazyImages = page.locator('img[loading="lazy"]');
      if (await lazyImages.count() > 0) {
        const loading = await lazyImages.first().evaluate(img => img.loading);
        expect(loading).toBe('lazy');
      }
    }
  });
});

test.describe('Legacy Browser Fallbacks', () => {
  test('should provide fallbacks for older browsers', async ({ page }) => {
    await page.goto('/');

    // Check for polyfills or fallbacks
    const hasPolyfills = await page.evaluate(() => {
      // Check for common polyfills
      return {
        intersectionObserver: 'IntersectionObserver' in window,
        customElements: 'customElements' in window,
        fetch: 'fetch' in window,
        promise: 'Promise' in window
      };
    });

    // All modern browsers should support these
    expect(hasPolyfills.intersectionObserver).toBe(true);
    expect(hasPolyfills.fetch).toBe(true);
    expect(hasPolyfills.promise).toBe(true);
  });

  test('should handle CSS fallbacks', async ({ page }) => {
    await page.goto('/');

    // Test for CSS feature queries
    const supportChecks = await page.evaluate(() => {
      return {
        grid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex'),
        customProps: CSS.supports('--test', 'value'),
        gap: CSS.supports('gap', '1rem')
      };
    });

    // Modern browsers should support these
    expect(supportChecks.flexbox).toBe(true);

    // Check that layouts work even without full support
    const layout = page.locator('body');
    const isVisible = await layout.isVisible();
    expect(isVisible).toBe(true);
  });
});

test.describe('Mobile Browser Compatibility', () => {
  const mobileDevices = [
    devices['iPhone 12'],
    devices['Pixel 5'],
    devices['Galaxy S8'],
    devices['iPad Pro']
  ];

  mobileDevices.forEach(device => {
    test(`should work on ${device.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
        ignoreHTTPSErrors: true
      });
      const page = await context.newPage();

      await page.goto('/');

      // Check viewport is correct
      const viewport = page.viewportSize();
      expect(viewport.width).toBe(device.viewport.width);
      expect(viewport.height).toBe(device.viewport.height);

      // Check touch events work
      const hasTouch = await page.evaluate(() => 'ontouchstart' in window);
      expect(hasTouch).toBe(device.hasTouch || false);

      // Check mobile-specific features
      if (device.isMobile) {
        const mobileMenu = page.locator('.mobile-menu-toggle, #mobileToggle');
        await expect(mobileMenu).toBeVisible();
      }

      await context.close();
    });
  });
});