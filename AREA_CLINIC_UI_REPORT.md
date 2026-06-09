# AREA → CLINIC UI REPORT

**Date:** 2026-06-09  
**Status:** ✅ COMPLETE

---

## Overview

The Area → Clinic cascade relationship is fully implemented in the frontend. When an area is selected, only clinics belonging to that area are shown in the clinic dropdown.

---

## Implementation

### Core Hook: `useAreaClinicCascade`
**File:** `artifacts/web/src/hooks/use-area-clinic-cascade.ts`

```typescript
// Fetches all areas (≤500)
const { data: areasData } = useListAreas({ limit: 500 });

// Fetches clinics ONLY for selected area — backend supports ?areaId=
const { data: clinicsData } = useListClinics(
  { areaId: areaId || undefined, limit: 500 },
  { query: { enabled: !!areaId } }
);

// When area changes, clinic is automatically reset
const setAreaId = (newAreaId: string) => {
  setAreaIdInternal(newAreaId);
  setClinicId(""); // Reset clinic whenever area changes
};
```

---

## Pages with Area → Clinic Cascade

| Page | Implementation |
|------|---------------|
| `patients.tsx` | ✅ Full cascade filter panel — `filterArea` resets `filterClinic` on change; clinics fetched with `?areaId=` |
| `patient-new.tsx` | ✅ Uses `useAreaClinicCascade` hook |
| `clinics.tsx` | ✅ Area filter applied; clinic list filtered by area |
| `patient-detail.tsx` | ✅ Area and clinic displayed; assignment uses patient's existing clinic/area |

---

## Cascade Behaviour

1. **User selects Area** → clinic dropdown resets, API call made with `?areaId=<id>`
2. **Clinic dropdown** shows only clinics in that area
3. **Clinic count indicator** shown ("3 in area") on filter label
4. **If no area selected** → clinic placeholder says "Select area first"
5. **Area changes** → clinic selection cleared automatically

---

## Backend Support
The backend `GET /api/clinics?areaId=<uuid>` filter is already implemented and working. No backend changes were needed.

---

## SearchableSelect Component
All area and clinic dropdowns use the `SearchableSelect` component which provides:
- Fuzzy text search within options
- Clear/reset button
- Loading states
- Keyboard navigation
- Empty state message

---

## Example (Patients Filter Panel)
```
[Status ▼] [Program ▼] [Area ▼] [Clinic ▼]
                          ↓
                  Select "Kurla East"
                          ↓
               Clinic dropdown shows only
               clinics in Kurla East area
```
