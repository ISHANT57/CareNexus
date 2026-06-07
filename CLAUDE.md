# CLAUDE.md — AI Agent Working Context
## Project: Caremesh PMS

This file is the authoritative context document for any AI agent working on this codebase. Read it fully before taking any action.

---

## What This Project Is

**Caremesh PMS** is a modern, multi-tenant, cloud-native Healthcare Patient Management System (SaaS) being built as a ground-up rewrite of a legacy MySQL monolith (`pms2`). The legacy system was originally built on a fitness platform (GOQii) and repurposed for NHS-affiliated healthcare organizations in the UK. The new system discards the fitness/social baggage and focuses entirely on clinical patient management.

---

## Non-Negotiable Rules for Every Agent

1. **No legacy table names.** Never use `goqii_*` prefixes. The new schema uses clean, descriptive names.
2. **No god tables.** The `goqii_user` table has 100+ columns. The new design splits patient data into focused entities.
3. **No enum('Y','N') booleans.** Use proper `boolean` columns.
4. **No `isDeleted` flags without proper soft-delete patterns.** Use `deleted_at TIMESTAMPTZ` with indexed partial queries.
5. **Tenant isolation is mandatory.** Every query that touches tenant-scoped data MUST filter by `tenant_id`. Never expose cross-tenant data.
6. **No plain-text passwords.** Authentication is handled via Clerk (see `DECISIONS.md`). Never store passwords in the application database.
7. **No `rawJson` / `rawData` blobs as primary storage.** Use structured columns. JSON columns are allowed only for extensible metadata fields.
8. **Audit trail on all writes.** Every table that stores healthcare data must have `created_at`, `updated_at`, `created_by`, and `updated_by`.
9. **Always run codegen after OpenAPI changes.** `pnpm --filter @workspace/api-spec run codegen`
10. **No direct port calls.** All curl/HTTP requests go through `localhost:80`.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24, TypeScript 5.9 |
| API | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4 + drizzle-zod |
| Auth | Clerk (multi-tenant, organization-scoped) |
| API Contract | OpenAPI 3.1 → Orval codegen |
| Build | esbuild (CJS bundle) |
| Package Manager | pnpm workspaces |

---

## Repository Layout

```
artifacts/api-server/        — Express API server
lib/api-spec/openapi.yaml    — Source of truth for all API contracts
lib/api-client-react/        — Generated React Query hooks (DO NOT EDIT)
lib/api-zod/                 — Generated Zod schemas (DO NOT EDIT)
lib/db/src/schema/           — Drizzle ORM schema (source of truth for DB)
docs/                        — Architecture and planning documents
```

---

## Domain Glossary

| Term | Definition |
|---|---|
| Tenant | A healthcare organization (e.g. an NHS trust, ICB, or private clinic group) |
| Area | A geographic or administrative subdivision within a tenant |
| Clinic | A physical or virtual care location within an area |
| Program | A defined healthcare intervention (e.g. MSK, Diabetes Prevention) |
| PMS User / Staff | A member of staff: doctor, admin, operator, coordinator |
| Patient | An individual enrolled in a program at a clinic |
| Journey | The lifecycle of a patient through a program (New → Active → Discharged) |
| NHS Number | The unique patient identifier in the UK National Health Service |
| ICB | Integrated Care Board — the NHS commissioning body |
| GP | General Practitioner — the patient's primary care physician |
| RTC | Referral-to-treatment channel |
| CAMHS | Child and Adolescent Mental Health Services |
| PSI | Psychological/clinical intervention milestone in the patient journey |

---

## Key Files to Read Before Working

- `ARCHITECTURE.md` — system design, ER diagram, data model
- `DECISIONS.md` — architectural decisions and rationale
- `API_CONTRACTS.md` — all API endpoint definitions
- `TASKS.md` — current work queue
- `PROJECT_STATUS.md` — build progress tracker
- `lib/db/src/schema/` — definitive DB schema
- `lib/api-spec/openapi.yaml` — definitive API contract

---

## Commands

```bash
pnpm --filter @workspace/api-server run dev     # Start API server
pnpm run typecheck                               # Full typecheck
pnpm --filter @workspace/api-spec run codegen   # Regenerate hooks + Zod schemas
pnpm --filter @workspace/db run push            # Push DB schema changes (dev only)
pnpm run build                                  # Typecheck + build all packages
```
