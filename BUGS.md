# BUGS.md — CareNexus Fast Audit & Bug Discovery

This document details all security, tenant isolation, RBAC, clinic boundaries, dashboard, and database bugs identified within the CareNexus platform.

---

## ✅ Remediation Log — 2026-06-22 (Stabilization Pass)

Status of the audited items below, plus the systematic architecture/correctness pass.
Verification after the pass: `pnpm run typecheck` ✅ · `@workspace/web build` ✅ · `@workspace/api-server build` ✅ · login + scoped endpoints 200.

**Schema vs code (Critical #3) — FIXED.** `User` re-given direct `tenantId`/`roleId` + `tenant`/`role` relations; `Tenant`/`Role` given `users[]` back-relations. Prisma client regenerated; live Neon DB synced via `prisma db push` (also added the previously-missing `patients.riskScore/riskLevel/lastCalculatedAt` columns and risk/enrollment enums — additive only, no data loss). `prisma validate` clean, DB 0-drift.

**roleScope.ts — REWRITTEN to match the role matrix:**
- SUPER_ADMIN → all; AREA_ADMIN → **derived area scope** (areas of assigned clinics, expanded to every clinic in those areas); CLINIC_ADMIN → assigned clinics; DOCTOR → assigned patients + own appts/consults; OPERATOR/STAFF → assigned clinics/programs.
- No-assignment users now get an **impossible filter (see nothing)** instead of an empty filter (which leaked the tenant). Added `area`/`program` module shapes.

**Tenant isolation (Critical #2/#4/#6, High #3/#4) — FIXED + hardened.** "ALL"-mode writes now return a clean 422 (no crash) on appointments/consultations/tasks/outcomes/assignments/communications/import. Every mutation lookup (programs, programEnrollments, outcome-metrics, tasks, users, areas, outcomes, patients, consultations, notifications) now carries `tenantId`. `RiskScoringService` persist switched to tenant-scoped `updateMany`. Dashboard audit-log + SMS counts scoped; `follow-ups` (PII) scoped.

**RBAC (Critical #1/#5, High #5/#8) — FIXED/verified.** Role tenant-isolation on `roles.ts`; create-user role-hierarchy + tenant-injection guard; non-super tenant-injection guards on users/clinics/areas/programs; non-doctor-as-clinician rejected; `authorizePermission` confirmed to enforce DB `role_permissions` at runtime with system-role fallbacks.

**Doctor visibility (Critical #4, High #1/#6) — FIXED.** Patient detail/list/mutations, risk-scores, assignments **list**, tasks **list**, and outcomes **list** all role-scoped (clinicians no longer enumerate other patients' data).

**Master-data hierarchy — enforced at create.** Patient (clinic∈area∈tenant), Program (area/clinic∈tenant, clinic∈area), Clinic (area∈tenant), Doctor-Patient assignment (patient∈tenant, clinic∈area∈tenant, assignee is a DOCTOR).

**Sidebar (Medium #2/#3/#7) — FIXED.** Tenant label shows "All Tenants" for super-admin ALL mode and the user's tenant otherwise (never "Unknown"); TenantSwitcher hidden for non-super; backend `requireTenant` ignores an `x-tenant-id` header from non-super users.

**Forms / dropdowns (Low #1) + missing module — FIXED.** Area→Clinic cascade confirmed in patient registration. **Added clinic-assignment multi-select to the user-create form** — without it, scoped roles had no assignments and saw nothing, making the whole RBAC model unusable.

**UI bug fixes** (no redesign): consultation Edit **+ Delete** (added `DELETE /consultations/:id` to OpenAPI + codegen); roles permission matrix wrapped in horizontal scroll; design tokens aligned to NHS-blue / Plus Jakarta Sans / rounded cards.

### Outstanding follow-ups (tracked, not yet done)
- **user-detail.tsx**: no UI to add/remove clinic & program assignments *after* creation (backend `/users/:id/clinics` + `/programs` exist). Needed for ongoing RBAC maintenance.
- Aggregate-only reports (`clinic-stats`, `outcomes-by-program`, `outcomes-by-doctor`, `consultations-by-program`) remain tenant-wide for any reader with `reports:read` — no cross-tenant leak, but a tenant admin sees org-wide aggregates. Scope by clinic/patient relation if stricter visibility is required.
- AREA_ADMIN scope is **derived from clinic assignments** (no `UserAreaAssignment` table). If direct area assignment is desired, add that table + a frontend area multi-select.
- Web bundle >500 kB (single chunk) — consider route-level code-splitting.

---

# Critical

### 1. Cross-Tenant Custom Role Modification & Deletion
* **Severity:** Critical (Security / Tenant Isolation)
* **Root Cause:** The role endpoints locate role records strictly by `id` without verifying the role's `tenantId` match against the requester's tenant context (`req.tenantId`). This allows users in Tenant A to read, modify, delete, and modify permissions for custom roles belonging to Tenant B.
* **Files:**
  * [roles.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/roles.ts#L48-L86)
  * [roles.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/roles.ts#L98-L178)
* **Fix Recommendation:** Add a tenant check to all parameters lookup in `roles.ts`. Replace `prisma.role.findFirst({ where: { id } })` with:
  ```typescript
  const role = await prisma.role.findFirst({
    where: { 
      id: req.params.id, 
      OR: [{ tenantId: req.tenantId }, { isSystem: true }] 
    }
  });
  ```
  Throw `Errors.notFound("Role")` if not found. For mutating operations, restrict modifications on system roles (`isSystem: true`) and verify tenant ownership.

### 2. System-Wide Write Crash for Super Admins in "ALL" Tenant Mode
* **Severity:** Critical (Database Mismatch / Platform Governance)
* **Root Cause:** When Super Admins select "Platform View (All Tenants)", the header `x-tenant-id` is sent as `ALL`. The `requireTenant` middleware sets `req.tenantId = undefined`. When write endpoints attempt to create records (appointments, consultations, tasks, etc.), they inject `req.tenantId!` directly into the Prisma `create` query. Since `tenantId` is a required non-nullable database column, the database rejects the query and the API server crashes.
* **Files:**
  * [appointments.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/appointments.ts#L74)
  * [consultations.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/consultations.ts#L88)
  * [tasks.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/tasks.ts#L108)
  * [outcomes.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/outcomes.ts)
  * [assignments.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/assignments.ts#L58)
  * [communications.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/communications.ts)
* **Fix Recommendation:** Prevent resource-creation operations when operating in global "ALL" mode by throwing a validation error:
  ```typescript
  if (!req.tenantId) {
    throw Errors.validation("A specific tenant must be selected to perform this write action. Please select a tenant from the switcher.");
  }
  ```

### 3. Critical Database-to-Code Mismatch (Prisma Schema Regression)
* **Severity:** Critical (Database Integrity / Build Stability)
* **Root Cause:** The database schema is defined using a multi-tenant user assignments table `user_tenant_assignments` rather than direct `tenantId` and `roleId` fields on the `User` model. However, the active backend route files (`auth.ts`, `users.ts`, `tenants.ts`, etc.) query `User.role` and `User.tenant` and write `User.roleId`/`User.tenantId` directly. Because these direct fields are missing from the `User` model in `schema.prisma`, running `prisma generate` will break type safety and crash the backend at runtime.
* **Files:**
  * [schema.prisma](file:///e:/Caremesh-Platform/artifacts/api-server/prisma/schema.prisma#L117-L153)
  * [auth.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/auth.ts#L73)
  * [users.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/users.ts#L44-L63)
  * [tenants.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/tenants.ts#L138-L139)
* **Fix Recommendation:** Re-add `tenantId` (referencing `Tenant`), `roleId` (referencing `Role`), and their direct relationships to the `User` model in `schema.prisma` to synchronize it with the active route codebases:
  ```prisma
  model User {
    // ...
    tenantId    String
    roleId      String
    tenant      Tenant   @relation(fields: [tenantId], references: [id])
    role        Role     @relation(fields: [roleId], references: [id])
  }
  ```

### 4. Patient Care Team Sidebar Leakage (Unscoped Assignments List)
* **Severity:** Critical (Patient Visibility / Data Leakage)
* **Root Cause:** The `GET /api/assignments` list route ignores the `patientId` query parameter sent by the frontend sidebar. Consequently, when loading a patient's care team, the backend returns the *entire* list of all assignments in the tenant, exposing names of other patients and assigned clinicians.
* **File:**
  * [assignments.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/assignments.ts#L22-L45)
* **Fix Recommendation:** Destructure `patientId` from `req.query` and apply it to the database query filter:
  ```typescript
  const { doctorId, clinicId, areaId, patientId } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { tenantId: req.tenantId!, deletedAt: null };
  if (patientId) where["patientId"] = patientId;
  ```

### 5. Privilege Escalation on User Creation (Missing Role Hierarchy Check)
* **Severity:** Critical (RBAC / Security)
* **Root Cause:** While `PATCH /api/users/:id` implements a role hierarchy validation to restrict users from assigning a higher role than their own, the user creation endpoint (`POST /api/users`) does not enforce this check. Consequently, a Clinic Admin or Area Admin can create a new user and assign them the `SUPER_ADMIN` role.
* **File:**
  * [users.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/users.ts#L86-L127)
* **Fix Recommendation:** Add the hierarchy validation before executing the prisma create query:
  ```typescript
  const userRole = req.user?.role ?? "";
  const allowedRoles = ROLE_HIERARCHY[userRole] || [];
  if (!allowedRoles.includes(targetRole.name)) {
    throw Errors.forbidden(`Your role (${userRole}) is not permitted to assign the ${targetRole.name} role`);
  }
  ```

### 6. Unscoped Patient details Sub-resource Endpoints
* **Severity:** Critical (Patient Visibility / Data Leakage)
* **Root Cause:** Standard clinicians (Doctors) should only access data for patients explicitly assigned to them. However, patient details sub-resource endpoints (journey history, GP details updates, SMS logs, and status updates) only check tenant context (`req.tenantId`) but do not apply `getRoleScope(req, "patient")`. This allows any doctor to view journey events, read SMS history, or change status for any patient in the trust.
* **File:**
  * [patients.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/patients.ts#L243-L330)
* **Fix Recommendation:** Fetch the patient role scope and append it to the verification check inside those sub-resource routes:
  ```typescript
  const patientRoleScope = await getRoleScope(req, "patient");
  const patient = await prisma.patient.findFirst({ 
    where: { id: req.params.id, tenantId: req.tenantId!, deletedAt: null, ...patientRoleScope } 
  });
  if (!patient) throw Errors.notFound("Patient");
  ```

---

# High

### 1. Unscoped Clinical Scoping for Admins in `roleScope.ts`
* **Severity:** High (RBAC / Security)
* **Root Cause:** The `getRoleScope` middleware returns `{}` (no constraints) if the user's role is `CLINIC_ADMIN` or `AREA_ADMIN`. This allows clinic/area administrators to query, create, or update data (patients, appointments, users) in clinics they are not assigned to, completely bypassing facility/regional boundaries.
* **File:**
  * [roleScope.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/middlewares/roleScope.ts#L25)
* **Fix Recommendation:** Remove the early exit for clinic/area admins. Filter their visibility based on their assigned clinics in `userClinicAssignments`.

### 2. Care Team Restricted to a Single Doctor
* **Severity:** High (Broken Features)
* **Root Cause:** The `POST /api/assignments` endpoint updates all active doctor assignments for a patient to `deletedAt: new Date()` before creating a new assignment. This makes it impossible for a patient to have multiple active doctors in their care team.
* **File:**
  * [assignments.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/assignments.ts#L51-L55)
* **Fix Recommendation:** Soft-delete or reject duplicates matching the same `(patientId, doctorId)` pair, rather than deleting all patient assignments.

### 3. Tenant-Wide Audit Log & SMS Aggregate Exposure on Dashboard
* **Severity:** High (Data Leakage)
* **Root Cause:** The dashboard activity endpoint (`GET /api/reports/recent-activity`) queries `auditLogs` using only the `tenantId` filter, exposing trust-wide actions. Similarly, the SMS count query filters only on `tenantId`, leaking communications volumes.
* **File:**
  * [reports.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/reports.ts#L36)
  * [reports.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/reports.ts#L193-L206)
* **Fix Recommendation:** Scope the audit logs and SMS count using clinic/patient role-scoping filters resolved from `getRoleScope(req, "patient")`.

### 4. Cross-Tenant Metadata Leakage on Single Tenant Query
* **Severity:** High (Tenant Isolation)
* **Root Cause:** `GET /api/tenants/:id` fetches the tenant metadata by matching the param `id`, but does not verify that non-super admins are assigned to this tenant.
* **File:**
  * [tenants.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/tenants.ts#L61)
* **Fix Recommendation:** Restrict the access for standard users:
  ```typescript
  if (req.user?.role !== "SUPER_ADMIN" && req.params.id !== req.tenantId) {
    throw Errors.forbidden("You do not have access to this tenant");
  }
  ```

### 5. Assigning Non-Doctor Users as Clinicians
* **Severity:** High (Hierarchy Bugs)
* **Root Cause:** `POST /api/assignments` only checks if the `doctorId` exists in the tenant's user list, but does not verify that their role within the tenant is actually `DOCTOR`.
* **File:**
  * [assignments.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/assignments.ts#L47-L82)
* **Fix Recommendation:** Query the user's role assignment and ensure it matches the `DOCTOR` role:
  ```typescript
  const assignment = await prisma.user.findFirst({
    where: { id: data.doctorId, tenantId: req.tenantId!, deletedAt: null, role: { name: "DOCTOR" } }
  });
  if (!assignment) throw Errors.validation("Selected clinician is not a doctor in this tenant");
  ```

### 6. Clinical Visibility Bypass on Risk Score & Calculation Endpoints
* **Severity:** High (Doctor / Patient Visibility)
* **Root Cause:** The risk endpoints (`GET /api/risk-scores`, `POST /api/risk-scores/:patientId/calculate`) do not apply patient-level role scoping. Clinicians can view risk factors and calculate risk values for unassigned patients.
* **File:**
  * [riskScores.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/riskScores.ts)
* **Fix Recommendation:** Resolve patient role scope and append it to queries:
  ```typescript
  const patientRoleScope = await getRoleScope(req, "patient");
  const patient = await prisma.patient.findFirst({ where: { id: patientId, tenantId: req.tenantId!, deletedAt: null, ...patientRoleScope } });
  ```

### 7. Cross-Tenant Doctor Parameter Injection in Patient Outcomes
* **Severity:** High (Tenant Isolation)
* **Root Cause:** `POST /api/outcomes` accepts any `doctorId` in the payload without validating that the doctor belongs to the request's current tenant context.
* **File:**
  * [outcomes.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/outcomes.ts)
* **Fix Recommendation:** Validate that the targeted `doctorId` holds an active tenant mapping within the current tenant context.

### 8. Cross-Tenant Parent Entity Injection on Create Endpoints
* **Severity:** High (Tenant Isolation)
* **Root Cause:** Endpoints accepting `tenantId` in the body payload fallback to `req.tenantId` if omitted, but do not assert that the user has authorization for that injected `tenantId`.
* **Files:**
  * [users.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/users.ts#L104-L113)
  * [clinics.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/clinics.ts)
  * [areas.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/areas.ts)
* **Fix Recommendation:** Enforce that body `tenantId` matches `req.tenantId` for all non-super admins.

---

# Medium

### 1. Scoping Bypass on Clinic/Area Update and Deletion
* **Severity:** Medium (Hierarchy Bugs)
* **Root Cause:** PATCH and DELETE routes for clinics and areas only assert tenant matching (`assertTenantMatch`) and bypass clinic/area role-scoping boundaries.
* **Files:**
  * [clinics.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/clinics.ts)
  * [areas.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/areas.ts)
* **Fix Recommendation:** Filter the targeted clinic/area record by appending the resolved `roleScope` to the mutation lookup.

### 2. Clinic Scoping Bypass on CSV Patient Import
* **Severity:** Medium (Broken Features)
* **Root Cause:** The CSV patient import endpoint fetches the first tenant clinic and area blindly from the database and assigns them to imported patients, bypassing the CSV creator's clinical boundaries.
* **File:**
  * [import.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/import.ts)
* **Fix Recommendation:** Validate and select the first clinic and area within the importing user's role scope.

### 3. Sidebar Displays "Unknown" Tenant Name
* **Severity:** Medium (Sidebar / Forms)
* **Root Cause:** Standard users default to `"ALL"` tenant ID on initial render in `TenantContext.tsx`. Since their tenant list does not contain `"ALL"`, the sidebar display falls back to the `"Unknown"` label.
* **Files:**
  * [TenantContext.tsx](file:///e:/Caremesh-Platform/artifacts/web/src/contexts/TenantContext.tsx#L12-L15)
  * [Sidebar.tsx](file:///e:/Caremesh-Platform/artifacts/web/src/components/layout/Sidebar.tsx#L159)
* **Fix Recommendation:** Fallback to the user's first assigned tenant name if the active context is `"ALL"` and the user is not a super admin.

### 4. missing Edit and Delete UI for Consultations
* **Severity:** Medium (Broken Features)
* **Root Cause:** While backend route endpoints are present, the patient details interface has no UI elements, modals, or buttons to trigger consultation editing or deletion.
* **File:**
  * [patient-detail.tsx](file:///e:/Caremesh-Platform/artifacts/web/src/pages/patient-detail.tsx)
* **Fix Recommendation:** Implement "Edit Notes" and "Delete Consultation" buttons/dialogs inside the consultations history tab.

### 5. Clinic Scoping Bypass on User Details Fetch
* **Severity:** Medium (RBAC)
* **Root Cause:** `GET /api/users/:id` verifies the user's tenant mapping, but does not apply clinic role scoping. Restrained clinic admins can query profile details of team members in other clinics.
* **File:**
  * [users.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/users.ts#L71-L84)
* **Fix Recommendation:** Retrieve and append the user role scope (`getRoleScope(req, "user")`) to the detail query.

### 6. Cross-Clinic Task Assignee Allocation
* **Severity:** Medium (Hierarchy Bugs)
* **Root Cause:** `POST /api/tasks` validates that the assignee user belongs to the tenant, but does not verify that they share clinic assignments within the task creator's scope.
* **File:**
  * [tasks.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/tasks.ts)
* **Fix Recommendation:** Ensure the `assignedTo` user matches the creator's user role scope boundaries.

### 7. Super Admin Sidebar Caching in ALL Mode
* **Severity:** Medium (Sidebar)
* **Root Cause:** In `"ALL"` tenant mode, the sidebar displays `{user?.tenantName}` (which is cached to the user's primary/assigned tenant), rather than dynamically displaying "Platform View (All Tenants)".
* **File:**
  * [Sidebar.tsx](file:///e:/Caremesh-Platform/artifacts/web/src/components/layout/Sidebar.tsx#L158-L160)
* **Fix Recommendation:** Render "All Tenants" if `activeTenantId` is `"ALL"`.

---

# Low

### 1. Missing Area-Clinic Cascade on Registration & Assignment Forms
* **Severity:** Low (UI / Dropdowns)
* **Root Cause:** Clinic dropdown lists display all clinics inside the tenant, rather than filtering them dynamically based on the selected Area, leading to database validation errors upon submission if mismatches occur.
* **Files:**
  * [patients.tsx](file:///e:/Caremesh-Platform/artifacts/web/src/pages/patients.tsx)
  * [appointments.tsx](file:///e:/Caremesh-Platform/artifacts/web/src/pages/appointments.tsx)
  * [use-area-clinic-cascade.ts](file:///e:/Caremesh-Platform/artifacts/web/src/hooks/use-area-clinic-cascade.ts)
* **Fix Recommendation:** Implement a conditional filter hook that updates the clinics select options based on the selected `areaId` state value.

### 2. Missing Database-Level Unique Constraint on Active assignments
* **Severity:** Low (Database Constraints)
* **Root Cause:** No unique database constraint prevents assigning the same doctor to the same patient multiple times, resulting in duplicate records in `doctor_patient_assignments`.
* **File:**
  * [schema.prisma](file:///e:/Caremesh-Platform/artifacts/api-server/prisma/schema.prisma)
* **Fix Recommendation:** Add a unique constraint `@@unique([doctorId, patientId, deletedAt])` or similar application-level logic to reject duplicate assignments.

### 3. Mobile Sidebar Hamburger Overlay
* **Severity:** Low (CSS / UI)
* **Root Cause:** The mobile hamburger toggle button is fixed in a floating position that overlaps dashboard widget headers and top navigation content.
* **File:**
  * [Sidebar.tsx](file:///e:/Caremesh-Platform/artifacts/web/src/components/layout/Sidebar.tsx#L284-L294)
* **Fix Recommendation:** Offset mobile dashboard headers or push the hamburger toggle into a standardized top-nav bar.

### 4. Table Overflow on Roles & Permissions Screen
* **Severity:** Low (CSS / Visual Issues)
* **Root Cause:** The permissions grid table lacks a wrapping scroll block, leading to horizontal overflow breaks on smaller laptop screen resolutions.
* **File:**
  * [roles.tsx](file:///e:/Caremesh-Platform/artifacts/web/src/pages/roles.tsx)
* **Fix Recommendation:** Wrap the grid table element in an `overflow-x-auto` container class.
