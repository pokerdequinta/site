const CACHE_NAME = 'poker-de-quinta-v2';

// Arquivos para cache - com caminhos relativos à pasta /site/
const urlsToCache = [
  '/site/',
  '/site/index.html',
  '/site/logo pdq.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache preparado');
        return cache.addAll(urlsToCache).catch(err => {
          console.log('Erro ao adicionar cache:', err);
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cached => {
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
              return caches.match('/site/index.html');
            }
            return new Response('Offline', { status: 404 });
          });
      })
  );
});
