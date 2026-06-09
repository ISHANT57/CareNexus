# PATIENT DETAIL REPORT

**Date:** 2026-06-09  
**File:** `artifacts/web/src/pages/patient-detail.tsx`  
**Status:** ✅ TABS ALREADY IMPLEMENTED

---

## Overview

The patient detail page (`patient-detail.tsx`) already implements a full tabbed layout as specified. The 70KB file contains comprehensive functionality across 7 tabs.

---

## Tab Structure

```
[Overview] [Journey] [Appointments] [Consultations] [Outcomes] [Files] [Communications]
```

### Tab 1: Overview
- **Contact Information card** — Mobile, email, full address
- **Care Details card** — Program, Clinic, Area, Registration date
- **Program Enrollments card** — List with enroll/complete/cancel actions
- **Care Team sidebar** — Assigned doctors with remove action

### Tab 2: Journey
- **Timeline** — Chronological journey events (NEW → PSI → DISCHARGE → MEDICATION_REQUIRED)
- **Record Event dialog** — Create new journey events with status + notes
- Events ordered newest-first with formatted timestamps

### Tab 3: Appointments
- Appointment cards with date, doctor, clinic, duration, status
- **Schedule Appointment dialog** — Doctor + clinic select, date + time inputs
- **Edit Appointment dialog** — Reschedule, change duration, add notes
- **Complete / Cancel** actions per scheduled appointment
- Record Consultation shortcut per completed appointment

### Tab 4: Consultations
- Consultation history cards with all clinical fields
- Chief complaint, symptoms, observations, diagnosis, treatment plan, medications, follow-up instructions
- **Record Consultation dialog** — Links to completed appointments
- **Edit Consultation dialog** — Full field editing (PATCH /api/consultations/:id)

### Tab 5: Outcomes
- Placeholder for Phase 1 Outcomes UI (requires OpenAPI sync for `/api/outcomes`)

### Tab 6: Files
- File upload dialog (PDF, images, documents)
- File list with download and delete actions

### Tab 7: Communications
- SMS message history with status badges (QUEUED / SENT / DELIVERED / FAILED)
- Send SMS dialog with message composer
- Character count and patient mobile number display

---

## Patient Header (Always Visible)
- Patient avatar (initials circle)
- Full name with title prefix
- NHS number (monospace badge)
- Gender + Date of Birth
- **Status dropdown** — ACTIVE / INACTIVE with visual badge

---

## Quick Action Dialogs
All dialogs use shadcn/ui Dialog with DialogHeader and DialogFooter for consistency.

---

## Data Queries
All queries are lazy-loaded (`enabled: !!id && !isNew`) to prevent unnecessary API calls:
- Patient data
- Journey events
- Doctor assignments
- SMS communications
- File uploads
- Program enrollments
- Appointments
- Clinics list (for appointment scheduling)
- Consultations

---

## Outstanding
- **Phase 1 Outcomes tab** — Backend ready, needs OpenAPI sync + UI build
- **Phase 2 Care Tasks tab** — Backend ready, needs OpenAPI sync + UI build
