// ============================================================
// Nuggercise — Service Worker (sw.js)
// Upload this file to your GitHub repo alongside index.html
// Caches the app shell and Supabase SDK for instant repeat loads
// ============================================================

const CACHE_NAME = 'nuggercise-v2'; // bumped: old caches are purged on activate
const ASSETS_TO_CACHE = [
  '/nuggercise/',
  '/nuggercise/index.html',
  '/nuggercise/manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
];

// Install: cache all critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - App shell (index.html, manifest) → Cache First, fall back to network
// - Supabase CDN SDK → Cache First, fall back to network
// - All Supabase API calls → Network Only (never cache live data)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never cache Supabase API requests — always fresh from network
  if (url.hostname.includes('supabase.co')) {
    return; // Let it pass through to network without touching cache
  }

  // NETWORK-FIRST for the app page itself, so a new release is picked up on the
  // next load instead of being hidden behind a stale cached copy. The cached copy
  // is only a fallback for when the network is unavailable.
  const isAppPage = event.request.mode === 'navigate' ||
    url.pathname === '/nuggercise/' ||
    url.pathname === '/nuggercise/index.html';
  if (isAppPage) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('/nuggercise/index.html', clone));
        }
        return response;
      }).catch(() =>
        caches.match(event.request).then(c => c || caches.match('/nuggercise/index.html'))
      )
    );
    return;
  }

  // Cache-first for app shell and CDN assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful GET responses for known assets
        if (
          event.request.method === 'GET' &&
          response.status === 200 &&
          (url.hostname === 'cdn.jsdelivr.net' ||
           url.pathname.startsWith('/nuggercise'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback — serve cached index.html for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('/nuggercise/index.html');
      }
    })
  );
});
