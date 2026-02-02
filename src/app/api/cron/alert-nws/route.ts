import { NextRequest, NextResponse } from 'next/server'

/** NWS warnings: run every 5 min */
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return forward('nws', req)
}
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return forward('nws', req)
}

function auth(req: NextRequest): boolean {
  const secret = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('secret')
  return !!process.env.CRON_SECRET && secret === process.env.CRON_SECRET
}

async function forward(cadence: string, req: NextRequest) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3005'
  const secret = process.env.CRON_SECRET
  const url = `${base}/api/cron/alert-cycle?secret=${encodeURIComponent(secret || '')}&cadence=${cadence}`
  const res = await fetch(url, { method: 'POST', headers: req.headers })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
