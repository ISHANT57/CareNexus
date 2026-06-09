# Caremesh PMS: The Definitive Project Workflow & Encyclopedia

This document serves as the ultimate, definitive guide to the Caremesh Patient Management System (PMS). It has been designed as an industrial-grade knowledge transfer document. Whether you are a new developer joining the project, an instructor trying to understand the platform's architecture, an interviewer evaluating system design decisions, a future AI agent taking over development, or a team member maintaining the system, this encyclopedia provides exhaustive, deeply detailed explanations of every facet of the project.

---

# SECTION 1 â€“ PROJECT OVERVIEW

## What is Caremesh PMS?

Caremesh PMS is an enterprise-grade, multi-tenant SaaS (Software as a Service) application explicitly built for healthcare organizations, with a specific focus on NHS mental health trusts in the United Kingdom. At its core, it is a unified patient management system designed to orchestrate the entire patient lifecycleâ€”from initial registration and program enrollment through clinical consultations, continuous task tracking, and eventual discharge. 

The system acts as a "single source of truth" for clinical and administrative data. It integrates patient demographics, dynamic status tracking, appointment scheduling, consultation notes, and secure communication (via SMS) into one cohesive, highly secure interface.

## Why was it created?

Caremesh PMS was born out of the necessity to modernize fragmented, inefficient, and often paper-based processes within large healthcare organizations. Before the creation of this platform, many NHS mental health trusts and private clinics relied on disjointed software solutions, legacy mainframes, spreadsheets, and manual documentation to track patient journeys. This led to severe data siloing, high administrative overhead, compliance risks, and most critically, degraded patient care due to lack of real-time visibility.

The project was created to provide a modern, cloud-native alternative that strictly adheres to the stringent data security and privacy requirements of healthcare, particularly the NHS Data Security and Protection Toolkit (DSPT). It was built to solve the complex problem of multi-tenancyâ€”allowing different, independent healthcare organizations (Trusts) to use the same underlying platform without any risk of data leakage between them.

## Which healthcare problem does it solve?

In modern healthcare, specifically mental health, the patient journey is highly non-linear and involves multiple stakeholdersâ€”doctors, nurses, administrative staff, and therapists. The core problem Caremesh solves is "Journey Fragmentation." 

When a patient is referred to a clinic, they often move between different programs, require various types of appointments, and need continuous follow-up. Without a unified system, a doctor might not know if a patient missed an appointment with a therapist, or an administrator might not realize a patient is overdue for a critical follow-up. Caremesh solves this by centralizing all actions into an immutable "Patient Journey Event Log," ensuring that every transition in a patient's care is recorded, visible, and auditable.

Furthermore, it solves the problem of cross-clinic resource management. Large trusts have multiple geographic areas and numerous clinics. Caremesh allows Area Administrators to oversee patient distribution, program capacity, and doctor workloads across all these sub-entities in real-time.

## Why hospitals/clinics need it?

Hospitals and clinics need Caremesh PMS because the cost of operational inefficiency is no longer sustainable. They need it for:
1. **Regulatory Compliance**: With built-in immutable audit logging, every single CREATE, UPDATE, and DELETE action is permanently recorded. When an NHS auditor asks who viewed or modified a patient's record, Caremesh provides the exact JSON payload, IP address, and timestamp.
2. **Operational Efficiency**: By automating notifications and providing bulk-import capabilities, administrative staff save thousands of hours a year.
3. **Data Security**: Through strict, database-level row isolation by `tenantId`, clinics can guarantee that patient data is never exposed to unauthorized personnel in other trusts.
4. **Clinical Excellence**: Doctors need quick access to a patient's historical consultations, current medication, and GP details. Caremesh puts this at their fingertips, reducing the time spent searching for information and increasing the time spent on actual patient care.

## Which users benefit from it?

The platform is designed to benefit every layer of the healthcare hierarchy:
- **Trust Executives / Super Admins** benefit from platform-wide stability and macro-level reporting.
- **Area & Clinic Administrators** benefit from real-time dashboards that highlight bottlenecks (e.g., too many patients in the "NEW" status, missed appointments).
- **Doctors and Clinical Staff** benefit from a streamlined interface that allows them to quickly review a patient's history, log consultation notes, and trigger SMS reminders without leaving the application.
- **Operators and Administrative Staff** benefit from bulk tools (like CSV patient imports) and a clear directory of staff and clinics.
- **Patients** (indirectly) benefit from a more coordinated care experience, timely SMS reminders, and a significantly lower risk of "falling through the cracks."

---

# SECTION 2 â€“ BUSINESS PROBLEM

## What happens without Caremesh?

To truly understand the value of the platform, one must examine the chaotic reality of a healthcare trust operating without a centralized system like Caremesh. 

Consider the standard patient workflow without Caremesh:

**Patient Registration:** A patient walks into a clinic or is referred. An administrative staff member writes down their details on a paper form or enters them into a standalone Excel spreadsheet.
â†“
**Appointment Scheduling:** The admin looks at a physical diary or a disconnected calendar application (like Outlook) to find a slot for a doctor. They manually copy the patient's name into the calendar.
â†“
**Consultation:** The doctor sees the patient. They write clinical notes in a Word document or a legacy, on-premise system that takes 5 minutes just to boot up. The doctor decides the patient needs psychological intervention.
â†“
**Follow-up & Communication:** The doctor tells the admin to text the patient a reminder for their next session. The admin uses a separate, prepaid SMS portal to send the message. No record of this message is tied directly to the patient's clinical file.

### The Inevitable Problems in this Scenario:
1. **Lost Information:** If the Excel spreadsheet is corrupted, or if the doctor forgets to upload the Word document to a shared drive, the patient's critical health data is lost forever.
2. **Manual Tracking:** Figuring out how many patients are currently undergoing "Psychological Intervention" requires someone to manually count rows in a spreadsheet. This makes capacity planning impossible.
3. **Missed Appointments:** Because the SMS portal is disconnected from the calendar, if an appointment is rescheduled, the patient might still receive an SMS for the old date, leading to a "No Show."
4. **No Audit Trail:** If a patient's contact number is maliciously or accidentally changed in the Excel file, there is absolutely no way to know *who* made the change, *when* they made it, or *why*.
5. **No Reporting:** Generating a monthly report for the NHS trust board takes an administrator two full weeks of compiling data from disparate systems.

## How Caremesh Solves Each Problem

Caremesh PMS attacks these business problems systematically:

1. **Solving Lost Information:** Everything is stored in a highly available, relational PostgreSQL database. The data is structured, validated by Zod schemas before insertion, and universally accessible via the web portal.
2. **Solving Manual Tracking:** Caremesh introduces the concept of **Journey Events**. When a doctor changes a patient's status to "Psychological Intervention", it is logged as an immutable event. The dashboard immediately updates to reflect the new count. Administrators can instantly see exactly where every patient is in their care pathway.
3. **Solving Missed Appointments:** Appointments and Communications are integrated. When an appointment is scheduled in Caremesh, an SMS can be automatically triggered or manually sent from the exact same interface. The Twilio integration ensures reliable delivery, and the delivery status is tracked directly on the patient's profile.
4. **Solving the Lack of Audit Trails:** Caremesh has an automated, interceptor-based audit logging mechanism. Every single mutation to the database automatically captures the user's ID, the action taken, and the exact JSON snapshot of the data before and after the change. This is non-bypassable and guarantees 100% compliance.
5. **Solving the Reporting Nightmare:** Caremesh provides real-time React-based dashboards powered by Prisma aggregations. What used to take two weeks of manual counting now takes zero secondsâ€”it is available instantly upon login, strictly scoped to the data the user is authorized to see.

---

# SECTION 3 â€“ WHO USES THE SYSTEM

Caremesh PMS utilizes a sophisticated, hierarchical Role-Based Access Control (RBAC) system. The system is designed to mimic the actual organizational structure of a healthcare trust. 

Here is an exhaustive breakdown of all user types, their responsibilities, permissions, and daily workflows.

## 1. Super Admin
**The Platform Owner / Infrastructure Manager**
*   **Responsibilities:** The Super Admin is responsible for the overall health of the Caremesh platform. They do not typically interact with patient data. Instead, they manage the "Tenants" (the individual NHS trusts or private clinic groups that purchase the software). 
*   **Permissions:** Unrestricted access at the platform level. They can create new Tenants, provision initial administrative accounts for those tenants, and view global system health metrics. However, they are still strictly bound by tenant isolation rulesâ€”if a Super Admin wants to view a specific trust's data, they must explicitly switch their context to that Tenant.
*   **Daily Workflow:** Monitoring system logs, provisioning a newly onboarded NHS Trust, adjusting global rate limits, and investigating system-wide performance anomalies.

## 2. Area Admin
**The Regional Director**
*   **Responsibilities:** Large healthcare trusts are divided into geographic or operational "Areas" (e.g., "Northgate East Region"). The Area Admin oversees all clinics, doctors, and patients within their assigned Area.
*   **Permissions:** Full Read/Write access to all resources *within their specific Tenant*. They can create new Clinics, define Programs (treatment pathways), manage the User directory (hiring/firing staff on the platform), and view aggregated reports for all clinics under their purview.
*   **Daily Workflow:** Logging in to view the regional dashboard. Noticing that "Clinic A" has a backlog of 50 "NEW" patients while "Clinic B" has zero. Reassigning 25 patients from Clinic A to Clinic B and shifting two doctors over to assist.

## 3. Clinic Admin
**The Office Manager / Head Receptionist**
*   **Responsibilities:** Manages the day-to-day, minute-by-minute operations of one or more specific physical or virtual clinics. 
*   **Permissions:** Read/Write access restricted strictly to their assigned Clinics. They cannot see patients or staff in other clinics, even within the same trust. They manage doctor-patient assignments, schedule appointments, and ensure demographic data is accurate.
*   **Daily Workflow:** Arriving at 8:00 AM, opening the Caremesh portal. Viewing the list of patients imported over the weekend. Assigning these unassigned patients to specific doctors based on availability. Calling patients to confirm appointments and updating their profiles if their phone number has changed.

## 4. Doctor / Clinical Professional
**The Primary Care Provider**
*   **Responsibilities:** Delivering actual healthcare to the patient. Evaluating symptoms, making diagnoses, prescribing treatment, and updating the patient's clinical journey.
*   **Permissions:** Can view and edit records only for patients explicitly assigned to them, or patients within their assigned clinic (depending on specific trust configuration). They can create Consultations, update Journey Statuses, and upload medical files. They cannot delete patients or manage clinic settings.
*   **Daily Workflow:** The doctor logs in and opens their "My Patients" tab. They select the first patient scheduled for the day. They review the patient's history, previous consultation notes, and current medications. During the session, they use Caremesh to record new consultation notes (symptoms, diagnosis, treatment plan). After the session, they log a Journey Event, transitioning the patient from "ACTIVE" to "MEDICATION_REQUIRED".

## 5. Operator
**The Data Entry & Communications Specialist**
*   **Responsibilities:** Handling high-volume data tasks that do not require clinical expertise.
*   **Permissions:** Can perform bulk imports (CSV uploads of new patients), manage the SMS communication queues, and update non-clinical demographic data. They may be restricted from viewing sensitive consultation notes.
*   **Daily Workflow:** Receiving an exported CSV file from a legacy NHS system. Using the Caremesh Bulk Import tool to ingest 500 patients at once. Reviewing the import logs for errors. Triggering a broadcast SMS to 100 patients reminding them of a seasonal flu clinic.

## 6. Staff
**The Observer / Auditor**
*   **Responsibilities:** General administrative support, auditing, or temporary staff who need to find information without altering it.
*   **Permissions:** Read-only access to general patient demographics, clinic directories, and high-level dashboards. They cannot mutate any data in the system.
*   **Daily Workflow:** Searching the directory to find which clinic a specific doctor is operating out of today. Looking up a patient to verify their GP details for an external audit, without the risk of accidentally deleting or modifying the record.

---

# SECTION 4 â€“ COMPLETE SYSTEM WORKFLOW

To understand Caremesh, you must understand the complete lifecycle of a patient within the system. This workflow represents the orchestration of multiple database models (Patients, Programs, Enrollments, Appointments, Consultations, and Journey Events).

## The Complete Patient Lifecycle

### Step 1: Patient Creation (Ingestion)
A patient enters the Caremesh system either manually (a Clinic Admin typing their details into the "Add Patient" form) or via Bulk CSV Import (an Operator uploading hundreds of records).
*   **Data Captured:** First Name, Last Name, Date of Birth, NHS Number (Unique Identifier), Mobile Number, Address, and General Practitioner (GP) details.
*   **System Action:** The system validates the NHS Number format. It checks for uniqueness within the Tenant. The patient is created with a default Journey Status of `INACTIVE`. An audit log of the creation is permanently stored.

### Step 2: Patient Assignment
The patient exists in the system but is floating. They must be routed to care.
*   **Action:** A Clinic Admin views the "Unassigned Patients" list. They select the patient, assign them to "Northgate Clinic", and specifically assign them to "Dr. Sarah Jenkins".
*   **System Action:** The database links the `patientId` to `clinicId` and `doctorId`. An automated notification is generated and pushed to Dr. Jenkins's dashboard: "New Patient Assigned: John Doe."

### Step 3: Program Enrollment
The patient is evaluated to determine which clinical pathway they belong to.
*   **Action:** Dr. Jenkins reviews the patient's preliminary file and decides they need the "Cognitive Behavioral Therapy (CBT)" program. She navigates to the Enrollments tab and enrolls the patient.
*   **System Action:** A `ProgramEnrollment` record is created linking the patient to the CBT program with a status of `ACTIVE`.

### Step 4: The Journey Begins (Status Update)
The patient's high-level status must reflect that they are now undergoing active treatment.
*   **Action:** Dr. Jenkins clicks "Update Status". She selects `ACTIVE` from the Journey Status enum, adds a note ("Starting CBT program"), and saves.
*   **System Action:** An immutable `PatientJourneyEvent` is appended to the database. The system calculates the patient's "current status" by querying the most recent event. The dashboard pie charts dynamically update to show one more patient in the `ACTIVE` slice.

### Step 5: Appointment Scheduling
The patient needs to be seen physically or virtually.
*   **Action:** A Clinic Admin contacts the patient and schedules an appointment for next Tuesday at 10:00 AM.
*   **System Action:** An `Appointment` record is created. It is linked to the patient, doctor, and clinic. Its status is `SCHEDULED`. 

### Step 6: Communication (SMS Reminder)
To prevent a "No Show," the system must communicate with the patient.
*   **Action:** Two days before the appointment, an Operator uses the Communications module to send an SMS: "Reminder: Your appointment with Dr. Jenkins is on Tuesday at 10:00 AM."
*   **System Action:** Caremesh stores the message payload, interfaces with the Twilio API, dispatches the text, and awaits a delivery webhook. The message appears in the patient's communication history.

### Step 7: The Consultation
The patient arrives for their appointment.
*   **Action:** Dr. Jenkins opens the patient's file. She clicks on the scheduled appointment and marks it as `COMPLETED`. She immediately clicks "Record Consultation." She fills in the Chief Complaint, Symptoms, Observations, Diagnosis, and Treatment Plan.
*   **System Action:** A massive `Consultation` record is created. It captures all clinical text. The system automatically triggers a background process to create a new Journey Event: `CONSULTATION_COMPLETED`, updating the patient's timeline without the doctor needing to do it manually.

### Step 8: Ongoing Task Assignment & Outcome Tracking (Iterative Loop)
*   **Action:** Over the next 6 weeks, the doctor may assign internal `Tasks` (e.g., "Follow up on blood work") to nurses. At the end of the program, they log clinical `Outcomes` (e.g., depression severity scores).
*   **System Action:** The system tracks task completion and plots outcome scores on visual graphs.

### Step 9: Discharge
The patient has successfully completed their care pathway.
*   **Action:** The doctor navigates to Program Enrollments and marks the CBT program as `COMPLETED`. They then log a final Journey Event: `DISCHARGE`. 
*   **System Action:** The patient is removed from active dashboard metrics. Their historical record is locked but remains fully accessible for future audits. If the patient ever returns, their complete history is instantly available.

---

# SECTION 5 â€“ FEATURE INVENTORY

This section provides an exhaustive list of every feature implemented in Caremesh PMS, detailing its purpose, business value, and target user.

## 1. Authentication & Authorization Module
*   **Purpose:** Securely identify users and restrict their access.
*   **Why it exists:** Healthcare data requires military-grade access controls.
*   **Who uses it:** Every user.
*   **Business Value:** Prevents unauthorized access and ensures regulatory compliance. Includes custom JWT handling, HttpOnly cookies to prevent XSS attacks, and automated Refresh Token rotation for long-lived sessions without compromising security.

## 2. Multi-Tenant Architecture (Tenant Isolation)
*   **Purpose:** Logically separate data belonging to different NHS Trusts within a single shared database.
*   **Why it exists:** Running a separate database for every client is incredibly expensive and hard to maintain. A multi-tenant architecture allows massive scale while guaranteeing data privacy through rigorous middleware (e.g., `requireTenant`, `assertTenantMatch`).
*   **Who uses it:** Invisible to the end user, but critical for Trust Management.
*   **Business Value:** Lowers infrastructure costs while providing absolute certainty that Trust A cannot see Trust B's patients.

## 3. Patient Management (Demographics & Directory)
*   **Purpose:** A centralized database of all patient personal information.
*   **Why it exists:** To replace fragmented spreadsheets. 
*   **Who uses it:** Clinic Admins, Operators, Doctors.
*   **Business Value:** Ensures a single source of truth for patient contact details, NHS numbers, and GP linkages. Includes the Bulk CSV Import feature, saving hundreds of hours of manual data entry.

## 4. Patient Journey Event Timeline
*   **Purpose:** An append-only log of every status change a patient undergoes.
*   **Why it exists:** Standard mutable fields (`status = 'ACTIVE'`) destroy historical context. Doctors need to know *when* a patient transitioned, *why*, and *who* made the decision.
*   **Who uses it:** Doctors and Clinical Leads.
*   **Business Value:** Provides an immutable clinical audit trail, essential for malpractice defense and DSPT compliance.

## 5. Clinic & Area Organizational Modeling
*   **Purpose:** Maps the digital system to the physical reality of the healthcare trust.
*   **Why it exists:** Patients aren't just "in the trust"; they are in "Northgate Clinic" within the "East Area". The system must reflect this hierarchy to route patients properly.
*   **Who uses it:** Area Admins, Super Admins.
*   **Business Value:** Allows granular reporting. Management can see exactly which clinics are underperforming or overwhelmed.

## 6. Program Enrollments
*   **Purpose:** Grouping patients into specific treatment pathways (e.g., CBT, Addiction Recovery, Eating Disorders).
*   **Why it exists:** Patients often have multiple distinct issues. Treating them requires structured programs with distinct start and end dates.
*   **Who uses it:** Doctors, Clinic Admins.
*   **Business Value:** Enables the trust to track the efficacy and capacity of specific health initiatives.

## 7. Appointment Scheduling
*   **Purpose:** Managing the physical and virtual meetings between doctors and patients.
*   **Why it exists:** To replace disconnected Outlook calendars.
*   **Who uses it:** Clinic Admins, Doctors.
*   **Business Value:** Reduces "No Shows" by integrating scheduling with the core patient record and automated notifications. Tracks statuses: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW.

## 8. Clinical Consultations
*   **Purpose:** The core medical record-keeping interface.
*   **Why it exists:** Doctors need a structured way to record Symptoms, Diagnoses, Treatment Plans, and Medications during or immediately after an appointment.
*   **Who uses it:** Doctors.
*   **Business Value:** Digitizes the medical chart. Makes historical notes instantly searchable and readable, directly improving patient care quality.

## 9. SMS Communications (Twilio Integration)
*   **Purpose:** Two-way (or broadcast) text messaging with patients.
*   **Why it exists:** Phone calls take too long and patients ignore them. SMS is the most effective way to reduce missed appointments.
*   **Who uses it:** Operators, Clinic Admins.
*   **Business Value:** Massive ROI. Reducing "No Shows" by even 5% saves a typical NHS trust millions of pounds annually.

## 10. Immutable Audit Logging
*   **Purpose:** A silent background process that records every system mutation.
*   **Why it exists:** When a data breach or medical error occurs, investigators must know exactly what happened. The system automatically captures the `userId`, the API route, and the complete JSON snapshot of the data `before` and `after` the change.
*   **Who uses it:** Auditors, Super Admins.
*   **Business Value:** Ensures 100% compliance with legal data protection mandates. It is impossible to bypass, providing absolute accountability.

## 11. Role-Based Access Control (RBAC) UI
*   **Purpose:** A dynamic interface to manage who can do what.
*   **Why it exists:** Hardcoding permissions is inflexible. The trust needs to be able to dictate that a "Nurse" can view files but not delete them.
*   **Who uses it:** Area Admins.
*   **Business Value:** Security through least-privilege. Ensures staff only have the tools they need to do their jobs, minimizing the blast radius of compromised accounts.

## 12. Real-Time Analytics Dashboard
*   **Purpose:** Visual representations of system data via Recharts.
*   **Why it exists:** Reading rows in a database is impossible for executives. They need visual pie charts of patient statuses and bar charts of clinic workloads.
*   **Who uses it:** Area Admins, Clinic Admins.
*   **Business Value:** Enables rapid, data-driven operational decisions without waiting weeks for an IT data export.

## 13. System Notifications
*   **Purpose:** In-app alerts for critical events.
*   **Why it exists:** If a patient is assigned to a doctor, the doctor must know immediately without refreshing the page or checking email.
*   **Who uses it:** All Users.
*   **Business Value:** Accelerates internal communication and workflow velocity.

## 14. File Uploads & Management
*   **Purpose:** Attaching external documents (referral letters, MRI scans, external test results) to the patient record.
*   **Why it exists:** Not all data originates inside Caremesh. Legacy documents must be accommodated.
*   **Who uses it:** Doctors, Clinic Admins.
*   **Business Value:** Consolidates external medical history into the single source of truth.

[END OF PART 1]
# SECTION 6 â€“ TECHNOLOGY STACK

Caremesh PMS is built using a modern, scalable, and highly opinionated technology stack. The stack was chosen specifically for type safety, developer velocity, and robust enterprise deployment capabilities. The project is organized as a pnpm monorepo.

## Frontend Architecture

### 1. React 18 & Vite
*   **What it is:** React is the industry standard UI library. Vite is a next-generation frontend tooling that provides a lightning-fast development server and optimized production builds.
*   **Why it was chosen:** React's component-based architecture is essential for building complex, interactive dashboards like Caremesh. Vite was chosen over Create React App or Webpack due to its superior hot-module-replacement (HMR) speed, which drastically improves developer experience.
*   **Alternative technologies:** Next.js (rejected because Server-Side Rendering was deemed unnecessary for a secured, logged-in SaaS dashboard), Angular.
*   **Advantages:** Huge ecosystem, incredibly fast build times, highly reactive UI.
*   **Disadvantages:** Requires careful state management to avoid performance-killing re-renders in complex data grids.

### 2. Tailwind CSS & shadcn/ui
*   **What it is:** Tailwind is a utility-first CSS framework. shadcn/ui provides beautifully designed, accessible UI components (like Tabs, Modals, Data Tables) built on top of Radix UI primitives.
*   **Why it was chosen:** Writing raw CSS or SCSS for an enterprise dashboard quickly becomes unmaintainable. Tailwind allows developers to style components directly in the markup. shadcn/ui provides the "premium" enterprise look and feel out of the box while ensuring full WCAG accessibility compliance.
*   **Advantages:** Rapid UI prototyping, highly consistent design language, zero CSS payload bloat.
*   **Disadvantages:** HTML markup can become cluttered with long class strings.

### 3. React Query (@tanstack/react-query)
*   **What it is:** A powerful asynchronous state management library for React. It handles data fetching, caching, synchronization, and background updates.
*   **Why it was chosen:** Caremesh interacts heavily with a REST API. Managing loading states, error states, and caching manually with `useEffect` is an anti-pattern. React Query abstracts all of this.
*   **Advantages:** Automatic background refetching, pagination support, seamless integration with our OpenAPI generated hooks.

### 4. Wouter (React Router DOM)
*   **What it is:** The standard routing library for React applications. Note: The scaffold mentions Wouter, but the current production architecture utilizes React Router DOM wrapped in an `AuthGuard` layout for sophisticated nested routing and route protection.
*   **Why it was chosen:** Essential for managing URL-based navigation within a Single Page Application (SPA).

## Backend Architecture

### 1. Node.js & Express 5
*   **What it is:** The backend runtime and web framework.
*   **Why it was chosen:** Express is the most mature, heavily tested web framework for Node.js. Express 5 was specifically chosen because it introduces native Promise support. This eliminates the need to wrap every single async route handler in a `try/catch` block, resulting in significantly cleaner, less error-prone code.
*   **Alternative technologies:** NestJS (rejected as too heavily abstracted for the initial team), Go (rejected due to team TypeScript proficiency).
*   **Advantages:** Massive middleware ecosystem, full stack TypeScript (allowing code sharing between frontend and backend).

### 2. Prisma ORM
*   **What it is:** A next-generation Object-Relational Mapper for Node.js and TypeScript. It defines the database schema declaratively and generates a highly type-safe query builder.
*   **Why it was chosen:** Prisma is the absolute core of the backend. Its type safety guarantees that if a database column changes, the TypeScript compiler will immediately flag every affected backend route.
*   **Alternative technologies:** TypeORM (rejected due to legacy architecture), Drizzle (used in early scaffolding but replaced by Prisma for the main API server due to Prisma's superior migration engine).
*   **Advantages:** Exceptional developer experience, predictable migrations, deeply integrated TypeScript support.
*   **Disadvantages:** Can sometimes generate inefficient SQL for extremely complex, deeply nested relational queries.

## Database Layer

### PostgreSQL
*   **What it is:** The world's most advanced open-source relational database.
*   **Why it was chosen:** Healthcare data is fundamentally relational (Patient -> Belongs To -> Clinic -> Belongs To -> Area). Document databases (like MongoDB) are entirely inappropriate for this level of structured, transactional data. PostgreSQL offers robust JSON support (used for our Audit Logs), strict foreign key constraints, and future scalability via Row-Level Security (RLS).
*   **Advantages:** ACID compliant, extremely reliable, handles complex joins efficiently.

## Security & Validation

### 1. JSON Web Tokens (JWT) & bcrypt
*   **What it is:** Cryptographic standards for hashing passwords and stateless authentication.
*   **Why it was chosen:** JWTs allow the backend to scale horizontally without needing a centralized session store (like Redis). By implementing a dual-token system (short-lived access token, long-lived refresh token stored in HttpOnly cookies), the system balances user convenience with high security.

### 2. Zod
*   **What it is:** A TypeScript-first schema declaration and validation library.
*   **Why it was chosen:** Never trust client input. Every incoming API request body is validated against a Zod schema before it touches the database.
*   **Advantages:** If a payload fails validation, Zod automatically generates a detailed, human-readable error response.

## Development & Documentation

### OpenAPI (Swagger) & Orval
*   **What it is:** OpenAPI is a specification for machine-readable interface files for describing REST APIs. Orval is a code generator.
*   **Why it was chosen:** Caremesh utilizes an "API Contract First" workflow. The API is designed in `openapi.yaml`. Orval then reads this file and automatically generates the React Query hooks for the frontend and the Zod validation schemas for the backend.
*   **Advantages:** It completely eliminates the drift between frontend expectations and backend reality. If the backend changes an endpoint in the spec, the frontend build will immediately fail if it doesn't update its usage.

---

# SECTION 7 â€“ DATABASE EXPLANATION

The Caremesh PostgreSQL database is defined entirely through Prisma (`schema.prisma`). It consists of highly normalized relational tables. Every operational table enforces tenant isolation via the `tenantId` column.

## Core Structural Tables

### `users`
*   **Purpose:** Stores all human actors in the system (Admins, Doctors, Operators).
*   **Relationships:** Belongs to a Tenant. Can belong to an Area and a Clinic.
*   **Business Meaning:** The foundation of access. Contains the securely hashed passwords, roles, and identifying information.

### `tenants`
*   **Purpose:** The highest level organizational boundary (e.g., "NHS Trust London").
*   **Relationships:** Has many Areas, Users, Patients, Programs.
*   **Business Meaning:** Guarantees absolute data segregation. A user in Tenant A can never query records in Tenant B.

### `areas` & `clinics`
*   **Purpose:** Maps the geographic or operational hierarchy of the Tenant.
*   **Relationships:** An Area has many Clinics. A Clinic belongs to one Area. Patients and Users are assigned to Clinics.
*   **Business Meaning:** Allows the Trust to break down reporting and restrict access geographically.

## Patient Journey Tables

### `patients`
*   **Purpose:** The central entity of the system. Stores demographic data, NHS number, and GP details.
*   **Relationships:** Belongs to a Tenant, optionally linked to a Clinic and a Doctor (User).
*   **Business Meaning:** The human being receiving care. Note: The `patients` table does *not* have a mutable `status` column. Status is derived from the event log.

### `patient_journey_events`
*   **Purpose:** An append-only log of status changes.
*   **Relationships:** Belongs to a Patient. Created by a User.
*   **Business Meaning:** Forms the immutable clinical audit trail. If a patient moves from "NEW" to "DISCHARGE", two rows exist here documenting who made the change and when.

## Clinical Workflow Tables

### `programs` & `program_enrollments`
*   **Purpose:** Defines clinical pathways (e.g., CBT, Physical Therapy) and tracks which patients are undergoing them.
*   **Relationships:** A Program belongs to a Tenant. An Enrollment links a Patient to a Program.
*   **Business Meaning:** Allows the trust to manage distinct cohorts of patients and track the success/capacity of specific medical initiatives.

### `appointments`
*   **Purpose:** Schedules meetings between doctors and patients.
*   **Relationships:** Links Patient, Doctor, and Clinic. Tracks status (SCHEDULED, COMPLETED, NO_SHOW).
*   **Business Meaning:** The logistical engine of the clinic. Integrates closely with the SMS module to reduce no-shows.

### `consultations`
*   **Purpose:** The digital medical chart.
*   **Relationships:** Links to an Appointment and a Patient.
*   **Business Meaning:** Captures the actual medical interaction: Symptoms, Diagnosis, Treatment Plan, and Medications. The most sensitive table in the database.

## System Tables

### `audit_logs`
*   **Purpose:** The system's memory. Captures every CREATE, UPDATE, DELETE across the platform.
*   **Relationships:** Standalone compliance record.
*   **Business Meaning:** Mandatory for NHS DSPT compliance. Stores the exact JSON state of records before and after mutation. Never deleted.

### `sms_communications`
*   **Purpose:** A log of all outbound Twilio text messages.
*   **Relationships:** Links to a Patient.
*   **Business Meaning:** Provides proof of communication for compliance and helps audit the effectiveness of appointment reminders.

---

# SECTION 8 â€“ API ARCHITECTURE

The Caremesh backend API is a classic, highly structured RESTful Express 5 server. It does not use GraphQL. It relies heavily on middleware for security and request processing.

## The Request Flow

Understanding how a request moves through the system is critical. The architecture forces every request through a rigid pipeline:

**1. Browser (Frontend Request)**
The React frontend, using a generated React Query hook, makes an HTTPS request (e.g., `PATCH /api/patients/123`). The `credentials: 'include'` flag ensures the HttpOnly JWT cookies are sent.

**2. Authentication Middleware (`authenticate`)**
The request hits the Express router. The very first middleware checks for the `access_token` cookie. It verifies the cryptographic signature of the JWT using `JWT_SECRET`. If invalid or expired, it returns 401 Unauthorized. If valid, it decrypts the payload and attaches the user object to `req.user`.

**3. Tenant Isolation Middleware (`requireTenant`)**
The next middleware inspects `req.user`. It extracts the `tenantId` and explicitly attaches it to `req.tenantId`. If a user does not have a tenant ID (and is not a Super Admin), the request is killed with a 403 Forbidden.

**4. Authorization Middleware (`authorize`)**
The request is checked against RBAC rules. Does the user's role permit them to access this specific route? For example, an `OPERATOR` attempting to hit `DELETE /api/users/456` will be rejected here.

**5. Validation Middleware (`validateBody`)**
Before any logic executes, the request body is passed through a Zod schema (generated by Orval). If the frontend sends a `string` where an `enum` was expected, Zod throws an error, and the middleware intercepts it, returning a clean 400 Bad Request with specific field errors. The bad data never reaches the controller.

**6. The Controller / Route Handler**
The actual business logic runs. The controller extracts the validated data. **Crucially, every Prisma database call within the controller MUST include `where: { tenantId: req.tenantId! }`.** 

**7. Tenant Assertion (`assertTenantMatch`)**
If the controller fetches an existing record to update it, it passes the fetched record through `assertTenantMatch(req, record.tenantId)`. This prevents ID-hopping (e.g., User A guessing the ID of User B's patient and trying to update it).

**8. Audit Logging**
After the database mutation, an asynchronous call is made to `createAuditLog()`. It captures the before/after state, the user ID, and the IP address.

**9. Response**
The updated record is serialized to JSON and sent back to the client.

## Error Handling
Express 5 native Promise handling means unhandled rejections no longer crash the server. They are caught by a global error handler middleware at the bottom of the stack, which logs the error via `pino` and returns a generic 500 Internal Server Error to the client, ensuring stack traces are never leaked in production.

---

# SECTION 9 â€“ SECURITY ARCHITECTURE

Security is not an afterthought in Caremesh PMS; it is the foundational pillar upon which the entire architecture rests. Operating in the healthcare sector means dealing with highly sensitive Personally Identifiable Information (PII) and Protected Health Information (PHI).

## 1. Authentication: Custom JWT & Refresh Tokens
*   **Mechanism:** Instead of storing session IDs in the database and checking them on every request, Caremesh uses stateless JSON Web Tokens.
*   **The Problem it Solves:** Allows the API to scale instantly without bottlenecking on a session database.
*   **Security Implementation:** 
    *   **Access Tokens:** Extremely short-lived (8 hours). Even if intercepted, the window of exploitation is small.
    *   **Refresh Tokens:** Long-lived (30 days), but stored securely in the `refresh_tokens` database table.
    *   **Storage:** Both tokens are sent to the client via `HttpOnly`, `Secure`, `SameSite=Lax` cookies. This makes it impossible for malicious JavaScript (XSS attacks) to read or steal the tokens.

## 2. Authorization: Role-Based Access Control (RBAC) & Dynamic Permissions
*   **Mechanism:** Users are assigned roles (e.g., DOCTOR, CLINIC_ADMIN). Express middleware intercepts requests and checks these roles.
*   **The Problem it Solves:** Prevents unauthorized lateral movement. A staff member cannot accidentally delete a clinic configuration.
*   **Current State vs. Ideal State:** Currently, the system uses static role checking against groups (`ADMIN_ROLES`, `CLINICAL_ROLES`). The architecture supports fully dynamic permission matrices (via the `role_permissions` table), allowing a Super Admin to tweak exact read/write capabilities per role. *Note: Enforcing these dynamic permissions at runtime is an open Technical Debt item.*

## 3. The Ultimate Defense: Tenant Isolation
*   **Mechanism:** Row-level multi-tenancy. Every single API route, every single Prisma query, is hard-coded to require the `tenantId` extracted from the cryptographically secure JWT.
*   **The Problem it Solves:** Data leakage. If Trust A and Trust B share the platform, a bug in the UI or a manipulated API request must *never* allow Trust A to see Trust B's patients.
*   **Why it exists:** It is the core contractual obligation of a B2B SaaS platform. Without this, the platform cannot be legally sold.

## 4. The Immutable Audit Log
*   **Mechanism:** An interceptor that fires on every POST, PATCH, and DELETE request. It captures `userId`, `action`, `entityType`, `entityId`, and a complete JSON stringified snapshot of the data `before` and `after`.
*   **The Problem it Solves:** "Who changed the dosage on John's medical record?" In a standard database, the old data is overwritten and lost forever. In Caremesh, the Audit Log provides absolute, non-repudiable proof of exactly who made the change and what it was previously. This is a hard requirement for NHS compliance.

## 5. Security Vulnerabilities (Current Status)
As an open, honest knowledge transfer document, we must acknowledge current gaps:
*   **CSRF (Cross-Site Request Forgery):** Because we use cookie-based auth, we are theoretically vulnerable to CSRF. While `SameSite=Lax` mitigates much of this on modern browsers, a dedicated CSRF token mechanism (or double-submit cookie pattern) is required before a production release.
*   **File Upload Security:** Currently, uploaded patient files are stored on the local disk of the Node server. This is insecure and ephemeral. These must be moved to an encrypted S3 bucket, with access mediated via presigned, time-expiring URLs.

[END OF PART 2]
# SECTION 10 â€“ DASHBOARD & REPORTING

The Caremesh Dashboard is the central command center for all users. Its data is dynamically scoped based on the logged-in user's role and Tenant. A Clinic Admin sees data only for their clinic; an Area Admin sees aggregate data for all clinics in their area.

## Key Dashboard Widgets

### 1. Total Active Patients KPI Card
*   **What it is:** A numerical count of all patients currently not discharged.
*   **Who uses it:** All administrative staff.
*   **Business Value:** Provides an immediate pulse on the volume of active care being delivered.

### 2. Patients by Status Chart (Recharts Pie Chart)
*   **What it is:** A visual breakdown of patients across their derived Journey Statuses (e.g., NEW, PSI, MEDICATION_REQUIRED).
*   **Who uses it:** Clinical Leads and Area Admins.
*   **Business Value:** Identifies process bottlenecks. If 80% of a clinic's patients are stuck in "NEW", it indicates a massive failure in the initial assessment pathway, prompting immediate management intervention.

### 3. Program Enrollments Stats
*   **What it is:** A count of active vs. completed enrollments across various treatment programs.
*   **Who uses it:** Trust Management.
*   **Business Value:** If the Trust receives funding specifically for "Cognitive Behavioral Therapy" delivery, this widget proves the volume of service being rendered to secure that funding.

### 4. Appointments by Clinic / Doctor (Recharts Bar Chart)
*   **What it is:** Visualizes scheduled vs. completed vs. no-show appointments.
*   **Who uses it:** Clinic Admins.
*   **Business Value:** Workload balancing. If Doctor A has 40 appointments and Doctor B has 5, the admin must rebalance the schedule. High "no-show" rates highlight a need for better SMS reminder campaigns.

### 5. Recent Activity Feed
*   **What it is:** A live stream of the most recent entries from the `audit_logs` table.
*   **Who uses it:** Super Admins and Security Officers.
*   **Business Value:** Transparency. If a mass deletion of records begins, an admin looking at the dashboard will see it happening in real-time.

---

# SECTION 11 â€“ REAL-WORLD EXAMPLE

To synthesize all the theoretical architecture, let us walk through a complete, realistic scenario demonstrating how data moves through the Caremesh system.

**The Scenario: Treating Patient John Doe**

1. **Registration (The Operator):** 
   *   An operator at the Northgate Clinic receives a referral letter for a new patient, John Doe. 
   *   They log into Caremesh, navigate to Patients, and click "Add Patient". 
   *   They enter his NHS number, name, and mobile number. 
   *   *System Event:* A new row is created in `patients`. An `audit_log` row is created. A default `patient_journey_event` (INACTIVE) is created.

2. **Enrollment (The Clinic Admin):**
   *   The Clinic Admin reviews John's file and assigns him to Dr. Sarah Jenkins. 
   *   The Admin then enrolls John into the "General Psychiatric Assessment" program.
   *   *System Event:* Row created in `program_enrollments`. Notification triggered to Dr. Jenkins's dashboard.

3. **Appointment Scheduling & SMS (The Admin):**
   *   The Admin schedules an initial assessment for Friday. 
   *   They trigger an SMS: "Hi John, your assessment is this Friday."
   *   *System Event:* Row created in `appointments`. Twilio API called. Row created in `sms_communications`. Delivery webhook later updates SMS status to `DELIVERED`.

4. **Consultation (Dr. Jenkins):**
   *   Friday arrives. Dr. Jenkins opens John's profile on her tablet. 
   *   She clicks the appointment and clicks "Record Consultation". 
   *   She types in her symptoms, observations ("Patient exhibiting signs of acute anxiety"), and a treatment plan.
   *   *System Event:* Massive text payload inserted into `consultations`. The system automatically generates a `patient_journey_event` of `CONSULTATION_COMPLETED`.

5. **Task Assignment (Dr. Jenkins):**
   *   Dr. Jenkins needs blood work done before prescribing medication. 
   *   She creates a Task assigned to the clinic's phlebotomist.
   *   *System Event:* Row created in `tasks` linked to John Doe.

6. **Outcome Tracking (Dr. Jenkins):**
   *   Weeks later, after several sessions, Dr. Jenkins records a standardized GAD-7 (Anxiety) outcome score. 
   *   *System Event:* Row created in `outcomes`. The React frontend plots this new data point on John's historical outcome graph, visually demonstrating improvement.

---

# SECTION 12 â€“ CHALLENGES FACED

Building an enterprise-grade healthcare platform is not without friction. Documenting these challenges ensures future maintainers understand *why* certain non-obvious technical decisions were made.

### 1. Architecture Challenge: The Multi-Tenant Migration
*   **Problem:** Early in development, the system was built without tenant isolation. Adding it retroactively required touching every single query in the application.
*   **Root Cause:** Initial failure to anticipate the B2B SaaS business model requiring strict NHS Trust separation.
*   **Resolution:** A massive refactor implementing the `tenantId` column across all operational tables, and the introduction of the non-bypassable `requireTenant` middleware.

### 2. Database Challenge: Modeling Patient Status
*   **Problem:** Originally, `Patient` had a `status` enum column. Every time it changed, the old status was lost. Auditors flagged this as non-compliant.
*   **Root Cause:** Standard CRUD thinking applied to healthcare data, which requires event sourcing principles.
*   **Resolution:** Removed the status column. Implemented the `patient_journey_events` table as an append-only log. The frontend now dynamically calculates current status by querying the most recent event.

### 3. Frontend Challenge: Component Bloat on Patient Detail Page
*   **Problem:** As features grew (Appointments, Consultations, Files, Comms), the `patient-detail.tsx` file became a massive, unreadable wall of cards.
*   **Root Cause:** Rapid prototyping without establishing a scalable UI layout pattern.
*   **Resolution (In Progress):** A refactoring effort (documented in Technical Debt) to convert the page from a vertical stack of cards into a clean, horizontal shadcn `<Tabs>` layout.

### 4. Security Challenge: Handling Express Async Errors
*   **Problem:** In Express 4, if a database query inside an async route handler failed and threw an error, the entire Node.js server would crash.
*   **Root Cause:** Express 4 does not natively handle rejected promises in route handlers.
*   **Resolution:** Migrated the entire backend to Express 5 beta/RC, which natively catches async rejections and passes them to the global error handler, ensuring platform stability.

---

# SECTION 13 â€“ BUG HISTORY

A historical log of critical bugs, serving as a warning and learning tool for new developers.

### Bug 1: The AuthGuard Infinite Refresh Loop
*   **What happened:** Users were caught in an infinite redirect loop between `/login` and `/dashboard`.
*   **Root Cause:** The React Query hook fetching user data was failing, triggering the `AuthGuard` to redirect to login. However, the login page saw a valid token cookie and redirected back to the dashboard.
*   **Resolution:** Implemented explicit 401 handling in the global React Query interceptor to forcefully clear the auth state and halt the loop.

### Bug 2: Missing Consultation Deletion
*   **What happened:** Doctors could create consultations but could not delete them if they made a mistake.
*   **Root Cause:** The `DELETE /api/consultations/:id` endpoint was completely forgotten during the initial module build.
*   **Resolution:** Added the endpoint with strict soft-delete (`deletedAt = now()`) and mandatory audit logging, as hard-deleting medical records is illegal.

### Bug 3: Permission Matrix Bypass
*   **What happened:** A Super Admin used the UI to revoke the `DELETE_PATIENT` permission from the `CLINIC_ADMIN` role, but Clinic Admins could still delete patients.
*   **Root Cause:** The backend middleware `authorize()` was only checking if the user had the *title* of `CLINIC_ADMIN`, completely ignoring the `role_permissions` database table.
*   **Resolution (Pending):** Currently logged as High Priority Technical Debt. The middleware must be rewritten to perform granular permission lookups against the database.

---

# SECTION 14 â€“ CURRENT KNOWN ISSUES

As of the last audit (June 2026), the platform is functionally complete for core pathways but carries several significant issues that must be addressed prior to a live production launch.

## Open Bugs & Technical Debt

### 1. No Automated Test Suite (CRITICAL)
*   **Impact:** Any developer modifying core logic (like the auth middleware) risks silently breaking production. 
*   **Priority:** CRITICAL. 
*   **Recommended Fix:** Halt feature development and implement Vitest unit tests for the API and Playwright e2e tests for the critical clinical pathways.

### 2. Missing CSRF Protection (HIGH)
*   **Impact:** While HttpOnly cookies protect against XSS token theft, the application is theoretically vulnerable to Cross-Site Request Forgery.
*   **Priority:** HIGH.
*   **Recommended Fix:** Implement a double-submit cookie pattern or a dedicated `csurf` middleware for all state-mutating requests.

### 3. File Uploads to Ephemeral Storage (MEDIUM)
*   **Impact:** When a user uploads a medical file, it is saved to the local Node.js server disk via Multer. In a cloud environment (like Render or AWS ECS), local disks are ephemeral. When the server restarts, all uploaded medical files are deleted.
*   **Priority:** MEDIUM.
*   **Recommended Fix:** Rip out the local Multer disk storage and integrate AWS S3 using pre-signed URLs.

### 4. Stale Frontend Enum Matches (LOW)
*   **Impact:** Several frontend badge components check for titlecase strings (e.g., `status === 'Active'`). The database and API strictly return SCREAMING_SNAKE_CASE (`ACTIVE`). The badges fail to render correct colors.
*   **Priority:** LOW.
*   **Recommended Fix:** Search the frontend codebase for status strings and update them to match the exact Prisma enum values.

[END OF PART 3]
# SECTION 15 â€“ PROJECT STATUS

As of the latest repository audit, Caremesh PMS stands at a high level of functional maturity but requires final security hardening before a production release.

## Overall Completion Metrics
*   **Database Schema & Migrations:** 100% Complete. 21 highly relational Prisma models mapped to PostgreSQL.
*   **API Backbone (Express):** 90% Complete. All core CRUD, tenant isolation, and audit middleware are functioning.
*   **Frontend UI Framework:** 85% Complete. Navigation, auth flow, and core data tables are styled and operational.
*   **Production Readiness Score:** 75/100. The core works, but the absence of an automated test suite and proper file storage prevents immediate NHS deployment.

## Module Status Breakdown

**Completed Modules:**
*   Authentication & JWT Management
*   Multi-Tenant Data Isolation
*   Patient Demographic Management
*   Bulk CSV Ingestion
*   Patient Journey Event Logging
*   Appointment Scheduling
*   Consultation Notes (Digital Chart)
*   Program Enrollments
*   Twilio SMS Integration

**Partial / Incomplete Modules:**
*   **Role-Based Access Control (RBAC):** UI exists, database exists, but runtime middleware enforcement is hardcoded instead of checking the database.
*   **File Management:** Upload works, but relies on ephemeral local storage instead of cloud object storage.
*   **Reporting:** Basic dashboard widgets exist, but several complex aggregations (e.g., Consultations by Program) are missing from the API.

---

# SECTION 16 â€“ FUTURE ROADMAP

Caremesh is designed not just to track patients, but to actively improve healthcare delivery. The roadmap reflects a shift from "data recording" to "intelligent automation."

## Short Term (Next 3 Months)
*   **Test Suite Implementation:** Achieve 80% code coverage via Vitest and Playwright.
*   **Cloud Infrastructure Setup:** Migrate file uploads to AWS S3. Deploy database to managed AWS RDS for automated backups and high availability.
*   **Security Audit:** Remediate the CSRF vulnerability and finalize dynamic RBAC enforcement.

## Medium Term (6 - 12 Months)
*   **Advanced Outcome Tracking & Analytics:** Expand the outcomes module. Build dynamic Recharts graphs that correlate specific treatment programs with improved patient scores over time, allowing Trusts to prove the clinical efficacy of their programs.
*   **Notification Automation Rules Engine:** Allow Area Admins to define custom rules (e.g., "If patient is in NEW status for > 7 days, trigger SMS to patient and Notification to assigned doctor").
*   **EMIS / SystmOne Integration:** The holy grail of UK healthcare software. Build bi-directional API bridges so Caremesh can automatically pull GP details and clinical history from the primary NHS databases, eliminating double data entry.

## Long Term (12+ Months)
*   **Predictive Risk Scoring (AI/ML):** Enhance the nightly `RiskScoringService`. Train a model on historical data to flag patients at high risk of dropping out of programs or missing appointments based on demographic and interaction patterns.
*   **Patient-Facing Mobile Application:** A secure app where patients can view their upcoming appointments, complete pre-consultation questionnaires, and secure-message their care team.

---

# SECTION 17 â€“ NEW DEVELOPER ONBOARDING GUIDE

Welcome to Caremesh! If you are a new developer, follow this guide precisely. If you skip steps, your local environment will break.

## 1. Local Environment Setup
You must have Node.js (v20+), pnpm, and Docker (for PostgreSQL) installed.
*   Clone the repository.
*   Run `pnpm install` in the root directory to install all monorepo dependencies.
*   Copy `.env.example` to `.env` in the root and configure your local variables. Ensure `JWT_SECRET` is set.

## 2. Database & Schema Generation
*   Start your local PostgreSQL instance.
*   Navigate to `artifacts/api-server`.
*   Run `pnpm run db:push` to sync the Prisma schema (`schema.prisma`) to your local database.
*   (Optional) Run the seed script or manually inject `MUMBAI_SEED.sql` to populate dummy data.

## 3. Running the Stack
The project uses pnpm workspaces. You can run both the frontend and backend concurrently from the root:
*   Run `pnpm run dev`. This utilizes `turbo` or concurrent scripts to boot the Express server (usually port 3000) and the Vite frontend (usually port 5173).

## 4. The Golden Rule: API Contract First
Caremesh uses an OpenAPI-driven development workflow. **Never write a backend route or a frontend fetch call first.**
1.  Open `lib/api-spec/openapi.yaml`.
2.  Define your new endpoint, its request body, and its response schema.
3.  Run `pnpm --filter @workspace/api-spec run codegen`.
4.  The system will automatically generate the Zod validation schemas for your Express route, and the React Query hooks for your Vite frontend.
5.  *Now* you may write the implementation code.

## 5. Security Mandates for Backend Devs
*   **Never trust input.** Always pass requests through the generated Zod `validateBody` middleware.
*   **Never forget the Tenant.** Every single `findFirst` or `findMany` Prisma query you write MUST include `where: { tenantId: req.tenantId! }`. If you forget this, you create a catastrophic cross-tenant data leak.
*   **Never hard-delete.** Unless it's a mapping table, always use `update: { deletedAt: new Date() }`.

## 6. How to Debug
*   **Backend:** Do not use `console.log`. Use `req.log.info()` or `logger.error()`. Check the terminal output for the structured Pino logs.
*   **Frontend:** Utilize the React Query Devtools. If data isn't rendering, the React Query cache is the first place you should look. Ensure your API responses exactly match the OpenAPI spec, or React Query will fail to deserialize them.

---

# SECTION 18 â€“ FINAL EXECUTIVE SUMMARY

**What has been built?**
Caremesh PMS is a robust, multi-tenant healthcare operating system. It provides a highly secure, logically isolated environment where complex organizations like NHS mental health trusts can manage patient demographics, track clinical journey events, schedule appointments, record sensitive medical consultations, and communicate via integrated SMS.

**Why it matters?**
It eliminates the dangerous fragmentation of medical data. By centralizing the patient journey and enforcing an immutable, non-bypassable audit log for every single system action, it guarantees both operational transparency and stringent regulatory compliance (DSPT). It saves administrative time, prevents patients from being lost in the system, and allows doctors to focus on care rather than paperwork.

**Current maturity level & Remaining work:**
The system's core architectureâ€”database schemas, API logic, frontend state management, and tenant isolationâ€”is exceptionally sound and fully functional. The remaining work is strictly focused on production hardening: implementing a rigorous automated test suite, migrating local file uploads to cloud object storage, patching a known CSRF theoretical vulnerability, and finalizing the runtime enforcement of the dynamic permission matrix.

**Long-term vision:**
Caremesh is positioned to be more than a passive repository of medical data. With the foundation now built, the future roadmap focuses on automated intelligenceâ€”using predictive risk scoring to proactively flag vulnerable patients, and integrating directly with national NHS databases to create a truly seamless, bi-directional healthcare ecosystem.

---
*Document Version: 1.0 (Definitive Architecture & Workflow)*
*Target Audience: Engineers, Auditors, Clinical Leads, Product Managers.*
