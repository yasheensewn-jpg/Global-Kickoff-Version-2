const CACHE_NAME = 'gk-cache-v7';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/menu.html',
  '/features/locker-room/index.html',
  '/games/crossbar-challenge/index.html',
  '/games/dribble-slalom/index.html',
  '/games/shoot-out/index.html',
  '/assets/sound/The_Final_Chant.mp3',
  '/assets/sound/Before_the_Roar.mp3',
  '/assets/sound/games backingtrack.mp3'
  // More assets can be added here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Bypass service worker for Range requests (required for Safari/iOS audio playback)
  if (event.request.headers.has('range') || event.request.url.endsWith('.mp3')) {
    return;
  }

  // Cache-First strategy for static assets
  if (event.request.url.endsWith('.png')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Network-First strategy for HTML, JS, CSS files to ensure updates are pushed live immediately
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Update the cache with the fresh response
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline, fallback to the cached version
          return caches.match(event.request);
        })
    );
  }
});
