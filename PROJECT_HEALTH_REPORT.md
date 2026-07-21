# PROJECT_HEALTH_REPORT.md — CareNexus Platform Health Assessment

_Generated: 2026-06-11 | Fast Audit & Bug Discovery Mode_

---

## 1. Executive Summary

This report evaluates the current build, security architecture, relational hierarchy, and frontend stability of the CareNexus platform. A comprehensive fast audit was conducted to identify active bugs, security vulnerabilities, role capabilities, and database-to-code structural mismatches. 

---

## 2. Feature & Bug Metrics

### Feature Status
* **Total Features Audited:** 14
* **Working Features:** 2
* **Partially Working Features:** 10
* **Broken Features:** 2 (Care Tasks UI, Risk Scoring UI — both backend-only with no frontend UI)

### Identified Bugs Summary
* **Critical Bugs Count:** 6
* **High Bugs Count:** 8
* **Medium Bugs Count:** 7
* **Low Bugs Count:** 4
* **Total Audited Bugs:** 25

---

## 3. Detailed Feature Audits

| Feature | Status | Scoping Enforcement | Notes |
|---|---|---|---|
| **Authentication** | ✅ WORKING | Token-based HTTP-only cookies | Working login, registration, refresh, logout, `/me`. |
| **User Management** | 🟡 PARTIALLY WORKING | Role checks active | Bypasses hierarchy on creation (privilege escalation), and user details fetch clinic scoping is bypassed. |
| **Tenant Management** | 🟡 PARTIALLY WORKING | superAdminOnly middleware | Onboard endpoint crashes if Prisma client is regenerated. Metadata leaks to standard users. |
| **Area Management** | 🟡 PARTIALLY WORKING | tenantScope assert active | Area admins can modify areas they are not assigned to. |
| **Clinic Management** | 🟡 PARTIALLY WORKING | tenantScope assert active | Clinic admins can modify clinics outside their scope. Search is client-side only. |
| **Program Management** | 🟡 PARTIALLY WORKING | tenantScope active | Active programs exist, but update/create endpoints lack clinic-scoping. |
| **Patient Registration** | 🟡 PARTIALLY WORKING | Zod schema validation | Clinic Admins can register patients in clinics outside their scope. CSV import bypasses clinical boundaries. |
| **Appointments** | 🟡 PARTIALLY WORKING | getRoleScope active | Clinic/doctor scopes bypassed during scheduling. |
| **Consultations** | 🟡 PARTIALLY WORKING | getRoleScope active | All backend endpoints are present, but the frontend lacks Edit and Delete UI controls. |
| **Outcomes** | 🟡 PARTIALLY WORKING | getRoleScope active | Outcomes backend is functional, but the frontend detail tracking tab lacks a record outcome dialog. |
| **Tasks** | 🔴 BROKEN | Backend scope implemented | Fully implemented on the backend database and API layer, but the frontend UI is completely missing. |
| **Dashboards** | 🟡 PARTIALLY WORKING | getRoleScope partially active | Dashboard statistics count, audit logs, and pending SMS counts bypass clinician scoping, leaking trust-wide numbers. |
| **Notifications** | ✅ WORKING | tenantScope user-specific | Notifications dispatch on assignment, and UI panel functions. |
| **Reports** | 🟡 PARTIALLY WORKING | tenantScope active | Reports API is active, but lacks scoping controls on clinic-stats and audit trail history. |

---

## 4. Quality & Security Scores

* **Security Score: 40/100**
  _Rationale:_ Multiple critical tenant isolation leaks exist where custom roles of other tenants can be modified/deleted, and metadata can be leaked. Additionally, role visibility scoping is bypassed for patient details sub-resources (SMS history, GP details, status logs), and there is no role hierarchy check on user registration.
  
* **Architecture Score: 55/100**
  _Rationale:_ There is a severe database-to-code mismatch. The database schema defines tenant and role connections via a mapping table (`user_tenant_assignments`), while backend route files query and write `User.tenantId` and `User.roleId` directly on the User model. If the Prisma Client is regenerated, compilation will fail immediately.
  
* **Frontend Score: 60/100**
  _Rationale:_ UI styling looks premium and clean, but the frontend is missing critical page components (no Care Tasks UI, no Risk Score UI, no Consultation Edit/Delete dialogs). Standard users also experience a default tenant display of `"Unknown"` on initial load.
  
* **Backend Score: 50/100**
  _Rationale:_ 23+ REST endpoint routes exist, but write handlers lack clinical scoping validation (enabling clinic admins to create resources in unassigned locations). Super admin requests crash the server when operating in global "ALL" mode.
  
* **Database Score: 45/100**
  _Rationale:_ Stale client definitions conceal a mismatch in the `User` model relationships. There are also missing database-level unique constraints preventing duplicate active doctor-patient assignments, and missing relational checks on clinic deletions.

---

## 5. Final Verdict

### Verdict: **NOT READY FOR SUBMISSION**

### Critical Reasons:
1. **Database Schema & Code Mismatch:** The code assumes direct fields `tenantId` and `roleId` on the `User` model, but `schema.prisma` defines them inside the `user_tenant_assignments` mapping model. Rebuilding/regenerating the Prisma Client will break the build.
2. **Cross-Tenant Privilege Escalation:** Any user can modify or delete role permission lists belonging to other tenants by querying `/api/roles/:id` directly.
3. **Privilege Escalation on User Creation:** Clinic or Area Admins can create new user profiles and assign them higher roles (e.g. `SUPER_ADMIN`), bypassing system security hierarchy.
4. **Clinical Boundaries Bypass:** The `roleScope.ts` returns empty scoping objects for `CLINIC_ADMIN` and `AREA_ADMIN`, granting them access to clinics, areas, and patients they are not assigned to.
5. **Patient Data Leakage:** Sub-resource detail endpoints (Twilio SMS logs, status history, GP updates) do not verify if the patient is assigned to the requesting doctor, leading to HIPAA/GDPR data leakage.
6. **Platform Governance Crashes:** Performing writes (e.g., scheduling appointments) in Super Admin "ALL" mode crashes the server with database errors since `tenantId` is non-nullable.
7. **Missing Core Frontend Modules:** Care Tasks (Phase 2) and Risk Scoring (Phase 5) are completely missing from the web interface, and consultations lack edit/delete UI buttons.
