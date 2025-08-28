/**
 * Accessibility Tests (WCAG AAA Compliance)
 * MaxiMax Mobile Advertising
 */

const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y, getViolations } = require('axe-playwright');

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('should pass WCAG AAA standards on homepage', async ({ page }) => {
    const violations = await getViolations(page, null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2aaa', 'wcag21aaa', 'best-practice']
      }
    });

    if (violations.length > 0) {
      console.log('Accessibility violations:', violations);
    }

    expect(violations).toHaveLength(0);
  });

  test('should have proper focus management', async ({ page }) => {
    // Tab through interactive elements
    const interactiveElements = page.locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const elementCount = await interactiveElements.count();

    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(focusedElement).not.toBe('BODY');
    }
  });

  test('should have skip to content link', async ({ page }) => {
    // Focus on skip link
    await page.keyboard.press('Tab');

    const skipLink = page.locator('a[href="#hero"], a[href="#main"], .skip-to-content');
    const isSkipLinkVisible = await skipLink.isVisible();

    if (!isSkipLinkVisible) {
      // Try focusing to reveal it
      await page.keyboard.press('Tab');
    }

    // Skip link should exist (visible or hidden but focusable)
    const skipLinkCount = await skipLink.count();
    expect(skipLinkCount).toBeGreaterThan(0);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check navigation has proper ARIA
    const nav = page.locator('nav');
    const navAriaLabel = await nav.getAttribute('aria-label');
    if (!navAriaLabel) {
      const navRole = await nav.getAttribute('role');
      expect(navRole).toBe('navigation');
    }

    // Check buttons have accessible text or ARIA labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text || ariaLabel).toBeTruthy();
    }

    // Check form inputs have labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute('id');

      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`);
        const labelCount = await label.count();

        if (labelCount === 0) {
          // Check for aria-label or aria-labelledby
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledby = await input.getAttribute('aria-labelledby');
          expect(ariaLabel || ariaLabelledby).toBeTruthy();
        }
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const violations = await getViolations(page, null, {
      runOnly: {
        type: 'rule',
        values: ['color-contrast-enhanced']
      }
    });

    expect(violations).toHaveLength(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test mobile menu can be opened with keyboard
    const mobileToggle = page.locator('#mobileToggle, .mobile-menu-toggle');

    if (await mobileToggle.isVisible()) {
      await mobileToggle.focus();
      await page.keyboard.press('Enter');

      const navMenu = page.locator('#navMenu, .nav-links');
      await expect(navMenu).toBeVisible();

      // Should be able to close with Escape
      await page.keyboard.press('Escape');
      await expect(navMenu).not.toBeVisible();
    }
  });

  test('should have alternative text for images', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Decorative images should have role="presentation" or empty alt=""
      if (role !== 'presentation') {
        expect(alt).toBeTruthy();
        expect(alt.length).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper heading structure', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = [];

    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName);
      const level = parseInt(tagName.substring(1));
      headingLevels.push(level);
    }

    // Check for proper hierarchy (no skipping levels)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('should handle reduced motion preference', async ({ page, context }) => {
    // Create context with reduced motion
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        value: query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {}
        })
      });
    });

    await page.reload();

    // Check that animations are disabled
    const animatedElements = page.locator('[data-animate], .animate-on-scroll');
    const elementCount = await animatedElements.count();

    if (elementCount > 0) {
      const firstElement = animatedElements.first();
      const transition = await firstElement.evaluate(el =>
        window.getComputedStyle(el).transition
      );

      // Transitions should be instant or disabled
      expect(transition === 'none' || transition.includes('0s')).toBeTruthy();
    }
  });

  test('should have proper form validation messages', async ({ page }) => {
    const form = page.locator('form').first();

    if (await form.count() > 0) {
      const emailInput = form.locator('input[type="email"]');

      if (await emailInput.count() > 0) {
        // Enter invalid email
        await emailInput.fill('invalid-email');
        await emailInput.blur();

        // Check for error message
        const errorMessage = form.locator('.field-error, [role="alert"]');
        await expect(errorMessage).toBeVisible();

        // Error should have proper ARIA role
        const role = await errorMessage.getAttribute('role');
        expect(role).toBe('alert');
      }
    }
  });

  test('should have lang attribute', async ({ page }) => {
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  test('should have proper focus indicators', async ({ page }) => {
    // Check that focused elements have visible focus indicators
    const link = page.locator('a').first();
    await link.focus();

    const outline = await link.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline || styles.boxShadow;
    });

    expect(outline).not.toBe('none');
    expect(outline).not.toBe('0px');
  });

  test('should support screen reader announcements', async ({ page }) => {
    // Check for live regions
    const liveRegions = page.locator('[aria-live], [role="alert"], [role="status"]');
    const liveRegionCount = await liveRegions.count();

    // Submit a form to trigger announcements
    const form = page.locator('form').first();
    if (await form.count() > 0) {
      const submitButton = form.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();

        // Wait for announcement
        await page.waitForTimeout(500);

        // Check for live region updates
        const alerts = page.locator('[role="alert"]');
        const alertCount = await alerts.count();
        expect(alertCount).toBeGreaterThan(0);
      }
    }
  });

  test('should have consistent navigation', async ({ page }) => {
    // Navigation should be consistent across pages
    const navLinks = await page.locator('.nav-link').allTextContents();

    // Navigate to another page and check consistency
    const firstLink = page.locator('.nav-link').first();
    const href = await firstLink.getAttribute('href');

    if (href && !href.startsWith('#')) {
      await firstLink.click();
      await page.waitForLoadState();

      const newNavLinks = await page.locator('.nav-link').allTextContents();
      expect(newNavLinks).toEqual(navLinks);
    }
  });
});

test.describe('Mobile Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await injectAxe(page);
  });

  test('should be accessible on mobile devices', async ({ page }) => {
    const violations = await getViolations(page);
    expect(violations).toHaveLength(0);
  });

  test('should have touch-friendly targets', async ({ page }) => {
    const interactiveElements = page.locator('a, button, input, textarea, select');
    const elementCount = await interactiveElements.count();

    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = interactiveElements.nth(i);
      const box = await element.boundingBox();

      if (box) {
        // WCAG AAA requires 44x44 pixels minimum
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});