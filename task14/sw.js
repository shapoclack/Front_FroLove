const CACHE_NAME = 'notes-cache-v4';
const ASSETS_CRITICAL = [
    './',
    './index.html',
    './app.js',
    './styles.css',
    './manifest.json'
];

// Иконки кэшируем отдельно с перехватом ошибок (т.к. они могут еще не существовать)
const ASSETS_OPTIONAL = [
    './icons/icon-16x16.png',
    './icons/icon-32x32.png',
    './icons/icon-48x48.png',
    './icons/icon-64x64.png',
    './icons/icon-128x128.png',
    './icons/icon-192x192.png',
    './icons/icon-256x256.png',
    './icons/icon-512x512.png',
    './icons/icon-512x512-maskable.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_CRITICAL).then(() => {
                return Promise.all(
                    ASSETS_OPTIONAL.map(url => {
                        return cache.add(url).catch(err => console.log('Не удалось кэшировать иконку (еще не добавлена):', url));
                    })
                );
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
