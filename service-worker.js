/**
 * HeavyHITR - Service Worker
 * Provides offline functionality
 * @author danweboptic
 * @lastUpdated 2025-03-21 14:42:33
 */

const CACHE_NAME = 'heavyhitr-cache-v1';

// Assets to cache - only include files that actually exist
// Adjusting paths based on the 404 errors
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  // Only include JS files that exist in your project structure
  // If these files are in different locations, adjust the paths accordingly
  '/js/audio.js',
  '/js/data.js',
  '/js/ui.js',
  '/js/utils.js',
  '/js/workout.js',
  '/js/history.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache initial assets with better error handling
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Opened cache');

        // Add files individually and catch errors for each file
        const cachePromises = CACHE_ASSETS.map(url => {
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                console.warn(`[ServiceWorker] Failed to cache: ${url}, status: ${response.status}`);
                return Promise.resolve(); // Skip this file but continue with others
              }
              console.log(`[ServiceWorker] Cached: ${url}`);
              return cache.put(url, response);
            })
            .catch(error => {
              console.warn(`[ServiceWorker] Failed to fetch: ${url}`, error);
              return Promise.resolve(); // Continue with other files
            });
        });

        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('[ServiceWorker] Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[ServiceWorker] Installation error:', error);
        // Continue installation even if there are errors
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network with fallback strategy
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For HTML requests - try network first, fallback to cache
  if (event.request.headers.get('accept') &&
      event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          let responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(response => {
              return response || caches.match('/index.html');
            });
        })
    );
    return;
  }

  // For all other requests - try cache first, fallback to network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        // Clone request as it can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(fetchResponse => {
            // Don't cache non-success responses or non-same-origin responses
            if (!fetchResponse || fetchResponse.status !== 200 ||
                !fetchResponse.url.startsWith(self.location.origin) ||
                fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response as it can only be used once
            let responseToCache = fetchResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.warn('[ServiceWorker] Error caching response:', error);
              });

            return fetchResponse;
          })
          .catch(error => {
            console.log('[ServiceWorker] Fetch error:', error);
            // Optionally return a custom offline page here
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});