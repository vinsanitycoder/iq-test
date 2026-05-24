import { NextResponse } from 'next/server'
import { validatePersonalityCookie } from '@/lib/personality/session-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { scorePersonalityAnswers, toResultRow } from '@/lib/personality/scoring'

const NO_STORE = { 'Cache-Control': 'no-store' } as const

// POST: mark session completed, score answers, insert personality_results row.
// Idempotent — safe to call twice.
export async function POST() {
  const auth = await validatePersonalityCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })
  }

  const { invite, session } = auth
  if (!session) {
    return NextResponse.json({ error: 'No session found.' }, { status: 404, headers: NO_STORE })
  }

  const admin = createAdminClient()

  // Mark session completed (no-op if already completed)
  if (session.status !== 'completed') {
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
  }

  // Fetch all answers for this session
  const { data: rawAnswers, error: answersError } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('personality_answers' as any)
    .select('question_index, raw_score')
    .eq('session_id', session.id)
    .returns<{ question_index: number; raw_score: number }[]>()

  if (answersError) {
    return NextResponse.json(
      { error: 'Failed to fetch answers.' },
      { status: 500, headers: NO_STORE }
    )
  }

  // Score answers — dimension and question_type derived server-side inside scorePersonalityAnswers
  let scored
  try {
    scored = scorePersonalityAnswers(rawAnswers ?? [])
  } catch {
    return NextResponse.json(
      { error: 'Scoring failed.' },
      { status: 500, headers: NO_STORE }
    )
  }

  // applicant_id derived server-side from invite — never from client
  const resultRow = toResultRow(scored, session.id, invite.applicant_id)

  // Upsert with ignoreDuplicates — idempotent if result row already exists
  const { error: insertError } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('personality_results' as any)
    .upsert(resultRow, { onConflict: 'session_id', ignoreDuplicates: true })

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to save result.' },
      { status: 500, headers: NO_STORE }
    )
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}
