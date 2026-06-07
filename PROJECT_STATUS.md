# Caremesh PMS — Project Status

_Last updated: 2026-06-08 (agent session)_

---

## What This Is

**Caremesh PMS** is a multi-tenant Healthcare Patient Management SaaS for NHS mental health trusts. It enables clinical teams to manage patients, programs, clinics, areas, staff, communications, and audit trails within isolated tenant accounts.

---

## Current Build Health

| Layer | Status | Notes |
|---|---|---|
| Database schema | ✅ Complete | 21 Prisma models, pushed to PostgreSQL |
| Seed data | ✅ Present | 1 tenant, 4 areas, 4 clinics, 5 programs, 8 patients |
| API server | ✅ Builds + 0 TS errors | Express 5, 14 route groups |
| OpenAPI spec | ✅ Complete | `lib/api-spec/openapi.yaml` |
| Codegen | ✅ Generated | React Query hooks + Zod schemas in `lib/` |
| Frontend | ✅ Builds + 0 TS errors | 13 pages, sidebar layout, AuthGuard |
| Auth flow | ✅ Tested | Login / register / refresh / me / logout all working |

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
- [x] Role-based access control (SUPER_ADMIN, AREA_ADMIN, CLINIC_ADMIN, DOCTOR, OPERATOR, STAFF)
- [x] Full CRUD API: Tenants, Areas, Clinics, Roles, Users, Programs, Patients
- [x] Patient journey event log (NEW → PSI → DISCHARGE → MEDICATION_REQUIRED)
- [x] Patient GP details (upsert)
- [x] Doctor-patient assignments (create, list, soft-delete)
- [x] SMS communications (list, send, per-patient history, Twilio webhook stub)
- [x] Notifications (list, mark one read, mark all read)
- [x] Append-only audit log (all mutations log before/after JSON values)
- [x] Reports: dashboard stats, patients-by-status, patients-by-program, recent activity
- [x] Soft delete on all core entities (`deletedAt` timestamp)
- [x] Rate limiting on auth endpoints (20 req / 15 min window)
- [x] Request-scoped pino logging on all routes
- [x] Tenant isolation assertion on every tenant-scoped route
- [x] OpenAPI → React Query hooks + Zod schemas (Orval codegen)
- [x] Frontend pages: login, register, dashboard (Recharts), patients list, patient detail, patient new, users list, user new, clinics, programs, areas, audit logs, settings, notifications
- [x] AuthGuard protecting all app routes with token-aware redirect
- [x] Patient status-change button (ACTIVE/INACTIVE dropdown on patient detail)
- [x] Patient journey timeline UI (vertical timeline with Record Event dialog)
- [x] Doctor assignment UI on patient detail (Care Team card with Assign Doctor / Unassign)
- [x] SMS compose UI on patient detail (Send SMS dialog + history)
- [x] User edit page (`/users/:id` with full form and role selection)
- [x] Clinic inline edit + delete (Pencil/Trash per row with AlertDialog confirmation)
- [x] Area inline edit + delete (Pencil/Trash per card with AlertDialog confirmation)
- [x] Program inline edit + delete (Pencil/Trash per card)
- [x] File uploads (Upload/Delete/Download on patient detail Files tab)
- [x] Pagination controls in all list views (Patients, Users, Clinics, Programs, Areas)
- [x] Bulk patient CSV import UI (Import CSV button on patients list)
- [x] Roles management UI (`/roles` page with full CRUD and permission management)
- [x] AuthGuard flash on hard refresh — FIXED (token getter initialised at module load; query disabled when no token)
- [x] Mobile responsive sidebar (hamburger menu + slide-in drawer on small screens)

---

## Pending / Not Yet Built

| Feature | Priority | Notes |
|---|---|---|
| Notifications creation (server-side triggers) | Medium | Read/mark-read works; nothing creates notifications |
| Twilio SMS live sending | Low | Webhook handler exists; actual `twilio.messages.create()` not wired |
| File upload to object storage | Low | Schema exists; no cloud storage integration |
| Email verification enforcement | Low | `emailVerified` field exists; not enforced on login |
| Role permissions management UI | Low | `role_permissions` table exists; no CRUD route or UI |

---

## Known Bugs

1. ~~**Recent Activity shows nothing**~~ ✅ **FIXED** — Changed `activity.user` → `activity.actor` and `activity.entity` → `activity.entityType` in `dashboard.tsx` (line 164). TypeScript passes.

2. ~~**Patient status badge colour is always wrong**~~ ✅ **FIXED** — Changed `patient.status === 'Active'` → `patient.status === 'ACTIVE'` in both `patients.tsx` (line 82) and `patient-detail.tsx` (line 68).

3. ~~**Register page does not redirect after success**~~ ✅ **ALREADY FIXED** — `register.tsx` already stores tokens in localStorage and calls `setLocation('/dashboard')` (lines 43–49). No change needed.

4. ~~**AuthGuard flash on hard refresh**~~ ✅ **FIXED** — `setAuthTokenGetter` now called at module load time in `AuthGuard.tsx`. Query is disabled when no token is present, eliminating the spurious redirect to `/login`.

5. **No CSRF protection** — Tokens are stored in `localStorage`, which is XSS-accessible. For production: move to `httpOnly` + `SameSite=Strict` cookies.

---

## Environment Variables Required

| Variable | Set in | Purpose |
|---|---|---|
| `DATABASE_URL` | Replit secret | PostgreSQL connection string |
| `JWT_SECRET` | Replit secret | Access token signing (8 h expiry) |
| `JWT_REFRESH_SECRET` | Replit secret | Refresh token signing (30 d expiry) |
| `SESSION_SECRET` | Replit secret | Reserved for future session middleware |
| `PORT` | Injected by workflow | API server listen port |
