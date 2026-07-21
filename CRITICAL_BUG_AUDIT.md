# CareNexus Critical Bug Audit Report

This report outlines all identified security, architecture, role capability, and frontend bugs in the CareNexus PMS.

---

## 1. Audited Bugs & Architectural Gaps

| Bug ID | Severity | Module / Area | Description | Root Cause | Affected Files | Fix Strategy |
|---|---|---|---|---|---|---|
| **BUG-001** | **Critical** | API / Care Team | Patient Care Team sidebar shows all tenant assignments. | `GET /api/assignments` does not destructure or filter by `patientId` query parameter. | [assignments.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/assignments.ts) | Destructure `patientId` from `req.query` and apply to where clause. |
| **BUG-002** | **High** | API / Care Team | Care Team restricted to a single doctor. | `POST /api/assignments` soft-deletes *all* active assignments for a patient instead of only preventing duplicate assignments of the *same* clinician. | [assignments.ts](file:///e:/Caremesh-Platform/artifacts/api-server/src/routes/assignments.ts) | Only soft-delete or reject duplicates matching the same `(patientId, doctorId)` pair. |
| **BUG-003** | **Medium** | Frontend / UI | Sidebar displays `"Unknown"` tenant name. | Standard user defaults to `"ALL"` tenant ID on initial render, which does not exist in their tenant assignments list, resulting in `"Unknown"` fallback. | [Sidebar.tsx](file:///e:/Caremesh-Platform/artifacts/web/src/components/layout/Sidebar.tsx) | Add safe fallback to display the user's first tenant assignment name when `activeTenantId` is `"ALL"`. |
| **BUG-004** | **High** | Database / Constraints | Missing unique constraint on active doctor assignments. | No unique database constraint prevents assigning the same doctor to the same patient multiple times. | [schema.prisma](file:///e:/Caremesh-Platform/artifacts/api-server/prisma/schema.prisma) | Enforce unique doctor-patient checks in the route handler, or add application-level validation. |

---

## 2. Security & Tenant Isolation Verification

*   **Tenant Isolation**: Verified that all endpoints validate tenant ownership of associated foreign keys (Area, Clinic, Program, Patient, User). No cross-tenant access leaks exist in outcomes, tasks, consultations, or appointments.
*   **Role Permissions**: Verified that role-scoping middleware is consistently applied to all list/detail and update endpoints. Clinic Admins are constrained to their clinics, Area Admins to their areas, and Doctors to their assigned patients.
*   **Dashboard Integrity**: Verified that all metrics endpoints in `reports.ts` perform real database counts and grouping, with no mock arrays or seed data.
