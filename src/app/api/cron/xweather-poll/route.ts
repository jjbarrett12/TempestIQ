import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getMessaging } from '@/lib/firebaseAdmin'
import { getXweatherClient } from '@/services/xweather/client'

const RATE_LIMIT_MINUTES = 15
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://tempestiq.com'

function fingerprint(siteId: string, type: string, severity: string, timeBucket: string, providerId: string): string {
  const str = `${siteId}|${type}|${severity}|${timeBucket}|${providerId}`
  return createHash('sha256').update(str).digest('hex')
}

function timeBucket(d: Date, minutes: number = 15): string {
  const m = Math.floor(d.getTime() / (minutes * 60 * 1000))
  return String(m)
}

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

  try {
    const xweather = getXweatherClient()
    const supabase = getSupabaseAdmin()

    // 1. Get active assets as sites
    const assets = await prisma.asset.findMany({
      where: { active: true },
      include: { customer: true },
    })

    for (const asset of assets) {
      // Upsert push_sites
      await supabase.from('push_sites').upsert(
        {
          id: asset.id,
          name: asset.name,
          latitude: asset.latitude,
          longitude: asset.longitude,
          radius_miles: asset.radiusMiles,
          asset_id: asset.id,
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
    }

    let alertsCreated = 0
    let pushesSent = 0

    for (const asset of assets) {
      try {
        const radius = Math.min(asset.radiusMiles || 25, 50)
        const siteId = asset.id

        // Poll hail threats
        const hailResp = await xweather.getHailThreats({
          latitude: asset.latitude,
          longitude: asset.longitude,
          radius,
        })
        const hailThreats = (hailResp.data as { threats?: unknown[] })?.threats || []

        for (const t of hailThreats) {
          const threat = t as {
            id?: string
            latitude?: number
            longitude?: number
            probability?: number
            intensity?: number
            startTime?: string
            endTime?: string
            radiusMiles?: number
          }
          const providerId = threat.id || `${threat.latitude}-${threat.longitude}-${threat.startTime}`
          const type = 'hail_threat'
          const severity = (threat.intensity && threat.intensity >= 2) ? 'high' : (threat.probability && threat.probability > 0.5 ? 'moderate' : 'low')
          const startTime = threat.startTime ? new Date(threat.startTime) : new Date()
          const tb = timeBucket(startTime)
          const fp = fingerprint(siteId, type, severity, tb, providerId)

          const { data: existing } = await supabase
            .from('push_alert_events')
            .select('id')
            .eq('site_id', siteId)
            .eq('fingerprint', fp)
            .single()

          if (existing) continue

          // Rate limit check
          const { data: rl } = await supabase
            .from('push_rate_limit')
            .select('last_push_at')
            .eq('site_id', siteId)
            .eq('type', type)
            .single()

          if (rl) {
            const last = new Date(rl.last_push_at)
            if (Date.now() - last.getTime() < RATE_LIMIT_MINUTES * 60 * 1000) continue
          }

          const { data: newAlert, error: insertErr } = await supabase
            .from('push_alert_events')
            .insert({
              site_id: siteId,
              type,
              severity,
              provider_event_id: providerId,
              fingerprint: fp,
              status: 'active',
              starts_at: startTime.toISOString(),
              ends_at: threat.endTime ? new Date(threat.endTime).toISOString() : null,
              payload_json: threat,
            })
            .select('id')
            .single()

          if (insertErr || !newAlert) continue
          alertsCreated++

          await supabase
            .from('push_rate_limit')
            .upsert(
              { site_id: siteId, type, last_push_at: new Date().toISOString() },
              { onConflict: 'site_id,type' }
            )

          const sent = await sendPushForAlert(
            supabase,
            newAlert.id as string,
            siteId,
            type,
            severity,
            asset.name,
            `Hail threat: ${severity} severity near ${asset.name}`
          )
          pushesSent += sent
        }

        // Poll storm threats (if available)
        try {
          const stormResp = await xweather.getStormThreats({
            latitude: asset.latitude,
            longitude: asset.longitude,
            radius,
          })
          const stormThreats = (stormResp.data as { threats?: unknown[] })?.threats || []

          for (const t of stormThreats) {
            const threat = t as { id?: string; type?: string; severity?: string; startTime?: string; endTime?: string }
            const providerId = threat.id || 'storm-' + Date.now()
            const type = (threat.type as string) || 'storm_threat'
            const severity = (threat.severity as string) || 'moderate'
            const startTime = threat.startTime ? new Date(threat.startTime) : new Date()
            const tb = timeBucket(startTime)
            const fp = fingerprint(siteId, type, severity, tb, providerId)

            const { data: existing } = await supabase
              .from('push_alert_events')
              .select('id')
              .eq('site_id', siteId)
              .eq('fingerprint', fp)
              .single()

            if (existing) continue

            const { data: rl } = await supabase
              .from('push_rate_limit')
              .select('last_push_at')
              .eq('site_id', siteId)
              .eq('type', type)
              .single()

            if (rl) {
              const last = new Date(rl.last_push_at)
              if (Date.now() - last.getTime() < RATE_LIMIT_MINUTES * 60 * 1000) continue
            }

            const { data: newAlert, error: insertErr } = await supabase
              .from('push_alert_events')
              .insert({
                site_id: siteId,
                type,
                severity,
                provider_event_id: providerId,
                fingerprint: fp,
                status: 'active',
                starts_at: startTime.toISOString(),
                ends_at: threat.endTime ? new Date(threat.endTime).toISOString() : null,
                payload_json: threat,
              })
              .select('id')
              .single()

            if (insertErr || !newAlert) continue
            alertsCreated++

            await supabase
              .from('push_rate_limit')
              .upsert(
                { site_id: siteId, type, last_push_at: new Date().toISOString() },
                { onConflict: 'site_id,type' }
              )

            const sent = await sendPushForAlert(
              supabase,
              newAlert.id as string,
              siteId,
              type,
              severity,
              asset.name,
              `Storm alert: ${severity} - ${asset.name}`
            )
            pushesSent += sent
          }
        } catch {
          // Storm threats optional
        }
      } catch (err) {
        console.error(`[cron] xweather-poll asset ${asset.id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      sites: assets.length,
      alertsCreated,
      pushesSent,
    })
  } catch (err) {
    console.error('[cron] xweather-poll:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Poll failed' },
      { status: 500 }
    )
  }
}

async function sendPushForAlert(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  alertId: string,
  siteId: string,
  type: string,
  severity: string,
  siteName: string,
  body: string
): Promise<number> {
  const subs = await prisma.subscription.findMany({
    where: { assetId: siteId, pushEnabled: true },
    select: { customerId: true },
  })

  const customerIds = [...new Set(subs.map((s) => s.customerId))]
  const users = await prisma.user.findMany({
    where: { customerId: { in: customerIds } },
    select: { id: true },
  })
  const userIds = new Set(users.map((u) => u.id))

  if (userIds.size === 0) return 0

  const { data: tokenRows } = await supabase
    .from('push_device_tokens')
    .select('fcm_token')
    .in('user_id', Array.from(userIds))

  if (!tokenRows?.length) return 0

  const messaging = getMessaging()
  const url = `${SITE_URL}/alerts/${alertId}`
  const invalidTokens: string[] = []
  let sent = 0

  for (const row of tokenRows) {
    try {
      await messaging.send({
        token: row.fcm_token,
        notification: {
          title: `TempestIQ: ${siteName}`,
          body,
        },
        data: {
          alertId,
          siteId,
          type,
          severity,
          url,
        },
        webpush: {
          fcmOptions: { link: url },
        },
      })
      sent++

      for (const uid of userIds) {
        await supabase.from('push_notifications_log').insert({
          alert_event_id: alertId,
          user_id: uid,
          channel: 'push',
          status: 'sent',
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('registration-token-not-registered') || msg.includes('invalid-registration-token')) {
        invalidTokens.push(row.fcm_token)
      }
    }
  }

  if (invalidTokens.length > 0) {
    await supabase.from('push_device_tokens').delete().in('fcm_token', invalidTokens)
  }

  return sent
}
