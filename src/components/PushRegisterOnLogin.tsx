'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { getFCMToken } from '@/lib/firebaseClient'

/**
 * On login, register device token for push (if permission already granted).
 * Silent - no prompt. Persists to device_tokens / push_device_tokens.
 */
export function PushRegisterOnLogin() {
  const { data: session, status } = useSession()
  const registered = useRef(false)

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || registered.current) return
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    registered.current = true
    getFCMToken()
      .then((token) => {
        if (!token) return
        return fetch('/api/push/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, platform: 'web' }),
        })
      })
      .then((res) => {
        if (res && !res.ok) registered.current = false
      })
      .catch(() => {
        registered.current = false
      })
  }, [session?.user, status])

  return null
}
