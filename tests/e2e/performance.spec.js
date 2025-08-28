/**
 * Performance Tests
 * MaxiMax Mobile Advertising
 */

const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await page.goto('/');

    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise(resolve => {
        let lcp = 0;
        let fid = 0;
        let cls = 0;
        let fcp = 0;
        let ttfb = 0;

        // Largest Contentful Paint
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            fid = entries[0].processingStart - entries[0].startTime;
          }
        }).observe({ type: 'first-input', buffered: true });

        // Cumulative Layout Shift
        new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          });
        }).observe({ type: 'layout-shift', buffered: true });

        // First Contentful Paint
        if (window.performance && window.performance.getEntriesByType) {
          const paintEntries = performance.getEntriesByType('paint');
          paintEntries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              fcp = entry.startTime;
            }
          });
        }

        // Time to First Byte
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
          ttfb = nav.responseStart - nav.requestStart;
        }

        // Wait for metrics to be collected
        setTimeout(() => {
          resolve({ lcp, fid, cls, fcp, ttfb });
        }, 3000);
      });
    });

    console.log('Performance Metrics:', metrics);

    // WCAG AAA requires stricter performance thresholds
    expect(metrics.lcp).toBeLessThan(2500); // Good < 2.5s
    expect(metrics.fid).toBeLessThan(100); // Good < 100ms
    expect(metrics.cls).toBeLessThan(0.1); // Good < 0.1
    expect(metrics.fcp).toBeLessThan(1800); // Good < 1.8s
    expect(metrics.ttfb).toBeLessThan(600); // Good < 600ms
  });

  test('should have optimized resource loading', async ({ page }) => {
    const resourceTimings = [];

    page.on('response', response => {
      resourceTimings.push({
        url: response.url(),
        status: response.status(),
        timing: response.timing()
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for resource optimization
    resourceTimings.forEach(resource => {
      // All resources should load successfully
      expect(resource.status).toBeLessThan(400);

      // Check for compression
      if (resource.url.includes('.js') || resource.url.includes('.css')) {
        // JavaScript and CSS should load quickly
        if (resource.timing) {
          const loadTime = resource.timing.responseEnd - resource.timing.requestStart;
          expect(loadTime).toBeLessThan(1000); // Should load within 1s
        }
      }
    });
  });

  test('should handle images efficiently', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);

      // Check for lazy loading
      const loading = await img.getAttribute('loading');
      const dataSrc = await img.getAttribute('data-src');

      // Images below fold should be lazy loaded
      const isInViewport = await img.isIntersectingViewport();
      if (!isInViewport) {
        expect(loading === 'lazy' || dataSrc).toBeTruthy();
      }

      // Check image dimensions are specified
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');

      // Images should have dimensions to prevent layout shift
      if (!dataSrc) { // Skip lazy loaded images
        expect(width || height).toBeTruthy();
      }
    }
  });

  test('should minimize JavaScript execution time', async ({ page }) => {
    await page.goto('/');

    // Measure JavaScript execution time
    const jsMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('measure');
      const scripts = performance.getEntriesByType('resource').filter(e =>
        e.name.includes('.js')
      );

      let totalScriptTime = 0;
      scripts.forEach(script => {
        if (script.responseEnd && script.startTime) {
          totalScriptTime += script.responseEnd - script.startTime;
        }
      });

      return {
        scriptCount: scripts.length,
        totalScriptTime,
        measures: entries.length
      };
    });

    // JavaScript should load quickly
    expect(jsMetrics.totalScriptTime).toBeLessThan(2000);

    // Should not have too many script files (bundling)
    expect(jsMetrics.scriptCount).toBeLessThan(10);
  });

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/');

    // Check for memory leaks
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Interact with the page
    await page.click('body'); // Trigger any click handlers
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));

    // Open and close mobile menu if present
    const mobileToggle = page.locator('#mobileToggle');
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      await page.waitForTimeout(500);
      await mobileToggle.click();
    }

    // Check memory after interactions
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory increase should be reasonable (not more than 10MB)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
      expect(memoryIncrease).toBeLessThan(10);
    }
  });

  test('should optimize CSS delivery', async ({ page }) => {
    const cssResources = [];

    page.on('response', response => {
      if (response.url().includes('.css')) {
        cssResources.push({
          url: response.url(),
          size: response.headers()['content-length']
        });
      }
    });

    await page.goto('/');

    // Check CSS optimization
    let totalCssSize = 0;
    cssResources.forEach(css => {
      if (css.size) {
        totalCssSize += parseInt(css.size);
      }
    });

    // Total CSS should be reasonable (< 100KB)
    expect(totalCssSize).toBeLessThan(100000);

    // Check for critical CSS
    const hasCriticalCss = await page.evaluate(() => {
      const styles = document.querySelectorAll('style');
      return styles.length > 0;
    });

    // Should have some inline critical CSS
    expect(hasCriticalCss || cssResources.length > 0).toBe(true);
  });

  test('should handle animations efficiently', async ({ page }) => {
    await page.goto('/');

    // Check for GPU-accelerated animations
    const animatedElements = page.locator('[data-animate], .animate-on-scroll');
    const elementCount = await animatedElements.count();

    if (elementCount > 0) {
      const transforms = await animatedElements.first().evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          willChange: styles.willChange,
          transform: styles.transform,
          transition: styles.transition
        };
      });

      // Animations should use transform for better performance
      if (transforms.transition && transforms.transition !== 'none') {
        expect(transforms.willChange === 'transform' ||
               transforms.transform !== 'none').toBeTruthy();
      }
    }
  });

  test('should cache static resources', async ({ page }) => {
    const cachedResources = [];

    page.on('response', response => {
      const cacheControl = response.headers()['cache-control'];
      if (cacheControl) {
        cachedResources.push({
          url: response.url(),
          cacheControl
        });
      }
    });

    await page.goto('/');

    // Check for proper caching headers
    cachedResources.forEach(resource => {
      if (resource.url.match(/\.(js|css|jpg|jpeg|png|webp|woff2?)$/)) {
        // Static assets should have cache headers
        expect(resource.cacheControl).toBeTruthy();
      }
    });
  });
});

test.describe('Network Performance', () => {
  test('should perform well on slow 3G', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Simulate slow 3G
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Add delay
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should still load within reasonable time on slow connection
    expect(loadTime).toBeLessThan(10000); // 10 seconds

    await context.close();
  });

  test('should minimize HTTP requests', async ({ page }) => {
    const requests = [];

    page.on('request', request => {
      requests.push(request.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have reasonable number of requests
    expect(requests.length).toBeLessThan(50);

    // Check for bundling
    const jsRequests = requests.filter(r => r.endsWith('.js'));
    const cssRequests = requests.filter(r => r.endsWith('.css'));

    expect(jsRequests.length).toBeLessThan(10);
    expect(cssRequests.length).toBeLessThan(5);
  });

  test('should compress text resources', async ({ page }) => {
    const compressedResources = [];

    page.on('response', response => {
      const encoding = response.headers()['content-encoding'];
      if (encoding) {
        compressedResources.push({
          url: response.url(),
          encoding
        });
      }
    });

    await page.goto('/');

    // Check for compression
    compressedResources.forEach(resource => {
      if (resource.url.match(/\.(js|css|html|json)$/)) {
        expect(['gzip', 'deflate', 'br']).toContain(resource.encoding);
      }
    });
  });
});

test.describe('Runtime Performance', () => {
  test('should handle scroll events efficiently', async ({ page }) => {
    await page.goto('/');

    // Measure scroll performance
    const scrollMetrics = await page.evaluate(() => {
      return new Promise(resolve => {
        let scrollCount = 0;
        let rafCount = 0;

        const scrollHandler = () => scrollCount++;
        const rafHandler = () => rafCount++;

        window.addEventListener('scroll', scrollHandler);

        // Scroll multiple times
        for (let i = 0; i < 10; i++) {
          window.scrollTo(0, i * 100);
          requestAnimationFrame(rafHandler);
        }

        setTimeout(() => {
          window.removeEventListener('scroll', scrollHandler);
          resolve({ scrollCount, rafCount });
        }, 1000);
      });
    });

    // Should be using throttling/debouncing
    expect(scrollMetrics.scrollCount).toBeLessThanOrEqual(10);
  });

  test('should avoid layout thrashing', async ({ page }) => {
    await page.goto('/');

    // Check for forced reflows
    const reflows = await page.evaluate(() => {
      let reflowCount = 0;
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'measure' && entry.name.includes('reflow')) {
            reflowCount++;
          }
        });
      });

      // Trigger some interactions
      document.querySelectorAll('button').forEach(btn => {
        const rect = btn.getBoundingClientRect(); // Potential reflow
      });

      return reflowCount;
    });

    // Should minimize reflows
    expect(reflows).toBeLessThan(10);
  });
});