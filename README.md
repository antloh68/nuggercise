# Nuggercise 🔥

**Tiny moves. Massive streaks.**

Nuggercise is a mobile-first micro-fitness tracker that helps you build consistency through small, daily exercises. Log quick workouts, track your streaks, and celebrate your progress—all with a simple, intuitive interface designed around behavioral psychology.

![Platform](https://img.shields.io/badge/platform-web%20%7C%20mobile-green.svg)
![Supabase](https://img.shields.io/badge/supabase-integration-orange.svg)
![GitHub Pages](https://img.shields.io/badge/hosted-GitHub%20Pages-blue.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Live Demo](#live-demo)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Backend Services](#backend-services)
- [Security & Authentication](#security--authentication)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [User Capacity & Limitations](#user-capacity--limitations)
- [Acknowledgments](#acknowledgments)

---

## 🎯 Overview

Nuggercise is built on a simple premise: **small, consistent actions lead to massive results**. The app encourages users to log "nuggets"—tiny exercise sessions—daily, building streaks and receiving motivational feedback along the way.

Whether it's 20 squats, a 1-minute plank, or desk stretches, Nuggercise helps you turn micro-habits into lasting routines using principles from BJ Fogg's Behavioral Model (B=MAP), Prospect Theory, and variable reward scheduling.

---

## ✨ Features

### Navigation
- **Menu Drawer (☰)** — The button at the top left of the dashboard slides a drawer in from the left with **About**, **Settings** and **Account**. Tap the dimmed area or press Esc to close it

### Core Functionality
- **User Authentication** — Sign up, log in, password reset, and email verification via Supabase Auth
- **Daily Exercise Logging** — Tap **+** to log reps or minutes with a description and a mood rating (1–5 emoji scale)
- **Streak Tracking** — Visual week grid (Sun–Sat) showing consistency at a glance
- **Day Navigation** — `←` `→` arrows and tappable week-grid bubbles switch the day being viewed. The day log **and** the reflection card both follow the selected day
- **Quick Nugget Menu** — Customisable one-tap shortcuts inside the log form (4 exercises, editable in Settings)
- **Back-Dated Logging** — The log form's date picker allows entries for today or yesterday (calendar days, resetting at midnight on the user's device) rather than a rolling 24-hour window
- **Edit Entry (✏️)** — Pencil icon beside each entry from today or yesterday. Opens the log form pre-filled; every field including date/time can be corrected, with the same date validation as new entries. Saving an edit shows **no reward** and returns to the edited entry's day
- **Delete Entry (🗑)** — Remove any log entry with a 3-second undo toast for accidental taps

### Behavioral Psychology Layer
- **Loss Aversion Streak Message** — After 3 PM SGT, if the user hasn't logged, the streak counter switches to a loss-framed warning message (Prospect Theory)
- **Habit Anchor** — User sets an Implementation Intention ("When I sit for 1 hr, I do 20 squats"). It appears in the dashboard greeting line, alternating with the welcome message; text too long for one line scrolls, pausing briefly at the start and end
- **Variable Reward System** — Every **new** log triggers a random tiered reward (Common 75%, Energetic 20%, Legendary 5%) with matching audio via Web Audio API and confetti for legendary draws. Edits do not trigger a reward
- **Multi-Log Bubble Ring** — Days with 2+ logs show an orange ring on the week grid (Goal-Gradient Effect)

### Reflection
- **Daily Reflection** — An inline card on the dashboard, below the day log. One entry per day, 500 characters with a live counter. Editable for today and yesterday; older days are read-only
- **Autosave** — Changing day, or leaving the dashboard, with unsaved reflection text saves it automatically and shows a "✓ Reflection saved" toast
- A saved reflection cannot be emptied (the database rejects empty text)

### User Experience
- **Reward Screens** — Tiered congratulatory phrases (150 total: 95 common, 40 energetic, 15 legendary) with Web Audio synthesised sound effects per tier and a gold dark overlay for legendary
- **About Modal** — Opened from the menu; auto-shown once for first-time users
- **PWA Support** — The Service Worker fetches the app page **network-first**, so a new release arrives on the next load, and caches the Supabase SDK. Offline, the last cached page still opens, but data needs a connection
- **Haptic Feedback** — Short vibration when choosing a mood rating (Android)
- **CSV Export** — Downloads all exercise logs and daily reflections; reflection-only days are included as standalone rows

### Settings & Account
- **Settings** (menu → Settings) — Nickname, habit anchor, and the 4 custom Quick Nugget shortcuts (saved to Supabase)
- **Account** (menu → Account), top to bottom:
  - **Change Email** — Dual confirmation (both old and new address must confirm)
  - **Change Password** — Requires the **current password**, which is verified first by re-authenticating. New password must be at least 6 characters, match the repeat, and differ from the current one. One Show/Hide toggle controls all three fields
  - **Export Logs as CSV**
  - **Log Out**
  - **Delete Account** — Email confirmation gate + complete data erasure via Edge Function (kept last, in a red danger zone)
- **Password Reset** (login screen) — Forgot-password flow with secure redirect back to the app

### Automated Email Notifications
- **Daily Nudges** — 8:00 AM and 8:00 PM SGT — sent only to users inactive for 24+ hours; includes habit anchor reminder
- **Weekly Summaries** — 11:59 PM SGT Saturday — personalised stats (nuggets, reps, minutes, active days, avg feeling); sent only to users with at least one log that week

---

## 🌐 Live Demo

**URL:** [https://antloh68.github.io/nuggercise](https://antloh68.github.io/nuggercise)

Hosted on GitHub Pages, connected to a Supabase backend (Singapore region).

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 / CSS3 | Structure and styling with CSS custom properties |
| Vanilla JavaScript | No frameworks — lightweight and fast |
| Supabase JS SDK v2 | Authentication and database operations |
| Web Audio API | Synthesised reward sound effects — no file downloads |
| Service Worker | PWA caching for offline-capable repeat visits |

### Backend
| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database, Auth, Row Level Security, Edge Functions |
| **pg_cron + pg_net** | Scheduled HTTP calls to Edge Functions |
| **Supabase Edge Functions** | Serverless email automation (Deno + nodemailer) |
| **Gmail SMTP** | Email delivery (auth emails + daily nudges + weekly summaries) |

### Hosting
| Service | Purpose |
|---------|---------|
| **GitHub Pages** | Static frontend hosting with GitHub Actions deploy |

---

## 🏗 Architecture

### Frontend Architecture
```
index.html (single file SPA)
├── CSS — mobile-first, CSS custom properties, no external stylesheets
├── HTML — screens (Dashboard, Log, Settings, Account), menu drawer, About modal, reward overlay
└── Vanilla JS state
    ├── currentUser       — Supabase session
    ├── currentProfile    — nickname, habit_anchor, quick_nuggets
    ├── weekLogs          — current week's exercise data (streak, stats, week grid)
    ├── activeDate        — the day being viewed; drives BOTH the day log and the reflection card
    ├── quickNuggets      — 4 custom shortcuts shown in the log form
    ├── allPhrases        — reward phrases loaded from DB at init
    ├── reflection*       — day shown, saved row id, unsaved-text flag, in-flight save (autosave)
    └── welcomeToggleInterval — habit anchor scroll animation handle
```

Every return to the dashboard goes through a single `showDashboard(date)` function, which sets the day being viewed and re-renders the logs and the reflection together, so the screen can never show a different day from the one `activeDate` points to.

### Backend Architecture
```
┌─────────────────────┐     ┌──────────────────────────┐
│    GitHub Pages     │────▶│        Supabase           │
│   (index.html)      │     │  ├── PostgreSQL + RLS     │
└─────────────────────┘     │  ├── Auth (JWT)           │
                            │  ├── Edge Functions (Deno)│
                            │  └── pg_cron scheduler    │
                            └────────────┬──────────────┘
                                         │
                            ┌────────────▼──────────────┐
                            │      Gmail SMTP            │
                            │  (auth + nudge emails)    │
                            └───────────────────────────┘
```

### Data Flow
1. User authenticates via Supabase Auth (JWT persisted in localStorage)
2. Frontend queries Supabase via PostgREST — RLS enforces per-user data isolation
3. `pg_cron` fires at scheduled SGT times → calls Edge Functions via `pg_net.http_post`
4. Edge Functions query the database and send personalised emails via Gmail SMTP

---

## 📊 Database Schema

### Table: `profiles`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PRIMARY KEY, FK to auth.users (cascade delete) |
| `nickname` | TEXT | NOT NULL, 1–50 chars |
| `habit_anchor` | TEXT | Nullable, max 100 chars |
| `quick_nuggets` | JSONB | Nullable — array of 4 custom exercise shortcuts |
| `created_at` | TIMESTAMPTZ | Default: now() |
| `updated_at` | TIMESTAMPTZ | Updated on profile save |

### Table: `nuggercises`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `user_id` | UUID | FK to profiles.id (cascade delete) |
| `logged_at` | TIMESTAMPTZ | NOT NULL; DEFAULT now(). The today/yesterday window is enforced in the app, not by a database constraint (see note below) |
| `metric_type` | TEXT | 'reps' OR 'minutes' |
| `metric_value` | INTEGER | 1–10,000 |
| `description` | TEXT | Nullable, max 250 chars |
| `feeling_rating` | INTEGER | 1–5 |
| `created_at` | TIMESTAMPTZ | Default: now() |

### Table: `reflections`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `user_id` | UUID | FK to profiles.id (cascade delete) |
| `content` | TEXT | NOT NULL, max 500 chars |
| `reflected_at` | TIMESTAMPTZ | App convention: a reflection for calendar day D is stored at 12:00 UTC on D and looked up by that day's UTC window (one per day) |
| `created_at` | TIMESTAMPTZ | Default: now() |

### Table: `app_congratulations`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BIGINT | PRIMARY KEY, auto-generated |
| `phrase` | TEXT | NOT NULL |
| `rarity_tier` | TEXT | 'common' (95), 'energetic' (40), 'legendary' (15) |

### Table: `email_nudges`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BIGINT | PRIMARY KEY, auto-generated |
| `phrase` | TEXT | NOT NULL |
| `times_used` | INTEGER | DEFAULT 0 — rotation analytics tracker |

### Indexes
```sql
-- Fast dashboard queries by user and date
CREATE INDEX idx_nuggercises_security_composite ON nuggercises (user_id, logged_at DESC);

-- Fast reflection lookup by user and date
CREATE INDEX idx_reflections_user_date ON reflections (user_id, reflected_at DESC);
```

### Database Triggers
- `on_auth_user_created` — Auto-creates a profile row (with nickname from signup metadata) when a new user confirms their account

### Row Level Security (RLS)
All tables have RLS enabled. Every policy uses `auth.uid()` — users can only read and write their own data. `app_congratulations` and `email_nudges` are read-only for authenticated users.

The `nuggercises` policy defines both clauses explicitly:
```sql
using (auth.uid() = user_id)
with check (auth.uid() = user_id)
```

### Why there is no database time-window constraint on `logged_at`

An earlier version enforced "no older than N hours" with a `CHECK` constraint on `nuggercises.logged_at`. A `CHECK` constraint is re-evaluated against `now()` on **every UPDATE**, not just on insert. Once an entry aged past the window, even a harmless edit (for example, correcting its description) was rejected by the database.

The constraint was therefore removed. The today/yesterday rule is enforced in the app instead:
- the datetime picker's `min` is set to the start of yesterday
- `submitLog()` validates the chosen time on both inserts and edits, and rejects future times and times before yesterday
- the ✏️ edit button is only shown for entries from today or yesterday

Row Level Security still guarantees that users can only modify their own rows. Note that this means the date window is a UI-level rule, not a database guarantee: a user calling the API directly could write an older `logged_at` to their own rows. This was an accepted trade-off for a personal habit tracker.

---

## 🔧 Backend Services

### Edge Function: `send-nudge`

**Purpose:** Automated email notifications — daily nudges and weekly summaries

**Scheduled via pg_cron:**
| Job | Schedule | SGT Time | Behaviour |
|-----|----------|----------|-----------|
| `send-daily-nudges` | `0 0,12 * * *` | 8:00 AM and 8:00 PM daily | Users inactive 24+ hours |
| `send-weekly-summary` | `59 15 * * 6` | 11:59 PM Saturday | Users with ≥1 log this week |

**Daily Mode:**
- Fetches all confirmed users
- Identifies users with no `logged_at` in past 24 hours
- Picks a random phrase from `email_nudges`, increments `times_used`
- Sends personalised email with nickname and habit anchor reminder

**Weekly Mode:**
- Fetches all `nuggercises` logs from past 7 days (filtered by `logged_at`)
- Aggregates per-user: total nuggets, total reps, total minutes, active days, avg feeling
- Sends only to users who logged at least once — inactive users receive no weekly email
- Dynamic motivation line based on active day count

**Authentication:** Token handshake — cron passes `FUNCTION_SECRET` in request body; function validates it before execution. `verify_jwt: false` set on the function.

---

### Edge Function: `delete-account`

**Purpose:** Complete, secure user account deletion

**Process:**
1. Reads `Authorization: Bearer <token>` from request header
2. Validates token via `userClient.auth.getUser()` — cryptographic verification
3. Deletes all `nuggercises` rows for the user (explicit, belt-and-suspenders)
4. Deletes `profiles` row (cascade would handle it, but explicit is safer)
5. Calls `adminClient.auth.admin.deleteUser()` — requires service role key

**Security:** `verify_jwt: false` — function performs its own strict token verification. CORS headers included for browser preflight compatibility.

---

## 🔐 Security & Authentication

### Why `verify_jwt: false` on `send-nudge`

`pg_cron` calls the Edge Function without a user JWT — it sends a custom token in the request body instead. Supabase's gateway-level JWT check would block these calls with 401. Setting `verify_jwt: false` bypasses the gateway check, allowing the function's own token validation to handle security instead.

### Token Handshake Flow

```
pg_cron → POST { "token": "SECRET", "type": "daily" }
              ↓
         Edge Function
              ↓
    Compare token === FUNCTION_SECRET
              ↓
    ✅ Match → process emails
    ❌ Mismatch → return 401
```

### Input Security (Frontend)
- All user-supplied text rendered via `.textContent` — never `.innerHTML` — preventing XSS
- Description fields capped at 250 chars, reflection at 500 chars at both DB and UI level
- Numeric inputs stripped of non-numeric characters client-side before submission
- Date inputs validated client-side before hitting Supabase, for both new entries and edits (future dates blocked; only today and yesterday allowed)
- Changing the password requires the **current password**, verified by re-authenticating before the update is sent; passwords are never trimmed or logged

---

## 🚀 Setup & Installation

### Prerequisites
- Supabase account (free tier works)
- GitHub account (for hosting)
- Gmail account for sending notifications

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New project → Region: Southeast Asia (Singapore)
2. Note your **Project URL** and **anon/public key**
3. Run the database schema SQL in the SQL Editor

### Step 2: Run Database Migrations
Run in Supabase SQL Editor in this order:
1. Main schema (profiles, nuggercises, app_congratulations, email_nudges tables + RLS)
2. `migration_reflections.sql` — creates reflections table
3. `migration_quick_nuggets.sql` — adds quick_nuggets column to profiles
4. `migration_logged_at_default.sql` — adds server-side default for logged_at
5. `migration_profile_trigger.sql` — auto-creates profile on signup
6. Post-schema fixes (required if your base schema still has the original definitions):
   ```sql
   -- Remove the time-window constraint; the app enforces today/yesterday instead
   alter table public.nuggercises drop constraint if exists logged_at_past_limit;

   -- Make the RLS policy explicit for writes as well as reads
   alter policy "Enforce absolute user boundaries for all operations"
     on public.nuggercises
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ```

### Step 3: Configure Supabase Auth
1. **Authentication → URL Configuration:**
   - Site URL: `https://[username].github.io/nuggercise`
   - Redirect URLs: same (no trailing slash)
2. **Authentication → Providers → Email:** Enable, set OTP expiry to 3600s
3. **Authentication → SMTP:** Configure Gmail SMTP (host: `smtp.gmail.com`, port: 587, secure: TLS)

### Step 4: Seed Congratulations Phrases
Run `phase2_congratulations.sql` in the SQL Editor to seed 100 base phrases across all tiers.

### Step 5: Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy send-nudge --no-verify-jwt
supabase functions deploy delete-account
```

Or paste the function code directly in **Supabase → Edge Functions** dashboard (no CLI needed).

### Step 6: Set Edge Function Secrets
In **Supabase → Edge Functions → send-nudge → Secrets:**
```
FUNCTION_SECRET    → any strong random UUID
GMAIL_USER         → nuggercise@gmail.com
GMAIL_APP_PASSWORD → 16-character Gmail App Password
```

### Step 7: Set Up pg_cron Jobs
Enable the `pg_cron` and `pg_net` extensions, then schedule both jobs in the SQL Editor. The token travels in the request **body** and must exactly match the `FUNCTION_SECRET` secret. Times are UTC (SGT = UTC+8):

```sql
-- Daily nudge: 00:00 and 12:00 UTC = 8:00 AM and 8:00 PM SGT
select cron.schedule('send-daily-nudges', '0 0,12 * * *', $$
  select net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/send-nudge',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('token', 'YOUR_FUNCTION_SECRET', 'type', 'daily'),
    timeout_milliseconds := 5000
  );
$$);

-- Weekly summary: 15:59 UTC Saturday = 11:59 PM SGT Saturday
select cron.schedule('send-weekly-summary', '59 15 * * 6', $$
  select net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/send-nudge',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('token', 'YOUR_FUNCTION_SECRET', 'type', 'weekly'),
    timeout_milliseconds := 5000
  );
$$);
```

Verify with `select jobname, schedule, active from cron.job;`

### Step 8: Update Frontend Credentials
In `index.html`, update:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const APP_URL = 'https://your-username.github.io/nuggercise';
```

### Step 9: Deploy to GitHub Pages
1. Create a GitHub repository named `nuggercise`
2. Upload `index.html` and `sw.js` to the repository root
3. **Settings → Pages → Source:** GitHub Actions
4. Add `.github/workflows/deploy.yml` (the static pages deploy workflow)
5. Push — GitHub Actions publishes to `https://[username].github.io/nuggercise`

> **Releases:** re-upload **both** `index.html` and `sw.js` whenever either changes. The service worker serves the app page network-first, but a phone still running an older service worker may need one extra reload to pick up a new release.

---

## 🔐 Environment Variables

### Frontend (embedded in `index.html`)
| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project endpoint |
| `SUPABASE_ANON_KEY` | Public anon/publishable key (safe for frontend) |
| `APP_URL` | Base URL for email confirmation redirects |

### Edge Function Secrets
| Secret | Purpose |
|--------|---------|
| `FUNCTION_SECRET` | Passphrase for authenticating pg_cron requests |
| `GMAIL_USER` | Gmail address for sending notifications |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not account password) |
| `SUPABASE_URL` | Auto-injected by Supabase runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected — admin access for account deletion |
| `SUPABASE_ANON_KEY` | Auto-injected — used in delete-account user verification |

---

## 📈 User Capacity & Limitations

⚠️ **Current architecture is optimised for a closed beta / small community.**

### Capacity Table

| Stage | User Count | Status |
|-------|------------|--------|
| Pilot / Closed Beta | 1–100 | ✅ Stable |
| Approaching Limit | 101–150 | ⚠️ At risk of timeout |
| System Failure | 150+ | ❌ Edge Function timeouts expected |

### Bottlenecks
1. **Edge Function Timeout (150s)** — Sequential `nodemailer.sendMail()` calls at ~1s each limit throughput to ~150 users per run
2. **Gmail Rate Limit (500 emails/day)** — Free consumer Gmail account cap
3. **PostgREST Row Limit (1,000 rows)** — Weekly aggregation accuracy degrades above this

### Remediation Roadmap
- [ ] Migrate to HTTP email API (Resend/SendGrid) — batches emails in milliseconds vs seconds
- [ ] Implement `Promise.allSettled()` parallel fan-out for email sending
- [ ] Move weekly aggregation to a PostgreSQL stored procedure or view
- [ ] Add PostgREST `.range()` pagination for large query sets

---

## 🙏 Acknowledgments

- **Supabase** — PostgreSQL backend, auth, and edge functions
- **GitHub Pages** — Free static hosting with CI/CD via Actions
- **Gmail** — Email delivery (500/day free tier)
- **BJ Fogg** — Behavioral Model (B=MAP) that inspired the habit anchor feature
- **Kahneman & Tversky** — Prospect Theory behind the loss-aversion streak messaging
- **B.F. Skinner** — Variable reinforcement scheduling behind the tiered reward system

---

## 📄 File Reference

| File | Purpose |
|------|---------|
| `index.html` | Complete single-file frontend application |
| `sw.js` | Service Worker — network-first app page, cached Supabase SDK |
| `phase2_congratulations.sql` | Seed data for reward phrases |
| `phase5-cron-jobs.sql` | **Obsolete** — targets an abandoned `send-email` function. Use the Step 7 SQL above instead |
| `migration_reflections.sql` | Creates reflections table + RLS |
| `migration_quick_nuggets.sql` | Adds quick_nuggets to profiles |
| `migration_logged_at_default.sql` | Server-side timestamp default (the time-window constraint it complemented has since been removed — see Step 2, item 6) |
| `migration_profile_trigger.sql` | Auto-profile creation trigger |
| `behavioral-ux-change-tasks.md` | BX feature backlog documentation |

---

**Built with 🔥 for tiny moves and massive streaks.**
