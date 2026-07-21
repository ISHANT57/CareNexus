# CARE_TEAM_FIX_REPORT.md — Care Team Assignment Duplication & Scope Fix

This report validates the correction of patient doctor assignment leaks and duplication controls in the Care Team sidebar.

---

## 1. Audited Violations & Resolutions

### 1.1 Care Team Scope Leak (BUG-001)
*   **Issue**: When viewing a patient's clinical detail page, the Care Team sidebar loaded clinician assignments for all patients in the tenant.
*   **Root Cause**: `GET /api/assignments` ignored the `patientId` parameter in the request query.
*   **Fix**: Modified `assignments.ts` to destructure `patientId` and apply it to the database query filter. Now, only clinicians explicitly assigned to the selected patient are displayed.

### 1.2 Care Team Single-Doctor Limitation & Duplicates (BUG-002)
*   **Issue**: Creating a new assignment soft-deleted all existing assignments for the patient, restricting the care team size to exactly one doctor.
*   **Root Cause**: Global `updateMany` cleared all assignments of `patientId` on `POST /`.
*   **Fix**: Removed global deactivation. Added a validation check using `findFirst` to query if the same doctor is already assigned to the patient's active team:
    *   If the doctor is already assigned, the existing active assignment is returned immediately with a `200 OK` status, preventing database duplicates.
    *   If not assigned, a new assignment is created, allowing multiple unique clinicians to belong to the patient's Care Team.

### 1.3 TypeScript Compilation Error
*   **Issue**: `assignments.ts` GET query select block was attempting to query `role` directly from the `User` model, which caused compilation failures.
*   **Root Cause**: The Prisma schema models role associations via `UserTenantAssignment` rather than a direct relation on `User`.
*   **Fix**: Included `tenantAssignments` with `role` relation inside the select block and mapped the response dynamically on the backend. This returns the exact structure expected by the frontend without compile errors.
