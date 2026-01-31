import { Worker } from 'bullmq'
import { getRedisConnection } from '../lib/redis'
import { getXweatherClient } from '../services/xweather/client'
import { prisma } from '../lib/prisma'
import { eventNormalizer } from '../services/events/normalizer'
import { eventDeduplicator } from '../services/events/deduplicator'
import { eventMatcher } from '../services/events/matcher'
import { createNotificationsForEvent } from '../services/notifications/dispatcher'

interface PollingJob {
  type: 'alerts' | 'hail_threats'
  assetIds?: string[] // Optional: limit to specific assets
}

const pollingWorker = new Worker<PollingJob>(
  'polling',
  async (job) => {
    const { type, assetIds } = job.data
    const xweather = getXweatherClient()

    console.log(`[Polling Worker] Processing ${type} job`)

    try {
      if (type === 'alerts') {
        await pollAlerts(xweather)
      } else if (type === 'hail_threats') {
        await pollHailThreats(xweather, assetIds)
      }
    } catch (error: any) {
      console.error(`[Polling Worker] Error processing ${type}:`, error)
      throw error
    }
  },
  {
    connection: getRedisConnection(),
    concurrency: 1, // Process one at a time to avoid rate limits
  }
)

async function pollAlerts(xweather: any) {
  // Poll for tornado warnings and severe storm warnings
  const response = await xweather.getAlerts({
    alertType: 'tornado_warning,severe_thunderstorm_warning,high_wind_warning',
  })

  // Store raw response
  await prisma.eventRaw.create({
    data: {
      source: 'xweather_alerts',
      rawPayload: response.data as any,
      costTokens: parseInt(response.headers['x-cost-tokens'] || '0'),
    },
  })

  // Process each alert
  const alerts = response.data.alerts || []
  for (const alert of alerts) {
    const normalized = eventNormalizer.normalizeAlert(alert)
    if (!normalized) continue

    const isDup = await eventDeduplicator.isDuplicate(normalized)
    if (isDup) {
      console.log(`[Polling Worker] Duplicate alert skipped: ${alert.id}`)
      continue
    }

    const { id: eventId, isNew } = await eventDeduplicator.updateOrCreate(normalized)
    
    if (isNew) {
      // Match to assets and create notifications
      const matches = await eventMatcher.matchEventToAssets(normalized)
      await createNotificationsForEvent(eventId, matches)
      console.log(`[Polling Worker] Created event ${eventId} with ${matches.length} matches`)
    }
  }

  // Record token usage
  const tokens = parseInt(response.headers['x-cost-tokens'] || '0')
  if (tokens > 0) {
    await recordTokenUsage('xweather_alerts', tokens)
  }
}

async function pollHailThreats(xweather: any, assetIds?: string[]) {
  // Get active assets (optionally filtered)
  const assets = await prisma.asset.findMany({
    where: {
      active: true,
      ...(assetIds ? { id: { in: assetIds } } : {}),
    },
  })

  if (assets.length === 0) {
    console.log('[Polling Worker] No active assets for hail threat polling')
    return
  }

  // Poll hail threats for each asset
  // Note: In production, you might want to batch these or use geometry queries
  for (const asset of assets) {
    try {
      const response = await xweather.getHailThreats({
        latitude: asset.latitude,
        longitude: asset.longitude,
        radius: asset.radiusMiles,
      })

      // Store raw response
      await prisma.eventRaw.create({
        data: {
          source: 'xweather_hail_threats',
          rawPayload: response.data as any,
          costTokens: parseInt(response.headers['x-cost-tokens'] || '0'),
        },
      })

      const threats = response.data.threats || []
      for (const threat of threats) {
        const normalized = eventNormalizer.normalizeHailThreat(threat)
        
        const isDup = await eventDeduplicator.isDuplicate(normalized, 10) // 10 min window for hail
        if (isDup) continue

        const { id: eventId, isNew } = await eventDeduplicator.updateOrCreate(normalized)
        
        if (isNew) {
          const matches = await eventMatcher.matchEventToAssets(normalized)
          await createNotificationsForEvent(eventId, matches)
          console.log(`[Polling Worker] Created hail threat ${eventId} for asset ${asset.id}`)
        }
      }

      // Record token usage
      const tokens = parseInt(response.headers['x-cost-tokens'] || '0')
      if (tokens > 0) {
        await recordTokenUsage('xweather_hail_threats', tokens)
      }
    } catch (error: any) {
      console.error(`[Polling Worker] Error polling hail threats for asset ${asset.id}:`, error)
      // Continue with other assets
    }
  }
}

async function recordTokenUsage(source: string, tokens: number, customerId?: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // If customerId is provided, record per customer
  // Otherwise, record system-wide (for shared polling)
  if (customerId) {
    // Prisma unique constraint uses compound key format
    const existing = await prisma.usageToken.findUnique({
      where: {
        customerId_date_source: {
          customerId,
          date: today,
          source,
        },
      },
    })

    if (existing) {
      await prisma.usageToken.update({
        where: { id: existing.id },
        data: { tokens: { increment: tokens } },
      })
    } else {
      await prisma.usageToken.create({
        data: {
          customerId,
          date: today,
          source,
          tokens,
        },
      })
    }
  } else {
    // For system-wide polling, distribute tokens across all customers
    // In production, you might want a different allocation strategy
    const customers = await prisma.customer.findMany({ select: { id: true } })
    const tokensPerCustomer = customers.length > 0 ? Math.ceil(tokens / customers.length) : tokens

    for (const customer of customers) {
      const existing = await prisma.usageToken.findUnique({
        where: {
          customerId_date_source: {
            customerId: customer.id,
            date: today,
            source,
          },
        },
      })

      if (existing) {
        await prisma.usageToken.update({
          where: { id: existing.id },
          data: { tokens: { increment: tokensPerCustomer } },
        })
      } else {
        await prisma.usageToken.create({
          data: {
            customerId: customer.id,
            date: today,
            source,
            tokens: tokensPerCustomer,
          },
        })
      }
    }
  }
}

pollingWorker.on('completed', (job) => {
  console.log(`[Polling Worker] Job ${job.id} completed`)
})

pollingWorker.on('failed', (job, err) => {
  console.error(`[Polling Worker] Job ${job?.id} failed:`, err)
})

console.log('[Polling Worker] Started and listening for jobs...')

// Keep process alive
process.on('SIGTERM', async () => {
  await pollingWorker.close()
  process.exit(0)
})
