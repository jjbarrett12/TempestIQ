-- Alert System Schema for TempestIQ
-- Plans, categories, provider signals, storm clusters, events, AI decisions, notifications
-- Uses auth.users.id (UUID) as FK source of truth for user_id

-- Enable extensions if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PLANS & GATING
-- =============================================================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  max_sites INT NOT NULL DEFAULT 1,
  max_alerts_per_month INT,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);

CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_plans_user ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_plan ON user_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_ends ON user_plans(ends_at) WHERE ends_at IS NOT NULL;

-- =============================================================================
-- ALERT CATEGORIES & USER SETTINGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS alert_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_categories_code ON alert_categories(code);

CREATE TABLE IF NOT EXISTS user_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES alert_categories(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  min_severity TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_user_alert_settings_user ON user_alert_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alert_settings_category ON user_alert_settings(category_id);
CREATE INDEX IF NOT EXISTS idx_user_alert_settings_enabled ON user_alert_settings(user_id, enabled) WHERE enabled = true;

-- =============================================================================
-- PROVIDER SIGNALS (raw from Xweather, NOAA/NWS, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS provider_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  provider_signal_id TEXT NOT NULL,
  category_code TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  magnitude TEXT,
  magnitude_units TEXT,
  severity TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  loc_description TEXT,
  state_code TEXT,
  payload_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_signal_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_signals_provider ON provider_signals(provider);
CREATE INDEX IF NOT EXISTS idx_provider_signals_category ON provider_signals(category_code);
CREATE INDEX IF NOT EXISTS idx_provider_signals_starts ON provider_signals(starts_at);
CREATE INDEX IF NOT EXISTS idx_provider_signals_location ON provider_signals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_provider_signals_dedup ON provider_signals(provider, provider_signal_id);

-- =============================================================================
-- STORM CLUSTERS (AI/rule-grouped storms)
-- =============================================================================

CREATE TABLE IF NOT EXISTS storm_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centroid_lat DOUBLE PRECISION NOT NULL,
  centroid_lng DOUBLE PRECISION NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  severity TEXT NOT NULL DEFAULT 'moderate',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cleared', 'escalated')),
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_storm_clusters_status ON storm_clusters(status);
CREATE INDEX IF NOT EXISTS idx_storm_clusters_starts ON storm_clusters(starts_at);
CREATE INDEX IF NOT EXISTS idx_storm_clusters_fingerprint ON storm_clusters(fingerprint);

CREATE TABLE IF NOT EXISTS cluster_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID NOT NULL REFERENCES storm_clusters(id) ON DELETE CASCADE,
  signal_id UUID NOT NULL REFERENCES provider_signals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cluster_id, signal_id)
);

CREATE INDEX IF NOT EXISTS idx_cluster_signals_cluster ON cluster_signals(cluster_id);
CREATE INDEX IF NOT EXISTS idx_cluster_signals_signal ON cluster_signals(signal_id);

-- =============================================================================
-- EVENTS (normalized, deduplicated; target of notifications)
-- =============================================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID REFERENCES storm_clusters(id) ON DELETE SET NULL,
  site_id TEXT REFERENCES push_sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'moderate',
  fingerprint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cleared', 'escalated')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  payload_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_events_site ON events(site_id);
CREATE INDEX IF NOT EXISTS idx_events_cluster ON events(cluster_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_starts ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_dedup ON events(site_id, fingerprint);

-- =============================================================================
-- AI DECISIONS (interpretation, damage implications)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  input_summary JSONB DEFAULT '{}',
  output_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_decisions_event ON ai_decisions(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_created ON ai_decisions(created_at);

-- =============================================================================
-- NOTIFICATIONS (delivery records)
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'push' CHECK (channel IN ('push', 'email', 'sms')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  error TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_event ON notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- =============================================================================
-- DEVICE TOKENS (FCM etc. for push; UUID user_id for auth.users)
-- =============================================================================

CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'web' CHECK (platform IN ('web', 'ios', 'android')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);
CREATE INDEX IF NOT EXISTS idx_device_tokens_platform ON device_tokens(platform);

-- =============================================================================
-- ROW LEVEL SECURITY (minimal, for user-owned rows)
-- =============================================================================

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- user_plans: users can read/update their own
CREATE POLICY "Users can read own user_plans" ON user_plans
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own user_plans" ON user_plans
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own user_plans" ON user_plans
  FOR UPDATE USING (user_id = auth.uid());

-- user_alert_settings: users can CRUD their own
CREATE POLICY "Users can manage own user_alert_settings" ON user_alert_settings
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- notifications: users can read their own
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- device_tokens: users can CRUD their own
CREATE POLICY "Users can manage own device_tokens" ON device_tokens
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- plans, alert_categories: public read (no RLS or allow all)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plans" ON plans FOR SELECT USING (true);

ALTER TABLE alert_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read alert_categories" ON alert_categories FOR SELECT USING (true);

-- provider_signals, storm_clusters, cluster_signals, events, ai_decisions: server-only (service role)
-- No user-facing RLS; accessed via service role in cron/API
ALTER TABLE provider_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE storm_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS by default; no policies needed for server-only tables
-- Add restrictive policy so anon/authenticated can't read without explicit allow
CREATE POLICY "No direct access to provider_signals" ON provider_signals FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No direct access to storm_clusters" ON storm_clusters FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No direct access to cluster_signals" ON cluster_signals FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No direct access to events" ON events FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No direct access to ai_decisions" ON ai_decisions FOR ALL USING (false) WITH CHECK (false);

-- notifications has user policy for SELECT; keep it
-- Drop the restrictive policy if we added one - we didn't for notifications
