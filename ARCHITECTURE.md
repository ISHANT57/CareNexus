# ARCHITECTURE.md — Caremesh PMS

_Last updated: 2026-06-06_

---

## Overview

Caremesh PMS is a monorepo pnpm workspace. Traffic is routed through a shared reverse proxy: `GET /` → web frontend, `GET /api/*` → API server.

```
Browser
  │
  ▼
Replit Reverse Proxy (localhost:80)
  ├── /          → artifacts/web   (Vite dev server)
  └── /api       → artifacts/api-server  (Express 5, port 5000)
                       │
                       ▼
                  PostgreSQL (Replit managed)
                       │
                  Prisma ORM (artifacts/api-server/prisma/schema.prisma)
```

---

## Monorepo Structure

```
workspace/
├── artifacts/
│   ├── api-server/          @workspace/api-server
│   │   ├── prisma/
│   │   │   └── schema.prisma        ← SOURCE OF TRUTH for DB schema
│   │   ├── src/
│   │   │   ├── app.ts               ← Express app factory
│   │   │   ├── server.ts            ← HTTP server entry point
│   │   │   ├── routes/              ← One file per resource
│   │   │   │   ├── index.ts         ← Route mounts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── tenants.ts
│   │   │   │   ├── areas.ts
│   │   │   │   ├── clinics.ts
│   │   │   │   ├── roles.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── programs.ts
│   │   │   │   ├── patients.ts
│   │   │   │   ├── assignments.ts
│   │   │   │   ├── communications.ts
│   │   │   │   ├── notifications.ts
│   │   │   │   ├── auditLogs.ts
│   │   │   │   ├── reports.ts
│   │   │   │   └── health.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.ts          ← JWT authenticate + optionalAuth
│   │   │   │   ├── rbac.ts          ← authorize(), ADMIN_ROLES, CLINICAL_ROLES, etc.
│   │   │   │   ├── tenant.ts        ← requireTenant, assertTenantMatch
│   │   │   │   └── validate.ts      ← validateBody(ZodSchema)
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts        ← Prisma client singleton
│   │   │   │   ├── jwt.ts           ← sign/verify access + refresh tokens
│   │   │   │   ├── errors.ts        ← AppError factory (notFound, unauthorized, etc.)
│   │   │   │   ├── audit.ts         ← createAuditLog() helper
│   │   │   │   └── logger.ts        ← pino logger singleton
│   │   │   └── types/
│   │   │       └── index.ts         ← JwtPayload, Role, Express req augment
│   │   └── dist/                    ← esbuild CJS bundle (built output)
│   │
│   ├── web/                 @workspace/web
│   │   └── src/
│   │       ├── App.tsx              ← Wouter router, QueryClient, TooltipProvider
│   │       ├── main.tsx             ← React root mount
│   │       ├── components/
│   │       │   ├── auth/
│   │       │   │   └── AuthGuard.tsx     ← Checks /me, redirects to /login
│   │       │   ├── layout/
│   │       │   │   ├── AppLayout.tsx    ← Sidebar + content wrapper
│   │       │   │   └── Sidebar.tsx      ← Nav links, tenant name, user menu
│   │       │   └── ui/                  ← shadcn/ui components
│   │       ├── pages/               ← One file per route
│   │       └── hooks/
│   │           └── use-mobile.tsx
│   │
│   └── mockup-sandbox/      @workspace/mockup-sandbox  (Vite canvas preview server)
│
├── lib/
│   ├── api-spec/            @workspace/api-spec
│   │   └── openapi.yaml             ← SOURCE OF TRUTH for API contract
│   ├── api-client-react/    @workspace/api-client-react
│   │   └── src/generated/           ← Orval-generated React Query hooks
│   ├── api-zod/             @workspace/api-zod
│   │   └── src/generated/           ← Orval-generated Zod schemas
│   └── db/                  @workspace/db
│       └── src/                     ← Drizzle schema (legacy; Prisma is primary)
│
├── scripts/                 @workspace/scripts
│   └── src/                         ← Seed scripts, migration utilities
│
├── pnpm-workspace.yaml              ← Workspace package discovery + catalog pins
├── tsconfig.base.json               ← Shared strict TS defaults
├── tsconfig.json                    ← Solution file (libs only)
└── package.json                     ← Root task orchestration
```

---

## Frontend Architecture

**Stack:** React 18 + Vite + Tailwind CSS + shadcn/ui

**Routing:** Wouter (lightweight client-side router). Base path injected via `import.meta.env.BASE_URL`.

**Data fetching:** TanStack React Query (`@tanstack/react-query`). All API calls use generated hooks from `@workspace/api-client-react`. Never call `fetch()` directly.

**Auth flow:**
1. `/login` POST → stores `accessToken` + `refreshToken` in `localStorage`.
2. `AuthGuard` calls `useGetMe()` — if it returns 401, redirects to `/login`.
3. Generated API client reads `accessToken` from `localStorage` for every request (via Orval's custom `axios` instance or fetch interceptor).
4. `POST /api/auth/refresh` on 401 with the stored `refreshToken` → rotates both tokens.

**Sidebar:** Reads `user.tenantName` and `user.role` from the `/me` response to show tenant branding and role-aware nav links.

---

## Backend Architecture

**Stack:** Node.js 24 + Express 5 + Prisma + PostgreSQL

**Request lifecycle:**
```
Request
  → pino HTTP logger (morgan-style)
  → Express router (all routes under /api)
  → authenticate middleware (JWT verify → attaches req.user, req.tenantId)
  → requireTenant middleware (ensures req.tenantId is set)
  → authorize(...roles) RBAC middleware
  → validateBody(ZodSchema) input validation
  → Route handler (Prisma query)
  → JSON response (unwrapped — no wrapper object)
  → Error handler (AppError → structured JSON)
```

**Multi-tenancy:** Every tenant-scoped Prisma query MUST include `tenantId: req.tenantId!` in the `where` clause. A secondary `assertTenantMatch(req, record.tenantId)` call verifies fetched records belong to the caller's tenant. Never skip this — it is the only data isolation boundary.

**Auth tokens:**
- Access token: JWT, signed with `JWT_SECRET`, 8 h expiry. Contains `{ userId, tenantId, email, role }`.
- Refresh token: JWT, signed with `JWT_REFRESH_SECRET`, 30 d expiry. Stored in `refresh_tokens` table. Rotated on every use (one-time use). Old token is soft-revoked (`revokedAt`).

**RBAC roles (ordered by privilege):**

| Role | Scope |
|---|---|
| `SUPER_ADMIN` | Platform-wide. Bypasses role checks. Does NOT bypass tenant isolation. |
| `AREA_ADMIN` | Full write within tenant |
| `CLINIC_ADMIN` | Full write within assigned clinics |
| `DOCTOR` | Read/write patients within assigned clinics |
| `OPERATOR` | Read/write communications, bulk import |
| `STAFF` | Read-only |

**Middleware groups used in routes:**
```ts
SUPER_ADMIN_ONLY   // authorize("SUPER_ADMIN")
ADMIN_ROLES        // authorize("SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN")
CLINICAL_ROLES     // authorize("SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN", "DOCTOR")
ALL_STAFF          // all roles
```

**Audit logging:** Every CREATE / UPDATE / DELETE in any route calls `createAuditLog({ req, entityType, entityId, action, before?, after? })`. This writes to the append-only `audit_logs` table. Never delete rows from this table.

**Error handling:**
```ts
Errors.notFound("Area")        // 404
Errors.unauthorized()          // 401
Errors.forbidden()             // 403
Errors.conflict("Email")       // 409
Errors.validation("message")   // 422
Errors.internal()              // 500
```
All errors are instances of `AppError` caught by the global error handler which serialises them as `{ error: { code, message } }`.

---

## Code Generation Pipeline

```
lib/api-spec/openapi.yaml
        │
        ▼  pnpm --filter @workspace/api-spec run codegen
        │
        ├── lib/api-client-react/src/generated/
        │       caremesh-pms.ts    ← React Query hooks (useGetPatients, usePostAuthLogin, etc.)
        │
        └── lib/api-zod/src/generated/
                caremesh-pms.ts    ← Zod schemas matching every OpenAPI schema
```

**Rule:** Never manually edit generated files. All API changes start in `openapi.yaml`, then codegen is re-run.

---

## Database Layer

**ORM:** Prisma (primary). The legacy `lib/db` package uses Drizzle — it is carried over from the monorepo scaffold but is NOT used by the API server.

**Migrations (dev):** `pnpm --filter @workspace/api-server run db:push` (`prisma db push`). No migration history files — schema is authoritative.

**Migrations (production):** Run `prisma migrate deploy` against the production `DATABASE_URL`. Migration files should be generated with `prisma migrate dev --name <description>` before deploying.

**Soft delete convention:** All core entities have `deletedAt DateTime?`. Active records: `WHERE deletedAt IS NULL`. Deleted records are never hard-deleted from the DB — required for audit trail.

**Unique constraints with soft delete:** Unique constraints (e.g. `[tenantId, nhsNumber]`) include soft-deleted records. If re-creating a soft-deleted record, update `deletedAt = NULL` rather than inserting a new row.

---

## Proxy & Port Routing

| Artifact | Internal port | Proxy path |
|---|---|---|
| `artifacts/api-server` | 5000 | `/api` |
| `artifacts/web` | `$PORT` (assigned by workflow) | `/` |
| `artifacts/mockup-sandbox` | `$PORT` (assigned by workflow) | `/mockup-sandbox` |

Paths are NOT rewritten. The API server handles its full `/api/...` path itself.

For local curl testing: always use `localhost:80/api/...` (through the proxy), never `localhost:5000/api/...` directly.
