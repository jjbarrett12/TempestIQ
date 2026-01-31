# Quick Start Guide

Follow these steps to get Roof Alert running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Database

1. **Create a PostgreSQL database** (local or cloud like Supabase/Railway)

2. **Update `.env` file:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/roofalert"
```

3. **Run migrations:**
```bash
npm run db:migrate
npm run db:generate
```

## Step 3: Set Up Redis

**Option A: Local Redis**
```bash
# Install Redis (macOS)
brew install redis
brew services start redis

# Install Redis (Windows)
# Download from: https://github.com/microsoftarchive/redis/releases
# Or use WSL: sudo apt-get install redis-server

# Install Redis (Linux)
sudo apt-get install redis-server
sudo systemctl start redis
```

**Option B: Cloud Redis (Redis Cloud, Upstash)**
- Get connection URL and add to `.env`:
```bash
REDIS_URL="redis://default:password@host:port"
```

## Step 4: Configure API Keys

Update `.env` with your credentials:

```bash
# Xweather API (get from https://www.aerisweather.com/)
XWEATHER_API_KEY="your-key-here"
XWEATHER_BASE_URL="https://api.xweather.com"

# Twilio (for SMS)
TWILIO_ACCOUNT_SID="your-sid"
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1234567890"

# SendGrid (for Email)
SENDGRID_API_KEY="your-sendgrid-key"
SENDGRID_FROM_EMAIL="alerts@yourdomain.com"

# App URLs
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"
```

## Step 5: Create a Test Customer

You'll need at least one customer in the database to test. Run this in your database or use Prisma Studio:

```bash
npm run db:studio
```

Then manually create a customer, or use this SQL:

```sql
INSERT INTO "Customer" (id, name, email, "createdAt", "updatedAt")
VALUES ('demo-customer-1', 'Demo Customer', 'demo@example.com', NOW(), NOW());
```

## Step 6: Initialize the Scheduler

Set up recurring polling jobs:

```bash
npm run scheduler:init
```

This only needs to run once. It creates the recurring jobs in Redis.

## Step 7: Start the Application

**Terminal 1: Next.js Dev Server**
```bash
npm run dev
```

**Terminal 2: Background Workers**
```bash
npm run worker:all
```

Or run separately:
```bash
# Terminal 2: Polling Worker
npm run worker:polling

# Terminal 3: Notification Worker  
npm run worker:notifications
```

## Step 8: Test the Platform

1. **Open the dashboard:**
   - http://localhost:3000/dashboard

2. **Add a test location:**
   - Go to "Add Location"
   - Use coordinates for a location you want to monitor
   - Example: New York (40.7128, -74.0060)

3. **Check for events:**
   - The polling worker will fetch weather data every 5-10 minutes
   - Check the dashboard for active threats
   - View notification history

## Step 9: Set Up Xweather Webhooks (Optional but Recommended)

For fastest alerts, configure Xweather webhooks:

1. Log into Xweather dashboard
2. Navigate to Webhooks/Settings
3. Add webhook URL: `https://yourdomain.com/api/webhooks/xweather`
4. Select event types: Hail Threats, Lightning, Severe Weather Alerts
5. Save configuration

Webhooks will push events in real-time instead of polling.

## Troubleshooting

### Workers not starting?
- Check Redis connection: `redis-cli ping` should return `PONG`
- Verify `REDIS_URL` in `.env`

### Database errors?
- Verify `DATABASE_URL` is correct
- Run `npm run db:generate` to regenerate Prisma client
- Check database is running: `psql $DATABASE_URL -c "SELECT 1"`

### No events showing?
- Check worker logs for errors
- Verify Xweather API key is valid
- Check polling worker is running
- Look for errors in console

### Notifications not sending?
- Verify Twilio/SendGrid credentials
- Check notification status in database
- Review worker logs for delivery errors

## Next Steps After Setup

1. **Add Authentication** - Currently using hardcoded customer IDs
2. **Customer Signup Flow** - Build registration/login
3. **Push Notifications** - Add Firebase/APNS support
4. **Billing Integration** - Connect usage tracking to billing
5. **Production Deployment** - Deploy to Vercel/Railway/etc.
