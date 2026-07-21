# AREA → CLINIC MAPPING REPORT

**Project:** CareNexus PMS  
**Date:** June 2026  
**Scope:** Global Area → Clinic cascading dropdown implementation  
**Status:** ✅ COMPLETE

---

## 1. Problem Statement

When a user selected an Area (e.g. "Kurla East") in any form containing a Clinic dropdown, **all clinics across all areas were shown** — not just clinics belonging to that area. This violated the core data integrity rule that Clinics belong to exactly one Area via the `areaId` foreign key.

**Impact:** Incorrect clinic-patient assignments, appointment scheduling errors, data quality issues across all reports.

---

## 2. Database Relationship

```
Area (1) ──── (N) Clinic
  id                areaId (FK → areas.id)
  name              name
  tenantId          tenantId
                    deletedAt
```

The `Clinic` model has always had `areaId` as a required foreign key. The relationship was enforced at the database level but **not enforced in the frontend dropdowns**.

---

## 3. Backend API (Already Correct)

The backend `GET /api/clinics` route **already supported** filtering by `areaId`:

```typescript
// clinics.ts — Line 23-29
const areaId = req.query["areaId"] as string | undefined;
const where = {
  tenantId: req.tenantId!,
  deletedAt: null,
  ...(areaId ? { areaId } : {}),    // ✅ Server-side area filter
};
```

**No backend changes were required.** The entire bug was a frontend issue.

---

## 4. Fix Implementation

### 4.1 Shared Hook — `use-area-clinic-cascade.ts`

Created a reusable hook that encapsulates the cascade logic:

```typescript
// e:/Caremesh-Platform/artifacts/web/src/hooks/use-area-clinic-cascade.ts
export function useAreaClinicCascade(initialAreaId = "", initialClinicId = "") {
  const [areaId, setAreaIdInternal] = useState(initialAreaId);
  const [clinicId, setClinicId] = useState(initialClinicId);

  // Clinics fetched ONLY for selected area
  const { data: clinicsData } = useListClinics(
    { areaId: areaId || undefined, limit: 500 },
    { query: { enabled: !!areaId } }
  );

  // Resetting clinicId when area changes
  const setAreaId = (newAreaId: string) => {
    setAreaIdInternal(newAreaId);
    setClinicId("");
  };
  ...
}
```

### 4.2 Files Modified

| File | Change | Type |
|------|--------|------|
| `artifacts/web/src/hooks/use-area-clinic-cascade.ts` | Created shared cascade hook | **NEW** |
| `artifacts/web/src/pages/patient-new.tsx` | Full cascade implementation with loading states | MODIFIED |
| `artifacts/web/src/pages/patient-detail.tsx` | Cascade in appointment scheduling dialog | MODIFIED |
| `artifacts/web/src/pages/patients.tsx` | Added Area filter, cascade resets Clinic filter | MODIFIED |
| `artifacts/web/src/pages/clinics.tsx` | Fixed server-side `areaId` + `q` params (was ignored) | MODIFIED |

### 4.3 UX Improvements Per Page

#### Patient Registration (`patient-new.tsx`)
- Area selector shown first (Step 1)
- Clinic dropdown disabled until area is selected
- Clinic dropdown shows `"Select area first"` when no area chosen
- Clinic count shown: `(3 available)`
- Clinic resets when area changes

#### Patient Detail — Appointment Dialog (`patient-detail.tsx`)
- Area selector added above Clinic selector
- Patient's own area pre-shown at top of area list for convenience
- Clinics fetched scoped to selected area
- Clinic resets when area changes

#### Patients List Filter (`patients.tsx`)
- New Area filter added (4-column grid: Status | Program | Area | Clinic)
- Clinic filter resets when Area changes
- Active filter count now includes Area
- Clinic options scoped to selected area when area filter is active
- Clinic shows `"Select area first"` placeholder when no area is selected
- Clinic label shows `"N in area"` count badge

#### Clinics Page (`clinics.tsx`)
- **Bug fixed:** `useListClinics()` was called without `areaId` or `q` params — area filter had no server-side effect
- Now passes `areaId: filterArea || undefined` and `q: debouncedSearch || undefined`

---

## 5. APIs Used

| Endpoint | Query Params | Purpose |
|---------|-------------|---------|
| `GET /api/areas` | `limit=500` | Fetch all areas for dropdowns |
| `GET /api/clinics` | `areaId=<uuid>&limit=500` | Fetch clinics filtered by area |
| `GET /api/clinics` | `areaId=<uuid>&q=<search>&page=<n>&limit=20` | Clinics page with area filter + search |

---

## 6. React Query Cache Behaviour

- Areas: fetched once on page load, cached by React Query default (0ms staleTime means refetched on window focus)
- Clinics: fetched per-areaId, each area's clinics cached separately under key `["/api/clinics", { areaId }]`
- When area changes → new query fired with new `areaId` → old clinics discarded from local state

---

## 7. Test Cases

| Test | Expected Result | Status |
|------|----------------|--------|
| Select "Kurla East" area | Only Kurla East clinics shown | ✅ Logic implemented |
| Select "Kurla West" area | Only Kurla West clinics shown | ✅ Logic implemented |
| Change area after selecting clinic | Clinic resets to empty | ✅ Implemented |
| Open patient registration with no area | Clinic dropdown disabled | ✅ Implemented |
| Clinics page — select area filter | Only clinics from that area returned | ✅ Fixed (server-side) |
| Patients filter — select area, then clinic | Only area's clinics in clinic dropdown | ✅ Implemented |
| Appointment dialog | Area→Clinic cascade | ✅ Implemented |
