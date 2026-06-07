# DUAL DATABASE SYNCHRONIZATION — PHASE 1 ANALYSIS REPORT

## 1. Current Architecture
Based on a thorough investigation of the `artifacts/api-server` directory, the backend follows this architecture:

*   **Framework:** Node.js with Express 5 (TypeScript)
*   **Language:** TypeScript
*   **ORM:** Prisma Client
*   **Repository Pattern:** No dedicated repository classes exist. Data access logic is tightly coupled within route handlers (e.g., `artifacts/api-server/src/routes/patients.ts`).
*   **Service Pattern:** No dedicated service layer exists. Business logic resides in the Express route handlers.
*   **Controllers:** Route handlers act as controllers.
*   **Middleware:** Strong middleware layer handles `authenticate` (JWT), `requireTenant`, `CLINICAL_ROLES/ADMIN_ROLES` (RBAC), and `validateBody` (Zod validation).
*   **Validation Layer:** Zod schemas are defined directly within route files (e.g., `PatientSchema` inside `patients.ts`) and utilized via the `validateBody` middleware.

**Current Architecture Flow:**
`Frontend -> Express Router (Middleware: Auth, Tenant, RBAC, Zod) -> Inline Route Logic -> Prisma Client -> Neon PostgreSQL`

---

## 2. Patient Creation Flow Analysis
The execution path for creating a patient is currently strictly linear and targets a single database:

1.  **Frontend:** Submits a POST request with patient data.
2.  **API Route:** Request hits `POST /` in `artifacts/api-server/src/routes/patients.ts` (Lines 145-169).
3.  **Middleware Execution:**
    *   `authenticate`, `requireTenant` (from router setup)
    *   `ADMIN_ROLES` (RBAC check)
    *   `validateBody(PatientSchema)` (Zod schema validation)
4.  **Controller/Service/Repository Logic (Inline):**
    *   Destructures `gpDetails` and `referral` from `req.body`.
    *   Checks for an existing patient by `tenantId` and `nhsNumber` via `prisma.patient.findUnique`.
    *   If no duplicate is found, calls `prisma.patient.create`.
5.  **ORM:** Prisma translates this into a PostgreSQL `INSERT` command.
6.  **Database:** Data is persisted in Neon PostgreSQL.
7.  **Audit:** Calls `createAuditLog` to append an audit event.
8.  **Response:** Sends a `201 Created` status with the new patient JSON.

**Exact Files Involved:**
*   `artifacts/api-server/src/routes/patients.ts` (Patient logic)
*   `artifacts/api-server/src/middlewares/` (Auth, validation, tenant scoping)
*   `artifacts/api-server/src/lib/prisma.ts` (Database client initialization)
*   `artifacts/api-server/prisma/schema.prisma` (Database schema & connection details)

---

## 3. Database Investigation

*   **PostgreSQL Configuration:** Defined in `artifacts/api-server/prisma/schema.prisma` with `provider = "postgresql"`.
*   **Neon Connection Settings:** Sourced from the `DATABASE_URL` environment variable dynamically injected at runtime.
*   **MySQL Configuration:** **Missing entirely.** There is no configuration, client library (e.g., `mysql2`), or ORM instance configured to connect to MySQL.
*   **Connection Pools:** Handled inherently by Prisma Client's internal connection pooling mechanism for PostgreSQL.
*   **Environment Variables:** Found `.env` containing `DATABASE_URL` for PostgreSQL, but no `MYSQL_URL` or equivalent.
*   **Migration Files:** Prisma handles migrations implicitly or explicitly via `pnpm db:push` to the connected PostgreSQL instance.
*   **Schema Definitions:** A robust 588-line `schema.prisma` defines the PostgreSQL schema perfectly, including the `Patient` model.

---

## 4. Root Cause Analysis

**Why does patient data reach PostgreSQL but not MySQL?**

The root cause is structural: **The application is configured exclusively as a single-database system.**

1.  **Missing MySQL Connection:** There is no code in the application attempting to connect to a MySQL server. `artifacts/api-server/src/lib/prisma.ts` initializes exactly one Prisma instance hooked to PostgreSQL.
2.  **Missing MySQL ORM Configuration:** Prisma only supports a single database provider per schema file. The current `schema.prisma` is hardcoded to `postgresql`.
3.  **Missing Synchronization Logic:** The route handler (`patients.ts`) awaits a single database `create` command and immediately returns a 201 response. There is no background job, event emitter, or secondary synchronous write block implemented to broadcast the data to a secondary database.

**Proof:**
Line 6 of `schema.prisma` clearly states `provider = "postgresql"`. Line 155 of `patients.ts` executes `const patient = await prisma.patient.create({...})` and then proceeds directly to auditing and responding, with no secondary database interactions taking place.

---

## 5. Risk Assessment (Dual-Write Implementation)

Introducing a dual-database synchronization layer carries several architectural risks:

1.  **Partial Writes (Split-Brain):** A scenario where PostgreSQL succeeds but MySQL fails (or vice versa), leading to data inconsistencies.
2.  **Transaction Inconsistencies:** Across two separate databases without a distributed transaction coordinator (Two-Phase Commit), achieving true atomicity is extremely difficult. If the MySQL write fails, rolling back the committed PostgreSQL transaction requires a manual compensating transaction (which itself could fail).
3.  **Concurrency Issues:** Rapid subsequent updates to the same record might arrive out-of-order in the secondary database if syncs are queued asynchronously.
4.  **Schema Mismatch:** Prisma handles PostgreSQL schema evolution natively. The MySQL schema must be maintained in perfect parity manually or via a separate parallel Prisma schema/engine. Differences in data types (e.g., handling of JSON, Enums, UUIDs) can break sync mechanisms.
5.  **Performance Degradation:** Synchronous dual-writes double the database latency for the end-user. Asynchronous dual-writes require complex queueing and retry mechanisms (e.g., BullMQ, Kafka).

---

## Conclusion & Next Steps
The Phase 1 Investigation is complete. The system is structurally sound for PostgreSQL but requires a significant architectural refactor (introducing distinct Repository and Service layers, plus a dedicated Connection Manager for MySQL) to achieve the Target Outcome safely.

**Awaiting approval of this analysis to proceed to Phase 2 (Schema Validation & Comparison).**
