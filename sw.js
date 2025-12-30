self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open('life-grid-v1').then((cache) => {
      // We can pre-cache assets here if needed for offline use
      return cache.addAll([
        '/',
        '/index.html',
        '/index.tsx'
      ]).catch(() => {
        // Fallback if some files fail to cache (dev environment)
        console.log('Optional caching failed, continuing...');
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = ['life-grid-v1'];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});