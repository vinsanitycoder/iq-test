import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { scoreSession } from '@/lib/scoring'
import { createAndSendInvite } from '@/lib/personality/send-invite'

// PDF/email work can take time; same maxDuration ceiling used elsewhere
export const maxDuration = 60

function getAppUrl(request: NextRequest): string {
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const host = request.headers.get('host') ?? request.nextUrl.host
  return `${proto}://${host}`
}

/**
 * Best-effort auto-invite after IQ completion.
 *
 * RULES (the IQ-test path must always succeed regardless of what happens here):
 *   - Wrapped in try-catch by the caller
 *   - All errors logged, none re-thrown
 *   - If settings can't be read, treat as toggle OFF
 *   - If toggle is OFF, return silently
 *   - createAndSendInvite never throws — it returns { ok: false, error } on failure
 */
async function maybeAutoInvite(request: NextRequest, applicantId: string) {
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: settings } = await admin
    .from('settings' as any)
    .select('auto_send_personality_invite, auto_invite_deadline_days')
    .single<{ auto_send_personality_invite: boolean; auto_invite_deadline_days: number }>()

  if (!settings?.auto_send_personality_invite) return

  const days = Number.isInteger(settings.auto_invite_deadline_days)
    && settings.auto_invite_deadline_days >= 1
    && settings.auto_invite_deadline_days <= 365
    ? settings.auto_invite_deadline_days
    : 7

  const expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString()

  const result = await createAndSendInvite(applicantId, {
    baseUrl: getAppUrl(request),
    expiresAt,
    customMessage: undefined,  // use the email template default
  })

  if (!result.ok) {
    console.error('[auto-invite] createAndSendInvite failed', applicantId, result.error)
  } else if (!result.emailSent) {
    console.error('[auto-invite] invite created but email failed', applicantId, result.invite.id)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, expired = false } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: session } = await supabase
      .from('test_sessions')
      .select('id, start_time, status')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Idempotent — if already completed, return ok
    if (session.status !== 'in_progress') {
      return NextResponse.json({ ok: true })
    }

    const endTime = new Date()
    const timeTakenSeconds = session.start_time
      ? Math.round((endTime.getTime() - new Date(session.start_time).getTime()) / 1000)
      : null

    const { error } = await supabase
      .from('test_sessions')
      .update({
        status: expired ? 'expired' : 'completed',
        end_time: endTime.toISOString(),
        time_taken_seconds: timeTakenSeconds,
      })
      .eq('id', sessionId)

    if (error) {
      console.error('Complete session error:', error)
      return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 })
    }

    // Score the session server-side — errors here don't block the completion response
    try {
      await scoreSession(sessionId)
    } catch (scoringErr) {
      console.error('Scoring error for session', sessionId, scoringErr)
    }

    // Auto-send personality invite if HR has enabled it in settings.
    // Hard-isolated: same protection pattern as scoreSession — never let
    // any failure here block the applicant's IQ test completion response.
    try {
      const admin = createAdminClient()
      const { data: sessionWithApplicant } = await admin
        .from('test_sessions')
        .select('applicant_id')
        .eq('id', sessionId)
        .single<{ applicant_id: string }>()

      if (sessionWithApplicant?.applicant_id) {
        await maybeAutoInvite(request, sessionWithApplicant.applicant_id)
      }
    } catch (autoInviteErr) {
      console.error('[auto-invite] error for session', sessionId, autoInviteErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Complete API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
