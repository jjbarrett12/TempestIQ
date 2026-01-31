import { EventType, EventSeverity } from '@prisma/client'
import { Alert, HailThreat } from '../xweather/types'
import { NormalizedEvent } from './types'

export class EventNormalizer {
  /**
   * Normalize Xweather alert into internal event format
   */
  normalizeAlert(alert: Alert): NormalizedEvent | null {
    // Extract geometry center point
    const geometry = this.extractGeometry(alert.area)
    if (!geometry) return null

    const eventType = this.mapAlertTypeToEventType(alert.type)
    if (!eventType) return null

    return {
      eventType,
      severity: this.mapSeverity(alert.severity, alert.urgency, alert.certainty),
      confidence: this.mapCertaintyToConfidence(alert.certainty),
      source: 'xweather_alerts',
      sourceEventId: alert.id,
      latitude: geometry.latitude,
      longitude: geometry.longitude,
      radiusMiles: geometry.radiusMiles,
      geometry: alert.area,
      startTime: new Date(alert.effective),
      endTime: alert.expires ? new Date(alert.expires) : undefined,
    }
  }

  /**
   * Normalize Xweather hail threat into internal event format
   */
  normalizeHailThreat(threat: HailThreat): NormalizedEvent {
    return {
      eventType: EventType.HAIL_THREAT,
      severity: this.mapHailSeverity(threat.intensity, threat.probability),
      confidence: threat.probability,
      source: 'xweather_hail_threats',
      sourceEventId: threat.id,
      latitude: threat.latitude,
      longitude: threat.longitude,
      radiusMiles: threat.radiusMiles,
      startTime: new Date(threat.startTime),
      endTime: new Date(threat.endTime),
    }
  }

  private extractGeometry(area: Alert['area']): { latitude: number; longitude: number; radiusMiles?: number } | null {
    if (!area.coordinates || area.coordinates.length === 0) {
      return null
    }

    // For point geometry
    if (area.type === 'Point' && area.coordinates[0]?.length === 2) {
      return {
        longitude: area.coordinates[0][0],
        latitude: area.coordinates[0][1],
      }
    }

    // For polygon, calculate centroid
    if (area.type === 'Polygon' && area.coordinates[0]) {
      const coords = area.coordinates[0]
      let latSum = 0
      let lonSum = 0
      let count = 0

      for (const coord of coords) {
        if (coord.length >= 2) {
          lonSum += coord[0]
          latSum += coord[1]
          count++
        }
      }

      if (count > 0) {
        return {
          latitude: latSum / count,
          longitude: lonSum / count,
        }
      }
    }

    return null
  }

  private mapAlertTypeToEventType(alertType: string): EventType | null {
    const type = alertType.toLowerCase()
    
    if (type.includes('tornado') && type.includes('warning')) {
      return EventType.TORNADO_WARNING
    }
    if (type.includes('tornado') && type.includes('watch')) {
      return EventType.TORNADO_WATCH
    }
    if (type.includes('severe thunderstorm') && type.includes('warning')) {
      return EventType.SEVERE_TSTORM_WARNING
    }
    if (type.includes('wind') && (type.includes('warning') || type.includes('advisory'))) {
      return EventType.HIGH_WIND_WARNING
    }
    
    return null
  }

  private mapSeverity(severity: string, urgency: string, certainty: string): EventSeverity {
    const sev = severity?.toLowerCase() || ''
    const urg = urgency?.toLowerCase() || ''
    const cert = certainty?.toLowerCase() || ''

    // Tornado warnings are always extreme
    if (sev.includes('extreme') || (urg === 'immediate' && cert === 'observed')) {
      return EventSeverity.EXTREME
    }

    if (sev.includes('severe') || urg === 'immediate') {
      return EventSeverity.HIGH
    }

    if (sev.includes('moderate') || urg === 'expected') {
      return EventSeverity.MODERATE
    }

    return EventSeverity.LOW
  }

  private mapHailSeverity(intensity: number, probability: number): EventSeverity {
    // Hail size in inches
    if (intensity >= 2.0 || (intensity >= 1.5 && probability >= 0.8)) {
      return EventSeverity.EXTREME
    }
    if (intensity >= 1.0 || (intensity >= 0.75 && probability >= 0.7)) {
      return EventSeverity.HIGH
    }
    if (intensity >= 0.5 || probability >= 0.5) {
      return EventSeverity.MODERATE
    }
    return EventSeverity.LOW
  }

  private mapCertaintyToConfidence(certainty: string): number {
    const cert = certainty?.toLowerCase() || ''
    if (cert === 'observed') return 1.0
    if (cert === 'likely') return 0.8
    if (cert === 'possible') return 0.6
    if (cert === 'unlikely') return 0.3
    return 0.5
  }
}

export const eventNormalizer = new EventNormalizer()
