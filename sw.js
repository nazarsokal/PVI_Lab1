const CACHE_NAME = 'student-management-cache-v4';

const urlsToCache = [
    '/index.html',
    '/styles.css',
    '/script.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
    'https://code.jquery.com/jquery-3.6.0.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-brands-400.woff2',
    '/icons/icons.128.png',
    '/icons/icons.192.png',
    '/icons/icons.256.png',
    '/icons/icons.512.png',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // Fetch each URL individually and handle failures
                const cachePromises = urlsToCache.map(url => {
                    return fetch(url)
                        .then(response => {
                            if (!response.ok) {
                                console.warn(`Failed to fetch ${url}: ${response.statusText}`);
                                return null; // Skip failed requests
                            }
                            return cache.put(url, response);
                        })
                        .catch(error => {
                            console.warn(`Failed to fetch ${url}: ${error}`);
                            return null; // Skip failed requests
                        });
                });
                return Promise.all(cachePromises);
            })
            .catch(error => {
                console.error('Cache open failed:', error);
            })
    );
});

self.addEventListener('fetch', event => {
    console.log('Service Worker fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Serving from cache:', event.request.url);
                    return response;
                }
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    let responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                }).catch(() => {
                    console.log('Fetch failed, serving fallback:', event.request.url);
                    return caches.match('/index.html');
                });
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});