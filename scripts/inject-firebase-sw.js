#!/usr/bin/env node
/**
 * Injects Firebase config from .env into public/firebase-messaging-sw.js
 * Run: node scripts/inject-firebase-sw.js
 * Or add to package.json: "prebuild": "node scripts/inject-firebase-sw.js"
 */
const fs = require('fs')
const path = require('path')

// Load .env manually
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'your-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

const swContent = `// Firebase Messaging Service Worker - auto-generated
// Do not edit; run: node scripts/inject-firebase-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(config)});

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
`

const outPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, swContent, 'utf8')
console.log('Wrote public/firebase-messaging-sw.js')
