const CACHE_NAME = 'logistics-pro-v2';
const API_CACHE_NAME = 'logistics-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/vite.svg'
];

const API_ENDPOINTS = [
  '/api/health',
  '/api/pricing',
  '/api/news'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    const isCacheable = request.method === 'GET' && API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint));
    if (isCacheable) {
      event.respondWith(handleApiRequest(request));
      return;
    }
  }

  event.respondWith(
    caches.match(request)
      .then((response) => response || fetch(request))
      .catch(() => {
        if (request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(API_CACHE_NAME);

  if (request.method === 'GET') {
    const shouldCache = API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint));
    if (shouldCache) {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }
      } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;
      }
    }
  }

  return fetch(request);
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Background sync triggered');
}
