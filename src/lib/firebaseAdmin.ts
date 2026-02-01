/**
 * Firebase Admin SDK - server only.
 * Used to send push notifications via FCM.
 */
import * as admin from 'firebase-admin'

let firebaseAdmin: admin.app.App | null = null

export function getFirebaseAdmin(): admin.app.App {
  if (!firebaseAdmin) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase Admin env vars missing: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY')
    }

    const key = privateKey.replace(/\\n/g, '\n')

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: key,
      }),
    })
  }
  return firebaseAdmin
}

export function getMessaging(): admin.messaging.Messaging {
  return getFirebaseAdmin().messaging()
}
