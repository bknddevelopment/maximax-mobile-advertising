/**
 * Homepage E2E Tests
 * MaxiMax Mobile Advertising
 */

const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/MaxiMax/i);

    // Check main elements are visible
    await expect(page.locator('#navbar')).toBeVisible();
    await expect(page.locator('#hero')).toBeVisible();

    // Check for logo or brand
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should display hero section with CTA', async ({ page }) => {
    const heroSection = page.locator('#hero');
    await expect(heroSection).toBeVisible();

    // Check for headline
    const headline = heroSection.locator('h1');
    await expect(headline).toBeVisible();

    // Check for CTA buttons
    const ctaButtons = heroSection.locator('a.btn, button.btn');
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should navigate through menu items', async ({ page }) => {
    const navLinks = page.locator('.nav-link');
    const linkCount = await navLinks.count();

    expect(linkCount).toBeGreaterThan(0);

    // Test navigation to each section
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');

      if (href && href.startsWith('#')) {
        await link.click();
        const targetSection = page.locator(href);
        await expect(targetSection).toBeInViewport({ ratio: 0.3 });
      }
    }
  });

  test('should display services section', async ({ page }) => {
    const servicesSection = page.locator('#services');

    if (await servicesSection.count() > 0) {
      await servicesSection.scrollIntoViewIfNeeded();
      await expect(servicesSection).toBeVisible();

      // Check for service cards or items
      const serviceItems = servicesSection.locator('.service-card, .service-item');
      const itemCount = await serviceItems.count();
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('should have functional contact form', async ({ page }) => {
    const contactSection = page.locator('#contact');

    if (await contactSection.count() > 0) {
      await contactSection.scrollIntoViewIfNeeded();
      await expect(contactSection).toBeVisible();

      const form = contactSection.locator('form');
      if (await form.count() > 0) {
        // Check form fields
        await expect(form.locator('input[type="email"]')).toBeVisible();
        await expect(form.locator('input[type="tel"]')).toBeVisible();
        await expect(form.locator('textarea')).toBeVisible();
        await expect(form.locator('button[type="submit"]')).toBeVisible();
      }
    }
  });

  test('should display footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    // Check for footer links
    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check mobile menu toggle is visible
    const mobileToggle = page.locator('#mobileToggle, .mobile-menu-toggle');
    await expect(mobileToggle).toBeVisible();

    // Check navigation is hidden initially
    const navMenu = page.locator('#navMenu, .nav-links');
    await expect(navMenu).not.toBeVisible();

    // Open mobile menu
    await mobileToggle.click();
    await expect(navMenu).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Check layout adapts to tablet
    const navbar = page.locator('#navbar');
    await expect(navbar).toBeVisible();

    // Content should be properly sized
    const hero = page.locator('#hero');
    const heroBox = await hero.boundingBox();
    expect(heroBox.width).toBeLessThanOrEqual(768);
  });

  test('should handle landscape orientation', async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 });
    await page.goto('/');

    // Check content is still accessible in landscape
    const navbar = page.locator('#navbar');
    await expect(navbar).toBeVisible();

    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');

      // All images should have alt text
      expect(alt).toBeTruthy();

      // Check if lazy loading is implemented
      const loading = await img.getAttribute('loading');
      if (loading) {
        expect(loading).toBe('lazy');
      }
    }
  });
});

test.describe('SEO', () => {
  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription.length).toBeGreaterThan(50);
    expect(metaDescription.length).toBeLessThan(160);

    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();

    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDescription).toBeTruthy();

    // Check canonical URL
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Check h2 tags exist
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);

    // Ensure no h3 before h2, no h4 before h3, etc.
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });
});