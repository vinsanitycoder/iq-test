import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, selectedAnswer } = await request.json()

    if (!sessionId || !questionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify session is still active
    const { data: session } = await supabase
      .from('test_sessions')
      .select('status')
      .eq('id', sessionId)
      .single()

    if (!session || session.status !== 'in_progress') {
      return NextResponse.json({ error: 'Session not active' }, { status: 400 })
    }

    // Upsert — unique constraint on (session_id, question_id) handles retries
    const { error } = await supabase
      .from('answers')
      .upsert(
        {
          session_id: sessionId,
          question_id: questionId,
          selected_answer: selectedAnswer ?? null,
          is_correct: null, // calculated server-side in Phase 7
        },
        { onConflict: 'session_id,question_id' }
      )

    if (error) {
      console.error('Answer save error:', error)
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Answer API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
