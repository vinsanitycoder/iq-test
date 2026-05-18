import { NextRequest, NextResponse } from 'next/server'
import { scoreSession } from '@/lib/scoring'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const result = await scoreSession(sessionId)

    return NextResponse.json({ ok: true, result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('Score API error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
