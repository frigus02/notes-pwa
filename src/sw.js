/* global CACHE_NAME:false, CACHE_URLS:false */

addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
    );
});

addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
});

addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }

            return fetch(event.request);
        })
    );
});
