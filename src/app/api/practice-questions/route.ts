import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { QuestionForClient } from '@/types/database'

// correct_answer is deliberately excluded from this select string
const COLUMNS =
  'id, type, difficulty, question_text, option_a, option_b, option_c, option_d, svg_content, is_practice' as const

export async function GET() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('questions')
    .select(COLUMNS)
    .eq('is_practice', true)
    .eq('is_active', true)
    .order('type')
    .limit(5)

  if (error) {
    console.error('Practice questions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }

  // Cast to strip the inferred type — correct_answer was never selected
  const questions = (data ?? []) as QuestionForClient[]

  return NextResponse.json({ questions })
}
