const CACHE_NAME = 'life-grid-v2';

// Files we know for sure exist and won't change names drastically
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Cache-First for static assets, Network-First (Stale-While-Revalidate) for others
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      
      // If cached and it's a font or image, return it immediately
      if (cachedResponse) {
        // Optional: Update cache in background for next time (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
            if(networkResponse.ok) cache.put(event.request, networkResponse.clone());
        }).catch(() => {});
        return cachedResponse;
      }

      // Otherwise fetch from network and cache it for offline use next time
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // Offline fallback if needed, or just fail
        return cachedResponse; // Will be undefined if not in cache
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});