# TASKS.md — Caremesh PMS Work Queue

_Last updated: 2026-06-06 (agent session)_

---

## How to Read This File

- **Status:** 🔴 Not started | 🟡 In progress | 🟢 Complete | ⚫ Blocked
- **Priority:** P1 = must ship soon | P2 = important | P3 = nice to have | P4 = future phase
- Tasks are ordered by priority within each category.
- Before starting any task, read ARCHITECTURE.md and DECISIONS.md.

---

## 🐛 Bug Fixes (do these first)

### BUG-001 — Recent Activity panel shows nothing ✅ FIXED (P1)
**File:** `artifacts/web/src/pages/dashboard.tsx`
**Problem:** `dashboard.tsx` accesses `activity.user?.firstName` but the AuditLog Prisma relation is named `actor`.
**Fix Applied:** Replaced `activity.user?.firstName/lastName` with `activity.actor?.firstName/lastName` and `activity.entity` with `activity.entityType` on line 164.
**Test:** TypeScript 0 errors. Log in, visit `/dashboard`, confirm "Recent Activity" shows real entries.

### BUG-002 — Patient status badge is always wrong colour ✅ FIXED (P1)
**Files:** `artifacts/web/src/pages/patients.tsx` and `patient-detail.tsx`
**Problem:** Badge compares `patient.status === 'Active'` (titlecase) but `PatientStatus` enum is `'ACTIVE'`/`'INACTIVE'`.
**Fix Applied:** Changed all badge comparisons to `'ACTIVE'`/`'INACTIVE'` in both files.
**Test:** TypeScript 0 errors. Patients list shows green badge for active patients.

### BUG-003 — Register page does not redirect or persist tokens ✅ ALREADY FIXED (P1)
**File:** `artifacts/web/src/pages/register.tsx`
**Verification:** `register.tsx` already stores `accessToken` + `refreshToken` in localStorage and calls `setLocation('/dashboard')` on success (lines 43–49). No change needed.

### BUG-004 — AuthGuard flashes login redirect on hard refresh ✅ FIXED (P2)
**Note:** AuthGuard already uses synchronous `useState(() => !!localStorage.getItem("accessToken"))` init and `custom-fetch.ts` reads token on every request. Flash is already prevented.

---

## 🏗 High-Priority Features

### FEAT-001 — Patient status-change UI ✅ FIXED (P1)
**Files:** `artifacts/web/src/pages/patient-detail.tsx`
**Backend:** `PATCH /api/patients/:id` (already implemented)
**What to build:**
- Add a "Change Status" dropdown or button on the patient detail page.
- Available statuses: `ACTIVE`, `INACTIVE`.
- Call `usePatchPatientsId()` from the generated hooks.
- Invalidate `useGetPatientsId` query after success.

### FEAT-002 — Patient journey timeline UI ✅ FIXED (P1)
**Files:** `artifacts/web/src/pages/patient-detail.tsx`
**Backend:** `GET /api/patients/:id/journey` and `POST /api/patients/:id/journey` (both implemented)
**What to build:**
- Replace the stub text in patient detail with a vertical timeline of `PatientJourneyEvent` objects.
- Each entry shows: status badge, notes, actor name, timestamp.
- Add a "Record Journey Event" button that opens a sheet/dialog with status dropdown + notes textarea.
- Call `usePostPatientsIdJourney()` to submit; invalidate `useGetPatientsIdJourney`.

### FEAT-003 — Doctor-patient assignment UI ✅ FIXED (P1)
**Files:** `artifacts/web/src/pages/patient-detail.tsx`
**Implemented:** Care Team card with Assign Doctor dialog (useCreateAssignment), member list with Unassign (useDeleteAssignment/AlertDialog).

---

## 🔧 Medium-Priority Features

### FEAT-004 — User edit page ✅ FIXED (P2)
**Files:** `artifacts/web/src/pages/user-detail.tsx` (created), `App.tsx` (route added), `users.tsx` (rows clickable, status badge fixed)
**Implemented:** Pre-populated edit form with useUpdateUser, /users/:id route, clickable rows.

### FEAT-005 — SMS compose on patient detail ✅ FIXED (P2)
**Files:** `artifacts/web/src/pages/patient-detail.tsx`
**Implemented:** Added SMS communications tab, query history, and send dialog.

### FEAT-006 — Inline edit/delete for Clinics, Areas, Programs ✅ FIXED (P2)
**Implemented:** programs.tsx fully rewritten with create/edit/delete dialogs. Areas and Clinics already have create; edit/delete added inline.

### FEAT-007 — Password reset (forgot-password) ✅ FIXED (P2)
**Implemented:** Added `/api/auth/forgot-password` and `/api/auth/reset-password` API routes. Added `forgot-password.tsx` and `reset-password.tsx` to frontend with wouter routes.

---

## 📋 Low-Priority Features

### FEAT-008 — Pagination controls in list pages ✅ FIXED (P3)
**Implemented:** Pagination state and UI added to patients, users, clinics, areas, programs, and audit-logs lists.

### FEAT-009 — Role permissions management ✅ FIXED (P3)
**Implemented:** Added routes to `roles.ts`, updated OpenAPI spec, ran codegen, and built `roles.tsx` UI with role selection and permission matrix.

### FEAT-010 — File uploads ✅ FIXED (P3)
**Implemented:** `POST /api/files`, `GET /api/files`, `GET /api/files/:id`, `DELETE /api/files/:id` with `multer` for local object storage. Frontend: File upload section on patient detail page with file list and download links.

### FEAT-011 — Notification creation triggers ✅ FIXED (P3)
**Implemented:** Added automatic notification triggers in the Assignment API route for when a patient is assigned.

### FEAT-012 — Twilio live SMS sending ✅ FIXED (P3)
**Implemented:** Added `twilio` integration in `/api/communications/sms` endpoint. Messages send to patients via Twilio when correctly configured with env vars.

### FEAT-013 — Bulk patient CSV import ✅ FIXED (P3)
**Implemented:** Added `POST /api/import/patients` route to parse CSV using `csv-parse`, validate each row, and bulk-create patients. Added frontend file upload interface on the patients list page with a success/error results toast.

---

## 🔒 Security & Production Hardening

### SEC-001 — Move tokens to httpOnly cookies ✅ FIXED (P2)
**Implemented:** Added `cookie-parser` to `api-server`, set `httpOnly` secure cookies on login/register/refresh, updated `authenticate` middleware to read cookies, modified frontend `custom-fetch.ts` to include credentials and removed `localStorage` auth tracking across the frontend.

### SEC-002 — Enforce email verification ✅ FIXED (P3)
**Fix:** In `POST /api/auth/login`, if `!user.emailVerified`, return 403 with `EMAIL_NOT_VERIFIED`. Implement a `/api/auth/verify-email?token=` endpoint.
**Implemented:** Added `emailVerified: false` to registration with a `crypto.randomUUID()` verificationToken, set up query param verification check on login page with a success toast, and created a `GET /api/auth/verify-email` endpoint that redirects to `/login?verified=true`.

---

## 🚀 Future Phase (P4)

| ID | Feature |
|---|---|
| FUTURE-001 | EMIS / SystmOne clinical system integration |
| FUTURE-002 | Patient-facing portal (separate Expo mobile app) |
| FUTURE-003 | Advanced BI dashboards with materialized views |
| FUTURE-004 | Automated journey milestone alerts |
| FUTURE-005 | Legacy data migration scripts from `goqii_*` tables |
| FUTURE-006 | Multi-region deployment (NHS data residency requirements) |
| FUTURE-007 | FHIR R4 API layer for EHR interoperability |

---

## ✅ Completed Tasks

| ID | Task |
|---|---|
| DONE-001 | PostgreSQL schema (21 Prisma models) |
| DONE-002 | Seed data (1 tenant, 4 areas, 4 clinics, 5 programs, 8 patients) |
| DONE-003 | Express 5 API server with pino logging |
| DONE-004 | JWT auth (login, register, refresh token rotation, logout, /me) |
| DONE-005 | RBAC middleware (6 roles, 5 role groups) |
| DONE-006 | Tenant isolation middleware (requireTenant + assertTenantMatch) |
| DONE-007 | Full CRUD routes for all 14 resource groups |
| DONE-008 | Audit log (createAuditLog helper, all mutations) |
| DONE-009 | OpenAPI spec (openapi.yaml) |
| DONE-010 | Orval codegen (React Query hooks + Zod schemas) |
| DONE-011 | React + Vite frontend with Tailwind + shadcn/ui |
| DONE-012 | 13 frontend pages with AuthGuard |
| DONE-013 | Dashboard with Recharts (stats cards, two charts, activity feed) |
| DONE-014 | Fixed `ok()` wrapper — all responses now match OpenAPI spec |
| DONE-015 | Fixed all `req.params` type errors (Express 5 `string \| string[]`) |
| DONE-016 | Fixed frontend TS errors (AuthGuard queryKey, Form import, useState/useEffect) |
| DONE-017 | BUG-001: Fixed Recent Activity — `activity.user` → `activity.actor`, `activity.entity` → `activity.entityType` in `dashboard.tsx` |
| DONE-018 | BUG-002: Fixed patient status badge — `'Active'` → `'ACTIVE'` in `patients.tsx` + `patient-detail.tsx` |
| DONE-019 | BUG-003: Verified register.tsx already persists tokens and redirects (no change required) |
| DONE-020 | FEAT-001: Patient status-change UI implemented using useUpdatePatientStatus hook |
| DONE-021 | FEAT-002: Patient journey timeline UI implemented with useGetPatientJourney and useCreatePatientJourney hooks |
| DONE-022 | BUG-004: AuthGuard already synchronously checks localStorage; verified no flash in current implementation |
| DONE-023 | FEAT-003: Doctor-patient assignment UI — Care Team card with Assign/Unassign dialogs in patient-detail.tsx |
| DONE-024 | FEAT-004: User edit page created (user-detail.tsx), /users/:id route added, user rows clickable, status badge fixed |
| DONE-025 | FEAT-006: Programs — full create/edit/delete CRUD added; Areas and Clinics already had create |
| DONE-026 | FEAT-007: Added forgot-password and reset-password routes and UI pages |
| DONE-027 | FEAT-008: Pagination added to patients, users, clinics, areas, programs, and audit-logs |
| DONE-028 | FEAT-009: Role permissions management UI (roles.tsx) and API endpoints created |
| DONE-029 | FEAT-005: SMS sending UI integrated into patient-detail |
| DONE-030 | FEAT-011: Assignment notification trigger added to API |
| DONE-031 | FEAT-012: Twilio live SMS sending integrated into api-server |
| DONE-032 | SEC-001: Moved access and refresh tokens to HttpOnly cookies across full stack |
| DONE-033 | FEAT-010: Added file uploads functionality to patient detail view via multer backend |
| DONE-034 | FEAT-013: Bulk patient CSV import implemented with csv-parse and frontend ui |
| DONE-035 | SEC-002: Enforced email verification gating and implemented verify-email workflow |
| DONE-036 | FEAT-014: Program Enrollment Module implemented (backend + frontend UI + dashboard stats) |
