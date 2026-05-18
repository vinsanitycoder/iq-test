import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { scoreSession } from '@/lib/scoring'

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

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Complete API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
