import { EventType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { NormalizedEvent, DeduplicationKey } from './types'

export class EventDeduplicator {
  /**
   * Check if an event is a duplicate within the time window
   */
  async isDuplicate(event: NormalizedEvent, timeWindowMinutes: number = 15): Promise<boolean> {
    const windowStart = new Date(event.startTime.getTime() - timeWindowMinutes * 60 * 1000)
    const windowEnd = new Date(event.startTime.getTime() + timeWindowMinutes * 60 * 1000)

    // Check by source event ID first (most reliable)
    if (event.sourceEventId) {
      const existing = await prisma.event.findFirst({
        where: {
          source: event.source,
          sourceEventId: event.sourceEventId,
          startTime: {
            gte: windowStart,
            lte: windowEnd,
          },
        },
      })

      if (existing) {
        return true
      }
    }

    // Check by proximity and type (for events without stable IDs)
    const proximityThreshold = 0.1 // ~6 miles
    const existing = await prisma.event.findFirst({
      where: {
        eventType: event.eventType,
        source: event.source,
        latitude: {
          gte: event.latitude - proximityThreshold,
          lte: event.latitude + proximityThreshold,
        },
        longitude: {
          gte: event.longitude - proximityThreshold,
          lte: event.longitude + proximityThreshold,
        },
        startTime: {
          gte: windowStart,
          lte: windowEnd,
        },
        status: {
          in: ['ACTIVE', 'KEEP_ALIVE'],
        },
      },
    })

    return !!existing
  }

  /**
   * Update existing event to KEEP_ALIVE status if it's an update
   */
  async updateOrCreate(event: NormalizedEvent): Promise<{ id: string; isNew: boolean }> {
    const existing = await prisma.event.findFirst({
      where: {
        source: event.source,
        sourceEventId: event.sourceEventId || undefined,
        eventType: event.eventType,
        status: {
          in: ['ACTIVE', 'KEEP_ALIVE'],
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    })

    if (existing) {
      // Update existing event
      const updated = await prisma.event.update({
        where: { id: existing.id },
        data: {
          status: 'KEEP_ALIVE',
          endTime: event.endTime || existing.endTime,
        },
      })
      return { id: updated.id, isNew: false }
    }

    // Create new event
    const created = await prisma.event.create({
      data: {
        eventType: event.eventType,
        severity: event.severity,
        confidence: event.confidence,
        source: event.source,
        sourceEventId: event.sourceEventId,
        latitude: event.latitude,
        longitude: event.longitude,
        radiusMiles: event.radiusMiles,
        geometry: event.geometry,
        startTime: event.startTime,
        endTime: event.endTime,
        status: 'ACTIVE',
      },
    })

    return { id: created.id, isNew: true }
  }
}

export const eventDeduplicator = new EventDeduplicator()
