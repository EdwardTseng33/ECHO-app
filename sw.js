// ============================================
// ECHO 回聲 — Service Worker
// Cache-first for static assets, network-first for API
// ============================================

const CACHE_NAME = 'echo-v1.02-cache';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/manifest.json',
  '/img/icons/icon-192x192.png',
  '/img/icons/icon-512x512.png',
  '/img/chars/warrior.png',
  '/img/chars/mage.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;
  if (url.protocol === 'chrome-extension:') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);

      if (request.destination === 'document') {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch {
          return cachedResponse || caches.match(OFFLINE_URL);
        }
      }

      if (cachedResponse) {
        fetch(request).then(r => { if (r && r.ok) cache.put(request, r.clone()); }).catch(() => {});
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch {
        if (request.destination === 'image') {
          return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="#1a1034" rx="8"/><text x="24" y="32" text-anchor="middle" font-size="24">⚔️</text></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
        }
        return new Response('Offline', { status: 503 });
      }
    })
  );
});
