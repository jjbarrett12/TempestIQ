'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const authError = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const errorMessage = error || (authError ? 'Unable to sign in. Please check your details and try again.' : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })
      if (res?.error) {
        // If server returned 500 (e.g. missing NEXTAUTH_SECRET), try to show that message
        try {
          const r = await fetch('/api/auth/csrf')
          if (r.status === 500) {
            const d = await r.json().catch(() => ({}))
            if (d?.error) {
              setError(d.error)
              setLoading(false)
              return
            }
          }
        } catch {
          /* ignore */
        }
        setError('Invalid email or password.')
        setLoading(false)
        return
      }
      if (res?.url) window.location.href = res.url
      else setLoading(false)
    } catch {
      // If auth API is misconfigured (e.g. missing NEXTAUTH_SECRET), surface that message
      try {
        const r = await fetch('/api/auth/csrf')
        if (r.status === 500) {
          const d = await r.json().catch(() => ({}))
          if (d?.error) {
            setError(d.error)
            setLoading(false)
            return
          }
        }
      } catch {
        /* ignore */
      }
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex">
            <Image
              src="/TempestIQ logo transparent.png"
              alt="TempestIQ"
              width={200}
              height={48}
              className="h-10 w-auto object-contain mx-auto"
            />
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Sign in</h1>
          <p className="text-sm text-gray-600 mb-6">
            Use your TempestIQ account to access the dashboard.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
                {errorMessage}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-800">
              Sign up
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
