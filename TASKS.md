# TASKS.md — Caremesh PMS Work Queue

_Last updated: 2026-06-08 (full repository audit)_

---

## How to Read This File

- **Status:** 🔴 Not started | 🟡 In progress | 🟢 Complete | ⚫ Blocked
- **Priority:** P1 = must ship soon | P2 = important | P3 = nice to have | P4 = future phase
- Tasks are ordered by priority within each category.
- Before starting any task, read ARCHITECTURE.md and DECISIONS.md.

---

## 🔴 Open Tasks — Consultation Module Gaps

### CONSULT-001 — DELETE /api/consultations/:id (P1)
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/consultations.ts`  
**Description:** Implement soft-delete. Set `deletedAt = now()`. Create audit log entry. RBAC: CLINICAL_ROLES.

### CONSULT-002 — Edit Consultation UI (P1)
**Status:** 🔴 Not started  
**File:** `artifacts/web/src/pages/patient-detail.tsx`  
**Description:** Add Edit button on each consultation card. Open dialog with pre-filled fields. Call PATCH `/api/consultations/:id`.

### CONSULT-003 — Patient Detail Tab Restructure (P2)
**Status:** 🔴 Not started  
**File:** `artifacts/web/src/pages/patient-detail.tsx`  
**Description:** Refactor scrolling card layout to `<Tabs>` with tabs: Overview | Journey | Appointments | Consultations | Files | Communications. Do not remove any functionality.

### CONSULT-004 — Record Consultation Button on Appointment Rows (P2)
**Status:** 🔴 Not started  
**File:** `artifacts/web/src/pages/patient-detail.tsx`, `artifacts/web/src/pages/appointments.tsx`  
**Description:** On COMPLETED appointment rows, add a "Record Consultation" button that opens the consultation dialog with the appointmentId pre-filled.

### CONSULT-005 — Dashboard Consultations-by-Doctor Chart (P2)
**Status:** 🔴 Not started  
**File:** `artifacts/web/src/pages/dashboard.tsx`  
**Description:** Add a BarChart using `consultationStats.consultationsByDoctor[]`. Use `hsl(var(--chart-3))` color. Match existing chart style.

### CONSULT-006 — Reports: consultations-by-clinic (P2)
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/reports.ts`  
**Description:** `GET /api/reports/consultations-by-clinic`. Group by clinicId, join clinic name. Tenant isolated.

### CONSULT-007 — Reports: consultations-by-program (P2)
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/reports.ts`  
**Description:** `GET /api/reports/consultations-by-program`. Group consultations by patient's programId. Tenant isolated.

### CONSULT-008 — Reports: follow-ups required (P2)
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/reports.ts`  
**Description:** `GET /api/reports/follow-ups`. Return patients who have a consultation with non-empty `followUpInstructions` and no newer consultation. Tenant isolated.

---

## 🔴 Open Tasks — Security & Architecture

### SEC-003 — Enforce Granular Permissions from role_permissions Table (P1)
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/middlewares/rbac.ts`  
**Description:** The permissions UI exists but has no runtime effect. Extend `authorize()` to load the permission set from `role_permissions` and check against it.

### SEC-004 — CSRF Protection (P2)
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/app.ts`  
**Description:** Add CSRF token validation for all state-changing routes. Use double-submit cookie or `csurf` library.

---

## 🔴 Open Tasks — Quality & Stability

### QA-001 — Automated Test Suite (P1)
**Status:** 🔴 Not started  
**Description:** Add Vitest unit tests for API route handlers. Add supertest integration tests for auth flow. Add Playwright e2e tests for critical user journeys.

### QA-002 — Remove Duplicate handleCompleteAppointment (P3)
**Status:** 🔴 Not started  
**File:** `artifacts/web/src/pages/patient-detail.tsx` (lines 210–219)  
**Description:** Remove the unused `handleCompleteAppointment` function. Use `handleAppointmentAction(id, 'complete')` consistently.

### QA-003 — Clarify Appointment Complete Journey Event (P3)
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/appointments.ts` (line 145)  
**Description:** Appointment completion creates a `PSI` journey event. Change to `APPOINTMENT_COMPLETED` to avoid confusion with `CONSULTATION_COMPLETED` created by the consultation endpoint.

---

## 🔴 Infrastructure Tasks

### INFRA-001 — Cloud Object Storage for File Uploads (P2)
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/files.ts`  
**Description:** Replace local `multer` disk storage with AWS S3 or Cloudflare R2. Store cloud URL in `file_uploads.fileUrl`.

### INFRA-002 — Document Twilio Env Variables (P3)
**Status:** 🔴 Not started  
**Files:** `PROJECT_STATUS.md`, `.env.example`  
**Description:** Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` to the environment variables table.

### INFRA-003 — Update ARCHITECTURE.md Route List (P3)
**Status:** 🔴 Not started  
**File:** `ARCHITECTURE.md`  
**Description:** Routes section is missing: `files.ts`, `import.ts`, `programEnrollments.ts`, `appointments.ts`, `consultations.ts`.

---

## 🔴 Future Phase (P4)

| ID | Feature |
|---|---|
| FUTURE-001 | EMIS / SystmOne clinical system integration |
| FUTURE-002 | Patient-facing portal (separate Expo mobile app) |
| FUTURE-003 | Advanced BI dashboards with materialized views |
| FUTURE-004 | Automated journey milestone alerts |
| FUTURE-005 | Legacy data migration scripts from `goqii_*` tables |
| FUTURE-006 | Multi-region deployment (NHS data residency requirements) |
| FUTURE-007 | FHIR R4 API layer for EHR interoperability |
| FUTURE-008 | Appointment reminder notifications |
| FUTURE-009 | Patient de-duplication / merge workflow |

---

## ✅ Completed Tasks

| ID | Task |
|---|---|
| DONE-001 | PostgreSQL schema (22 Prisma models incl. Consultation) |
| DONE-002 | Seed data (1 tenant, areas, clinics, programs, patients) |
| DONE-003 | Express 5 API server with pino logging |
| DONE-004 | JWT auth (login, register, refresh token rotation, logout, /me) |
| DONE-005 | RBAC middleware (6 roles, 5 role groups) |
| DONE-006 | Tenant isolation middleware (requireTenant + assertTenantMatch) |
| DONE-007 | Full CRUD routes for all 14 original resource groups |
| DONE-008 | Audit log (createAuditLog helper, all mutations) |
| DONE-009 | OpenAPI spec (openapi.yaml) |
| DONE-010 | Orval codegen (React Query hooks + Zod schemas) |
| DONE-011 | React + Vite frontend with Tailwind + shadcn/ui |
| DONE-012 | 20 frontend pages with AuthGuard |
| DONE-013 | Dashboard with Recharts (stats cards, multiple charts, activity feed) |
| DONE-014 | Fixed `ok()` wrapper — all responses match OpenAPI spec |
| DONE-015 | Fixed all `req.params` type errors (Express 5) |
| DONE-016 | Fixed frontend TS errors |
| DONE-017 | BUG-001: Fixed Recent Activity — `activity.user` → `activity.actor` |
| DONE-018 | BUG-002: Fixed patient status badge colour |
| DONE-019 | BUG-003: Verified register.tsx already persists tokens and redirects |
| DONE-020 | FEAT-001: Patient status-change UI |
| DONE-021 | FEAT-002: Patient journey timeline UI |
| DONE-022 | BUG-004: AuthGuard flash on hard refresh — FIXED |
| DONE-023 | FEAT-003: Doctor-patient assignment UI |
| DONE-024 | FEAT-004: User edit page (`/users/:id`) |
| DONE-025 | FEAT-006: Programs / Areas / Clinics inline edit + delete |
| DONE-026 | FEAT-007: Forgot-password and reset-password flows |
| DONE-027 | FEAT-008: Pagination on all list views |
| DONE-028 | FEAT-009: Role permissions management UI |
| DONE-029 | FEAT-005: SMS compose UI on patient-detail |
| DONE-030 | FEAT-011: Assignment notification trigger |
| DONE-031 | FEAT-012: Twilio live SMS sending |
| DONE-032 | SEC-001: Moved tokens to HttpOnly cookies |
| DONE-033 | FEAT-010: File uploads (multer + patient-detail UI) |
| DONE-034 | FEAT-013: Bulk patient CSV import |
| DONE-035 | SEC-002: Email verification gating |
| DONE-036 | FEAT-014: Program Enrollment Module (backend + frontend + dashboard) |
| DONE-037 | FEAT-015: Appointment Management Module (full backend + frontend + dashboard) |
| DONE-038 | MIGRATION-001: Master Data Migration (195 Areas, 707 Clinics, 25 Programs from MUMBAI.xlsx) |
| DONE-039 | FEAT-016: Consultation Notes Module — backend (schema, API, reports, openapi, codegen) |
| DONE-040 | FEAT-016: Consultation Notes Module — frontend (Record dialog, history view, dashboard stats) |
| DONE-041 | DOC-001: DATABASE_MAPPING.md updated with appointments + consultations tables |
| DONE-042 | DOC-002: API_CONTRACTS.md updated with appointment + consultation endpoints |
