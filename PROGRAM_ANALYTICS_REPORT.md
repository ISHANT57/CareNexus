# PROGRAM ANALYTICS REPORT

**Date:** 2026-06-09  
**Status:** ✅ COMPLETE (existing implementation documented)

---

## Overview

Program analytics are available in two places:

1. **Dashboard drill-down modal** — Click any program → see enrolled patients
2. **Programs page** — Card grid with enrollment count badges

---

## Dashboard Program Drill-Down

**Trigger:** Click program in "Program Enrollment Overview" card OR click bar in "Patients by Program" chart

**Data displayed in modal:**
- Program name
- Summary stats: Total / Active / Completed / Cancelled enrollments
- Full patient list with:
  - Patient name + initials avatar
  - NHS number + clinic name
  - Assigned doctor name
  - Enrollment status badge
  - Link → Patient detail page

**API endpoint used:** `GET /api/reports/program/:id`

```typescript
const { data: programDetails } = useGetProgramDetails(programDrillId, {
  query: { enabled: !!programDrillId }
});
```

---

## Programs Page (`/programs`)

Each program card shows:
- Color-coded icon (rotates through 6 colors)
- Program name
- Description (truncated to 2 lines)
- Creation date
- **Enrollment count badge** (when `enrollmentCount` available in API response)
- Edit / Delete actions (admin only)

---

## Enrollment Statistics (Dashboard)

```
useGetEnrollmentStats() → {
  activeEnrollments: number,
  completedEnrollments: number,
  totalEnrollments: number,
  enrollmentsByProgram: [{ programId, programName, count }]
}
```

---

## Grouping by Clinic/Area/Status (Phase 9 Enhancement)

The drill-down modal currently shows a flat list of enrollments. To group by clinic/area/status, the backend `GET /api/reports/program/:id` response would need to be extended to include grouping metadata. This is tracked as a future enhancement pending the OpenAPI sync sprint.

---

## Outstanding
- Group by Clinic / Area / Status in program drill-down (backend enhancement needed)
- Outcome statistics per program (`GET /api/reports/outcomes-by-program` — backend ready)
- Completion rate chart per program
