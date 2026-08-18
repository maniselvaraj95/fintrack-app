const CACHE_NAME = 'fintrack-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignore API calls to Google
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Network-First Auto-Caching Strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response and save it to cache automatically
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => {
        // If internet drops, serve from cache to pass Chrome's offline test
        return caches.match(event.request);
      })
  );
});
