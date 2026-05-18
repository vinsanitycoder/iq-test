# Session Handoff Template

Copy and paste this at the START of every new Claude Code session for this project.

---

```
Project: Applicant Logical Test
Read CLAUDE.md first: /Users/VP_1/Desktop/_Claude Code/iq_test/CLAUDE.md
Last completed phase: Phase 4 - Database & Backend Setup
Currently working on: Phase 5 - Question Bank
Last thing done: Completed full backend setup — Next.js project, Supabase schema, RLS policies, all wired up and verified working
Next task: Write all 203 questions as SQL INSERT statements in supabase/03_questions.sql — see Phase 5 brief below for full spec
Known issues or blockers: none
```

---

## Phase 5 Brief — Question Bank

### Goal
Create `supabase/03_questions.sql` containing all 203 questions as INSERT statements. Run it in the Supabase SQL Editor when done.

### Question Bank Size (locked in)
| Type | Bank size | Selected per test session |
|---|---|---|
| Pattern Recognition | 55 | 12 |
| Numerical Reasoning | 50 | 10 |
| Spatial Reasoning | 45 | 8 |
| Logical Sequences | 50 | 10 |
| Practice (unscored) | 3 | all 3 |
| **Total** | **203** | **43** |

### Difficulty Distribution per Type (approximate)
- Easy: ~30%, Medium: ~40%, Hard: ~30%
- Scoring: Easy = 1pt, Medium = 2pts, Hard = 3pts

### Visual Questions (Pattern Recognition + Spatial)
- SVG content goes in the `svg_content` column
- All SVGs must be self-contained inline SVG strings (no external files)
- Keep SVGs simple — mobile-friendly, no complex gradients
- `question_text` for visual questions can be short: e.g. "Which shape comes next in the sequence?"

### Practice Questions (3 total)
- `is_practice = true`, `is_active = true`
- One sampler from: pattern_recognition, numerical, logical_sequence (spatial is skipped as sampler)
- Easy difficulty, unscored

### SQL format to use
```sql
INSERT INTO questions (type, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, svg_content, is_practice, is_active)
VALUES (
  'numerical',
  'easy',
  'If a train travels 60 miles in 1 hour, how far does it travel in 2.5 hours?',
  '120 miles', '140 miles', '150 miles', '160 miles',
  'c',
  NULL,
  false,
  true
);
```

### Important rules
- `correct_answer` must be lowercase: `'a'`, `'b'`, `'c'`, or `'d'`
- Never put the correct answer in the same position every time — vary it across a, b, c, d
- Questions must be genuinely varied — no two questions testing exactly the same thing
- Numerical questions: no calculators assumed, keep arithmetic reasonable
- Logical sequences: number series, letter series, or pattern rules
- All questions must have exactly 4 options with one unambiguously correct answer

### Phase 6 note (for context)
Phase 6 will use per-type random selection: `SELECT * FROM questions WHERE type = $1 AND is_practice = false AND is_active = true ORDER BY random() LIMIT $2` — so the question bank just needs to be in the DB, no other changes required.

---

## Phase Reference

| Phase | Name |
|---|---|
| Phase 1 | Discovery & Final Decisions ✅ |
| Phase 2 | Foundation & CLAUDE.md ✅ |
| Phase 3 | Design ✅ |
| Phase 4 | Database & Backend Setup ✅ |
| Phase 5 | Question Bank |
| Phase 6 | Applicant Test Build |
| Phase 7 | Scoring Engine |
| Phase 8 | HR Dashboard |
| Phase 9 | Testing & QA |
| Phase 10 | Deployment |

---

## Quick Reference — Key Decisions

- Stack: Next.js + Supabase + Tailwind + Vercel
- Question bank: 203 questions total, 40 selected per session (per-type random draw)
- Test: 40 questions, 25 mins, 4 types (pattern, numerical, spatial, logical sequences)
- Scoring: Difficulty-weighted, IQ scale mean 100 SD 15
- HR login: username fynlo (password in Supabase Auth)
- Applicants: single shared link, enter own name/email, duplicates allowed
- Design: friendly, approachable, mobile-first
- Visual questions: SVG/CSS only, no image files
- Security: correct answers never sent to browser, server-side timer
