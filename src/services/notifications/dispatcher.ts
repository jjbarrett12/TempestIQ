import { prisma } from '@/lib/prisma'
import { NotificationChannel, NotificationStatus } from '@prisma/client'
import { sendSMS, formatAlertMessage } from './sms'
import { sendEmail, formatAlertEmail } from './email'
import { Queue } from 'bullmq'
import { getRedisConnection } from '@/lib/redis'


export interface NotificationJob {
  notificationId: string
}

export async function dispatchNotification(notificationId: string): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      event: true,
      subscription: {
        include: {
          asset: true,
        },
      },
      customer: true,
    },
  })

  if (!notification) {
    throw new Error(`Notification ${notificationId} not found`)
  }

  if (notification.status !== NotificationStatus.PENDING) {
    return // Already processed
  }

  try {
    let result: { success: boolean; providerId?: string; error?: string }

    switch (notification.channel) {
      case NotificationChannel.SMS:
        if (!notification.subscription.smsEnabled) {
          throw new Error('SMS not enabled for this subscription')
        }
        const smsMessage = formatAlertMessage({
          eventType: notification.event.eventType,
          severity: notification.event.severity,
          startTime: notification.event.startTime,
          location: notification.subscription.asset.address,
        })
        result = await sendSMS({
          to: notification.recipient,
          message: smsMessage,
        })
        break

      case NotificationChannel.EMAIL:
        if (!notification.subscription.emailEnabled) {
          throw new Error('Email not enabled for this subscription')
        }
        const emailContent = formatAlertEmail({
          eventType: notification.event.eventType,
          severity: notification.event.severity,
          startTime: notification.event.startTime,
          endTime: notification.event.endTime || undefined,
          location: notification.subscription.asset.address,
          latitude: notification.event.latitude,
          longitude: notification.event.longitude,
        })
        result = await sendEmail({
          to: notification.recipient,
          subject: emailContent.subject,
          html: emailContent.html,
        })
        break

      case NotificationChannel.WEBHOOK:
        // TODO: Implement webhook delivery
        throw new Error('Webhook delivery not yet implemented')

      case NotificationChannel.PUSH:
        // TODO: Implement push notification delivery
        throw new Error('Push notification delivery not yet implemented')

      case NotificationChannel.IN_APP:
        // Mark as delivered immediately for in-app
        await prisma.notification.update({
          where: { id: notificationId },
          data: {
            status: NotificationStatus.DELIVERED,
            deliveredAt: new Date(),
          },
        })
        return

      default:
        throw new Error(`Unsupported channel: ${notification.channel}`)
    }

    if (result.success) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.SENT,
          providerId: result.providerId,
          attempts: notification.attempts + 1,
          updatedAt: new Date(),
        },
      })
    } else {
      throw new Error(result.error || 'Notification delivery failed')
    }
  } catch (error: any) {
    const attempts = notification.attempts + 1
    const shouldRetry = attempts < notification.maxAttempts

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: shouldRetry ? NotificationStatus.PENDING : NotificationStatus.FAILED,
        attempts,
        failureReason: error.message,
        nextRetryAt: shouldRetry
          ? new Date(Date.now() + Math.pow(2, attempts) * 60000) // Exponential backoff
          : null,
        failedAt: shouldRetry ? null : new Date(),
        updatedAt: new Date(),
      },
    })

    if (shouldRetry) {
      // Re-queue for retry
      await notificationQueue.add('send', { notificationId }, {
        delay: Math.pow(2, attempts) * 60000, // Exponential backoff
      })
    }
  }
}

export async function createNotificationsForEvent(
  eventId: string,
  matches: Array<{ assetId: string; subscriptionId: string; shouldNotify: boolean }>
): Promise<void> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      asset: true,
    },
  })

  if (!event) {
    throw new Error(`Event ${eventId} not found`)
  }

  for (const match of matches) {
    if (!match.shouldNotify) continue

    const subscription = await prisma.subscription.findUnique({
      where: { id: match.subscriptionId },
      include: {
        customer: true,
        asset: true,
      },
    })

    if (!subscription) continue

    // Determine recipient based on channel
    const channels: NotificationChannel[] = []
    const recipients: string[] = []

    if (subscription.smsEnabled && subscription.customer.phone) {
      channels.push(NotificationChannel.SMS)
      recipients.push(subscription.customer.phone)
    }

    if (subscription.emailEnabled && subscription.customer.email) {
      channels.push(NotificationChannel.EMAIL)
      recipients.push(subscription.customer.email)
    }

    // Always create in-app notification
    channels.push(NotificationChannel.IN_APP)
    recipients.push(subscription.customerId)

    // Create notifications for each channel
    for (let i = 0; i < channels.length; i++) {
      const notification = await prisma.notification.create({
        data: {
          customerId: subscription.customerId,
          subscriptionId: subscription.id,
          eventId: event.id,
          channel: channels[i],
          recipient: recipients[i] || subscription.customer.email,
          message: `${event.eventType} alert for ${subscription.asset.address}`,
          status: NotificationStatus.PENDING,
        },
      })

      // Queue for delivery
      await getNotificationQueue().add('send', { notificationId: notification.id })
    }
  }
}
