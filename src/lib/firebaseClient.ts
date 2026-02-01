/**
 * Firebase client SDK - browser only.
 * Used to get FCM token for push registration.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, isSupported, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null
  const apps = getApps()
  if (apps.length > 0) {
    return apps[0] as FirebaseApp
  }
  return initializeApp(firebaseConfig)
}

export async function getFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const supported = await isSupported()
  if (!supported) return null

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey) {
    console.error('[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY not set')
    return null
  }

  const app = getFirebaseApp()
  if (!app) {
    console.error('[FCM] Firebase not configured')
    return null
  }

  try {
    const messaging = getMessaging(app) as Messaging
    const token = await getToken(messaging, { vapidKey })
    return token || null
  } catch (err) {
    console.error('[FCM] getToken failed:', err)
    return null
  }
}
