/* Offline support. Network-first so updates arrive when online; cache fallback when offline. */
const CACHE = 'pois-v12';
const FILES = ['./', './index.html', './manifest.webmanifest', './css/app.css', './css/panel.css',
  './data/verbs.js', './data/vocab1.js', './data/vocab2.js', './data/vocab3.js', './data/build.js', './data/media.js', './data/chunks2.js', './data/verbsent.js', './data/chunks.js', './data/drills.js', './data/grammar.js', './data/partner.js', './data/transform.js', './data/dialogues.js', './data/conversas.js', './data/missions.js',
  './js/conj.js', './js/fsrs.js', './js/store.js', './js/core.js', './js/speak.js', './js/views-study.js', './js/views-other.js', './js/views-speak.js', './js/views-extra.js', './js/verbkit.js', './js/views-verbs.js', './js/views-build.js', './js/views-read.js', './js/planner.js', './js/session.js', './js/panel.js', './js/main.js', './js/drive.js', './config.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
