const CACHE_NAME = 'emergency-alert-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/js/vendors~main.chunk.js',
];

// Variable to track the interval ID
let alertIntervalId = null;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  try {
    if (!event.data) {
      console.warn('Push event received but no data');
      return;
    }
    
    let data;
    try {
      data = event.data.json();
    } catch (err) {
      console.error('Error parsing push data as JSON:', err);
      data = { 
        title: 'Emergency Alert',
        body: event.data ? event.data.text() : 'New notification' 
      };
    }
    
    console.log('Push data:', data);
    
    // Check if it's an emergency alert start or stop message
    if (data.type === 'emergency_start') {
      startEmergencyAlertInterval(data);
      return;
    } else if (data.type === 'emergency_stop') {
      stopEmergencyAlertInterval();
      return;
    }
    
    const title = data.title || 'Emergency Alert';
    const options = {
      body: data.body || 'Emergency notification received',
      icon: data.icon || '/logo192.png',
      badge: data.badge || '/logo192.png',
      data: data.data || {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        alertId: data.alertId
      },
      vibrate: data.vibrate || [100, 50, 100],
      actions: data.actions || [
        {
          action: 'acknowledge',
          title: 'Acknowledge'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };
    
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('Error handling push event:', error);
    // Show a generic notification as fallback
    event.waitUntil(
      self.registration.showNotification('Emergency Alert', {
        body: 'Emergency notification received'
      })
    );
  }
});

// Function to start emergency alert notifications at 2-second intervals
const startEmergencyAlertInterval = (data) => {
  // Clear any existing interval
  stopEmergencyAlertInterval();
  
  // Create a new interval
  alertIntervalId = setInterval(() => {
    const options = {
      body: data.message || 'Friend needs help! Tap to acknowledge.',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: Math.random(),
        alertId: data.alertId,
        userId: data.userId
      },
      actions: [
        {
          action: 'acknowledge',
          title: 'Acknowledge Alert'
        },
        {
          action: 'close',
          title: 'Close'
        },
      ],
      tag: 'emergency-alert', // Use tag to replace existing notification
      renotify: true // Make device vibrate again even with same tag
    };
    
    self.registration.showNotification('EMERGENCY ALERT', options);
  }, 2000); // 2-second interval
};

// Function to stop emergency alert interval
const stopEmergencyAlertInterval = () => {
  if (alertIntervalId) {
    clearInterval(alertIntervalId);
    alertIntervalId = null;
    
    // Show a final notification that the alert has stopped
    self.registration.showNotification('Alert Stopped', {
      body: 'The emergency alert has been stopped',
      icon: '/logo192.png',
      badge: '/logo192.png'
    });
  }
};

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'emergency_start') {
    startEmergencyAlertInterval(event.data);
  } else if (event.data && event.data.type === 'emergency_stop') {
    stopEmergencyAlertInterval();
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'acknowledge' || event.action === '') {
    // Send acknowledgment to the server
    const alertId = event.notification.data?.alertId;
    
    if (!alertId) {
      console.error('No alert ID found in notification data');
      return;
    }
    
    // Get API URL from the environment or use default
    const apiUrl = self.location.origin + '/api/v1';
    
    // Retrieve the token from IndexedDB
    getAuthToken().then(token => {
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      console.log('Acknowledging alert:', alertId);
      
      // Send acknowledgment to server
      fetch(`${apiUrl}/user/emergency-alerts/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ alertId })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server responded with status: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log('Alert acknowledged successfully:', data);
        // Send message to client to update UI
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'alert_acknowledged',
              alertId: alertId
            });
          });
        });
      })
      .catch(error => {
        console.error('Error acknowledging alert:', error);
      });
    });
    
    // Open the emergency page when alert is clicked
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clientList => {
        // Check if there is already a window open
        for (const client of clientList) {
          if (client.url.includes('/emergency') && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow('/emergency');
        }
      })
    );
  }
});

// Helper function to get auth token from IndexedDB
const getAuthToken = () => {
  return new Promise((resolve) => {
    // Open 'auth' database to retrieve token
    const request = indexedDB.open('auth', 1);
    
    request.onerror = () => {
      console.error('Failed to open IndexedDB');
      resolve(null);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('token')) {
        console.error('No token store found');
        resolve(null);
        return;
      }
      
      const transaction = db.transaction(['token'], 'readonly');
      const store = transaction.objectStore('token');
      const tokenRequest = store.get('token');
      
      tokenRequest.onsuccess = () => {
        resolve(tokenRequest.result);
      };
      
      tokenRequest.onerror = () => {
        console.error('Error retrieving token');
        resolve(null);
      };
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('token')) {
        db.createObjectStore('token');
      }
    };
  });
};

// Handle requests to acknowledge emergency alerts
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only intercept specific API requests
  if (url.pathname.includes('/api/emergency/acknowledge')) {
    console.log('Intercepting acknowledge request:', url.pathname);
    
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          console.log('Acknowledge response:', response.status);
          return response;
        })
        .catch(error => {
          console.error('Error with fetch:', error);
          // For offline support, queue important requests
          // This is a simplified implementation
          return new Response(JSON.stringify({ 
            message: 'Request queued for offline processing',
            queued: true 
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 202
          });
        })
    );
  }
}); 