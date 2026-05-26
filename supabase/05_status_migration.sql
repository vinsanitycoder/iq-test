-- ============================================================
-- One-time data migration: sync IQ result statuses → applicant.status
--
-- Run this AFTER 04_personality_hub.sql but BEFORE deploying the new
-- personality hub code to production.
--
-- Background:
--   The original IQ-only dashboard stored review status on results.status
--   (per IQ result row). The new personality hub dashboard uses a single
--   applicant-level status on applicants.status (which 04_personality_hub.sql
--   added with default 'pending_review').
--   This script copies any non-default IQ statuses (reviewed/shortlisted/rejected)
--   over to the new applicants.status column so HR's existing categorizations
--   are preserved when the new code goes live.
--
-- Idempotency:
--   Only updates applicants whose status is still the default 'pending_review'.
--   Re-running this script after HR has started using the new dashboard is
--   safe — it will not overwrite any updates HR has made.
--
-- Wrapped in a transaction so a mid-run failure can't leave statuses in
-- an inconsistent state.
-- ============================================================

begin;

with latest_iq_status as (
  select distinct on (applicant_id)
    applicant_id,
    status
  from results
  where status in ('reviewed', 'shortlisted', 'rejected')
  order by applicant_id, created_at desc
)
update applicants a
set status = liq.status
from latest_iq_status liq
where liq.applicant_id = a.id
  and a.status = 'pending_review';

commit;

-- Report rows updated (run this select after the update to verify)
select status, count(*) as applicant_count
from applicants
group by status
order by status;
