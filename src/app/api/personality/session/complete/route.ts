import { NextResponse } from 'next/server'
import { validatePersonalityCookie } from '@/lib/personality/session-auth'
import { createAdminClient } from '@/lib/supabase/admin'

const NO_STORE = { 'Cache-Control': 'no-store' } as const

// POST: mark session as completed. Idempotent — safe to call twice.
export async function POST() {
  const auth = await validatePersonalityCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })
  }

  const { session } = auth
  if (!session) {
    return NextResponse.json({ error: 'No session found.' }, { status: 404, headers: NO_STORE })
  }

  // Already completed — idempotent, return ok
  if (session.status === 'completed') {
    return NextResponse.json({ ok: true }, { headers: NO_STORE })
  }

  const admin = createAdminClient()
  const { error } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('personality_sessions' as any)
    .update({
      status: 'completed',
      end_time: new Date().toISOString(),
    })
    .eq('id', session.id)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to complete session.' },
      { status: 500, headers: NO_STORE }
    )
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}
