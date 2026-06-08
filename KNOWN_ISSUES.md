# KNOWN_ISSUES.md — Caremesh PMS

_Last updated: 2026-06-08 (gap remediation pass 2)_

---

## Active Issues

### KI-008 — Files Are Stored on Local Disk (Ephemeral)
**Status:** Open (Infrastructure dependency)
**Severity:** Medium
**Module:** File Uploads
**Description:** Uploaded files are saved to the server filesystem via `multer`. On Replit or Render, this storage is ephemeral and files will be lost on container restart. File URLs are stored in DB but the files themselves may not persist.
**Workaround:** Do not rely on file storage for critical patient documents in production until cloud storage is configured.
**Fix:** Integrate AWS S3 / Cloudflare R2. Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION` env vars and update `artifacts/api-server/src/routes/files.ts` to use the `@aws-sdk/client-s3` upload.

---

## Resolved Issues

| ID | Description | Fixed In |
|---|---|---|
| BUG-001 | Recent Activity showed nothing (actor vs user) | Session 2026-06-08 |
| BUG-002 | Patient status badge always wrong colour | Session 2026-06-08 |
| BUG-003 | Register page did not redirect | Verified pre-existing |
| BUG-004 | AuthGuard flash on hard refresh | Session 2026-06-08 |
| KI-001 | DELETE /api/consultations/:id missing | 2026-06-08 gap remediation |
| KI-002 | Consultation UI cannot edit existing records | 2026-06-08 gap remediation |
| KI-003 | Patient detail page had no tab structure | 2026-06-08 gap remediation |
| KI-004 | Appointment rows had no "Record Consultation" shortcut | 2026-06-08 gap remediation |
| KI-005 | Dashboard missing Consultations-by-Doctor chart | 2026-06-08 gap remediation |
| KI-006 | Reports: 3 consultation endpoints missing | 2026-06-08 gap remediation |
| KI-007 | Role permissions UI had no runtime effect | 2026-06-08 gap remediation |
| KI-009 | Duplicate handleCompleteAppointment in patient-detail.tsx | 2026-06-08 gap remediation |
| KI-010 | Appointment complete created PSI journey event | 2026-06-08 gap remediation |
