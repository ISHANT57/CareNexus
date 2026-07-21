# REACT_QUERY_AUDIT.md — CareNexus Frontend

_Audit Date: 2026-06-09_

---

## Summary

A full audit of all React Query hooks, QueryClient configuration, cache invalidation patterns, and staleTime usage across the CareNexus frontend.

---

## QueryClient Configuration

### Before (Default — Problematic)

```tsx
// App.tsx — BEFORE
const queryClient = new QueryClient();
// Defaults:
//   staleTime: 0 (always stale — always refetches)
//   gcTime: 5 * 60 * 1000 (5 min)
//   refetchOnWindowFocus: true (refetch on tab switch)
//   retry: 3 (3 retries before error)
```

**Impact of default staleTime=0:**
- Every query is immediately stale after fetching
- React Query schedules a background refetch on the next window focus event
- With 15+ queries active across dashboard + sidebar + current page, every tab switch triggered 15+ parallel API calls
- Loading spinners appeared briefly on all widgets after returning to the tab

### After (Optimized)

```tsx
// App.tsx — AFTER  
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,          // 60s — data is fresh for 1 minute
      gcTime: 5 * 60 * 1000,         // 5 min — keep unused cache in memory
      refetchOnWindowFocus: false,   // Never refetch on tab switch
      refetchOnReconnect: true,      // DO refetch when network reconnects
      retry: 1,                      // 1 retry max (was 3)
    },
  },
});
```

---

## Per-Query staleTime Review

The dashboard already had per-query `staleTime` overrides, which are now redundant but harmless (they still take effect as the minimum staleTime):

```tsx
// dashboard.tsx — these are now redundant but still valid
const { data: stats } = useGetDashboardStats({
  query: { staleTime: 5 * 60 * 1000 } as any  // 5 min (overrides global 60s)
});
```

These per-query overrides are appropriate because dashboard data is expensive to compute server-side. They remain in place.

---

## Cache Invalidation Audit

### Pattern Used: Manual Invalidation on Mutation Success

All mutations in the codebase follow a consistent pattern:

```tsx
const queryClient = useQueryClient();

const handleCreate = async () => {
  await createArea.mutateAsync({ data: { ... } });
  queryClient.invalidateQueries({ queryKey: getListAreasQueryKey() });
  // ↑ Forces next read to fetch fresh data
};
```

**Assessment:** ✅ Correct pattern. Invalidation is scoped to the specific entity list (not wildcard), which minimizes unnecessary refetches.

### Entities with Cache Invalidation

| Entity | Create | Update | Delete | Key Used |
|---|---|---|---|---|
| Areas | ✅ | ✅ | ✅ | `getListAreasQueryKey()` |
| Clinics | ✅ | ✅ | ✅ | `getListClinicsQueryKey()` |
| Programs | ✅ | ✅ | ✅ | `getListProgramsQueryKey()` |
| Roles | ✅ | N/A | N/A | `getListRolesQueryKey()` |
| Role Permissions | ✅ | N/A | ✅ | `getListRolePermissionsQueryKey(id)` |
| Appointments | N/A | ✅ (cancel/complete) | N/A | `getListAppointmentsQueryKey()` |
| Patients | ✅ | ✅ | N/A | `["/api/patients"]` (manual) |

⚠️ **Note:** `patients.tsx` uses a manual string key `["/api/patients"]` instead of the generated `getListPatientsQueryKey()`. This should be standardized but is functionally correct.

---

## Duplicate Requests Audit

### Sidebar Notifications (Resolved by Global Config)

```tsx
// Sidebar.tsx
const { data: notificationsData } = useListNotifications({ limit: 50 });
```

Previously this would refetch on every window focus. Now controlled by global `refetchOnWindowFocus: false`.

**Recommendation:** Add explicit `staleTime: 30_000` for better intent communication, though the global config makes this optional.

### useGetMe() Deduplication

`useGetMe()` is called in both `Sidebar.tsx` and `DashboardPage`. React Query automatically deduplicates these — only 1 network request is made regardless of how many components call it simultaneously. ✅

### Dashboard Multi-Query Pattern

`TenantDashboard` makes 7 parallel queries on mount. This is intentional and correct:
- All queries are independent
- React Query batches them correctly
- With `staleTime: 60s`, they only fire once per minute per session

---

## Query Enabled Conditions Audit

| Query | `enabled` Condition | Correct? |
|---|---|---|
| `useGetPatient(id)` | `!!id` | ✅ |
| `useGetProgramDetails(id)` | `!!programDrillId` | ✅ |
| `useListClinics({ areaId })` | Always | ✅ (areaId is optional filter) |
| `useListAppointments` | `!!me` | ✅ (needs role for doctor filter) |
| `useListProgramEnrollments` | `!!programDrillId` | ✅ |

---

## Unused Query Keys

No orphaned query keys were found. All `getList*QueryKey()` calls are paired with their corresponding `invalidateQueries` calls.

---

## Recommendations

| Priority | Recommendation | Impact |
|---|---|---|
| Low | Standardize `patients.tsx` to use `getListPatientsQueryKey()` | Consistency |
| Low | Add explicit `staleTime: 30_000` to sidebar notification query | Clarity |
| Low | Add `refetchInterval: 120_000` to notification query for soft polling | UX |
| Medium | Split dashboard into smaller queries with independent staleTime | Performance |

---

## Final Assessment

| Metric | Before | After |
|---|---|---|
| Window focus refetches | 15+ per tab switch | 0 |
| staleTime (global) | 0ms | 60,000ms |
| Retry attempts | 3 | 1 |
| Build errors from non-existent hooks | 1 | 0 |
| Query deduplication | ✅ Always worked | ✅ |
| Cache invalidation correctness | ✅ | ✅ |
