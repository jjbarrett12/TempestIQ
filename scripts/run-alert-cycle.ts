#!/usr/bin/env npx tsx
/**
 * Run alert cycle locally or via external cron.
 * Usage: CRON_SECRET=xxx npx tsx scripts/run-alert-cycle.ts [nws|hail_wind]
 *
 * Vercel Cron: /api/cron/alert-nws (every 5 min), /api/cron/alert-hail-wind (every 10 min).
 * Hobby plan: limited to daily. Use external cron (cron-job.org) with ?secret=CRON_SECRET.
 */
const cadence = process.argv[2] || 'nws'
const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3005'
const secret = process.env.CRON_SECRET

if (!secret) {
  console.error('CRON_SECRET required')
  process.exit(1)
}

const url = `${base}/api/cron/alert-cycle?secret=${encodeURIComponent(secret)}&cadence=${encodeURIComponent(cadence)}`

fetch(url, { method: 'POST' })
  .then((r) => r.json())
  .then((data) => {
    console.log(JSON.stringify(data, null, 2))
    if (data.error) process.exit(1)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
