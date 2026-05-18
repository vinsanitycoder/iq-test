# Applicant Logical Test — Project Context

## What This Is
A web-based cognitive aptitude testing platform for hiring. Applicants complete a timed logical reasoning test via a single shared link. HR reviews all results via a private internal dashboard.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Auth:** Supabase Auth (HR login only)
- **File Storage:** Supabase Storage (company logo)
- **Pause Prevention:** Vercel cron job pings Supabase weekly (prevents free tier pause)

## Project Location
/Users/VP_1/Desktop/_Claude Code/iq_test

---

## Design Principles
- Friendly, approachable, clean — not clinical or corporate
- Mobile-first (design for phone first, scale up to desktop)
- SVG/CSS only for all visual questions — no image files
- Warm, human microcopy throughout
- No over-engineering — keep every solution as simple as possible
- No extra abstractions, no features beyond what is specified

## Design System (LOCKED — Phase 3)
See `DESIGN_SYSTEM.md` for the full spec. Summary:
- Style: Warm Minimal · Teal-Led
- Font: Nunito (Google Fonts)
- Primary: `#0084AD` (Fynlo teal) — header, stats
- CTA button: `#BC3F1D` (Fynlo terracotta)
- Tags: `#D4FF98` bg / `#003B4C` text
- Page bg: `#F7F7F3` · Cards: white · Body text: `#4A6572`
- Do not change the design system without explicit user approval

---

## Users

### Applicants
- Access via a single shared URL (no account, no login)
- Enter their own name and email at the start
- Complete the timed test
- Never see their score
- Duplicate emails are allowed

### HR
- Single login account
- Username: fynlo
- Password: stored securely via Supabase Auth (never plain text)
- Full dashboard access: results, export, settings, applicant management

---

## Applicant Flow

```
Single shared link
        ↓
Welcome Screen
  - Company logo + name (HR-editable)
  - Test name (HR-editable, default: "Applicant Logical Test")
  - Warm headline + intro text (HR-editable)
  - "Start" button
        ↓
Name & Email Entry
  - First name, last name, email
  - Privacy note: "Your information is kept private and only used for this application."
  - Basic email format validation
        ↓
Instructions Screen
  - 40 questions, 25 minutes
  - Can skip a question but cannot go back
  - Skipped questions score zero
  - Keep browser open and focused
  - "Start Practice Questions" button + "Skip to Real Test" link
        ↓
Up to 5 Practice Questions (optional, skippable)
  - One per question type sampler
  - Unscored, no timer running yet
  - "Begin Real Test" button
        ↓
Real Test — 40 Questions, 25 Minutes
  - Timer starts server-side on first question load
  - Progress bar (e.g. Question 8 of 40)
  - Countdown timer visible
  - One question per screen
  - Skip button (no back button)
  - Tab-switch events logged silently
  - Each answer saved to DB immediately on Next click
  - Auto-submits at 0:00
  - Loading/submitting state on final submit (prevents double-submit)
        ↓
Completion Screen
  - "Your test has been successfully submitted."
  - Thank you message (HR-editable)
  - Confidentiality statement (HR-editable)
  - What happens next (HR-editable)
  - No score shown to applicant
```

---

## Test Structure

| Type | Questions | Format |
|---|---|---|
| Pattern Recognition | 12 | Visual patterns (Unicode symbols) |
| Numerical Reasoning | 10 | Number problems |
| Verbal Reasoning | 5 | Word/analogy reasoning |
| Deductive Reasoning | 4 | Logic/deduction problems |
| Logical Sequences | 9 | Number or pattern sequences |
| **Total** | **40** | |

- Up to 5 unscored practice questions (one per question type sampler)
- Questions randomised per session (prevents answer sharing)
- One question per screen
- Multiple choice (4 options: A, B, C, D)
- No going back, can skip forward
- Skipped = 0 points

---

## Scoring System

- **Difficulty weighting:** Easy = 1pt, Medium = 2pts, Hard = 3pts
- **Raw score:** Sum of weighted correct answers
- **IQ conversion:** Normalised to mean 100, SD 15 using published normative tables
- **Percentile:** Calculated from IQ score
- **Scoring is server-side only — correct answers are NEVER sent to the browser**

### IQ Labels for HR Dashboard

| IQ Score | Label | Percentile |
|---|---|---|
| 130+ | Superior | Top 2% |
| 115–129 | Above Average | Top 16% |
| 100–114 | High Average | Above 50% |
| 85–99 | Average | Middle range |
| 70–84 | Low Average | Below average |
| Below 70 | Below Average | Bottom range |

---

## Database Schema

### `settings`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| company_name | text | HR-editable |
| company_logo_url | text | HR-editable, Supabase Storage |
| test_name | text | Default: "Applicant Logical Test" |
| welcome_headline | text | HR-editable |
| welcome_body | text | HR-editable |
| completion_message | text | HR-editable |
| confidentiality_text | text | HR-editable |
| whats_next_text | text | HR-editable |
| updated_at | timestamp | |

### `questions`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| type | enum | pattern_recognition, numerical, verbal_analogy, deductive, logical_sequence |
| difficulty | enum | easy, medium, hard |
| question_text | text | |
| option_a | text | |
| option_b | text | |
| option_c | text | |
| option_d | text | |
| correct_answer | text | **NEVER sent to client** |
| svg_content | text | Nullable, for visual questions |
| is_practice | boolean | Default: false |
| is_active | boolean | Default: true |
| created_at | timestamp | |

### `applicants`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| first_name | text | |
| last_name | text | |
| email | text | Duplicates allowed |
| source | text | Default: "direct_link" |
| created_at | timestamp | |

### `test_sessions`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| applicant_id | uuid FK | → applicants |
| start_time | timestamp | Server-side — used for timer calculation |
| end_time | timestamp | Nullable |
| time_taken_seconds | integer | Nullable |
| status | enum | in_progress, completed, expired |
| tab_switches | integer | Default: 0 |
| created_at | timestamp | |

### `answers`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| session_id | uuid FK | → test_sessions |
| question_id | uuid FK | → questions |
| selected_answer | text | Nullable = skipped |
| is_correct | boolean | Calculated server-side on submission |
| answered_at | timestamp | |

### `results`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| session_id | uuid FK | → test_sessions |
| applicant_id | uuid FK | → applicants |
| raw_score | integer | |
| weighted_score | decimal | |
| iq_score | integer | |
| percentile | integer | |
| iq_label | text | |
| status | enum | pending_review, reviewed, shortlisted, rejected |
| reviewed_at | timestamp | Nullable |
| created_at | timestamp | |

### `indeed_imports`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| applicant_id | uuid FK | → applicants |
| imported_at | timestamp | |
| source_file | text | |

---

## Security Rules — Non-Negotiable

1. **Correct answers NEVER reach the browser** — all scoring is server-side via API routes
2. **Timer is server-side** — remaining time = 25min − (now − start_time from DB)
3. **RLS enabled on all tables from day one**
4. **Candidates** can only read/write their own session (by session ID in URL)
5. **HR dashboard** uses Supabase Auth server-side session only
6. **HR password** stored via Supabase Auth — never plain text
7. **Service role key** only used in server-side API routes — never in client code

---

## HR Dashboard Features

- Applicant list: name, email, IQ score, label, percentile, time taken, date, status
- Status pipeline per applicant: Invited → In Progress → Completed → Reviewed → Shortlisted / Rejected
- Score context reference panel (static, always visible)
- Individual applicant detail view
- Tab-switch flag visible per applicant
- Reset / delete applicant record
- CSV export of all results
- Indeed CSV import (with column validation before import)
- Settings page: company name, logo upload, test name, all key text fields

### Logo Upload Rules
- Max file size: 2MB
- Accepted formats: JPG, PNG, SVG
- Auto-resized on display
- Logo is also used as browser favicon (via `generateMetadata` in `app/layout.tsx`)
- Remove logo button available in Settings

### User Management (Admin only)
- Multiple admins supported — role stored in Supabase `app_metadata.role = 'admin'`
- Admin can create HR users (temp password `Welcome@XXXX`)
- Admin can reset any user's password
- Admin can grant/revoke admin role (cannot remove last admin)
- Admin can delete users (cannot delete self or last admin)
- `UserManagement` component in Settings page, only visible to admins

### HR-Editable Text Field Limits
- Company name: 60 characters
- Test name: 80 characters
- Welcome headline: 100 characters
- All body text fields: 500 characters

---

## Supabase Pause Prevention
- Vercel cron job defined in `vercel.json`
- Runs every Sunday at midnight UTC
- Hits a lightweight API route that performs a simple DB read
- Keeps free tier active

---

## Known Issues to Watch For

| Issue | Severity | Notes |
|---|---|---|
| SVG rendering on older mobile browsers | Medium | Keep SVGs simple |
| Logo upload size/format | Low | Enforced at upload |
| Character limits on editable fields | Low | Enforced in form |
| Email format validation | Low | Client-side check |
| Zero-answer edge case | Low | Handle score of 0 gracefully |
| Double-submit on test completion | Low | Loading state prevents this |
| Indeed CSV column validation | Medium | Validate before import |

## Stale UI Rules (must follow for all future features)

Any HR page or component that shows live data MUST follow all four rules:

1. **API GET routes** — send `Cache-Control: no-store` header
2. **HR server pages** — add `export const dynamic = 'force-dynamic'`
3. **Client fetches** — use `cache: 'no-store'` on every `fetch()` call
4. **Prop→state components** — add `useEffect(() => { setState(prop) }, [prop])` to sync when parent re-renders

## Live Deployment

- **URL:** cognitivetest.fynloapps.com
- **GitHub:** https://github.com/vinsanitycoder/iq-test
- **Host:** Vercel (auto-deploys on push to main)
- **DNS:** Cloudflare CNAME `cognitivetest` → `cname.vercel-dns.com` (DNS only, grey cloud)

---

## Build Phases

- [x] Phase 1: Discovery & Final Decisions
- [x] Phase 2: Foundation & CLAUDE.md
- [x] Phase 3: Design
- [x] Phase 4: Database & Backend Setup
- [x] Phase 5: Question Bank
- [x] Phase 6: Applicant Test Build
- [x] Phase 7: Scoring Engine
- [x] Phase 8: HR Dashboard
- [x] Phase 9: Testing & QA
- [x] Phase 10: Deployment
- [x] Post-launch: Bug fixes & feature additions (all complete)

Update the checklist above when each phase is complete.

---

## Rules for Claude
- Read this file at the start of every session before doing anything
- Keep solutions simple — no over-engineering, no extra layers of abstraction
- Mobile-first on all UI work
- Never send `correct_answer` to the client under any circumstances
- Always use server-side timer logic (start_time from DB, not browser)
- Update the phase checklist when a phase completes
- Keep Tailwind classes clean and consistent
- Do not add features not listed in this document without confirming with the user
- When in doubt, do less and ask

---

## Session Handoff Template

Paste this at the start of every new Claude Code session:

```
Project: Applicant Logical Test
Read CLAUDE.md first: /Users/VP_1/Desktop/_Claude Code/iq_test/CLAUDE.md
Last completed phase: [PHASE NAME]
Currently working on: [PHASE NAME]
Last thing done: [ONE LINE DESCRIPTION]
Next task: [ONE LINE DESCRIPTION]
Known issues or blockers: [OR "none"]
```
