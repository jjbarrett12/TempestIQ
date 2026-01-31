import { Queue } from 'bullmq'
import { getRedisConnection } from './redis'

// Initialize queue
let pollingQueue: Queue | null = null

function getPollingQueue() {
  if (!pollingQueue) {
    pollingQueue = new Queue('polling', {
      connection: getRedisConnection(),
    })
  }
  return pollingQueue
}

/**
 * Schedule polling jobs based on risk level
 */
export async function schedulePollingJobs() {
  const queue = getPollingQueue()
  
  // Baseline polling: alerts every 5 minutes
  await queue.add(
    'poll-alerts',
    { type: 'alerts' },
    {
      repeat: {
        every: 5 * 60 * 1000, // 5 minutes
      },
      jobId: 'poll-alerts-recurring',
    }
  )

  // Hail threats: less frequent baseline (every 10 minutes)
  // In production, you'd adjust this based on season/region
  await queue.add(
    'poll-hail-threats',
    { type: 'hail_threats' },
    {
      repeat: {
        every: 10 * 60 * 1000, // 10 minutes
      },
      jobId: 'poll-hail-threats-recurring',
    }
  )

  console.log('[Scheduler] Polling jobs scheduled')
}

/**
 * Increase polling frequency for elevated risk (call this when storms detected)
 */
export async function enableElevatedRiskMode(assetIds: string[]) {
  // Cancel baseline hail polling
  await pollingQueue.removeRepeatable('poll-hail-threats-recurring')

  // Start frequent polling for affected assets
  await pollingQueue.add(
    'poll-hail-threats-elevated',
    { type: 'hail_threats', assetIds },
    {
      repeat: {
        every: 2 * 60 * 1000, // 2 minutes during elevated risk
      },
      jobId: 'poll-hail-threats-elevated-recurring',
    }
  )

  console.log(`[Scheduler] Elevated risk mode enabled for ${assetIds.length} assets`)
}

/**
 * Return to baseline polling frequency
 */
export async function disableElevatedRiskMode() {
  const queue = getPollingQueue()
  
  await queue.removeRepeatable('poll-hail-threats-elevated-recurring')

  // Restore baseline
  await queue.add(
    'poll-hail-threats',
    { type: 'hail_threats' },
    {
      repeat: {
        every: 10 * 60 * 1000,
      },
      jobId: 'poll-hail-threats-recurring',
    }
  )

  console.log('[Scheduler] Returned to baseline polling frequency')
}
