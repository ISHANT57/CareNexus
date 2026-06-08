# KNOWN_ISSUES.md — Caremesh PMS

_Last updated: 2026-06-08 (full repository audit)_

---

## Active Issues

### KI-001 — DELETE /api/consultations/:id Does Not Exist
**Status:** Open  
**Severity:** High  
**Module:** Consultation Notes  
**Description:** The Consultation API has GET, POST, and PATCH but no DELETE endpoint. Soft-delete is not possible via API. Records with `deletedAt` set directly on the DB will not appear on GET queries (filter is applied) but there is no way to trigger this from the application.  
**Workaround:** None in current UI.  
**Fix:** See TECHNICAL_DEBT.md TD-002.

---

### KI-002 — Consultation UI Cannot Edit Existing Records
**Status:** Open  
**Severity:** Medium  
**Module:** Patient Detail / Consultation Notes  
**Description:** Consultation cards on the patient-detail page show only read-only data. There is no Edit button. The PATCH `/api/consultations/:id` endpoint is correctly implemented on the server but not wired to the UI.  
**Workaround:** Direct API call via curl or Postman.  
**Fix:** See TECHNICAL_DEBT.md TD-005.

---

### KI-003 — Patient Detail Page Has No Tab Structure
**Status:** Open  
**Severity:** Medium  
**Module:** Patient Detail  
**Description:** The patient-detail page uses a 3-column scrollable layout. As more sections are added, this page becomes difficult to navigate. The `<Tabs>` component is imported in the file but not used.  
**Workaround:** Scroll through the page.  
**Fix:** See TECHNICAL_DEBT.md TD-006.

---

### KI-004 — Appointment Rows Have No "Record Consultation" Shortcut
**Status:** Open  
**Severity:** Medium  
**Module:** Patient Detail / Appointments  
**Description:** A completed appointment should show a "Record Consultation" button so the doctor can immediately begin recording notes. Currently, the user must scroll to the Consultations section and manually select the appointment.  
**Workaround:** Use the "Record" button in the Consultations section.  
**Fix:** See TECHNICAL_DEBT.md TD-007.

---

### KI-005 — Dashboard Missing Consultations-by-Doctor Chart
**Status:** Open  
**Severity:** Medium  
**Module:** Dashboard  
**Description:** The `/api/reports/consultation-stats` endpoint returns `consultationsByDoctor[]` array, but this data is not rendered in any dashboard chart.  
**Workaround:** Access via API directly.  
**Fix:** See TECHNICAL_DEBT.md TD-009.

---

### KI-006 — Reports: 3 Consultation Report Endpoints Not Implemented
**Status:** Open  
**Severity:** Medium  
**Module:** Reports  
**Description:** The following report endpoints are missing from `reports.ts`:
- `GET /api/reports/consultations-by-clinic`
- `GET /api/reports/consultations-by-program`
- `GET /api/reports/follow-ups`  
**Workaround:** None.  
**Fix:** See TECHNICAL_DEBT.md TD-008.

---

### KI-007 — Role Permissions UI Has No Runtime Effect
**Status:** Open  
**Severity:** High  
**Module:** RBAC  
**Description:** The `/roles` page allows managing role permissions (e.g., assigning "CREATE_PATIENT" permission to a role), but the `authenticate` middleware only checks `req.user.role`, not the `role_permissions` table. Changing permissions in UI has no effect on actual access control.  
**Workaround:** RBAC is enforced at the role level (CLINICAL_ROLES etc.) which is sufficient for most cases.  
**Fix:** See TECHNICAL_DEBT.md TD-003.

---

### KI-008 — Files Are Stored on Local Disk (Ephemeral)
**Status:** Open  
**Severity:** Medium  
**Module:** File Uploads  
**Description:** Uploaded files are saved to the server filesystem via `multer`. On Replit or Render, this storage is ephemeral and files will be lost on container restart. File URLs are stored in DB but the files themselves may not persist.  
**Workaround:** Do not rely on file storage for critical patient documents in production.  
**Fix:** See TECHNICAL_DEBT.md TD-010.

---

### KI-009 — Duplicate Appointment Complete Handler in patient-detail.tsx
**Status:** Open  
**Severity:** Low  
**Module:** Patient Detail  
**File:** `artifacts/web/src/pages/patient-detail.tsx` lines 171–184 and 210–219  
**Description:** Two handlers exist for completing an appointment: `handleAppointmentAction(id, 'complete')` and `handleCompleteAppointment(id)`. Both call `completeAppointmentMutation`. The first is used by the Cancel/Complete AlertDialogs; the second appears to be an orphan.  
**Workaround:** No functional impact (both work).  
**Fix:** See TECHNICAL_DEBT.md TD-013.

---

### KI-010 — Appointment Complete Creates PSI Journey Event Instead of CONSULTATION_COMPLETED
**Status:** Open  
**Severity:** Low  
**Module:** Appointments  
**File:** `artifacts/api-server/src/routes/appointments.ts` line 145  
**Description:** When an appointment is completed, the journey event is created with `status: "PSI"` with a comment saying "using PSI as per Plan". The Consultation module's POST `/api/consultations` creates a separate `CONSULTATION_COMPLETED` event. These two can create duplicate or confusing journey entries when both are triggered.  
**Workaround:** None currently.  
**Fix:** Decide: either remove the journey event from `POST /appointments/:id/complete` (since it fires before consultation notes exist), or change it to a distinct status like `APPOINTMENT_COMPLETED`.

---

## Resolved Issues

| ID | Description | Fixed In |
|---|---|---|
| BUG-001 | Recent Activity showed nothing (actor vs user) | Session 2026-06-08 |
| BUG-002 | Patient status badge always wrong colour | Session 2026-06-08 |
| BUG-003 | Register page did not redirect | Verified pre-existing |
| BUG-004 | AuthGuard flash on hard refresh | Session 2026-06-08 |
