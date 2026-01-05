// Service Worker for Philosophy Learning Hub
const CACHE_NAME = 'philosophy-hub-v1.2.3';
const STATIC_CACHE = 'philosophy-static-v1.2.3';
const DYNAMIC_CACHE = 'philosophy-dynamic-v1.2.3';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/scripts/translation.js',
    '/scripts/pwa-handler.js',
    '/manifest.json',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-152x152.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Install completed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete old caches that don't match current version
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('Service Worker: Activation completed');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return cachedResponse;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        // Add to dynamic cache
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                console.log('Service Worker: Caching dynamic resource', event.request.url);
                                cache.put(event.request, responseToCache);
                            })
                            .catch((error) => {
                                console.error('Service Worker: Failed to cache dynamic resource', error);
                            });

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed', error);
                        
                        // For HTML pages, return offline page
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // For other resources, you could return a fallback
                        return new Response('Network error happened', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Periodic sync for updates
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-update') {
        console.log('Service Worker: Periodic sync for content updates');
        event.waitUntil(checkForContentUpdates());
    }
});

// Background sync implementation
function doBackgroundSync() {
    return new Promise((resolve) => {
        console.log('Service Worker: Performing background sync');
        // Implement your background sync logic here
        // For example: sync user progress, submit offline actions, etc.
        resolve();
    });
}

// Content update check
function checkForContentUpdates() {
    return fetch('/api/content-updates')
        .then(response => response.json())
        .then(updates => {
            if (updates.available) {
                // Notify clients about available updates
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'CONTENT_UPDATE_AVAILABLE',
                            data: updates
                        });
                    });
                });
            }
        })
        .catch(error => {
            console.error('Service Worker: Failed to check for content updates', error);
        });
}

// Handle messages from the client
self.addEventListener('message', (event) => {
    console.log('Service Worker: Received message', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_ASSETS') {
        event.waitUntil(
            caches.open(STATIC_CACHE)
                .then(cache => {
                    return cache.addAll(event.data.assets);
                })
        );
    }
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');
    
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'New content available in Philosophy Hub',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-96x96.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Open App'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Philosophy Hub', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification click');
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window if none exists
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url || '/');
                }
            })
    );
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});