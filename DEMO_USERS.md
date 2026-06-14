# DEMO_USERS.md — How to log in as every role

**App:** http://localhost:5173  ·  All logins are real accounts in the database.

## Passwords
| Account type | Password |
|---|---|
| Platform **SUPER_ADMIN** (`admin@northgate.nhs.uk`) | `Admin1234!` |
| **Every** generated demo user (all 20 hospital tenants, all roles) | `Demo1234!` |

---

## One working login per role (copy–paste)

| Role | Email | Password | What they see |
|---|---|---|---|
| **SUPER_ADMIN** | `admin@northgate.nhs.uk` | `Admin1234!` | All tenants (use the tenant switcher; "All Tenants" = platform view) |
| **AREA_ADMIN** | `admin@apollo.caremesh.demo` | `Demo1234!` | All of Apollo Hospital (its areas/clinics) — 50 patients |
| **CLINIC_ADMIN** | `cadmin.t0.u1@apollo.caremesh.demo` | `Demo1234!` | Only their assigned clinics — ~18 patients |
| **DOCTOR** | `dr.t0.u4@apollo.caremesh.demo` | `Demo1234!` | Only patients assigned to them — ~3 patients |
| **OPERATOR** | `ops.t0.u16@apollo.caremesh.demo` | `Demo1234!` | Only their assigned clinics' workflows — ~18 patients |
| **STAFF** | `staff.t0.u19@apollo.caremesh.demo` | `Demo1234!` | Tasks/data for their assigned clinic |

> Verified live: AREA_ADMIN→50 patients · CLINIC_ADMIN→18 · DOCTOR→3 · OPERATOR→18 · SUPER_ADMIN→1008 (all tenants). This is RBAC working correctly.

---

## Org-admin login for all 20 hospital tenants

Every tenant has an Area Admin at **`admin@<brand>.caremesh.demo`** (password `Demo1234!`):

| Hospital | Login |
|---|---|
| Apollo Hospital | `admin@apollo.caremesh.demo` |
| Fortis Healthcare | `admin@fortis.caremesh.demo` |
| Lilavati Hospital | `admin@lilavati.caremesh.demo` |
| Kokilaben Hospital | `admin@kokilaben.caremesh.demo` |
| Wockhardt Hospitals | `admin@wockhardt.caremesh.demo` |
| Nanavati Max Hospital | `admin@nanavati.caremesh.demo` |
| Hinduja Hospital | `admin@hinduja.caremesh.demo` |
| Jaslok Hospital | `admin@jaslok.caremesh.demo` |
| Breach Candy Hospital | `admin@breachcandy.caremesh.demo` |
| Bombay Hospital | `admin@bombay.caremesh.demo` |
| Saifee Hospital | `admin@saifee.caremesh.demo` |
| Holy Family Hospital | `admin@holyfamily.caremesh.demo` |
| Hiranandani Hospital | `admin@hiranandani.caremesh.demo` |
| Global Hospital | `admin@global.caremesh.demo` |
| S. L. Raheja Hospital | `admin@slraheja.caremesh.demo` |
| Reliance Foundation Hospital | `admin@reliance.caremesh.demo` |
| Bhatia Hospital | `admin@bhatia.caremesh.demo` |
| Surya Hospital | `admin@surya.caremesh.demo` |
| Masina Hospital | `admin@masina.caremesh.demo` |
| Cloudnine Hospital | `admin@cloudnine.caremesh.demo` |

---

## Email patterns (for any tenant / any user)

Replace `<brand>` with the hospital short-name (the part before `.caremesh.demo`) and
`<t>` with that hospital's index (Apollo=0, Fortis=1, … Cloudnine=19).

| Role | Pattern | Indices available per tenant |
|---|---|---|
| AREA_ADMIN | `admin@<brand>.caremesh.demo` | 1 (org admin) |
| CLINIC_ADMIN | `cadmin.t<t>.u1@<brand>.caremesh.demo` … `u3` | u1–u3 (one per area) |
| DOCTOR | `dr.t<t>.u4@<brand>.caremesh.demo` … `u15` | u4–u15 (12 doctors) |
| OPERATOR | `ops.t<t>.u16@<brand>.caremesh.demo` … `u18` | u16–u18 (3 operators) |
| STAFF | `staff.t<t>.u19@<brand>.caremesh.demo` … `u20` | u19–u20 (2 staff) |

Example for **Fortis** (index 1): `dr.t1.u4@fortis.caremesh.demo`, `cadmin.t1.u1@fortis.caremesh.demo`.

> Tip: don't want to remember indices? Log in as the tenant's `admin@<brand>...`, open **Team Members**, and every doctor/operator/staff email is listed. Patients use `patient.t<t>.p<n>@patients.caremesh.demo` but are not login accounts.

---

## Notes
- **Tenant switching:** only SUPER_ADMIN sees the tenant switcher (top of the sidebar) and can pick a specific hospital or "All Tenants". Every other role is locked to their own hospital automatically.
- All passwords are demo-only. Change them before any real deployment.
