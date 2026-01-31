import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { eventNormalizer } from '@/services/events/normalizer'
import { eventDeduplicator } from '@/services/events/deduplicator'
import { eventMatcher } from '@/services/events/matcher'
import { createNotificationsForEvent } from '@/services/notifications/dispatcher'

/**
 * Webhook endpoint for Xweather to push severe weather events
 * This is the fastest path for receiving alerts
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Verify webhook signature if Xweather provides one
    const body = await request.json()

    // Store raw webhook payload
    await prisma.eventRaw.create({
      data: {
        source: 'xweather_webhook',
        rawPayload: body,
        costTokens: body.costTokens || null,
      },
    })

    // Process based on webhook type
    let normalized

    if (body.type === 'hail_threat' || body.type === 'lightning') {
      normalized = eventNormalizer.normalizeHailThreat(body)
    } else if (body.type === 'alert') {
      normalized = eventNormalizer.normalizeAlert(body)
    } else {
      console.log(`[Webhook] Unknown webhook type: ${body.type}`)
      return NextResponse.json({ received: true })
    }

    if (!normalized) {
      return NextResponse.json({ received: true })
    }

    // Check for duplicates
    const isDup = await eventDeduplicator.isDuplicate(normalized, 5) // 5 min window for webhooks
    if (isDup) {
      console.log(`[Webhook] Duplicate event skipped: ${body.id || 'unknown'}`)
      return NextResponse.json({ received: true, duplicate: true })
    }

    // Create or update event
    const { id: eventId, isNew } = await eventDeduplicator.updateOrCreate(normalized)

    if (isNew) {
      // Match to assets and create notifications
      const matches = await eventMatcher.matchEventToAssets(normalized)
      await createNotificationsForEvent(eventId, matches)
      console.log(`[Webhook] Created event ${eventId} with ${matches.length} matches`)
    }

    return NextResponse.json({ received: true, eventId })
  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
