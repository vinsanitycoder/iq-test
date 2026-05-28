-- ============================================================
-- Auto-Invite Email Body — settings column
-- Run AFTER 06_auto_invite_setting.sql.
--
-- Adds one optional column to the settings table:
--   auto_invite_email_body — HR-editable email body for auto-sent
--                            personality invites. NULL means "use the
--                            built-in template default" (current
--                            behaviour, unchanged).
--
-- Additive, nullable, no default — completely safe. The auto-invite
-- code falls back to the built-in template when this column is null
-- or empty, preserving today's behaviour.
-- Wrapped in a transaction for atomic apply/rollback.
-- ============================================================

begin;

alter table settings
  add column if not exists auto_invite_email_body text;

commit;
