-- ============================================================
-- Applicant Logical Test — Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────

create type question_type as enum (
  'pattern_recognition',
  'numerical',
  'verbal_analogy',
  'deductive',
  'logical_sequence'
);

create type question_difficulty as enum ('easy', 'medium', 'hard');

create type session_status as enum ('in_progress', 'completed', 'expired');

create type result_status as enum (
  'pending_review',
  'reviewed',
  'shortlisted',
  'rejected'
);

-- ── Tables ───────────────────────────────────────────────────

create table settings (
  id                  uuid primary key default uuid_generate_v4(),
  company_name        text not null default 'Fynlo',
  company_logo_url    text,
  test_name           text not null default 'Applicant Logical Test',
  welcome_headline    text not null default 'Let''s see how your mind works',
  welcome_body        text,
  completion_message  text,
  confidentiality_text text,
  whats_next_text     text,
  updated_at          timestamptz not null default now()
);

create table questions (
  id              uuid primary key default uuid_generate_v4(),
  type            question_type not null,
  difficulty      question_difficulty not null,
  question_text   text not null,
  option_a        text not null,
  option_b        text not null,
  option_c        text not null,
  option_d        text not null,
  correct_answer  text not null check (correct_answer in ('a', 'b', 'c', 'd')),
  svg_content     text,
  is_practice     boolean not null default false,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create table applicants (
  id          uuid primary key default uuid_generate_v4(),
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  source      text not null default 'direct_link',
  created_at  timestamptz not null default now()
);

create table test_sessions (
  id                   uuid primary key default uuid_generate_v4(),
  applicant_id         uuid not null references applicants(id) on delete cascade,
  start_time           timestamptz,
  end_time             timestamptz,
  time_taken_seconds   integer,
  status               session_status not null default 'in_progress',
  tab_switches         integer not null default 0,
  created_at           timestamptz not null default now()
);

create table answers (
  id               uuid primary key default uuid_generate_v4(),
  session_id       uuid not null references test_sessions(id) on delete cascade,
  question_id      uuid not null references questions(id) on delete cascade,
  selected_answer  text check (selected_answer in ('a', 'b', 'c', 'd')),
  is_correct       boolean,
  answered_at      timestamptz not null default now(),
  unique (session_id, question_id)
);

create table results (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null references test_sessions(id) on delete cascade,
  applicant_id    uuid not null references applicants(id) on delete cascade,
  raw_score       integer not null default 0,
  weighted_score  decimal(10, 2) not null default 0,
  iq_score        integer not null default 0,
  percentile      integer not null default 0,
  iq_label        text not null default 'Average',
  status          result_status not null default 'pending_review',
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);

create table indeed_imports (
  id            uuid primary key default uuid_generate_v4(),
  applicant_id  uuid not null references applicants(id) on delete cascade,
  imported_at   timestamptz not null default now(),
  source_file   text
);

-- ── Indexes ──────────────────────────────────────────────────

create index idx_test_sessions_applicant_id on test_sessions(applicant_id);
create index idx_answers_session_id          on answers(session_id);
create index idx_results_session_id          on results(session_id);
create index idx_results_applicant_id        on results(applicant_id);
create index idx_results_status              on results(status);
create index idx_results_created_at          on results(created_at desc);

-- ── Trigger: auto-update settings.updated_at ─────────────────

create or replace function update_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger settings_updated_at
  before update on settings
  for each row execute function update_settings_updated_at();

-- ── Seed: default settings row ───────────────────────────────

insert into settings (
  company_name,
  test_name,
  welcome_headline,
  welcome_body,
  completion_message,
  confidentiality_text,
  whats_next_text
) values (
  'Fynlo',
  'Applicant Logical Test',
  'Let''s see how your mind works',
  'This short test measures logical reasoning and problem-solving ability. There are no trick questions — just think carefully and do your best.',
  'Your test has been successfully submitted. Thank you for taking the time to complete it.',
  'Your results are kept strictly confidential and will only be reviewed by our hiring team.',
  'Our team will be in touch with you directly regarding the next steps in the process.'
);
