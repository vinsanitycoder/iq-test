# HR Assessment Hub — Project Context

## What This Is
A web-based hiring assessment platform with two independent tests:

1. **IQ / Logical Reasoning Test** — fully live and unchanged. 40 questions, 25 minutes, shared public link. All existing code and database tables are locked — do not modify.
2. **Personality Assessment** — in development (feature branch: `feature/personality-hub`). 100-question MBTI-style test (16 types), invite-only via unique secure links sent by HR. Completely separate from the IQ test at the data layer.

HR reviews both results per applicant via a unified private dashboard and can export a combined PDF report per applicant or a bulk Excel export.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Auth:** Supabase Auth (HR login only)
- **Email:** Resend (invite emails via React Email templates, fynloapps.com domain verified)
- **File Storage:** Supabase Storage (company logo)
- **PDF Export:** @react-pdf/renderer (serverless-compatible)
- **Excel Export:** xlsx / ExcelJS
- **Pause Prevention:** Vercel cron job pings Supabase weekly (prevents free tier pause)

## Git Strategy
- `main` — production branch, auto-deploys to cognitivetest.fynloapps.com
- `feature/personality-hub` — all personality test work; Vercel preview URL points to staging Supabase
- Never commit personality test code directly to main until fully QA'd on staging

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

### Applicants (IQ test)
- Access via a single shared URL (no account, no login)
- Enter their own name and email at the start
- Complete the timed test
- Never see their score
- Duplicate emails are allowed

### Applicants (Personality test)
- Access via a unique individual invite link sent by HR: `/invite/[token]`
- Token validated server-side (SHA-256 hash match + expiry check)
- httpOnly cookie (`personality_session_token`) set on first valid access
- Cookie validated on every subsequent request — not just middleware (CVE-2025-29927)
- Never see their results
- Can return to complete the test on a different day/device (within deadline)

### HR
- Multiple admin accounts supported (role in Supabase `app_metadata.role = 'admin'`)
- Full dashboard: IQ results + personality results per applicant, invite management, export, settings
- Password stored via Supabase Auth — never plain text

---

## Applicant Flow — IQ Test (unchanged, live)

```
Single shared link → Welcome → Name & Email → Instructions → Practice (optional) →
Real Test (40q, 25min, one per screen, no back, skip allowed) → Completion Screen
```
Timer is server-side. Correct answers never sent to browser. No score shown to applicant.

## Applicant Flow — Personality Test (in development)

```
HR sends invite email (Resend)
        ↓
/invite/[token]
  - Token validated server-side (SHA-256 hash + expiry check)
  - httpOnly cookie set
  - Redirect to /personality/welcome
        ↓
/personality/welcome
  - Instructions: 100 questions, ~30–45 minutes, no right or wrong answers
  - Shows deadline
  - "Begin Test" button (timer does NOT start until this is clicked)
        ↓
/personality/test
  - 10 questions per page, 10 pages (100 questions total)
  - Bipolar scale: Statement A ← 1 2 3 4 5 → Statement B
  - Scale labels: Strongly Agree | Agree | Neutral | Disagree | Strongly Disagree
  - No skip button — all questions required
  - No back button
  - Answers saved per page on Next click
  - Tab-switch events logged
  - 45-minute hard limit — auto-submits at 0:00
  - Can resume if browser closes (recalculates remaining time from start_time)
        ↓
/personality/complete
  - Thank you screen, no results shown
        ↓
(Error states)
/personality/expired  — link past deadline or session time exceeded
/personality/invalid  — token not found or revoked
```

---

## IQ Test Structure (unchanged)

| Type | Questions | Format |
|---|---|---|
| Pattern Recognition | 12 | Visual patterns (Unicode symbols) |
| Numerical Reasoning | 10 | Number problems |
| Verbal Reasoning | 5 | Word/analogy reasoning |
| Deductive Reasoning | 4 | Logic/deduction problems |
| Logical Sequences | 9 | Number or pattern sequences |
| **Total** | **40** | |

- Up to 5 unscored practice questions (one per type)
- Questions randomised per session
- One question per screen, multiple choice (A/B/C/D)
- No back, skip allowed, skipped = 0 points

## Personality Test Structure

| Dimension | Code | Questions | Poles |
|---|---|---|---|
| Extraversion / Introversion | EI | 25 | E ↔ I |
| Sensing / Intuition | SN | 25 | S ↔ N |
| Thinking / Feeling | TF | 25 | T ↔ F |
| Judging / Perceiving | JP | 25 | J ↔ P |
| **Total** | | **100** | |

- Questions hardcoded in `/src/lib/personality/questions.ts` — not stored in DB
- Each question has: `index` (0–99, permanent), `dimension`, `type` (F/R/S), `leftPole`, `rightPole`, `scenario?`
- Question types: **F** (forward), **R** (reversed — scored inverted), **S** (situational scenario)
- 10 questions per page, 10 pages
- Bipolar 1–5 scale — no skip allowed
- Questions presented in randomised order per session (canonical index always stored)
- Minimum 60 questions answered to generate a result — below threshold → `incomplete`

### Scoring Formula
```
For F and S questions: dimension_sum += raw_score
For R questions:       dimension_sum += (6 − raw_score)
Dimension score (%) = (dimension_sum − 25) / 100 × 100
  Range: 0.0 (fully first pole) → 100.0 (fully second pole)
  Label: score ≥ 50 → second pole (I/N/F/P)
         score < 50 → first pole (E/S/T/J)
         score = 50 exactly → first pole (tiebreaker)
```

### 16 Types (with result card names)
ISTJ · Dependable | ISFJ · Supporter | INFJ · Counsellor | INTJ · Strategist
ISTP · Problem-Solver | ISFP · Craftsperson | INFP · Idealist | INTP · Analyst
ESTP · Doer | ESFP · Energiser | ENFP · Champion | ENTP · Innovator
ESTJ · Organiser | ESFJ · Connector | ENFJ · Mentor | ENTJ · Director

Full type cards (description, strengths, watch-outs) in `/src/lib/personality/types.ts`

---

## IQ Scoring System (unchanged)

- **Difficulty weighting:** Easy = 1pt, Medium = 2pts, Hard = 3pts
- **Raw score:** Sum of weighted correct answers
- **IQ conversion:** Normalised to mean 100, SD 15
- **Scoring is server-side only — correct answers NEVER sent to browser**

| IQ Score | Label | Percentile |
|---|---|---|
| 130+ | Superior | Top 2% |
| 115–129 | Above Average | Top 16% |
| 100–114 | High Average | Above 50% |
| 85–99 | Average | Middle range |
| 70–84 | Low Average | Below average |
| Below 70 | Below Average | Bottom range |

## Personality Scoring System
- Server-side only — scores never sent to browser
- `dimension` and `question_type` always derived from `question_index` server-side — never accepted from client
- See formula in Test Structure section above
- Scoring engine: `/src/lib/personality/scoring.ts`

---

## Database Schema

### Existing tables — IQ test (DO NOT MODIFY)

`settings` · `questions` · `test_sessions` · `answers` · `results` · `indeed_imports`

See original schema definitions — these are live and locked.

### `applicants` — 3 new nullable columns added (personality hub)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| first_name | text | |
| last_name | text | |
| email | text | Duplicates allowed |
| source | text | Default: "direct_link" |
| created_at | timestamp | |
| role_applied_for | text | Nullable — HR-fillable |
| resume_url | text | Nullable — HR-fillable, validated `^https?://` |
| interview_video_url | text | Nullable — HR-fillable, validated `^https?://` |

### `invites` — NEW
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| applicant_id | uuid FK | → applicants ON DELETE CASCADE |
| token_hash | text UNIQUE | SHA-256 of 64-char hex token. Raw token never stored. |
| hash_algorithm | text | Default: 'sha256' — for future rotation |
| created_at | timestamptz | |
| expires_at | timestamptz NOT NULL | Always required. CHECK (expires_at > created_at) |
| first_accessed_at | timestamptz | Nullable |
| email_sent_at | timestamptz | Nullable — null means email not yet confirmed sent |
| status | text | 'pending' · 'accessed' · 'revoked'. 'expired' is computed (expires_at < now()), NOT stored |

Index: `idx_invites_applicant_id`

### `personality_sessions` — NEW
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| invite_id | uuid FK UNIQUE | → invites ON DELETE CASCADE. UNIQUE = one session per invite |
| start_time | timestamptz | Nullable — set when "Begin Test" clicked, not on link access |
| end_time | timestamptz | Nullable |
| status | text | 'not_started' · 'in_progress' · 'completed' · 'expired' |
| tab_switches | integer | Default: 0 |
| created_at | timestamptz | |
| updated_at | timestamptz | Updated on every status change |

Constraints: `end_after_start` · `duration_within_limit` (≤ 46 min buffer)
`applicant_id` NOT stored — derived via `invite → applicants` join
`time_taken_seconds` NOT stored — computed as `EXTRACT(EPOCH FROM (end_time - start_time))`
Indexes: `idx_personality_sessions_invite_id`

### `personality_answers` — NEW
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| session_id | uuid FK | → personality_sessions ON DELETE CASCADE |
| question_index | integer | 0–99 canonical position in hardcoded array. CHECK BETWEEN 0 AND 99 |
| dimension | text | 'EI'·'SN'·'TF'·'JP' — derived server-side, never from client |
| question_type | text | 'F'·'R'·'S' — derived server-side, never from client |
| raw_score | integer | 1–5 as submitted. Reversal applied at scoring time, not storage time |
| answered_at | timestamptz | |

UNIQUE: `(session_id, question_index)` — first answer wins on conflict (ON CONFLICT DO NOTHING)

### `personality_results` — NEW
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| session_id | uuid FK UNIQUE | → personality_sessions ON DELETE CASCADE |
| applicant_id | uuid FK | → applicants ON DELETE CASCADE. Derived server-side, never caller-supplied |
| ei_score | numeric(5,2) | 0–100. CHECK BETWEEN 0 AND 100 |
| sn_score | numeric(5,2) | 0–100 |
| tf_score | numeric(5,2) | 0–100 |
| jp_score | numeric(5,2) | 0–100 |
| ei_label | text | CHECK IN ('E','I') |
| sn_label | text | CHECK IN ('S','N') |
| tf_label | text | CHECK IN ('T','F') |
| jp_label | text | CHECK IN ('J','P') |
| type_code | text | CHECK IN (all 16 valid codes) |
| total_answers_at_scoring | integer | Audit: was 60-question minimum met? |
| status | text | 'pending_review'·'reviewed'·'shortlisted'·'rejected'·'incomplete' |
| reviewed_at | timestamptz | Nullable. Consistent with status via CHECK constraint |
| reviewed_by | uuid FK | → auth.users(id). Who made the HR decision |
| created_at | timestamptz | |
| updated_at | timestamptz | |

`type_name` NOT stored — derived at display time from `type_code` via TypeScript constant map
Index: `idx_personality_results_applicant_id`

### RLS — all new tables
All four new tables: RLS enabled, deny-all policy for `anon` and `authenticated` (USING false WITH CHECK false). Service role (used in all API routes) bypasses RLS.

---

## Security Rules — Non-Negotiable

### IQ test (existing — unchanged)
1. Correct answers NEVER reach the browser — server-side scoring only
2. IQ timer is server-side — remaining time = 25min − (now − start_time from DB)
3. RLS enabled on all tables
4. Candidates can only read/write their own session (by session ID in URL)
5. HR dashboard uses Supabase Auth server-side session only
6. HR password stored via Supabase Auth — never plain text
7. Service role key only used in server-side API routes — never in client code

### Personality test (new — additional rules)
8. **Invite token:** `crypto.randomBytes(32).toString('hex')` → 64-char hex token. Only SHA-256 hash stored in DB. Raw token never logged or stored anywhere.
9. **Token validation in API routes only** — never rely on middleware alone (CVE-2025-29927). Every personality API route must validate the cookie independently.
10. **Cookie:** httpOnly, SameSite=Lax, domain=.fynloapps.com, 7-day expiry. Set on first valid invite link access.
11. **Expiry always computed live:** `expires_at < now()` — never trust stored `status` field alone.
12. **`dimension` and `question_type` always derived server-side** from `question_index` using the hardcoded question array. Never accepted from client.
13. **`applicant_id` in results always derived server-side** via `session → invite → applicants` join. Never accepted from caller.
14. **Personality scores never sent to browser** — same rule as IQ correct answers.

---

## HR Dashboard Features

### Existing (IQ test — live)
- Applicant list: name, email, IQ score, label, percentile, time taken, date, status
- Bulk select, bulk status change, bulk delete
- Individual applicant detail view (currently result-ID URL — being reworked)
- Tab-switch flag per applicant
- Delete applicant record
- CSV export
- Indeed CSV import
- Settings: company name, logo, test name, editable text fields
- User management (admin only): create/reset/delete HR users

### New (personality hub — in development)
- Dashboard table gains "Personality" status column: Not invited · Invited · In Progress · Completed · Incomplete
- "Send Personality Invite" button per applicant row → modal (set deadline, preview email, send)
- **Applicant detail page reworked to applicant-centric URL:** `/hr/applicant/[applicantId]`
  - Old result-ID URLs redirect to new applicant-ID URLs
  - Shows: applicant info, IQ result card, personality result card, invite history
  - Personality card: four dimension percentage bars, type code badge, type name, full type card (description, strengths, watch-outs)
  - HR-editable inline fields: role applied for, resume URL, interview video URL
- Invite history panel: each invite with created date, deadline, status, resend/revoke actions
- Personality result status dropdown (same pattern as IQ)
- **PDF export per applicant:** combined IQ + personality report, Fynlo-branded
- **Excel bulk export:** all applicants, both test results, all columns

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
| Personality: invite cookie lost (incognito, different device) | Medium | Re-validate from URL token on every page load |
| Personality: session stuck in_progress after browser close | Medium | Resume via invite link, recalculate remaining time from start_time |
| Personality: duplicate session race condition | Low | UNIQUE on invite_id catches it at DB layer |
| Personality: exact 50.0 dimension score | Low | Tiebreaker rule: first pole wins (E/S/T/J). Use strict < 50 for second pole |
| Personality: answers after session completed | Low | API route must check session.status = 'in_progress' before accepting |
| Resend email delivery failure | Low | email_sent_at stays null — HR can see and resend |

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

### IQ Test (complete)
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
- [x] Post-launch: Bug fixes & feature additions

### Personality Hub (in progress — branch: feature/personality-hub)
- [x] Research: legal (MBTI trademark), question sources, email provider, token security
- [x] Architecture decisions: two separate links, integrated HR dashboard, individual invites
- [x] 100 questions written and approved (25 per dimension, mix of F/R/S types)
- [x] 16 type result cards written and approved
- [x] GPS schema review — all issues identified and resolved
- [x] Final schema approved
- [x] Full phase plan approved
- [x] Phase 0a: Staging environment setup (Supabase staging project + Vercel preview branch + Resend domain)
- [x] Phase 0b: Schema migration on staging
- [x] Phase 1: Question bank TypeScript files + scoring engine
- [x] Phase 2: Invite system backend + Resend email
- [x] Phase 3: Personality test applicant flow
- [x] Phase 4: Scoring engine integration
- [x] Phase 5: HR dashboard extensions
- [x] Phase 6: Invite management UI
- [ ] Phase 7: PDF + Excel export
- [ ] Phase 8: QA on staging
- [ ] Phase 9: Production deployment

Update the checklist above when each phase is complete.

---

## Rules for Claude
- Read this file at the start of every session before doing anything
- Keep solutions simple — no over-engineering, no extra layers of abstraction
- Mobile-first on all UI work
- Never send `correct_answer` to the client (IQ) or personality scores to the client
- Always use server-side timer logic (start_time from DB, not browser) for both tests
- Update the phase checklist when a phase completes
- Keep Tailwind classes clean and consistent with the existing design system
- Do not add features not listed in this document without confirming with the user
- When in doubt, do less and ask
- **Never touch IQ test tables or routes** while building the personality hub
- **Always derive `dimension`, `question_type`, and `applicant_id` server-side** — never accept from client
- **Always check `expires_at < now()` live** — never trust stored invite status for expiry
- **All personality API routes validate the httpOnly cookie independently** — middleware is not sufficient

---

## Personality-Specific Files

### Built (Phases 1–6)

| File | Purpose |
|---|---|
| `src/lib/personality/questions.ts` | All 100 hardcoded questions with index, dimension, type, poles |
| `src/lib/personality/types.ts` | 16 type result cards keyed by type code |
| `src/lib/personality/scoring.ts` | Scoring engine — dimension percentages, type code determination |
| `src/lib/personality/invite-token.ts` | Token generation + SHA-256 hashing |
| `src/lib/personality/session-auth.ts` | `validatePersonalityCookie()` — used in every personality API route |
| `src/app/invite/[token]/route.ts` | Token validation, cookie set, redirect (route handler, not page) |
| `src/app/personality/welcome/page.tsx` | Instructions page |
| `src/app/personality/test/page.tsx` | 10-question-per-page test UI with server-side timer |
| `src/app/personality/complete/page.tsx` | Thank you screen |
| `src/app/personality/expired/page.tsx` | Link/session expired error |
| `src/app/personality/invalid/page.tsx` | Token not found or revoked error |
| `src/app/api/hr/invites/route.ts` | POST create invite + send email, GET list for applicant (admin only) |
| `src/app/api/hr/invites/[id]/revoke/route.ts` | PATCH revoke invite (admin only) |
| `src/app/api/personality/session/route.ts` | GET session state + answered question indexes |
| `src/app/api/personality/session/begin/route.ts` | POST create/resume session, set start_time |
| `src/app/api/personality/session/complete/route.ts` | POST mark completed, score answers, insert personality_results |
| `src/app/api/personality/session/tab-switch/route.ts` | POST increment tab_switches counter |
| `src/app/api/personality/answers/route.ts` | POST save a page of answers |
| `src/app/api/hr/applicant/[id]/route.ts` | GET full applicant data (both tests) + PATCH HR-editable fields |
| `src/app/api/hr/personality-result/[id]/route.ts` | PATCH personality result status |
| `src/components/hr/DimensionBar.tsx` | Visual E↔I / S↔N / T↔F / J↔P percentage bar |
| `src/components/hr/InvitePanel.tsx` | Invite history list + send invite modal (admin only) |
| `src/emails/InviteEmail.tsx` | React Email template for invite |

### Still to build (Phases 7–9)

| File | Purpose |
|---|---|
| `src/app/api/hr/applicant/[id]/pdf/route.ts` | Generate combined IQ + personality PDF report |
| `src/app/api/hr/export/excel/route.ts` | Bulk Excel export — all applicants, both test results |

## Staging Environment Setup

The staging Supabase is a **separate** project from production. When setting up a fresh staging environment, run these SQL files in order via the Supabase SQL Editor:

1. `supabase/01_schema.sql` — IQ test tables + settings seed row
2. `supabase/02_rls.sql` — Row Level Security policies for IQ tables
3. `supabase/03_questions.sql` — 245 IQ questions (symbol-based, exported from production). Upserts by UUID — safe to re-run.
4. `supabase/04_personality_hub.sql` — Personality hub tables + RLS + applicants.status column (idempotent, safe to re-run)

**Skip files that have already been run** — if you get "relation already exists", the table is there and you can move on.

Vercel Preview environment variables required (must point to staging Supabase, not production):
- `NEXT_PUBLIC_SUPABASE_URL` — staging project URL (e.g. `https://xxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — staging anon key
- `SUPABASE_SERVICE_ROLE_KEY` — staging service role key
- `NEXT_PUBLIC_APP_URL` — the Vercel preview URL for the feature branch
- `RESEND_API_KEY` — Resend API key (same as production is fine)

To create an admin HR user on staging: Auth → Users → Add user, then run:
```sql
UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb WHERE email = 'your@email.com';
UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'your@email.com';
```

---

## Dashboard UX — Key Design Decisions (locked this session)

- **Single applicant-level status** — `applicants.status` column (pending_review / reviewed / shortlisted / rejected). Replaces separate IQ status and personality status dropdowns everywhere.
- **Dashboard Personality column** — shows "Invite" button (admin only) when not_invited; shows status badge otherwise.
- **Send Invite modal** — lives inline in DashboardTable, triggered from the Personality column button.
- **Applicant detail page** — read-only. No status dropdowns. IQ card, personality card, editable fields (role/resume/video), invite history panel, delete button.
- **InvitePanel** stays on detail page for invite history + Resend/Revoke actions.

---

## Session Handoff Template

Paste this at the start of every new Claude Code session:

```
Project: HR Assessment Hub (IQ + Personality)
Read CLAUDE.md first: /Users/VP_1/Desktop/_Claude Code/iq_test/CLAUDE.md
Active branch: feature/personality-hub
Last completed phase: Phase 6 — Invite management UI ✅
Currently working on: Staging SQL migrations + staging test checklist — then Phase 7
Last thing done: Major dashboard UX redesign this session:
  1. 03_questions.sql rebuilt from production CSV export (245 symbol-based questions, no SVG)
  2. 04_personality_hub.sql updated — adds applicants.status column (pending_review/reviewed/shortlisted/rejected)
  3. Single applicant-level status replaces separate IQ + personality statuses
  4. DashboardTable: Personality badge → Invite button for admin; StatusDropdown now uses applicantId
  5. /api/hr/status and /api/hr/bulk-status now patch applicants table (not results)
  6. Applicant detail page is now read-only (no status dropdowns, Review card removed)
  7. src/types/database.ts updated with new applicants columns
  Build passes (tsc --noEmit clean, npm run build clean).
Next task:
  STEP 1 — Run on staging Supabase SQL Editor (in order):
    a) supabase/03_questions.sql  (replaces old SVG questions with 245 symbol-based ones)
    b) supabase/04_personality_hub.sql  (adds applicants.status column — idempotent, safe to re-run)
  STEP 2 — Push branch → triggers new Vercel preview build
  STEP 3 — Work through staging test checklist below
  STEP 4 — Once all checklist items pass → Phase 7: PDF + Excel export
Known issues or blockers: none — code is built and type-checked, just needs SQL run + deploy
```

### Staging test checklist (updated for new dashboard UX)
Before starting Phase 7, confirm ALL of these pass on the Vercel preview URL:

**Dashboard table (/hr)**
- [ ] Personality column visible on large screen (hidden on small/mobile)
- [ ] Uninvited applicants: admin sees "Invite" teal button in Personality column
- [ ] Uninvited applicants: non-admin sees "Not invited" grey badge (no button)
- [ ] Clicking "Invite" button opens Send Invite modal with correct name/email, 7-day default deadline
- [ ] Sending invite: success message shown, personality badge updates to "Invited" after modal closes
- [ ] Invited/In Progress/Completed applicants show correct personality status badge
- [ ] Status column shows single applicant status (Pending/Reviewed/Shortlisted/Rejected)
- [ ] Changing status in dropdown saves and persists on reload
- [ ] Bulk status change updates all selected applicants' status
- [ ] Clicking applicant name goes to /hr/applicant/[applicantId] — UUID matches applicants table

**Applicant detail page (/hr/applicant/[applicantId])**
- [ ] Page loads with correct name and email
- [ ] IQ score card shows correctly — no status dropdown on this page
- [ ] Personality card shows correctly — no status dropdown on this page
- [ ] "No personality assessment yet" card shows for uninvited applicants
- [ ] Editable fields (Role, Resume URL, Video URL) — save and persist on reload
- [ ] Resume/video URL without https:// is rejected (field reverts)
- [ ] Old result-ID URL redirects to correct applicant-ID URL

**Invite panel on detail page (admin login required)**
- [ ] "Invite History" section visible, shows "No invites sent yet" for uninvited
- [ ] "Send Invite" button visible (admin only)
- [ ] After sending from dashboard, invite history shows in panel with "Pending" badge + email sent timestamp
- [ ] Revoke changes status to "Revoked", Revoke button disappears
- [ ] Non-admin login — entire Invite History section is hidden

**Personality result card (requires a completed test session)**
- [ ] Type card shows: 4-letter code, type name, dimension bars, description, strengths, watch-outs
- [ ] E-dominant bar fills from left; I-dominant fills from right (all 4 dimensions)
