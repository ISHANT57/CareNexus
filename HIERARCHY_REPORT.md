# HIERARCHY_REPORT.md — Organizational Hierarchy Enforcement

This report outlines how the hierarchy is enforced within the database queries and route controllers.

---

## 1. Hierarchy Validation Rules

Every operation must satisfy the strict parent-child relationships defined below:

```
Tenant (e.g. Trust)
  └── Area (Region)
        └── Clinic (Facility)
              ├── Program (Service Template)
              ├── Doctor (Clinician)
              └── Patient (Service User)
```

### 1.1 Enforcement Checks Added

- **Area -> Clinic Alignment**:
  In `POST /api/clinics` and `PATCH /api/clinics/:id`, the clinic's `areaId` must resolve to an Area owned by the clinic's `tenantId`.
- **Clinic -> Program Alignment**:
  In `POST /api/programs` and `PATCH /api/programs/:id`, the program's `areaId` and `clinicId` must match the parent tenant, and if both are specified, the clinic must reside within the specified area.
- **Clinic/Area -> Patient Alignment**:
  In `POST /api/patients` and `PATCH /api/patients/:id`, the patient's `areaId` and `clinicId` must match the current tenant and the clinic must belong to the patient's area.
- **Doctor -> Clinic Alignment**:
  When assigning a doctor to a patient (`POST /api/assignments`), we assert that the selected clinic resides within the selected area, and both the patient and doctor reside within the active tenant and the doctor has clinic-level assignments inside the organization.
- **Doctor -> Patient Scoping**:
  A Doctor role can only query patient records where they have an active assignment in `DoctorPatientAssignment`.

---

## 2. Conclusion

Query filters on list/detail routes for areas, clinics, programs, patients, appointments, and consultations now dynamically traverse and respect this hierarchy based on the active user assignments.
