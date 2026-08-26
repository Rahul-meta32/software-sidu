self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated and claiming clients...');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push message received!');
  
  let data = { title: 'New Feedback ⚠️', body: 'A user registered feedback!' };
  if (event.data) {
    try {
      data = event.data.json();
      console.log('[Service Worker] Parsed JSON payload:', data);
    } catch (err) {
      data = { title: 'New Feedback ⚠️', body: event.data.text() };
      console.log('[Service Worker] Fallback to text payload:', data.body);
    }
  } else {
    console.log('[Service Worker] No payload data in push event.');
  }

  const options = {
    body: data.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: data.url || '/notifications',
    vibrate: [200, 100, 200],
    requireInteraction: true
  };

  console.log('[Service Worker] Attempting to show notification:', data.title, options);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => {
        console.log('[Service Worker] Notification displayed successfully.');
      })
      .catch((err) => {
        console.error('[Service Worker] Error displaying notification:', err);
      })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);
  event.notification.close();
  
  const targetUrl = event.notification.data || '/notifications';
  const urlToOpen = new URL(targetUrl, self.location.origin).href;
  console.log('[Service Worker] Opening/Focusing URL:', urlToOpen);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          console.log('[Service Worker] Focusing existing tab.');
          return client.focus();
        }
      }
      
      // If we don't find exact match, try matching any admin dashboard path and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client && 'navigate' in client) {
          console.log('[Service Worker] Navigating existing dashboard tab.');
          client.focus();
          return client.navigate(urlToOpen);
        }
      }

      // If no window is open, open a new window/tab
      if (clients.openWindow) {
        console.log('[Service Worker] Opening new tab.');
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
