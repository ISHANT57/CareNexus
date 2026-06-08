# Caremesh PMS — API Contracts

_Last updated: 2026-06-08 (full repository audit)_

> **⚠️ CRITICAL SYNC WARNING:** The backend implementation is currently ahead of the `openapi.yaml` specification. The new endpoints for Outcomes, Care Tasks, and Risk Scores exist in the API server but are missing from the OpenAPI spec, preventing the frontend from generating hooks.

All API responses follow a standard envelope:
```json
{
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 } // for lists
}
```

---

## 1. Authentication & Users
- `POST /api/auth/register` — Super admin tenant bootstrap
- `POST /api/auth/login` — Issues HttpOnly cookies
- `POST /api/auth/refresh` — Rotates HttpOnly cookies
- `POST /api/auth/logout` — Clears cookies
- `GET /api/auth/me` — Returns current user + tenant context
- `GET/POST/PATCH/DELETE /api/users` — Staff CRUD

## 2. Organization Structure
- `GET/POST/PATCH/DELETE /api/tenants`
- `GET/POST/PATCH/DELETE /api/areas`
- `GET/POST/PATCH/DELETE /api/clinics`
- `GET/POST/PATCH/DELETE /api/programs`

## 3. Roles & Permissions
- `GET/POST/PATCH/DELETE /api/roles`
- `GET /api/roles/:id/permissions` — Returns granular permissions

## 4. Patient Core
- `GET/POST/PATCH/DELETE /api/patients`
- `PATCH /api/patients/:id/gp-details` — Upsert GP info
- `POST /api/import/patients` — Bulk CSV import

## 5. Clinical Workflows

### Appointments
- `GET /api/appointments` — List appointments
- `POST /api/appointments` — Create appointment
- `PATCH /api/appointments/:id` — Update status/time
- `DELETE /api/appointments/:id` — Soft delete

### Consultations
- `GET /api/consultations` — List consultations
- `GET /api/consultations/:id` — Get specific consultation
- `POST /api/consultations` — Record new consultation
- `PATCH /api/consultations/:id` — Update notes
- `DELETE /api/consultations/:id` — **[🔴 MISSING IN BACKEND]**

### Program Enrollments
- `GET/POST/PATCH/DELETE /api/program-enrollments`

---

## 6. Phase 1-5 Expansion APIs
**Status:** Backend Implemented. **Pending OpenAPI Spec.**

### Outcome Metrics (Catalogue)
- `GET /api/outcome-metrics`
- `POST /api/outcome-metrics`
- `PATCH /api/outcome-metrics/:id`
- `DELETE /api/outcome-metrics/:id`

### Patient Outcomes
- `GET /api/outcomes`
- `POST /api/outcomes` — Auto-calculates improvement/progress %
- `PATCH /api/outcomes/:id`
- `DELETE /api/outcomes/:id`

### Care Tasks
- `GET /api/tasks` — With lazy `isOverdue` evaluation
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `PATCH /api/tasks/:id/complete` — Mark task completed
- `PATCH /api/tasks/:id/reopen` — Mark task in progress
- `DELETE /api/tasks/:id`

### Risk Scores
- `GET /api/risk-scores` — List patients sorted by risk
- `GET /api/risk-scores/:patientId` — Returns exact weighting factors
- `POST /api/risk-scores/:patientId/calculate` — Manual recalculate
- `POST /api/risk-scores/recalculate-all` — Bulk recalculate

---

## 7. Operational & Comms
- `GET /api/communications/sms` — List SMS
- `POST /api/communications/sms/send` — Send via Twilio
- `GET /api/notifications` — List in-app notifications
- `PATCH /api/notifications/:id/read`
- `POST /api/notifications/read-all`
- `GET /api/audit-logs` — System-wide immutable ledger
- `GET/POST/DELETE /api/files` — File attachments

## 8. Reports & Analytics
- `GET /api/reports/dashboard` — High level stats (total patients, active, etc.)
- `GET /api/reports/patients-by-status`
- `GET /api/reports/patients-by-program`
- `GET /api/reports/recent-activity`
- `GET /api/reports/outcomes-by-program` — Phase 1 added
- `GET /api/reports/outcomes-by-clinic` — Phase 1 added
- `GET /api/reports/outcomes-by-doctor` — Phase 1 added
