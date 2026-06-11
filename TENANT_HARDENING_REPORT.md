# TENANT_HARDENING_REPORT.md — Multi-Tenant Isolation Hardening

This report documents the verification of strict database boundaries preventing cross-tenant data leaks.

---

## 1. Tenant Boundary Controls

| Model | Scoping Check | Leakage Prevention | Status |
|---|---|---|---|
| **Patients** | `where: { tenantId: req.tenantId }` | Checked on lists, inserts, and all sub-resources (e.g., GP details, status updates). | ✓ Verified |
| **Programs** | `where: { tenantId: req.tenantId }` | Validates that associated area/clinic parameters also belong to the tenant. | ✓ Verified |
| **Areas** | `where: { tenantId: req.tenantId }` | Scoped via global `getRoleScope` checks on lists and updates. | ✓ Verified |
| **Clinics** | `where: { tenantId: req.tenantId }` | Validates that clinic belongs to a tenant-owned Area. | ✓ Verified |
| **Appointments** | `where: { tenantId: req.tenantId }` | On creation, doctor, patient, and clinic are all verified to belong to the tenant. | ✓ Verified |
| **Consultations**| `where: { tenantId: req.tenantId }` | Validated that patient, doctor, clinic, and appointment all belong to the tenant. | ✓ Verified |
| **Outcomes** | `where: { tenantId: req.tenantId }` | Checked on list, detail, and creation (validating metric and patient tenant match). | ✓ Verified |
| **Tasks** | `where: { tenantId: req.tenantId }` | Checked on lists, updates, and creation (assignee and patient tenant validation). | ✓ Verified |
| **Users** | `where: { tenantAssignments: { some: { tenantId } } }` | Checks active tenant assignments; user assignments to clinics and programs are validated. | ✓ Verified |
| **Notifications**| `where: { tenantId: req.tenantId, userId }` | Locked strictly to active tenant and requesting user ID. | ✓ Verified |
| **Audit Logs** | `where: { tenantId: req.tenantId }` | Locked strictly to the active tenant ID for non-superadmins. | ✓ Verified |

---

## 2. Hardening Measures Implemented

1. **Cross-Tenant ID Parameter Spoofing**: Added check in `POST /api/assignments` to ensure area, clinic, patient, and doctor belong to the active tenant.
2. **Program/Clinic Tenant Containment**: Modified `POST /api/users/:id/clinics` and `POST /api/users/:id/programs` to check target existence in `req.tenantId` context.
3. **Outcome Metrics Containment**: Validated that `outcomeMetricId` exists inside the active tenant's schema before logging outcome records.
