-- ============================================================
-- Applicant Logical Test — Row Level Security
-- Run AFTER 01_schema.sql
-- ============================================================
-- Security model:
--   • All applicant writes + question reads go through Next.js API routes
--     using the SERVICE ROLE KEY (bypasses RLS entirely — server only)
--   • HR dashboard uses authenticated Supabase sessions (server-side)
--   • Anon key (public) can ONLY read settings — nothing sensitive
--   • correct_answer is never exposed: all question fetching is server-side
-- ============================================================

-- ── Enable RLS on every table ────────────────────────────────

alter table settings        enable row level security;
alter table questions       enable row level security;
alter table applicants      enable row level security;
alter table test_sessions   enable row level security;
alter table answers         enable row level security;
alter table results         enable row level security;
alter table indeed_imports  enable row level security;

-- ── settings ─────────────────────────────────────────────────
-- Public read (welcome screen needs company name, logo, test text)
-- Write requires authenticated HR session

create policy "settings: public read"
  on settings for select
  using (true);

create policy "settings: auth update"
  on settings for update
  using (auth.role() = 'authenticated');

-- ── questions ────────────────────────────────────────────────
-- No anon access — always fetched server-side so correct_answer never leaks

create policy "questions: auth only"
  on questions for all
  using (auth.role() = 'authenticated');

-- ── applicants ───────────────────────────────────────────────
-- No direct client access — created via API route with service role

create policy "applicants: auth only"
  on applicants for all
  using (auth.role() = 'authenticated');

-- ── test_sessions ────────────────────────────────────────────
-- No direct client access — managed server-side

create policy "test_sessions: auth only"
  on test_sessions for all
  using (auth.role() = 'authenticated');

-- ── answers ──────────────────────────────────────────────────
-- No direct client access — submitted via API route

create policy "answers: auth only"
  on answers for all
  using (auth.role() = 'authenticated');

-- ── results ──────────────────────────────────────────────────

create policy "results: auth only"
  on results for all
  using (auth.role() = 'authenticated');

-- ── indeed_imports ───────────────────────────────────────────

create policy "indeed_imports: auth only"
  on indeed_imports for all
  using (auth.role() = 'authenticated');
