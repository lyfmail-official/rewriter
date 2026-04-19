const V = 'rewriter-v3.0.0';
const SHELL = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json'
  // NOTE: If you added the icon files below, uncomment them:
  // './assets/icons/icon-192.png',
  // './assets/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V).then(cache =>
      Promise.all(SHELL.map(url =>
        fetch(url).then(r => {
          if (r && r.ok) return cache.put(url, r);
          console.warn('[SW] Could not cache:', url, r?.status);
        }).catch(err => {
          console.warn('[SW] Fetch failed for cache:', url, err);
        })
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(response => {
        if (response && response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(V).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
