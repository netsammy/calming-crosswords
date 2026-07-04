// Service Worker for Calming Crosswords PWA
// Cache core assets and serve offline

const CACHE_NAME = 'calming-crosswords-v1.2';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/reset.css',
  './css/tokens.css',
  './css/animations.css',
  './css/layout.css',
  './css/crossword-grid.css',
  './css/letter-wheel.css',
  './css/ui.css',
  
  // Pack Themes
  './css/themes/theme-mediterranean.css',
  './css/themes/theme-asia-pacific.css',
  './css/themes/theme-americas.css',
  './css/themes/theme-africa.css',
  './css/themes/theme-europe.css',
  './css/themes/theme-oceania.css',

  // Pack Backgrounds
  './assets/backgrounds/mediterranean.png',
  './assets/backgrounds/asia-pacific.png',
  './assets/backgrounds/americas.png',
  './assets/backgrounds/africa.png',
  './assets/backgrounds/europe.png',
  './assets/backgrounds/oceania.png',

  // Icons
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',

  // Scripts
  './js/app.js',
  './js/engine/gameEngine.js',
  './js/engine/crosswordGrid.js',
  './js/engine/letterWheel.js',
  './js/engine/crosswordGenerator.js',
  './js/engine/soundManager.js',
  './js/state/playerState.js',
  './js/state/levelManager.js',
  './js/state/firebaseInit.js',
  './js/ui/router.js',
  './js/ui/utils.js',
  './js/data/dictionary.js',
  './js/data/wordLists.js',

  // Firebase CDN Scripts (cached for 100% offline TWA compatibility)
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Network-first for API calls (none currently), cache-first for assets
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        // Update cache silently
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return res;
      }))
    );
  }
});
