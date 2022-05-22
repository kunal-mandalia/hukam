importScripts('/sw/cache-polyfill.js')

const CACHE_VERSION = 20
const CACHE_KEY = `hukam_v${CACHE_VERSION}`

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_KEY).then(function (cache) {
      return cache.addAll(['/', '/index.html', 'js/logger.js', '/js/storage.js'])
    })
  )
})

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches
      .open(CACHE_KEY)
      .then((cache) => cache.match(event.request))
      .then(function (response) {
        return response || fetch(event.request)
      })
  )
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            return cacheName !== CACHE_KEY
          })
          .map(function (cacheName) {
            return caches.delete(cacheName)
          })
      )
    })
  )
})
