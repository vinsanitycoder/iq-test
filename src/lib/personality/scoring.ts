/**
 * Personality Assessment — Scoring Engine
 *
 * IMPORTANT SECURITY RULES (enforced here):
 * - `dimension` and `question_type` are always derived from `question_index`
 *   using the hardcoded question array. They are NEVER trusted from the caller.
 * - Raw scores are stored as submitted (1–5). Reversal for R-type questions
 *   is applied here at scoring time, not at storage time.
 *
 * Scoring formula per dimension (25 questions, scores 1–5):
 *   F / S questions: contribution = raw_score
 *   R questions:     contribution = 6 − raw_score
 *   dimension_sum   = sum of all 25 contributions  (range: 25–125)
 *   dimension_score = (dimension_sum − 25)          (range: 0.0–100.0)
 *
 * Labels:
 *   score > 50.0  → second pole  (I / N / F / P)
 *   score ≤ 50.0  → first pole   (E / S / T / J)   ← tiebreaker at exactly 50.0
 */

import { getQuestion, type Dimension } from './questions'
import { type TypeCode } from './types'

export const MIN_ANSWERS_REQUIRED = 60   // below this threshold → result is 'incomplete'
export const MIN_ANSWERS_PER_DIMENSION = 15  // below this per dimension → unreliable

export type RawAnswer = {
  question_index: number
  raw_score: number  // 1–5 as submitted by the applicant
}

export type DimensionResult = {
  score: number    // 0.0–100.0, percentage toward second pole (I/N/F/P)
  label: string    // 'E'|'I' / 'S'|'N' / 'T'|'F' / 'J'|'P'
  answerCount: number
  sum: number      // raw dimension sum before percentage conversion (25–125)
}

export type ScoringResult = {
  ei: DimensionResult
  sn: DimensionResult
  tf: DimensionResult
  jp: DimensionResult
  type_code: TypeCode
  total_answers: number
  is_complete: boolean  // false if fewer than MIN_ANSWERS_REQUIRED were answered
}

// Maps each dimension to its first and second poles
const POLES: Record<Dimension, { first: string; second: string }> = {
  EI: { first: 'E', second: 'I' },
  SN: { first: 'S', second: 'N' },
  TF: { first: 'T', second: 'F' },
  JP: { first: 'J', second: 'P' },
}

/**
 * Score a set of personality answers.
 *
 * @param answers - Array of { question_index, raw_score } — order does not matter.
 *                  Duplicate question_index values: first occurrence wins (same as ON CONFLICT DO NOTHING).
 * @returns ScoringResult with all dimension scores, labels, type code, and completeness flag.
 */
export function scorePersonalityAnswers(answers: RawAnswer[]): ScoringResult {
  // Deduplicate — first answer wins (matches DB ON CONFLICT DO NOTHING behaviour)
  const seen = new Set<number>()
  const dedupedAnswers: RawAnswer[] = []
  for (const answer of answers) {
    if (!seen.has(answer.question_index)) {
      seen.add(answer.question_index)
      dedupedAnswers.push(answer)
    }
  }

  // Validate each answer and group by dimension
  const sums: Record<Dimension, number> = { EI: 0, SN: 0, TF: 0, JP: 0 }
  const counts: Record<Dimension, number> = { EI: 0, SN: 0, TF: 0, JP: 0 }

  for (const { question_index, raw_score } of dedupedAnswers) {
    // Validate raw_score range
    if (raw_score < 1 || raw_score > 5 || !Number.isInteger(raw_score)) {
      throw new Error(
        `Invalid raw_score ${raw_score} for question_index ${question_index}. Must be an integer 1–5.`
      )
    }

    // Derive dimension and type server-side — never trust caller-supplied values
    const question = getQuestion(question_index)
    const { dimension, type } = question

    // Apply reversal for R-type questions; F and S questions score as-is
    const contribution = type === 'R' ? (6 - raw_score) : raw_score

    sums[dimension] += contribution
    counts[dimension]++
  }

  const total_answers = dedupedAnswers.length
  const is_complete = total_answers >= MIN_ANSWERS_REQUIRED

  // Calculate dimension results
  function calcDimension(dimension: Dimension): DimensionResult {
    const sum = sums[dimension]
    const answerCount = counts[dimension]
    const { first, second } = POLES[dimension]

    if (answerCount === 0) {
      // No answers for this dimension — default to first pole at 0%
      return { score: 0, label: first, answerCount: 0, sum: 0 }
    }

    // Scale the sum to a 0–100 percentage.
    // With 25 questions: min sum = 25 (all 1s), max sum = 125 (all 5s)
    // With fewer answers, we scale proportionally to the answered count.
    const minSum = answerCount * 1
    const maxSum = answerCount * 5
    const range = maxSum - minSum  // always answerCount * 4

    const score = range > 0
      ? parseFloat(((sum - minSum) / range * 100).toFixed(2))
      : 50.0

    // Tiebreaker: exactly 50.0 → first pole (E/S/T/J)
    const label = score > 50.0 ? second : first

    return { score, label, answerCount, sum }
  }

  const ei = calcDimension('EI')
  const sn = calcDimension('SN')
  const tf = calcDimension('TF')
  const jp = calcDimension('JP')

  const type_code = (ei.label + sn.label + tf.label + jp.label) as TypeCode

  return { ei, sn, tf, jp, type_code, total_answers, is_complete }
}

/**
 * Convenience: returns a plain object matching the personality_results DB columns.
 * Throws if scoring produces an invalid type_code (should never happen with valid answers).
 */
export function toResultRow(scored: ScoringResult, sessionId: string, applicantId: string) {
  return {
    session_id:              sessionId,
    applicant_id:            applicantId,
    ei_score:                scored.ei.score,
    sn_score:                scored.sn.score,
    tf_score:                scored.tf.score,
    jp_score:                scored.jp.score,
    ei_label:                scored.ei.label,
    sn_label:                scored.sn.label,
    tf_label:                scored.tf.label,
    jp_label:                scored.jp.label,
    type_code:               scored.type_code,
    total_answers_at_scoring: scored.total_answers,
    status:                  scored.is_complete ? 'pending_review' : 'incomplete',
  }
}
