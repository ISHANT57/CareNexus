# CHANGELOG.md — Caremesh PMS

_All notable changes to this project are documented here._
_Format: [Date] — Description — Files Modified_

---

## [2026-06-08] — Consultation Notes Module: Backend + Frontend

### Added
- `Consultation` Prisma model with full field set: `id`, `tenantId`, `patientId`, `appointmentId`, `doctorId`, `clinicId`, `chiefComplaint`, `symptoms`, `observations`, `diagnosis`, `treatmentPlan`, `medications`, `followUpInstructions`, `consultationDate`, `createdAt`, `updatedAt`, `deletedAt`
- `artifacts/api-server/src/routes/consultations.ts` — GET list, GET by ID, POST create, PATCH update with RBAC, tenant isolation, audit logging, and journey event auto-creation (`CONSULTATION_COMPLETED`)
- Consultation router mounted at `/api/consultations` in `artifacts/api-server/src/routes/index.ts`
- Consultation stats report at `/api/reports/consultation-stats` (total, this month, by doctor)
- Consultation schemas appended to `lib/api-spec/openapi.yaml`
- Codegen re-run — hooks `useListConsultations`, `useCreateConsultation`, `getListConsultationsQueryKey` generated
- Consultation "Record" dialog and history view added to `artifacts/web/src/pages/patient-detail.tsx`
- Dashboard consultation stats widgets (Total Consultations, This Month) added to `artifacts/web/src/pages/dashboard.tsx`
- `DATABASE_MAPPING.md` updated with `consultations` table definition
- `API_CONTRACTS.md` updated with Module 16 Consultation endpoints

### Files Modified
- `artifacts/api-server/prisma/schema.prisma`
- `artifacts/api-server/src/routes/consultations.ts` (new)
- `artifacts/api-server/src/routes/index.ts`
- `artifacts/api-server/src/routes/reports.ts`
- `lib/api-spec/openapi.yaml`
- `artifacts/web/src/pages/patient-detail.tsx`
- `artifacts/web/src/pages/dashboard.tsx`
- `DATABASE_MAPPING.md`
- `API_CONTRACTS.md`

---

## [2026-06-08] — Appointment Management Module: Audit Fixes

### Added
- `GET /api/appointments/:id` endpoint (was missing)
- Edit Appointment dialog on patient-detail (Edit button + PATCH via `useUpdateAppointment`)
- `DATABASE_MAPPING.md` — appointments table definition
- `API_CONTRACTS.md` — appointment endpoints documentation

### Files Modified
- `artifacts/api-server/src/routes/appointments.ts`
- `artifacts/web/src/pages/patient-detail.tsx`
- `DATABASE_MAPPING.md`
- `API_CONTRACTS.md`
- `lib/api-spec/openapi.yaml`

---

## [2026-06-08] — Master Data Migration (MUMBAI.xlsx)

### Changed
- 195 Areas imported from MUMBAI.xlsx
- 707 Clinics imported from MUMBAI.xlsx
- 25 Programs seeded with healthcare program names
- Dummy seed data soft-deleted (deletedAt = now())
- `MUMBAI_SEED.sql` generated and executed

### Files Modified
- `MUMBAI_SEED.sql` (new, 189 KB)
- Database seed data

---

## [2026-06-08] — .gitignore Review and Security Cleanup

### Changed
- Updated `.gitignore` to exclude: `node_modules/`, `.env`, `.env.*` (except `.env.example`), `dist/`, `build/`, `*.log`, `.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/`, `coverage/`
- Verified no secrets or credentials staged

---

## [2026-06-07] — Program Enrollment Module

### Added
- `ProgramEnrollment` Prisma model (status: ACTIVE / COMPLETED / CANCELLED)
- `GET /api/program-enrollments`, `POST`, `PATCH`, `POST /:id/complete`, `POST /:id/cancel`
- Program Enrollments section on patient-detail (enroll / complete / cancel UI)
- Dashboard enrollment stats widget (total / active / completed)
- `/api/reports/enrollment-stats` endpoint

---

## [2026-06-07] — Appointment Management Module

### Added
- `Appointment` Prisma model (status: SCHEDULED / COMPLETED / CANCELLED / NO_SHOW)
- Full appointment API: GET list, POST, GET by ID, PATCH, POST/:id/complete, POST/:id/cancel, POST/:id/no-show
- Appointments sidebar link and global appointments list page (`appointments.tsx`)
- Appointments section on patient-detail (schedule / edit / cancel / complete)
- Dashboard appointment stats (total / scheduled / completed / cancelled) + charts by clinic and doctor

---

## [2026-06-07] — Security Hardening

### Changed
- Tokens moved from `localStorage` to `httpOnly` cookies
- `cookie-parser` added to Express server
- Frontend `custom-fetch.ts` updated to use `credentials: 'include'`
- Email verification enforced on login (`emailVerified` flag)
- Forgot-password and reset-password flows implemented

---

## [2026-06-06] — Core Feature Completion

### Added
- User edit page (`/users/:id`)
- File uploads (multer, patient-detail Files section)
- Bulk CSV patient import
- Role permissions management UI (`/roles`)
- SMS Twilio integration
- Notifications read/unread UI
- Pagination on all list views
- Area / Clinic / Program inline edit + delete UI

---

## [2026-06-05] — Initial Platform Build

### Added
- Monorepo scaffold (pnpm workspaces)
- PostgreSQL schema (21 Prisma models)
- Express 5 API server with full CRUD on 14 resource groups
- JWT authentication (login, register, refresh, logout, /me)
- RBAC middleware (6 roles, 5 role groups)
- Tenant isolation middleware
- Audit log (append-only, createAuditLog helper)
- OpenAPI spec (openapi.yaml)
- Orval codegen (React Query hooks + Zod schemas)
- React + Vite frontend (13 pages, Tailwind + shadcn/ui)
- Dashboard with Recharts
- Seed data (1 tenant, 4 areas, 4 clinics, 5 programs, 8 patients)
