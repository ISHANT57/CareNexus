# TEST_SCENARIOS.md — CareNexus QA scenarios

App: http://localhost:5173 · Credentials: see `DEMO_USERS.md` · Demo password `Demo1234!`
(platform super-admin `admin@northgate.nhs.uk` / `Admin1234!`).

Seeded scale: 20 hospital tenants · 60 areas · 180 clinics · 120 programs · 420 staff users ·
1000 patients · 1000 appointments · 520 consultations · 500 outcomes · 500 tasks ·
1000 program enrollments · 100 outcome metrics · notifications & audit logs per tenant.

---

## 1. RBAC validation (verified live)

| Login | Role | Expected visibility | Verified |
|---|---|---|---|
| `admin@northgate.nhs.uk` | SUPER_ADMIN | All tenants (1008 patients in "All Tenants" mode) | ✅ |
| `admin@apollo.caremesh.demo` | AREA_ADMIN | Only Apollo — all its clinics (50 patients) | ✅ 50 |
| `cadmin.t0.u1@apollo.caremesh.demo` | CLINIC_ADMIN | Only their assigned clinics (~18 patients) | ✅ 18 |
| `dr.t0.u4@apollo.caremesh.demo` | DOCTOR | Only patients assigned to them (~3) | ✅ 3 |
| `ops.t0.u16@apollo.caremesh.demo` | OPERATOR | Only their assigned clinics' workflows (~18) | ✅ 18 |

**Cross-tenant isolation:** log in as `admin@apollo.caremesh.demo`, note you cannot see
Fortis patients/clinics anywhere. A doctor cannot open a patient they aren't assigned to
(returns "not found", never another patient's data).

## 2. Auth / session (regression — patient-detail redirect bug)

1. Log in as any role → open a patient → **Patient Detail must load (no redirect to /login).**
2. Leave the tab idle past the access-token lifetime (or clear `access_token` in localStorage) →
   open a patient → the app silently refreshes the token and the page loads (no logout).
3. Patient detail fires many parallel requests; confirm a single refresh occurs and you stay logged in.

## 3. Dashboard validation (data exists for every dashboard)

| Dashboard | How to view | Has data |
|---|---|---|
| Super-Admin (platform) | `admin@northgate.nhs.uk`, "All Tenants" | ✅ 20 tenants, 1000+ patients |
| Area dashboard | `admin@apollo.caremesh.demo` → Dashboard | ✅ Apollo stats |
| Clinic dashboard | `cadmin.t0.u1@apollo.caremesh.demo` | ✅ clinic-scoped stats |
| Doctor dashboard | `dr.t0.u4@apollo.caremesh.demo` | ✅ assigned patients/appointments |
| Risk scores | any admin → Patients (risk column) / risk-scores API | ✅ patients have risk fields |
| Reports | admin → dashboard widgets (enrollment, appointment, consultation, outcome stats) | ✅ |
| Notifications | doctors have unread notifications (bell) | ✅ 100 |
| Audit logs | `admin@northgate.nhs.uk` → Audit Logs | ✅ 100 |

## 4. Workflow validation (records exist end-to-end)

For any tenant the seed creates a full chain you can inspect on a patient:
1. **Patient registration** — 50 patients/tenant with demographics, diagnosis, area/clinic/program.
2. **Doctor assignment** — every patient has an assigned doctor at their clinic (Care Team).
3. **Appointment scheduling** — SCHEDULED / COMPLETED / CANCELLED / NO_SHOW mix (1000 total).
4. **Consultation** — recorded against completed appointments (520 total).
5. **Outcome tracking** — outcomes vs target (improving / stable / regressing) using outcome metrics (500).
6. **Task assignment** — PENDING / IN_PROGRESS / COMPLETED / OVERDUE, assigned to doctors/operators/staff (500).
7. **Program enrollment** — ACTIVE / COMPLETED / CANCELLED (1000).
8. **Risk scoring** — run "recalculate" on the risk-scores screen/API; patients carry risk score/level.
9. **Notifications** — generated for doctors.

### Manual create flow (exercise the UI)
As `admin@apollo.caremesh.demo`: Patients → New → register a patient (area→clinic cascade) →
open the patient → assign a doctor → schedule an appointment → mark it completed → record a
consultation → record an outcome → create a task → enroll in a program. Each step should toast
success and appear in the relevant tab/list.

## 5. Feature checks
- **User assignment management:** admin → Team Members → open a user → assign/remove clinics & programs.
- **Settings:** account info, appearance (theme), password change; org name editable as super-admin.
- **Empty/error states:** a brand-new doctor with no patients shows an empty state, not an error.
- **Idempotency:** re-running `pnpm --filter @workspace/api-server run demo:seed` does not create duplicates.

## How to run the seed
```bash
cd artifacts/api-server
pnpm run demo:build   # regenerate prisma/demo-data.json (deterministic)
pnpm run demo:seed    # idempotent upsert into the DB
```
