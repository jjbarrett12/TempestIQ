# Pre-Launch Checklist

Use this checklist to ensure everything is set up correctly before going live.

## Environment Setup

- [ ] All environment variables configured in `.env`
- [ ] Database connection tested (`npm run db:migrate`)
- [ ] Redis connection tested (`redis-cli ping`)
- [ ] Prisma client generated (`npm run db:generate`)

## API Credentials

- [ ] Xweather API key valid and tested
- [ ] Twilio account configured with phone number
- [ ] SendGrid API key configured with verified sender
- [ ] All API keys stored securely (not in git)

## Database

- [ ] Migrations run successfully
- [ ] Test customer created (`npm run db:seed`)
- [ ] At least one asset added for testing
- [ ] Database backups configured (production)

## Workers & Scheduler

- [ ] Scheduler initialized (`npm run scheduler:init`)
- [ ] Polling worker tested and running
- [ ] Notification worker tested and running
- [ ] Workers restart automatically on failure (PM2/systemd)

## Testing

- [ ] Can add a location via dashboard
- [ ] Polling worker fetches weather data
- [ ] Events appear in dashboard
- [ ] SMS notifications send successfully
- [ ] Email notifications send successfully
- [ ] Webhook endpoint responds (if using webhooks)

## Security

- [ ] API keys not exposed in frontend code
- [ ] Webhook signature verification implemented (if using webhooks)
- [ ] Input validation on all API endpoints
- [ ] Rate limiting configured (production)
- [ ] HTTPS enabled (production)

## Monitoring

- [ ] Error logging configured
- [ ] Token usage tracking working
- [ ] Notification delivery status tracked
- [ ] Worker health checks in place

## Production Deployment

- [ ] Environment variables set in hosting platform
- [ ] Database migrations run in production
- [ ] Workers deployed and running
- [ ] Scheduler initialized in production
- [ ] Domain configured with SSL
- [ ] Webhook URL updated in Xweather dashboard

## Documentation

- [ ] Team members have access to documentation
- [ ] API documentation updated
- [ ] Runbook for common issues created

## Optional Enhancements

- [ ] User authentication implemented
- [ ] Customer signup flow built
- [ ] Push notifications configured
- [ ] Billing integration connected
- [ ] Analytics dashboard built
- [ ] Mobile apps developed
