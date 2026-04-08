const CACHE_NAME = 'notes-cache-v6';
const ASSETS_CRITICAL = [
    './',
    './index.html',
    './about.html',
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
    // Если это запрос на динамическую странцу (HTML)
    if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    // Стратегия Network First: при успехе сохраняем свежую копию в кэш
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    // При отсутствии сети (Network Failed) отдаем закэшированную версию
                    return caches.match(event.request);
                })
        );
    } else {
        // Статика (CSS, JS, PNG) работает по стратегии Cache First
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
});

self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Уведомление PWA';
    const options = {
        body: data.body || 'Новое сообщение!',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-192x192.png',
        actions: data.actions || [],
        data: data.data || {}
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'snooze') {
        const payload = event.notification.data;
        if (payload) {
            event.waitUntil(
                fetch('/snooze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).catch(e => console.error('SW Snooze Error:', e))
            );
        }
    } else {
        // Обычный клик по уведомлению открывает приложение
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});
