# CareNexus PMS — RBAC & Tenant Isolation Audit Report

**Prepared by:** Principal Software Architect  
**Scope:** Authentication, Authorization, RBAC, Tenant Isolation, Doctor-Patient Assignments, Patient Visibility, Dashboard & Reports  
**Status:** Audit Complete (Remediation Pending Approval)

---

## 1. Executive Summary
A comprehensive security, authorization, and data isolation audit of the CareNexus codebase has been conducted. The audit traced user access across all system roles (**SUPER_ADMIN**, **AREA_ADMIN**, **CLINIC_ADMIN**, **DOCTOR**, **OPERATOR**, **STAFF**) and analyzed all API controllers, middleware, and database queries.

While fundamental security building blocks (such as token-based authentication and a centralized `getRoleScope` visibility builder) are in place, the audit revealed several critical privilege escalation vectors, tenant isolation leaks, clinical scoping bypasses, and database crash risks. 

*No code modifications have been applied yet.*

---

## 2. Role-Based Data Access Matrix

The following matrix outlines the data access boundaries verified in the active codebase:

| Role | Functional Permissions (RBAC) | Clinical Data Scope (Visibility) | Issues / Leaks Found |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | Wildcard access to all system actions (write, read, delete). | System-wide (cross-tenant, cross-area, cross-clinic). | Fails/crashes when creating resources in global "ALL" tenant mode. |
| **AREA_ADMIN** | Full administrative rights within tenant. | Limited to clinics/patients inside their assigned Area(s). | Bypasses scoping for tenant-wide reports, audit logs, and area/clinic edits. |
| **CLINIC_ADMIN** | Full administrative rights within tenant. | Limited to patients, users, and tasks inside their assigned Clinic(s). | Can register patients, view users, create clinics, and edit resources in unassigned clinics. |
| **DOCTOR** | Can write patients, appointments, consultations, outcomes, tasks, and communications. | Strictly limited to explicitly assigned patients and appointments owned. | Can read all risk scores, view all tenant audit logs, and select unassigned clinic/doctors in updates. |
| **OPERATOR** | Can write patients, appointments, tasks, communications. Can read consultations. | Limited to patients, appointments, and tasks within assigned clinics. | Can register patients to unassigned clinics and access unscoped SMS communications. |
| **STAFF** | Read-only patients, appointments, consultations. Can read/write tasks. | Limited to patients, appointments, and tasks within assigned clinics. | Accesses unscoped SMS records and tenant-wide reports. |

---

## 3. Comprehensive Audit Findings

The table below summarizes the identified bugs, categorized by severity:

| Bug ID | Category | Severity | File Location | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Tenant Isolation | 🔴 CRITICAL | roles.ts | Cross-Tenant Custom Role Modification & Deletion. |
| **BUG-002** | Authentication | 🔴 CRITICAL | Multiple (see details) | System-Wide Write Crash for Super Admins in "ALL" Tenant Mode. |
| **BUG-003** | Authorization | 🟠 HIGH | users.ts | Privilege Escalation on User Creation (Missing Role Hierarchy Check). |
| **BUG-004** | Tenant Isolation | 🟠 HIGH | tenants.ts | Cross-Tenant Metadata Leakage on Single Tenant Query. |
| **BUG-005** | Doctor Assignment | 🟠 HIGH | assignments.ts | Assignment of Non-Doctor Users to Patient Doctor Field. |
| **BUG-006** | Clinical Visibility | 🟠 HIGH | riskScores.ts | Clinical Visibility Bypass on Risk Score & Calculation Endpoints. |
| **BUG-007** | Clinical Visibility | 🟠 HIGH | communications.ts | Tenant-Wide SMS Leakage and Unscoped Message Dispatch. |
| **BUG-008** | Tenant Isolation | 🟠 HIGH | outcomes.ts | Cross-Tenant Doctor Parameter Injection in Patient Outcomes. |
| **BUG-009** | Tenant Isolation | 🟠 HIGH | users.ts, clinics.ts, areas.ts | Cross-Tenant Parent Entity Injection on Create Endpoints. |
| **BUG-010** | Clinical Visibility | 🟡 MEDIUM | clinics.ts, areas.ts | Scoping Bypass on Clinic/Area Update and Deletion. |
| **BUG-011** | Clinical Visibility | 🟡 MEDIUM | patients.ts, programs.ts, programEnrollments.ts | Clinic Admin / Operator Patient Registration & Program Scoping Bypass. |
| **BUG-012** | Doctor Assignment | 🟡 MEDIUM | assignments.ts | Missing Permission Verification & Open Access on Assignments List. |
| **BUG-013** | Dashboard / Reports | 🟡 MEDIUM | reports.ts | Tenant-Wide Audit Log Exposure & Unscoped Stat Counts. |
| **BUG-014** | Clinical Visibility | 🟡 MEDIUM | import.ts | Scoping Bypass during Patient Import (Auto-Assign to First Clinic). |
| **BUG-015** | Clinical Visibility | 🟡 MEDIUM | users.ts | Clinic Scoping Bypass on User Details Fetch. |
| **BUG-016** | Clinical Visibility | 🟡 MEDIUM | tasks.ts | Cross-Clinic Task Assignee Allocation. |

---

## 4. Detailed Audit Findings & Fix Recommendations

### BUG-001: Cross-Tenant Custom Role Modification & Deletion
* **Bug**: A user authenticated in Tenant A with `roles:write` permission can query, modify, delete, and manage permissions for custom roles belonging to Tenant B.
* **Root Cause**: The endpoints `GET /api/roles/:id`, `PATCH /api/roles/:id`, `DELETE /api/roles/:id`, `GET /api/roles/:id/permissions`, `POST /api/roles/:id/permissions`, and `DELETE /api/roles/:id/permissions/:permissionId` locate the role record strictly by `id` without verifying the role's `tenantId` match against the requester's `req.tenantId`.
* **File**: roles.ts
* **Fix Recommendation**: Ensure all database lookups check role ownership. Replace `prisma.role.findFirst({ where: { id } })` with:
  ```typescript
  const role = await prisma.role.findFirst({
    where: { 
      id: req.params.id, 
      OR: [{ tenantId: req.tenantId }, { isSystem: true }] 
    }
  });
  ```
  Throw `Errors.notFound("Role")` if not found. For mutating operations, prevent editing system roles and enforce tenant matches.

---

### BUG-002: System-Wide Write Crash for Super Admins in "ALL" Tenant Mode
* **Bug**: Super Admins operating with the `x-tenant-id: ALL` header crash the server with database validation errors when creating resources.
* **Root Cause**: Under `ALL` mode, `requireTenant` sets `req.tenantId = undefined`. The write routes for appointments, consultations, tasks, outcomes, doctor-patient assignments, and outcome-metrics assign `req.tenantId!` directly to the Prisma `create` model. Because `tenantId` is a required non-nullable database column, Prisma rejects the query.
* **Files**: 
  * appointments.ts
  * consultations.ts
  * tasks.ts
  * outcomes.ts
  * assignments.ts
  * communications.ts
  * outcome-metrics.ts
* **Fix Recommendation**: Implement a check in all resource-creation endpoints to require a specific tenant target, rejecting the write when the active context is `ALL`:
  ```typescript
  if (!req.tenantId) {
    throw Errors.validation("A specific tenant must be selected to perform this write action. Please select a tenant from the switcher.");
  }
  ```

---

### BUG-003: Privilege Escalation on User Creation (Missing Role Hierarchy Check)
* **Bug**: Clinic Admins or Area Admins can create new users and assign them higher roles (e.g. `SUPER_ADMIN` or `AREA_ADMIN`).
* **Root Cause**: `POST /api/users` does not validate that the creator role permits assigning the target role in `CreateUserSchema` (missing the `ROLE_HIERARCHY` validation). While `PATCH /api/users/:id` implements this hierarchy check, the `POST` route is undefended.
* **File**: users.ts
* **Fix Recommendation**: Integrate the role hierarchy check into the user creation endpoint before building the user object:
  ```typescript
  const userRole = req.user?.role ?? "";
  const allowedRoles = ROLE_HIERARCHY[userRole] || [];
  if (!allowedRoles.includes(role.name)) {
    throw Errors.forbidden(`Your role (${userRole}) is not permitted to assign the ${role.name} role`);
  }
  ```

---

### BUG-004: Cross-Tenant Metadata Leakage on Single Tenant Query
* **Bug**: Any authenticated user can view metadata (user counts, patient count, programs, and areas) of other tenants by passing their UUIDs.
* **Root Cause**: `GET /api/tenants/:id` checks `where: { id: req.params.id }` but does not enforce that standard users must match `req.tenantId`.
* **File**: tenants.ts
* **Fix Recommendation**: Enforce standard tenant mapping matches for non-super admins:
  ```typescript
  if (req.user?.role !== "SUPER_ADMIN" && req.params.id !== req.tenantId) {
    throw Errors.forbidden("You do not have access to this tenant");
  }
  ```

---

### BUG-005: Assignment of Non-Doctor Users to Patient Doctor Field
* **Bug**: Clinic Admins can link an Operator or Staff user as the "doctor" for a patient in doctor-patient assignments.
* **Root Cause**: `POST /api/assignments` only validates that the `doctorId` exists in the tenant's user list, but does not check if their role in the tenant is `DOCTOR`.
* **File**: assignments.ts
* **Fix Recommendation**: Add a check to verify that the targeted doctor assignment user holds the system role of `DOCTOR` within the tenant:
  ```typescript
  const doctorTenantAssignment = await prisma.userTenantAssignment.findFirst({
    where: { userId: data.doctorId, tenantId: req.tenantId!, status: "ACTIVE" },
    include: { role: true }
  });
  if (!doctorTenantAssignment || doctorTenantAssignment.role.name !== "DOCTOR") {
    throw Errors.validation("The selected user is not a doctor in this tenant");
  }
  ```

---

### BUG-006: Clinical Visibility Bypass on Risk Score & Calculation Endpoints
* **Bug**: Clinicians (Doctors/Staff) can list all patient risk scores, view factors for unassigned patients, and run calculations on patients outside their scope.
* **Root Cause**: The endpoints `GET /api/risk-scores`, `GET /api/risk-scores/:patientId`, and `POST /api/risk-scores/:patientId/calculate` do not apply `getRoleScope(req, "patient")` filters.
* **File**: riskScores.ts
* **Fix Recommendation**: Retrieve and apply patient role scoping to the database queries in all three risk endpoints:
  ```typescript
  const patientRoleScope = await getRoleScope(req, "patient");
  const where = { id: patientId, tenantId: req.tenantId!, deletedAt: null, ...patientRoleScope };
  ```

---

### BUG-007: Tenant-Wide SMS Leakage and Unscoped Message Dispatch
* **Bug**: A clinician or operator can read and send SMS communications for patients they are not assigned to, bypassing clinical boundary controls.
* **Root Cause**: The endpoints `GET /api/communications`, `POST /api/communications`, `GET /api/communications/:id`, `DELETE /api/communications/:id`, and `GET /api/communications/sms` do not apply patient-level role scoping.
* **File**: communications.ts
* **Fix Recommendation**: Scope the SMS list and details queries using patient role filters, and verify that the target patient in send operations belongs to the sender's scope:
  ```typescript
  const patientRoleScope = await getRoleScope(req, "patient");
  const where: any = { tenantId: req.tenantId!, patient: patientRoleScope };
  ```

---

### BUG-008: Cross-Tenant Doctor Parameter Injection in Patient Outcomes
* **Bug**: A user in Tenant A can create a patient outcome record and link it to a `doctorId` belonging to Tenant B.
* **Root Cause**: `POST /api/outcomes` accepts `doctorId` from the request body. If provided, the backend records it directly without validating that the doctor belongs to the current tenant.
* **File**: outcomes.ts
* **Fix Recommendation**: Validate that the body-provided `doctorId` has an active tenant assignment inside the current tenant context:
  ```typescript
  if (data.doctorId) {
    const doctorInTenant = await prisma.userTenantAssignment.findFirst({
      where: { userId: data.doctorId, tenantId: req.tenantId!, status: "ACTIVE" }
    });
    if (!doctorInTenant) throw Errors.validation("Doctor does not belong to this tenant");
  }
  ```

---

### BUG-009: Cross-Tenant Parent Entity Injection on Create Endpoints
* **Bug**: Standard users can inject clinics, areas, or users belonging to Tenant B into tenant creation endpoints, compromising relational database integrity.
* **Root Cause**: Multiple endpoints accept `tenantId` in the body payload, falling back to `req.tenantId` if omitted, but do not assert that the user has authorization for that `tenantId`.
* **Files**:
  * users.ts (`POST /api/users`)
  * clinics.ts (`POST /api/clinics`)
  * areas.ts (`POST /api/areas`)
* **Fix Recommendation**: Reject requests where the body `tenantId` does not match `req.tenantId` for non-Super Admin accounts:
  ```typescript
  const targetTenantId = data.tenantId || req.tenantId;
  if (req.user?.role !== "SUPER_ADMIN" && targetTenantId !== req.tenantId) {
    throw Errors.forbidden("You cannot create resources for another tenant");
  }
  ```

---

### BUG-010: Scoping Bypass on Clinic/Area Update and Deletion
* **Bug**: Clinic Admins or Area Admins can modify or delete clinics and areas that they are not assigned to, as long as they reside within the same tenant.
* **Root Cause**: `PATCH` and `DELETE` routes for clinics and areas only enforce tenant matching (`assertTenantMatch`) and bypass role scoping checks.
* **Files**:
  * clinics.ts
  * areas.ts
* **Fix Recommendation**: Apply the corresponding role scope to the database queries locating clinic and area records for mutations:
  ```typescript
  const roleScope = await getRoleScope(req, "clinic"); // or "area"
  const clinic = await prisma.clinic.findFirst({ where: { id: req.params.id, tenantId: req.tenantId!, deletedAt: null, ...roleScope } });
  ```

---

### BUG-011: Clinic Admin / Operator Patient Registration & Program Scoping Bypass
* **Bug**: Clinic Admins, Doctors, or Operators can register patients in any clinic/area/program in the tenant, even ones they are not assigned to. They can also link unassigned programs to patients.
* **Root Cause**: `POST /api/patients` and `POST /api/program-enrollments` validate that clinics, areas, and programs exist in the tenant, but do not filter them against the user's role scope.
* **Files**:
  * patients.ts (`POST /`)
  * programEnrollments.ts (`POST /`)
* **Fix Recommendation**: Validate that the target clinic, area, and program belong to the creator's role scope:
  ```typescript
  const clinicScope = await getRoleScope(req, "clinic");
  const clinic = await prisma.clinic.findFirst({ where: { id: clinicId, tenantId: req.tenantId!, ...clinicScope } });
  if (!clinic) throw Errors.validation("Selected clinic is invalid or out of scope");
  ```

---

### BUG-012: Missing Permission Verification & Open Access on Assignments List
* **Bug**: Any logged-in user can query the list of doctor-patient assignments, and assignments can be scheduled using unrelated task permissions.
* **Root Cause**: `GET /api/assignments` lacks an `authorizePermission` middleware completely. `POST /api/assignments` relies on `authorizePermission("tasks", "write")` instead of assignments/patients permission.
* **File**: assignments.ts
* **Fix Recommendation**: Add `authorizePermission("patients", "read")` to `GET /` and update `POST /` to require `authorizePermission("patients", "write")`.

---

### BUG-013: Tenant-Wide Audit Log Exposure & Unscoped Stat Counts
* **Bug**: Standard clinicians (Doctors, Operators, Staff) can query the dashboard endpoints to see counts of all tenants in the database, read all tenant audit logs, and get count aggregates of SMS communications outside their scope.
* **Root Cause**: In `GET /api/reports/dashboard`, `totalTenants` counts all tenants in the DB, and `pendingCommunications` is queried with only a tenant filter. In `GET /api/reports/recent-activity`, audit logs are retrieved using only `tenantId` with no role scoping.
* **File**: reports.ts
* **Fix Recommendation**: 
  1. Remove `totalTenants` from the response (or set to 1) for non-Super Admins.
  2. Scope the SMS count and recent activity audit logs to the clinics assigned to the user using the resolved user role scope:
     ```typescript
     const patientScope = await getRoleScope(req, "patient");
     const pendingCommunications = await prisma.smsCommunication.count({
       where: { tenantId, status: { in: ["QUEUED", "SENT"] }, patient: patientScope }
     });
     ```

---

### BUG-014: Scoping Bypass during Patient Import (Auto-Assign to First Clinic)
* **Bug**: Patient CSV import bypasses clinical boundaries, assigning imported patients to the first clinic and area returned by the database.
* **Root Cause**: `POST /api/import/patients` fetches the first tenant clinic and area blindly via `prisma.clinic.findFirst({ where: { tenantId } })` and assigns them to the patient.
* **File**: import.ts
* **Fix Recommendation**: Find the first clinic and area that fits the user's role scope, rather than the raw tenant first:
  ```typescript
  const clinicScope = await getRoleScope(req, "clinic");
  const defaultClinic = await prisma.clinic.findFirst({ where: { tenantId: req.tenantId!, ...clinicScope } });
  ```

---

### BUG-015: Clinic Scoping Bypass on User Details Fetch
* **Bug**: A Clinic Admin or Operator restricted to Clinic A can fetch sensitive details of any user in the entire tenant (including Clinic B admins).
* **Root Cause**: `GET /api/users/:id` only validates tenant mapping but completely ignores role-scoping filters (`getRoleScope(req, "user")`).
* **File**: users.ts
* **Fix Recommendation**: Retrieve and append the user role scope in the detail query:
  ```typescript
  const roleScope = await getRoleScope(req, "user");
  const user = await prisma.user.findFirst({
    where: { id: req.params.id, tenantAssignments: { some: { tenantId: req.tenantId! } }, deletedAt: null, ...roleScope }
  });
  ```

---

### BUG-016: Cross-Clinic Task Assignee Allocation
* **Bug**: A user restricted to Clinic A can assign a task to a user who is assigned to Clinic B.
* **Root Cause**: `POST /api/tasks` validates that the assignee user belongs to the tenant, but does not check if that user is assigned to a clinic within the creator's role scope.
* **File**: tasks.ts
* **Fix Recommendation**: Apply the user role scope to verify the assignee user:
  ```typescript
  const userScope = await getRoleScope(req, "user");
  const assignee = await prisma.user.findFirst({
    where: { id: data.assignedTo, tenantAssignments: { some: { tenantId: req.tenantId! } }, deletedAt: null, ...userScope }
  });
  ```

---

## 5. Architectural Remediation & Next Steps

1. **Wait for Approval**: Submit this audit report for peer review and architectural approval.
2. **Phase 1 Remediation**: Implement fixes for `BUG-001` (Tenant custom roles) and `BUG-002` (ALL mode writes) to secure basic platform operations.
3. **Phase 2 Remediation**: Address high-severity privilege escalation and visibility leaks (`BUG-003` to `BUG-009`).
4. **Phase 3 Remediation**: Standardize scoping across all sub-resources and import modules (`BUG-010` to `BUG-016`).
5. **Validation Run**: Run the server test suite to ensure no regressions occur.