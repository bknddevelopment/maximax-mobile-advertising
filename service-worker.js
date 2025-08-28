/**
 * MaxiMax Advertising - Progressive Web App Service Worker
 * Offline functionality, caching, and performance optimization
 * @version 3.0.0
 */

const CACHE_VERSION = 'maximax-v3.0.0';
const DYNAMIC_CACHE = 'maximax-dynamic-v3.0.0';
const OFFLINE_PAGE = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/main.css',
  '/css/animations.css',
  '/css/design-system.css',
  '/css/responsive.css',
  '/js/main.js',
  '/js/animations.js',
  '/js/interactions.js',
  '/js/ScrollAnimations.js',
  '/js/ParticleSystem.js',
  '/js/TruckViewer3D.js',
  '/js/performance.js',
  '/site.webmanifest'
];

// External CDN resources to cache
const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// Network-first resources (always fetch fresh if possible)
const NETWORK_FIRST = [
  '/api/',
  '/analytics',
  '/track'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => {
        console.log('[ServiceWorker] Caching static assets');
        // Cache local assets
        const localPromises = STATIC_ASSETS.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`[ServiceWorker] Failed to cache ${asset}:`, err);
          });
        });

        // Cache CDN assets with proper CORS handling
        const cdnPromises = CDN_ASSETS.map(url => {
          return fetch(url, { mode: 'cors' })
            .then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            })
            .catch(err => {
              console.warn(`[ServiceWorker] Failed to cache CDN asset ${url}:`, err);
            });
        });

        return Promise.all([...localPromises, ...cdnPromises]);
      })
      .then(() => {
        console.log('[ServiceWorker] Static assets cached');
        // Skip waiting to activate immediately
        self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('maximax-') &&
                                   cacheName !== CACHE_VERSION &&
                                   cacheName !== DYNAMIC_CACHE;
            })
            .map(cacheName => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different caching strategies
  if (shouldUseNetworkFirst(url.pathname)) {
    event.respondWith(networkFirst(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Caching strategies
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[ServiceWorker] Serving from cache:', request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    return caches.match(OFFLINE_PAGE);
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match(OFFLINE_PAGE);
  }
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    return caches.match(OFFLINE_PAGE);
  });

  return cachedResponse || fetchPromise;
}

// Helper functions
function shouldUseNetworkFirst(pathname) {
  return NETWORK_FIRST.some(path => pathname.includes(path));
}

function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.woff2', '.woff', '.ttf', '.otf'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
           CDN_ASSETS.includes(url.href);
}

// Message handling for cache updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] Skip waiting received');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[ServiceWorker] Clearing caches');
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('[ServiceWorker] Caches cleared');
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(DYNAMIC_CACHE).then(cache => {
      return Promise.all(
        urls.map(url => {
          return fetch(url)
            .then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            })
            .catch(err => console.warn(`Failed to cache ${url}:`, err));
        })
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-forms') {
    console.log('[ServiceWorker] Syncing offline forms');
    event.waitUntil(syncOfflineForms());
  }
});

async function syncOfflineForms() {
  // Get pending form submissions from IndexedDB
  const db = await openDB();
  const tx = db.transaction('pending-forms', 'readonly');
  const store = tx.objectStore('pending-forms');
  const forms = await store.getAll();

  for (const formData of forms) {
    try {
      const response = await fetch(formData.url, {
        method: 'POST',
        body: JSON.stringify(formData.data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove from pending if successful
        const deleteTx = db.transaction('pending-forms', 'readwrite');
        await deleteTx.objectStore('pending-forms').delete(formData.id);
      }
    } catch (error) {
      console.error('[ServiceWorker] Failed to sync form:', error);
    }
  }
}

// Simple IndexedDB wrapper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('maximax-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-forms')) {
        db.createObjectStore('pending-forms', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Push notifications support
self.addEventListener('push', event => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body || 'New update from MaxiMax Advertising',
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MaxiMax Update', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Performance monitoring
self.addEventListener('fetch', event => {
  const startTime = performance.now();

  event.respondWith(
    fetch(event.request).then(response => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log slow requests
      if (duration > 1000) {
        console.warn(`[ServiceWorker] Slow request: ${event.request.url} took ${duration.toFixed(0)}ms`);
      }

      return response;
    }).catch(error => {
      console.error('[ServiceWorker] Fetch error:', error);
      return caches.match(OFFLINE_PAGE);
    })
  );
});

console.log('[ServiceWorker] Service Worker loaded');