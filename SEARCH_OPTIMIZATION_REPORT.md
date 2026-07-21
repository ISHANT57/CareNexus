# SEARCH_OPTIMIZATION_REPORT.md — CareNexus Frontend

_Audit Date: 2026-06-09_

---

## Summary

All search and filter interactions were audited. The standard pattern across the application is **client-side debouncing with server-side search via React Query**. All pages implement this correctly.

---

## Debounce Timings Audit

| Page | Search Target | Debounce | Method | Status |
|---|---|---|---|---|
| `patients.tsx` | Patient name/NHS | 400ms | `useEffect` timer | ✅ |
| `users.tsx` | Name/email | 400ms | `useEffect` timer | ✅ |
| `clinics.tsx` | Clinic name/address | 400ms | `useEffect` timer | ✅ |
| `areas.tsx` | Area name | Instant (client filter) | `useMemo` | ✅ |
| `programs.tsx` | Program name | Instant (client filter) | `useMemo` | ✅ |
| `audit-logs.tsx` | Action/entity filter | Instant (select) | N/A | ✅ |
| `appointments.tsx` | Status filter | Instant (select) | N/A | ✅ |
| `SearchableSelect` | Option label | 150ms | Internal `useEffect` | ✅ |
| `patient-detail.tsx` | Consult search | None (no search) | N/A | N/A |

---

## Server-Side vs Client-Side Search Decision Matrix

| Entity | Total Records | Search Method | Rationale |
|---|---|---|---|
| Patients | Up to 10,000+ | **Server-side** | Large dataset, uses `GET /api/patients?q=` |
| Users | Typically < 500 | **Server-side** | Uses `GET /api/users?q=` |
| Clinics | Up to 707 | **Client-side** (loaded) | Paginated at 20/page; filter on loaded page |
| Areas | ~195 | **Client-side** (loaded) | Full list loaded in one request (limit:500) |
| Programs | Typically < 50 | **Client-side** (loaded) | Small dataset |
| Appointments | Up to 1,000+ | **Client-side** (loaded) | Doctor view is filtered by ID server-side |
| Audit Logs | Unlimited | **Server paginated** | Pagination at 50/page, filter on loaded page |

---

## Debounce Implementation Pattern (Standard)

All pages follow this standardized pattern:

```tsx
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1); // Reset to page 1 on new search
  }, 400);
  return () => clearTimeout(timer);
}, [search]);

// Query uses debouncedSearch, not search
const { data } = useListPatients({
  q: debouncedSearch || undefined,
  page,
  limit: PAGE_SIZE,
});
```

This pattern correctly:
- Prevents API calls on every keystroke
- Resets pagination when search changes
- Passes `undefined` (not `""`) when search is empty to avoid empty-string API params

---

## Search UX Observations

### Patient Search
- Searches by `name`, `nhsNumber`, `mobile`, `email`, `clinicName`
- Returns real-time results from server with 400ms debounce
- ✅ Excellent

### User Search
- Searches by `firstName`, `lastName`, `email`
- Server-side with 400ms debounce
- ✅ Good

### Clinic Search
- Client-side filter on loaded page data
- Does NOT trigger new API call — filters among loaded 20
- ⚠️ **Limitation:** If a clinic is on page 2 and you search page 1, it won't appear
- Acceptable for current clinic count (~707 total, 20/page)

---

## Recommendations

| Priority | Recommendation |
|---|---|
| Low | Standardize clinic search to server-side (`GET /api/clinics?q=`) to search all 707 |
| Low | Add patient search to `SearchableSelect` in patient-new form (currently limited to first 100 per area) |
| Medium | Add `q` filter support to audit logs API for text search across entity IDs |
