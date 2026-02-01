-- Push Notifications Schema for TempestIQ
-- Run in Supabase SQL Editor or via: psql $DATABASE_URL -f supabase/migrations/20250101000000_push_notifications.sql

-- Sites: monitoring locations (lat/lon/radius)
-- Maps to Asset in main app; can be synced from assets
CREATE TABLE IF NOT EXISTS push_sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_miles DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  asset_id TEXT, -- FK to Asset if using Prisma
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_sites_active ON push_sites(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_push_sites_location ON push_sites(latitude, longitude);

-- Site subscriptions: which users want push for which sites
CREATE TABLE IF NOT EXISTS push_site_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  site_id TEXT NOT NULL REFERENCES push_sites(id) ON DELETE CASCADE,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, site_id)
);

CREATE INDEX IF NOT EXISTS idx_push_site_subs_user ON push_site_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_site_subs_site ON push_site_subscriptions(site_id);
CREATE INDEX IF NOT EXISTS idx_push_site_subs_enabled ON push_site_subscriptions(site_id, push_enabled) WHERE push_enabled = true;

-- Device tokens: FCM tokens per user
CREATE TABLE IF NOT EXISTS push_device_tokens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  fcm_token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'web', -- 'web', 'ios', 'android'
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, fcm_token)
);

CREATE INDEX IF NOT EXISTS idx_push_device_tokens_user ON push_device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_device_tokens_token ON push_device_tokens(fcm_token);

-- Alert events: normalized alerts from Xweather
CREATE TABLE IF NOT EXISTS push_alert_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  site_id TEXT NOT NULL REFERENCES push_sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'hail_threat', 'tornado_warning', 'severe_tstorm', etc.
  severity TEXT NOT NULL, -- 'low', 'moderate', 'high', 'extreme'
  provider_event_id TEXT,
  fingerprint TEXT NOT NULL, -- sha256 for dedupe
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cleared', 'escalated'
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  payload_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_push_alert_events_site ON push_alert_events(site_id);
CREATE INDEX IF NOT EXISTS idx_push_alert_events_status ON push_alert_events(status);
CREATE INDEX IF NOT EXISTS idx_push_alert_events_starts ON push_alert_events(starts_at);
CREATE INDEX IF NOT EXISTS idx_push_alert_events_fingerprint ON push_alert_events(site_id, fingerprint);
CREATE INDEX IF NOT EXISTS idx_push_alert_events_type_status ON push_alert_events(site_id, type, status);

-- Rate limit: last push per site per type (15 min window)
CREATE TABLE IF NOT EXISTS push_rate_limit (
  site_id TEXT NOT NULL,
  type TEXT NOT NULL,
  last_push_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (site_id, type)
);

-- Notifications log: delivery status
CREATE TABLE IF NOT EXISTS push_notifications_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  alert_event_id TEXT NOT NULL REFERENCES push_alert_events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'push',
  status TEXT NOT NULL, -- 'sent', 'delivered', 'failed'
  error TEXT,
  fcm_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_notifications_log_alert ON push_notifications_log(alert_event_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_log_user ON push_notifications_log(user_id);

-- RLS (optional - disable if using service role)
ALTER TABLE push_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_site_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_alert_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_rate_limit ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications_log ENABLE ROW LEVEL SECURITY;

-- Policy: service role bypasses RLS; no policies needed for server-only access
