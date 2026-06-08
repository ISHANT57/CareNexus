# API_CONTRACTS.md — Caremesh PMS

_Last updated: 2026-06-06_

**Source of truth:** `lib/api-spec/openapi.yaml`. This document is the human-readable companion. When they diverge, the OpenAPI spec wins.

All routes are prefixed with `/api`. Responses are **unwrapped** — the top-level object is the resource, not `{ data: resource }`.

---

## Authentication

All protected routes require:
```
Authorization: Bearer <accessToken>
```

Error response shape (all errors):
```json
{ "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
```

---

## Module 1 — Auth (`/api/auth`)

### POST /api/auth/login
Rate limited: 20 req / 15 min.

**Body:**
```json
{ "email": "string", "password": "string" }
```
**Response 200:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "SUPER_ADMIN | AREA_ADMIN | CLINIC_ADMIN | DOCTOR | OPERATOR | STAFF",
    "tenantId": "uuid",
    "tenantName": "string",
    "avatarUrl": "string | null"
  }
}
```

### POST /api/auth/register
Creates a new tenant + SUPER_ADMIN user. Rate limited: 20 req / 15 min.

**Body:**
```json
{
  "tenantName": "string (2–100)",
  "tenantDomain": "string (2–255)",
  "firstName": "string",
  "lastName": "string",
  "email": "string (valid email)",
  "password": "string (min 8)"
}
```
**Response 201:** Same shape as login response.

### POST /api/auth/refresh
Rotates refresh token. Old token is revoked.

**Body:**
```json
{ "refreshToken": "string" }
```
**Response 200:**
```json
{ "accessToken": "string", "refreshToken": "string" }
```

### POST /api/auth/logout
Requires auth. Revokes the supplied refresh token.

**Body:** `{ "refreshToken": "string" }` (optional)

**Response 200:** `{ "ok": true }`

### GET /api/auth/me
Requires auth.

**Response 200:**
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "mobile": "string | null",
  "avatarUrl": "string | null",
  "role": "string",
  "tenantId": "uuid",
  "tenantName": "string",
  "status": "ACTIVE | INACTIVE | SUSPENDED",
  "tenant": { "id": "uuid", "name": "string", "logoUrl": "string | null" },
  "clinics": [{ "id": "uuid", "name": "string" }],
  "lastLoginAt": "ISO8601 | null"
}
```

### POST /api/auth/change-password
Requires auth.

**Body:**
```json
{ "currentPassword": "string", "newPassword": "string (min 8)" }
```
**Response 200:** `{ "ok": true }`

---

## Module 2 — Tenants (`/api/tenants`)
_SUPER_ADMIN only._

### GET /api/tenants
**Response 200:** Array of Tenant objects.

### POST /api/tenants
**Body:** `{ "name": "string", "domain": "string", "logoUrl?": "string" }`
**Response 201:** Tenant object.

### GET /api/tenants/:id
**Response 200:** Tenant object.

### PATCH /api/tenants/:id
**Body:** Partial Tenant fields.
**Response 200:** Updated Tenant object.

### DELETE /api/tenants/:id
Soft-delete. **Response 204.**

---

## Module 3 — Areas (`/api/areas`)
_Auth + tenant required._

### GET /api/areas
Query params: `page`, `pageSize`, `q` (name search)
**Response 200:** `{ data: Area[], total: number, page: number, pageSize: number }`

### POST /api/areas
_ADMIN_ROLES required._
**Body:** `{ "name": "string" }`
**Response 201:** Area object.

### GET /api/areas/:id
**Response 200:** Area object.

### PATCH /api/areas/:id
_ADMIN_ROLES._
**Body:** Partial Area fields.
**Response 200:** Updated Area object.

### DELETE /api/areas/:id
_ADMIN_ROLES._ Soft-delete. **Response 204.**

---

## Module 4 — Clinics (`/api/clinics`)
_Auth + tenant required._

### GET /api/clinics
Query params: `page`, `pageSize`, `areaId`, `q`
**Response 200:** `{ data: Clinic[], total: number, page: number, pageSize: number }`

### POST /api/clinics
_ADMIN_ROLES._
**Body:** `{ "areaId": "uuid", "name": "string", "address?": "string" }`
**Response 201:** Clinic object.

### GET /api/clinics/:id
**Response 200:** Clinic object.

### PATCH /api/clinics/:id
_ADMIN_ROLES._
**Response 200:** Updated Clinic object.

### DELETE /api/clinics/:id
_ADMIN_ROLES._ Soft-delete. **Response 204.**

---

## Module 5 — Programs (`/api/programs`)
_Auth + tenant required._

### GET /api/programs
Query params: `page`, `pageSize`, `q`
**Response 200:** `{ data: Program[], total: number, page: number, pageSize: number }`

### POST /api/programs
_ADMIN_ROLES._
**Body:** `{ "name": "string", "activationCode": "string", "channelId?": number, "logoUrl?": "string", "priority?": number, "tags?": string[] }`
**Response 201:** Program object.

### GET /api/programs/:id
**Response 200:** Program object.

### PATCH /api/programs/:id
_ADMIN_ROLES._
**Response 200:** Updated Program object.

### DELETE /api/programs/:id
_ADMIN_ROLES._ Soft-delete. **Response 204.**

---

## Module 6 — Roles (`/api/roles`)
_SUPER_ADMIN only._

### GET /api/roles
**Response 200:** Array of Role objects (includes permissions).

### POST /api/roles
**Body:** `{ "name": "string", "description?": "string" }`
**Response 201:** Role object.

### GET /api/roles/:id
**Response 200:** Role object with permissions.

### PATCH /api/roles/:id
**Response 200:** Updated Role object.

### DELETE /api/roles/:id
Soft-delete. **Response 204.**

---

## Module 7 — Users / Staff (`/api/users`)
_Auth + tenant required._

### GET /api/users
_ADMIN_ROLES._
Query params: `page`, `pageSize`, `roleId`, `status`, `q`
**Response 200:** `{ data: User[], total: number, page: number, pageSize: number }`

### POST /api/users
_ADMIN_ROLES._
**Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string (min 8)",
  "roleId": "uuid",
  "mobile?": "string"
}
```
**Response 201:** User object.

### GET /api/users/:id
_ADMIN_ROLES._
**Response 200:** User object with clinic + program assignments.

### PATCH /api/users/:id
_ADMIN_ROLES._
**Response 200:** Updated User object.

### DELETE /api/users/:id
_ADMIN_ROLES._ Soft-delete. **Response 204.**

### POST /api/users/:id/clinics
_ADMIN_ROLES._
**Body:** `{ "clinicId": "uuid" }`
**Response 201:** `{ "message": "Clinic assigned" }`

### DELETE /api/users/:id/clinics/:clinicId
_ADMIN_ROLES._ Soft-delete assignment. **Response 204.**

### POST /api/users/:id/programs
_ADMIN_ROLES._
**Body:** `{ "programId": "uuid" }`
**Response 201:** `{ "message": "Program assigned" }`

### DELETE /api/users/:id/programs/:programId
_ADMIN_ROLES._ Soft-delete assignment. **Response 204.**

---

## Module 8 — Patients (`/api/patients`)
_Auth + tenant required._

### GET /api/patients
_CLINICAL_ROLES._
Query params: `page`, `pageSize`, `q`, `clinicId`, `areaId`, `programId`, `status`
**Response 200:** `{ data: Patient[], total: number, page: number, pageSize: number }`

### POST /api/patients
_ADMIN_ROLES._
**Body:** Full patient object including nested `gpDetails` and `referral` (see DATABASE_MAPPING.md for all fields).
**Response 201:** Patient object.

### GET /api/patients/:id
_CLINICAL_ROLES._
**Response 200:** Full Patient object including `program`, `clinic`, `area`, `gpDetails`, `referrals`, last 10 `journeyEvents` (with actor), `doctorAssignments`.

### PATCH /api/patients/:id
_CLINICAL_ROLES._
**Body:** Partial Patient (excluding `gpDetails`, `referral` — use dedicated endpoints).
**Response 200:** Updated Patient object.

### DELETE /api/patients/:id
_ADMIN_ROLES._ Soft-delete. **Response 204.**

### GET /api/patients/:id/journey
_CLINICAL_ROLES._
**Response 200:** Array of `PatientJourneyEvent` objects ordered by `createdAt DESC`.

### POST /api/patients/:id/journey
_CLINICAL_ROLES._
**Body:** `{ "status": "NEW | PSI | DISCHARGE | MEDICATION_REQUIRED", "notes?": "string" }`
**Response 201:** PatientJourneyEvent object.

### PATCH /api/patients/:id/gp
_CLINICAL_ROLES._
**Body:** Partial PatientGpDetails fields.
**Response 200:** Updated PatientGpDetails object.

### GET /api/patients/:id/communications
_CLINICAL_ROLES._
**Response 200:** Array of SmsCommunication objects for this patient.

---

## Module 9 — Doctor-Patient Assignments (`/api/assignments`)
_Auth + tenant required._

### GET /api/assignments
_CLINICAL_ROLES._
Query params: `page`, `pageSize`, `doctorId`, `patientId`, `clinicId`, `areaId`
**Response 200:** `{ data: DoctorPatientAssignment[], total: number, page: number, pageSize: number }`

### POST /api/assignments
_ADMIN_ROLES._
**Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "clinicId": "uuid",
  "areaId": "uuid",
  "isTemp?": "boolean"
}
```
**Response 201:** DoctorPatientAssignment object.

### DELETE /api/assignments/:id
_ADMIN_ROLES._ Soft-delete. **Response 204.**

---

## Module 10 — SMS Communications (`/api/communications`)
_Auth + tenant required._

### GET /api/communications/sms
_CLINICAL_ROLES._
Query params: `page`, `pageSize`, `patientId`, `status`
**Response 200:** `{ data: SmsCommunication[], total: number, page: number, pageSize: number }`

### POST /api/communications/sms
_CLINICAL_ROLES._
**Body:** `{ "patientId": "uuid", "mobile": "string", "messageText": "string" }`
**Response 201:** SmsCommunication object (status: `QUEUED`).

### GET /api/communications/sms/:id
_CLINICAL_ROLES._
**Response 200:** SmsCommunication object.

### POST /api/communications/sms/webhook
No auth. Twilio StatusCallback endpoint.
**Body:** Twilio webhook payload (form-encoded).
**Response 204.**

---

## Module 11 — Notifications (`/api/notifications`)
_Auth + tenant required. All staff._

### GET /api/notifications
Query params: `page`, `pageSize`, `unreadOnly`
**Response 200:** `{ data: Notification[], total: number, unreadCount: number }`

### PATCH /api/notifications/:id/read
Marks one notification as read.
**Response 200:** Updated Notification object.

### PATCH /api/notifications/read-all
Marks all unread notifications for the current user as read.
**Response 200:** `{ "updated": number }`

---

## Module 12 — Audit Logs (`/api/audit-logs`)
_Auth + tenant required. ADMIN_ROLES._

### GET /api/audit-logs
Query params: `page`, `pageSize`, `entityType`, `entityId`, `actorId`, `action`, `dateFrom`, `dateTo`
**Response 200:** `{ data: AuditLog[], total: number, page: number, pageSize: number }`

---

## Module 13 — Reports (`/api/reports`)
_Auth + tenant required._

### GET /api/reports/dashboard
**Response 200:**
```json
{
  "totalPatients": number,
  "activePatients": number,
  "totalUsers": number,
  "totalPrograms": number,
  "totalClinics": number,
  "totalAreas": number
}
```

### GET /api/reports/patients-by-status
**Response 200:** `[{ "status": "string", "count": number }]`

### GET /api/reports/patients-by-program
**Response 200:** `[{ "programId": "uuid", "programName": "string", "count": number }]`

### GET /api/reports/enrollment-stats
**Response 200:** `{ "totalEnrollments": number, "activeEnrollments": number, "completedEnrollments": number, "enrollmentsByProgram": [{ "programId": "uuid", "programName": "string", "count": number }] }`

### GET /api/reports/recent-activity
**Response 200:** Array of last 10 AuditLog entries with `actor` relation included (fields: `id`, `entityType`, `entityId`, `action`, `createdAt`, `actor.firstName`, `actor.lastName`).

---

## Module 14 — Program Enrollments (`/api/program-enrollments`)
_Auth + tenant required._

### GET /api/program-enrollments
_CLINICAL_ROLES._
Query params: `patientId`, `programId`, `status`, `page`, `limit`
**Response 200:** `{ data: ProgramEnrollment[], meta: { total, page, limit, totalPages } }`

### POST /api/program-enrollments
_CLINICAL_ROLES._
**Body:** `{ "patientId": "uuid", "programId": "uuid", "notes?": "string" }`
**Response 201:** ProgramEnrollment object.

### PATCH /api/program-enrollments/:id
_CLINICAL_ROLES._
**Body:** `{ "notes?": "string" }`
**Response 200:** Updated ProgramEnrollment object.

### POST /api/program-enrollments/:id/complete
_CLINICAL_ROLES._ Marks enrollment as COMPLETED.
**Response 200:** Updated ProgramEnrollment object.

### POST /api/program-enrollments/:id/cancel
_CLINICAL_ROLES._ Marks enrollment as CANCELLED.
**Response 200:** Updated ProgramEnrollment object.

---

## Health Check

### GET /api/healthz
No auth.
**Response 200:** `{ "status": "ok", "timestamp": "ISO8601" }`
