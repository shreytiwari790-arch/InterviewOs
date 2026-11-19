# InterviewOS

AI-powered interview preparation. Candidates upload a resume, choose a company and role, take a
personalised text-based mock interview and receive a detailed report. Company interview patterns are
stored in MongoDB and managed from the admin panel.

> Company profiles are **preparation profiles** based on available information, not official
> interview patterns.

## Tech stack

| Layer    | Stack                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Frontend | React 19, Vite, React Router, Tailwind CSS 4, Poppins, Lucide, Recharts, Lottie |
| Backend  | Node.js, Express 5, MongoDB Atlas + Mongoose, Zod, JWT (HttpOnly cookie) |
| AI       | OpenAI API (backend only)                                                |
| Hosting  | Frontend on Vercel, backend on Render                                    |

## Repository layout

```text
InterviewOS/
├── frontend/              React app (Vite)
│   └── src/
│       ├── pages/         route screens (auth/, candidate/, admin/, Landing, Settings)
│       ├── layouts/       AuthLayout, CandidateLayout, AdminLayout
│       ├── components/    ui/ (design system), layout/, dashboard/, marketing/, routing/
│       ├── context/       auth state
│       ├── hooks/         useAuth, useApi, useAsyncForm
│       ├── services/      API clients (one per backend area)
│       └── utils/         paths, formatting helpers
└── backend/               Express REST API
    ├── src/
    │   ├── config/        env validation, database connection
    │   ├── models/        Mongoose schemas
    │   ├── routes/        URL → middleware → controller
    │   ├── controllers/   HTTP in/out only
    │   ├── services/      business logic
    │   ├── validators/    Zod request schemas
    │   ├── middleware/    auth, validation, rate limiting, errors
    │   ├── prompts/       AI prompt templates
    │   └── utils/
    ├── scripts/seed.js    creates the admin account (and seed data in later phases)
    └── test/              API tests (node:test + supertest + in-memory MongoDB)
```

## Local development

Requirements: Node.js 20 or newer, a MongoDB Atlas cluster (free tier is fine).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

Fill in `backend/.env`:

| Variable                        | Required    | Notes                                                                  |
| ------------------------------- | ----------- | ---------------------------------------------------------------------- |
| `MONGODB_URI`                   | yes         | Atlas connection string. Add your IP under Atlas → Network Access.     |
| `JWT_SECRET`                    | yes         | At least 32 random characters (generator command in `.env.example`).   |
| `CLIENT_URL`                    | yes         | `http://localhost:5173` locally; your Vercel URL in production.        |
| `OPENAI_API_KEY`                | for AI      | Resume analysis, interview generation and evaluation.                  |
| `OPENAI_MODEL`                  | no          | Defaults to `gpt-4o-mini`.                                             |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | for seeding | Used by `npm run seed` to create the admin account.                    |

```bash
npm run seed    # creates/updates the admin account and adds the company preparation profiles
npm run dev     # http://localhost:5000  (health check: /api/health)
npm test        # API tests – downloads a MongoDB test binary on first run
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm run dev                 # http://localhost:5173
npm run lint                # ESLint
npm run format              # Prettier (config in the repo root)
```

### Editing website content

Pricing plans, FAQs, sample hero questions, company names and reviews live in
`frontend/src/content/marketing.js`. The reviews section stays hidden until you add real reviews there.
Brand colours are defined once in `frontend/src/index.css` (`--color-brand-*` and `--color-ink-*`).

### Password reset (no email yet)

Email delivery is not configured. When someone requests a reset, the link is printed in the
**backend terminal** (`[mail] Reset link …`). To add email later, only
`backend/src/services/mailService.js` needs to change.

## API

| Method | Endpoint                    | Access    | Purpose                                         |
| ------ | --------------------------- | --------- | ----------------------------------------------- |
| GET    | `/api/health`               | public    | Service and database status                     |
| POST   | `/api/auth/register`        | public    | Create account and start session                |
| POST   | `/api/auth/login`           | public    | Start session                                   |
| POST   | `/api/auth/logout`          | public    | End session                                     |
| GET    | `/api/auth/me`              | signed in | Current user                                    |
| POST   | `/api/auth/forgot-password` | public    | Request reset link                              |
| POST   | `/api/auth/reset-password`  | public    | Set new password (signs out all sessions)       |
| PATCH  | `/api/users/me`             | signed in | Update name                                     |
| PATCH  | `/api/users/me/password`    | signed in | Change password (signs out other sessions)      |
| GET    | `/api/dashboard`            | signed in | Candidate dashboard data                        |
| POST   | `/api/contact`              | public    | Contact form message (rate-limited, honeypot)   |
| GET    | `/api/resumes`              | signed in | List your resumes                               |
| POST   | `/api/resumes`              | signed in | Upload PDF/DOCX (field `resume`, ≤ 5 MB); AI analysis runs in background |
| GET    | `/api/resumes/:id`          | signed in | Resume status and AI profile                    |
| POST   | `/api/resumes/:id/analyze`  | signed in | Retry analysis                                  |
| DELETE | `/api/resumes/:id`          | signed in | Delete resume and its profile                   |
| GET    | `/api/companies`            | signed in | Active companies with role names                |
| GET    | `/api/companies/:slug`      | signed in | Company and its role tracks                     |
| POST   | `/api/interviews`           | signed in | Create and generate an interview (`blueprintId`, optional settings) |
| GET    | `/api/interviews`           | signed in | Interview history                               |
| GET    | `/api/interviews/:id`       | signed in | Session: status, questions (no answer keys), saved answers |
| POST   | `/api/interviews/:id/start` | signed in | Start the timer                                 |
| PUT    | `/api/interviews/:id/answers/:questionId` | signed in | Autosave a draft or submit (`submit: true`) an answer |
| POST   | `/api/interviews/:id/finish`| signed in | Submit the interview for evaluation             |
| POST   | `/api/interviews/:id/retry` | signed in | Retry a failed generation or evaluation         |
| GET    | `/api/interviews/:id/report`| signed in | Report with scores, feedback and answer keys (completed only) |
| GET    | `/api/interviews/:id/report/pdf` | signed in | Download the report as PDF                 |
| POST   | `/api/interviews/:id/integrity-events` | signed in | Record integrity signals (batch ≤ 50) |
| GET    | `/api/admin/overview`       | admin     | Platform counts and newest users                |
| GET/POST/PATCH/DELETE | `/api/admin/companies[/:id]` | admin | Manage companies               |
| GET    | `/api/admin/companies/:id/blueprints` | admin | A company's role tracks                |
| GET/POST/PATCH/DELETE | `/api/admin/blueprints[/:id]` | admin | Manage role tracks (interview patterns) |
| GET/POST/PUT/DELETE | `/api/admin/question-bank[/:id]` | admin | Curated question bank           |
| GET    | `/api/admin/statistics`     | admin     | Usage, scores and integrity statistics          |
| GET    | `/api/admin/interviews/:id/integrity` | admin | Integrity timeline for one interview   |
| GET    | `/api/admin/users`          | admin     | Search / filter / paginate users                |
| PATCH  | `/api/admin/users/:userId`  | admin     | Change role or activate / deactivate            |

## How the AI parts work

- `backend/src/services/aiClient.js` is the only place that talks to OpenAI. It uses structured JSON
  output validated with Zod. Prompts live in `backend/src/prompts/`.
- Resume text and candidate answers are treated as untrusted input: they are wrapped in delimiters and
  every prompt tells the model to ignore instructions inside them.
- Resume analysis, interview generation and evaluation run in the background after the request returns;
  the frontend polls the status. If a step fails, the interview shows the reason and a **Try again** button.
- Scoring: single-choice MCQs are all-or-nothing; multi-select gives partial credit
  ((correct − wrong picks) ÷ correct options). Written answers are scored by AI on correctness (40%),
  relevance (20%), completeness (25%) and clarity (15%).
- AI requests are limited to 30 per user per hour.
- Without `OPENAI_API_KEY` the app still runs; AI steps fail with a clear "not configured" message.

## Security notes

- Sessions are JWTs in an HttpOnly, SameSite=Lax cookie (Secure in production). Password changes,
  resets and deactivation invalidate existing sessions.
- Passwords are hashed with bcrypt (12 rounds); reset tokens are stored only as SHA-256 hashes and expire in 30 minutes.
- Every request is validated with Zod; MongoDB operator keys are stripped from input; admin search text is regex-escaped.
- Helmet, a CORS allowlist and rate limiting (stricter on auth routes) are enabled.
- Admins cannot change their own role or status, so the last admin cannot lock themselves out.
- Integrity checks record only browser events (tab visibility, focus, fullscreen, connectivity, and the
  optional camera/microphone permission result). Nothing is recorded from the camera or microphone,
  and integrity signals never affect scores.
- Companies with role tracks, and role tracks with interviews, cannot be deleted, only deactivated, so
  existing reports stay intact.

## Deployment

The repository holds two independently deployable apps. The browser talks only to the Vercel domain;
Vercel forwards `/api/*` to Render. That keeps the login cookie first-party, which avoids third-party
cookie blocking in Safari and Chrome.

```text
Browser ──► https://your-app.vercel.app        (React build)
        └─► https://your-app.vercel.app/api/*  ──rewrite──►  https://interviewos-api.onrender.com/api/*
```

### 1. MongoDB Atlas

- Network Access → allow `0.0.0.0/0` (Render's outbound IPs change on the free plan).
- Seed the production database once from your computer: point `backend/.env` at the Atlas URI,
  set `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then run `npm run seed` in `backend/`. It is safe to re-run;
  it only adds missing company profiles and updates the admin password.

### 2. Backend on Render

Create a **Web Service** from this repository (or use **New → Blueprint** with `render.yaml`):

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check path | `/api/health` |

Environment variables:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | 48+ random characters (Render can generate it) |
| `OPENAI_API_KEY` | your OpenAI key |
| `OPENAI_MODEL` | `gpt-4o-mini` (or another model that supports structured outputs) |
| `CLIENT_URL` | your Vercel URL, e.g. `https://interviewos.vercel.app` (comma-separate extra domains) |
| `TRUST_PROXY_HOPS` | `2` |

If you name the service anything other than `interviewos-api`, update the URL in `frontend/vercel.json`.

### 3. Frontend on Vercel

| Setting | Value |
| --- | --- |
| Root directory | `frontend` |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Leave `VITE_API_URL` **unset** in production so the app calls `/api` on its own domain.
`frontend/vercel.json` holds the `/api` rewrite and the single-page-app fallback.

### 4. After deploying

1. Open `https://<your-vercel-domain>/api/health`. It should return `{"status":"ok","databaseConnected":true}`.
2. Sign in with the admin account and check **Companies**.
3. Register a candidate account, upload a resume and run a short interview.

Notes:
- Render's free plan sleeps after 15 minutes without traffic. The first request afterwards can take
  around a minute, so open the health URL before a demo.
- AI work runs inside the web service process. If the service restarts mid-generation, the interview is
  marked as interrupted after 10 minutes and can be retried from its page.
- Password reset links are written to the Render logs until an email provider is added in
  `backend/src/services/mailService.js`.

## Progress

- [x] Phase 1 – Project setup, MongoDB connection, authentication
- [x] Phase 2 – Landing page, candidate & admin layouts, dashboard, settings, admin overview & users
- [x] Phase 3 – Resume upload, extraction and AI analysis
- [x] Phase 4 – Company & role profiles, admin management, question bank
- [x] Phase 5 – AI interview generation
- [x] Phase 6 – Interview room, autosave, recovery
- [x] Phase 7 – Evaluation, reports, history, PDF download
- [x] Phase 8 – Integrity checks, admin statistics
- [x] Phase 9 – Tests, responsive polish, deployment configuration
