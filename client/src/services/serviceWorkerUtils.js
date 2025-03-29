/**
 * Service Worker Utilities
 * Helper functions for interacting with service worker
 */
import { savePushSubscription as apiSavePushSubscription } from './api';

// Register service worker
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers not supported in this browser');
    throw new Error('Service workers not supported');
  }

  try {
    // Check if service worker is already registered
    const registrations = await navigator.serviceWorker.getRegistrations();
    let registration;

    if (registrations.length > 0) {
      registration = registrations[0];
      console.log('Using existing service worker registration');
    } else {
      registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      console.log('Service Worker registered:', registration);
    }

    // Wait for the service worker to be ready before returning
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
};

// Store auth token in IndexedDB for service worker access
export const storeAuthToken = (token) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('auth', 1);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['token'], 'readwrite');
      const store = transaction.objectStore('token');
      
      const storeRequest = store.put(token, 'token');
      
      storeRequest.onsuccess = () => {
        console.log('Token stored successfully in IndexedDB');
        resolve();
      };
      
      storeRequest.onerror = (event) => {
        console.error('Error storing token:', event.target.error);
        reject(event.target.error);
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

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return false;
  }
  
  try {
    // Check current permission
    if (Notification.permission === 'granted') {
      console.log('Notification permission already granted');
      // Subscribe to push notifications if permission is already granted
      await subscribeToPushNotifications();
      return true;
    }
    
    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied by user');
      alert('Please enable notifications in your browser settings to use this feature');
      return false;
    }
    
    // Request permission
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Create a test notification to ensure it works
      new Notification('Notification Permission Granted', {
        body: 'You will now receive emergency alerts',
        icon: '/logo192.png'
      });
      
      // Subscribe to push notifications after permission is granted
      await subscribeToPushNotifications();
    }
    
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push notifications not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    console.log('Service worker ready for push subscription');
    
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('No existing subscription found, creating new one...');
      
      // Get server's public key for VAPID
      // In a real application, this would be fetched from the server
      const publicKey = 'BFGSlIq1Ts0JGELUd-QCyUVMwP--TccLFHHc4gfU-N3VfUzQYvifvrcd3VZkxW5bj-TDa6cB7Y39MBJvYdUXvtM';
      
      try {
        // Convert public key to Uint8Array
        const applicationServerKey = urlBase64ToUint8Array(publicKey);
        
        // Try to create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
        console.log('Push subscription created successfully');
      } catch (subscribeError) {
        console.error('Failed to create push subscription:', subscribeError);
        
        // For development purposes, we can continue without push subscription
        console.warn('Continuing without push subscription - emergency alerts may not work fully');
        return null;
      }
    } else {
      console.log('Using existing push subscription');
    }
    
    // Save subscription to server
    try {
      if (subscription) {
        await apiSavePushSubscription({ subscription });
        console.log('Push subscription saved to server');
      }
    } catch (error) {
      console.error('Error saving push subscription to server:', error);
      // Don't throw here, as we can still use the subscription locally
    }
    
    return subscription;
  } catch (error) {
    console.error('Error in push subscription process:', error);
    // Don't throw, just return null
    return null;
  }
};

// Start emergency alert notifications through service worker
export const startEmergencyAlert = async (userId) => {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers not supported');
    return false;
  }
  
  try {
    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;
    
    // Create a notification directly to ensure it works
    if (Notification.permission === 'granted') {
      new Notification('Emergency Alert Started', {
        body: 'Your emergency alert has been activated',
        icon: '/logo192.png',
        tag: 'emergency-start'
      });
      
      // Send a test notification through the service worker
      await registration.showNotification('Emergency Alert Started', {
        body: 'Your friends are being notified',
        icon: '/logo192.png',
        tag: 'emergency-start'
      });
    }
    
    // Send message to service worker to start interval
    if (!registration.active) {
      console.error('No active service worker found');
      return false;
    }
    
    registration.active.postMessage({
      type: 'emergency_start',
      userId,
      alertId: userId,
      message: 'Friend needs urgent help! Please acknowledge.'
    });
    
    console.log('Emergency alert message sent to service worker');
    return true;
  } catch (error) {
    console.error('Error starting emergency alert:', error);
    return false;
  }
};

// Stop emergency alert notifications
export const stopEmergencyAlert = async () => {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers not supported');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Create a notification to confirm stopping
    if (Notification.permission === 'granted') {
      new Notification('Emergency Alert Stopped', {
        body: 'Your emergency alert has been deactivated',
        icon: '/logo192.png',
        tag: 'emergency-stop'
      });
    }
    
    if (!registration.active) {
      console.error('No active service worker found');
      return false;
    }
    
    registration.active.postMessage({
      type: 'emergency_stop'
    });
    
    console.log('Stop alert message sent to service worker');
    return true;
  } catch (error) {
    console.error('Error stopping emergency alert:', error);
    return false;
  }
};

// Helper function to convert base64 to Uint8Array
// Needed for the applicationServerKey in pushManager.subscribe()
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 