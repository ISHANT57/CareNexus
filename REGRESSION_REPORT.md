# CareNexus — Regression Audit Report

## 1. Overview
A technical comparison between the current modernized codebase and the last known stable codebase (`CareNexus-main`) has identified critical regressions across the platform's core functional areas: authentication, tenant context, RBAC scoping, dashboard metrics, and clinic hierarchies.

Below is the detailed audit of the regressions, root causes, and resolution strategy.

---

## 2. Identified Regressions & Audits

### Issue 1: Sidebar Displays "Unknown" Tenant Name
*   **What worked before:** Standard users logged in successfully and saw their tenant name (e.g., "Northgate Mental Health Trust") displayed under their name in the sidebar.
*   **What broke:** The modernization refactored `Sidebar.tsx` to use the new `useActiveRole` hook and check `activeTenantId` against `"ALL"`. Standard users default to `"ALL"` tenant ID on initial render, which does not exist in their tenant assignments list, resulting in `"Unknown"` fallback.
*   **Introduced in:** *Rebuild enterprise sidebar and tenant switcher* phase.
*   **Recommended Fix:** Revert `Sidebar.tsx` to the stable version or add a fallback to use the user's first tenant assignment name when `activeTenantId` is `"ALL"`.

### Issue 2: Dashboard Redesigned with Mock Data & Missing Clinic Table
*   **What worked before:** 
    *   The dashboard displayed real database counts for patients, appointments, and consultations.
    *   A "Clinic Performance Table" showed real patient, appointment, and enrollment counts per clinic.
    *   Clicking a program bar triggered a lazy-loaded modal containing a list of enrolled patients, doctors, and statuses.
*   **What broke:** 
    *   The modernized dashboard replaced real patient status and program data charts with hardcoded mock arrays (`growthData`, `programDist`).
    *   The "Clinic Performance Table" was deleted.
    *   The "Program Drill-down Modal" was deleted.
    *   Metrics count logic was bypassed.
*   **Introduced in:** *Rebuild primary dashboard with enterprise analytics* phase.
*   **Recommended Fix:** Restore `GlobalDashboard.tsx` and `dashboard.tsx` to the stable state.

### Issue 3: RBAC Scoping & Patient Visibility Leaks
*   **What worked before:** Doctors were strictly locked to their clinical sphere. Querying patients list (`GET /api/patients`), appointments, consultations, and outcomes was strictly filtered using the active doctor's patient assignments (`{ doctorAssignments: { some: { doctorId: userId } } }`).
*   **What broke:** The modernization restructured the role-scoping middleware and route handlers, introducing leaks where doctors could query all clinic/tenant patients and see appointments/tasks not assigned to them.
*   **Introduced in:** *Implement robust role-based access control and scopes* phase.
*   **Recommended Fix:** Revert middleware scoping rules (`roleScope.ts`, `tenantScope.ts`) and routes to the stable state.

### Issue 4: Hierarchical Master Data & Cascade Breakage
*   **What worked before:** Dropdowns and cascade selection worked perfectly for Tenants -> Areas -> Clinics -> Programs -> Doctors -> Patients.
*   **What broke:** The cascade selectors and filters on creation/edit forms were refactored with new hooks, introducing validation errors and cascading failures where invalid area/clinic mappings are saved.
*   **Introduced in:** *Stabilize area-clinic cascade selection hook* phase.
*   **Recommended Fix:** Revert frontend forms and page structures (`patients.tsx`, `areas.tsx`, `clinics.tsx`, `programs.tsx`) to their stable configurations.

---

## 3. Restoration Strategy
To guarantee 100% correctness and safety without introducing new bugs, we will systematically overwrite the modernized files with their stable counterparts. This will restore the platform to its exact pre-modernization state while preserving local environment configurations (`.env`, `.env.local`) and dependencies (`node_modules`).
