/**
 * Seeds the questions table from 03_questions.sql.
 * Run once: node scripts/seed-questions.mjs
 */
import { readFileSync } from 'fs'
import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read env manually
const envFile = readFileSync(join(__dirname, '../.env.local'), 'utf-8')
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Parse a single SQL tuple string into an array of JS values ────────
// Input: the content between the outer parentheses of a VALUES row
// e.g. "'numerical', 'easy', 'text', 'a', 'b', 'c', 'd', 'x', NULL, false, true"
function parseTuple(s) {
  const values = []
  let i = 0
  const n = s.length

  while (i < n) {
    // Skip leading whitespace
    while (i < n && /\s/.test(s[i])) i++
    if (i >= n) break

    if (s[i] === "'") {
      // Quoted string — read until matching unescaped closing quote
      i++ // skip opening quote
      let str = ''
      while (i < n) {
        if (s[i] === "'" && s[i + 1] === "'") {
          str += "'"
          i += 2
        } else if (s[i] === "'") {
          i++ // skip closing quote
          break
        } else {
          str += s[i++]
        }
      }
      values.push(str)
    } else if (s.slice(i, i + 4).toLowerCase() === 'null') {
      values.push(null)
      i += 4
    } else if (s.slice(i, i + 4).toLowerCase() === 'true') {
      values.push(true)
      i += 4
    } else if (s.slice(i, i + 5).toLowerCase() === 'false') {
      values.push(false)
      i += 5
    } else {
      // Read until comma or end
      let lit = ''
      while (i < n && s[i] !== ',') lit += s[i++]
      values.push(lit.trim())
    }

    // Skip trailing whitespace and comma
    while (i < n && /\s/.test(s[i])) i++
    if (i < n && s[i] === ',') i++
  }

  return values
}

// ── Extract the outermost parentheses content from a VALUES row ───────
// A VALUES row looks like: ('a', 'b', ..., '<svg .../>'),
// The SVG may contain nested parentheses — so we match the outer pair
function extractTupleContent(line) {
  // Find the first '('
  const start = line.indexOf('(')
  if (start === -1) return null
  // Find the matching closing ')' — counting nesting depth
  // SVGs don't contain () but let's be safe
  let depth = 0
  let end = -1
  for (let i = start; i < line.length; i++) {
    if (line[i] === '(') depth++
    else if (line[i] === ')') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  if (end === -1) return null
  return line.slice(start + 1, end)
}

// ── Main parser ───────────────────────────────────────────────────────
function parseSqlFile(sql) {
  const questions = []
  const lines = sql.split('\n')
  let cols = null

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (line.startsWith('INSERT INTO questions (')) {
      // Extract column list: everything between first ( and )
      const m = line.match(/INSERT INTO questions \(([^)]+)\)/)
      if (m) {
        cols = m[1].split(',').map(c => c.trim())
      }
      continue
    }

    // A data row starts with '(' and ends with '),' or ');' (after trimming)
    if (cols && line.startsWith('(') && (line.endsWith(',') || line.endsWith(';'))) {
      const content = extractTupleContent(line)
      if (!content) continue
      const values = parseTuple(content)
      if (values.length !== cols.length) {
        console.warn(`Skipping row with ${values.length} values (expected ${cols.length}): ${line.slice(0, 60)}...`)
        continue
      }
      const obj = {}
      for (let i = 0; i < cols.length; i++) {
        obj[cols[i]] = values[i]
      }
      questions.push(obj)
    }
  }

  return questions
}

// ── Run ───────────────────────────────────────────────────────────────

const sql = readFileSync(join(__dirname, '../supabase/03_questions.sql'), 'utf-8')
const questions = parseSqlFile(sql)

console.log(`Parsed ${questions.length} questions from SQL`)

// Spot-check first and last
if (questions.length > 0) {
  const first = questions[0]
  console.log(`First: ${first.type} / ${first.difficulty} / "${first.question_text?.slice(0, 40)}"`)
  const last = questions[questions.length - 1]
  console.log(`Last:  ${last.type} / ${last.difficulty} / "${last.question_text?.slice(0, 40)}"`)
}

if (questions.length === 0) {
  console.error('No questions parsed — aborting')
  process.exit(1)
}

// Check current DB count
const { count: existing } = await supabase
  .from('questions')
  .select('*', { count: 'exact', head: true })
console.log(`Existing questions in DB: ${existing}`)

if (existing > 0) {
  console.log('Questions already seeded. Exiting.')
  process.exit(0)
}

// Insert in batches of 50
const BATCH = 50
let inserted = 0
for (let start = 0; start < questions.length; start += BATCH) {
  const batch = questions.slice(start, start + BATCH)
  const { error } = await supabase.from('questions').insert(batch)
  if (error) {
    console.error(`Insert error at batch starting ${start}:`, error.message)
    console.error('First row of batch:', JSON.stringify(batch[0], null, 2))
    process.exit(1)
  }
  inserted += batch.length
  console.log(`Inserted ${inserted}/${questions.length}`)
}

// Final verification
const { count: final } = await supabase.from('questions').select('*', { count: 'exact', head: true })
const { count: practice } = await supabase
  .from('questions')
  .select('*', { count: 'exact', head: true })
  .eq('is_practice', true)
console.log(`\nDone! Total in DB: ${final}, Practice: ${practice}`)
