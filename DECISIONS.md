# DECISIONS.md — Caremesh PMS Architectural Decisions

_Last updated: 2026-06-06_

Each decision records: the context, the options considered, the choice made, and the rationale. Read this file before changing any of these decisions. Decisions are stable unless explicitly superseded.

---

## D001 — Auth: Custom JWT, Not a Managed Auth Provider

**Context:** A managed auth provider (Clerk, Auth0) was considered but the project uses standard Express + Prisma without a managed tenant model. NHS healthcare data must stay within defined boundaries, and credential overhead with managed providers adds complexity at this stage.

**Decision:** Custom JWT auth — `bcrypt` for password hashing, two-token scheme (short-lived access + long-lived refresh), refresh tokens stored in the `refresh_tokens` table for revocation.

**Details:**
- Access token: 8 h, signed with `JWT_SECRET`, payload: `{ userId, tenantId, email, role }`.
- Refresh token: 30 d, signed with `JWT_REFRESH_SECRET`, one-time use (rotated and revoked on every refresh call).
- `RefreshToken` table enables server-side revocation (logout, forced sign-out, security incidents).

**Consequences:**
- Passwords ARE stored in the application database (bcrypt, cost 12). Must never be logged.
- Adding MFA requires a custom implementation.
- If `JWT_SECRET` is rotated, all active sessions are invalidated. Coordinate deployments.

---

## D002 — Multi-Tenancy: Shared Database, Row-Level Tenant Isolation

**Context:** The platform serves multiple independent NHS trusts. Patient data must never cross organisational boundaries.

**Decision:** Shared PostgreSQL database. Every tenant-scoped table has a `tenantId UUID` column. All queries must include `WHERE tenantId = $tenantId`.

**Enforcement layers:**
1. `requireTenant` middleware: ensures `req.tenantId` is set before the handler runs.
2. `assertTenantMatch(req, record.tenantId)`: throws 403 if a fetched record's `tenantId` doesn't match the caller's.
3. All Prisma `findFirst` / `findMany` calls include `tenantId: req.tenantId!` in `where`.

**Why not database-per-tenant:** Adds major operational overhead (N migration runs, N connection pools). Not justified at this scale.

**Future:** PostgreSQL Row-Level Security (RLS) can be added as a defence-in-depth layer. Policy: `USING (tenant_id = current_setting('app.tenant_id')::uuid)`.

---

## D003 — ORM: Prisma (Primary), Drizzle (Legacy Scaffold Only)

**Context:** The monorepo scaffold included a `lib/db` package using Drizzle ORM. The API server uses Prisma.

**Decision:** Prisma is the primary ORM for the API server. The `lib/db` Drizzle package is retained from the scaffold but is **not used** by the API server.

**Why Prisma for the API server:**
- Schema-as-code with a clear migration path (`prisma migrate dev` / `prisma migrate deploy`).
- Type-safe query builder with excellent relation traversal.
- `prisma db push` for rapid schema iteration in development.

**Source of truth:** `artifacts/api-server/prisma/schema.prisma`. Do not edit the Drizzle schema in `lib/db` expecting it to affect the running database.

---

## D004 — API Design: OpenAPI-First with Orval Codegen

**Decision:** All API contracts are defined in `lib/api-spec/openapi.yaml` BEFORE implementation. Orval generates:
- `lib/api-client-react/src/generated/` — React Query hooks for the frontend.
- `lib/api-zod/src/generated/` — Zod validation schemas for the server.

**Rules:**
1. Every API change starts in `openapi.yaml`.
2. Re-run codegen after every spec change: `pnpm --filter @workspace/api-spec run codegen`.
3. Never manually edit generated files in `lib/api-client-react/src/generated/` or `lib/api-zod/src/generated/`.
4. Frontend never calls `fetch()` directly — always use generated hooks.
5. Server input validation uses the generated Zod schemas via the `validateBody()` middleware.

**Why:** Contract-first prevents frontend/backend drift. Generated types eliminate a whole class of integration bugs.

---

## D005 — API Response Shape: Unwrapped (No `{ data: T }` Wrapper)

**Context:** An early implementation wrapped all API responses in `{ data: T }`. The OpenAPI spec (and therefore all generated hooks) expected the resource directly at the top level. This caused silent deserialization failures throughout the frontend.

**Decision:** All API responses return the resource directly. Lists return `{ data: T[], total: number, page: number, pageSize: number }`. Single resources return the object itself.

**Rule:** The `ok()` helper in `artifacts/api-server/src/types/index.ts` still exists in the codebase but is **not imported anywhere**. Do not use it. If you need to add a new route, return the Prisma result directly: `res.json(record)`.

---

## D006 — Soft Delete: `deletedAt DateTime?`, Not `isDeleted Boolean`

**Decision:** All core entities use `deletedAt DateTime? @default(null)`. A non-null value means soft-deleted.

**Why:**
- Records the timestamp of deletion (required for NHS DSPT audit trail).
- `partial index WHERE deleted_at IS NULL` is efficient for active-record queries.
- Type-safe in TypeScript (`Date | null`) vs a boolean that gives no time information.

**Pattern:** All `findMany` queries include `deletedAt: null` in `where`. All `findFirst` (by ID) queries also include `deletedAt: null`. Hard deletion is never performed.

**Gotcha with unique constraints:** Constraints like `@@unique([tenantId, nhsNumber])` apply even to soft-deleted rows. If re-activating a soft-deleted patient with the same NHS number, update the existing row's `deletedAt = null` rather than inserting a new row.

---

## D007 — Patient Status Enums: Uppercase Prisma Values

**Decision:** All Prisma enums use SCREAMING_SNAKE_CASE: `PatientStatus.ACTIVE`, `PatientStatus.INACTIVE`, `JourneyStatus.MEDICATION_REQUIRED`, etc.

**Why:** Prisma's default TypeScript type generation uses the exact string values. Using uppercase keeps them unambiguous in TypeScript switches and avoids case-conversion bugs.

**Known bug (unfixed):** Several frontend badge components compare against titlecase strings like `'Active'`. These must be updated to `'ACTIVE'`. See BUG-002 in TASKS.md.

---

## D008 — Patient Journey: Event Log, Not Mutable Status Field

**Context:** The legacy system stored patient status as a single mutable enum column. History was lost on every update.

**Decision:** Patient journey is an append-only event log in `patient_journey_events`. Each row = one status transition, recording: new status, actor (userId), notes, and timestamp.

**Current status derivation:** `SELECT * FROM patient_journey_events WHERE patient_id = $id ORDER BY created_at DESC LIMIT 1`

**Why:** Healthcare systems require a complete, immutable audit trail of clinical state transitions for regulatory compliance (NHS DSPT).

**Consequence:** There is no `currentStatus` column on the `patients` table. The current status must always be derived from the event log. Consider a materialized column or view for performance if event volumes grow large.

---

## D009 — Audit Log: Append-Only, Before/After JSON Snapshots

**Decision:** Every CREATE/UPDATE/DELETE in any route handler calls `createAuditLog({ req, entityType, entityId, action, before?, after? })`. The `before` and `after` values are stored as `Json` in `audit_logs.beforeValue` / `audit_logs.afterValue`.

**Rule:** Never delete rows from the `audit_logs` table. It is an immutable compliance record.

**Implementation:** `artifacts/api-server/src/lib/audit.ts`. The helper reads `req.user.userId`, `req.tenantId`, `req.ip`, and `req.headers['user-agent']` automatically.

---

## D010 — Express 5 `req.params` Type: Always Cast to `string`

**Context:** Express 5 types `req.params` values as `string | string[]` (unlike Express 4 which typed them as `string`). Prisma `where` clauses expect `string`.

**Decision:** Always cast route parameters: `req.params["id"] as string`.

**Pattern:**
```ts
// ✅ Correct
const record = await prisma.patient.findFirst({
  where: { id: req.params["id"] as string, tenantId: req.tenantId! },
});

// ❌ Wrong — TS error in Express 5
const record = await prisma.patient.findFirst({
  where: { id: req.params["id"], tenantId: req.tenantId! },
});
```

---

## D011 — Logging: Pino, Never `console.log` in Server Code

**Decision:** Server-side logging uses the `pino` logger singleton (`artifacts/api-server/src/lib/logger.ts`). In route handlers, use `req.log` (request-scoped child logger). In non-request code (startup, migrations), use the `logger` singleton.

**Rule:** `console.log` / `console.error` are banned in server code. The pino HTTP middleware on `app.ts` logs every request/response automatically — do not add duplicate logging.

---

## D012 — Area → Clinic Hierarchy Is Tenant-Scoped

**Context:** The legacy schema had `areaId` and `clinicId` as orphan FK references with no real `areas` or `clinics` tables.

**Decision:** `areas` and `clinics` are first-class tables. Clinics belong to exactly one Area. Areas belong to exactly one Tenant. This creates the hierarchy: `Tenant → Area → Clinic → Patient`.

**Consequence:** When creating a Clinic, `areaId` is required. When assigning a patient or doctor, both `areaId` and `clinicId` must be supplied and must be consistent (the clinic must belong to the area).
