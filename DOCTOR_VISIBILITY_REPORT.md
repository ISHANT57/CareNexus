# DOCTOR_VISIBILITY_REPORT.md — Clinical Data Scoping

This report details how clinical data visibility boundaries are enforced for Doctor accounts.

---

## 1. Visibility Scoping Implementation

A user logged in with the `DOCTOR` role is strictly locked to their clinical sphere. This boundary is enforced by applying database filters before executing Prisma queries.

| Module | Scoping Parameter | Prisma SQL Logic | Status |
|---|---|---|---|
| **Patients** | Assigned Patients Only | `doctorAssignments: { some: { doctorId: userId } }` | ✓ Enforced |
| **Appointments** | Own Appointments Only | `doctorId: userId` | ✓ Enforced |
| **Consultations**| Own Consultations Only| `doctorId: userId` | ✓ Enforced |
| **Outcomes** | Assigned Patients Only | `patient: { doctorAssignments: { some: { doctorId: userId } } }` | ✓ Enforced |
| **Tasks** | Assigned Patients Only | `patient: { doctorAssignments: { some: { doctorId: userId } } }` | ✓ Enforced |
| **Files** | Assigned Patients Only | `patient: { doctorAssignments: { some: { doctorId: userId } } }` | ✓ Enforced |

---

## 2. Leakage Mitigation Fixes

1. **Sub-Resource Traversal Leak**: Applied patient scoping checks to all sub-resource routes (`GET /api/patients/:id/journey`, `GET /api/patients/:id/communications`, and patient updates `PATCH /api/patients/:id`). A doctor attempting to query the status or GP details of another doctor's patient by ID will now receive a `404 Not Found`.
2. **Consultation / Appointment Creation Bypass**: consultation creation (`POST /api/consultations`) and appointment scheduling (`POST /api/appointments`) now explicitly verify patient assignment before registering the new records, preventing doctors from inserting clinical events for unassigned patient profiles.
3. **Cross-Doctor outcomes/tasks read**: Outpatient tasks and measured outcomes endpoints are now fully filtered using the active doctor's patient assignment scope.
