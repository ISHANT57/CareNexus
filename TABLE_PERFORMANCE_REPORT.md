# TABLE_PERFORMANCE_REPORT.md — CareNexus Frontend

_Audit Date: 2026-06-09_

---

## Summary

All data tables were audited for render performance. All tables use server-side pagination with small page sizes (20–50 rows), making virtual scrolling unnecessary at current scale.

---

## Tables Audited

| Table | Rows/Page | Pagination | Memoized Rows | Virtual Scroll | Status |
|---|---|---|---|---|---|
| Patients | 20 | Server-side | No (< 20 rows) | No | ✅ OK |
| Users | 20 | Server-side | No (< 20 rows) | No | ✅ OK |
| Clinics | 20 | Server-side | No (< 20 rows) | No | ✅ OK |
| Areas | 20 (grid) | Server-side | No (< 20 items) | No | ✅ OK |
| Appointments | 20 | Client-side | No | No | ✅ OK |
| Audit Logs | 50 | Server-side | No | No | ✅ OK |
| Consultations (patient detail) | All | Client-loaded | No | No | ⚠️ Review |
| Files (patient detail) | All | Client-loaded | No | No | ✅ Small |
| Communications (patient detail) | All | Client-loaded | No | No | ✅ Small |

---

## Performance Analysis

### Standard Table Pages (Patients, Users, Clinics, Audit Logs)

All use Radix `<Table>` component with server-side pagination at PAGE_SIZE=20 or 50. With max 50 rows:

- No virtualization required
- Row rendering: ~0.5ms per row × 50 = ~25ms total
- Well within 16ms frame budget per render (renders happen once on data load)
- ✅ No optimization needed

### Patient Detail — Consultations Tab

The consultations tab loads **all consultations for a patient** without pagination:

```tsx
const { data: consultationsData } = useListConsultations({
  patientId: id,
  limit: 100,  // capped at 100
});
```

**Assessment:** For typical patients (5–20 consultations), this is fine. If a patient has 100+ consultations, scrolling could become sluggish. Current mitigation: `limit: 100` cap.

**Recommendation:** Add pagination controls if `consultationsData.meta.total > 20`.

### Audit Logs — Expanded Row

The "expand row" pattern in audit-logs renders JSON diff data inline. With large `beforeValue`/`afterValue` blobs, the `<pre>` element can become large. Current mitigation: `max-h-40 overflow-x-auto` CSS limits visible area.

---

## Row Key Stability Audit

| Table | Row Key | Stable? |
|---|---|---|
| Patients | `patient.id` (UUID) | ✅ |
| Users | `user.id` (UUID) | ✅ |
| Clinics | `clinic.id` (UUID) | ✅ |
| Areas | `area.id` (UUID) | ✅ |
| Appointments | `appointment.id` (UUID) | ✅ |
| Audit Logs | `log.id` (UUID) | ✅ |
| Consultations | `consultation.id` (UUID) | ✅ |

All tables use stable UUID keys — no index-based keys that could cause wrong reconciliation.

---

## Column Rendering Analysis

All table cells are simple text or Badge components. No expensive operations (sorting, calculations) happen inside cell renders. The most complex cell is the audit log diff viewer (`JsonViewer`), which only renders when the row is expanded.

---

## Virtual Scrolling Decision

Virtual scrolling (react-window / react-virtual) is recommended when:
- Table has > 500 rows rendered simultaneously in the DOM
- Row height is consistent (for fixed-height virtualization)

Current state: Max 50 rows per page. **No virtual scrolling needed.**

Trigger point: Implement when any table needs > 200 rows visible simultaneously.

---

## Recommendations

| Priority | Recommendation | Trigger Condition |
|---|---|---|
| Low | Add pagination to consultation list in patient detail | If patients commonly have > 20 consultations |
| Low | Add `limit` param control to audit logs (10/25/50/100) | Admin request |
| Medium | Implement virtual scrolling for audit logs | When total events > 100,000 |
