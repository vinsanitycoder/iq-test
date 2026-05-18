/**
 * replace-pattern-questions.mjs
 *
 * Deletes all existing pattern_recognition questions and replaces them with
 * symbol-based questions that require no images and are colour-blind safe.
 *
 * Symbols used: ○ ● ■ □ ▲ △
 * These render as plain text in all modern browsers and on mobile.
 *
 * Run:
 *   node scripts/replace-pattern-questions.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

const env = {}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// ─────────────────────────────────────────────────────────────────────────────
// SYMBOL KEY (for reference when reading questions below)
//   ○  white circle    ●  black circle
//   ■  black square    □  white square
//   ▲  black triangle  △  white triangle
//
// Grid questions use newlines (\n) which render correctly in the app.
// ─────────────────────────────────────────────────────────────────────────────

const patternQuestions = [

  // ── EASY (8 questions) ────────────────────────────────────────────────────
  // Straightforward repeating and alternating patterns.

  {
    type: 'pattern_recognition',
    difficulty: 'easy',
    question_text: 'What comes next in the sequence?\n\n○  ●  ○  ●  ○  ?',
    option_a: '○',
    option_b: '●',
    option_c: '■',
    option_d: '▲',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'easy',
    question_text: 'What comes next in the sequence?\n\n■  ■  ○    ■  ■  ○    ■  ■  ?',
    option_a: '■',
    option_b: '▲',
    option_c: '○',
    option_d: '□',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'easy',
    question_text: 'What comes next in the sequence?\n\n▲  ■  ○    ▲  ■  ○    ▲  ?',
    option_a: '○',
    option_b: '▲',
    option_c: '■',
    option_d: '□',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'easy',
    question_text: 'What comes next in the sequence?\n\n□  ■  □  ■  □  ?',
    option_a: '□',
    option_b: '▲',
    option_c: '○',
    option_d: '■',
    correct_answer: 'd',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'easy',
    question_text: 'What comes next in the sequence?\n\n○  ○  ▲    ○  ○  ▲    ○  ?',
    option_a: '○',
    option_b: '▲',
    option_c: '■',
    option_d: '□',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'easy',
    question_text: 'Each group has one more dot than the last.\n\n●    ●●    ●●●    ●●●●    ?\n\nHow many dots come next?',
    option_a: '5',
    option_b: '4',
    option_c: '6',
    option_d: '3',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'easy',
    question_text: 'What comes next in the sequence?\n\n▲  ▲  ■    ▲  ▲  ■    ▲  ?',
    option_a: '■',
    option_b: '▲',
    option_c: '○',
    option_d: '□',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'easy',
    question_text: 'The two groups grow together. What comes next?\n\n○  ●    ○○  ●●    ○○○  ●●●    ?',
    option_a: '○○○○',
    option_b: '●●●●',
    option_c: '○○',
    option_d: '●●',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },

  // ── MEDIUM (7 questions) ──────────────────────────────────────────────────
  // Requires spotting two-variable rules, grid patterns, or slightly less
  // obvious sequences.

  {
    type: 'pattern_recognition',
    difficulty: 'medium',
    question_text: 'The ■ moves one step diagonally each row.\n\nRow 1:  ■  ○  ○\nRow 2:  ○  ■  ○\nRow 3:  ○  ○  ?\n\nWhat fills the blank?',
    option_a: '○',
    option_b: '■',
    option_c: '▲',
    option_d: '□',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'medium',
    question_text: 'Each row uses ○, ■, and ▲ exactly once.\n\nRow 1:  ○  ■  ▲\nRow 2:  ■  ▲  ○\nRow 3:  ▲  ○  ?\n\nWhat fills the blank?',
    option_a: '■',
    option_b: '▲',
    option_c: '○',
    option_d: '□',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'medium',
    question_text: 'The pairs swap each step. What comes next?\n\n○■    ■○    ○■    ■○    ?',
    option_a: '○○',
    option_b: '■■',
    option_c: '■○',
    option_d: '○■',
    correct_answer: 'd',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'medium',
    question_text: 'One ● is added to the middle each step. What comes next?\n\n○●○    ○●●○    ○●●●○    ?',
    option_a: '○●●●●○',
    option_b: '○●●○',
    option_c: '●●●●',
    option_d: '○●○',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'medium',
    question_text: 'Every 4th symbol is ■. What comes next?\n\n○  ○  ○  ■    ○  ○  ○  ■    ○  ○  ○  ?',
    option_a: '○',
    option_b: '■',
    option_c: '▲',
    option_d: '□',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'medium',
    question_text: 'Both symbols grow by one each step. What comes next?\n\n■○    ■■○○    ■■■○○○    ?',
    option_a: '■■■■○○○○',
    option_b: '■■○○',
    option_c: '○○○○',
    option_d: '■■■■',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'medium',
    question_text: 'The sequence counts down, then up. What comes next?\n\n●●●●●    ●●●●    ●●●    ●●    ●    ●●    ?\n\nHow many dots come next?',
    option_a: '1',
    option_b: '2',
    option_c: '3',
    option_d: '4',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },

  // ── HARD (6 questions) ────────────────────────────────────────────────────
  // Requires identifying non-obvious rules, multiple simultaneous rules,
  // or mathematical relationships within symbol patterns.

  {
    type: 'pattern_recognition',
    difficulty: 'hard',
    question_text: 'Each number is the sum of the previous two (Fibonacci).\n\n●    ●●    ●●●    ●●●●●    ●●●●●●●●    ?\n\nHow many dots come next?',
    option_a: '13',
    option_b: '10',
    option_c: '12',
    option_d: '16',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'hard',
    question_text: 'Two sequences are interleaved, each growing by one. What comes next?\n\n○  ■  ○○  ■■  ○○○  ■■■  ○○○○  ?',
    option_a: '■■■■',
    option_b: '○○○○○',
    option_c: '■■■',
    option_d: '○○○',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'hard',
    question_text: 'Each row and each column contains ○, ■, ▲, and □ exactly once.\n\nRow 1:  ○  ■  ▲  □\nRow 2:  ■  ▲  □  ○\nRow 3:  ▲  □  ○  ■\nRow 4:  □  ○  ■  ?\n\nWhat fills the blank?',
    option_a: '□',
    option_b: '○',
    option_c: '■',
    option_d: '▲',
    correct_answer: 'd',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'hard',
    question_text: 'The ○ group grows by one each time, while ■ stays constant. What comes next?\n\n■  ○    ■  ○○    ■  ○○○    ■  ?',
    option_a: '○○○○',
    option_b: '○○○',
    option_c: '■■',
    option_d: '○',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'hard',
    question_text: 'The ■ shifts one column to the right each row, then wraps back to column 1.\n\nRow 1:  ■  ○  ○\nRow 2:  ○  ■  ○\nRow 3:  ○  ○  ■\nRow 4:  ■  ○  ○\nRow 5:  ○  ■  ○\nRow 6:  ○  ○  ?\n\nWhat fills the blank?',
    option_a: '○',
    option_b: '■',
    option_c: '▲',
    option_d: '□',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'pattern_recognition',
    difficulty: 'hard',
    question_text: 'If  ○○ = ●  and  ●● = ■,  what does  ○○○○  equal?',
    option_a: '●●',
    option_b: '○○',
    option_c: '■',
    option_d: '●',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },

  // ── PRACTICE (1 question) ─────────────────────────────────────────────────

  {
    type: 'pattern_recognition',
    difficulty: 'easy',
    question_text: 'What comes next in the sequence?\n\n○  ■  ○  ■  ○  ?',
    option_a: '○',
    option_b: '▲',
    option_c: '■',
    option_d: '□',
    correct_answer: 'c',
    svg_content: null,
    is_practice: true,
    is_active: true,
  },
]

async function main() {
  console.log('─── Replace Pattern Recognition Questions ───────────────────')

  // 1. Delete all existing pattern_recognition questions
  console.log('\n1. Deleting all existing pattern_recognition questions...')
  const { error: deleteError, count } = await supabase
    .from('questions')
    .delete({ count: 'exact' })
    .eq('type', 'pattern_recognition')

  if (deleteError) {
    console.error('Delete failed:', deleteError.message)
    process.exit(1)
  }
  console.log(`   Deleted ${count} questions`)

  // 2. Insert new symbol-based questions
  console.log(`\n2. Inserting ${patternQuestions.length} new symbol-based questions...`)
  const { error: insertError } = await supabase.from('questions').insert(patternQuestions)
  if (insertError) {
    console.error('Insert failed:', insertError.message)
    process.exit(1)
  }

  const real = patternQuestions.filter(q => !q.is_practice).length
  const practice = patternQuestions.filter(q => q.is_practice).length
  console.log(`   ✓ ${real} real (8 easy, 7 medium, 6 hard) + ${practice} practice`)

  // 3. Verify full question bank
  console.log('\n3. Verifying question bank...')
  const types = ['pattern_recognition', 'numerical', 'verbal_analogy', 'deductive', 'logical_sequence']
  for (const type of types) {
    const { count: real } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('type', type)
      .eq('is_practice', false)
      .eq('is_active', true)
    const { count: prac } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('type', type)
      .eq('is_practice', true)
    console.log(`   ${type}: ${real} real, ${prac} practice`)
  }

  console.log('\n✓ Done. Restart your Next.js dev server to see changes.')
}

main()
