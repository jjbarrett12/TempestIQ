'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SetupAdminPage() {
  const [secret, setSecret] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Admin user created.')
        setSecret('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Request failed.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow border border-gray-200 p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Create admin user</h1>
        <p className="text-sm text-gray-600 mb-6">
          One-time setup. Enter the secret you set as <code className="bg-gray-100 px-1 rounded">CREATE_ADMIN_SECRET</code> in Vercel (or .env).
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="secret" className="block text-sm font-medium text-gray-800 mb-1">
              Secret
            </label>
            <input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="CREATE_ADMIN_SECRET value"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-600"
              required
            />
          </div>
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'
              }`}
              role="alert"
            >
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
          >
            {status === 'loading' ? 'Creating…' : 'Create admin user'}
          </button>
        </form>
        {status === 'success' && (
          <p className="mt-4 text-sm text-gray-600">
            Sign in at <Link href="/signin" className="text-indigo-600 hover:underline">/signin</Link> with the
            ADMIN_EMAIL and ADMIN_PASSWORD you set in env (or the defaults).
          </p>
        )}
        <p className="mt-6 text-center">
          <Link href="/signin" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
