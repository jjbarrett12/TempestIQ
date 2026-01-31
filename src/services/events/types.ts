import { EventType, EventSeverity, EventStatus } from '@prisma/client'

export interface NormalizedEvent {
  eventType: EventType
  severity: EventSeverity
  confidence?: number
  source: string
  sourceEventId?: string
  latitude: number
  longitude: number
  radiusMiles?: number
  geometry?: any
  startTime: Date
  endTime?: Date
}

export interface EventMatch {
  event: NormalizedEvent
  assetId: string
  subscriptionId: string
  shouldNotify: boolean
}

export interface DeduplicationKey {
  source: string
  sourceEventId?: string
  eventType: EventType
  latitude: number
  longitude: number
  timeWindow: number // minutes
}
