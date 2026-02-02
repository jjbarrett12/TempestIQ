import { NextRequest, NextResponse } from 'next/server'

/**
 * Alert cycle cron: NWS every 5 min, Hail/Wind every 10 min.
 * Vercel cron hits this URL. Cadence passed via header or query.
 * Logs: signalsIngested, clustersCreated, eventsCreated, notificationsWritten
 */
const CRON_NWS = 'nws'
const CRON_HAIL_WIND = 'hail_wind'

export async function GET(request: NextRequest) {
  return handleCron(request)
}

export async function POST(request: NextRequest) {
  return handleCron(request)
}

async function handleCron(request: NextRequest) {
  const secret =
    request.headers.get('x-cron-secret') ||
    new URL(request.url).searchParams.get('secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cadence =
    request.headers.get('x-cron-cadence') ||
    new URL(request.url).searchParams.get('cadence') ||
    CRON_NWS

  const logs = {
    cadence,
    signalsIngested: 0,
    clustersCreated: 0,
    eventsCreated: 0,
    notificationsWritten: 0,
    ts: new Date().toISOString(),
  }

  try {
    if (cadence === CRON_NWS) {
      // NWS warnings: every 5 min
      const nws = await runNwsCycle()
      logs.signalsIngested += nws.signalsIngested
      logs.eventsCreated += nws.eventsCreated
      logs.notificationsWritten += nws.notificationsWritten
    }

    if (cadence === CRON_HAIL_WIND) {
      // Hail/Wind: every 10 min — delegates to xweather-poll
      const hw = await runHailWindCycle()
      logs.signalsIngested += hw.signalsIngested
      logs.eventsCreated += hw.eventsCreated
      logs.notificationsWritten += hw.notificationsWritten
    }

    return NextResponse.json({ ok: true, logs })
  } catch (err) {
    console.error('[alert-cycle]', err)
    return NextResponse.json(
      { error: (err as Error).message, logs },
      { status: 500 }
    )
  }
}

async function runNwsCycle(): Promise<{
  signalsIngested: number
  eventsCreated: number
  notificationsWritten: number
}> {
  // Stub: NWS/NOAA polling. Wire to Step 2 backend when ready.
  return {
    signalsIngested: 0,
    eventsCreated: 0,
    notificationsWritten: 0,
  }
}

async function runHailWindCycle(): Promise<{
  signalsIngested: number
  eventsCreated: number
  notificationsWritten: number
}> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3005'
  const url = `${base}/api/cron/xweather-poll?secret=${encodeURIComponent(process.env.CRON_SECRET || '')}`
  const res = await fetch(url, { method: 'POST' })
  const data = (await res.json().catch(() => ({}))) as {
    alertsCreated?: number
    pushesSent?: number
  }
  return {
    signalsIngested: data.alertsCreated ?? 0,
    eventsCreated: data.alertsCreated ?? 0,
    notificationsWritten: data.pushesSent ?? 0,
  }
}
