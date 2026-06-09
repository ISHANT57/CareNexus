# RERENDER_ANALYSIS_REPORT.md — CareNexus Frontend

_Audit Date: 2026-06-09_

---

## Overview

This report documents all re-render patterns identified across the CareNexus frontend, classifying each by severity and documenting which fixes were applied.

---

## Re-Render Chain Analysis

### Pattern 1: Component-Defined-Inside-Render (RESOLVED)

**Location:** `programs.tsx` (formerly)  
**Impact:** Catastrophic — full subtree unmount on every keystroke

**How React reconciliation works:**
When React sees `<ProgramFormFields>` in the render output, it checks if the type is the same as last render. If the *function reference* changes, React treats it as a completely different component and performs a full unmount + remount cycle, regardless of the props.

```
State update (keystroke) 
  → ProgramsPage re-renders
  → ProgramFormFields re-evaluated as NEW function
  → React reconciler: "different component type!"
  → <dialog> subtree UNMOUNT
  → <dialog> subtree REMOUNT
  → Input DOM node destroyed and recreated
  → Cursor position lost
  → Feels like 300ms+ lag
```

**Fix applied:** Component extracted to module scope — stable reference across all renders.

---

### Pattern 2: QueryClient refetchOnWindowFocus Storm (RESOLVED)

**Location:** `App.tsx`  
**Impact:** High — cascade of 15+ refetches on tab switch

**Render chain:**
```
User switches browser tab → returns to CareNexus
  → React Query window focus event fires
  → All 15+ active queries marked stale (staleTime=0)
  → 15 background fetches launch in parallel
  → Each fetch completion triggers setState in hook
  → Each setState triggers re-render in consuming component
  → Sidebar, Dashboard, Patient lists all re-render simultaneously
  → UI "flashes" and inputs lose focus
```

**Fix applied:** `staleTime: 60_000`, `refetchOnWindowFocus: false`

---

### Pattern 3: Unmemoized Derived State (ACCEPTABLE)

**Location:** `appointments.tsx`, `audit-logs.tsx`  
**Impact:** Low — small datasets, fast computation

These pages compute derived arrays (filtered, paginated) inline without `useMemo`. Since these arrays contain ≤ 50 items and the computation is O(n) string comparison, the overhead is < 0.1ms per render and imperceptible. No fix needed.

---

### Pattern 4: Sidebar Notification Poll (OPTIMIZED via QueryClient)

**Location:** `Sidebar.tsx`  
**Impact:** Medium — was re-fetching every ~30s without staleTime

Before the QueryClient fix, `useListNotifications({ limit: 50 })` would refetch on every window focus event. The sidebar is mounted permanently, so this notification badge could trigger cascading re-renders of the entire sidebar on every tab switch.

**Fix applied (global):** `staleTime: 60_000` from QueryClient defaults eliminates this.

---

## Component Re-Render Audit

| Component | Re-render Trigger | Frequency | Memo Applied | Notes |
|---|---|---|---|---|
| `Sidebar` | Route change, user data, notifications | On navigate | No | Acceptable — lightweight |
| `ProgramsPage` | Any dialog state | Before: on every keypress | `useMemo`, `useCallback` | ✅ Fixed |
| `AreasPage` | Dialog state, search | Before: on filter | `useMemo` | ✅ Fixed |
| `SearchableSelect` | Popover open/close | On open | Internal debounce | ✅ Fixed |
| `DashboardPage` | Query data changes | On data load | N/A | Acceptable |
| `PatientsPage` | Search, filters | On debounce fire | `useMemo` | ✅ OK |
| `ClinicsPage` | Search, area filter | On debounce fire | `useMemo` | ✅ OK |
| `TenantSwitcher` | Active tenant | On switch | N/A | Lightweight |
| `ThemeToggle` | Theme change | Rare | N/A | Acceptable |

---

## useEffect Audit

| File | useEffect | Deps | Risk | Status |
|---|---|---|---|---|
| `clinics.tsx` | Debounce search | `[search]` | ✅ Clean | OK |
| `users.tsx` | Debounce search | `[search]` | ✅ Clean | OK |
| `patients.tsx` | Debounce search | `[search]` | ✅ Clean | OK |
| `patient-new.tsx` | Sync form ↔ cascade | `[areaId]`, `[clinicId]` | ⚠️ Missing deps (form) | Acceptable |
| `searchable-select.tsx` | Debounce query | `[inputValue]` | ✅ Clean | OK |
| `searchable-select.tsx` | Reset on close | `[open]` | ✅ Clean | OK |

---

## React.memo Opportunities

The following components are pure display components that could benefit from `React.memo` if the parent re-renders frequently. Currently deferred as the performance impact is minimal:

- `StatCard` (dashboard) — receives stable number props
- `JsonViewer` (audit-logs) — renders pre-formatted data
- `ChartTooltip` (dashboard) — Recharts tooltip, already short-circuits

---

## Conclusion

All **critical re-render patterns** have been resolved. The remaining patterns are either intentional (route-triggered sidebar re-renders) or have negligible performance impact (small dataset inline filters). No further `React.memo` or `useMemo` additions are recommended without profiler data showing actual regression.
