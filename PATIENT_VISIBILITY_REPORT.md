# PATIENT_VISIBILITY_REPORT.md — Patient Assignment Scoping

This report certifies that the patient records visibility architecture restricts doctors strictly to their assigned patients.

---

## 1. Visibility Scoping Model

Patient access is secured dynamically through active clinician assignments rather than simple tenant memberships:

*   **Clinician-to-Patient Mapping**: Explicitly managed via the `DoctorPatientAssignment` model.
*   **Scoped Query Filters**: Automatically applied to Prisma `where` clauses using `getRoleScope(req, "patient")`.

### Verified Visibility Controls

| Role | Access Bound | Scoping Filter | Status |
|---|---|---|
| **SUPER_ADMIN** | Global (Cross-Tenant) | None (`{}`) | ✓ Verified |
| **AREA_ADMIN** | Clinics in Assigned Areas | `{ clinic: { areaId: { in: allowedAreaIds } } }` | ✓ Verified |
| **CLINIC_ADMIN**| Assigned Clinics | `{ clinicId: { in: allowedClinicIds } }` | ✓ Verified |
| **DOCTOR** | Explicitly Assigned Patients | `{ doctorAssignments: { some: { doctorId, deletedAt: null } } }` | ✓ Verified |
| **STAFF** | Assigned Clinics | `{ clinicId: { in: allowedClinicIds } }` | ✓ Verified |

---

## 2. API Endpoint Protection

1.  **Direct Retrieval**: Scopes `GET /api/patients` and `GET /api/patients/:id` via `roleScope`.
2.  **Clinical Outcomes**: Scopes outcomes records to patients assigned to the active clinician.
3.  **Care Tasks**: Restricts task creation and visibility to assigned patients.
4.  **Appointments / Consultations**: Scopes consultations and appointment queries strictly to the doctor's clinician ID.
