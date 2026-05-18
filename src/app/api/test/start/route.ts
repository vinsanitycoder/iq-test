import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { QuestionForClient, QuestionType } from '@/types/database'

// correct_answer is deliberately excluded
const COLUMNS =
  'id, type, difficulty, question_text, option_a, option_b, option_c, option_d, svg_content, is_practice'

const DISTRIBUTION: Record<QuestionType, number> = {
  pattern_recognition: 12,
  numerical: 10,
  verbal_analogy: 5,
  deductive: 4,
  logical_sequence: 9,
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function POST(request: NextRequest) {
  try {
    const { applicantId } = await request.json()

    if (!applicantId) {
      return NextResponse.json({ error: 'Missing applicantId' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const selected: QuestionForClient[] = []

    for (const [type, count] of Object.entries(DISTRIBUTION) as [QuestionType, number][]) {
      const { data, error } = await supabase
        .from('questions')
        .select(COLUMNS)
        .eq('type', type)
        .eq('is_practice', false)
        .eq('is_active', true)

      if (error) {
        console.error(`Question fetch error for type ${type}:`, error)
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
      }

      const pool = shuffle(data ?? [])
      selected.push(...(pool.slice(0, count) as QuestionForClient[]))
    }

    const TOTAL = Object.values(DISTRIBUTION).reduce((a, b) => a + b, 0)
    if (selected.length < TOTAL) {
      console.error(`Not enough questions: got ${selected.length}, expected ${TOTAL}`)
      return NextResponse.json({ error: 'Not enough questions available' }, { status: 500 })
    }

    const questions = shuffle(selected)

    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .insert({
        applicant_id: applicantId,
        start_time: new Date().toISOString(),
        end_time: null,
        time_taken_seconds: null,
        status: 'in_progress',
        tab_switches: 0,
      })
      .select('id, start_time')
      .single()

    if (sessionError || !session) {
      console.error('Session create error:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({
      sessionId: session.id,
      startTime: session.start_time,
      questions,
    })
  } catch (err) {
    console.error('Test start error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
