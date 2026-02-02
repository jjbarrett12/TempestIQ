/**
 * TypeScript types for the alert system schema (Supabase)
 * Matches supabase/migrations/20250201000000_alert_system.sql
 * Uses auth.users.id (UUID) as user_id source of truth
 */

export type Json = Record<string, unknown> | unknown[]

// =============================================================================
// PLANS & GATING
// =============================================================================

export interface Plan {
  id: string
  slug: string
  name: string
  max_sites: number
  max_alerts_per_month: number | null
  features: Json
  created_at: string
  updated_at: string
}

export interface PlanInsert {
  id?: string
  slug: string
  name: string
  max_sites?: number
  max_alerts_per_month?: number | null
  features?: Json
}

export interface UserPlan {
  id: string
  user_id: string
  plan_id: string
  started_at: string
  ends_at: string | null
  created_at: string
  updated_at: string
}

export interface UserPlanInsert {
  id?: string
  user_id: string
  plan_id: string
  started_at?: string
  ends_at?: string | null
}

// =============================================================================
// ALERT CATEGORIES & USER SETTINGS
// =============================================================================

export interface AlertCategory {
  id: string
  code: string
  name: string
  description: string | null
  created_at: string
}

export interface AlertCategoryInsert {
  id?: string
  code: string
  name: string
  description?: string | null
}

export type MinSeverity = 'low' | 'moderate' | 'high' | 'extreme'

export interface UserAlertSetting {
  id: string
  user_id: string
  category_id: string
  enabled: boolean
  min_severity: MinSeverity
  created_at: string
  updated_at: string
}

export interface UserAlertSettingInsert {
  id?: string
  user_id: string
  category_id: string
  enabled?: boolean
  min_severity?: MinSeverity
}

// =============================================================================
// PROVIDER SIGNALS
// =============================================================================

export type Provider = 'xweather' | 'noaa_nws'

export interface ProviderSignal {
  id: string
  provider: Provider
  provider_signal_id: string
  category_code: string
  latitude: number
  longitude: number
  magnitude: string | null
  magnitude_units: string | null
  severity: string | null
  starts_at: string
  ends_at: string | null
  loc_description: string | null
  state_code: string | null
  payload_json: Json
  created_at: string
}

export interface ProviderSignalInsert {
  id?: string
  provider: Provider
  provider_signal_id: string
  category_code: string
  latitude: number
  longitude: number
  magnitude?: string | null
  magnitude_units?: string | null
  severity?: string | null
  starts_at: string
  ends_at?: string | null
  loc_description?: string | null
  state_code?: string | null
  payload_json?: Json
}

// =============================================================================
// STORM CLUSTERS
// =============================================================================

export type ClusterStatus = 'active' | 'cleared' | 'escalated'

export interface StormCluster {
  id: string
  centroid_lat: number
  centroid_lng: number
  starts_at: string
  ends_at: string | null
  severity: string
  status: ClusterStatus
  fingerprint: string
  created_at: string
  updated_at: string
}

export interface StormClusterInsert {
  id?: string
  centroid_lat: number
  centroid_lng: number
  starts_at: string
  ends_at?: string | null
  severity?: string
  status?: ClusterStatus
  fingerprint: string
}

export interface ClusterSignal {
  id: string
  cluster_id: string
  signal_id: string
  created_at: string
}

export interface ClusterSignalInsert {
  id?: string
  cluster_id: string
  signal_id: string
}

// =============================================================================
// EVENTS
// =============================================================================

export type EventStatus = 'active' | 'cleared' | 'escalated'

export interface Event {
  id: string
  cluster_id: string | null
  site_id: string | null
  type: string
  severity: string
  fingerprint: string
  status: EventStatus
  starts_at: string
  ends_at: string | null
  payload_json: Json
  created_at: string
  updated_at: string
}

export interface EventInsert {
  id?: string
  cluster_id?: string | null
  site_id?: string | null
  type: string
  severity: string
  fingerprint: string
  status?: EventStatus
  starts_at: string
  ends_at?: string | null
  payload_json?: Json
}

// =============================================================================
// AI DECISIONS
// =============================================================================

export interface AiDecision {
  id: string
  event_id: string
  model: string
  input_summary: Json
  output_json: Json
  created_at: string
}

export interface AiDecisionInsert {
  id?: string
  event_id: string
  model: string
  input_summary?: Json
  output_json: Json
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export type NotificationChannel = 'push' | 'email' | 'sms'

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed'

export interface Notification {
  id: string
  user_id: string
  event_id: string
  channel: NotificationChannel
  status: NotificationStatus
  sent_at: string | null
  error: string | null
  external_id: string | null
  created_at: string
}

export interface NotificationInsert {
  id?: string
  user_id: string
  event_id: string
  channel?: NotificationChannel
  status?: NotificationStatus
  sent_at?: string | null
  error?: string | null
  external_id?: string | null
}

// =============================================================================
// DEVICE TOKENS
// =============================================================================

export type DevicePlatform = 'web' | 'ios' | 'android'

export interface DeviceToken {
  id: string
  user_id: string
  token: string
  platform: DevicePlatform
  last_seen_at: string
  created_at: string
  updated_at: string
}

export interface DeviceTokenInsert {
  id?: string
  user_id: string
  token: string
  platform?: DevicePlatform
  last_seen_at?: string
}
