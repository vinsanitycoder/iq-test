import { NextResponse } from 'next/server'
import { validatePersonalityCookie } from '@/lib/personality/session-auth'
import { createAdminClient } from '@/lib/supabase/admin'

const NO_STORE = { 'Cache-Control': 'no-store' } as const

// POST: increment tab_switches counter. Called by visibilitychange listener on test page.
export async function POST() {
  const auth = await validatePersonalityCookie()
  if (!auth) {
    return NextResponse.json({ ok: false }, { headers: NO_STORE })
  }

  const { session } = auth
  if (!session || session.status !== 'in_progress') {
    return NextResponse.json({ ok: false }, { headers: NO_STORE })
  }

  const admin = createAdminClient()
  await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('personality_sessions' as any)
    .update({ tab_switches: session.tab_switches + 1 })
    .eq('id', session.id)

  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}
