# Multi-Tenant RBAC & Registration Architecture Audit

## 1. Executive Summary
CareNexus has undergone a critical architectural shift to transform it from a generic platform into a strict enterprise multi-tenant healthcare SaaS. The most significant flaw identified and resolved was the dynamic creation and assignment of the `SUPER_ADMIN` role upon every new tenant registration. 

## 2. Issues Found & Resolved

| Issue | Resolution |
|---|---|
| **Registration Flow Escalation** | `auth.ts` modified to default all new registrations to `CLINIC_ADMIN`. The dynamic creation of `SUPER_ADMIN` has been permanently removed. |
| **User Creation Escalation** | `users.ts` modified to prevent non-super-admins from assigning or creating `SUPER_ADMIN` roles via `POST /` or `PATCH /:id`. |
| **UI Privilege Escalation** | `roles.ts` modified to filter `SUPER_ADMIN` from the roles list API unless requested by a `SUPER_ADMIN`, hiding it from the UI dropdowns. |
| **Missing Role Visibility (Backend)** | Created `roleScope.ts` to generate Prisma `where` clause filters based on `req.user.role`. Applied to Patients, Appointments, Consultations, and Reports. |
| **Missing UI Module Filtering** | `Sidebar.tsx` modified to use an `allowedRoles` matrix, hiding restricted modules (e.g., Roles, Areas, Clinics) from clinical or operational staff. |

## 3. Permission Matrix

The `authorizePermission(module, action)` middleware enforces dynamic permissions based on the `RolePermission` and `Permission` tables. Below is the overarching hierarchy governing what roles *should* be assigned which permissions via the UI.

| Role | Module Access (Visibility) | Data Scope (Visibility) | Typical CRUD Rights |
|---|---|---|---|
| **SUPER_ADMIN** | All Modules | Cross-Tenant (All Data) | Full CRUD |
| **AREA_ADMIN** | All except System/Roles | Assigned Area Clinics | Full CRUD (within Area) |
| **CLINIC_ADMIN** | Dashboard, Patients, Appts, Users | Assigned Clinic | Full CRUD (within Clinic) |
| **DOCTOR** | Dashboard, Patients, Appts | Assigned Patients/Appts | Read/Update (Patients), Create (Consults) |
| **OPERATOR/STAFF**| Patients, Appts | Assigned Clinic | Read-Only or limited updates |

## 4. Tenant Isolation Validation

Tenant isolation is handled at the middleware layer via `requireTenant` and `assertTenantMatch` in `tenantScope.ts`.
- **Validation**: Every authenticated request must carry a valid `tenantId` in its JWT token.
- **Enforcement**: Any `prisma.findFirst` or `prisma.findMany` explicitly includes `{ tenantId: req.tenantId }`. If a user attempts to access an ID belonging to another tenant, the record will not be found, resulting in a `404 Not Found`.

## 5. Role Visibility Validation

Prior to this audit, a `DOCTOR` could query the `GET /api/patients` endpoint and retrieve all patients within the clinic or tenant. This has been resolved via the `roleScope.ts` middleware.

**Implementation**:
- `roleScope` returns `{ doctorAssignments: { some: { doctorId: userId } } }` for DOCTORs when querying patients.
- This snippet is spread into the `where` clause: `prisma.patient.findMany({ where: { tenantId, ...roleScope } })`.
- This ensures the database physically filters the records before they reach the Node process, ensuring zero data leakage.

## 6. Registration Flow Validation

The new flow operates as follows:
1. User submits `/register` payload.
2. Tenant is created.
3. System fetches the statically seeded `CLINIC_ADMIN` role (or creates it safely if missing from seed).
4. User is created and assigned the `CLINIC_ADMIN` role.
5. User cannot escalate to `SUPER_ADMIN` via the frontend as the role API hides it.
