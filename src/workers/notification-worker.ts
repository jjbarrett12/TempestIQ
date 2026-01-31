import { Worker } from 'bullmq'
import { getRedisConnection } from '../lib/redis'
import { dispatchNotification } from '../services/notifications/dispatcher'

const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const { notificationId } = job.data
    await dispatchNotification(notificationId)
  },
  {
    connection: getRedisConnection(),
    concurrency: 10, // Process multiple notifications concurrently
  }
)

notificationWorker.on('completed', (job) => {
  console.log(`[Notification Worker] Notification ${job.data.notificationId} sent`)
})

notificationWorker.on('failed', (job, err) => {
  console.error(`[Notification Worker] Notification ${job?.data?.notificationId} failed:`, err)
})

console.log('[Notification Worker] Started and listening for jobs...')

// Keep process alive
process.on('SIGTERM', async () => {
  await notificationWorker.close()
  process.exit(0)
})
