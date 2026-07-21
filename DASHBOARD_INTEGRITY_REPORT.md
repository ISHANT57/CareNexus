# DASHBOARD_INTEGRITY_REPORT.md — Dashboard Metrics & Data Integrity

This report validates the integrity of dashboard metrics and reports queries, preventing relation conflicts and leakage.

---

## 1. Audited Dashboard Widgets

| Widget / Stat | Table Scoped | Applied Scopes | SQL Scoping Check |
|---|---|---|---|
| **Patient Stats** | `Patient` | Tenant, Clinic, Area, Doctor | Scopes counts using `getRoleScope(req, "patient")` |
| **Appointment Stats**| `Appointment`| Tenant, Clinic, Area, Doctor | Scopes counts using `getRoleScope(req, "appointment")` |
| **Program Stats** | `Program` | Tenant, Clinic, Area | Scopes counts using `getRoleScope(req, "program")` |
| **Outcome Stats** | `PatientOutcome`| Tenant, Clinic, Doctor | Scopes counts using `getRoleScope(req, "outcome")` |
| **Risk Statistics** | `Patient` | Tenant, Clinic, Doctor | Scopes counts using `getRoleScope(req, "patient")` |
| **Task Statistics** | `CareTask` | Tenant, Clinic, Doctor | Scopes counts using `getRoleScope(req, "task")` |
| **User Stats** | `User` | Tenant, Clinic | Scopes counts using `getRoleScope(req, "user")` |

---

## 2. Integrity Issues Resolved

1. **Relations Count Crash for Doctors**:
   In `reports.ts`, the shared `base` query object contained `doctorAssignments` which crashed when used to count entities on non-patient models (like `Clinic`, `Program`, `Area`, `User`). We refactored `GET /dashboard` to query each count using a module-specific scope (`patientScope`, `clinicScope`, `programScope`, etc.), eliminating all query syntax crashes for doctor accounts.
2. **Consultation/Outcomes/Followups Scoping Leak**:
   Refactored outcomes-by-program, outcomes-by-clinic, outcomes-by-doctor, consultations-by-clinic, consultations-by-program, and follow-ups to apply their respective `getRoleScope` visibility checks, preventing clinic/doctor metrics from leaking across boundaries.
