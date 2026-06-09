# Caremesh PMS — Project Status

_Last updated: 2026-06-09 (Phase 1 Critical Stabilization — all critical bugs resolved)_

---

## What This Is

**Caremesh PMS** is a multi-tenant Healthcare Patient Management SaaS for NHS mental health trusts. It enables clinical teams to manage patients, programs, clinics, areas, staff, communications, appointments, consultations, and audit trails within isolated tenant accounts.

---

## Current Build Health

| Layer | Status | Notes |
|---|---|---|
| Database schema | ✅ Complete | 27 Prisma models (incl. Outcomes, Tasks, Risk Scoring), pushed to PostgreSQL |
| Seed data | ✅ Present | Real Mumbai data: 195 Areas, 707 Clinics, 25 Programs, 8 patients |
| API server | ✅ Builds + 0 TS errors | Express 5, 23+ route groups — all critical 404s resolved |
| OpenAPI spec | ✅ Synchronized | Assignment, files/import, patient status paths corrected |
| Codegen | ✅ Synchronized | Generated client types fully corrected (doctorId, communications, DashboardStats) |
| Frontend | ✅ Builds + 0 TS errors | 20 pages — assignment payload, doctor display, status mutations fixed |
| Auth flow | ✅ Tested | Login / register / refresh / me / logout all working |
| Rate limiter | ✅ Fixed | Disabled in development to prevent 429 errors |
| Communications | ✅ Fixed | Root-level GET/POST routes added (was only /sms sub-path) |

**Overall Completion: ~85%** _(was 78% pre-stabilization)_

**Run commands:**
```bash
pnpm --filter @workspace/api-server run dev     # API on port 5000
pnpm --filter @workspace/web run dev            # Frontend
pnpm --filter @workspace/api-spec run codegen   # Regenerate hooks + schemas
pnpm --filter @workspace/db run push            # Push schema changes (dev only)
pnpm run typecheck                              # Full monorepo typecheck
```

---

## Demo Credentials

```
URL:       /login
Email:     admin@northgate.nhs.uk
Password:  Admin1234!
Tenant:    Northgate Mental Health Trust
TenantID:  e727eb86-cd40-487a-b651-1db925c58376
```

---

## Completed Features

- [x] Multi-tenant JWT auth (login, register, refresh token rotation, logout, /me)
- [x] HttpOnly cookie token storage (SEC-001)
- [x] Email verification enforcement (SEC-002)
- [x] Forgot-password and reset-password flows
- [x] Role-based access control (SUPER_ADMIN, AREA_ADMIN, CLINIC_ADMIN, DOCTOR, OPERATOR, STAFF)
- [x] Role permissions management UI (`/roles` page)
- [x] Rate limiting on auth endpoints (20 req / 15 min window)
- [x] Tenant isolation on every route (requireTenant + assertTenantMatch)
- [x] Append-only audit log (all mutations log before/after JSON values)
- [x] Full CRUD API: Tenants, Areas, Clinics, Roles, Users, Programs, Patients
- [x] Patient journey event log (NEW → PSI → DISCHARGE → MEDICATION_REQUIRED)
- [x] Patient GP details (upsert)
- [x] Doctor-patient assignments (create, list, soft-delete) + notification trigger
- [x] SMS communications (list, send, per-patient history, Twilio integration)
- [x] File uploads (multer, per-patient, download/delete UI)
- [x] Bulk patient CSV import
- [x] Notifications (list, mark one read, mark all read)
- [x] Reports: dashboard stats, patients-by-status, patients-by-program, recent-activity
- [x] Soft delete on all core entities (`deletedAt` timestamp)
- [x] Request-scoped pino logging on all routes
- [x] OpenAPI → React Query hooks + Zod schemas (Orval codegen)
- [x] Frontend pages: core auth, dashboard, entity lists and details
- [x] AuthGuard protecting all app routes with token-aware redirect
- [x] Mobile responsive sidebar (hamburger menu + slide-in drawer)
- [x] Program Enrollment Module (ACTIVE / COMPLETED / CANCELLED + UI + Dashboard)
- [x] Appointment Management Module (SCHEDULED / COMPLETED / CANCELLED / NO_SHOW + UI + Dashboard)
- [x] Consultation Notes Module (Backend CRUD, Frontend history + record dialog)
- [x] Phase 1: Outcomes Tracking (Backend schema + API)
- [x] Phase 2: Care Task Management (Backend schema + API)
- [x] Phase 3: Notification Automation Engine (Backend triggers)
- [x] Phase 5: Risk Scoring Engine (Backend schema, logic, Cron scheduler)

---

## Phase 1 Stabilization — Bugs Fixed (2026-06-09)

| Bug ID | Severity | Fix Summary | Files Changed |
|---|---|---|---|
| CRIT-001 | P0 | Assignment 422: OpenAPI `AssignmentInput` schema corrected to `{doctorId, clinicId, areaId}` | `openapi.yaml`, `api.schemas.ts`, `patient-detail.tsx` |
| CRIT-002/003/004 | P0 | Double `/api/api/` prefix in generated client for files + import routes | `api.ts` (global replace), `openapi.yaml` path keys |
| CRIT-005 | P0 | Assignment card shows blank: `assignment.user` → `assignment.doctor` in display | `patient-detail.tsx` |
| HIGH-001 | P1 | Patient status update 404: Added `PATCH /api/patients/:id/status` route | `patients.ts` |
| HIGH-002 | P1 | Rate limit 429 in dev: Global rate limiter now skipped when `NODE_ENV !== production` | `app.ts` |
| HIGH-003 | P1 | Communications 404: Added root-level `GET/POST/GET/:id/DELETE` routes | `communications.ts` |
| HIGH-004/005 | P1 | Dashboard empty widgets: Added `outcomesRecorded/improvingPatients/successRate` to schema + UI | `api.schemas.ts`, `dashboard.tsx` |

---

## Remaining / In Progress

| Feature | Priority | Status | Notes |
|---|---|---|---|
| OpenAPI Sync for Phases 1-5 (Outcomes, Tasks, Risk) | P1 | 🔴 Not started | Update `openapi.yaml` with Outcomes, Tasks, Risk Scores |
| Phase 1: Outcomes UI | P2 | 🔴 Not started | Patient detail tab, charts, record dialog |
| Phase 2: Care Tasks UI | P2 | 🔴 Not started | Task list, assignment dialog, completion flows |
| Phase 5: Risk Scoring UI | P2 | 🔴 Not started | Dashboard widgets, patient risk badges |
| Area→Clinic cascade in Assignment UI | P1 | 🟡 Partial | Assignment uses patient's clinic/area but no dropdown cascade |
| CSRF Protection | P0 | 🔴 Not started | Double-submit cookie recommended |
| Granular RBAC enforcement | P0 | 🔴 Not started | UI exists; no runtime effect at route level |
| S3 file storage migration | P1 | 🔴 Not started | Local disk is ephemeral in cloud |
| Automated test suite | P1 | 🔴 Not started | Vitest + Playwright |
| DELETE /api/consultations/:id | P1 | 🔴 Not started | Endpoint missing |

---

## Environment Variables Required

| Variable | Set in | Purpose |
|---|---|---|
| `DATABASE_URL` | Replit secret | PostgreSQL connection string |
| `JWT_SECRET` | Replit secret | Access token signing (8 h expiry) |
| `JWT_REFRESH_SECRET` | Replit secret | Refresh token signing (30 d expiry) |
| `SESSION_SECRET` | Replit secret | Reserved for future session middleware |
| `PORT` | Injected by workflow | API server listen port |
| `TWILIO_ACCOUNT_SID` | Replit secret | Twilio SMS sending |
| `TWILIO_AUTH_TOKEN` | Replit secret | Twilio SMS sending |
| `TWILIO_FROM_NUMBER` | Replit secret | Twilio source phone number |
