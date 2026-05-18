import { createAdminClient } from '@/lib/supabase/admin'

const DIFFICULTY_POINTS: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
}

function getIqLabel(iq: number): string {
  if (iq >= 130) return 'Superior'
  if (iq >= 115) return 'Above Average'
  if (iq >= 100) return 'High Average'
  if (iq >= 85) return 'Average'
  if (iq >= 70) return 'Low Average'
  return 'Below Average'
}

// Abramowitz and Stegun approximation for the normal CDF
function normalCDF(z: number): number {
  const sign = z < 0 ? -1 : 1
  const absZ = Math.abs(z) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * absZ)
  const poly =
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  const p = 1 - poly * Math.exp(-absZ * absZ)
  return 0.5 * (1 + sign * p)
}

export interface ScoringResult {
  rawScore: number
  weightedScore: number
  iqScore: number
  percentile: number
  iqLabel: string
}

export async function scoreSession(sessionId: string): Promise<ScoringResult> {
  const supabase = createAdminClient()

  // Load session
  const { data: session, error: sessionError } = await supabase
    .from('test_sessions')
    .select('id, applicant_id')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error('Session not found')
  }

  // Load answers for this session
  const { data: answers, error: answersError } = await supabase
    .from('answers')
    .select('id, question_id, selected_answer')
    .eq('session_id', sessionId)

  if (answersError) {
    throw new Error('Failed to load answers')
  }

  if (!answers || answers.length === 0) {
    // No answers — score zero
    const iqScore = 55
    const percentile = Math.round(normalCDF((iqScore - 100) / 15) * 100)
    const result = { rawScore: 0, weightedScore: 0, iqScore, percentile, iqLabel: getIqLabel(iqScore) }
    await insertResult(supabase, session, result)
    return result
  }

  // Load questions server-side only (correct_answer stays on server)
  const questionIds = answers.map((a) => a.question_id)
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, difficulty, correct_answer')
    .in('id', questionIds)

  if (questionsError) {
    throw new Error('Failed to load questions')
  }

  const questionMap = new Map(
    (questions ?? []).map((q) => [q.id, { difficulty: q.difficulty, correct_answer: q.correct_answer }])
  )

  let weightedScore = 0
  let rawScore = 0
  let maxPossibleScore = 0

  const answerUpdates: Array<{ id: string; is_correct: boolean }> = []

  for (const answer of answers) {
    const q = questionMap.get(answer.question_id)
    if (!q) continue

    const points = DIFFICULTY_POINTS[q.difficulty] ?? 1
    maxPossibleScore += points

    const isCorrect =
      answer.selected_answer !== null && answer.selected_answer === q.correct_answer

    if (isCorrect) {
      weightedScore += points
      rawScore += 1
    }

    answerUpdates.push({ id: answer.id, is_correct: isCorrect })
  }

  // Update is_correct on all answers
  await Promise.all(
    answerUpdates.map(({ id, is_correct }) =>
      supabase.from('answers').update({ is_correct }).eq('id', id)
    )
  )

  // IQ conversion: normalised to mean 100, SD 15
  // Treat 50% of max as average (IQ 100), SD of raw scores ≈ 20% of max
  const scorePct = maxPossibleScore > 0 ? weightedScore / maxPossibleScore : 0
  const z = (scorePct - 0.5) / 0.2
  const iqScore = Math.round(Math.max(55, Math.min(145, 100 + 15 * z)))

  const percentile = Math.round(normalCDF((iqScore - 100) / 15) * 100)
  const iqLabel = getIqLabel(iqScore)

  const result: ScoringResult = { rawScore, weightedScore, iqScore, percentile, iqLabel }
  await insertResult(supabase, session, result)
  return result
}

async function insertResult(
  supabase: ReturnType<typeof createAdminClient>,
  session: { id: string; applicant_id: string },
  result: ScoringResult
) {
  // Idempotent — delete any existing result for this session before inserting
  await supabase.from('results').delete().eq('session_id', session.id)

  const { error } = await supabase.from('results').insert({
    session_id: session.id,
    applicant_id: session.applicant_id,
    raw_score: result.rawScore,
    weighted_score: result.weightedScore,
    iq_score: result.iqScore,
    percentile: result.percentile,
    iq_label: result.iqLabel,
    status: 'pending_review',
    reviewed_at: null,
  })

  if (error) {
    throw new Error(`Failed to insert result: ${error.message}`)
  }
}
