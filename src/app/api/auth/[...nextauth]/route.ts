import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

function authConfigError(): NextResponse {
  const missing: string[] = []
  if (!process.env.NEXTAUTH_SECRET?.trim()) missing.push('NEXTAUTH_SECRET')
  if (!process.env.NEXTAUTH_URL?.trim()) missing.push('NEXTAUTH_URL')
  const message =
    missing.length > 0
      ? `Auth is misconfigured: missing ${missing.join(', ')}. Add them to .env (see .env.example). For NEXTAUTH_SECRET run: openssl rand -base64 32`
      : 'Auth configuration error. Check server logs.'
  return NextResponse.json({ error: message }, { status: 500 })
}

const handler = NextAuth(authOptions)

async function wrappedGet(
  req: Request,
  context: { params: Promise<Record<string, string>> }
) {
  if (!process.env.NEXTAUTH_SECRET?.trim() || !process.env.NEXTAUTH_URL?.trim())
    return authConfigError()
  return handler(req, context)
}

async function wrappedPost(
  req: Request,
  context: { params: Promise<Record<string, string>> }
) {
  if (!process.env.NEXTAUTH_SECRET?.trim() || !process.env.NEXTAUTH_URL?.trim())
    return authConfigError()
  return handler(req, context)
}

export { wrappedGet as GET, wrappedPost as POST }
