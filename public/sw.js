// Lightweight PWA Service Worker
self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    // Let browser handle network directly to always get live Firebase roster data
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});