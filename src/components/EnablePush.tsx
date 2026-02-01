'use client'

import { useState, useEffect, useCallback } from 'react'
import { getFCMToken } from '@/lib/firebaseClient'

type Status = 'idle' | 'checking' | 'requesting' | 'registering' | 'enabled' | 'blocked' | 'unsupported' | 'error'

interface EnablePushProps {
  onStatusChange?: (enabled: boolean) => void
  compact?: boolean
}

export function EnablePush({ onStatusChange, compact }: EnablePushProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const checkSupport = useCallback(() => {
    if (typeof window === 'undefined') return false
    return (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    )
  }, [])

  const enable = useCallback(async () => {
    if (!checkSupport()) {
      setStatus('unsupported')
      return
    }

    setError(null)

    if (Notification.permission === 'granted') {
      setStatus('registering')
      try {
        const token = await getFCMToken()
        if (!token) {
          setStatus('error')
          setError('Could not get push token')
          return
        }

        const res = await fetch('/api/push/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, platform: 'web' }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to register')
        }

        setStatus('enabled')
        onStatusChange?.(true)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Registration failed')
      }
      return
    }

    if (Notification.permission === 'denied') {
      setStatus('blocked')
      return
    }

    setStatus('requesting')
    const perm = await Notification.requestPermission()

    if (perm === 'denied') {
      setStatus('blocked')
      return
    }

    if (perm === 'granted') {
      setStatus('registering')
      try {
        const token = await getFCMToken()
        if (!token) {
          setStatus('error')
          setError('Could not get push token')
          return
        }

        const res = await fetch('/api/push/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, platform: 'web' }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to register')
        }

        setStatus('enabled')
        onStatusChange?.(true)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Registration failed')
      }
    } else {
      setStatus('idle')
    }
  }, [checkSupport, onStatusChange])

  const sendTest = useCallback(async () => {
    try {
      const res = await fetch('/api/push/send-test', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed')
    }
  }, [])

  useEffect(() => {
    if (!checkSupport()) {
      setStatus('unsupported')
      return
    }
    setStatus('checking')
    if (Notification.permission === 'granted') {
      setStatus('enabled')
      onStatusChange?.(true)
    } else {
      setStatus('idle')
    }
  }, [checkSupport, onStatusChange])

  if (status === 'unsupported') {
    return (
      <p className="text-sm text-gray-500">
        Push notifications are not supported in this browser.
      </p>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={enable}
          disabled={status === 'requesting' || status === 'registering' || status === 'checking'}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
        >
          {status === 'enabled' ? '✓ Alerts enabled' : status === 'blocked' ? 'Notifications blocked' : status === 'requesting' || status === 'registering' ? 'Setting up...' : 'Enable alerts'}
        </button>
        {status === 'enabled' && (
          <button
            type="button"
            onClick={sendTest}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Send test
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-gray-900">Push notifications</h3>
          <p className="text-sm text-gray-600 mt-1">
            Get weather alerts on this device when storms affect your locations.
          </p>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={enable}
            disabled={status === 'requesting' || status === 'registering' || status === 'checking'}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === 'enabled'
              ? '✓ Enabled'
              : status === 'blocked'
                ? 'Blocked'
                : status === 'requesting' || status === 'registering'
                  ? 'Setting up...'
                  : 'Enable alerts'}
          </button>
          {status === 'enabled' && (
            <button
              type="button"
              onClick={sendTest}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Send test
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
