# Session Handoff

Copy and paste this at the START of every new Claude Code session for this project.

---

```
Project: Applicant Logical Test
Read CLAUDE.md first: /Users/VP_1/Desktop/_Claude Code/iq_test/CLAUDE.md
Last completed phase: Phase 10 — Deployment ✅
Currently working on: Post-launch bug fixes
Last thing done: Deployed to Vercel. Fixed 3 TypeScript build errors (implicit any on
  cookiesToSet in signout/route.ts, server.ts, middleware.ts; and null on start_time in
  time-remaining/route.ts). Fixed logout 307→303 redirect. Identified missing Supabase
  Storage "logos" bucket (user creating it manually in Supabase dashboard).
Known issues or blockers: none — user is testing the live site and reporting bugs as found
```

---

## Live Site

- **GitHub repo:** https://github.com/vinsanitycoder/iq-test
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

## Key facts for bug fixing

- Stack: Next.js 15 (App Router) + Supabase + Tailwind + Vercel
- HR login: `/hr/login` — username `fynlo`
- Applicant test: root URL `/`
- All API routes are in `src/app/api/`
- HR dashboard components: `src/app/hr/`
- Applicant flow components: `src/app/test/` and `src/app/page.tsx`
- Supabase Storage bucket for logos: `logos` (public bucket — must exist in Supabase dashboard)
- Env vars needed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Correct answers are NEVER sent to the browser — all scoring is server-side
- Timer is server-side (start_time from DB, not browser)

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
