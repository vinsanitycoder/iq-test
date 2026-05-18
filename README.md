# Applicant Logical Test

A free, open-source cognitive aptitude testing platform for hiring teams. Send applicants a single link — they complete a timed logical reasoning test — you review scored results in a private HR dashboard.

No per-seat fees. No third-party test provider. Fully hosted on your own accounts.

---

## What it does

**For applicants**
- Visit a single shared link (no account needed)
- Enter their name and email
- Complete up to 5 optional practice questions
- Take a 40-question, 25-minute timed test
- See a confirmation screen when done — no score shown

**For HR**
- Private dashboard at `/hr` (login required)
- See every applicant's IQ score, percentile, label, and time taken
- Change applicant status: Pending → Reviewed → Shortlisted / Rejected
- Select multiple applicants to bulk-update status or bulk-delete
- Click into any applicant for a full answer breakdown
- Export all results to CSV
- Import applicants from an Indeed CSV export
- Upload your company logo and customise all text without touching any code
- Add and manage multiple HR user accounts
- See how many times an applicant switched browser tabs during the test

**Scoring**
- 40 questions across 5 types: Pattern Recognition, Numerical, Verbal, Deductive, Logical Sequences
- Difficulty-weighted scoring (Easy = 1pt, Medium = 2pts, Hard = 3pts)
- Converted to an IQ-equivalent score (mean 100, SD 15)
- All scoring is server-side — correct answers are never sent to the browser

---

## Tech stack

Everything runs on free tiers:

| Service | Purpose | Free tier |
|---|---|---|
| [Vercel](https://vercel.com) | Hosting + deployment | Yes |
| [Supabase](https://supabase.com) | Database + auth + file storage | Yes |
| [GitHub](https://github.com) | Code repository | Yes |

You will need a free account on all three.

---

## Setup guide

This takes about 20–30 minutes. You do not need any coding experience.

### Step 1 — Fork the repository

1. Go to this project's GitHub page
2. Click the **Fork** button in the top right
3. This creates your own copy of the code under your GitHub account

---

### Step 2 — Set up Supabase

**Create a project**

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click **New project**
3. Give it a name (e.g. `applicant-test`), set a database password, choose a region close to you
4. Wait about a minute for it to finish setting up

**Run the database schema**

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/01_schema.sql` from this repo and paste the entire contents into the editor
4. Click **Run** — you should see "Success"
5. Click **New query** again
6. Open `supabase/02_rls.sql`, paste it in, click **Run**
7. Click **New query** again
8. Open `supabase/03_questions.sql`, paste it in, click **Run** — this loads all 194 test questions

**Create the logo storage bucket**

1. In Supabase, click **Storage** in the left sidebar
2. Click **New bucket**
3. Name it exactly: `logos`
4. Turn on **Public bucket** (so your logo URL is accessible)
5. Click **Save**

**Create your HR login account**

1. In Supabase, click **Authentication** → **Users** in the left sidebar
2. Click **Add user** → **Create new user**
3. Enter the email address you want to use to log in to the HR dashboard
4. Enter a password (you can change it later from the HR Settings page)
5. Click **Create user**

**Make yourself an admin**

1. Click **SQL Editor** → **New query**
2. Paste this and click **Run**:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb;
```

> This gives your account full admin access. You can add more HR users and grant them admin from the Settings page once you're logged in — you won't need to touch SQL again.

**Get your API keys**

1. In Supabase, click **Project Settings** (gear icon) → **API**
2. You will need three values — keep this tab open:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon / public key** (long string under "Project API keys")
   - **service_role key** (click "Reveal" — keep this secret)

---

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New** → **Project**
3. Find your forked repository and click **Import**
4. Before clicking Deploy, click **Environment Variables** and add these three:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |

5. Click **Deploy**
6. Wait about 2 minutes — Vercel builds and deploys automatically
7. When done, click the URL it gives you (e.g. `your-project.vercel.app`) — your app is live

**Test it works**

- Visit the root URL — you should see the welcome/test screen
- Visit `/hr/login` — log in with the email and password you created in Supabase
- You should see the HR dashboard

---

### Step 4 (optional) — Add a custom domain

If you own a domain and want the app at a custom URL (e.g. `test.yourcompany.com`):

1. In your Vercel project, click **Settings** → **Domains**
2. Type your desired subdomain (e.g. `test.yourcompany.com`) and click **Add**
3. Vercel will show you a CNAME record to add — copy the value (it ends in `.vercel-dns.com`)
4. Go to wherever your domain DNS is managed (GoDaddy, Cloudflare, etc.)
5. Add a new **CNAME record**:
   - Name/Host: `test` (or whatever subdomain you chose)
   - Value/Target: the `.vercel-dns.com` address Vercel gave you
   - If using Cloudflare: set to **DNS only** (grey cloud, not orange)
6. Wait a few minutes — Vercel will automatically provision an SSL certificate

---

## Customising without code

Once you're logged in to the HR dashboard, go to **Settings** to:

- Upload your company logo (appears on the test welcome screen and browser tab)
- Change the company name (appears in the nav and browser tab title)
- Change the test name
- Edit the welcome screen headline and body text
- Edit the thank-you message, confidentiality statement, and "what happens next" text
- Change your own password
- Add or remove HR user accounts
- Grant or revoke admin access for any user

Everything updates immediately — no redeployment needed.

---

## Customising with code

### Change the company name default

In `supabase/01_schema.sql`, find this line near the bottom and replace `'Your Company'` with your own:

```sql
company_name, 'Your Company',
```

This only matters if you run the SQL fresh. If you've already set your company name in the Settings page, ignore this.

### Add, edit, or remove questions

Questions are stored in the `questions` table in Supabase. You can:

**Edit questions in Supabase directly**
1. In Supabase, click **Table Editor** → `questions`
2. Click any row to edit it — change the text, options, correct answer, or difficulty
3. The change takes effect immediately (new test sessions will get the updated questions)

**Add questions via SQL**
Run an INSERT in the SQL Editor:

```sql
INSERT INTO questions (type, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, is_practice, is_active)
VALUES (
  'numerical',      -- type: pattern_recognition | numerical | verbal_analogy | deductive | logical_sequence
  'medium',         -- difficulty: easy | medium | hard
  'If a train travels 60 km in 45 minutes, how far does it travel in 1 hour?',
  '75 km',
  '80 km',
  '90 km',
  '100 km',
  'b',              -- correct answer: a | b | c | d
  false,            -- is_practice: true = unscored practice question
  true              -- is_active: false = hidden from tests
);
```

**Mark a question inactive** (hides it without deleting):
```sql
UPDATE questions SET is_active = false WHERE id = 'paste-the-question-uuid-here';
```

### Change the scoring system

The IQ conversion and scoring logic is in `src/app/api/test/score/route.ts`. The difficulty weights are near the top of the file. The IQ normalisation table maps raw percentiles to IQ scores.

### Change the design

The colour palette and font are defined in `tailwind.config.ts`. The key colours are:

```js
'fynlo-teal':  '#0084AD',   // primary / header
'fynlo-terra': '#BC3F1D',   // call-to-action buttons
'fynlo-bg':    '#F7F7F3',   // page background
'fynlo-dark':  '#1A2E35',   // headings
'fynlo-body':  '#4A6572',   // body text
'fynlo-subtle':'#7A9BAA',   // labels, captions
```

The font (Nunito) is loaded in `src/app/layout.tsx`. Replace it with any [Google Font](https://fonts.google.com) by changing the import.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Applicant welcome screen
│   ├── test/                       # Applicant test flow (register, instructions, practice, questions, complete)
│   ├── hr/                         # HR dashboard (login, dashboard, applicant detail, settings, import)
│   └── api/
│       ├── settings/               # Public settings endpoint (company name, logo)
│       ├── test/                   # Applicant test API (start, answer, complete, score, timer)
│       └── hr/                     # HR API (results, status, export, import, settings, admin)
├── components/
│   └── hr/                         # HR UI components (nav, table, dropdowns, user management)
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client (uses cookies)
│       └── admin.ts                # Admin Supabase client (service role — server only)
└── middleware.ts                   # Protects all /hr routes — redirects to /hr/login if not authenticated

supabase/
├── 01_schema.sql                   # All tables, enums, indexes, triggers
├── 02_rls.sql                      # Row-level security policies
└── 03_questions.sql                # 194 pre-built test questions + 5 practice questions
```

---

## Security

- Correct answers are **never sent to the browser** — all scoring runs server-side
- The test timer is **server-side** — calculated from `start_time` stored in the database, not the browser clock
- All HR routes are protected by Supabase Auth middleware — unauthenticated requests redirect to `/hr/login`
- The `SUPABASE_SERVICE_ROLE_KEY` is only ever used in server-side API routes — never in client code
- Row-level security is enabled on every database table
- Admin actions (create/delete users, grant admin) are double-checked server-side regardless of what the client sends

---

## Keeping Supabase active (free tier)

Supabase pauses free projects after 7 days of inactivity. This project includes a weekly ping to prevent that. It's already configured in `vercel.json` — no action needed.

---

## Frequently asked questions

**Can multiple people use the HR dashboard at the same time?**
Yes. You can create as many HR accounts as you need from the Settings page. Admins can grant or revoke admin access for any user.

**Can applicants cheat by sharing answers?**
Questions are randomised per test session, so no two applicants see the same order. The correct answers are never accessible from the browser.

**Can I run this locally for development?**

1. Clone your fork: `git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git`
2. Install dependencies: `npm install`
3. Create a file called `.env.local` in the project root with your three Supabase keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. Run the dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

Any changes you push to the `main` branch on GitHub will automatically redeploy on Vercel.

**Can I use this for something other than hiring?**
The platform is built specifically for hiring assessment, but the question types and scoring system can be adapted for any multiple-choice cognitive test.

---

## Licence

MIT — free to use, modify, and distribute.
