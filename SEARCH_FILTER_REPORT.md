# SEARCH & FILTER REPORT

**Date:** 2026-06-09  
**Status:** ✅ COMPLETE (audited and verified)

---

## Overview

Global search and filtering is implemented across all major list pages. Each page follows a consistent pattern:

1. **Search input** — debounced text search
2. **Filter panel** — collapsible with `SearchableSelect` dropdowns  
3. **Active filter badges** — count indicator + clear button
4. **Pagination** — with page/total display

---

## Page-by-Page Audit

### Patients (`/patients`)
| Feature | Status |
|---------|--------|
| Search by name, NHS number, mobile | ✅ Debounced 400ms |
| Filter by Status | ✅ SearchableSelect |
| Filter by Program | ✅ SearchableSelect |
| Filter by Area | ✅ SearchableSelect |
| Filter by Clinic (cascade) | ✅ SearchableSelect — resets when area changes |
| Active filter count badge | ✅ |
| Clear all filters | ✅ |
| Pagination (20/page) | ✅ |
| Empty state | ✅ With CTA |
| Total count display | ✅ |

### Programs (`/programs`)
| Feature | Status |
|---------|--------|
| Search by name (client-side) | ✅ |
| Filter count badge | ✅ |
| Pagination (20/page) | ✅ |
| Empty state | ✅ |

### Areas (`/areas`)
| Feature | Status |
|---------|--------|
| Search by name | ✅ |
| Pagination | ✅ |
| Empty state | ✅ |

### Clinics (`/clinics`)
| Feature | Status |
|---------|--------|
| Search by name | ✅ |
| Filter by Area | ✅ |
| Pagination | ✅ |
| Empty state | ✅ |

### Users (`/users`)
| Feature | Status |
|---------|--------|
| Search by name, email | ✅ |
| Pagination | ✅ |
| Empty state | ✅ |

### Appointments (`/appointments`)
| Feature | Status |
|---------|--------|
| Filter by Status | ✅ Select dropdown |
| Filtered count badge | ✅ |
| Pagination (20/page) | ✅ |
| Empty state | ✅ |

### Audit Logs (`/audit-logs`)
| Feature | Status |
|---------|--------|
| Filter by entity type | ✅ |
| Filter by action | ✅ |
| Date range filter | ✅ |
| Pagination | ✅ |
| Empty state | ✅ |

---

## SearchableSelect Component
Located at `artifacts/web/src/components/ui/searchable-select.tsx`

Features:
- Popover-based dropdown with search input
- Fuzzy text matching
- Clear/reset button (when `clearable` prop)
- Loading skeleton
- Empty state message
- Keyboard navigation

---

## Filter Architecture Pattern

```typescript
// Standard pattern across all list pages
const [filterX, setFilterX] = useState("");
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const t = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, 400);
  return () => clearTimeout(t);
}, [search]);
```
