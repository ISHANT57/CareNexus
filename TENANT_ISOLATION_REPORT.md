# TENANT_ISOLATION_REPORT.md — Multi-Tenant Isolation Hardening

This report validates that strict data boundaries are enforced between all tenant accounts on the CareNexus platform.

---

## 1. Multi-Tenant Scoping Controls

Every database query and data manipulation request is wrapped with active tenant validations to prevent unauthorized cross-tenant operations:

| Resource | Scoping Method | Enforcement Check | Status |
|---|---|---|---|
| **Patients** | `where: { tenantId }` | Validates area, clinic, and program belong to the tenant | ✓ Secured |
| **Clinics / Areas**| `where: { tenantId }` | Validates parent-child mappings match active tenant context | ✓ Secured |
| **Appointments** | `where: { tenantId }` | Asserts patient, doctor, and clinic belong to the tenant | ✓ Secured |
| **Outcomes / Tasks**| `where: { tenantId }` | Applied via patient role scope and tenant matches | ✓ Secured |
| **Users / Admins** | `where: { tenantAssignments }` | Locks standard users to assigned clinics and programs | ✓ Secured |
| **Audit Logs** | `where: { tenantId }` | Restricts non-superadmin logs to their active tenant ID | ✓ Secured |

---

## 2. Hardened Endpoints

- **Tenant Mismatch Assertion (`assertTenantMatch`)**: Custom utility thrown inside sub-resource detail and update routes to prevent parameter tampering.
- **Cross-Tenant ID Check**: Validates that all relational targets (e.g. clinic, program, doctor) inside `POST /api/assignments`, `POST /api/appointments`, and `POST /api/consultations` exist under the active `tenantId`.
