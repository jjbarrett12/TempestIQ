import sgMail from '@sendgrid/mail'

const apiKey = process.env.SENDGRID_API_KEY
const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'alerts@tempestiq.com'

if (!apiKey) {
  throw new Error('SendGrid API key not configured')
}

sgMail.setApiKey(apiKey)

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailMessage): Promise<{
  success: boolean
  providerId?: string
  error?: string
}> {
  try {
    const msg = {
      to,
      from: fromEmail,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    }

    const [response] = await sgMail.send(msg)

    return {
      success: true,
      providerId: response.headers['x-message-id'] as string,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send email',
    }
  }
}

export function formatAlertEmail(event: {
  eventType: string
  severity: string
  startTime: Date
  endTime?: Date
  location?: string
  latitude: number
  longitude: number
}): { subject: string; html: string } {
  const severityEmoji = {
    EXTREME: '🚨',
    HIGH: '⚠️',
    MODERATE: '⚡',
    LOW: '📢',
  }[event.severity] || '📢'

  const eventTypeName = {
    HAIL_THREAT: 'Hail Threat',
    TORNADO_WARNING: 'TORNADO WARNING',
    TORNADO_WATCH: 'Tornado Watch',
    SEVERE_TSTORM_WARNING: 'Severe Thunderstorm Warning',
    HIGH_WIND_WARNING: 'High Wind Warning',
    EXTREME_WIND_GUST: 'Extreme Wind Gust',
  }[event.eventType] || event.eventType

  const timeStr = new Date(event.startTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const mapUrl = `https://www.google.com/maps?q=${event.latitude},${event.longitude}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .alert-type { font-size: 24px; font-weight: bold; margin: 10px 0; }
        .details { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="alert-type">${severityEmoji} ${eventTypeName}</div>
        </div>
        <div class="details">
          <div class="detail-row">
            <span class="label">Time:</span> ${timeStr}
          </div>
          ${event.endTime ? `
          <div class="detail-row">
            <span class="label">Expires:</span> ${new Date(event.endTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
          ` : ''}
          ${event.location ? `
          <div class="detail-row">
            <span class="label">Location:</span> ${event.location}
          </div>
          ` : ''}
          <div class="detail-row">
            <span class="label">Coordinates:</span> 
            <a href="${mapUrl}" target="_blank">${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}</a>
          </div>
        </div>
        <a href="${process.env.NEXTAUTH_URL || 'https://tempestiq.com'}" class="button">View Dashboard</a>
      </div>
    </body>
    </html>
  `

  return {
    subject: `${severityEmoji} ${eventTypeName} Alert`,
    html,
  }
}
