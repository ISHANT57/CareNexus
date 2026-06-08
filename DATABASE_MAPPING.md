# DATABASE_MAPPING.md — Caremesh PMS

_Last updated: 2026-06-06_

**Source of truth:** `artifacts/api-server/prisma/schema.prisma`

---

## Entity Relationship Summary

```
Tenant
  ├── Area[]               (tenantId FK)
  │     └── Clinic[]       (areaId FK)
  ├── Program[]            (tenantId FK)
  ├── User[]               (tenantId FK, roleId FK)
  │     ├── UserClinicAssignment[]   (userId + clinicId, soft-delete)
  │     └── UserProgramAssignment[]  (userId + programId, soft-delete)
  ├── Patient[]            (tenantId + programId + clinicId + areaId FKs)
  │     ├── PatientGpDetails         (1:1 patientId, cascade delete)
  │     ├── PatientReferral[]        (patientId FK, cascade delete)
  │     ├── PatientJourneyEvent[]    (patientId + actedBy(userId) FKs)
  │     ├── DoctorPatientAssignment[] (patientId + doctorId + clinicId + areaId)
  │     ├── SmsCommunication[]       (patientId optional FK)
  │     ├── FileUpload[]             (patientId + uploaderId FKs)
  │     ├── ProgramEnrollment[]      (patientId + programId FKs)
  │     └── AccountOnboardingLog[]   (patientId optional FK)
  ├── AuditLog[]           (tenantId + actorId(userId) FKs, APPEND-ONLY)
  └── Notification[]       (tenantId + userId FKs)

Role
  └── RolePermission[]     (roleId + permissionId FKs)
Permission
  └── RolePermission[]

User
  └── RefreshToken[]       (userId FK, cascade delete)
```

---

## Table Definitions

### `tenants`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `name` | String | e.g. "Northgate Mental Health Trust" |
| `domain` | String UNIQUE | e.g. "northgate.nhs.uk" |
| `logoUrl` | String? | S3/CDN URL |
| `onboardingSmsTemplate` | String? | SMS template for patient onboarding |
| `isActive` | Boolean | Default true |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `deletedAt` | DateTime? | Soft delete |

---

### `areas`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenantId` | UUID FK → tenants | |
| `name` | String | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `deletedAt` | DateTime? | Soft delete |

Unique: `(tenantId, name)`. Index: `tenantId`.

---

### `clinics`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenantId` | UUID | Denormalized (no FK — look up via area) |
| `areaId` | UUID FK → areas | |
| `name` | String | |
| `address` | String? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `deletedAt` | DateTime? | Soft delete |

Unique: `(areaId, name)`. Indexes: `tenantId`, `areaId`.

---

### `roles`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenantId` | UUID? | NULL = system-wide role |
| `name` | String | e.g. "SUPER_ADMIN", "DOCTOR" |
| `description` | String? | |
| `isSystem` | Boolean | System roles cannot be deleted |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

Unique: `(tenantId, name)`.

**System role names used in code:** `SUPER_ADMIN`, `AREA_ADMIN`, `CLINIC_ADMIN`, `DOCTOR`, `OPERATOR`, `STAFF`

---

### `permissions`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `module` | String | e.g. "patients", "reports" |
| `action` | String | e.g. "read", "write", "delete" |
| `description` | String? | |
| `createdAt` | DateTime | |

Unique: `(module, action)`.

---

### `role_permissions`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `roleId` | UUID FK → roles | Cascade delete |
| `permissionId` | UUID FK → permissions | Cascade delete |
| `createdAt` | DateTime | |

Unique: `(roleId, permissionId)`.

---

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenantId` | UUID FK → tenants | |
| `roleId` | UUID FK → roles | |
| `firstName` | String | |
| `lastName` | String | |
| `email` | String UNIQUE | |
| `password` | String | bcrypt hash (cost 12) |
| `mobile` | String? | |
| `avatarUrl` | String? | |
| `status` | Enum UserStatus | ACTIVE / INACTIVE / SUSPENDED |
| `lastLoginAt` | DateTime? | |
| `resetToken` | String? | Password reset (not yet wired) |
| `resetTokenExpiresAt` | DateTime? | |
| `emailVerified` | Boolean | Default false |
| `verificationToken` | String? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `deletedAt` | DateTime? | Soft delete |
| `createdBy` | String? | userId of creator |
| `updatedBy` | String? | userId of last editor |

Indexes: `tenantId`, `email`.

---

### `user_clinic_assignments`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `userId` | UUID FK → users | Cascade delete |
| `clinicId` | UUID FK → clinics | Cascade delete |
| `createdAt` | DateTime | |
| `deletedAt` | DateTime? | Soft delete |

Unique: `(userId, clinicId)`.

---

### `user_program_assignments`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `userId` | UUID FK → users | Cascade delete |
| `programId` | UUID FK → programs | Cascade delete |
| `createdAt` | DateTime | |
| `deletedAt` | DateTime? | Soft delete |

Unique: `(userId, programId)`.

---

### `programs`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenantId` | UUID FK → tenants | |
| `channelId` | Int? | External channel reference |
| `name` | String | |
| `logoUrl` | String? | |
| `activationCode` | String | Unique per tenant |
| `priority` | Int | Default 0 — lower = higher priority |
| `tags` | String[] | |
| `isActive` | Boolean | Default true |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `deletedAt` | DateTime? | Soft delete |

Unique: `(tenantId, activationCode)`. Index: `tenantId`.

---

### `patients`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenantId` | UUID FK → tenants | |
| `programId` | UUID FK → programs | |
| `clinicId` | UUID FK → clinics | |
| `areaId` | UUID FK → areas | |
| `nhsNumber` | String | 10 digits; unique per tenant |
| `title` | String? | Mr / Mrs / Dr etc. |
| `firstName` | String | |
| `lastName` | String | |
| `email` | String? | |
| `mobile` | String | Primary contact |
| `altMobile` | String? | |
| `gender` | Enum Gender? | MALE / FEMALE / OTHER |
| `dob` | DateTime? | |
| `address` | String? | |
| `city` | String? | |
| `state` | String? | |
| `postalCode` | String? | |
| `country` | String? | Default "UK" |
| `ethnicity` | String? | |
| `latitude` | String? | |
| `longitude` | String? | |
| `status` | Enum PatientStatus | **ACTIVE** / **INACTIVE** (uppercase) |
| `accountStatus` | Enum AccountStatus | ACTIVATE / DEACTIVATE |
| `patientGroup` | Enum PatientGroup? | NEW_PATIENT / REFERRED_FOR_REVIEW / TRANSITION_FROM_CAMHS / TRANSITION_ADULT |
| `userType` | Enum UserType? | PRIVATE / RTC / ICB_CONTRACT |
| `emisId` | String? | EMIS clinical system ID |
| `isTest` | Boolean | Default false |
| `optOut` | Boolean | Default false |
| `optOutAt` | DateTime? | |
| `registrationDate` | DateTime? | |
| `activationDate` | DateTime? | |
| `firstConsultationDate` | DateTime? | |
| `inviteSentCount` | Int | Default 0 |
| `inviteSentAt` | DateTime? | |
| `isDischarge` | Boolean | Default false |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `deletedAt` | DateTime? | Soft delete |
| `createdBy` | String? | userId |
| `updatedBy` | String? | userId |

Unique: `(tenantId, nhsNumber)`. Indexes: `tenantId`, `clinicId`, `areaId`, `programId`.

**⚠ Bug note:** Frontend badge compares `status === 'Active'` but values are `'ACTIVE'`/`'INACTIVE'`.

---

### `patient_gp_details`
1:1 with Patient (patientId UNIQUE). Cascade delete.

| Column | Type |
|---|---|
| `gpName` | String? |
| `gpOrgName` | String? |
| `gpNationalPracticeCode` | String? |
| `gpEmail` | String? |
| `gpAddress` | String? |
| `gpPostCode` | String? |
| `gpCity` | String? |
| `gpDistrict` | String? |
| `gpCountry` | String? |
| `gpSelected` | Boolean |
| `icbSelected` | Boolean |

---

### `patient_referrals`
Many per patient. Cascade delete.

| Column | Type |
|---|---|
| `patientId` | UUID FK |
| `referralSource` | String? |
| `referralText` | String? |
| `referralDate` | DateTime? |
| `contract` | String? |
| `contractOther` | String? |
| `createdBy` | String? |

---

### `patient_journey_events`
Append-only event log. Each row = one status transition.

| Column | Type | Notes |
|---|---|---|
| `patientId` | UUID FK → patients | |
| `status` | Enum JourneyStatus | NEW / PSI / DISCHARGE / MEDICATION_REQUIRED |
| `notes` | String? | |
| `actedBy` | UUID FK → users | Who recorded the event |
| `createdAt` | DateTime | |

**Current journey status = most recent row for a given patientId.**

---

### `doctor_patient_assignments`
| Column | Type | Notes |
|---|---|---|
| `tenantId` | UUID | Denormalized |
| `areaId` | UUID FK → areas | |
| `clinicId` | UUID FK → clinics | |
| `doctorId` | UUID FK → users | |
| `patientId` | UUID FK → patients | |
| `isTemp` | Boolean | Default false |
| `firstLoginAt` | DateTime? | |
| `deletedAt` | DateTime? | Soft delete |

Indexes: `tenantId`, `doctorId`, `patientId`.

---

### `sms_communications`
| Column | Type | Notes |
|---|---|---|
| `tenantId` | UUID FK → tenants | |
| `patientId` | UUID? FK → patients | Optional (bulk SMS without patient) |
| `mobile` | String | E.164 |
| `messageText` | String | |
| `twilioSid` | String? | Twilio message SID |
| `status` | Enum SmsStatus | QUEUED / SENT / DELIVERED / FAILED / UNDELIVERED |
| `attemptCount` | Int | Default 0 |
| `sentAt` | DateTime? | |
| `deliveredAt` | DateTime? | |

Index: `twilioSid` (for webhook lookup).

---

### `file_uploads`
| Column | Type | Notes |
|---|---|---|
| `tenantId` | UUID | Denormalized |
| `patientId` | UUID FK → patients | |
| `uploaderId` | UUID FK → users | |
| `fileKey` | String | Object storage key |
| `fileUrl` | String | CDN/S3 URL |
| `caseBlock` | String? | |
| `fileType` | String? | |
| `isTest` | Boolean | |
| `deletedAt` | DateTime? | Soft delete |

---

### `account_onboarding_logs`
Bulk import log. One row per patient row in the CSV.

| Column | Type | Notes |
|---|---|---|
| `tenantId` | UUID | |
| `uploadBatchId` | String? | Groups rows from same import |
| `uploaderId` | UUID? | User who triggered import |
| `programId` | UUID? | Target program |
| `patientId` | UUID? FK → patients | Set after successful creation |
| `nhsId` | String? | From CSV |
| `mobile` | String? | From CSV |
| `email` | String? | From CSV |
| `status` | String | "success" / "error" / "duplicate" |
| `statusCode` | Int? | |
| `statusMessage` | String? | Error detail |
| `source` | String? | "csv" / "api" |
| `isTest` | Boolean | |

---

### `program_enrollments`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenantId` | UUID FK → tenants | |
| `patientId` | UUID FK → patients | |
| `programId` | UUID FK → programs | |
| `status` | Enum EnrollmentStatus | ACTIVE / COMPLETED / CANCELLED |
| `notes` | String? | |
| `enrolledAt` | DateTime | |
| `completedAt` | DateTime? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `deletedAt` | DateTime? | Soft delete |

Indexes: `tenantId`, `patientId`, `programId`.

---

### `audit_logs`
**APPEND-ONLY. Never delete rows from this table.**

| Column | Type | Notes |
|---|---|---|
| `tenantId` | UUID FK → tenants | |
| `entityType` | String | "Patient", "User", "Clinic", etc. |
| `entityId` | UUID | ID of the affected entity |
| `action` | Enum AuditAction | CREATE / UPDATE / DELETE / LOGIN / LOGOUT |
| `actorId` | UUID? FK → users | NULL if system action |
| `beforeValue` | Json? | Full record snapshot before change |
| `afterValue` | Json? | Full record snapshot after change / request body |
| `ipAddress` | String? | |
| `userAgent` | String? | |

Indexes: `tenantId`, `(entityType, entityId)`, `actorId`.

**⚠ Bug note:** Relation is named `actor` (not `user`). `dashboard.tsx` incorrectly accesses `activity.user` — should be `activity.actor`.

---

### `notifications`
| Column | Type | Notes |
|---|---|---|
| `tenantId` | UUID FK → tenants | |
| `userId` | UUID FK → users | Cascade delete |
| `title` | String | |
| `message` | String | |
| `type` | Enum NotificationType | INFO / WARNING / ERROR / SUCCESS |
| `isRead` | Boolean | Default false |
| `readAt` | DateTime? | |

Index: `(tenantId, userId)`, `isRead`.

---

### `refresh_tokens`
| Column | Type | Notes |
|---|---|---|
| `userId` | UUID FK → users | Cascade delete |
| `token` | String UNIQUE | Raw JWT string |
| `expiresAt` | DateTime | 30 days from issue |
| `revokedAt` | DateTime? | Set on logout or rotation |

Indexes: `userId`, `token`.

---

## Enums

| Enum | Values |
|---|---|
| `UserStatus` | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `Gender` | `MALE`, `FEMALE`, `OTHER` |
| `PatientStatus` | `ACTIVE`, `INACTIVE` |
| `AccountStatus` | `ACTIVATE`, `DEACTIVATE` |
| `PatientGroup` | `NEW_PATIENT`, `REFERRED_FOR_REVIEW`, `TRANSITION_FROM_CAMHS`, `TRANSITION_ADULT` |
| `UserType` | `PRIVATE`, `RTC`, `ICB_CONTRACT` |
| `JourneyStatus` | `NEW`, `PSI`, `DISCHARGE`, `MEDICATION_REQUIRED` |
| `SmsStatus` | `QUEUED`, `SENT`, `DELIVERED`, `FAILED`, `UNDELIVERED` |
| `AuditAction` | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT` |
| `NotificationType` | `INFO`, `WARNING`, `ERROR`, `SUCCESS` |
| `EnrollmentStatus` | `ACTIVE`, `COMPLETED`, `CANCELLED` |
