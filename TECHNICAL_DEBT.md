# TECHNICAL_DEBT.md — Caremesh PMS

_Last updated: 2026-06-08 (full repository audit)_

---

## Critical (Must Fix Before Production)

### TD-001 — No Automated Test Suite
**Severity:** CRITICAL  
**Impact:** Any regression can silently break production workflows.  
**Affected:** All modules  
**Action:** Add Vitest unit tests for API routes, integration tests for DB operations, and Playwright e2e tests for critical flows (login, patient create, appointment, consultation).

---

### TD-002 — Consultation DELETE Endpoint Missing
**Severity:** HIGH  
**File:** `artifacts/api-server/src/routes/consultations.ts`  
**Impact:** Consultation records cannot be soft-deleted via API. No audit log on deletion.  
**Action:** Add `DELETE /api/consultations/:id` with soft-delete (`deletedAt = now()`) and audit log.

---

### TD-003 — Role Permissions Not Enforced at Runtime
**Severity:** HIGH  
**File:** `artifacts/api-server/src/middlewares/rbac.ts`  
**Impact:** The `role_permissions` table and UI exist, but the RBAC middleware (`authorize()`) checks role **name** only, not granular permissions. Permissions matrix changes in UI have no effect on actual access control.  
**Action:** Extend `authorize()` to load permissions from `role_permissions` table and enforce them.

---

### TD-004 — No CSRF Protection
**Severity:** HIGH  
**Impact:** HttpOnly cookies are used for tokens (good), but no CSRF token is required. SameSite=Lax provides some protection for modern browsers but not all scenarios.  
**Action:** Add `csurf` middleware or double-submit cookie pattern on all state-changing API routes.

---

## Medium (Fix Before Feature Completion)

### TD-005 — Missing Edit Consultation UI
**Severity:** MEDIUM  
**File:** `artifacts/web/src/pages/patient-detail.tsx`  
**Impact:** Consultations can be created and viewed but not edited from the UI. PATCH API exists.  
**Action:** Add Edit button + dialog to each consultation card. Reuse PATCH `/api/consultations/:id`.

---

### TD-006 — Consultation UI Uses Cards, Not Tabs
**Severity:** MEDIUM  
**File:** `artifacts/web/src/pages/patient-detail.tsx`  
**Impact:** Patient detail uses a scrollable multi-column layout instead of tabs. As more sections are added (Consultations, Files, Comms, Journey), the page becomes very long and hard to navigate.  
**Action:** Refactor patient-detail to use shadcn `<Tabs>` with tabs: Overview, Journey, Appointments, Consultations, Files, Communications.

---

### TD-007 — Appointment Screen Lacks "Record Consultation" Button
**Severity:** MEDIUM  
**File:** `artifacts/web/src/pages/appointments.tsx`, `artifacts/web/src/pages/patient-detail.tsx`  
**Impact:** No direct path from a completed appointment to recording a consultation.  
**Action:** Add "Record Consultation" button on completed appointment rows.

---

### TD-008 — Missing Reports: consultations-by-clinic, consultations-by-program, follow-ups
**Severity:** MEDIUM  
**File:** `artifacts/api-server/src/routes/reports.ts`  
**Impact:** Audit failed. Three report endpoints required by specification do not exist.  
**Action:** Add `GET /api/reports/consultations-by-clinic`, `GET /api/reports/consultations-by-program`, `GET /api/reports/follow-ups`.

---

### TD-009 — Dashboard Missing Consultations-by-Doctor Chart
**Severity:** MEDIUM  
**File:** `artifacts/web/src/pages/dashboard.tsx`  
**Impact:** The `consultationsByDoctor` field is returned by the API but not displayed in the dashboard UI.  
**Action:** Add a BarChart widget for consultations by doctor.

---

### TD-010 — File Uploads Use Local Disk, Not Object Storage
**Severity:** MEDIUM  
**File:** `artifacts/api-server/src/routes/files.ts`  
**Impact:** Files are saved to the local filesystem, which is ephemeral on Replit/Render. Files will be lost on restart.  
**Action:** Integrate AWS S3, Cloudflare R2, or similar cloud storage. Store object URL in `file_uploads.fileUrl`.

---

### TD-011 — Notification Triggers Are Incomplete
**Severity:** MEDIUM  
**File:** `artifacts/api-server/src/routes/assignments.ts`  
**Impact:** Only patient assignment triggers a notification. No notifications for: appointment scheduled, appointment completed, consultation recorded, enrollment status change.  
**Action:** Add notification triggers to appointments, consultations, and program enrollment routes.

---

## Low (Clean Up)

### TD-012 — PROJECT_STATUS.md "Pending" Section Is Stale
**Severity:** LOW  
**File:** `PROJECT_STATUS.md`  
**Impact:** Shows outdated "Pending" items that have already been implemented (Notifications, Twilio, File upload, Email verification, Role permissions).  
**Action:** Audit and update `PROJECT_STATUS.md` pending section.

---

### TD-013 — Duplicate handleCompleteAppointment Logic in patient-detail.tsx
**Severity:** LOW  
**File:** `artifacts/web/src/pages/patient-detail.tsx` lines 171–184, 210–219  
**Impact:** Two separate handlers for completing an appointment exist (`handleAppointmentAction` and `handleCompleteAppointment`). Both call `completeAppointmentMutation`.  
**Action:** Remove the duplicate `handleCompleteAppointment` (line 210). Use `handleAppointmentAction(id, 'complete')` consistently.

---

### TD-014 — ARCHITECTURE.md Routes List Is Stale
**Severity:** LOW  
**File:** `ARCHITECTURE.md` lines 39–53  
**Impact:** The routes listed in ARCHITECTURE.md do not include: `files.ts`, `import.ts`, `programEnrollments.ts`, `appointments.ts`, `consultations.ts` which all exist in production.  
**Action:** Update ARCHITECTURE.md monorepo structure section.

---

### TD-015 — Twilio Integration Configuration Not Documented
**Severity:** LOW  
**File:** `PROJECT_STATUS.md`, `.env.example`  
**Impact:** Twilio is integrated but required env vars (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`) are not listed in environment variable documentation.  
**Action:** Add Twilio env vars to PROJECT_STATUS.md Environment Variables section and `.env.example`.

---

### TD-016 — pnpm-workspace.yaml Size (248 KB pnpm-lock.yaml)
**Severity:** LOW  
**Impact:** Lock file has grown to 248 KB with many dependencies. Review for unused packages.  
**Action:** Run `pnpm prune` and audit `package.json` for unused deps.
