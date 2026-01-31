import twilio from 'twilio'

let client: ReturnType<typeof twilio> | null = null

function getTwilioClient(): ReturnType<typeof twilio> {
  if (client) return client
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured')
  }
  client = twilio(accountSid, authToken)
  return client
}

export interface SMSMessage {
  to: string
  message: string
}

export async function sendSMS({ to, message }: SMSMessage): Promise<{
  success: boolean
  providerId?: string
  error?: string
}> {
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  if (!fromNumber) {
    return { success: false, error: 'Twilio phone number not configured' }
  }
  try {
    const twilioClient = getTwilioClient()
    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to,
    })

    return {
      success: true,
      providerId: result.sid,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    }
  }
}

export function formatAlertMessage(event: {
  eventType: string
  severity: string
  startTime: Date
  location?: string
}): string {
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

  const timeStr = new Date(event.startTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  return `${severityEmoji} ${eventTypeName} - ${timeStr}${event.location ? ` near ${event.location}` : ''}. Check TempestIQ for details.`
}
