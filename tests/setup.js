/**
 * Test Setup and Configuration
 * MaxiMax Mobile Advertising
 */

// Import testing utilities
import '@testing-library/jest-dom';
import 'jest-fetch-mock';

// Setup fetch mock
global.fetch = require('jest-fetch-mock');
fetchMock.enableMocks();

// Setup DOM environment
beforeEach(() => {
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // Clear all mocks
  jest.clearAllMocks();

  // Reset fetch mock
  fetch.resetMocks();

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
  };
  global.localStorage = localStorageMock;

  // Mock sessionStorage
  global.sessionStorage = localStorageMock;

  // Mock window methods
  global.scrollTo = jest.fn();
  global.alert = jest.fn();
  global.confirm = jest.fn();
  global.prompt = jest.fn();

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation((callback, options) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(),
    root: null,
    rootMargin: options?.rootMargin || '0px',
    thresholds: Array.isArray(options?.threshold) ? options.threshold : [options?.threshold || 0]
  }));

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));

  // Mock MutationObserver
  global.MutationObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn()
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn(cb => {
    setTimeout(cb, 0);
    return Math.random();
  });

  global.cancelAnimationFrame = jest.fn();

  // Mock performance API
  global.performance = {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn()
  };

  // Mock console methods for cleaner test output
  const originalConsole = global.console;
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  };

  // Mock navigator
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'Mozilla/5.0 (Testing) AppleWebKit/537.36',
      platform: 'MacIntel',
      language: 'en-US',
      languages: ['en-US', 'en'],
      onLine: true,
      cookieEnabled: true,
      vendor: 'Testing',
      maxTouchPoints: 0
    },
    writable: true
  });

  // Mock location
  delete window.location;
  window.location = {
    href: 'http://localhost:3000/',
    hostname: 'localhost',
    pathname: '/',
    protocol: 'http:',
    port: '3000',
    search: '',
    hash: '',
    reload: jest.fn(),
    replace: jest.fn(),
    assign: jest.fn()
  };
});

// Cleanup after tests
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();

  // Clear all mocks
  jest.clearAllMocks();

  // Restore console
  jest.restoreAllMocks();
});

// Custom matchers
expect.extend({
  toHaveBeenCalledAfter(received, other) {
    const receivedCalls = received.mock.invocationCallOrder;
    const otherCalls = other.mock.invocationCallOrder;

    const pass = receivedCalls.length > 0 &&
                 otherCalls.length > 0 &&
                 Math.min(...receivedCalls) > Math.max(...otherCalls);

    return {
      pass,
      message: () => (pass ?
        `Expected ${received} not to have been called after ${other}` :
        `Expected ${received} to have been called after ${other}`)
    };
  },

  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => (pass ?
        `Expected ${received} not to be within range ${floor} - ${ceiling}` :
        `Expected ${received} to be within range ${floor} - ${ceiling}`)
    };
  }
});

// Test utilities
global.createMockElement = (tagName, attributes = {}, children = []) => {
  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  children.forEach(child => element.appendChild(child));
  return element;
};

global.waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

global.mockScrollPosition = (x = 0, y = 0) => {
  Object.defineProperty(window, 'pageXOffset', { value: x, writable: true });
  Object.defineProperty(window, 'pageYOffset', { value: y, writable: true });
  Object.defineProperty(window, 'scrollX', { value: x, writable: true });
  Object.defineProperty(window, 'scrollY', { value: y, writable: true });
};

global.triggerEvent = (element, eventName, options = {}) => {
  const event = new Event(eventName, { bubbles: true, cancelable: true, ...options });
  element.dispatchEvent(event);
  return event;
};

// Export for use in tests
module.exports = {
  createMockElement: global.createMockElement,
  waitForAsync: global.waitForAsync,
  mockScrollPosition: global.mockScrollPosition,
  triggerEvent: global.triggerEvent
};