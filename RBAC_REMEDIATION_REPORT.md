# RBAC_REMEDIATION_REPORT.md — CareNexus RBAC Validation

This report validates the security controls, permissions matrix, and remediations applied to all roles in the CareNexus PMS.

---

## 1. Role Authorization Matrix

The table below describes the verified capabilities of each system role across all modules:

| Role | View (Read) | Create (Write) | Edit (Update) | Delete (Soft) | Data Scope |
|---|---|---|---|---|---|
| **SUPER_ADMIN** | Patients, Appts, Consults, Tasks, Users, Tenants, Areas, Clinics, Programs, Logs | Users, Tenants, Areas, Clinics, Programs, Appts, Outcomes, Tasks | Users, Tenants, Areas, Clinics, Programs, Appts, Outcomes, Tasks | Patients, Users, Tenants, Areas, Clinics, Programs | Global (Cross-Tenant) |
| **AREA_ADMIN** | Patients, Appts, Consults, Tasks, Users, Areas, Clinics, Programs, Logs | Patients, Appts, Outcomes, Tasks, Users | Patients, Appts, Outcomes, Tasks, Users | Patients, Users, Clinics, Programs | Assigned Areas (Tenant) |
| **CLINIC_ADMIN**| Patients, Appts, Consults, Tasks, Users, Clinics, Programs | Patients, Appts, Outcomes, Tasks, Users | Patients, Appts, Outcomes, Tasks, Users | Patients, Users | Assigned Clinics (Tenant) |
| **DOCTOR** | Assigned Patients, Appts, Consults, Outcomes, Tasks | Consultations, Outcomes, Tasks, Appts | Patients (medical), Outcomes, Tasks | ❌ Blocked | Assigned Patients Only |
| **OPERATOR** | Patients, Appts, Consults, Tasks, Programs, Communications | Patients, Appts, Tasks, Communications | Patients, Appts, Tasks | Patients (soft) | Assigned Clinics (Tenant) |
| **STAFF** | Patients, Appts, Consults, Tasks, Programs, Communications | Tasks, Communications | Tasks, Patients (demographics) | ❌ Blocked | Assigned Clinics (Tenant) |

---

## 2. Remediations Applied

1. **Ad-hoc Scope Bypass**: Refactored `getRoleScope` middleware to prevent `CLINIC_ADMIN` and `AREA_ADMIN` from accessing clinical records outside of their clinic or area assignments.
2. **Patient Sub-Resource Hijacking**: Fixed `/journey`, `/gp`, `/status`, and `/communications` endpoints in `patients.ts` to ensure visibility constraints are checked on lookup.
3. **Cross-Tenant Escalations**: Hardened all assignment routes (`POST /api/users/:id/clinics`, `POST /api/users/:id/programs`, `POST /api/assignments`) to ensure clinic and program targets exist and belong to the user's active tenant.
