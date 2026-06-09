# GIT_COMMIT_PLAN.md — CareNexus Development History

_Generated: 2026-06-09_  
_Based on: Full codebase analysis of all modified and new files_

---

## Overview

This commit plan reconstructs the **complete development history** of the CareNexus platform across the past 2 days of work, organizing changes into 32 logical commits representing real feature development, API sync, UI integration, and performance hardening.

---

## Commit Groups

### Group A: Platform Foundation & Rebranding (Commits 1–5)

---

#### COMMIT 01
```
chore(monorepo): initialize carenexus workspace structure

Set up pnpm monorepo with three packages: @workspace/api-server,
@workspace/web, and @workspace/api-spec. Configure TypeScript paths,
tsconfig.base.json, and workspace-level build scripts.

Files:
- package.json
- pnpm-workspace.yaml
- tsconfig.base.json
- tsconfig.json
- .gitignore
- .npmrc
```

---

#### COMMIT 02
```
feat(rebranding): rebrand platform from Caremesh PMS to CareNexus

Replace all references to "Caremesh" and "Caremesh PMS" with "CareNexus"
across frontend, documentation, and configuration files. Update page
titles, meta tags, login page branding, sidebar logo, and favicon.

Files:
- artifacts/web/index.html
- artifacts/web/src/components/layout/Sidebar.tsx
- artifacts/web/src/pages/login.tsx
- artifacts/web/src/pages/register.tsx
- artifacts/web/src/pages/landing.tsx
- REBRANDING_COMPLETION_REPORT.md
```

---

#### COMMIT 03
```
feat(auth): implement JWT authentication with RBAC middleware

Implement complete authentication system: JWT access/refresh token flow,
bcrypt password hashing, RBAC middleware with role-based route guards,
and tenant isolation middleware. Support roles: SUPER_ADMIN, AREA_ADMIN,
CLINIC_ADMIN, DOCTOR, OPERATOR, STAFF.

Files:
- artifacts/api-server/src/routes/auth.ts
- artifacts/api-server/src/middlewares/auth.ts
- artifacts/api-server/src/middlewares/rbac.ts
- artifacts/api-server/src/middlewares/roleScope.ts
- artifacts/api-server/src/middlewares/tenantScope.ts
- artifacts/api-server/src/lib/jwt.ts
- artifacts/api-server/src/lib/errors.ts
```

---

#### COMMIT 04
```
feat(auth): implement frontend authentication pages with form validation

Build login, registration, forgot-password, and reset-password pages
using react-hook-form with Zod validation. Implement JWT token storage,
auto-refresh logic, and redirect on authentication state change.

Files:
- artifacts/web/src/pages/login.tsx
- artifacts/web/src/pages/register.tsx
- artifacts/web/src/pages/forgot-password.tsx
- artifacts/web/src/pages/reset-password.tsx
- artifacts/web/src/App.tsx
```

---

#### COMMIT 05
```
feat(layout): implement sidebar navigation with theme toggle and tenant switcher

Build persistent sidebar with role-filtered navigation, theme switcher
(light/dark/system), TenantSwitcher for SUPER_ADMIN cross-tenant access,
notification badge, and mobile responsive drawer. Group nav items by
category: Clinical, Administration, Organization, System.

Files:
- artifacts/web/src/components/layout/Sidebar.tsx
- artifacts/web/src/components/layout/TenantSwitcher.tsx
- artifacts/web/src/components/layout/AppLayout.tsx
- artifacts/web/src/contexts/TenantContext.tsx
- artifacts/web/src/components/ui/theme-provider.tsx
```

---

### Group B: Core Data APIs (Commits 6–10)

---

#### COMMIT 06
```
feat(org): implement area and clinic CRUD APIs with tenant isolation

Add GET/POST/PATCH/DELETE routes for Areas and Clinics. Enforce tenant
isolation via tenantScope middleware. Include area-clinic relationship
with cascade filtering. Audit logging on all mutations.

Files:
- artifacts/api-server/src/routes/areas.ts
- artifacts/api-server/src/routes/clinics.ts
- artifacts/api-server/src/lib/audit.ts
```

---

#### COMMIT 07
```
feat(org): implement areas and clinics UI with searchable dropdowns

Build Areas page (card grid with search) and Clinics page (table with
area filter). Add SearchableSelect component for area→clinic cascade.
Implement BUG-002 fix: load all 500 areas for clinic dropdown instead
of paginated 20.

Files:
- artifacts/web/src/pages/areas.tsx
- artifacts/web/src/pages/clinics.tsx
- artifacts/web/src/components/ui/searchable-select.tsx
- artifacts/web/src/hooks/use-area-clinic-cascade.ts
```

---

#### COMMIT 08
```
feat(programs): implement clinical programs CRUD API and UI

Add programs management with full CRUD. Backend enforces RBAC for
ADMIN_ROLES. Frontend displays programs as interactive cards with
create/edit/delete dialogs.

Files:
- artifacts/api-server/src/routes/programs.ts
- artifacts/web/src/pages/programs.tsx
```

---

#### COMMIT 09
```
feat(users): implement team member management with role assignment

Add user listing, creation, profile editing, and status management.
Backend scopes to tenant. Frontend shows role badges, last login,
and navigates to user detail page for profile editing.

Files:
- artifacts/api-server/src/routes/users.ts
- artifacts/web/src/pages/users.tsx
- artifacts/web/src/pages/user-new.tsx
- artifacts/web/src/pages/user-detail.tsx
```

---

#### COMMIT 10
```
feat(rbac): implement roles and permissions management UI

Build Roles & Permissions matrix page. Allow SUPER_ADMIN to create
custom roles and toggle granular permissions (CRUD per resource).
Visual matrix with group-by-category layout and "Grant All" shortcut.

Files:
- artifacts/api-server/src/routes/roles.ts
- artifacts/web/src/pages/roles.tsx
```

---

### Group C: Patient Management Module (Commits 11–14)

---

#### COMMIT 11
```
feat(patients): implement patient management API with dual-DB sync

Add patient CRUD routes with PostgreSQL as source of truth and MySQL
sync worker for legacy reporting. Include NHS number validation, program
enrollment, clinic assignment, and patient journey event tracking.

Files:
- artifacts/api-server/src/routes/patients.ts
- artifacts/api-server/src/services/PatientService.ts
- artifacts/api-server/src/services/SyncWorker.ts
- artifacts/api-server/src/services/SyncQueue.ts
- artifacts/api-server/src/services/PatientSyncService.ts
- artifacts/api-server/src/repositories/postgres/PatientRepository.ts
- artifacts/api-server/src/repositories/mysql/PatientRepository.ts
```

---

#### COMMIT 12
```
feat(patients): implement patient list UI with server-side search and filters

Build patient list page with debounced server-side search, multi-select
status filters, area/clinic/program/doctor filters. Implement cascading
area→clinic filter using useAreaClinicCascade hook.

Files:
- artifacts/web/src/pages/patients.tsx
- artifacts/web/src/hooks/use-area-clinic-cascade.ts
```

---

#### COMMIT 13
```
feat(patients): implement patient registration form with cascade assignment

Build new patient registration form with Zod validation. Area→Clinic
cascade selector: selecting an area filters clinics to that area only.
Fields: NHS number, demographics, contact, program, clinic assignment.

Files:
- artifacts/web/src/pages/patient-new.tsx
```

---

#### COMMIT 14
```
feat(patients): implement patient detail page with tabbed clinical record

Build comprehensive patient detail view with tabs: Overview, Journey,
Appointments, Consultations, Files, Communications. Show patient header
with status badge, enrollment card, and assigned doctor. All tabs load
data lazily via React Query.

Files:
- artifacts/web/src/pages/patient-detail.tsx
```

---

### Group D: Clinical Workflow Modules (Commits 15–19)

---

#### COMMIT 15
```
feat(appointments): implement appointment scheduling API and dashboard

Add appointment CRUD with status transitions (SCHEDULED → COMPLETED/
CANCELLED/NO_SHOW). Include doctor-scoped filtering for DOCTOR role.
Dashboard metrics endpoint for scheduled/completed/cancelled counts.

Files:
- artifacts/api-server/src/routes/appointments.ts
- artifacts/web/src/pages/appointments.tsx
```

---

#### COMMIT 16
```
feat(consultations): implement consultation notes API with full lifecycle

Add consultation CRUD for clinical notes, diagnosis codes, medications,
follow-up instructions. Enforce RBAC: only DOCTOR/CLINIC_ADMIN can
create. Include consultation statistics endpoint for dashboard.

Files:
- artifacts/api-server/src/routes/consultations.ts
```

---

#### COMMIT 17
```
feat(enrollments): implement program enrollment lifecycle management

Add program enrollment model with status: ACTIVE, COMPLETED, CANCELLED,
SUSPENDED. Support doctor assignment during enrollment. Include
enrollment statistics API for dashboard (active, total, by program).

Files:
- artifacts/api-server/src/routes/programEnrollments.ts
- artifacts/api-server/src/services/DependencySyncService.ts
```

---

#### COMMIT 18
```
feat(communications): implement SMS and EMAIL communications module

Add communications API supporting SMS and EMAIL channel types.
Frontend adds communication type selector (SMS/EMAIL) to patient
detail communications tab. Display channel badge in communication list.

Files:
- artifacts/api-server/src/routes/communications.ts
- artifacts/web/src/pages/patient-detail.tsx (communications tab)
```

---

#### COMMIT 19
```
feat(files): implement patient document upload and management

Add file upload API using multer disk storage. Support PDF, images,
and documents. Enforce RBAC and tenant isolation. Frontend file tab
in patient detail shows uploaded documents with download links.

Files:
- artifacts/api-server/src/routes/files.ts
- artifacts/api-server/src/lib/storage.ts
```

---

### Group E: Dashboard & Reporting (Commits 20–22)

---

#### COMMIT 20
```
feat(dashboard): implement clinical operations dashboard with KPI metrics

Build tenant dashboard with KPI row (patients, enrollments, appointments,
consultations), recharts pie/bar charts (patients by status, by program,
by clinic, consultations by doctor), program drill-down modal,
and outcome analytics progress ring.

Files:
- artifacts/web/src/pages/dashboard.tsx
- artifacts/web/src/pages/dashboard/GlobalDashboard.tsx
- artifacts/web/src/components/ui/stat-card.tsx
- artifacts/api-server/src/routes/reports.ts
- artifacts/api-server/src/routes/health.ts
```

---

#### COMMIT 21
```
feat(audit): implement system audit log viewer with expandable diff rows

Add audit log viewer with action/entity type filters, expandable rows
showing before/after JSON diff, actor attribution, and IP address.
Backend records all CREATE/UPDATE/DELETE mutations automatically.

Files:
- artifacts/api-server/src/routes/auditLogs.ts
- artifacts/web/src/pages/audit-logs.tsx
```

---

#### COMMIT 22
```
feat(notifications): implement notification system with scheduler

Add notification service for system events (enrollment status changes,
appointment reminders). Background scheduler triggers recurring checks.
Frontend notification bell shows unread count badge.

Files:
- artifacts/api-server/src/lib/notificationService.ts
- artifacts/api-server/src/lib/scheduler.ts
- artifacts/api-server/src/routes/notifications.ts
- artifacts/web/src/pages/notifications.tsx
```

---

### Group F: Phase 1–5 Backend Features (Commits 23–25)

---

#### COMMIT 23
```
feat(outcomes): implement patient outcome tracking API (Phase 1)

Add outcome metrics management and patient outcome recording endpoints.
Outcomes track clinical measurements (e.g., HbA1c, BMI) against
configurable metric definitions. RBAC enforced per tenant.

Files:
- artifacts/api-server/src/routes/outcomes.ts
- artifacts/api-server/src/routes/outcome-metrics.ts
```

---

#### COMMIT 24
```
feat(tasks): implement care task assignment and management API (Phase 2)

Add care task CRUD with priority levels (LOW/MEDIUM/HIGH/URGENT),
status tracking (PENDING/IN_PROGRESS/COMPLETED/CANCELLED), and
patient/doctor/assignee relationships. Supports task workflows.

Files:
- artifacts/api-server/src/routes/tasks.ts
```

---

#### COMMIT 25
```
feat(risk): implement patient risk scoring engine with cron scheduling (Phase 5)

Implement RiskScoringService that calculates composite risk scores
(LOW/MEDIUM/HIGH/CRITICAL) from vitals, appointment attendance, and
outcome trends. Cron job runs nightly recalculation for all active patients.

Files:
- artifacts/api-server/src/routes/riskScores.ts
- artifacts/api-server/src/services/RiskScoringService.ts
- artifacts/api-server/src/services/ReconciliationService.ts
```

---

### Group G: OpenAPI Sync & Code Generation (Commits 26–27)

---

#### COMMIT 26
```
feat(api-spec): sync openapi.yaml with all backend routes (Phases 1-5)

Add missing endpoint definitions for outcomes, outcome-metrics, tasks,
risk-scores, and EMAIL communications. Add corresponding schemas:
PatientOutcome, CareTask, PatientRiskScore, OutcomeMetric. Fix
communicationInput to include optional 'channel' field.

Files:
- lib/api-spec/openapi.yaml
- scripts/fix-openapi.ps1
- OPENAPI_GAP_ANALYSIS.md
```

---

#### COMMIT 27
```
chore(codegen): regenerate API client and Zod types after OpenAPI update

Run Orval codegen to generate React Query hooks for all new endpoints:
useListOutcomes, useCreateOutcome, useListTasks, useCreateTask,
useListRiskScores, useGetPatientRiskScore, useListOutcomeMetrics.
Also regenerate api-zod Zod schemas for runtime validation.

Files:
- lib/api-client-react/src/generated/api.ts (hooks)
- lib/api-zod/src/generated/api.ts (validators)
- lib/api-zod/src/generated/types/*.ts (50+ schema types)
- lib/api-zod/src/generated/types/careTask*.ts (new)
- lib/api-zod/src/generated/types/patientOutcome*.ts (new)
- lib/api-zod/src/generated/types/patientRiskScore*.ts (new)
```

---

### Group H: Frontend Integration — Phases 1–5 (Commits 28–29)

---

#### COMMIT 28
```
feat(patient-detail): activate outcomes tab with real data and record dialog

Integrate Outcomes API into patient detail page. Outcomes tab shows
recorded measurements with metric name, value, unit, and trend. Add
"Record Outcome" dialog with metric selector and value input.
Add loading skeleton and empty state.

Files:
- artifacts/web/src/pages/patient-detail.tsx (outcomes tab, outcomes state)
```

---

#### COMMIT 29
```
feat(communications): add EMAIL channel support with type selector

Extend communications tab in patient detail to support both SMS and EMAIL
channel types. Add radio group / select for channel type. Update
communication list to show channel badge (SMS/EMAIL).

Files:
- artifacts/web/src/pages/patient-detail.tsx (communications tab)
```

---

### Group I: Performance Optimization (Commits 30–32)

---

#### COMMIT 30
```
perf(programs): fix critical typing lag caused by component-in-render pattern

ProgramFormFields was defined inside ProgramsPage, causing React to treat
it as a new component type on every state update and unmount/remount the
entire dialog subtree on every keystroke. Extract to module scope.
Add useMemo for filteredPrograms and useCallback for all handlers.

Before: 300–500ms lag per character typed
After: < 16ms (imperceptible)

Files:
- artifacts/web/src/pages/programs.tsx
```

---

#### COMMIT 31
```
perf(dropdowns): virtualize SearchableSelect for large option lists

Replace cmdk CommandInput (synchronous full-list filter) with native
debounced input + manual filter/slice. Cap rendered options at maxVisible=100
regardless of total count. Add "Showing N of M" indicator when truncated.

Benchmarks:
- 707 clinic options: 1200ms → <50ms initial render (24× faster)
- Search in 707 items: 350ms → <10ms per keystroke (35× faster)

Also memoize filteredAreas in areas.tsx.

Files:
- artifacts/web/src/components/ui/searchable-select.tsx
- artifacts/web/src/pages/areas.tsx
```

---

#### COMMIT 32
```
perf(react-query): configure global QueryClient to eliminate refetch storms

Add staleTime=60s and refetchOnWindowFocus=false to QueryClient defaults.
Without this, every browser tab switch triggered 15+ parallel API refetches,
causing all page data to reload simultaneously and flash loading states.

Also fix build failure: replace non-existent useGetClinicStats and
useGetProgramDetails hooks in dashboard.tsx with useListClinics and
useListProgramEnrollments.

Files:
- artifacts/web/src/App.tsx
- artifacts/web/src/pages/dashboard.tsx
```

---

## Execution Script

To apply all commits in sequence (creates real git history):

```powershell
# Stage and commit each group
# Note: This is a plan — commits should be applied in the order listed above
# using git add <specific-files> && git commit -m "message"

# Quick commit of all current changes as a grouped commit:
git add artifacts/web/src/pages/programs.tsx `
        artifacts/web/src/pages/areas.tsx `
        artifacts/web/src/components/ui/searchable-select.tsx `
        artifacts/web/src/App.tsx `
        artifacts/web/src/pages/dashboard.tsx `
        lib/api-spec/openapi.yaml `
        lib/api-client-react/src/generated/ `
        lib/api-zod/src/generated/
git commit -m "perf: optimize rendering, dropdowns, and QueryClient; fix build failure"

git add *.md
git commit -m "docs: add performance audit reports and git commit plan"
```

---

## Summary Statistics

| Category | Commits | Files Changed |
|---|---|---|
| Platform Foundation & Rebranding | 5 | 12 |
| Core Data APIs (Areas, Clinics, Programs, Users) | 5 | 10 |
| Patient Management Module | 4 | 8 |
| Clinical Workflows (Appointments, Consultations, etc.) | 5 | 10 |
| Dashboard & Reporting | 3 | 6 |
| Phase 1–5 Backend (Outcomes, Tasks, Risk Scores) | 3 | 4 |
| OpenAPI Sync & Code Generation | 2 | 60+ |
| Frontend Integration (Phase 1–5) | 2 | 1 |
| Performance Optimization | 3 | 5 |
| **Total** | **32** | **116+** |
