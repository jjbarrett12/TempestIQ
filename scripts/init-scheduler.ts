#!/usr/bin/env tsx
/**
 * Initialize the polling scheduler
 * Run this once to set up recurring polling jobs
 */

import { schedulePollingJobs } from '../src/lib/scheduler'

async function main() {
  console.log('Initializing polling scheduler...')
  await schedulePollingJobs()
  console.log('Scheduler initialized. Polling jobs are now active.')
  process.exit(0)
}

main().catch((error) => {
  console.error('Failed to initialize scheduler:', error)
  process.exit(1)
})
