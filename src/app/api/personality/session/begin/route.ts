import { NextResponse } from 'next/server'
import { validatePersonalityCookie } from '@/lib/personality/session-auth'
import { createAdminClient } from '@/lib/supabase/admin'

const NO_STORE = { 'Cache-Control': 'no-store' } as const

/**
 * POST: called when applicant clicks "Begin Test" or "Resume Test".
 * - If no session exists: creates one and sets start_time = now()
 * - If session exists and in_progress: returns existing start_time (resume — timer not reset)
 * - If session completed: returns 409
 */
export async function POST() {
  const auth = await validatePersonalityCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })
  }

  const { session, invite } = auth
  const admin = createAdminClient()

  // Resume: session already exists
  if (session) {
    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'This assessment has already been completed.' },
        { status: 409, headers: NO_STORE }
      )
    }
    // Return existing session — start_time is NOT updated (preserves timer)
    return NextResponse.json(
      { sessionId: session.id, startTime: session.start_time },
      { headers: NO_STORE }
    )
  }

  // New session: create with start_time set immediately
  const now = new Date().toISOString()
  const { data: newSession, error } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('personality_sessions' as any)
    .insert({
      invite_id: invite.id,
      start_time: now,
      status: 'in_progress',
    })
    .select('id, start_time')
    .single<{ id: string; start_time: string }>()

  if (error || !newSession) {
    // Race condition: a parallel request just created the session for this invite
    // (UNIQUE constraint on invite_id rejects the second insert with code 23505).
    // Recover gracefully by fetching the row the other request created.
    if (error?.code === '23505') {
      const { data: existing } = await admin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('personality_sessions' as any)
        .select('id, start_time')
        .eq('invite_id', invite.id)
        .single<{ id: string; start_time: string }>()
      if (existing) {
        return NextResponse.json(
          { sessionId: existing.id, startTime: existing.start_time },
          { headers: NO_STORE }
        )
      }
    }
    return NextResponse.json(
      { error: 'Failed to start session.' },
      { status: 500, headers: NO_STORE }
    )
  }

  return NextResponse.json(
    { sessionId: newSession.id, startTime: newSession.start_time },
    { status: 201, headers: NO_STORE }
  )
}
