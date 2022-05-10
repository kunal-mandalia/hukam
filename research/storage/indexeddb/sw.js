importScripts('/cache-polyfill.js');

const CACHE_VERSION = 15;
const CACHE_KEY = `hukam_v${CACHE_VERSION}`;

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_KEY).then(function (cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/storage.js',
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    console.log(event.request.url);

    event.respondWith(
        caches
            .open(CACHE_KEY)
            .then(cache => cache.match(event.request))
            .then(function (response) {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
      caches.keys().then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (cacheName) {
              // Return true if you want to remove this cache,
              // but remember that caches are shared across
              // the whole origin
              console.log({ cacheName })
              return cacheName !== CACHE_KEY;
            })
            .map(function (cacheName) {
              return caches.delete(cacheName);
            }),
        );
      }),
    );
  });