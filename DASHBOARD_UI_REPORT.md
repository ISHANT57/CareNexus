# DASHBOARD UI REPORT

**Date:** 2026-06-09  
**File:** `artifacts/web/src/pages/dashboard.tsx`  
**Status:** ✅ REVIEWED — Existing dashboard is comprehensive

---

## Current Dashboard State

The dashboard was already in a strong state from prior work. Key features present:

### Primary KPI Row (6 cards)
- Total Patients → links to `/patients`
- Active Enrollments → links to `/programs`
- Scheduled Appointments → links to `/appointments`
- Consultations (this month) → links to `/patients`
- Clinics + Programs count → links to `/clinics`
- Pending Communications → links to `/notifications`

### Secondary Stats Row (6 mini-cards)
- Completed Appointments
- Cancelled Appointments
- Completed Enrollments
- New Patients This Month
- Outcomes Recorded
- Success Rate (with progress bar)

### Charts
- **Patients by Status** — Interactive donut pie chart; click segment → navigate to `/patients?status=X`
- **Patients by Program** — Interactive bar chart; click bar → triggers program drill-down modal
- **Top Clinics by Appointments** — Bar chart → navigates to `/clinics`
- **Consultations by Doctor** — Bar chart showing top clinical staff by volume

### Tables
- **Clinic Performance Overview** — Paginated table with patients, appointments, enrollments per clinic

### Program Analytics
- **Program Enrollment Overview** — Clickable program rows triggering drill-down modal
- **Outcome Analytics** — SVG progress ring showing improvement percentage

### Activity Feed
- **Recent Activity** — Last 8 audit events with actor, action, entity type, timestamp, badge

### Program Drill-down Modal
- Opened by clicking program bar or enrollment row
- Shows total/active/completed/cancelled enrollments
- Lists all enrolled patients with links to their detail pages

### Global Dashboard (SUPER_ADMIN only)
- Separate `GlobalDashboard.tsx` component for super admin cross-tenant view

---

## Greeting Banner
- Dynamic greeting (Good morning/afternoon/evening)
- Date display
- CareNexus blue gradient banner

---

## Navigation Flow (All Cards Clickable)
| Card | Destination |
|------|-------------|
| Total Patients | `/patients` |
| Active Enrollments | `/programs` |
| Scheduled Appointments | `/appointments` |
| Consultations | `/patients` |
| Clinics | `/clinics` |
| Pending Comms | `/notifications` |
| Pie chart segments | `/patients?status=X` |
| Program bars | Drill-down modal |

---

## Outstanding (Post Phase-1)
- Risk Scoring widgets (Phase 5 — requires OpenAPI sync for `/api/risk-scores`)
- Care Tasks dashboard widget (Phase 2 — requires OpenAPI sync for `/api/tasks`)
