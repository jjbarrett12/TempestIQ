import Redis from 'ioredis'

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL
  }
  // Default to localhost for development
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  REDIS_URL not set, using default: redis://localhost:6379')
    return 'redis://localhost:6379'
  }
  throw new Error('REDIS_URL is not defined')
}

let redisInstance: Redis | null = null

export const getRedisConnection = (): Redis => {
  if (!redisInstance) {
    redisInstance = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          return true
        }
        return false
      },
    })

    redisInstance.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    redisInstance.on('connect', () => {
      console.log('✅ Redis connected')
    })
  }
  return redisInstance
}
