import sgMail from '@sendgrid/mail'

let apiKeySet = false

function ensureSendGridConfigured(): string {
  if (apiKeySet) return process.env.SENDGRID_FROM_EMAIL || 'alerts@tempestiq.com'
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    throw new Error('SendGrid API key not configured')
  }
  sgMail.setApiKey(apiKey)
  apiKeySet = true
  return process.env.SENDGRID_FROM_EMAIL || 'alerts@tempestiq.com'
}

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
    const fromEmail = ensureSendGridConfigured()
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

/** Storm summary for "Email team" from dashboard (storm event shape from API). */
export function formatStormSummaryEmail(event: {
  id: string
  type: string
  startTime: string
  endTime: string
  severityScore: number
  maxHailSizeIn: number | null
  maxWindSpeedMph: number | null
  impactedAreaCount: number
  polygons?: { impactedNeighborhoods: string[] }[]
}): { subject: string; html: string } {
  const typeName = event.type === 'hail' ? 'Hail' : 'Wind'
  const startStr = new Date(event.startTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  const endStr = new Date(event.endTime).toLocaleString('en-US', { timeStyle: 'short' })
  const neighborhoods = event.polygons?.flatMap((p) => p.impactedNeighborhoods) ?? []
  const uniqueNeighborhoods = [...new Set(neighborhoods)].slice(0, 15)
  const dashboardUrl = `${process.env.NEXTAUTH_URL || 'https://tempestiq.com'}/dashboard/events/${event.id}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 20px; }
        .details { background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
        .row { margin: 8px 0; }
        .label { font-weight: bold; color: #555; }
        .neighborhoods { font-size: 14px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⛈️ ${typeName} storm impact summary</h1>
        </div>
        <div class="details">
          <div class="row"><span class="label">Impact window:</span> ${startStr} – ${endStr}</div>
          <div class="row"><span class="label">Severity score:</span> ${event.severityScore}</div>
          <div class="row"><span class="label">Max hail size:</span> ${event.maxHailSizeIn != null ? `${event.maxHailSizeIn}"` : 'N/A'}</div>
          <div class="row"><span class="label">Max wind speed:</span> ${event.maxWindSpeedMph != null ? `${event.maxWindSpeedMph} mph` : 'N/A'}</div>
          <div class="row"><span class="label">Impacted areas:</span> ${event.impactedAreaCount}</div>
          ${uniqueNeighborhoods.length > 0 ? `<div class="row neighborhoods"><span class="label">Sample neighborhoods:</span> ${uniqueNeighborhoods.join(', ')}</div>` : ''}
        </div>
        <a href="${dashboardUrl}" class="button">View full storm detail</a>
      </div>
    </body>
    </html>
  `
  return {
    subject: `Storm summary: ${typeName} impact ${startStr}`,
    html,
  }
}
