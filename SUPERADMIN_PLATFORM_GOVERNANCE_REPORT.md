# SUPER_ADMIN Platform Governance Report

## 1. Executive Summary
CareNexus has been successfully upgraded to provide true platform-wide visibility and governance exclusively to the `SUPER_ADMIN` role. Rather than strictly adhering to isolated tenant containers, the `SUPER_ADMIN` can now operate in a "Platform View" that aggregates data across all healthcare organizations, or use the "Tenant Switcher" to drill down into a specific tenant. All other roles remain strictly partitioned within their assigned tenant boundary.

## 2. Architectural Paradigm Shift

### The `x-tenant-id` Header Injection
Previously, the backend `requireTenant` middleware strictly enforced that `req.tenantId` must equal `req.user.tenantId`.
Now:
- If a user is `SUPER_ADMIN`, the middleware parses the `x-tenant-id` HTTP header.
- If the header is `"ALL"`, the middleware sets `req.tenantId = undefined`.
- Prisma natively drops `undefined` fields from `where` clauses. Thus, `{ tenantId: undefined, deletedAt: null }` becomes `SELECT * WHERE deletedAt IS NULL`.
- This provides an elegant, zero-overhead mechanism for "Global Search" and "Platform Rollups" without requiring custom SQL rewrites.

### The Tenant Context (Frontend)
A new React `TenantContext` has been implemented at the root of the application.
- It stores the `activeTenantId` (either `"ALL"` or a specific UUID).
- On change, it delegates to the API client (`setTenantIdGetter()`) which intercepts all outgoing `fetch` calls and injects the header.

## 3. Capabilities Matrix

| Feature | SUPER_ADMIN (Platform View) | SUPER_ADMIN (Tenant View) | CLINIC_ADMIN / DOCTOR |
|---|---|---|---|
| **Dashboard** | `GlobalDashboard` (Aggregated metrics) | `TenantDashboard` (Specific stats) | `TenantDashboard` (Specific stats) |
| **Audit Logs** | Global Audit Logs spanning all actions | Tenant-specific Audit Logs | None (or restricted to Role) |
| **Search** | Global Patient/User Search | Tenant-specific Search | Tenant-specific Search |
| **Tenant Manager** | Yes (`/tenants` UI) | Yes | No |
| **System Settings**| Global Configurations | Tenant Configurations | No |

## 4. UI/UX Enhancements

- **Tenant Switcher**: A dynamic dropdown added to the `Sidebar.tsx`. It populates with all registered tenants. Selecting a tenant immediately applies the global state and re-fetches the dashboard. Selecting "Platform View" switches back to the global overview.
- **Global Dashboard**: The `/dashboard` route now conditionally mounts `<GlobalDashboard />`. It aggregates metrics like *Total Patients (Global)*, *Active Clinics (All Tenants)*, and provides a platform-wide system health view.
- **Tenant Registry**: A new `/tenants` route provides a birds-eye view of all organizations registered on the platform, their active status, and high-level engagement metrics (users, patients, areas).

## 5. Security Validation

- **Bypass Validation:** If a non-Super Admin (e.g., `CLINIC_ADMIN`) manually modifies their local storage to inject `activeTenantId="ALL"` and sends the `x-tenant-id` header via a script, the `requireTenant` backend middleware explicitly ignores the header and overwrites `req.tenantId` with their JWT token's `tenantId`, guaranteeing isolation.
- **Role Scoping:** Even when a `SUPER_ADMIN` acts within a tenant, they continue to bypass clinical restrictions (e.g., they can view patients unassigned to them) via the `getRoleScope` escape hatch.

## 6. Files Modified & Created

### Backend
- `api-server/src/middlewares/tenantScope.ts` (Modified: Header interceptor logic)
- `api-server/src/routes/reports.ts` (Modified: Dropped `!` assertion on `req.tenantId`)
- `api-server/src/routes/auditLogs.ts` (Modified: Added conditional global querying and `Tenant` inclusion)
- `api-server/src/routes/patients.ts` (Modified: Adapted `where` clause for global scope)

### Frontend
- `lib/api-client-react/src/custom-fetch.ts` (Modified: Header interceptor)
- `lib/api-client-react/src/index.ts` & `web/src/lib/api.ts` (Modified: Exports)
- `web/src/contexts/TenantContext.tsx` (New: Global State)
- `web/src/App.tsx` (Modified: Provider Wrap & Routes)
- `web/src/components/layout/Sidebar.tsx` (Modified: Switcher Injection)
- `web/src/components/layout/TenantSwitcher.tsx` (New: Switcher UI)
- `web/src/pages/dashboard/GlobalDashboard.tsx` (New: Global Metrics UI)
- `web/src/pages/tenants/index.tsx` (New: Tenant Registry UI)
- `web/src/pages/dashboard.tsx` (Modified: Conditional Routing)

The platform is now architecturally aligned with modern multi-tenant enterprise SaaS requirements.
