# Deployment Guide — Caremesh PMS

Split deployment: **Frontend on Vercel** (static SPA) + **Backend on Render** (always-on Node API) + **Postgres on Neon**.

```
Browser ──▶ Vercel (React SPA, CDN)
               │  /api/*  (rewrite proxy → same-origin, cookies work)
               ▼
            Render (Express API, always-on: SyncWorker + nightly RiskScheduler cron)
               │
               ▼
            Neon (PostgreSQL)
```

Why this split: the SPA is static files (perfect for a CDN), while the API runs **background workers + a nightly cron**, so it needs an **always-on** server — not serverless. Config already in the repo: [`render.yaml`](render.yaml) (backend) and [`artifacts/web/vercel.json`](artifacts/web/vercel.json) (frontend).

---

## 0. Prerequisites
- Repo pushed to GitHub (Vercel + Render deploy from it).
- A **Neon** Postgres database with the schema pushed and data seeded (you already have this). Grab its connection string (`postgresql://…?sslmode=require`).
- Accounts on **Render** and **Vercel** (free to start; see the plan note in Step 2).

## 1. Generate secrets
You need two strong secrets for auth. Generate them (any method):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # run twice
```
Keep them for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

## 2. Deploy the Backend on Render (do this first — you need its URL)
1. Render Dashboard → **New → Blueprint** → connect the repo. Render reads [`render.yaml`](render.yaml) and creates the **caremesh-api** web service.
2. Set the secret env vars (marked `sync: false`) in the service's **Environment** tab:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your Neon string (keep `?sslmode=require`) |
   | `JWT_SECRET` | secret #1 from Step 1 |
   | `JWT_REFRESH_SECRET` | secret #2 from Step 1 |
   | `CORS_ORIGIN` | your Vercel URL (fill in after Step 4, e.g. `https://caremesh.vercel.app`) |

   (`NODE_ENV=production`, `PORT=10000`, `LOG_LEVEL=info` are already in the blueprint. The app listens on `process.env.PORT`, which Render injects.)
3. **Plan:** the blueprint sets `plan: free`. Free spins down after ~15 min idle, which pauses the `SyncWorker` and the nightly `RiskScheduler` cron and makes the first request after idle slow/cold (~30-60s). Mitigated by [`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml) — a scheduled ping every 10 min — but that's a workaround, not a guarantee (GitHub's scheduler can lag). Bump to `starter` ($7/mo) for a real always-on guarantee.
4. Deploy. When live, health check is `GET /api/healthz`. **Copy the service URL**, e.g. `https://caremesh-api.onrender.com`.
5. Update the URL in two places so it matches your real service: `RENDER_API_URL` in [`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml), and the rewrite destination in Step 3 below.

## 3. Point the frontend proxy at your Render URL
Edit [`artifacts/web/vercel.json`](artifacts/web/vercel.json) — replace the placeholder host in the `/api/:path*` rewrite with your real Render URL:
```json
{ "source": "/api/:path*", "destination": "https://YOUR-RENDER-URL.onrender.com/api/:path*" }
```
Commit & push. (This proxy keeps the SPA **same-origin**, so cookie auth + CSRF work with **no CORS setup** and no frontend code change.)

## 4. Deploy the Frontend on Vercel
1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory → `artifacts/web`** (important — it's a pnpm monorepo). Framework auto-detects as **Vite**; build settings come from `vercel.json` (`buildCommand: pnpm run build`, `outputDirectory: dist/public`).
3. No frontend env vars are required (the API is reached via the same-origin `/api` rewrite).
4. Deploy → note the URL (e.g. `https://caremesh.vercel.app`).
5. Go back to Render → set `CORS_ORIGIN` to this Vercel URL (belt-and-braces) → save (redeploys).

## 5. Verify end-to-end
- Open the Vercel URL → landing page shows **real stats** (proves the SPA → `/api` proxy → Render → Neon path works).
- Log in as super admin: `admin@northgate.nhs.uk` / `Admin1234!`.
- Team Members → a member's ⋯ → **Verify email** works (proves auth cookies + writes).
- Hard-refresh a deep route like `/patients` → still loads (SPA fallback rewrite).

---

## Environment variable reference
**Backend (Render):**
| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon Postgres, `?sslmode=require`. Read directly by Prisma. |
| `JWT_SECRET` | ✅ | Access-token signing. |
| `JWT_REFRESH_SECRET` | ✅ | Refresh-token signing. |
| `PORT` | ✅ | Injected by Render (10000). App requires it. |
| `NODE_ENV` | ✅ | `production`. |
| `CORS_ORIGIN` | ⛭ | Your Vercel URL. |
| `LOG_LEVEL` | – | `info`. |

**Frontend (Vercel):** none required (same-origin proxy). The MySQL "sync" warning in API logs is a **legacy/optional secondary DB** — safe to ignore unless you wire it up.

## Known limitation on the free plan: uploaded files
Patient file uploads are written to local disk (`artifacts/api-server/uploads/`, see `src/lib/storage.ts`), not cloud storage. Render's filesystem is **ephemeral** — uploaded files are lost on every redeploy and possibly on free-plan spin-down/restart. Fine for demoing; before real clinical use, swap `storage.ts`'s local provider for S3/GCS/Azure Blob (it's already designed to be swappable).

## Ongoing operations
- **Schema changes:** this project uses `prisma db push` (no migration files). After changing `schema.prisma`, run once against prod: `DATABASE_URL=<neon> npx prisma db push` (from `artifacts/api-server`). It is **not** run automatically on deploy, so production data isn't touched unexpectedly.
- **Redeploys:** push to the connected branch → Render rebuilds the API, Vercel rebuilds the SPA automatically.
- **Fresh/empty DB:** push schema (`prisma db push`) then seed (`pnpm --filter @workspace/api-server demo:seed`) before first use.

## Troubleshooting
| Symptom | Cause / Fix |
|---|---|
| First request slow / cron didn't run | Expected on `free` if it fully spun down (keep-alive ping missed a window, or GitHub Actions was delayed). Move to `starter` to eliminate entirely. |
| GitHub Action isn't pinging | Actions on a repo are disabled by default in some settings, and scheduled workflows pause automatically after 60 days with no repo activity — open the Actions tab and re-enable/run it manually (`workflow_dispatch`) if so. |
| Login works but session drops | Cookie/CORS. Ensure you're using the **Vercel domain** (same-origin proxy), not the Render URL directly; set `CORS_ORIGIN` to the Vercel URL. |
| `404` on refresh of `/patients` etc. | SPA fallback rewrite missing — confirm `vercel.json` is at `artifacts/web/` and Root Directory is `artifacts/web`. |
| API 500 at boot | `DATABASE_URL` unset/incorrect or Neon asleep. Check Render logs. |
| Build fails on Vercel | Ensure Root Directory = `artifacts/web`; Vercel uses the repo's `pnpm-lock.yaml` at root. |

## Alternatives (if you outgrow this)
- Backend: Railway, Fly.io, AWS ECS Fargate, Azure App Service (all support always-on + cron).
- For strict UK/EU healthcare data residency, pick EU regions (the blueprint uses Render **frankfurt**) and a provider offering a DPA.
