-- ============================================================
-- Auto-send Personality Invite — settings columns
-- Run AFTER 04_personality_hub.sql.
--
-- Adds two columns to the settings table:
--   auto_send_personality_invite  — master on/off toggle (default OFF)
--   auto_invite_deadline_days     — how many days each auto-sent invite
--                                   stays valid (default 7, range 1–365)
--
-- Both columns are additive and have safe defaults — no existing
-- behaviour changes until HR turns the toggle on in /hr/settings.
-- Wrapped in a transaction so a partial failure rolls back cleanly.
-- ============================================================

begin;

alter table settings
  add column if not exists auto_send_personality_invite boolean not null default false,
  add column if not exists auto_invite_deadline_days    integer not null default 7;

do $$ begin
  alter table settings
    add constraint settings_auto_invite_deadline_days_range
      check (auto_invite_deadline_days between 1 and 365);
exception when duplicate_object then null;
end $$;

commit;
