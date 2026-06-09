# CODEBASE_INVENTORY.md — CareNexus Platform

_Generated: 2026-06-09_

---

## Repository Structure Overview

```
carenexus/
├── artifacts/
│   ├── api-server/          Backend Express.js API
│   ├── web/                 React frontend
│   └── mockup-sandbox/      ⚠️ UNUSED — isolated Vite mockup environment
├── lib/
│   ├── api-spec/            OpenAPI contract source
│   ├── api-client-react/    Generated React Query hooks (Orval output)
│   ├── api-zod/             Generated Zod schemas (Orval output)
│   └── db/                  Prisma schema + migrations
├── scripts/                 Utility scripts (seed, sync, verify)
└── docs (root .md files)    Project documentation
```

---

## Backend: `artifacts/api-server/src/`

### Routes (`src/routes/`)

| File | Purpose | Status |
|---|---|---|
| `auth.ts` | Login, register, refresh, password reset, email verify | **Active** |
| `patients.ts` | Patient CRUD, journey events, status management | **Active** |
| `appointments.ts` | Appointment CRUD, cancel/complete transitions | **Active** |
| `consultations.ts` | Clinical note CRUD + stats | **Active** |
| `programEnrollments.ts` | Enrollment lifecycle management | **Active** |
| `programs.ts` | Program CRUD | **Active** |
| `areas.ts` | Geographic area CRUD | **Active** |
| `clinics.ts` | Clinic CRUD with area relationship | **Active** |
| `users.ts` | User management + role assignment | **Active** |
| `roles.ts` | Role + permission management | **Active** |
| `tenants.ts` | Tenant CRUD (SUPER_ADMIN only) | **Active** |
| `assignments.ts` | Doctor-patient assignment | **Active** |
| `communications.ts` | SMS/EMAIL communications | **Active** |
| `files.ts` | File upload/download (multer) | **Active** |
| `notifications.ts` | Notification CRUD + read marking | **Active** |
| `auditLogs.ts` | Immutable audit log query | **Active** |
| `outcomes.ts` | Patient outcome tracking (Phase 1) | **Active** |
| `outcome-metrics.ts` | Outcome metric definitions (Phase 1) | **Active** |
| `tasks.ts` | Care task management (Phase 2) | **Active** |
| `riskScores.ts` | Risk score query (Phase 5) | **Active** |
| `reports.ts` | Analytics/reporting endpoints | **Active** |
| `health.ts` | Health check + system info | **Active** |
| `import.ts` | Bulk patient import from CSV/Excel | **Active** |
| `index.ts` | Route aggregator | **Active** |

### Services (`src/services/`)

| File | Purpose | Status |
|---|---|---|
| `PatientService.ts` | Patient data access layer | **Active** |
| `PatientSyncService.ts` | PG→MySQL sync orchestration | **Active** |
| `PatientRelationSyncService.ts` | Related entity sync | **Active** |
| `DependencySyncService.ts` | Dependency resolution for sync | **Active** |
| `SyncWorker.ts` | Background sync worker | **Active** |
| `SyncQueue.ts` | In-memory sync queue | **Active** |
| `RiskScoringService.ts` | Risk score calculation engine | **Active** |
| `ReconciliationService.ts` | Data reconciliation between DBs | **Active** |
| `EmailService.ts` | Email dispatch stub | **Active** ⚠️ (Stub only) |

### Lib (`src/lib/`)

| File | Purpose | Status |
|---|---|---|
| `prisma.ts` | Prisma client singleton | **Active** |
| `mysql.ts` | MySQL connection pool (secondary DB) | **Active** |
| `jwt.ts` | JWT sign/verify utilities | **Active** |
| `audit.ts` | Audit log helper | **Active** |
| `logger.ts` | Pino logger configuration | **Active** |
| `errors.ts` | Custom error classes | **Active** |
| `notificationService.ts` | Notification creation helper | **Active** |
| `scheduler.ts` | Node-cron scheduler for risk scoring | **Active** |
| `storage.ts` | File storage path utilities | **Active** |

### Scripts (`src/scripts/`)

| File | Purpose | Status |
|---|---|---|
| `create-superadmin.ts` | Create initial SUPER_ADMIN user | **Active** (ops utility) |
| `seed-programs.ts` | Seed default clinical programs | **Active** (ops utility) |
| `check-super-admins.ts` | List all SUPER_ADMIN accounts | **Active** (ops utility) |
| `check-pragati.ts` | Check specific tenant data | **Deprecated** (project-specific) |
| `verify-pragati.ts` | Verify tenant sync state | **Deprecated** (project-specific) |
| `migrate-mysql.ts` | MySQL schema migration | **Active** |
| `migrate-super-admins.ts` | Migrate superadmin records | **Active** (one-time use) |
| `backfill-postgres-to-mysql.ts` | Full backfill utility | **Active** (ops utility) |
| `sync-missing-dependencies.ts` | Sync missing FK dependencies | **Active** (ops utility) |
| `schema-validator.ts` | Validate DB schema consistency | **Active** |
| `test-endpoints.ts` | Quick endpoint smoke tests | **Deprecated** (manual testing) |
| `flush-queue.ts` | Drain the sync queue | **Active** (ops utility) |
| `post-audit.ts` | Post-deployment audit | **Active** |

### Middlewares (`src/middlewares/`)

| File | Purpose | Status |
|---|---|---|
| `auth.ts` | JWT verification middleware | **Active** |
| `rbac.ts` | Role-based access control guard | **Active** |
| `roleScope.ts` | Scope queries by role | **Active** |
| `tenantScope.ts` | Scope queries by tenantId | **Active** |
| `validate.ts` | Zod request validation middleware | **Active** |
| `errorHandler.ts` | Global Express error handler | **Active** |

---

## Frontend: `artifacts/web/src/`

### Pages (`src/pages/`)

| File | Purpose | Status |
|---|---|---|
| `dashboard.tsx` | Clinical KPI dashboard with charts | **Active** |
| `dashboard/GlobalDashboard.tsx` | SUPER_ADMIN cross-tenant view | **Active** |
| `patients.tsx` | Patient list with filters | **Active** |
| `patient-new.tsx` | New patient registration form | **Active** |
| `patient-detail.tsx` | Full patient record with tabs | **Active** |
| `programs.tsx` | Clinical programs management | **Active** |
| `clinics.tsx` | Clinic management table | **Active** |
| `areas.tsx` | Geographic areas grid | **Active** |
| `appointments.tsx` | Appointment list with actions | **Active** |
| `users.tsx` | Team member list | **Active** |
| `user-new.tsx` | Invite new team member | **Active** |
| `user-detail.tsx` | Edit user profile/role | **Active** |
| `roles.tsx` | Roles & permissions matrix | **Active** |
| `audit-logs.tsx` | System audit log viewer | **Active** |
| `notifications.tsx` | Notification center | **Active** |
| `settings.tsx` | User profile settings | **Active** |
| `tenants/` | Tenant management (SUPER_ADMIN) | **Active** |
| `login.tsx` | Authentication page | **Active** |
| `register.tsx` | Self-service registration | **Active** |
| `forgot-password.tsx` | Password reset request | **Active** |
| `reset-password.tsx` | Password reset via token | **Active** |
| `landing.tsx` | Public marketing landing page | **Active** |
| `not-found.tsx` | 404 error page | **Active** |

### Components (`src/components/`)

#### Layout
| File | Status |
|---|---|
| `layout/Sidebar.tsx` | **Active** |
| `layout/AppLayout.tsx` | **Active** |
| `layout/TenantSwitcher.tsx` | **Active** |

#### UI Library (`src/components/ui/`)
58 Shadcn/ui components. Key ones:

| File | Status | Notes |
|---|---|---|
| `searchable-select.tsx` | **Active** | Custom-built, performance-optimized |
| `stat-card.tsx` | **Active** | Dashboard KPI cards |
| `chart.tsx` | **Active** | Recharts wrapper |
| `sidebar.tsx` | **Unused** | Shadcn sidebar template — NOT used (custom in layout/) |
| `carousel.tsx` | **Unused** | Not imported anywhere |
| `drawer.tsx` | **Unused** | Not imported anywhere |
| `menubar.tsx` | **Unused** | Not imported anywhere |
| `context-menu.tsx` | **Unused** | Not imported anywhere |
| `resizable.tsx` | **Unused** | Not imported anywhere |
| `aspect-ratio.tsx` | **Unused** | Not imported anywhere |
| `hover-card.tsx` | **Unused** | Not imported anywhere |
| `breadcrumb.tsx` | **Unused** | Not imported anywhere |
| `navigation-menu.tsx` | **Unused** | Not imported anywhere |
| `collapsible.tsx` | **Unused** | Not imported anywhere |
| `toggle.tsx` | **Unused** | Not imported anywhere |
| `toggle-group.tsx` | **Unused** | Not imported anywhere |
| `sonner.tsx` | **Unused** | Using toast.tsx instead |

### Hooks (`src/hooks/`)

| File | Purpose | Status |
|---|---|---|
| `use-area-clinic-cascade.ts` | Cascading area→clinic selector | **Active** |
| `use-toast.ts` | Toast notification state | **Active** |
| `use-mobile.tsx` | Mobile breakpoint detection | **Unused** |

---

## Libraries: `lib/`

| Package | Purpose | Status |
|---|---|---|
| `lib/api-spec/openapi.yaml` | Master OpenAPI 3.0 specification | **Active** |
| `lib/api-client-react/` | Generated Orval React Query hooks | **Generated** (do not edit) |
| `lib/api-zod/` | Generated Orval Zod validators | **Generated** (do not edit) |
| `lib/db/` | Prisma schema + migrations | **Active** |

---

## Scripts: `scripts/`

| File | Purpose | Status |
|---|---|---|
| `scripts/seed-mumbai.ts` | 140KB Mumbai area/clinic seed | **Active** (one-time) |
| `scripts/fix-openapi.ps1` | OpenAPI YAML repair utility | **Active** |
| `scripts/src/import-master-data.ts` | Excel→DB import for master data | **Active** |
| `scripts/src/auto-push.ts` | Auto git commit+push script | **Deprecated** |
| `scripts/src/hello.ts` | 46-byte test file | **SAFE TO DELETE** |
| `scripts/src/inspect.ts` | DB inspection utility | **Active** |
| `scripts/verify_all_actions.mjs` | API action verification | **Active** |
| `scripts/post-merge.sh` | Post-merge git hook | **Active** |

---

## Root Documentation Files

| File | Status | Action |
|---|---|---|
| `ARCHITECTURE.md` | **Active** — accurate | Keep |
| `PROJECT_STATUS.md` | **Active** — needs update | Update |
| `TASKS.md` | **Active** — needs update | Update |
| `IMPLEMENTATION_PROGRESS.md` | **Active** — needs update | Update |
| `API_CONTRACTS.md` | **Active** | Keep |
| `DATABASE_MAPPING.md` | **Active** | Keep |
| `DECISIONS.md` | **Active** | Keep |
| `TECHNICAL_DEBT.md` | **Active** | Keep |
| `CHANGELOG.md` | **Active** | Keep |
| `OPENAPI_GAP_ANALYSIS.md` | **Active** | Keep |
| `PHASE_1_ANALYSIS.md` | **Stale** — Phase 1 complete | Archive |
| `CLAUDE.md` | **Deprecated** — AI context file | Safe to delete |
| `replit.md` | **Deprecated** — Replit-specific | Safe to delete |
| `MUMBAI.xlsx` | **Active** — master data source | Keep |
| `MUMBAI_SEED.sql` | **Active** — backup seed | Keep |
| `MYSQL_SCHEMA.sql` | **Active** — MySQL schema | Keep |
| `SYNC_AUDIT.sql` | **Active** — reconciliation queries | Keep |
| `attached_assets/` | **Unknown** — review contents | Review |

### Intermediate Report Files (Can Be Archived)

These were generated during development and can be moved to a `/docs/reports/` folder:
- `ACCESSIBILITY_REPORT.md`
- `AREA_CLINIC_MAPPING_REPORT.md`
- `AREA_CLINIC_UI_REPORT.md`
- `BUILD_RECOVERY_REPORT.md`
- `DASHBOARD_AUDIT_REPORT.md`
- `DASHBOARD_UI_REPORT.md`
- `DESIGN_SYSTEM_REPORT.md`
- `DROPDOWN_REPAIR_REPORT.md`
- `FILES_MODULE_FIX_REPORT.md`
- `LANDING_PAGE_REPORT.md`
- `PATIENT_DETAIL_REPORT.md`
- `PROGRAM_ANALYTICS_REPORT.md`
- `RBAC_AUDIT_REPORT.md`
- `REBRANDING_COMPLETION_REPORT.md`
- `REGISTRATION_RBAC_AUDIT_REPORT.md`
- `RESPONSIVE_VALIDATION_REPORT.md`
- `SEARCH_FILTER_REPORT.md`
- `SUPERADMIN_PLATFORM_GOVERNANCE_REPORT.md`
- `TABLE_MODERNIZATION_REPORT.md`
- `THEME_SYSTEM_REPORT.md`

---

## Mockup Sandbox: `artifacts/mockup-sandbox/`

**Status: UNUSED IN PRODUCTION**

This is an isolated Vite environment that was used for rapid UI prototyping. It is not part of the main web application and is not imported by any production code. It can be safely archived or removed.

| File | Status |
|---|---|
| `artifacts/mockup-sandbox/src/App.tsx` | **Unused** |
| `artifacts/mockup-sandbox/src/components/` | **Unused** |
| `artifacts/mockup-sandbox/dist/` | **Generated, unused** |
