# OPENAPI GAP ANALYSIS REPORT

**Date:** 2026-06-09  
**Status:** COMPLETE — 4 feature areas missing from OpenAPI

---

## Executive Summary

The backend has **6 fully implemented route modules** that are completely absent from `openapi.yaml` and therefore not available as generated React Query hooks in `@workspace/api-client-react`.

---

## Gap 1: Outcomes Module (`/api/outcomes`)

**Backend file:** `artifacts/api-server/src/routes/outcomes.ts`  
**Status:** ✅ Fully implemented, tested, production-ready

### Missing Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/outcomes` | List outcomes (filter by patientId, programId, outcomeMetricId) |
| `GET` | `/outcomes/:id` | Get single outcome |
| `POST` | `/outcomes` | Record new outcome |
| `PATCH` | `/outcomes/:id` | Update outcome values |
| `DELETE` | `/outcomes/:id` | Soft-delete outcome |

### Missing Schemas
- `PatientOutcome` — id, patientId, programId, outcomeMetricId, baselineValue, currentValue, targetValue, improvementPct, progressPct, targetAchieved, measuredAt, notes, unit, patient, program, doctor, outcomeMetric
- `PatientOutcomeList` — data array + meta pagination
- `PatientOutcomeInput` — patientId, programId, outcomeMetricId, baselineValue, currentValue, targetValue, measuredAt, notes, doctorId
- `PatientOutcomeUpdate` — partial of input

### Missing Hooks (not generated)
- `useListOutcomes(params)` 
- `useGetOutcome(id)`
- `useCreateOutcome()`
- `useUpdateOutcome()`
- `useDeleteOutcome()`

---

## Gap 2: Outcome Metrics Module (`/api/outcome-metrics`)

**Backend file:** `artifacts/api-server/src/routes/outcome-metrics.ts`  
**Status:** ✅ Fully implemented

### Missing Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/outcome-metrics` | List active metrics |
| `GET` | `/outcome-metrics/:id` | Get single metric |
| `POST` | `/outcome-metrics` | Create metric (admin) |
| `PATCH` | `/outcome-metrics/:id` | Update metric (admin) |
| `DELETE` | `/outcome-metrics/:id` | Deactivate metric (admin) |

### Missing Schemas
- `OutcomeMetric` — id, tenantId, code, name, category, unit, description, isActive, createdAt
- `OutcomeMetricList` — data + meta
- `OutcomeMetricInput`
- `OutcomeMetricUpdate`

### Missing Hooks
- `useListOutcomeMetrics()`
- `useGetOutcomeMetric(id)`
- `useCreateOutcomeMetric()`
- `useUpdateOutcomeMetric()`
- `useDeleteOutcomeMetric()`

---

## Gap 3: Tasks Module (`/api/tasks`)

**Backend file:** `artifacts/api-server/src/routes/tasks.ts`  
**Status:** ✅ Fully implemented, with notifications

### Missing Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tasks` | List tasks (filter by patientId, assignedTo, status, overdue) |
| `GET` | `/tasks/:id` | Get single task |
| `POST` | `/tasks` | Create task (notifies assignee) |
| `PATCH` | `/tasks/:id` | Update task / change status |
| `PATCH` | `/tasks/:id/complete` | Complete a task |
| `PATCH` | `/tasks/:id/reopen` | Reopen a completed task |
| `DELETE` | `/tasks/:id` | Soft-delete task |

### Missing Schemas
- `CareTask` — id, tenantId, patientId, assignedBy, assignedTo, title, description, priority (LOW/MEDIUM/HIGH/CRITICAL), status (PENDING/IN_PROGRESS/COMPLETED/OVERDUE), dueDate, completedAt, isOverdue, patient, creator, assignee
- `CareTaskList` — data + meta
- `CareTaskInput`
- `CareTaskUpdate`

### Missing Hooks
- `useListTasks(params)`
- `useGetTask(id)`
- `useCreateTask()`
- `useUpdateTask()`
- `useCompleteTask(id)`
- `useReopenTask(id)`
- `useDeleteTask(id)`

---

## Gap 4: Risk Scores Module (`/api/risk-scores`)

**Backend file:** `artifacts/api-server/src/routes/riskScores.ts`  
**Status:** ✅ Fully implemented with ML-style scoring service

### Missing Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/risk-scores` | List patients with risk scores (filter by riskLevel) |
| `GET` | `/risk-scores/:patientId` | Get risk details + factors for a patient |
| `POST` | `/risk-scores/:patientId/calculate` | Recalculate risk for one patient |
| `POST` | `/risk-scores/recalculate-all` | Bulk recalculate all patients |

### Missing Schemas
- `PatientRiskScore` — id, firstName, lastName, nhsNumber, riskScore (0-100), riskLevel (LOW/MEDIUM/HIGH/CRITICAL), lastCalculatedAt, clinic, program
- `RiskScoreDetail` — PatientRiskScore + factors array
- `RiskFactor` — name, weight, value, contribution
- `PatientRiskScoreList` — data + meta

### Missing Hooks
- `useListRiskScores(params)`
- `useGetPatientRiskScore(patientId)`
- `useCalculatePatientRiskScore(patientId)`
- `useRecalculateAllRiskScores()`

---

## Gap 5: Communications — EMAIL type

**Backend file:** `artifacts/api-server/src/routes/communications.ts`  
**Status:** ⚠️ Backend accepts `type: "EMAIL"` but current OpenAPI only documents SMS

### Current OpenAPI Coverage
- `GET /communications` — ✅ documented (in `SmsCommunication` schema)
- `POST /communications` — ✅ documented but only as SMS

### Missing
- `type` field in `CommunicationInput` schema (currently hardcoded to SMS behavior)
- `SmsCommunication` schema uses wrong name — should be `Communication` to reflect EMAIL support
- No `type` enum field in schema (SMS | EMAIL)
- No `subject` field in schema

---

## Gap 6: Files Module (`/api/files`)

**Backend file:** `artifacts/api-server/src/routes/files.ts`  
**Status:** ✅ Implemented — checked in generated client  
**Finding:** Already documented in openapi.yaml ✅

---

## Summary Table

| Module | Backend | OpenAPI | Hooks | Frontend |
|--------|---------|---------|-------|----------|
| Outcomes | ✅ | ❌ | ❌ | ❌ |
| Outcome Metrics | ✅ | ❌ | ❌ | ❌ |
| Tasks | ✅ | ❌ | ❌ | ❌ |
| Risk Scores | ✅ | ❌ | ❌ | ❌ |
| Communications (EMAIL type) | ✅ | ⚠️ Partial | ⚠️ Partial | ❌ |
| Files | ✅ | ✅ | ✅ | ✅ |

---

## Action Plan

1. **Phase 2:** Add all missing paths + schemas to `openapi.yaml`
2. **Phase 3:** Run `pnpm orval` to regenerate `api-client-react`
3. **Phase 4:** Build frontend components using generated hooks
4. **Phase 5:** Verify build + runtime
