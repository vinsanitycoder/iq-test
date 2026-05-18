/**
 * replace-spatial-questions.mjs
 *
 * Deletes all spatial questions and inserts verbal analogy + deductive questions.
 *
 * BEFORE running this script, add the new enum values in the Supabase SQL editor:
 *   ALTER TYPE question_type ADD VALUE 'verbal_analogy';
 *   ALTER TYPE question_type ADD VALUE 'deductive';
 *
 * Then run:
 *   node scripts/replace-spatial-questions.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

// Parse .env.local manually
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

// ── Verbal Analogy Questions ─────────────────────────────────────────────────
// Format: "WORD1 : WORD2 :: WORD3 : ?"
// 15 real questions (5 easy, 5 medium, 5 hard) + 1 practice

const verbalAnalogyQuestions = [
  // ── Easy (5) ──────────────────────────────────────────────────────────────
  {
    type: 'verbal_analogy',
    difficulty: 'easy',
    question_text: 'BIRD : FLY :: FISH : ?',
    option_a: 'Float',
    option_b: 'Breathe',
    option_c: 'Swim',
    option_d: 'Dive',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'easy',
    question_text: 'CHEF : KITCHEN :: DOCTOR : ?',
    option_a: 'Medicine',
    option_b: 'Stethoscope',
    option_c: 'Surgery',
    option_d: 'Hospital',
    correct_answer: 'd',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'easy',
    question_text: 'AUTHOR : BOOK :: SCULPTOR : ?',
    option_a: 'Clay',
    option_b: 'Museum',
    option_c: 'Chisel',
    option_d: 'Statue',
    correct_answer: 'd',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'easy',
    question_text: 'COLD : HOT :: DARK : ?',
    option_a: 'Night',
    option_b: 'Shade',
    option_c: 'Light',
    option_d: 'Shadow',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'easy',
    question_text: 'PUPPY : DOG :: KITTEN : ?',
    option_a: 'Feline',
    option_b: 'Cat',
    option_c: 'Pet',
    option_d: 'Fur',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },

  // ── Medium (5) ────────────────────────────────────────────────────────────
  {
    type: 'verbal_analogy',
    difficulty: 'medium',
    question_text: 'GLOVE : HAND :: HELMET : ?',
    option_a: 'Armour',
    option_b: 'Protection',
    option_c: 'Safety',
    option_d: 'Head',
    correct_answer: 'd',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'medium',
    question_text: 'ARCHITECT : BUILDING :: COMPOSER : ?',
    option_a: 'Piano',
    option_b: 'Orchestra',
    option_c: 'Symphony',
    option_d: 'Concert',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'medium',
    question_text: 'DRIZZLE : DOWNPOUR :: WHISPER : ?',
    option_a: 'Noise',
    option_b: 'Shout',
    option_c: 'Talk',
    option_d: 'Sound',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'medium',
    question_text: 'CATERPILLAR : BUTTERFLY :: TADPOLE : ?',
    option_a: 'Frog',
    option_b: 'Pond',
    option_c: 'Fish',
    option_d: 'Amphibian',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'medium',
    question_text: 'SORROW : ELATION :: SCARCITY : ?',
    option_a: 'Resources',
    option_b: 'Poverty',
    option_c: 'Wealth',
    option_d: 'Abundance',
    correct_answer: 'd',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },

  // ── Hard (5) ──────────────────────────────────────────────────────────────
  {
    type: 'verbal_analogy',
    difficulty: 'hard',
    question_text: 'ENERVATE : INVIGORATE :: RETICENT : ?',
    option_a: 'Reserved',
    option_b: 'Quiet',
    option_c: 'Garrulous',
    option_d: 'Cautious',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'hard',
    question_text: 'PALLIATIVE : PAIN :: AMNESTY : ?',
    option_a: 'Crime',
    option_b: 'Punishment',
    option_c: 'Pardon',
    option_d: 'Law',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'hard',
    question_text: 'HUBRIS : NEMESIS :: COMPLACENCY : ?',
    option_a: 'Failure',
    option_b: 'Confidence',
    option_c: 'Success',
    option_d: 'Satisfaction',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'hard',
    question_text: 'MENDACIOUS : TRUTHFUL :: PERFIDIOUS : ?',
    option_a: 'Cunning',
    option_b: 'Reliable',
    option_c: 'Loyal',
    option_d: 'Honest',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'verbal_analogy',
    difficulty: 'hard',
    question_text: 'EPHEMERAL : ENDURING :: CAPRICIOUS : ?',
    option_a: 'Whimsical',
    option_b: 'Steady',
    option_c: 'Impulsive',
    option_d: 'Fleeting',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },

  // ── Practice (1) ──────────────────────────────────────────────────────────
  {
    type: 'verbal_analogy',
    difficulty: 'easy',
    question_text: 'KNIFE : CUT :: BRUSH : ?',
    option_a: 'Clean',
    option_b: 'Hair',
    option_c: 'Paint',
    option_d: 'Stroke',
    correct_answer: 'c',
    svg_content: null,
    is_practice: true,
    is_active: true,
  },
]

// ── Deductive Reasoning Questions ────────────────────────────────────────────
// Premise(s) + conclusion question
// 10 real questions (4 easy, 3 medium, 3 hard)

const deductiveQuestions = [
  // ── Easy (4) ──────────────────────────────────────────────────────────────
  {
    type: 'deductive',
    difficulty: 'easy',
    question_text:
      'All project managers attend the weekly meeting. Tom attends the weekly meeting.\n\nWhich conclusion definitely follows?',
    option_a: 'Tom is definitely a project manager',
    option_b: 'Tom may or may not be a project manager',
    option_c: 'Tom is not a project manager',
    option_d: 'Tom manages at least one project',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'deductive',
    difficulty: 'easy',
    question_text:
      'No approved document contains errors. This document contains errors.\n\nWhich conclusion definitely follows?',
    option_a: 'This document will be corrected soon',
    option_b: 'All documents contain errors',
    option_c: 'This document has not been approved',
    option_d: 'The approval process has failed',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'deductive',
    difficulty: 'easy',
    question_text:
      'If a candidate scores above 80%, they advance to the next round. James scored 75%.\n\nWhich conclusion definitely follows?',
    option_a: 'James may still advance to the next round',
    option_b: 'James will not advance to the next round',
    option_c: 'James needs to resit the test',
    option_d: 'The next round is very competitive',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'deductive',
    difficulty: 'easy',
    question_text:
      'All employees who complete training receive a certificate. Sarah has received a certificate.\n\nWhich conclusion definitely follows?',
    option_a: 'Sarah completed the training',
    option_b: 'Sarah is a new employee',
    option_c: 'Sarah may or may not have completed the training',
    option_d: 'All employees receive certificates',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },

  // ── Medium (3) ────────────────────────────────────────────────────────────
  {
    type: 'deductive',
    difficulty: 'medium',
    question_text:
      'All directors have budget approval authority. No budget approval authority is granted to anyone below manager level. Helen has budget approval authority.\n\nWhich conclusion definitely follows?',
    option_a: 'Helen is a director',
    option_b: 'Helen is a manager',
    option_c: 'Helen is above manager level',
    option_d: 'Helen is not below manager level',
    correct_answer: 'd',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'deductive',
    difficulty: 'medium',
    question_text:
      'Every team that misses its quarterly target must submit a recovery plan. No recovery plan is required if the team restructures before the quarter ends. Team Delta missed its quarterly target and did not restructure.\n\nWhich conclusion definitely follows?',
    option_a: 'Team Delta may need to submit a recovery plan',
    option_b: 'Team Delta must submit a recovery plan',
    option_c: 'Team Delta will miss its next target too',
    option_d: 'Team Delta should have restructured',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'deductive',
    difficulty: 'medium',
    question_text:
      'Only candidates shortlisted by HR proceed to the panel interview. Only candidates who pass the technical test are shortlisted by HR. Marcus has not passed the technical test.\n\nWhich conclusion definitely follows?',
    option_a: 'Marcus will not be shortlisted by HR',
    option_b: 'Marcus will not proceed to the panel interview',
    option_c: 'Both: Marcus will not be shortlisted and will not proceed to interview',
    option_d: 'Marcus may still proceed if he appeals the result',
    correct_answer: 'c',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },

  // ── Hard (3) ──────────────────────────────────────────────────────────────
  {
    type: 'deductive',
    difficulty: 'hard',
    question_text:
      'All strategic initiatives require board sign-off. Any project over £500k is classified as a strategic initiative. All projects requiring board sign-off must include a risk assessment. Project Orion is valued at £650k.\n\nWhich conclusion definitely follows?',
    option_a: 'Project Orion requires a risk assessment',
    option_b: 'Project Orion may require board sign-off',
    option_c: 'Project Orion is too expensive to proceed',
    option_d: 'Project Orion needs a risk assessment only after board approval',
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'deductive',
    difficulty: 'hard',
    question_text:
      'No employee who has been on a performance improvement plan (PIP) in the last 12 months is eligible for promotion. All employees promoted this cycle were eligible. Raj was placed on a PIP 8 months ago.\n\nWhich conclusion definitely follows?',
    option_a: 'Raj was not promoted this cycle',
    option_b: 'Raj may have been promoted this cycle',
    option_c: 'Raj is no longer on a PIP so he is now eligible',
    option_d: "Raj's performance has since improved",
    correct_answer: 'a',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
  {
    type: 'deductive',
    difficulty: 'hard',
    question_text:
      'Every client account with more than 3 escalations in a quarter is flagged for review. All flagged accounts are assigned a senior manager. Accounts assigned a senior manager receive priority support. The Halford account had 4 escalations last quarter.\n\nWhich conclusion definitely follows?',
    option_a: 'The Halford account may be flagged for review',
    option_b: 'The Halford account receives priority support',
    option_c: "The Halford account's senior manager requested the review",
    option_d: 'The Halford account had poor service last quarter',
    correct_answer: 'b',
    svg_content: null,
    is_practice: false,
    is_active: true,
  },
]

async function main() {
  console.log('─── Replace Spatial Questions ───────────────────────────────')

  // 1. Delete all spatial questions
  console.log('\n1. Deleting all spatial questions...')
  const { error: deleteError, count } = await supabase
    .from('questions')
    .delete({ count: 'exact' })
    .eq('type', 'spatial')

  if (deleteError) {
    console.error('Delete failed:', deleteError.message)
    console.error('  → Have you run the ALTER TYPE SQL in Supabase first?')
    process.exit(1)
  }
  console.log(`   Deleted ${count} spatial questions`)

  // 2. Insert verbal analogy questions
  console.log(`\n2. Inserting ${verbalAnalogyQuestions.length} verbal analogy questions...`)
  const { error: vaError } = await supabase.from('questions').insert(verbalAnalogyQuestions)
  if (vaError) {
    console.error('Verbal analogy insert failed:', vaError.message)
    process.exit(1)
  }
  console.log(`   ✓ ${verbalAnalogyQuestions.filter(q => !q.is_practice).length} real + 1 practice`)

  // 3. Insert deductive questions
  console.log(`\n3. Inserting ${deductiveQuestions.length} deductive questions...`)
  const { error: dedError } = await supabase.from('questions').insert(deductiveQuestions)
  if (dedError) {
    console.error('Deductive insert failed:', dedError.message)
    process.exit(1)
  }
  console.log(`   ✓ ${deductiveQuestions.length} real questions`)

  // 4. Verify counts
  console.log('\n4. Verifying question bank...')
  const types = ['pattern_recognition', 'numerical', 'verbal_analogy', 'deductive', 'logical_sequence']
  for (const type of types) {
    const { count: real } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('type', type)
      .eq('is_practice', false)
      .eq('is_active', true)
    const { count: practice } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('type', type)
      .eq('is_practice', true)
    console.log(`   ${type}: ${real} real, ${practice} practice`)
  }

  console.log('\n✓ Done. Question bank updated successfully.')
  console.log('  Remember to restart your Next.js dev server if it is running.')
}

main()
