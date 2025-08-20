const CACHE_NAME = 'poortlink-v2';
const OFFLINE_PAGE = '/offline.html';

// Cache essential files
const CACHE_FILES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - smarter strategy to avoid stale app and auth loops
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass cache for Supabase auth/API and app auth routes
  if (url.origin.includes('supabase.co') || url.pathname.startsWith('/auth') || url.pathname.startsWith('/api')) {
    return; // let the browser/network handle it
  }

  // Network-first for navigation/HTML requests
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(OFFLINE_PAGE))
    );
    return;
  }

  // Cache-first for static assets (images, styles, scripts, fonts)
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (['image', 'style', 'script', 'font'].includes(event.request.destination)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
      .catch(() => undefined)
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from PoortLink',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PoortLink', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline SASSA uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'sassa-upload') {
    event.waitUntil(syncSassaUploads());
  }
});

async function syncSassaUploads() {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(['sassaCards'], 'readonly');
    const store = tx.objectStore('sassaCards');
    const pendingUploads = await store.getAll();
    
    for (const upload of pendingUploads) {
      if (upload.synced) continue;
      
      // Attempt to sync with server
      try {
        await syncToServer(upload);
        // Mark as synced
        const updateTx = db.transaction(['sassaCards'], 'readwrite');
        const updateStore = updateTx.objectStore('sassaCards');
        upload.synced = true;
        await updateStore.put(upload);
      } catch (error) {
        console.log('Sync failed for upload:', upload.id, error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PoortLinkOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sassaCards')) {
        const store = db.createObjectStore('sassaCards', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

async function syncToServer(upload) {
  // This would implement the actual sync logic
  // For now, just log the attempt
  console.log('Syncing to server:', upload);
}