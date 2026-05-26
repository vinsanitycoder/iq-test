import { NextResponse } from 'next/server'
import { validatePersonalityCookie } from '@/lib/personality/session-auth'
import { createAdminClient } from '@/lib/supabase/admin'

const NO_STORE = { 'Cache-Control': 'no-store' } as const

// GET: return session state + answered question indexes (used by test page on load/resume)
export async function GET() {
  const auth = await validatePersonalityCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })
  }

  const { session, invite } = auth

  if (!session) {
    return NextResponse.json(
      { session: null, invite: { expires_at: invite.expires_at } },
      { headers: NO_STORE }
    )
  }

  const admin = createAdminClient()
  const { data: answers } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('personality_answers' as any)
    .select('question_index')
    .eq('session_id', session.id)

  const answeredIndexes: number[] = (answers ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any) => a.question_index as number
  )

  return NextResponse.json(
    {
      session: {
        id: session.id,
        status: session.status,
        start_time: session.start_time,
        tab_switches: session.tab_switches,
      },
      answeredIndexes,
      invite: { expires_at: invite.expires_at },
    },
    { headers: NO_STORE }
  )
}
