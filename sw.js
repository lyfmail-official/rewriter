const V = 'rewriter-v3.0.0';
const SHELL = ['./', './index.html', './app.js', './styles.css', './manifest.json',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png'];

self.addEventListener('install',  e => e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.match(e.request).then(c=>{
    if(c) return c;
    return fetch(e.request).then(r=>{
      if(r&&r.ok&&r.type==='basic'){const cl=r.clone();caches.open(V).then(cache=>cache.put(e.request,cl));}
      return r;
    }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):new Response('Offline',{status:503}));
  }));
});
self.addEventListener('message', e=>{ if(e.data?.type==='SKIP_WAITING') self.skipWaiting(); });
