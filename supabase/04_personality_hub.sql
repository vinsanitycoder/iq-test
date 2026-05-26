-- ============================================================
-- Personality Hub Schema Migration
-- Run AFTER 01_schema.sql, 02_rls.sql, 03_questions.sql
-- Adds: invites, personality_sessions, personality_answers, personality_results
-- Plus 3 new nullable columns on applicants
-- ============================================================

-- ── Extend applicants with HR-editable fields ────────────────

alter table applicants
  add column if not exists role_applied_for     text,
  add column if not exists resume_url           text,
  add column if not exists interview_video_url  text;

-- URL validation for resume_url and interview_video_url
alter table applicants
  add constraint applicants_resume_url_format
    check (resume_url is null or resume_url ~* '^https?://'),
  add constraint applicants_interview_video_url_format
    check (interview_video_url is null or interview_video_url ~* '^https?://');

-- ── invites ──────────────────────────────────────────────────

create table invites (
  id                  uuid primary key default uuid_generate_v4(),
  applicant_id        uuid not null references applicants(id) on delete cascade,
  token_hash          text not null unique,
  hash_algorithm      text not null default 'sha256',
  created_at          timestamptz not null default now(),
  expires_at          timestamptz not null,
  first_accessed_at   timestamptz,
  email_sent_at       timestamptz,
  status              text not null default 'pending'
    check (status in ('pending', 'accessed', 'revoked')),
  constraint invites_expires_after_created check (expires_at > created_at)
);

create index idx_invites_applicant_id on invites(applicant_id);

-- ── personality_sessions ─────────────────────────────────────

create table personality_sessions (
  id            uuid primary key default uuid_generate_v4(),
  invite_id     uuid not null unique references invites(id) on delete cascade,
  start_time    timestamptz,
  end_time      timestamptz,
  status        text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed', 'expired')),
  tab_switches  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint personality_sessions_end_after_start
    check (end_time is null or start_time is null or end_time > start_time),
  constraint personality_sessions_duration_within_limit
    check (end_time is null or start_time is null
           or extract(epoch from (end_time - start_time)) <= 2760)
);

create index idx_personality_sessions_invite_id on personality_sessions(invite_id);

-- updated_at trigger for personality_sessions
create or replace function update_personality_sessions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger personality_sessions_updated_at
  before update on personality_sessions
  for each row execute function update_personality_sessions_updated_at();

-- ── personality_answers ──────────────────────────────────────

create table personality_answers (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null references personality_sessions(id) on delete cascade,
  question_index  integer not null check (question_index between 0 and 99),
  dimension       text not null check (dimension in ('EI', 'SN', 'TF', 'JP')),
  question_type   text not null check (question_type in ('F', 'R', 'S')),
  raw_score       integer not null check (raw_score between 1 and 5),
  answered_at     timestamptz not null default now(),
  unique (session_id, question_index)
);

-- ── personality_results ──────────────────────────────────────

create table personality_results (
  id                          uuid primary key default uuid_generate_v4(),
  session_id                  uuid not null unique references personality_sessions(id) on delete cascade,
  applicant_id                uuid not null references applicants(id) on delete cascade,
  ei_score                    numeric(5,2) not null check (ei_score between 0 and 100),
  sn_score                    numeric(5,2) not null check (sn_score between 0 and 100),
  tf_score                    numeric(5,2) not null check (tf_score between 0 and 100),
  jp_score                    numeric(5,2) not null check (jp_score between 0 and 100),
  ei_label                    text not null check (ei_label in ('E', 'I')),
  sn_label                    text not null check (sn_label in ('S', 'N')),
  tf_label                    text not null check (tf_label in ('T', 'F')),
  jp_label                    text not null check (jp_label in ('J', 'P')),
  type_code                   text not null check (type_code in (
    'ISTJ','ISFJ','INFJ','INTJ',
    'ISTP','ISFP','INFP','INTP',
    'ESTP','ESFP','ENFP','ENTP',
    'ESTJ','ESFJ','ENFJ','ENTJ'
  )),
  total_answers_at_scoring    integer not null,
  status                      text not null default 'pending_review'
    check (status in ('pending_review', 'reviewed', 'shortlisted', 'rejected', 'incomplete')),
  reviewed_at                 timestamptz,
  reviewed_by                 uuid references auth.users(id),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  constraint personality_results_review_consistency
    check ((status in ('reviewed', 'shortlisted', 'rejected') and reviewed_at is not null)
           or (status in ('pending_review', 'incomplete') and reviewed_at is null))
);

create index idx_personality_results_applicant_id on personality_results(applicant_id);

-- updated_at trigger for personality_results
create or replace function update_personality_results_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger personality_results_updated_at
  before update on personality_results
  for each row execute function update_personality_results_updated_at();

-- ── RLS: deny-all for anon/authenticated on all four new tables ──
-- Service role (used in API routes) bypasses RLS

alter table invites              enable row level security;
alter table personality_sessions enable row level security;
alter table personality_answers  enable row level security;
alter table personality_results  enable row level security;

create policy "invites: deny all"
  on invites for all to anon, authenticated
  using (false) with check (false);

create policy "personality_sessions: deny all"
  on personality_sessions for all to anon, authenticated
  using (false) with check (false);

create policy "personality_answers: deny all"
  on personality_answers for all to anon, authenticated
  using (false) with check (false);

create policy "personality_results: deny all"
  on personality_results for all to anon, authenticated
  using (false) with check (false);
