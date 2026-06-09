# Tenant Isolation Validation & Invariants

## 1. Core Invariants & Security Guarantees

To ensure absolute multi-tenant isolation within the SaaS platform, the following invariants must hold true under all conditions, irrespective of UI bugs or direct API manipulation:

1. **Implicit Scoping:** The `tenantId` must never be trusted from client payload arrays or query parameters for standard users. It must be derived exclusively from the server-side verified JWT/Session context.
2. **Horizontal Siloing:** A query executed by a `CLINIC_ADMIN` must fundamentally append `WHERE tenantId = currentUser.tenantId` to the Prisma invocation.
3. **Foreign Key Integrity Verification:** The backend must proactively verify that referenced entities (e.g., `areaId`, `clinicId`) in write operations inherently belong to the active `tenantId`. Relying solely on foreign key constraints is insufficient for user feedback; manual validation prevents malicious ID swapping.
4. **Super Admin Transparency:** The `SUPER_ADMIN` role inherently bypasses implicit `tenantId` injection, but relies on explicit filtering capabilities. However, all cascading logic (e.g., fetching clinics for a selected area) must still obey relational joins to prevent showing an area from Tenant A alongside a clinic from Tenant B.

## 2. Validation Test Cases

### Test 1 – Legacy Tenant Administrator Isolation (e.g., Apollo)
* **Pre-condition:** User logs in with role `CLINIC_ADMIN` belonging to Tenant A.
* **Execution:** Navigates to Patient Registration.
* **Expected Result:** The API call to `/api/areas` returns a 200 OK containing only Areas where `tenantId === Tenant A's ID`. 
* **Backend Security Check:** If the user intercepts the HTTP request and modifies `GET /api/clinics?areaId={Tenant_B_Area_ID}`, the backend query `where: { tenantId: req.tenantId, areaId: req.query.areaId }` will yield an empty array (`[]`), successfully isolating the tenant.
* **Write Security Check:** New patients created will have `tenantId` forcefully overwritten on the server side to Tenant A's ID, regardless of JSON body contents.

### Test 2 – Sister Tenant Administrator Isolation (e.g., Fortis)
* **Pre-condition:** User logs in with role `CLINIC_ADMIN` belonging to Tenant B.
* **Execution:** Navigates to Patient Registration.
* **Expected Result:** The UI renders only Tenant B's Areas and Clinics. No data overlaps with Tenant A. The caching layer (React Query) keys must be invalidated or scoped correctly by `tenantId` to prevent session crossover on shared devices.

### Test 3 – New Tenant Onboarding (e.g., XYZ Hospital)
* **Pre-condition:** `SUPER_ADMIN` provisions a new Tenant C via the dashboard, adding corresponding Areas and Clinics.
* **Execution:** A newly created `CLINIC_ADMIN` for Tenant C logs in.
* **Expected Result:** The platform dynamically renders Tenant C's Areas in the dropdown without requiring application restarts, config file changes, or deployment rollouts. The platform's UI is entirely data-driven.

### Test 4 – Cross-Tenant Injection Attempt
* **Pre-condition:** A malicious `CLINIC_ADMIN` belonging to Tenant A acquires a valid `clinicId` belonging to Tenant B.
* **Execution:** The user fires a raw POST request to `/api/patients` with `clinicId` set to Tenant B's clinic.
* **Backend Validation:**
```typescript
const validClinic = await prisma.clinic.findFirst({
  where: { 
    id: req.body.clinicId, 
    tenantId: req.tenantId // The shield: validates ownership
  }
});

if (!validClinic) throw new UnauthorizedError("Cross-tenant violation");
```
* **Expected Result:** The backend throws a 403 Forbidden. The patient is not created.

## 3. Performance & Indexing Validation

* **Tenant High-Cardinality:** Because every `where` clause relies on `tenantId`, all primary operational tables (`patients`, `areas`, `clinics`) MUST have an index on `tenantId`. 
  * *Verification:* Check `schema.prisma` for `@@index([tenantId])`.
* **Area-Clinic Fetching:** Clinic queries often filter by both `tenantId` and `areaId`. A composite index on `@@index([tenantId, areaId])` can be utilized for extreme scale, but singular indexes on both fields generally satisfy query planners in PostgreSQL.
* **Pagination Constraints:** The backend must implement a strict ceiling `take: 1000` (or similar pagination) on `findMany` queries for dropdowns. This prevents a hypothetical scenario where a massive tenant causes an out-of-memory exception or browser UI freeze when fetching their master list of clinics.
