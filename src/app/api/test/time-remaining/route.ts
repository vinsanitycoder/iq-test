import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TEST_DURATION = 25 * 60

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()

    const { data: session } = await supabase
      .from('test_sessions')
      .select('start_time, status')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json({ secondsRemaining: 0, status: session.status })
    }

    const elapsed = Math.floor(
      (Date.now() - new Date(session.start_time).getTime()) / 1000
    )
    const secondsRemaining = Math.max(0, TEST_DURATION - elapsed)

    return NextResponse.json({ secondsRemaining, status: session.status })
  } catch (err) {
    console.error('Time remaining error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
