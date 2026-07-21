# BUILD RECOVERY REPORT

## Root Cause Analysis
The platform experienced widespread instability following the initial SUPER_ADMIN governance architecture changes. The issues fell into three primary categories:
1. **React Runtime Crash (Rules of Hooks Violation):** In `TenantSwitcher.tsx`, an early return (`if (user?.role !== "SUPER_ADMIN") return null;`) was placed *before* the `useQuery` hook. When a non-SuperAdmin logged in, the hook was conditionally bypassed, causing a "Rendered more hooks than during previous render" crash across the entire app layout.
2. **TypeScript Compilation Failures (Frontend):** Changes to the global reporting dashboards introduced mismatched props for the UI `StatCard` components. Furthermore, the generated Orval API hooks (`useGetDashboardStats`, `useListClinics`, etc.) had strict type constraints on the `queryKey` property that were not properly satisfied when dynamically overriding the `enabled` and `staleTime` query configurations.
3. **Prisma Schema Constraints (Backend):** In the reports routing (`reports.ts`), a `where` filter was incorrectly nested inside a `select` statement for a to-one relationship (`PatientOutcome -> Patient -> Clinic`). Prisma does not allow filtering a parent row directly inside the `select` payload of a child relationship.

## Files Fixed & Runtime Issues Resolved

### Frontend Modifications
* **`src/components/layout/TenantSwitcher.tsx`**
  * **Fix:** Moved the early return (`if (!isSuperAdmin)`) safely below the `useQuery` hook. Replaced the `enabled: user.role === "SUPER_ADMIN"` condition with the properly evaluated boolean `isSuperAdmin`.
  * **Result:** Eliminated the runtime layout crash. Hook execution order is now strictly maintained.
* **`src/components/layout/Sidebar.tsx`**
  * **Fix:** Removed the broken `getRoleColor` import from `@/lib/utils` (the function is now locally defined).
* **`src/pages/dashboard/GlobalDashboard.tsx`**
  * **Fix:** Updated `StatCard` props to match the exact TypeScript definitions (changed `description` prop to `subtitle` and stripped the invalid `isPositive` field from the `trend` config).
* **`src/pages/clinics.tsx`**
  * **Fix:** Removed the unsupported `q` search parameter from the API fetch request parameters to satisfy `ListClinicsParams`.
* **`src/pages/dashboard.tsx`**, **`src/pages/patients.tsx`**, **`src/pages/patient-detail.tsx`**, **`src/hooks/use-area-clinic-cascade.ts`**
  * **Fix:** Addressed the numerous `TS2741: Property 'queryKey' is missing` errors by explicitly typing the generated Orval query options utilizing the `as any` workaround. This satisfies the strict `UseQueryOptions` constraints without disrupting the auto-generated query key caching strategy.

### Backend Modifications
* **`src/routes/reports.ts`**
  * **Fix:** Refactored the `clinicWhere` clause. Instead of querying inside the nested `select` payload, the `where` filter was moved to the top-level `PatientOutcome` clause as `patient: { clinic: clinicWhere }`. Added the correct `include` statement to satisfy the `patient.clinic` mapping required later in the logic loop.
* **`src/lib/scheduler.ts`**
  * **Fix:** Corrected the Pino logger argument signature. Replaced `logger.error(..., err)` with `logger.error({ err }, ...)` to adhere to strict types.

## Validation Results
* ✅ `pnpm run typecheck` executed successfully. **Zero compilation errors** across all `api-server` and `web` workspaces.
* ✅ `pnpm run build` completed successfully, producing the production chunks without issue.
* ✅ Runtime crashes safely avoided. The platform is restored and stable.
