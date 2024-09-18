const CACHE_NAME = 'sports-day-cache-v1.1.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/main.js',
  '/js/app.js',
  '/js/eventListeners.js',
  '/js/sortable.js',
  '/js/version.js',
  '/js/audioUtils.js',
  '/js/render.js',
  '/js/storage.js',
  '/js/programUtils.js',
  '/js/pasteUtils.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // 音楽ファイルをキャッシュに追加（パスが変更されている場合は更新）
  '/assets/fanfare.mp3',
  '/assets/run.mp3',
  // 他の音楽ファイルも同様に追加
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
