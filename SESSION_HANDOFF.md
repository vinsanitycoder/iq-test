# Session Handoff

Copy and paste this at the START of every new Claude Code session for this project.

---

```
Project: Applicant Logical Test
Read CLAUDE.md first: /Users/VP_1/Desktop/_Claude Code/iq_test/CLAUDE.md
Last completed phase: Phase 10 — Deployment + all post-launch features ✅
Currently working on: nothing — platform is complete and live
Last thing done: Company logo used as browser favicon with dynamic page title from settings.
  All post-launch features shipped: logout fix, logo upload/remove, password eye toggle,
  dynamic nav company name, delete applicant, bulk select/delete/status change, stale UI
  fix, change password, multi-admin user management, custom domain, favicon.
Known issues or blockers: none
```

---

## Live Site

- **GitHub repo:** https://github.com/vinsanitycoder/iq-test
- **Custom domain:** cognitivetest.fynloapps.com (Cloudflare DNS → Vercel)
- **Deployed on:** Vercel (auto-deploys on every push to main)
- To deploy a fix: edit the file → `git add` → `git commit` → `git push` → Vercel redeploys automatically

## How to deploy a fix

Run these in Terminal from the project folder:
```
cd "/Users/VP_1/Desktop/_Claude Code/iq_test"
git add <file>
git commit -m "Fix: description"
git push
```

## Key facts

- Stack: Next.js 15 (App Router) + Supabase + Tailwind + Vercel
- HR login: `/hr/login`
- Applicant test: root URL `/` (also `cognitivetest.fynloapps.com`)
- All API routes: `src/app/api/`
- HR dashboard pages: `src/app/hr/`
- HR components: `src/components/hr/`
- Applicant flow: `src/app/test/` and `src/app/page.tsx`
- Supabase Storage bucket for logos: `logos` (public bucket)
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Correct answers are NEVER sent to the browser — all scoring is server-side
- Timer is server-side (start_time from DB, not browser)
- Admin role: stored in Supabase `app_metadata.role = 'admin'` — multiple admins supported
- Stale UI rule: all HR GET routes send `Cache-Control: no-store`; HR live-data pages use `force-dynamic`; client fetches use `cache: 'no-store'`; prop→state components use `useEffect` to sync

## HR Admin API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/hr/admin/users` | GET | List all HR users |
| `/api/hr/admin/users` | POST | Create user (returns temp password `Welcome@XXXX`) |
| `/api/hr/admin/users` | PATCH | Grant/revoke admin role |
| `/api/hr/admin/users` | DELETE | Delete user (guards self + last admin) |
| `/api/hr/admin/reset-password` | POST | Reset a user's password (returns new `Welcome@XXXX`) |
| `/api/hr/change-password` | POST | Change own password (verifies current first) |
| `/api/hr/bulk-delete` | DELETE | Delete multiple applicants by ID array |
| `/api/hr/bulk-status` | PATCH | Update status for multiple results |
| `/api/hr/results` | GET | All results for dashboard (no-store) |

## Phase status

| Phase | Name | Status |
|---|---|---|
| Phase 1 | Discovery & Final Decisions | ✅ |
| Phase 2 | Foundation & CLAUDE.md | ✅ |
| Phase 3 | Design | ✅ |
| Phase 4 | Database & Backend Setup | ✅ |
| Phase 5 | Question Bank | ✅ |
| Phase 6 | Applicant Test Build | ✅ |
| Phase 7 | Scoring Engine | ✅ |
| Phase 8 | HR Dashboard | ✅ |
| Phase 9 | Testing & QA | ✅ |
| Phase 10 | Deployment | ✅ |
| Post-launch | Bug fixes & feature additions | ✅ |

## Post-launch features shipped (all complete)

| Feature | Files changed |
|---|---|
| Logout fix (307→303) | `api/hr/signout/route.ts` |
| Logo upload (Supabase Storage bucket) | `api/hr/settings/logo/route.ts` |
| Remove logo button | `api/hr/settings/logo/route.ts`, `hr/settings/page.tsx` |
| Password eye toggle on login | `hr/login/page.tsx` |
| Dynamic company name in nav | `components/hr/HRNav.tsx` (client, fetches `/api/settings`) |
| Delete applicant from dashboard | `components/hr/RowDeleteButton.tsx` (custom modal) |
| Bulk select / bulk delete / bulk status | `components/hr/DashboardTable.tsx` (new), `api/hr/bulk-delete`, `api/hr/bulk-status` |
| Stale UI systematic fix | Cache-Control headers + force-dynamic + useEffect sync across all HR routes |
| Change own password | `api/hr/change-password/route.ts` (new), `hr/settings/page.tsx` |
| Multi-admin user management | `api/hr/admin/users/route.ts` (new), `api/hr/admin/reset-password/route.ts` (new), `components/hr/UserManagement.tsx` (new) |
| Custom domain | cognitivetest.fynloapps.com via Cloudflare CNAME → Vercel |
| Favicon + dynamic page title | `app/layout.tsx` — `generateMetadata` fetches settings from Supabase |
