# Roof Alert Platform - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis server (for job queues)
- Xweather API account
- Twilio account (for SMS)
- SendGrid account (for email)

## Initial Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `XWEATHER_API_KEY` - Your Xweather API key
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - Twilio credentials
- `SENDGRID_API_KEY` - SendGrid API key
- `REDIS_URL` - Redis connection URL (default: `redis://localhost:6379`)

3. **Set up the database:**
```bash
npm run db:migrate
npm run db:generate
```

4. **Initialize the scheduler:**
```bash
npm run scheduler:init
```

This sets up recurring polling jobs for alerts and hail threats.

## Running the Application

### Development Mode

1. **Start the Next.js dev server:**
```bash
npm run dev
```

2. **Start the background workers (in separate terminals):**
```bash
# Terminal 2: Polling worker
npm run worker:polling

# Terminal 3: Notification worker
npm run worker:notifications

# OR run both together:
npm run worker:all
```

### Production Mode

1. **Build the application:**
```bash
npm run build
```

2. **Start the production server:**
```bash
npm start
```

3. **Start workers:**
```bash
npm run worker:all
```

## Architecture Overview

### Components

1. **Frontend (Next.js)**
   - Customer dashboard (`/dashboard`)
   - Admin portal (`/admin`)
   - Asset management

2. **API Routes**
   - `/api/assets` - Asset CRUD
   - `/api/subscriptions` - Subscription management
   - `/api/events` - Event queries
   - `/api/notifications` - Notification history
   - `/api/webhooks/xweather` - Xweather webhook endpoint

3. **Background Workers**
   - **Polling Worker**: Fetches weather data from Xweather
   - **Notification Worker**: Sends SMS/email notifications

4. **Services**
   - `xweather/client` - Xweather API client
   - `events/normalizer` - Normalizes weather data
   - `events/deduplicator` - Prevents duplicate alerts
   - `events/matcher` - Matches events to customer assets
   - `notifications/dispatcher` - Handles notification delivery

## Polling Strategy

### Baseline (Quiet Weather)
- Alerts: Every 5 minutes
- Hail threats: Every 10 minutes

### Elevated Risk Mode
- Automatically increases polling frequency when storms detected
- Hail threats: Every 2 minutes for affected regions

### Webhook Mode (Recommended)
If you have Xweather webhook access:
1. Configure webhook URL in Xweather dashboard: `https://yourdomain.com/api/webhooks/xweather`
2. Webhook endpoint automatically processes events in real-time
3. Reduces API costs and improves alert speed

## Token Usage Tracking

The platform tracks Xweather API token usage via the `X-Cost-Tokens` header:
- Stored in `usage_tokens` table
- Aggregated by customer and date
- Visible in admin portal

## Next Steps

1. **Add Authentication**: Implement user authentication (NextAuth.js recommended)
2. **Customer Management**: Build customer signup/onboarding flow
3. **Push Notifications**: Add Firebase Cloud Messaging / APNS support
4. **Webhook Delivery**: Implement customer webhook notifications
5. **Billing**: Add usage-based billing based on token consumption

## Troubleshooting

### Workers not processing jobs
- Check Redis connection: `redis-cli ping`
- Verify queue names match between scheduler and workers

### Notifications not sending
- Verify Twilio/SendGrid credentials
- Check notification status in database
- Review worker logs for errors

### High token usage
- Review polling frequency
- Enable webhook mode if available
- Adjust asset radius to reduce query scope
- Implement geometry filtering for large regions
