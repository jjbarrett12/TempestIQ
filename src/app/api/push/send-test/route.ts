import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getMessaging } from '@/lib/firebaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://tempestiq.com'

    const supabase = getSupabaseAdmin()
    const { data: tokens, error } = await supabase
      .from('push_device_tokens')
      .select('fcm_token')
      .eq('user_id', userId)

    if (error || !tokens?.length) {
      return NextResponse.json(
        { error: 'No device tokens registered. Enable push alerts first.' },
        { status: 400 }
      )
    }

    const messaging = getMessaging()
    const invalidTokens: string[] = []

    for (const row of tokens) {
      try {
        await messaging.send({
          token: row.fcm_token,
          notification: {
            title: 'TempestIQ Test',
            body: 'Push notifications are working!',
          },
          data: {
            url: `${siteUrl}/dashboard`,
            alertId: 'test',
            siteId: '',
            type: 'test',
            severity: 'low',
          },
          webpush: {
            fcmOptions: {
              link: `${siteUrl}/dashboard`,
            },
          },
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('registration-token-not-registered') || msg.includes('invalid-registration-token')) {
          invalidTokens.push(row.fcm_token)
        } else {
          throw err
        }
      }
    }

    if (invalidTokens.length > 0) {
      await supabase
        .from('push_device_tokens')
        .delete()
        .in('fcm_token', invalidTokens)
    }

    return NextResponse.json({
      success: true,
      sent: tokens.length - invalidTokens.length,
      removed: invalidTokens.length,
    })
  } catch (err: unknown) {
    console.error('[push] send-test:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send test push' },
      { status: 500 }
    )
  }
}
