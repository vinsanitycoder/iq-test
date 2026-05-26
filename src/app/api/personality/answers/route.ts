import { NextRequest, NextResponse } from 'next/server'
import { validatePersonalityCookie } from '@/lib/personality/session-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { PERSONALITY_QUESTIONS } from '@/lib/personality/questions'

const NO_STORE = { 'Cache-Control': 'no-store' } as const
// 45 min + 30s buffer for network latency
const MAX_DURATION_MS = 45 * 60 * 1000 + 30 * 1000

// POST: save one page of answers (up to 10).
// dimension and question_type are always derived server-side from question_index.
export async function POST(req: NextRequest) {
  const auth = await validatePersonalityCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })
  }

  const { session } = auth
  if (!session) {
    return NextResponse.json({ error: 'No session found.' }, { status: 404, headers: NO_STORE })
  }
  if (session.status !== 'in_progress') {
    return NextResponse.json({ error: 'Session is not in progress.' }, { status: 409, headers: NO_STORE })
  }
  if (!session.start_time) {
    return NextResponse.json({ error: 'Session has not been started.' }, { status: 409, headers: NO_STORE })
  }

  // Server-side time guard
  const elapsed = Date.now() - new Date(session.start_time).getTime()
  if (elapsed > MAX_DURATION_MS) {
    return NextResponse.json({ error: 'Time expired.' }, { status: 409, headers: NO_STORE })
  }

  let body: { answers?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400, headers: NO_STORE })
  }

  const { answers } = body
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > 10) {
    return NextResponse.json(
      { error: 'answers must be an array of 1–10 items.' },
      { status: 400, headers: NO_STORE }
    )
  }

  for (const a of answers) {
    if (typeof a !== 'object' || a === null) {
      return NextResponse.json({ error: 'Invalid answer format.' }, { status: 400, headers: NO_STORE })
    }
    const { question_index, raw_score } = a as Record<string, unknown>
    if (
      typeof question_index !== 'number' ||
      !Number.isInteger(question_index) ||
      question_index < 0 ||
      question_index > 99
    ) {
      return NextResponse.json({ error: 'Invalid question_index.' }, { status: 400, headers: NO_STORE })
    }
    if (
      typeof raw_score !== 'number' ||
      !Number.isInteger(raw_score) ||
      raw_score < 1 ||
      raw_score > 5
    ) {
      return NextResponse.json(
        { error: 'raw_score must be an integer 1–5.' },
        { status: 400, headers: NO_STORE }
      )
    }
  }

  const admin = createAdminClient()
  const rows = (answers as Array<{ question_index: number; raw_score: number }>).map(a => {
    const q = PERSONALITY_QUESTIONS[a.question_index]
    return {
      session_id: session.id,
      question_index: a.question_index,
      dimension: q.dimension,      // always server-derived
      question_type: q.type,       // always server-derived (q.type is 'F'|'R'|'S')
      raw_score: a.raw_score,
      answered_at: new Date().toISOString(),
    }
  })

  // ON CONFLICT DO NOTHING — first answer wins, duplicates silently ignored
  const { error } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('personality_answers' as any)
    .upsert(rows, { onConflict: 'session_id,question_index', ignoreDuplicates: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to save answers.' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ saved: rows.length }, { headers: NO_STORE })
}
