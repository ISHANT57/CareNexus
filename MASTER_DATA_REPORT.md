# MASTER_DATA_REPORT.md — Master Data Verification

This report certifies that the CareNexus platform runs entirely on database-driven data sources.

---

## 1. Audited Metadata Dropdowns & Catalogs

| Catalog / Entity | Source | Dynamic Fetch Hook | SQL Query Location |
|---|---|---|---|
| **Tenants (Hospitals)** | Database-driven | `useListTenants()` | `GET /api/tenants` |
| **Areas** | Database-driven | `useListAreas()` | `GET /api/areas` |
| **Clinics** | Database-driven | `useListClinics()` | `GET /api/clinics` |
| **Programs** | Database-driven | `useListPrograms()` | `GET /api/programs` |
| **Users / Staff** | Database-driven | `useListUsers()` | `GET /api/users` |
| **Doctors** | Database-driven | `useListUsers({ roleId: 'DOCTOR' })` | `GET /api/users` |

---

## 2. Dynamic Cascades & Filters

1. **Area -> Clinic Onboarding Cascade**:
   The `useAreaClinicCascade()` custom hook on the frontend queries the database for areas inside the selected tenant, and then queries the clinics strictly belonging to that selected area, preventing out-of-order assignments.
2. **Dynamic Landing Page Stats**:
   The public landing page statistics are fetched dynamically from the database via `/api/health/public-stats` counts rather than showing mock numbers, ensuring that the counts reflect the real deployment context.
3. **Dynamic Testimonial Brands**:
   Testimonials dynamically display active tenant names loaded from database listings instead of hardcoded fictional trust names.
