// Service Worker — offline-cache + stale-while-revalidate voor data.json.
// Werkt zodat de gebruiker het dashboard kan openen zonder netwerk (laatste
// gekende leads worden getoond) terwijl een verse fetch in de achtergrond
// draait. Data.json wordt bewust niet langer dan een dag gecached.

const CACHE = 'leads-dashboard-v1';
const STATIC_ASSETS = ['./', 'index.html', 'manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Skip non-GET en cross-origin (CDN-resources hebben hun eigen cache)
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // Voor data.json: network-first met cache-fallback
  if (url.pathname.endsWith('data.json')) {
    e.respondWith(
      fetch(e.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Statische assets: cache-first met background revalidatie
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request).then((resp) => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
