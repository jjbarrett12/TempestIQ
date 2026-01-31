# Roof Alert Platform - Architecture

## Overview

Roof Alert is a weather alert platform that monitors severe weather events (hail, tornado, extreme wind) using Xweather APIs and delivers real-time notifications to customers via SMS, email, push notifications, and in-app alerts.

## System Architecture

```
┌─────────────┐
│   Next.js   │  Frontend (Customer Portal, Admin Portal)
│   Frontend  │
└──────┬──────┘
       │
┌──────▼──────┐
│  Next.js    │  API Routes (REST endpoints)
│  API Routes │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐  ┌────▼──────┐  ┌───▼────────┐
│  PostgreSQL │  │   Redis   │  │  Xweather  │
│  Database   │  │   Queue    │  │    API     │
└─────────────┘  └────────────┘  └────────────┘
       │              │
       │         ┌────▼──────────────┐
       │         │  Background       │
       │         │  Workers          │
       │         │  - Polling        │
       │         │  - Notifications  │
       │         └──────────────────┘
       │
┌──────▼──────┐  ┌──────────────┐
│   Twilio    │  │  SendGrid    │
│   (SMS)     │  │  (Email)     │
└─────────────┘  └──────────────┘
```

## Data Flow

### 1. Weather Data Ingestion

**Polling Mode:**
1. Scheduler triggers polling jobs at configured intervals
2. Polling worker fetches data from Xweather APIs:
   - `/alerts` - Official tornado/severe storm warnings
   - `/hail/threats` - Hail nowcast (0-60 min ahead)
3. Raw responses stored in `events_raw` table
4. Token usage tracked via `X-Cost-Tokens` header

**Webhook Mode (Preferred):**
1. Xweather pushes events to `/api/webhooks/xweather`
2. Webhook handler processes events immediately
3. Faster delivery, lower API costs

### 2. Event Processing Pipeline

```
Raw Weather Data
    ↓
Event Normalizer (converts to internal format)
    ↓
Event Deduplicator (prevents duplicate alerts)
    ↓
Event Matcher (matches events to customer assets)
    ↓
Notification Creator (queues notifications)
    ↓
Notification Worker (sends via SMS/Email/Push)
```

### 3. Notification Delivery

1. Event matched to customer assets within radius
2. Notification created for each enabled channel
3. Notification queued in Redis/BullMQ
4. Notification worker processes queue:
   - SMS via Twilio
   - Email via SendGrid
   - Push (future)
   - In-app (stored in DB)
5. Delivery status tracked with retry logic

## Key Components

### Services

**Xweather Client** (`src/services/xweather/client.ts`)
- Handles API communication
- Tracks token costs
- Supports alerts, hail threats, storm threats

**Event Normalizer** (`src/services/events/normalizer.ts`)
- Converts Xweather formats to internal event schema
- Maps alert types, severity levels
- Extracts geometry (point/polygon)

**Event Deduplicator** (`src/services/events/deduplicator.ts`)
- Prevents duplicate alerts within time window
- Updates existing events to KEEP_ALIVE status
- Uses source event IDs and proximity matching

**Event Matcher** (`src/services/events/matcher.ts`)
- Matches events to customer assets
- Checks distance within radius
- Applies subscription filters (alert types, quiet hours)

**Notification Dispatcher** (`src/services/notifications/dispatcher.ts`)
- Formats messages for each channel
- Handles delivery with retry logic
- Tracks delivery status

### Workers

**Polling Worker** (`src/workers/polling-worker.ts`)
- Processes polling jobs from queue
- Fetches weather data from Xweather
- Creates events and notifications

**Notification Worker** (`src/workers/notification-worker.ts`)
- Processes notification queue
- Sends via configured channels
- Handles failures and retries

### Scheduler

**Smart Polling Strategy** (`src/lib/scheduler.ts`)
- Baseline: Alerts every 5 min, Hail every 10 min
- Elevated risk: Increases frequency when storms detected
- Token-aware: Adjusts based on usage limits

## Database Schema

### Core Tables

- **customers** - Customer accounts
- **users** - User accounts (customer or admin)
- **assets** - Monitored locations (lat/lon + radius)
- **subscriptions** - Alert preferences per asset
- **events_raw** - Raw Xweather API responses
- **events** - Normalized events (deduplicated)
- **notifications** - Delivery records
- **usage_tokens** - Daily token usage tracking

### Key Relationships

- Customer → Assets (1:N)
- Asset → Subscriptions (1:N)
- Event → Asset (N:1, optional)
- Subscription → Notifications (1:N)
- Event → Notifications (1:N)

## API Endpoints

### Customer APIs
- `GET /api/assets` - List customer assets
- `POST /api/assets` - Create asset
- `PATCH /api/assets/[id]` - Update asset
- `GET /api/events` - Query events
- `GET /api/notifications` - Notification history
- `PATCH /api/subscriptions` - Update preferences

### Admin APIs
- `GET /api/admin/usage` - Token usage reports

### Webhooks
- `POST /api/webhooks/xweather` - Xweather event webhook

## Security Considerations

1. **API Keys**: Stored server-side only, never exposed to frontend
2. **Webhook Verification**: Verify Xweather webhook signatures (TODO)
3. **Multi-tenant Isolation**: Row-level security via customerId
4. **Rate Limiting**: Per-customer notification limits
5. **Input Validation**: Zod schemas for all API inputs

## Scalability

### Current Limitations
- Single Redis instance
- Single database instance
- Workers run on single server

### Scaling Path
1. **Horizontal Scaling**: Multiple worker instances
2. **Database**: Read replicas for queries
3. **Caching**: Redis for frequently accessed data
4. **CDN**: Static assets via Vercel/Cloudflare
5. **Queue**: Redis Cluster or AWS SQS for high volume

## Cost Optimization

1. **Webhook Mode**: Reduces API calls by 90%+
2. **Smart Polling**: Adjusts frequency based on risk
3. **Geometry Filtering**: Only query relevant regions
4. **Token Tracking**: Monitor and alert on usage spikes
5. **Caching**: Cache non-critical data

## Monitoring & Observability

### Key Metrics
- Events processed per minute
- Notification delivery rate
- API token consumption
- Worker queue depth
- Error rates by service

### Logging
- Structured logs in workers
- API request/response logging
- Error tracking with stack traces

### Alerts
- High token usage
- Worker failures
- Notification delivery failures
- Database connection issues

## Future Enhancements

1. **Push Notifications**: Firebase Cloud Messaging / APNS
2. **Voice Alerts**: Twilio voice calls for critical alerts
3. **Customer Webhooks**: Push events to customer systems
4. **Advanced Filtering**: Custom severity thresholds
5. **Multi-language**: Support for international customers
6. **Mobile Apps**: Native iOS/Android apps
7. **Billing Integration**: Usage-based billing automation
8. **Analytics Dashboard**: Customer-facing analytics
