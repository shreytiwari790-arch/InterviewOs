# InterviewOS

AI-powered interview preparation. Candidates upload a resume, choose a company and role, take a
personalised text-based mock interview and receive a detailed report. Company interview patterns are
stored in MongoDB and managed from the admin panel.

> Company profiles are **preparation profiles** based on available information, not official
> interview patterns.

## Tech stack

| Layer    | Stack                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Frontend | React 19, Vite, React Router, Tailwind CSS 4, Lucide icons, Recharts     |
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
| `OPENAI_API_KEY`                | Phase 3+    | Resume analysis, interview generation and evaluation.                  |
| `OPENAI_MODEL`                  | no          | Defaults to `gpt-4o-mini`.                                             |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | for seeding | Used by `npm run seed` to create the admin account.                    |

```bash
npm run seed    # creates/updates the admin account
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
| GET    | `/api/admin/overview`       | admin     | Platform counts and newest users                |
| GET    | `/api/admin/users`          | admin     | Search / filter / paginate users                |
| PATCH  | `/api/admin/users/:userId`  | admin     | Change role or activate / deactivate            |

## Security notes

- Sessions are JWTs in an HttpOnly, SameSite=Lax cookie (Secure in production). Password changes,
  resets and deactivation invalidate existing sessions.
- Passwords are hashed with bcrypt (12 rounds); reset tokens are stored only as SHA-256 hashes and expire in 30 minutes.
- Every request is validated with Zod; MongoDB operator keys are stripped from input; admin search text is regex-escaped.
- Helmet, a CORS allowlist and rate limiting (stricter on auth routes) are enabled.
- Admins cannot change their own role or status, so the last admin cannot lock themselves out.

## Deployment

Deployment configuration (Vercel rewrite for `/api`, Render settings) is completed in Phase 9.

## Progress

- [x] Phase 1 – Project setup, MongoDB connection, authentication
- [x] Phase 2 – Landing page, candidate & admin layouts, dashboard, settings, admin overview & users
- [ ] Phase 3 – Resume upload, extraction and AI analysis
- [ ] Phase 4 – Company & role profiles, admin management
- [ ] Phase 5 – AI interview generation
- [ ] Phase 6 – Interview room, autosave, recovery
- [ ] Phase 7 – Evaluation, reports, history, PDF
- [ ] Phase 8 – Integrity checks, admin statistics
- [ ] Phase 9 – Testing, polish, deployment
