/**
 * expand-question-bank.mjs
 *
 * Adds new questions to reach the target bank size:
 *   pattern_recognition: +29 → ~50 real total
 *   verbal_analogy:      +35 → ~50 real total
 *   deductive:           +30 → ~40 real total
 *
 * Safe to run: only inserts, never deletes.
 * Difficulty ratio: ~35% easy / ~40% medium / ~25% hard (industry standard).
 *
 * Run: node scripts/expand-question-bank.mjs
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
// PATTERN RECOGNITION (+29 real questions)
// Symbols: ○ ● ■ □ ▲ △  — no colours, no images, no hints in question text.
// Question text: "What comes next?", "What fills the blank?",
//                "How many dots come next?"
// ─────────────────────────────────────────────────────────────────────────────

const newPatternQuestions = [

  // ── EASY (+10) ────────────────────────────────────────────────────────────

  {
    type: 'pattern_recognition', difficulty: 'easy',
    question_text: 'What comes next?\n\n○  ■  ▲    ○  ■  ?',
    option_a: '○', option_b: '■', option_c: '▲', option_d: '□',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'easy',
    question_text: 'What comes next?\n\n●  ○  ●  ○  ●  ?',
    option_a: '●', option_b: '▲', option_c: '■', option_d: '○',
    correct_answer: 'd', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'easy',
    question_text: 'What comes next?\n\n▲  ▲  ▲  △    ▲  ▲  ▲  ?',
    option_a: '▲', option_b: '△', option_c: '■', option_d: '○',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'easy',
    question_text: 'What comes next?\n\n○  ○  ●    ○  ○  ●    ○  ?',
    option_a: '●', option_b: '○', option_c: '■', option_d: '▲',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'easy',
    question_text: 'What comes next?\n\n■  ■  □    ■  ■  □    ■  ?',
    option_a: '□', option_b: '■', option_c: '○', option_d: '▲',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'easy',
    question_text: 'How many dots come next?\n\n●    ●●    ●●●    ●●●●    ?',
    option_a: '3', option_b: '4', option_c: '5', option_d: '6',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'easy',
    question_text: 'What comes next?\n\n△  ▲  △  ▲  △  ?',
    option_a: '▲', option_b: '△', option_c: '■', option_d: '○',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'easy',
    question_text: 'What comes next?\n\n●  ●  ●  ○    ●  ●  ●  ○    ●  ●  ●  ?',
    option_a: '●', option_b: '△', option_c: '■', option_d: '○',
    correct_answer: 'd', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'easy',
    question_text: 'What comes next?\n\n▲  ○  ▲  ○  ▲  ○  ▲  ?',
    option_a: '▲', option_b: '■', option_c: '○', option_d: '□',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'easy',
    question_text: 'What comes next?\n\n□  □  ■    □  □  ■    □  □  ?',
    option_a: '□', option_b: '■', option_c: '○', option_d: '▲',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },

  // ── MEDIUM (+12) ──────────────────────────────────────────────────────────

  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What fills the blank?\n\nRow 1:  ▲  ○  ■\nRow 2:  ○  ■  ▲\nRow 3:  ■  ▲  ?',
    option_a: '▲', option_b: '■', option_c: '○', option_d: '□',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What comes next?\n\n○○  ●    ○○○  ●●    ○○○○  ●●●    ?',
    option_a: '○○○○○  ●●●●', option_b: '○○○  ●●●', option_c: '●●●●', option_d: '○○○○○',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What fills the blank?\n\nRow 1:  ■  ○  ▲\nRow 2:  ▲  ■  ○\nRow 3:  ○  ▲  ?',
    option_a: '○', option_b: '▲', option_c: '■', option_d: '□',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What comes next?\n\n●  ○●  ○○●  ○○○●  ?',
    option_a: '○○○○●', option_b: '○○●', option_c: '●○○○○', option_d: '○○○●',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'How many dots come next?\n\n●●●●    ●●●    ●●    ●    ●●    ●●●    ?',
    option_a: '2', option_b: '3', option_c: '4', option_d: '5',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What comes next?\n\n■○○    ■■○○    ■■■○○    ?',
    option_a: '■■■■○○○', option_b: '■■■■○○', option_c: '■■○○○', option_d: '■■■○○○',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What fills the blank?\n\nRow 1:  ○  ○  ●\nRow 2:  ○  ●  ○\nRow 3:  ●  ○  ?',
    option_a: '●', option_b: '○', option_c: '■', option_d: '▲',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What comes next?\n\n▲△    ▲▲△△    ▲▲▲△△△    ?',
    option_a: '▲▲▲▲△△△△', option_b: '▲△', option_c: '▲▲△△', option_d: '▲▲▲△△△',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What comes next?\n\n○  ■  ○  ■■  ○  ■■■  ○  ?',
    option_a: '■', option_b: '■■■■', option_c: '○', option_d: '■■',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What fills the blank?\n\nThe ● moves one step right each row, wrapping to column 1 after column 3.\n\nRow 1:  ●  ○  ○\nRow 2:  ○  ●  ○\nRow 3:  ○  ○  ●\nRow 4:  ●  ○  ?',
    option_a: '●', option_b: '○', option_c: '■', option_d: '▲',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What comes next?\n\n■■○○    ■○○■    ○○■■    ○■■○    ?',
    option_a: '○○■■', option_b: '■○■○', option_c: '■■○○', option_d: '○■○■',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'medium',
    question_text: 'What comes next?\n\n●●    ○●●○    ○○●●○○    ?',
    option_a: '○○○●●○○○', option_b: '○○●●○○', option_c: '●●○○', option_d: '○●●○',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },

  // ── HARD (+7) ─────────────────────────────────────────────────────────────

  {
    type: 'pattern_recognition', difficulty: 'hard',
    question_text: 'What fills the blank?\n\nEach row and each column contains ○, ●, ■ exactly once.\n\nRow 1:  ○  ●  ■\nRow 2:  ■  ○  ●\nRow 3:  ●  ■  ?',
    option_a: '○', option_b: '●', option_c: '■', option_d: '□',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'hard',
    question_text: 'How many dots come next?\n\n●    ●●    ●●●●    ●●●●●●●    ?\n\n(Differences: +1, +2, +3, ...)',
    option_a: '9', option_b: '10', option_c: '11', option_d: '12',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'hard',
    question_text: 'What comes next?\n\n○■▲    ■▲○    ▲○■    ○■▲    ■▲○    ?',
    option_a: '○■▲', option_b: '▲○■', option_c: '■▲○', option_d: '▲■○',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'hard',
    question_text: 'What fills the blank?\n\nRow 1:  ○  ●  ○  ●\nRow 2:  ●  ○  ●  ○\nRow 3:  ○  ●  ○  ●\nRow 4:  ●  ○  ●  ?',
    option_a: '●', option_b: '○', option_c: '■', option_d: '□',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'hard',
    question_text: 'What comes next?\n\n■  ○■  ○○■  ○○○■  ○○○○■  ?',
    option_a: '○○○○○■', option_b: '■○○○○○', option_c: '○○○○■■', option_d: '○○○○○',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'hard',
    question_text: 'What is at position 13 in the 5-step cycle?\n\n○  ●  ■  □  ▲  ○  ●  ■  □  ▲  ○  ●  ?',
    option_a: '○', option_b: '●', option_c: '■', option_d: '□',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'pattern_recognition', difficulty: 'hard',
    question_text: 'What fills the blank?\n\nEach row shifts one step left (cycling).\n\nRow 1:  ○  ■  □  ▲\nRow 2:  ■  □  ▲  ○\nRow 3:  □  ▲  ○  ■\nRow 4:  ▲  ○  ■  ?',
    option_a: '▲', option_b: '○', option_c: '■', option_d: '□',
    correct_answer: 'd', svg_content: null, is_practice: false, is_active: true,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// VERBAL ANALOGY (+35 real questions)
// Format: "WORD1 : WORD2 :: WORD3 : ?"
// ─────────────────────────────────────────────────────────────────────────────

const newVerbalQuestions = [

  // ── EASY (+13) ────────────────────────────────────────────────────────────

  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'RAIN : WET :: FIRE : ?',
    option_a: 'Burn', option_b: 'Warm', option_c: 'Hot', option_d: 'Bright',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'PENCIL : WRITE :: KNIFE : ?',
    option_a: 'Sharp', option_b: 'Cook', option_c: 'Cut', option_d: 'Metal',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'CLOCK : TIME :: RULER : ?',
    option_a: 'Draw', option_b: 'Straight', option_c: 'Measure', option_d: 'Length',
    correct_answer: 'd', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'CAR : GARAGE :: PLANE : ?',
    option_a: 'Airport', option_b: 'Hangar', option_c: 'Runway', option_d: 'Terminal',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'SONG : SINGER :: PAINTING : ?',
    option_a: 'Artist', option_b: 'Canvas', option_c: 'Painter', option_d: 'Museum',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'EAR : HEAR :: NOSE : ?',
    option_a: 'Face', option_b: 'Breathe', option_c: 'Sniff', option_d: 'Smell',
    correct_answer: 'd', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'DOCTOR : PATIENT :: TEACHER : ?',
    option_a: 'School', option_b: 'Student', option_c: 'Lesson', option_d: 'Class',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'LION : PRIDE :: WOLF : ?',
    option_a: 'Den', option_b: 'Hunt', option_c: 'Wild', option_d: 'Pack',
    correct_answer: 'd', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'FOOT : SHOE :: HAND : ?',
    option_a: 'Ring', option_b: 'Glove', option_c: 'Finger', option_d: 'Palm',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'SUGAR : SWEET :: LEMON : ?',
    option_a: 'Yellow', option_b: 'Fruit', option_c: 'Sour', option_d: 'Bitter',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'CHAPTER : BOOK :: EPISODE : ?',
    option_a: 'Show', option_b: 'TV', option_c: 'Series', option_d: 'Plot',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'FARMER : CROP :: FISHERMAN : ?',
    option_a: 'Boat', option_b: 'Ocean', option_c: 'Net', option_d: 'Fish',
    correct_answer: 'd', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'easy',
    question_text: 'FAST : SLOW :: LOUD : ?',
    option_a: 'Noise', option_b: 'Sound', option_c: 'Quiet', option_d: 'Silent',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },

  // ── MEDIUM (+14) ──────────────────────────────────────────────────────────

  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'TELESCOPE : STARS :: MICROSCOPE : ?',
    option_a: 'Lab', option_b: 'Science', option_c: 'Cells', option_d: 'Lens',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'MANUSCRIPT : AUTHOR :: BLUEPRINT : ?',
    option_a: 'Builder', option_b: 'Architect', option_c: 'Engineer', option_d: 'Designer',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'THIRST : WATER :: HUNGER : ?',
    option_a: 'Meal', option_b: 'Food', option_c: 'Restaurant', option_d: 'Appetite',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'RECKLESS : CAUTIOUS :: ARROGANT : ?',
    option_a: 'Proud', option_b: 'Modest', option_c: 'Humble', option_d: 'Shy',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'LIBRARY : BOOKS :: GALLERY : ?',
    option_a: 'Art', option_b: 'Paintings', option_c: 'Museum', option_d: 'Culture',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'SYMPTOM : DISEASE :: CLUE : ?',
    option_a: 'Detective', option_b: 'Crime', option_c: 'Police', option_d: 'Evidence',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'EVAPORATION : WATER :: COMBUSTION : ?',
    option_a: 'Fire', option_b: 'Heat', option_c: 'Fuel', option_d: 'Oxygen',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'APPRENTICE : MASTER :: NOVICE : ?',
    option_a: 'Guru', option_b: 'Expert', option_c: 'Senior', option_d: 'Professional',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'CONCISE : VERBOSE :: TRANSPARENT : ?',
    option_a: 'Clear', option_b: 'Hidden', option_c: 'Opaque', option_d: 'Dark',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'EXPEDITION : EXPLORER :: PILGRIMAGE : ?',
    option_a: 'Journey', option_b: 'Pilgrim', option_c: 'Religion', option_d: 'Temple',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'ANARCHY : ORDER :: DISCORD : ?',
    option_a: 'Peace', option_b: 'Harmony', option_c: 'Quiet', option_d: 'Agreement',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'PRUNE : TREE :: EDIT : ?',
    option_a: 'Document', option_b: 'Writer', option_c: 'Text', option_d: 'Book',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'ASTRONOMER : CELESTIAL :: BOTANIST : ?',
    option_a: 'Nature', option_b: 'Plant', option_c: 'Garden', option_d: 'Biology',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'medium',
    question_text: 'ADVOCATE : DEFENDANT :: GUARDIAN : ?',
    option_a: 'Child', option_b: 'Ward', option_c: 'Protect', option_d: 'Custody',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },

  // ── HARD (+8) ─────────────────────────────────────────────────────────────

  {
    type: 'verbal_analogy', difficulty: 'hard',
    question_text: 'OBSEQUIOUS : SERVILE :: LACONIC : ?',
    option_a: 'Brief', option_b: 'Terse', option_c: 'Quiet', option_d: 'Verbose',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'hard',
    question_text: 'VINDICATE : CONDEMN :: EXONERATE : ?',
    option_a: 'Accuse', option_b: 'Charge', option_c: 'Convict', option_d: 'Punish',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'hard',
    question_text: 'ATROPHY : MUSCLE :: EROSION : ?',
    option_a: 'Land', option_b: 'River', option_c: 'Rock', option_d: 'Cliff',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'hard',
    question_text: 'FILIBUSTER : LEGISLATION :: EMBARGO : ?',
    option_a: 'Commerce', option_b: 'Goods', option_c: 'Trade', option_d: 'Import',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'hard',
    question_text: 'SOPHISTRY : LOGIC :: PROPAGANDA : ?',
    option_a: 'Facts', option_b: 'Truth', option_c: 'News', option_d: 'Media',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'hard',
    question_text: 'DIFFIDENCE : AUDACITY :: LETHARGY : ?',
    option_a: 'Strength', option_b: 'Energy', option_c: 'Vigour', option_d: 'Drive',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'hard',
    question_text: 'SOLILOQUY : PLAYWRIGHT :: MONOLOGUE : ?',
    option_a: 'Script', option_b: 'Speaker', option_c: 'Actor', option_d: 'Stage',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'verbal_analogy', difficulty: 'hard',
    question_text: 'CATALYST : REACTION :: CATALYST : ?',
    option_a: 'Element', option_b: 'Change', option_c: 'Speed', option_d: 'Impetus',
    correct_answer: 'd', svg_content: null, is_practice: false, is_active: true,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// DEDUCTIVE REASONING (+30 real questions)
// Format: premises + "Which conclusion definitely follows?"
// ─────────────────────────────────────────────────────────────────────────────

const newDeductiveQuestions = [

  // ── EASY (+10) ────────────────────────────────────────────────────────────

  {
    type: 'deductive', difficulty: 'easy',
    question_text: 'All managers have access to the payroll system. Kate does not have access to the payroll system.\n\nWhich conclusion definitely follows?',
    option_a: 'Kate is not a manager',
    option_b: 'Kate will get access soon',
    option_c: 'Kate wants to be a manager',
    option_d: 'Payroll access is restricted',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'easy',
    question_text: 'No invoices submitted after the deadline are processed in the same month. This invoice was submitted after the deadline.\n\nWhich conclusion definitely follows?',
    option_a: 'The invoice will never be processed',
    option_b: 'The invoice was submitted incorrectly',
    option_c: 'This invoice will not be processed this month',
    option_d: 'The deadline should be extended',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'easy',
    question_text: 'Every team leader attends the Monday briefing. Alex attends the Monday briefing.\n\nWhich conclusion definitely follows?',
    option_a: 'Alex is a team leader',
    option_b: 'Alex may or may not be a team leader',
    option_c: 'Alex leads multiple teams',
    option_d: 'The Monday briefing is mandatory for all staff',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'easy',
    question_text: 'All expired products must be removed from the shelf immediately. This product has not expired.\n\nWhich conclusion definitely follows?',
    option_a: 'This product does not need to be removed immediately',
    option_b: 'This product is safe to eat',
    option_c: 'Expired products are dangerous',
    option_d: 'This product will expire soon',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'easy',
    question_text: 'If a supplier misses two consecutive deliveries, the contract is suspended. Supplier X has missed only one delivery.\n\nWhich conclusion definitely follows?',
    option_a: 'Supplier X\'s contract will be suspended',
    option_b: 'Supplier X\'s contract is not yet suspended',
    option_c: 'Supplier X will miss the next delivery',
    option_d: 'The supplier should be replaced',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'easy',
    question_text: 'All members of the leadership team attended the annual conference. Ben did not attend the annual conference.\n\nWhich conclusion definitely follows?',
    option_a: 'Ben is definitely not on the leadership team',
    option_b: 'Ben missed an important event',
    option_c: 'Ben was sick on that day',
    option_d: 'The leadership team will speak to Ben',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'easy',
    question_text: 'No project classified as confidential can be shared with external partners. Project Nexus is classified as confidential.\n\nWhich conclusion definitely follows?',
    option_a: 'Project Nexus should be cancelled',
    option_b: 'Project Nexus cannot be shared with external partners',
    option_c: 'External partners are untrustworthy',
    option_d: 'Project Nexus may be shared if approved',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'easy',
    question_text: 'Every applicant who passed the written test was invited for an interview. David was not invited for an interview.\n\nWhich conclusion definitely follows?',
    option_a: 'David did not submit an application',
    option_b: 'David did not pass the written test',
    option_c: 'David will reapply next year',
    option_d: 'The written test was too difficult',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'easy',
    question_text: 'All full-time employees are entitled to 28 days of annual leave. Maria works part-time.\n\nWhich conclusion definitely follows?',
    option_a: 'Maria is entitled to 28 days of annual leave',
    option_b: 'Maria is not entitled to any annual leave',
    option_c: 'Maria may not be entitled to the full 28 days of annual leave',
    option_d: 'Maria should become full-time',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'easy',
    question_text: 'Some employees work from home on Fridays. Sam works from home on Fridays.\n\nWhich conclusion definitely follows?',
    option_a: 'Sam is among the employees who work from home on Fridays',
    option_b: 'All employees work from home on Fridays',
    option_c: 'Sam works from home every day',
    option_d: 'Sam is a senior employee',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },

  // ── MEDIUM (+12) ──────────────────────────────────────────────────────────

  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'Every sales target achieved above 120% earns a bonus. No bonus is paid without manager sign-off. Lisa achieved 125% of her sales target.\n\nWhich conclusion definitely follows?',
    option_a: 'Lisa has already received her bonus',
    option_b: 'Lisa has earned a bonus, subject to manager sign-off',
    option_c: 'Lisa will definitely receive a bonus this month',
    option_d: 'Lisa\'s manager has approved the bonus',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'All employees in Band C or above can approve expenses. Only managers are in Band C or above. Tom is not a manager.\n\nWhich conclusion definitely follows?',
    option_a: 'Tom cannot approve any expenses',
    option_b: 'Tom can approve small expenses',
    option_c: 'Tom will be promoted to Band C',
    option_d: 'Tom should ask his manager to approve expenses',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'If a system alert is classified as Priority 1, the on-call engineer is notified immediately. If the on-call engineer is notified, a response must be logged within 10 minutes. A Priority 1 alert was raised at 3pm.\n\nWhich conclusion definitely follows?',
    option_a: 'The alert was resolved by 3:10pm',
    option_b: 'A response was logged within 10 minutes of the alert',
    option_c: 'The on-call engineer was notified at 3pm',
    option_d: 'The on-call engineer was notified and a response must be logged within 10 minutes',
    correct_answer: 'd', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'All proposals submitted by the deadline were reviewed. Some proposals that were reviewed were accepted. Proposal A was submitted by the deadline.\n\nWhich conclusion definitely follows?',
    option_a: 'Proposal A was accepted',
    option_b: 'Proposal A was reviewed',
    option_c: 'Proposal A may have been reviewed',
    option_d: 'Proposal A will be accepted if strong enough',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'No vendor on the restricted list is awarded a new contract. Any vendor with two quality failures in 12 months is placed on the restricted list. Vendor Apex had three quality failures last year.\n\nWhich conclusion definitely follows?',
    option_a: 'Vendor Apex may be placed on the restricted list',
    option_b: 'Vendor Apex will not be awarded a new contract',
    option_c: 'Vendor Apex has lost its previous contracts',
    option_d: 'Vendor Apex must improve its quality standards',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'Every new starter must complete induction training within 30 days of joining. No employee can access the client database without completing induction training. Ahmed joined 20 days ago and has not completed induction.\n\nWhich conclusion definitely follows?',
    option_a: 'Ahmed has violated company policy',
    option_b: 'Ahmed can still complete induction on time',
    option_c: 'Ahmed cannot currently access the client database',
    option_d: 'Ahmed will be dismissed for non-compliance',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'If a meeting has more than 8 attendees, a formal agenda must be circulated 24 hours in advance. If no formal agenda is circulated, the meeting must be rescheduled. The Monday call has 10 confirmed attendees and no agenda has been circulated.\n\nWhich conclusion definitely follows?',
    option_a: 'The Monday call will be cancelled permanently',
    option_b: 'The Monday call must be rescheduled',
    option_c: 'The Monday call may proceed informally',
    option_d: 'Someone should write the agenda immediately',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'All data marked as sensitive must be encrypted. Only the IT security team can change the classification of data. The finance team\'s salary data is classified as sensitive.\n\nWhich conclusion definitely follows?',
    option_a: 'The finance team can declassify the salary data',
    option_b: 'The salary data must be encrypted',
    option_c: 'The IT security team handles all salary data',
    option_d: 'All salary data is inherently sensitive',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'Every complaint that mentions discrimination is escalated to the HR director. All escalated complaints are acknowledged within 48 hours. A complaint received today mentions discrimination.\n\nWhich conclusion definitely follows?',
    option_a: 'The complaint will be resolved today',
    option_b: 'The complaint will be acknowledged within 48 hours',
    option_c: 'The HR director will investigate immediately',
    option_d: 'The complaint may be escalated at the HR director\'s discretion',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'No temporary staff member is eligible for the company pension scheme. Some pension scheme members receive an employer contribution. Jordan is a temporary staff member.\n\nWhich conclusion definitely follows?',
    option_a: 'Jordan receives no employer pension contribution',
    option_b: 'Jordan is not eligible for the company pension scheme',
    option_c: 'Jordan may be eligible if the contract length permits',
    option_d: 'Jordan should become a permanent employee',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'Every product recall requires written confirmation from the quality director. If no written confirmation is received, the recall process cannot proceed. The quality director is on leave until Monday.\n\nWhich conclusion definitely follows?',
    option_a: 'The recall will proceed without confirmation',
    option_b: 'The recall process cannot proceed until Monday at the earliest',
    option_c: 'The recall process may not proceed until written confirmation is received',
    option_d: 'A senior manager can authorise the recall instead',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'medium',
    question_text: 'All certified engineers are permitted to sign off on safety reports. Only employees who have passed the certification exam are certified. Priya failed the exam 3 months ago and has not retaken it.\n\nWhich conclusion definitely follows?',
    option_a: 'Priya is not permitted to sign off on safety reports',
    option_b: 'Priya will pass next time',
    option_c: 'Priya should not be working as an engineer',
    option_d: 'The certification exam is too difficult',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },

  // ── HARD (+8) ─────────────────────────────────────────────────────────────

  {
    type: 'deductive', difficulty: 'hard',
    question_text: 'All compliance reports must be filed by the 15th of each month. Any department that misses the deadline receives an automatic audit. The marketing department missed the deadline last month for the first time.\n\nWhich conclusion definitely follows?',
    option_a: 'Marketing will receive an automatic audit',
    option_b: 'Marketing will lose budget discretion',
    option_c: 'Marketing should have filed on time',
    option_d: 'The compliance team will contact marketing',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'hard',
    question_text: 'Every software release requires sign-off from the security team. No security team sign-off is granted without a completed vulnerability scan. A vulnerability scan can only be initiated by a certified security analyst. No certified security analyst is currently available.\n\nWhich conclusion definitely follows?',
    option_a: 'The release can proceed with management approval',
    option_b: 'A vulnerability scan cannot currently be initiated',
    option_c: 'The software release cannot currently proceed',
    option_d: 'Both B and C',
    correct_answer: 'd', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'hard',
    question_text: 'All board members are shareholders. All shareholders attend the annual general meeting. Only people who have attended the AGM can vote on resolutions. Elena is a board member.\n\nWhich conclusion definitely follows?',
    option_a: 'Elena can vote on resolutions',
    option_b: 'Elena attended the AGM',
    option_c: 'Elena is a shareholder who attends the AGM and can vote on resolutions',
    option_d: 'Elena is only a shareholder',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'hard',
    question_text: 'No supplier contract over £1m can be extended without a full tender process. Any contract requiring a tender must be advertised publicly for at least 28 days. The Orion contract is worth £1.2m and is due for renewal.\n\nWhich conclusion definitely follows?',
    option_a: 'The Orion contract will be extended',
    option_b: 'The Orion contract must be advertised publicly for at least 28 days before renewal',
    option_c: 'A new supplier will win the Orion contract',
    option_d: 'Orion may request a direct extension',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'hard',
    question_text: 'Any client account inactive for more than 90 days is moved to archived status. No archived account can place new orders without reactivation. Reactivation requires approval from a senior account manager. The Morrison account has been inactive for 95 days.\n\nWhich conclusion definitely follows?',
    option_a: 'The Morrison account is archived',
    option_b: 'The Morrison account cannot place new orders without a senior account manager\'s approval',
    option_c: 'The Morrison account has been archived and cannot place new orders without reactivation approved by a senior account manager',
    option_d: 'The Morrison account will be closed permanently',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'hard',
    question_text: 'All staff with access to personal data must complete annual data protection training by 31 March. Staff who do not complete training by 31 March lose their data access. Staff who lose data access cannot process customer records. Nadia has not completed the training by 31 March.\n\nWhich conclusion definitely follows?',
    option_a: 'Nadia will lose her data access and cannot process customer records',
    option_b: 'Nadia may be given an extension',
    option_c: 'Nadia will lose data access only',
    option_d: 'Nadia cannot process customer records yet',
    correct_answer: 'a', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'hard',
    question_text: 'No project sponsor can approve their own team\'s expense claims. All expense claims over £2,000 require project sponsor approval. The finance project\'s expense claim of £3,500 has been submitted. The finance director is also the project sponsor for the finance project.\n\nWhich conclusion definitely follows?',
    option_a: 'The claim cannot be approved',
    option_b: 'The finance director can approve the claim as a director',
    option_c: 'The finance director cannot approve this claim in their role as sponsor',
    option_d: 'A different director must handle this claim',
    correct_answer: 'c', svg_content: null, is_practice: false, is_active: true,
  },
  {
    type: 'deductive', difficulty: 'hard',
    question_text: 'Every change to a live production system must be logged in the change register. All logged changes are reviewed weekly by the operations team. Any change not logged is flagged as an incident. A database update was applied to the production system but not logged.\n\nWhich conclusion definitely follows?',
    option_a: 'The database update will be reviewed by the operations team',
    option_b: 'The database update has been flagged as an incident',
    option_c: 'The operations team knows about the update',
    option_d: 'The database update should be reversed',
    correct_answer: 'b', svg_content: null, is_practice: false, is_active: true,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function insertBatch(questions, label) {
  const BATCH = 50
  let inserted = 0
  for (let start = 0; start < questions.length; start += BATCH) {
    const batch = questions.slice(start, start + BATCH)
    const { error } = await supabase.from('questions').insert(batch)
    if (error) {
      console.error(`  ✗ Insert error (${label}, batch ${start}):`, error.message)
      process.exit(1)
    }
    inserted += batch.length
  }
  console.log(`  ✓ Inserted ${inserted} ${label} questions`)
}

async function printCounts() {
  const types = ['pattern_recognition', 'numerical', 'verbal_analogy', 'deductive', 'logical_sequence']
  console.log('\nFinal question bank:')
  for (const type of types) {
    const { count: real } = await supabase
      .from('questions').select('*', { count: 'exact', head: true })
      .eq('type', type).eq('is_practice', false).eq('is_active', true)
    const { count: prac } = await supabase
      .from('questions').select('*', { count: 'exact', head: true })
      .eq('type', type).eq('is_practice', true)
    console.log(`  ${type.padEnd(22)} ${String(real).padStart(3)} real + ${prac} practice`)
  }
}

async function main() {
  console.log('─── Expand Question Bank ────────────────────────────────────')

  // Show current counts first
  console.log('\nCurrent question bank:')
  await printCounts()

  console.log('\nInserting new questions...')
  await insertBatch(newPatternQuestions, 'pattern_recognition')
  await insertBatch(newVerbalQuestions,  'verbal_analogy')
  await insertBatch(newDeductiveQuestions, 'deductive')

  await printCounts()

  const summary = [
    `  pattern_recognition: +${newPatternQuestions.length} (10 easy, 12 medium, 7 hard)`,
    `  verbal_analogy:      +${newVerbalQuestions.length} (13 easy, 14 medium, 8 hard)`,
    `  deductive:           +${newDeductiveQuestions.length} (10 easy, 12 medium, 8 hard)`,
  ]
  console.log('\nAdded:')
  summary.forEach(l => console.log(l))
  console.log('\n✓ Done.')
}

main()
