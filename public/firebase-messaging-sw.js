// Firebase Messaging Service Worker - auto-generated
// Do not edit; run: node scripts/inject-firebase-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({"apiKey":"YOUR_API_KEY","authDomain":"localhost","projectId":"your-project","storageBucket":"","messagingSenderId":"","appId":""});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, data } = payload.data || {};
  const options = {
    body: body || 'Weather alert',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    data: data || {},
    tag: data?.alertId || 'tempestiq-alert',
    requireInteraction: !!data?.severity?.match(/high|extreme/i),
  };
  self.registration.showNotification(title || 'TempestIQ Alert', options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
