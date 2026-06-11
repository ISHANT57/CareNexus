# MULTI_HOSPITAL_DOCTOR_REPORT.md — Multi-Hospital Doctor Architecture

This report details the architectural design and implementation supporting clinicians working across multiple hospital trusts.

---

## 1. Problem Statement: Email Conflicts

In typical SaaS designs, email address is used as the unique login credential. If a doctor works at "Hospital A" (Tenant A) and "Hospital B" (Tenant B), registering their email in Hospital B will fail if the system attempts to create a duplicate `User` record, throwing a unique constraint violation (`@unique` constraint on the email column in the `users` table).

---

## 2. Solution: Tenant & Clinic Assignment Architecture

CareNexus PMS resolves this using a centralized User Assignment architecture, where the credential record (`User`) is separated from organizational scopes (`Tenant` and `Clinic` assignments).

```
          ┌────────────────────────────────────────┐
          │                  User                  │ (Single login: email & password)
          │      email: "dr.smith@nhs.uk" (unique) │
          └──────┬──────────────────────────┬──────┘
                 │                          │
        ┌────────▼─────────┐       ┌────────▼─────────┐
        │ TenantAssignment │       │ TenantAssignment │ (Roles per tenant trust)
        │ Tenant: Trust A  │       │ Tenant: Trust B  │
        │ Role: DOCTOR     │       │ Role: DOCTOR     │
        └────────┬─────────┘       └────────┬─────────┘
                 │                          │
        ┌────────▼─────────┐       ┌────────▼─────────┐
        │ ClinicAssignment │       │ ClinicAssignment │ (Clinic facilities)
        │ Clinic: CMHT A   │       │ Clinic: CMHT B   │
        └──────────────────┘       └──────────────────┘
```

### 2.1 Database Schema Layout

- **`User`**: Stored globally with unique `email`.
- **`UserTenantAssignment`**: Maps `User` -> `Tenant` with a tenant-specific `Role` and `status`. Unique constraint: `@@unique([userId, tenantId])`.
- **`UserClinicAssignment`**: Maps `User` -> `Clinic`. Unique constraint: `@@unique([userId, clinicId])`.

---

## 3. Workflow: Onboarding & Login

### 3.1 Onboarding Flow (User Invite)
In `POST /api/users`, when an administrator invites a doctor:
1. The backend searches for an existing `User` matching the email.
2. **If found**: The backend does NOT create a new user or crash. Instead, it inserts a new `UserTenantAssignment` linking that user to the target tenant, and creates clinic/program mappings.
3. **If not found**: It creates the `User` record first, then registers the assignments.

### 3.2 Login & Workspace Switching
1. The user logs in with email and password.
2. The server authenticates credentials and returns all active `tenantAssignments` for that user.
3. On the frontend, the `TenantSwitcher` populates workspaces based on these assignments.
4. Switching a workspace sets the `X-Tenant-Id` header, and the backend middleware scopes requests to that workspace.
