import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: session } = await supabase
      .from('test_sessions')
      .select('tab_switches, status')
      .eq('id', sessionId)
      .single()

    if (!session || session.status !== 'in_progress') {
      return NextResponse.json({ ok: true })
    }

    await supabase
      .from('test_sessions')
      .update({ tab_switches: (session.tab_switches ?? 0) + 1 })
      .eq('id', sessionId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Tab switch API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
