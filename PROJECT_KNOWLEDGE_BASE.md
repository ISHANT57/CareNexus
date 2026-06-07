# Caremesh PMS - Project Knowledge Base

## 1. Executive Summary

**Caremesh PMS** is an enterprise-grade multi-tenant Healthcare Patient Management SaaS specifically designed for NHS mental health trusts. 

**Why was this project created?** It addresses the critical need for a unified, secure, and compliant platform to manage patient records, clinical programs, provider assignments, and inter-team communications within isolated trust (tenant) boundaries.

**What business problem does it solve?** It replaces fragmented, legacy systems (or paper-based processes) with a single source of truth. It solves data siloing, insecure communications, and lack of real-time visibility into patient care journeys.

**Insufficiency of current processes:** Previous methods often lacked strict multi-tenant isolation, struggled with complex role-based access control (RBAC), and failed to provide a compliant, append-only audit trail required by NHS data standards.

**Challenges before this platform:** Clinical staff faced difficulties tracking patient status transitions, managing clinic assignments across different areas, and securely communicating with patients (e.g., via SMS) without breaking compliance.

**Improvements introduced:** Caremesh PMS introduces robust tenant isolation, granular RBAC, a centralized patient journey event log, integrated SMS capabilities, and an immutable audit trail, all wrapped in a modern, intuitive user interface.

---

## 2. Vision Statement

**Long-term vision:** To become the standard patient management operating system for NHS mental health trusts, enabling seamless care coordination across the UK.

**Mission:** Empower clinical and administrative teams with a secure, efficient, and user-friendly platform that reduces administrative burden and improves patient outcomes.

**Expected business transformation:** Shift from reactive, siloed data management to proactive, data-driven care coordination with full regulatory compliance and operational transparency.

**Strategic objectives:**
*   Ensure 100% compliance with NHS DSPT (Data Security and Protection Toolkit).
*   Reduce administrative time spent on patient tracking by 40%.
*   Improve patient engagement through integrated communication tools.
*   Provide real-time operational analytics for trust management.

---

## 3. Problem Statement

**Current problems faced by users:**

*   **Manual processes:** Updating patient statuses and managing assignments is often done via spreadsheets or outdated portals.
*   **Inefficiencies:** Finding a complete patient history or GP details takes too long.
*   **Lack of visibility:** Area and Clinic admins cannot easily see workload distribution or patient bottlenecks.
*   **Delayed decision making:** Lack of real-time dashboards prevents quick resource allocation.
*   **Data inconsistency:** Patient details might be updated in one system but not another.
*   **Poor communication:** Sending and tracking patient SMS messages is disconnected from their clinical record.
*   **Lack of analytics:** Hard to generate reports on program efficacy or clinic performance.

**Impact on stakeholders:**
*   **Doctors/Nurses:** Spend less time with patients and more time doing paperwork.
*   **Admins:** Overwhelmed by manual data entry and compliance reporting.
*   **Trust Management:** Lack strategic oversight to improve service delivery.

---

## 4. Why This Platform Is Needed

*   **Problem:** Patient status transitions are lost or hard to trace.
    *   **Solution:** Append-only Patient Journey Event Log.
    *   **Benefit:** Complete, compliant audit trail of every stage in a patient's care.
*   **Problem:** Data leakage between different NHS trusts.
    *   **Solution:** Strict multi-tenant database architecture with row-level isolation.
    *   **Benefit:** Guaranteed data privacy and regulatory compliance.
*   **Problem:** Ad-hoc patient communication lacks oversight.
    *   **Solution:** Integrated SMS module with delivery tracking tied to the patient record.
    *   **Benefit:** Centralized, auditable communication history.
*   **Problem:** Unclear who changed what data and when.
    *   **Solution:** Immutable Audit Log tracking every CREATE, UPDATE, DELETE.
    *   **Benefit:** Accountability and compliance readiness.

---

## 5. Target Audience

*   **Super Admin:** Platform owner. Manages tenants (Trusts), global settings, and platform-wide support. Focuses on system health and onboarding new trusts.
*   **Area Admin (Tenant Level):** Manages operations for a specific geographic or operational area within a trust. Goals: Oversee multiple clinics, assign staff, monitor regional KPIs.
*   **Clinic Admin:** Manages day-to-day operations of a specific clinic. Goals: Manage doctor-patient assignments, oversee clinic workflow, ensure data accuracy.
*   **Doctor / Clinical Staff:** Direct patient care providers. Goals: View assigned patients, update medical status (Journey Events), record notes, communicate with patients. Benefits from streamlined workflows.
*   **Operator:** Administrative staff handling data entry and communications. Goals: Bulk import patients, send broadcast SMS, manage basic records.
*   **Staff:** General viewing access. Goals: Look up patient information without edit privileges.

---

## 6. Stakeholder Mapping

*   **NHS Trust Management (Client):**
    *   *Responsibilities:* Purchasing, defining operational goals.
    *   *Expectations:* Compliance, security, ROI, improved care delivery.
    *   *Decision-making:* High (purchasing and adoption).
*   **Clinical Leads:**
    *   *Responsibilities:* Defining care pathways.
    *   *Expectations:* System must match clinical workflows, easy to use.
    *   *Decision-making:* High (feature requirements).
*   **IT & Security Teams:**
    *   *Responsibilities:* Vetting the platform.
    *   *Expectations:* SOC2/DSPT compliance, secure architecture, auditability.
    *   *Decision-making:* High (security approval).
*   **End Users (Doctors, Admins):**
    *   *Responsibilities:* Daily use.
    *   *Expectations:* Speed, reliability, intuitive UI.
    *   *Decision-making:* Medium (adoption success depends on them).

---

## 7. Complete User Journey

**Example: Doctor's Daily Workflow**

1.  **User Login:** Authenticates securely via the web portal.
2.  **Dashboard:** Views the daily summary—active patients, recent notifications, and system alerts.
3.  **Patients List:** Filters the list to see only patients assigned to them within their specific clinic.
4.  **Patient Detail:** Opens a specific patient record to review history, GP details, and past journey events.
5.  **Record Journey Event:** Patient requires medication. Doctor clicks "Update Status", selects "MEDICATION_REQUIRED", adds clinical notes, and saves.
6.  **Send SMS:** Doctor uses the SMS tab to send a reminder to the patient about picking up the prescription.
7.  **Log Out:** Securely ends the session.

---

## 8. Role Based Access Control (RBAC)

The system enforces strict RBAC bounded by the `tenantId`.

*   **SUPER_ADMIN:** Platform level. Can manage Tenants. Bypasses normal role checks but is STILL bound by tenant isolation when viewing tenant data.
*   **AREA_ADMIN:** Full read/write access to all resources *within their assigned Tenant*. Can manage Clinics, Users, Programs, and Patients.
*   **CLINIC_ADMIN:** Full read/write access, but restricted to their assigned *Clinics*.
*   **DOCTOR:** Read/write access to Patients, restricted to those assigned to them or within their assigned Clinics. Can update patient statuses and send communications.
*   **OPERATOR:** Focused on data processing. Can perform bulk imports, manage communications, but may have restricted access to clinical notes.
*   **STAFF:** Read-only access to general patient demographics and clinic information.

*Exact boundaries are enforced via backend middleware (`authorize("ROLE")`) and tenant assertion (`assertTenantMatch`).*

---

## 9. Complete Portal Walkthrough

*   **Dashboard:** Purpose: High-level overview. Displays KPI cards (Total Patients, Active Programs), charts (Patients by Status), and a Recent Activity feed.
*   **Patients:** List of all patients. Actions: Filter, search, add new patient, bulk import via CSV.
*   **Patient Detail:** Comprehensive view. Data: Demographics, GP details, Care Team (assignments), Journey Event timeline, SMS history, File Uploads.
*   **Clinics:** Manage clinical locations. Linked to Areas.
*   **Areas:** Manage geographic/operational regions within the Tenant.
*   **Programs:** Manage specific healthcare initiatives or pathways.
*   **Users:** Directory of staff. Actions: Add staff, assign roles, assign to clinics/programs.
*   **Notifications:** System alerts (e.g., "New patient assigned").
*   **Audit Logs:** Immutable record of all system actions. Used by admins and compliance officers.
*   **Settings:** Tenant-specific configurations.

---

## 10. Dashboard Deep Dive

*   **Card: Total Active Patients:**
    *   *Definition:* Count of patients with `status = 'ACTIVE'`.
    *   *Purpose:* Shows current clinical load.
*   **Card: Total Clinics / Areas:**
    *   *Definition:* Count of active clinics and areas in the tenant.
    *   *Purpose:* Operational footprint.
*   **Chart: Patients by Status:**
    *   *Definition:* Breakdown of patients by their current Journey Status (e.g., NEW, PSI, DISCHARGE).
    *   *Purpose:* Identifies bottlenecks in the care pathway.
*   **Recent Activity Feed:**
    *   *Definition:* The latest entries from the `audit_logs` table.
    *   *Purpose:* Real-time visibility into who is doing what in the system.

---

## 11. Functional Module Breakdown

**Module: Patient Journey Management**
*   *Purpose:* Track the clinical state of a patient over time.
*   *Inputs:* Status selection (Enum), Clinical Notes, Actor (User).
*   *Outputs:* Append-only record in `patient_journey_events`.
*   *Business Rules:* A patient's "current status" is dynamically derived from the most recent event. History cannot be altered or deleted.

**Module: Communications (SMS)**
*   *Purpose:* Send and track text messages to patients.
*   *Inputs:* Mobile number, Message text, Patient ID linkage.
*   *Outputs:* Record in `sms_communications`, API call to Twilio.
*   *Dependencies:* External Twilio API.
*   *Validation Rules:* Must have a valid E.164 mobile number.

---

## 12. Data Flow Explanation

1.  **Data Entry:** Users input data via React frontend forms.
2.  **Validation (Client):** React Hook Form + Zod ensures format correctness before submission.
3.  **API Request:** Frontend calls Express backend via TanStack Query hooks.
4.  **Security Gate:** Backend validates JWT (`authenticate`), ensures tenant isolation (`requireTenant`), checks permissions (`authorize`), and re-validates payload (`validateBody` via Zod).
5.  **Storage:** Prisma ORM executes queries against PostgreSQL.
6.  **Audit:** The `createAuditLog` interceptor records the exact JSON before/after state of the mutation.
7.  **Response:** Clean JSON returned to frontend; UI updates reactively.

---

## 13. End-to-End Process Flows

**Patient Lifecycle:**
1.  **Creation:** Patient added via UI or Bulk CSV Import. Status defaults to INACTIVE.
2.  **Assignment:** Clinic Admin assigns a Doctor to the Patient. Notification sent to Doctor.
3.  **Care Delivery:** Doctor views patient, records initial consultation.
4.  **Journey Update:** Doctor logs a Journey Event changing status from NEW to PSI (Psychological Intervention).
5.  **Ongoing Care:** SMS reminders sent, files uploaded, status updated to MEDICATION_REQUIRED.
6.  **Discharge:** Final Journey Event logged as DISCHARGE. Patient record is kept for audit but filtered from active views.

---

## 14. Automation Logic

*   **Audit Logging:** 100% automated. Any POST/PATCH/DELETE operation triggers an asynchronous write to the `audit_logs` table.
*   **Notifications:** Automated triggers. E.g., Assigning a doctor to a patient automatically creates a `Notification` record for that doctor.
*   **SMS Delivery Tracking (Future/Partial):** Twilio webhooks automatically update the `status` of an SMS record (QUEUED -> SENT -> DELIVERED).
*   **Soft Deletion:** Automated pattern. Deleting a record updates the `deletedAt` timestamp instead of a hard database drop, preserving referential integrity for audits.

---

## 15. Reporting & Analytics

*   **Currently Available:** Real-time dashboard widgets (Patients by Status, Patients by Program).
*   **Data Source:** Live queries against the PostgreSQL database using Prisma aggregations.
*   **Filtering:** Data is strictly filtered by the requesting user's `tenantId`.
*   **Decision-making benefits:** Allows Clinic and Area admins to immediately see if certain programs are overloaded or if patients are stuck in a specific journey stage.

---

## 16. Security Model

*   **Authentication:** Custom JWT-based. Short-lived Access Tokens (8h) and long-lived Refresh Tokens (30d) stored securely in HttpOnly cookies to prevent XSS.
*   **Authorization:** Role-Based Access Control (RBAC) enforced via Express middleware.
*   **Tenant Isolation:** The most critical security feature. `req.tenantId` is extracted from the JWT. Every Prisma query MUST include `where: { tenantId }`. Cross-tenant data access is structurally prevented.
*   **Data Protection:** Passwords hashed with bcrypt (cost 12). All communication over TLS/HTTPS.
*   **Audit Logging:** Immutable `audit_logs` table captures User ID, IP address, Action, and full data payload for compliance.

---

## 17. Integration Ecosystem

*   **Inbound APIs:** RESTful API documented via OpenAPI (`openapi.yaml`). Used by the frontend web app.
*   **Outbound Integrations:**
    *   **Twilio:** For outbound SMS communications.
    *   **Object Storage (Future):** For patient file uploads (currently using local multer storage).
    *   **NHS Systems (Future):** Planned interoperability with EMIS/SystmOne.

---

## 18. Real World Usage Scenario

**The Clinic Admin Journey:**
Sarah is a Clinic Admin at "Northgate East Clinic". She logs in on Monday morning. Her dashboard shows 5 new patients imported over the weekend. She clicks into the Patients list, filters by "Unassigned", and assigns two patients to Dr. Smith and three to Dr. Jones. The system automatically sends in-app notifications to both doctors. Sarah then checks the Audit Log to verify that an Operator correctly imported the weekend CSV file, ensuring data integrity.

---

## 19. Business Impact Analysis

*   **Operational Efficiency:** Replaces spreadsheets and ad-hoc emails with a structured workflow, saving hours of admin time per week.
*   **Compliance:** The immutable audit log and strict tenant isolation make NHS DSPT audits significantly easier and faster to pass.
*   **Visibility:** Management gains real-time insight into patient volumes and clinic workloads without having to request manual reports.
*   **Cost Reduction:** Consolidates multiple legacy tools (SMS gateway, patient tracker, staff directory) into one platform.

---

## 20. Success Metrics

*   **Adoption Rate:** Percentage of clinical staff logging in daily.
*   **Data Completeness:** Percentage of patient records with complete GP details and assigned care teams.
*   **Journey Velocity:** Average time a patient spends in the "NEW" status before progressing.
*   **Audit Compliance:** Zero data breaches or cross-tenant data leaks.

---

## 21. Future Scalability Roadmap

*   **Short-term:** Implement full file upload to AWS S3/Azure Blob. Complete password reset flows.
*   **Mid-term:** Integrate directly with NHS EMIS/SystmOne via APIs to prevent double data entry.
*   **Long-term:** Introduce predictive analytics (e.g., flagging patients at high risk of missing appointments). Develop a patient-facing mobile application.

---

## 22. Glossary

*   **Tenant:** An isolated organizational boundary (e.g., an NHS Trust).
*   **Area:** A geographic or operational subdivision within a Tenant.
*   **Clinic:** A physical or virtual care location within an Area.
*   **Program:** A specific clinical pathway or treatment initiative.
*   **Journey Event:** A discrete, immutable change in a patient's clinical status.
*   **Soft Delete:** Marking a record as deleted via a timestamp (`deletedAt`) rather than removing it from the database, ensuring historical data remains intact for audits.

---

## 23. New Employee Training Guide

**Welcome to the Caremesh PMS team!**

*   **Start Here:** Read `ARCHITECTURE.md` to understand the monorepo structure (API Server + Web Frontend).
*   **Core Concept to Master:** Understand **Tenant Isolation**. Every query you write MUST include `tenantId`. Read `DECISIONS.md` D002.
*   **Workflow:** We use an "OpenAPI-first" approach. You edit `openapi.yaml`, run codegen, and then implement the backend route and frontend UI. Never edit generated files directly.
*   **Common Mistake:** Forgetting to handle soft-deleted records. Always ensure your queries include `deletedAt: null` when fetching active data.
*   **Best Practice:** Use the `pino` logger, never `console.log` on the server. Always use the provided React Query hooks on the frontend.

---

## 24. System Summary

Caremesh PMS exists to modernize and secure patient management for healthcare trusts. By enforcing strict multi-tenant architecture, robust RBAC, and comprehensive audit logging, it provides a safe environment for clinical data. It streamlines workflows for doctors and admins, providing clear visibility into patient journeys and clinic operations. Delivering significant business value through operational efficiency and regulatory compliance, Caremesh PMS is positioned to scale as the central operating system for modern mental health care delivery.
