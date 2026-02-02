-- Seed: Default plans and alert categories for testing
-- Run after migrations: psql $DATABASE_URL -f supabase/seed/alert_system_seed.sql
-- Or in Supabase SQL Editor

-- =============================================================================
-- DEFAULT PLANS
-- =============================================================================

INSERT INTO plans (slug, name, max_sites, max_alerts_per_month, features) VALUES
  ('starter', 'Starter', 1, 50, '{"push": true, "email": false}'::jsonb),
  ('professional', 'Professional', 10, 200, '{"push": true, "email": true, "sms": false}'::jsonb),
  ('business', 'Business', 25, 500, '{"push": true, "email": true, "sms": true}'::jsonb),
  ('enterprise', 'Enterprise', 100, NULL, '{"push": true, "email": true, "sms": true, "api": true}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- DEFAULT ALERT CATEGORIES (NWS, HAIL, WIND)
-- =============================================================================

INSERT INTO alert_categories (code, name, description) VALUES
  ('nws', 'NWS / NOAA', 'National Weather Service watches, warnings, and local storm reports'),
  ('hail', 'Hail', 'Hail threats, reports, and severity'),
  ('wind', 'Wind', 'High wind, thunderstorm wind, and damaging wind events')
ON CONFLICT (code) DO NOTHING;
