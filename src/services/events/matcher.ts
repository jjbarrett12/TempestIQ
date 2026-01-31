import { getDistance } from 'geolib'
import { prisma } from '@/lib/prisma'
import { EventType } from '@prisma/client'
import { NormalizedEvent, EventMatch } from './types'

export class EventMatcher {
  /**
   * Match events to assets and subscriptions
   */
  async matchEventToAssets(event: NormalizedEvent): Promise<EventMatch[]> {
    const matches: EventMatch[] = []

    // Find all active assets
    const assets = await prisma.asset.findMany({
      where: { active: true },
      include: {
        subscriptions: {
          where: {
            // Filter by alert type preferences
            ...this.getSubscriptionFilter(event.eventType),
          },
        },
      },
    })

    for (const asset of assets) {
      // Calculate distance in meters, convert to miles
      const distanceMeters = getDistance(
        { latitude: event.latitude, longitude: event.longitude },
        { latitude: asset.latitude, longitude: asset.longitude }
      )
      const distanceMiles = distanceMeters / 1609.34

      // Check if event is within asset radius + event radius
      const eventRadius = event.radiusMiles || 0
      const totalRadius = asset.radiusMiles + eventRadius

      if (distanceMiles <= totalRadius) {
        // Check each subscription for this asset
        for (const subscription of asset.subscriptions) {
          const shouldNotify = this.shouldNotify(event, subscription, distanceMiles)
          
          matches.push({
            event,
            assetId: asset.id,
            subscriptionId: subscription.id,
            shouldNotify,
          })
        }
      }
    }

    return matches
  }

  private getSubscriptionFilter(eventType: EventType) {
    switch (eventType) {
      case EventType.TORNADO_WARNING:
        return { tornadoWarning: true }
      case EventType.TORNADO_WATCH:
        return { tornadoWatch: true }
      case EventType.SEVERE_TSTORM_WARNING:
        return { severeTstormWarning: true }
      case EventType.HAIL_THREAT:
        return { hailThreat: true }
      case EventType.HIGH_WIND_WARNING:
      case EventType.EXTREME_WIND_GUST:
        return { extremeWind: true }
      default:
        return {}
    }
  }

  private shouldNotify(
    event: NormalizedEvent,
    subscription: any,
    distanceMiles: number
  ): boolean {
    // Always notify for tornado warnings
    if (event.eventType === EventType.TORNADO_WARNING) {
      return true
    }

    // Check quiet hours
    if (subscription.quietHoursStart !== null && subscription.quietHoursEnd !== null) {
      const now = new Date()
      const hour = now.getUTCHours()
      const start = subscription.quietHoursStart
      const end = subscription.quietHoursEnd

      // Handle wrap-around (e.g., 22-6)
      if (start > end) {
        if (hour >= start || hour < end) {
          return false // In quiet hours
        }
      } else {
        if (hour >= start && hour < end) {
          return false // In quiet hours
        }
      }
    }

    // For hail threats, check severity threshold
    if (event.eventType === EventType.HAIL_THREAT) {
      // Only notify for moderate+ severity or high confidence
      if (event.severity === 'LOW' && (event.confidence || 0) < 0.6) {
        return false
      }
    }

    return true
  }
}

export const eventMatcher = new EventMatcher()
