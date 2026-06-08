# Caremesh PMS — Database Mapping

_Last updated: 2026-06-08 (full repository audit)_

This document outlines the core domain entities in the Caremesh PMS PostgreSQL database, managed via Prisma.

---

## 1. Multi-Tenancy Foundation

### `tenants`
The root entity of the system. Every piece of operational data must contain a `tenantId`.

| Column | Type | Notes |
|---|---|---|
| `id` | String | UUID primary key |
| `name` | String | E.g., "Northgate Mental Health" |
| `domain` | String | Unique custom domain for the tenant |
| `logoUrl` | String? | Tenant branding |
| `onboardingSmsTemplate` | String? | Custom SMS text |
| `isActive` | Boolean | Disabling blocks all logins for this tenant |
| `deletedAt` | DateTime? | Soft delete |

---

## 2. Organization Structure

### `areas`
Geographic or administrative groupings of clinics within a tenant.

| Column | Type | Notes |
|---|---|---|
| `id` | String | UUID |
| `tenantId` | String | FK to `tenants` |
| `name` | String | E.g., "North Region" |

### `clinics`
Physical or virtual locations where care is delivered.

| Column | Type | Notes |
|---|---|---|
| `tenantId` | String | FK to `tenants` |
| `areaId` | String | FK to `areas` |
| `name` | String | E.g., "Morpeth Clinic" |
| `address` | String? | Physical address |

### `programs`
Care pathways that patients can be enrolled into.

| Column | Type | Notes |
|---|---|---|
| `tenantId` | String | FK to `tenants` |
| `name` | String | E.g., "CBT Pathway" |
| `activationCode` | String | Used for bulk onboarding mapping |
| `priority` | Int | Sorting order |

---

## 3. Access Control & Users

### `roles`
Groups of permissions. E.g., `SUPER_ADMIN`, `DOCTOR`.
- `isSystem`: True for built-in roles that cannot be deleted.

### `permissions` & `role_permissions`
Granular actions (`module`, `action`) assigned to roles. E.g., `PATIENTS:READ`.

### `users`
Staff members logging into the platform.

| Column | Type | Notes |
|---|---|---|
| `tenantId` | String | FK to `tenants` |
| `roleId` | String | FK to `roles` |
| `email` | String | Unique login |
| `password` | String | Bcrypt hash |
| `status` | UserStatus | `ACTIVE`, `INACTIVE`, `SUSPENDED` |

*(Users also have Many-to-Many assignment tables for Clinics and Programs: `user_clinic_assignments`, `user_program_assignments`)*

---

## 4. Patient Core

### `patients`
The central healthcare entity.

| Column | Type | Notes |
|---|---|---|
| `tenantId` | String | FK to `tenants` |
| `clinicId` | String | Primary clinic |
| `programId` | String | Primary program |
| `nhsNumber` | String | Unique per tenant |
| `firstName`, `lastName` | String | |
| `mobile` | String | E.164 format for Twilio |
| `status` | PatientStatus | `ACTIVE`, `INACTIVE` |
| `riskScore` | Float? | 0-100 (Calculated via nightly cron) |
| `riskLevel` | RiskLevel | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `isDischarge` | Boolean | True if patient is discharged |

### `patient_gp_details` & `patient_referrals`
One-to-One and One-to-Many supporting tables for external referral and GP context.

### `doctor_patient_assignments`
Mapping table assigning a specific Doctor (`userId`) to a Patient.

---

## 5. Clinical Workflows

### `appointments`
Scheduled interactions between a doctor and patient.

| Column | Type | Notes |
|---|---|---|
| `tenantId` | String | FK |
| `patientId` | String | FK |
| `doctorId` | String | FK |
| `clinicId` | String | FK |
| `appointmentDate` | DateTime | When it occurs |
| `durationMinutes` | Int | Length |
| `status` | AppointmentStatus| `SCHEDULED`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |

### `consultations`
Clinical notes resulting from an appointment.

| Column | Type | Notes |
|---|---|---|
| `tenantId` | String | FK |
| `patientId` | String | FK |
| `appointmentId` | String | Unique FK to `appointments` |
| `doctorId` | String | FK |
| `chiefComplaint` | String | |
| `symptoms` | String | |
| `observations` | String | |
| `diagnosis` | String | |
| `treatmentPlan` | String | |
| `medications` | String | |
| `followUpInstructions`| String | |

### `program_enrollments`
Tracking a patient's lifecycle through a specific program.

| Column | Type | Notes |
|---|---|---|
| `status` | EnrollmentStatus | `ACTIVE`, `COMPLETED`, `CANCELLED` |
| `enrolledAt` | DateTime | |

---

## 6. Phase 1 & 2 Modules (Outcomes & Tasks)

### `outcome_metrics`
Master catalogue of measurable metrics per tenant (e.g., HbA1c, Weight).

| Column | Type | Notes |
|---|---|---|
| `tenantId` | String | FK |
| `code` | String | E.g., `HBA1C` |
| `name` | String | Human readable |
| `category` | String | E.g., `CLINICAL`, `LIFESTYLE` |
| `unit` | String | E.g., `mmol/mol`, `kg` |

### `patient_outcomes`
Actual recorded values for a patient against an `outcome_metric`.

| Column | Type | Notes |
|---|---|---|
| `tenantId` | String | FK |
| `patientId` | String | FK |
| `outcomeMetricId` | String | FK to `outcome_metrics` |
| `baselineValue` | Float | Initial reading |
| `currentValue` | Float | Latest reading |
| `targetValue` | Float | Goal reading |
| `measuredAt` | DateTime | When taken |

### `care_tasks`
Tasks assigned to care team members regarding a patient.

| Column | Type | Notes |
|---|---|---|
| `patientId` | String | FK |
| `assignedBy` | String | FK to `users` |
| `assignedTo` | String | FK to `users` |
| `title` | String | |
| `priority` | TaskPriority | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `status` | TaskStatus | `PENDING`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE` |
| `dueDate` | DateTime | |

---

## 7. Audit & Communications

### `audit_logs`
Immutable, append-only log of all system actions. Captures `beforeValue` and `afterValue` as JSON for complete traceability.

### `sms_communications`
Records of Twilio SMS messages sent to patients. Status transitions: `QUEUED` -> `SENT` / `FAILED` -> `DELIVERED`.

### `notifications`
In-app alerts for users (e.g., "New Task Assigned", "High Risk Patient Detected").

### `file_uploads`
Metadata pointers for patient documents. `fileUrl` currently points to local disk, but is slated for cloud object storage migration.
