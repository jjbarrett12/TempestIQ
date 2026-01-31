#!/usr/bin/env tsx
/**
 * Start all background workers
 * Run this script to start the polling and notification workers
 */

import '../src/workers/polling-worker'
import '../src/workers/notification-worker'

console.log('Starting all workers...')
console.log('Press Ctrl+C to stop')

// Keep process alive
process.on('SIGTERM', () => {
  console.log('Shutting down workers...')
  process.exit(0)
})
