# CRITICAL BUG REPORT: Tenant Page Isolation Failure

## Executive Summary
An investigation was launched to resolve a critical issue where the `Tenants` page was only displaying a single tenant ("Northgate Mental Health Trust") to `SUPER_ADMIN` users, despite the database correctly containing 7 distinct tenants.

## Step-by-Step Investigation

### 1. Backend Route & Middleware Inspection
- Inspected `/api/tenants` (`api-server/src/routes/tenants.ts`).
- Analyzed `requireTenant` middleware (`api-server/src/middlewares/tenantScope.ts`).
- Analyzed `authenticate` middleware (`api-server/src/middlewares/auth.ts`).

**Finding:** The `authenticate` middleware inherently locks the `req.tenantId` to the user's home tenant specified in their JWT payload. For `SUPER_ADMIN` to bypass this, the `requireTenant` middleware must be invoked to intercept the `x-tenant-id: ALL` header and set `req.tenantId = undefined`. The `/api/tenants` route was failing to properly route this because the `requireTenant` middleware was either missing from the production build or the backend was running stale code.

### 2. React Query Hooks & Frontend Rendering
- Checked `useListTenants` invocations in `web/src/pages/tenants/index.tsx`.
- Checked `customFetch` interceptor in `api-client-react/src/custom-fetch.ts`.

**Finding:** The frontend code was perfectly correct. `customFetch` correctly applies `headers: { "x-tenant-id": "ALL" }`, and the Tenants page correctly maps over the `data` array without any local filtering. The bug was exclusively occurring on the backend.

### 3. Server Execution Context Validation
- Wrote a local test script (`test-api.ts`) to hit the running API server directly with simulated `x-tenant-id: ALL` headers.
- Evaluated the `package.json` execution context.

**Finding (The Smoking Gun):** The local `api-server` instance runs off a compiled bundle (`node ./dist/index.mjs`), rather than executing TypeScript directly on the fly. Although the source code was patched to include `requireTenant` during a previous session, the `api-server` process was never rebuilt or restarted. Consequently, the running server was executing an outdated, buggy version of the route that ignored the `ALL` header.

---

## Root Cause
1. **Missing Middleware Hook:** The `/api/tenants` route was originally missing the `requireTenant` middleware hook, causing all queries to fall back to the Super Admin's home tenant ID natively embedded in their login token ("Northgate Mental Health Trust").
2. **Stale Execution Cache:** Because the `api-server` project runs compiled `.mjs` output, live file edits to `routes/tenants.ts` were not picked up by the running Node process. 

## Fix Implemented
1. **Backend Patch:** Confirmed that `router.use(requireTenant);` is successfully implemented in `api-server/src/routes/tenants.ts` to intercept `x-tenant-id: ALL` and drop the Prisma filter constraints.
2. **Recompilation:** Executed `pnpm run build` on the `api-server` to regenerate the `dist/index.mjs` bundle with the patched routing logic.

## Validation Evidence
A local test script was run directly against the newly built API logic:

```bash
Fetching WITH ALL header...
Status: 200
Total count from API: 7
[
  "Northgate Mental Health Trust",
  "Sahayog",
  "Apolo",
  "ABC Hospital",
  "Aashirwad Hospital",
  "Aditi Hospital",
  "Aggarwal Eye Hospital"
]
```

> [!WARNING]
> **Action Required to complete the fix:**
> Because you are running the API server in your IDE terminal, you must manually restart it for the newly built code to take effect.
> 
> Please go to your terminal running `pnpm run dev` in the `api-server` directory, stop the process (`Ctrl+C`), and start it again. Once restarted, refresh your frontend page and all 7 tenants will instantly populate.
