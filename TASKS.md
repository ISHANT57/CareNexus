# TASKS.md — Caremesh PMS Work Queue

_Last updated: 2026-06-08 (full repository audit)_

---

## How to Read This File

- **Status:** 🔴 Not started | 🟡 In progress | 🟢 Complete | ⚫ Blocked
- **Priority:** 
  - **P0 Critical:** Production blockers, security holes, API contracts preventing frontend development.
  - **P1 High:** Important features required for core operational workflows.
  - **P2 Medium:** Missing UI for existing backend logic, minor bug fixes.
  - **P3 Low:** Infrastructure, refactoring, nice-to-haves.
- Before starting any task, verify the codebase directly.

---

## 🔴 P0 Critical (Production Blockers)

### SEC-003 — Enforce Granular Permissions from role_permissions Table
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/middlewares/rbac.ts`  
**Description:** The permissions UI exists and updates the database, but it has no runtime effect on access control. Extend `authorize()` to load the permission set from `role_permissions` and check against it.  
**Impact:** Severe security flaw. Users have access to all routes allowed by their static role grouping, bypassing customized granular permissions.  
**Acceptance Criteria:** A user lacking a specific `permissionId` is rejected with `403 Forbidden` even if their role group is otherwise permitted.

### SEC-004 — CSRF Protection
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/app.ts`  
**Description:** Add CSRF token validation for all state-changing routes. Use double-submit cookie or `csurf` library.  
**Impact:** Severe security flaw. API is vulnerable to Cross-Site Request Forgery.  
**Acceptance Criteria:** `POST`, `PATCH`, `DELETE` requests without a valid CSRF token are rejected.

### SYNC-001 — Update OpenAPI Specification for Phases 1-5
**Status:** 🔴 Not started  
**File:** `lib/api-spec/openapi.yaml`  
**Description:** The backend routes for `outcomes`, `outcome-metrics`, `tasks`, and `risk-scores` exist, but the OpenAPI contract is missing them. Add definitions and run Orval codegen.  
**Impact:** Blocks all frontend development for Phase 1, Phase 2, and Phase 5 features.  
**Acceptance Criteria:** `openapi.yaml` accurately describes the new routes. `pnpm --filter @workspace/api-spec run codegen` succeeds and produces the required React Query hooks.

---

## 🔴 P1 High (Core Workflows)

### CONSULT-001 — DELETE /api/consultations/:id
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/consultations.ts`  
**Description:** Implement soft-delete for consultations. Set `deletedAt = now()`. Create audit log entry. RBAC: CLINICAL_ROLES.  
**Impact:** Users cannot delete erroneously entered consultation records.  
**Acceptance Criteria:** Successful DELETE returns `204`, sets `deletedAt`, and creates an AuditLog entry.

### CONSULT-002 — Edit Consultation UI
**Status:** 🔴 Not started  
**File:** `artifacts/web/src/pages/patient-detail.tsx`  
**Description:** Add an Edit button on each consultation card. Open a dialog with pre-filled fields. Call PATCH `/api/consultations/:id`.  
**Impact:** Users cannot fix typos or amend consultation notes.  
**Acceptance Criteria:** Editing updates the record dynamically in the UI.

### FEAT-017 — Phase 1 Outcomes UI
**Status:** 🔴 Not started  
**Files:** `artifacts/web/src/pages/patient-detail.tsx`, `artifacts/web/src/pages/dashboard.tsx`  
**Description:** Build the frontend for the Outcomes API. Add an "Outcomes" tab to patient detail, outcome tracking charts, and a "Record Outcome" dialog.  
**Impact:** Outcome Tracking backend is unreachable.  
**Acceptance Criteria:** Users can record, view, and graph clinical and lifestyle outcomes.

### FEAT-018 — Phase 2 Care Tasks UI
**Status:** 🔴 Not started  
**Files:** `artifacts/web/src/pages/patient-detail.tsx`, `artifacts/web/src/pages/dashboard.tsx`  
**Description:** Build the frontend for Care Tasks. Add task assignment workflows, overdue highlighting, and completion toggles.  
**Impact:** Care Task backend is unreachable.  
**Acceptance Criteria:** Clinicians can assign, view, and complete tasks.

### QA-001 — Automated Test Suite
**Status:** 🔴 Not started  
**Description:** Add Vitest unit tests for API route handlers and Playwright e2e tests for critical user journeys.  
**Impact:** High regression risk on deployments.  
**Acceptance Criteria:** CI/CD pipeline runs tests automatically on PR.

---

## 🔴 P2 Medium (UI Enhancements & Minor Fixes)

### CONSULT-003 — Patient Detail Tab Restructure
**Status:** 🔴 Not started  
**File:** `artifacts/web/src/pages/patient-detail.tsx`  
**Description:** Refactor the scrolling card layout to `<Tabs>` with tabs: Overview | Journey | Appointments | Consultations | Outcomes | Tasks | Files | Communications.  
**Impact:** Patient detail page is becoming too long and difficult to navigate.  
**Acceptance Criteria:** All data is neatly organized into tabs without losing any functionality.

### FEAT-019 — Phase 5 Risk Scoring UI
**Status:** 🔴 Not started  
**File:** `artifacts/web/src/pages/dashboard.tsx`, `artifacts/web/src/pages/patients.tsx`  
**Description:** Expose the risk scores calculated by the backend cron job. Show high-risk patient lists on the dashboard and add risk badges to the patient list.  
**Impact:** Clinical teams cannot easily identify at-risk patients.  
**Acceptance Criteria:** Risk badges (LOW/MEDIUM/HIGH/CRITICAL) are visible.

### CONSULT-006 — Reports: consultations-by-clinic
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/reports.ts`  
**Description:** Add `GET /api/reports/consultations-by-clinic`. Group by clinicId.  
**Impact:** Missing reporting requirement.  
**Acceptance Criteria:** API returns accurate counts isolated by tenant.

### CONSULT-008 — Reports: follow-ups required
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/reports.ts`  
**Description:** Add `GET /api/reports/follow-ups`. Return patients with non-empty `followUpInstructions` and no newer consultation.  
**Impact:** Missing reporting requirement.  
**Acceptance Criteria:** Accurate list of patients needing follow-ups is returned.

---

## 🔴 P3 Low (Infrastructure & Tech Debt)

### INFRA-001 — Cloud Object Storage for File Uploads
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/files.ts`  
**Description:** Replace local `multer` disk storage with AWS S3 or Cloudflare R2.  
**Impact:** Local disk is ephemeral on containerized environments; files will be lost on restart.  
**Acceptance Criteria:** Files are streamed directly to S3; `fileUrl` stores the S3 URL.

### QA-003 — Clarify Appointment Complete Journey Event
**Status:** 🔴 Not started  
**File:** `artifacts/api-server/src/routes/appointments.ts` (line 145)  
**Description:** Appointment completion creates a `PSI` journey event. Change to `APPOINTMENT_COMPLETED` to avoid confusion with `CONSULTATION_COMPLETED`.  
**Impact:** Minor audit log confusion.  
**Acceptance Criteria:** Enum is updated and appointment completion creates the correct event.
