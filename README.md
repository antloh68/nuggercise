# Nuggercise 🔥

**Tiny moves. Massive streaks.**

Nuggercise is a mobile-first micro-fitness tracker that helps you build consistency through small, daily exercises. Log quick workouts, track your streaks, and celebrate your progress—all with a simple, intuitive interface.

![Platform](https://img.shields.io/badge/platform-web%20%7C%20mobile-green.svg)
![Supabase](https://img.shields.io/badge/supabase-integration-orange.svg)

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

Whether it's 20 squats, a 1-minute plank, or desk stretches, Nuggercise helps you turn micro-habits into lasting routines.

---

## ✨ Features

### Core Functionality
- **User Authentication** — Sign up, log in, password recovery, and email verification via Supabase Auth
- **Daily Exercise Logging** — Log reps or minutes with descriptions and mood ratings
- **Streak Tracking** — Visual week grid showing your consistency at a glance
- **Quick Nugget Menu** — Customizable one-tap shortcuts for your favorite exercises
- **Date Navigation** — View past days' logs and track your historical progress

### User Experience
- **Mobile-First Design** — Optimized for touch with large buttons and smooth animations
- **Reward System** — Celebrate every log with tiered congratulatory phrases (Common, Energetic, Legendary)
- **Confetti Effects** — Special visual celebration for legendary achievements
- **CSV Export** — Download all your workout logs for personal analysis

### Account Management
- **Profile Customization** — Set your nickname and habit anchor (behavioral trigger phrase)
- **Email Change** — Securely update your account email with confirmation
- **Account Deletion** — Complete data erasure with confirmation step

### Automated Email Notifications
- **Daily Nudges** — Reminders for inactive users (24+ hours without logging)
- **Weekly Summaries** — Personalized progress reports every Saturday

---

## 🌐 Live Demo

**URL:** [https://antloh68.github.io/nuggercise](https://antloh68.github.io/nuggercise)

The app is hosted on GitHub Pages and connects to a Supabase backend.

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5/CSS3 | Structure and styling with CSS variables |
| Vanilla JavaScript | No frameworks—lightweight and fast |
| Supabase JS SDK | Authentication and database operations |

### Backend
| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database, Auth, Edge Functions |
| **PostgreSQL** | Data persistence with RLS policies |
| **Supabase Edge Functions** | Serverless email automation (Deno runtime) |
| **Gmail SMTP** | Email delivery (daily nudges + weekly summaries) |

### Key Integrations
- **Supabase Auth** — Email/password authentication with session management
- **Supabase Database** — Real-time capable, row-level security
- **GitHub Pages** — Static frontend hosting

---

## 🏗 Architecture

### Frontend Architecture
```
index.html
├── Single Page Application (SPA) with multiple screens
├── CSS-in-JS style blocks (no external dependencies)
└── Vanilla JS state management
    ├── currentUser (Supabase session)
    ├── currentProfile (user metadata)
    ├── weekLogs (cached workout data)
    └── activeDate (navigation state)
```

### Backend Architecture
```
┌─────────────────┐     ┌──────────────────┐
│   GitHub Pages  │────▶│    Supabase      │
│   (Static Host) │     │  - PostgreSQL    │
└─────────────────┘     │  - Auth (JWT)    │
         │              │  - Edge Functions│
         │              └────────┬─────────┘
         │                       │
         │              ┌────────▼─────────┐
         └─────────────▶│   Email Service  │
                        │   (Gmail SMTP)    │
                        └──────────────────┘
```

### Data Flow
1. User authenticates via Supabase Auth (JWT stored)
2. Frontend queries Supabase with RLS-enforced policies
3. Weekly cron jobs trigger Edge Functions
4. Edge Functions query database and send personalized emails

---

## 📊 Database Schema

### Table: `profiles`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PRIMARY KEY, FK to auth.users |
| `nickname` | TEXT | NOT NULL, 1-50 chars |
| `habit_anchor` | TEXT | Max 100 chars |
| `quick_nuggets` | JSONB | Array of 4 custom exercise shortcuts |
| `created_at` | TIMESTAMPTZ | Default: now() |
| `updated_at` | TIMESTAMPTZ | Auto-updated |

### Table: `nuggercises`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `user_id` | UUID | FK to profiles.id |
| `logged_at` | TIMESTAMPTZ | Must be within last 48 hours |
| `metric_type` | TEXT | 'reps' OR 'minutes' |
| `metric_value` | INTEGER | 1-10,000 |
| `description` | TEXT | Max 250 chars |
| `feeling_rating` | INTEGER | 1-5 |
| `created_at` | TIMESTAMPTZ | Default: now() |

### Table: `app_congratulations`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BIGINT | PRIMARY KEY, auto-generated |
| `phrase` | TEXT | NOT NULL |
| `rarity_tier` | TEXT | 'common', 'energetic', 'legendary' |

### Table: `email_nudges`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BIGINT | PRIMARY KEY, auto-generated |
| `phrase` | TEXT | NOT NULL |
| `times_used` | INTEGER | DEFAULT 0 (rotation tracker) |

### Database Triggers
- `on_auth_user_created` — Automatically creates a profile row when a user signs up
- `update_updated_at_column` — Maintains `updated_at` timestamps on profiles

### Row Level Security (RLS)
All tables have RLS enabled with policies restricting access to authenticated users' own data.

---

## 🔧 Backend Services

### 1. Edge Function: `send-nudge`

**Purpose:** Automated email notifications (daily and weekly)

**Schedule (via pg_cron):**
```sql
-- Daily at 7 AM (inactive user reminders)
SELECT net.http_post(
  url := 'https://[PROJECT].supabase.co/functions/v1/send-nudge',
  body := jsonb_build_object('token', 'SECRET_TOKEN', 'type', 'daily')
);

-- Weekly on Saturday at 4 PM (progress summaries)
SELECT net.http_post(
  url := 'https://[PROJECT].supabase.co/functions/v1/send-nudge',
  body := jsonb_build_object('token', 'SECRET_TOKEN', 'type', 'weekly')
);
```

**Function Behavior:**
- **Daily Mode:** Identifies users inactive for 24+ hours → sends motivational email with random nudge phrase from `email_nudges` table
- **Weekly Mode:** Aggregates last 7 days of logs for each user → sends personalized stats (total nuggets, reps, minutes)

**Email Templates:** HTML-based, responsive design matching app branding

### 2. Edge Function: `delete-account`

**Purpose:** Complete user account deletion

**Process:**
1. Verifies JWT from Authorization header
2. Deletes all user's `nuggercises` rows
3. Deletes user's `profiles` row
4. Calls Supabase Admin API to delete auth user

**Security:** Requires service role key (server-side only)

---

## 🔐 Security & Authentication

### Bypassing Edge Function JWT Authentication

By default, Supabase Edge Functions automatically enforce validation checks on incoming HTTP `Authorization` headers to ensure valid user JWTs.

Because automated system tasks (such as `pg_cron` jobs) call endpoints programmatically rather than as signed-in users, you must explicitly disable this default validation during deployment:

```bash
supabase functions deploy send-nudge --no-verify-jwt
```

> **Why this is required:** Leaving JWT verification enabled causes `pg_cron` database requests to be blocked with HTTP `401 Unauthorized` before your `index.ts` code executes.

### Function Secret Token Handshake

To protect the publicly exposed endpoint while bypassing default JWT layer checks, the system implements a **Passphrase Matching Token handshake**:

```
[ Supabase pg_cron Engine ] 
        │
        ▼ Dispatches HTTP POST with body: { "token": "SECRET_TOKEN" }
[ send-nudge Edge Function ]
        │
        ├─► Fetches Deno.env.get("FUNCTION_SECRET")
        │
        ▼
[ Token Match Evaluation ] ──❌ (Mismatch) ──► Returns HTTP 401 Unauthorized
        │
        ✔️ (Exact Match)
        ▼
[ Success: Processes Emails Loop ]
```

#### Inside the Edge Function (`index.ts`):

```typescript
const incomingToken = body.token?.trim().replace(/['"]/g, "");
const secretPassphrase = Deno.env.get("FUNCTION_SECRET")?.trim(); 

if (!incomingToken || !secretPassphrase || incomingToken !== secretPassphrase) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}
```

#### Inside the Database Scheduler (`pg_cron`):

The string literal inside `jsonb_build_object` must **perfectly mirror** the `FUNCTION_SECRET` environment variable:

```sql
select cron.schedule(
  'send-daily-nudges',
  '0 7 * * *',
  $$
  select net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-nudge',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'token', 'YOUR_FUNCTION_SECRET_CODE', -- MUST MATCH FUNCTION_SECRET EXACTLY
      'type', 'daily'
    ),
    timeout_milliseconds := 5000
  );
  $$
);
```

> **Important:** If you rotate the `FUNCTION_SECRET`, you must drop existing scheduler definitions using `cron.unschedule()` and recreate them with the updated token value.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ (for local development)
- Supabase account (free tier works)
- GitHub account (for hosting)

### Step 1: Clone the Repository
```bash
git clone https://github.com/antloh68/nuggercise.git
cd nuggercise
```

### Step 2: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key
3. Run the database schema (see `nuggercise schema.txt`)

### Step 3: Configure Authentication
- Enable Email provider in Supabase Auth settings
- Configure Site URL: `https://[your-username].github.io/nuggercise`
- Add redirect URLs: same as Site URL

### Step 4: Set Up Email
1. Create a Gmail account for sending notifications
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Add to Supabase Edge Function secrets

### Step 5: Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions (note the --no-verify-jwt flag)
supabase functions deploy send-nudge --no-verify-jwt
supabase functions deploy delete-account
```

### Step 6: Configure Environment Variables
Add these secrets to your Supabase project:

```bash
# Define your secure internal communications passphrase
supabase secrets set FUNCTION_SECRET="your-random-secret-token"

# Define your application email sender account
supabase secrets set GMAIL_USER="your-app-email@gmail.com"

# Define your 16-character Google App Password
supabase secrets set GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"

# Supabase service role key (from project settings)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

#### Verification & Local Emulation:

```bash
# Check which secrets are deployed
supabase secrets list

# For local testing, create .env.local file with same key-value pairs
```

### Step 7: Update Frontend
Replace the Supabase credentials in `index.html`:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const APP_URL = 'https://your-username.github.io/nuggercise';
```

### Step 8: Deploy to GitHub Pages
```bash
git add .
git commit -m "Deploy Nuggercise"
git push origin main
```
Enable GitHub Pages in repository Settings → Pages → Branch: `main`

---

## 🔐 Environment Variables

### Frontend (embedded in HTML)
| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project endpoint |
| `SUPABASE_ANON_KEY` | Public anon key (safe for frontend) |
| `APP_URL` | Base URL for email redirects |

### Edge Function Secrets
| Secret | Purpose |
|--------|---------|
| `FUNCTION_SECRET` | Token for authenticating cron job requests |
| `GMAIL_USER` | Email address for sending notifications |
| `GMAIL_APP_PASSWORD` | Gmail app password (not regular password) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin access for account deletion |
| `SUPABASE_URL` | Project URL (injected automatically) |
| `SUPABASE_ANON_KEY` | Public key (injected automatically) |

---

## 📈 User Capacity & Limitations

⚠️ **Important:** The current architecture has documented scaling limits.

### Current Constraints

| Stage | User Count | Status |
|-------|------------|--------|
| Pilot / Beta | 1-100 | ✅ Stable |
| Approaching Limit | 101-150 | ⚠️ At risk |
| System Failure | 150+ | ❌ Critical failures expected |

### Bottlenecks
1. **Edge Function Timeout** (150 seconds) — Sequential email sending limits throughput
2. **Gmail Rate Limits** (500 emails/day) — Free tier limitation
3. **In-Memory Processing** — Weekly summaries load all logs into memory

### Remediation Roadmap
- [ ] Migrate to transactional email API (Resend/SendGrid)
- [ ] Implement parallel email sending (`Promise.allSettled`)
- [ ] Move aggregations to PostgreSQL views/stored procedures
- [ ] Implement pagination for large queries

*See `Nuggercise user capacity limitation.txt` for detailed analysis.*

---

## 🙏 Acknowledgments

- **Supabase** — Amazing open-source Firebase alternative
- **GitHub Pages** — Free static hosting
- **Gmail** — Email delivery (up to 500/day on free tier)

---

## 📄 Additional Documentation

Additional files in the repository:
- `nuggercise schema.txt` — Complete database schema
- `cron jobs.txt` — Scheduling configuration
- `delete user index.ts.txt` — Account deletion function
- `email nudge index.ts.txt` — Notification system
- `Nuggercise user capacity limitation.txt` — Scaling analysis

---

**Built with 🔥 for tiny moves and massive streaks.**
