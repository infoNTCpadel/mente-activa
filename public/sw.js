// Service Worker: offline-first. Precarga la app y el contenido de la semana.
const CACHE = 'ma-v1';
const SHELL = [
  '/',
  '/css/app.css',
  '/js/base.js',
  '/js/refranes.js',
  '/js/parejas.js',
  '/js/cuentas.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/api/contenido/semana',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request)
          .then((r) => {
            const cp = r.clone();
            caches.open(CACHE).then((c) => c.put(e.request, cp)).catch(() => {});
            return r;
          })
          .catch(() => caches.match('/'))
    )
  );
});
