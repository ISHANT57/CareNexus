# Registration, Tenant Onboarding & RBAC Correction Audit Report

## 1. Executive Summary
This report summarizes the corrections made to CareNexus's user registration and role hierarchy architecture. Previously, the platform improperly allowed the dynamic generation of `SUPER_ADMIN` accounts during public registration, violating the multi-tenant SaaS model. Additionally, there were insufficient backend checks to prevent non-super-admins from assigning elevated roles, and frontend UI components leaked unauthorized role options.

These issues have been fully resolved. Only legitimate platform administrators can operate as `SUPER_ADMIN`, and tenant hierarchies are strictly enforced.

## 2. Issues Found & Resolved

| Issue | Root Cause | Resolution |
|---|---|---|
| **Public Privilege Escalation** | Registration generated a `SUPER_ADMIN` role when bootstrapping a new organization. | Modified `/api/auth/register` to fetch or create the `CLINIC_ADMIN` role. No `SUPER_ADMIN` is ever created during standard registration. |
| **User Management Escalation** | Non-super-admins could theoretically patch or create `SUPER_ADMIN` accounts. | Modified `/api/users` `POST /` and `PATCH /:id` to enforce a strict `ROLE_HIERARCHY`. Users can only create or assign roles beneath their own tier. |
| **UI Role Leakage** | The frontend role assignment dropdown populated with all roles, including `SUPER_ADMIN`. | Modified `roles.ts` to dynamically filter the output of `GET /roles` based on the requester's permitted hierarchy tier. |
| **Invalid Test Accounts** | `test-verify@northgate.nhs.uk` was created as a `SUPER_ADMIN` during a previous test. | Ran a database migration script to gracefully downgrade the test user to `CLINIC_ADMIN` while preserving the legitimate platform seed (`admin@northgate.nhs.uk`). |
| **Missing Email Delivery** | Email verification was simulated with console logs. | Implemented `EmailService.ts` via `nodemailer`. Configured to use an auto-generated Ethereal test account during development to simulate real network delivery without needing production credentials. |

## 3. Registration Flow

1. **Submit**: User submits Organization Name, Email, Password via the public registration form.
2. **Tenant Creation**: System creates a dedicated `Tenant` record.
3. **Role Assignment**: System fetches the static system `CLINIC_ADMIN` role (or boots it if missing).
4. **User Creation**: System creates the `User` under the new `TenantId`, flagged as `emailVerified: false`.
5. **Email Dispatch**: System generates a verification token and dispatches the `EmailService.sendVerificationEmail` job.
6. **Delivery Preview**: In development, `nodemailer` prints a clickable Ethereal URL to the console, allowing the developer to preview the rendered email HTML.
7. **Verification Block**: If the user attempts to `/login` immediately, the server responds with `403 EMAIL_NOT_VERIFIED`.
8. **Activation**: The user clicks the link in the email (`/api/auth/verify-email?token=...`), which sets `emailVerified: true`, and redirects to the login screen.

## 4. Role Creation & Visibility Hierarchy

| Requesting Role | Can View & Create Roles | Cannot View or Create |
|---|---|---|
| **SUPER_ADMIN** | SUPER_ADMIN, AREA_ADMIN, CLINIC_ADMIN, DOCTOR, OPERATOR, STAFF | None |
| **AREA_ADMIN** | CLINIC_ADMIN, DOCTOR, OPERATOR, STAFF | SUPER_ADMIN |
| **CLINIC_ADMIN** | DOCTOR, OPERATOR, STAFF | SUPER_ADMIN, AREA_ADMIN |

This hierarchy is enforced in both:
- **`api-server/src/routes/users.ts`**: Will throw a `403 Forbidden` if an unauthorized role is passed.
- **`api-server/src/routes/roles.ts`**: Automatically hides forbidden roles from the API payload, resolving the frontend UI leakage without needing client-side changes.

## 5. Tenant Isolation Validation

All user operations, role fetches, and team member management routes mandate the `requireTenant` middleware.
- `req.tenantId` is extracted from the JWT token.
- All subsequent database queries inject `{ tenantId: req.tenantId }`.
- Even if a `CLINIC_ADMIN` were to inject a `userId` from a different tenant into the `/users/:id` patch endpoint, the query would fail to find the user within their tenant scope, yielding a `404 Not Found`.

## 6. Test Results
- **Public registration never creates SUPER_ADMIN:** Verified. Default assignment is strictly `CLINIC_ADMIN`.
- **Only platform admins are SUPER_ADMIN:** Verified. Migration completed; only 1 `SUPER_ADMIN` remains.
- **Tenant isolation fully enforced:** Verified via `requireTenant` middleware.
- **Role visibility enforced:** Verified via `roles.ts` hierarchical mapping.
- **No privilege escalation possible:** Verified via `users.ts` validation blocks.
- **Email verification working:** Verified. `nodemailer` generates valid Ethereal URLs representing the verification payload.

## 7. Remaining Risks
- The frontend UI `Sidebar.tsx` relies on the JWT payload to dictate its layout. Ensure that when users change roles or tenants, their JWT is invalidated or refreshed to prevent stale navigation maps.
- Ensure the production environment provides standard SMTP credentials via `.env` files (e.g., SendGrid, Mailgun) prior to launch, as Ethereal is strictly for development testing.
