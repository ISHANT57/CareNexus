# Caremesh PMS — Project Status

_Last updated: 2026-06-08 (full repository audit)_

---

## What This Is

**Caremesh PMS** is a multi-tenant Healthcare Patient Management SaaS for NHS mental health trusts. It enables clinical teams to manage patients, programs, clinics, areas, staff, communications, appointments, consultations, and audit trails within isolated tenant accounts.

---

## Current Build Health

| Layer | Status | Notes |
|---|---|---|
| Database schema | ✅ Complete | 22 Prisma models (incl. Consultation), pushed to PostgreSQL |
| Seed data | ✅ Present | Real Mumbai data: 195 Areas, 707 Clinics, 25 Programs, 8 patients |
| API server | ✅ Builds + 0 TS errors | Express 5, 20 route groups |
| OpenAPI spec | ✅ Complete | `lib/api-spec/openapi.yaml` — 16 modules including Consultations |
| Codegen | ✅ Generated | React Query hooks + Zod schemas in `lib/` |
| Frontend | ✅ Builds + 0 TS errors | 20 pages, sidebar layout, AuthGuard |
| Auth flow | ✅ Tested | Login / register / refresh / me / logout all working |

**Overall Completion: ~82%**

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
- [x] Frontend pages: login, register, forgot-password, reset-password, dashboard, patients list, patient detail, patient new, users list, user new, user detail, clinics, programs, areas, roles, appointments, audit logs, notifications, settings
- [x] AuthGuard protecting all app routes with token-aware redirect
- [x] Mobile responsive sidebar (hamburger menu + slide-in drawer)
- [x] Program Enrollment Module (ACTIVE / COMPLETED / CANCELLED + patient UI + dashboard stats)
- [x] Appointment Management Module (SCHEDULED / COMPLETED / CANCELLED / NO_SHOW + patient UI + global list + dashboard stats + charts)
- [x] Consultation Notes Module (backend: schema, CRUD API, reports; frontend: record dialog, history view; dashboard stats widgets)
- [x] Master Data Migration (195 Areas, 707 Clinics, 25 Programs from MUMBAI.xlsx)
- [x] IMPLEMENTATION_PROGRESS.md, TECHNICAL_DEBT.md, KNOWN_ISSUES.md, CHANGELOG.md created

---

## Pending / In Progress

| Feature | Priority | Status | Notes |
|---|---|---|---|
| DELETE /api/consultations/:id | P1 | 🔴 Not started | Soft-delete + audit log |
| Edit Consultation UI | P1 | 🔴 Not started | PATCH endpoint exists; UI missing |
| Patient Detail Tab Restructure | P2 | 🔴 Not started | Move to Tabs component |
| Record Consultation from Appointment row | P2 | 🔴 Not started | Button on completed appointments |
| Dashboard Consultations-by-Doctor chart | P2 | 🔴 Not started | Data available in API |
| Reports: consultations-by-clinic | P2 | 🔴 Not started | New report endpoint + UI |
| Reports: consultations-by-program | P2 | 🔴 Not started | New report endpoint + UI |
| Reports: follow-ups required | P2 | 🔴 Not started | New report endpoint + UI |
| Granular permission enforcement (role_permissions) | P1 | 🔴 Not started | UI exists; no runtime effect |
| CSRF Protection | P2 | 🔴 Not started | Double-submit cookie or csurf |
| Automated test suite | P1 | 🔴 Not started | Vitest + Playwright |
| Cloud object storage for files | P2 | 🔴 Not started | Local disk is ephemeral |

---

## Known Bugs / Issues

See `KNOWN_ISSUES.md` for the full list. Key items:

1. **KI-001** — DELETE /api/consultations/:id missing
2. **KI-002** — Edit Consultation UI not implemented
3. **KI-007** — Role permissions UI has no runtime effect on access control
4. **KI-008** — File uploads stored on local disk (ephemeral on cloud deployments)
5. **KI-010** — Appointment complete creates `PSI` journey event (should be `APPOINTMENT_COMPLETED`)

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

---

## Module Completion Summary

| Module | % Complete |
|---|---|
| Authentication & Security | 90% |
| User & Role Management | 85% |
| Patient Management | 95% |
| Appointments | 90% |
| Consultation Notes | 70% |
| Program Enrollments | 95% |
| Dashboard & Reports | 75% |
| Communications (SMS) | 90% |
| File Uploads | 70% |
| Audit Logging | 100% |
| Data Migration | 100% |
| **Overall** | **82%** |
