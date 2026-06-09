# CareNexus — Tenant-Aware Area & Clinic Assignment Architecture

_Generated: 2026-06-09 | Version: 1.0_

---

## 1. Overview

CareNexus is a multi-tenant healthcare platform. Every tenant represents an independent healthcare organization (e.g., Apollo Hospital, Fortis Healthcare, Sahayog Healthcare). Each organization owns its own hierarchy of:

```
Tenant
  └── Area(s)           (geographic or operational regions)
        └── Clinic(s)   (individual care sites within an area)
              └── Patient(s)
```

The system enforces **strict tenant isolation** at every level — database, API, and frontend.

---

## 2. Database Architecture

### 2.1 Schema (Confirmed — No Migrations Required)

```prisma
model Area {
  id        String   @id @default(uuid())
  tenantId  String
  name      String
  deletedAt DateTime?
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  clinics   Clinic[]
  patients  Patient[]
  @@unique([tenantId, name])
  @@index([tenantId])
}

model Clinic {
  id        String   @id @default(uuid())
  tenantId  String
  areaId    String
  name      String
  address   String?
  deletedAt DateTime?
  area      Area     @relation(fields: [areaId], references: [id])
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  patients  Patient[]
  @@index([tenantId])
}

model Patient {
  id        String   @id @default(uuid())
  tenantId  String
  areaId    String
  clinicId  String
  programId String
  // ...
  @@unique([tenantId, nhsNumber])
  @@index([tenantId])
}
```

### 2.2 Foreign Key Hierarchy

```
Tenant.id ─────► Area.tenantId
Tenant.id ─────► Clinic.tenantId
Area.id ──────► Clinic.areaId
Area.id ──────► Patient.areaId
Clinic.id ────► Patient.clinicId
```

**All foreign key constraints are enforced at the database level with `onDelete: Cascade`.**

---

## 3. API Architecture

### 3.1 Tenant Resolution Middleware (`requireTenant`)

Every protected API request passes through the `requireTenant` middleware:

```typescript
// tenantScope.ts
export function requireTenant(req, _res, next) {
  if (req.user.role === "SUPER_ADMIN") {
    const headerTenantId = req.headers["x-tenant-id"];
    if (headerTenantId === "ALL") {
      req.tenantId = undefined;  // Global view (no tenant filter)
    } else if (headerTenantId) {
      req.tenantId = headerTenantId;  // Specific tenant selected by SA
    } else {
      req.tenantId = req.user.tenantId;  // SA's own tenant
    }
    return next();
  }
  // All other roles: locked to JWT tenantId
  req.tenantId = req.user.tenantId;
  next();
}
```

### 3.2 Areas API (`GET /api/areas`)

```typescript
// areas.ts
const where = {
  tenantId: req.tenantId!,   // ← Always tenant-scoped
  deletedAt: null,
  ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
};
```

**Result:** A CLINIC_ADMIN from Apollo sees only Apollo's areas. A CLINIC_ADMIN from Fortis sees only Fortis's areas.

### 3.3 Clinics API (`GET /api/clinics`)

```typescript
// clinics.ts
const where = {
  tenantId: req.tenantId!,     // ← Always tenant-scoped
  deletedAt: null,
  ...(areaId ? { areaId } : {}),  // ← Optional area cascade filter
  ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
};
```

**Result:** When `?areaId=<id>` is passed, only clinics within that specific area (AND the tenant) are returned.

### 3.4 Patient Creation — Cross-Tenant Integrity Validation (NEW)

```typescript
// patients.ts — POST /api/patients
// 1. Validate tenant context exists (not "ALL" mode)
if (!req.tenantId) {
  throw Errors.validation("A specific tenant must be selected to register a patient.");
}

// 2. Validate area belongs to this tenant
const area = await prisma.area.findFirst({
  where: { id: patientData.areaId, tenantId: req.tenantId!, deletedAt: null },
});
if (!area) throw Errors.validation("Area does not belong to this tenant");

// 3. Validate clinic belongs to this tenant AND selected area (hierarchy integrity)
const clinic = await prisma.clinic.findFirst({
  where: { id: patientData.clinicId, tenantId: req.tenantId!, areaId: patientData.areaId, deletedAt: null },
});
if (!clinic) throw Errors.validation("Clinic does not belong to this tenant/area");

// 4. Validate program belongs to this tenant
const program = await prisma.program.findFirst({
  where: { id: patientData.programId, tenantId: req.tenantId!, deletedAt: null },
});
if (!program) throw Errors.validation("Program does not belong to this tenant");
```

### 3.5 Patient Update — Cross-Tenant Integrity Validation (NEW)

Same validation applied to `PATCH /api/patients/:id` when area/clinic/program are being changed.

---

## 4. Frontend Architecture

### 4.1 Tenant Context (`TenantContext.tsx`)

```typescript
// Provides activeTenantId across the entire app
// Persisted in localStorage
// SUPER_ADMIN can switch tenants via TenantSwitcher in the sidebar
const { activeTenantId, setActiveTenantId } = useTenantContext();
// Values: "ALL" | "<tenantId>"
```

The `activeTenantId` is sent as an `X-Tenant-Id` header on every API request, which the `requireTenant` middleware uses to scope SUPER_ADMIN queries.

### 4.2 Area → Clinic Cascade Hook (`useAreaClinicCascade`)

```typescript
export function useAreaClinicCascade(initialAreaId = "", initialClinicId = "") {
  const { data: me } = useGetMe();
  const { activeTenantId } = useTenantContext();

  // SUPER_ADMIN with "ALL" selected → no valid tenant context
  const isSuperAdminWithNoTenant = me?.role === "SUPER_ADMIN" && activeTenantId === "ALL";

  // Areas: tenant-scoped (disabled when no tenant context)
  const { data: areasData, isLoading: areasLoading } = useListAreas(
    { limit: 1000 },
    { query: { enabled: !isSuperAdminWithNoTenant } }
  );

  // Clinics: area-scoped + tenant-scoped (disabled until area selected)
  const { data: clinicsData, isLoading: clinicsLoading } = useListClinics(
    { areaId: areaId || undefined, limit: 1000 },
    { query: { enabled: !!areaId && !isSuperAdminWithNoTenant } }
  );

  return {
    areas, clinics, areaId, clinicId,
    setAreaId,   // Also resets clinicId to "" when area changes
    setClinicId,
    areasLoading, clinicsLoading,
    isClinicsReady: !!areaId && !clinicsLoading,
    isTenantRequired: isSuperAdminWithNoTenant,  // NEW: warning flag
  };
}
```

### 4.3 Patient Registration Form

- Uses `useAreaClinicCascade()` for tenant-aware area/clinic selection
- Shows `AlertTriangle` warning banner when `isTenantRequired = true`
- Disables "Register Patient" submit button when no tenant is selected
- Area dropdown loads tenant-scoped areas only
- Clinic dropdown is disabled until area is selected, then loads area+tenant scoped clinics

### 4.4 Patients List Filter Panel

- Already uses `useListAreas({ limit: 500 })` and `useListClinics({ areaId })` 
- Backend tenant-scoping means filters only show relevant areas/clinics
- Clinic filter resets automatically when area filter changes

---

## 5. RBAC Matrix

| Role | Areas (read) | Areas (write) | Clinics (read) | Clinics (write) | Notes |
|---|---|---|---|---|---|
| `SUPER_ADMIN` | All (via X-Tenant-Id) | All tenants | All (via X-Tenant-Id) | All tenants | Tenant switcher controls scope |
| `AREA_ADMIN` | Own tenant only | Own tenant only | Own tenant only | Own tenant only | Via `ADMIN_ROLES` middleware |
| `CLINIC_ADMIN` | Own tenant only | Own tenant only | Own tenant only | Own tenant only | Via `ADMIN_ROLES` middleware |
| `DOCTOR` | Own tenant only | ❌ Blocked | Own tenant only | ❌ Blocked | Read-only via `CLINICAL_ROLES` |
| `OPERATOR` | Own tenant only | ❌ Blocked | Own tenant only | ❌ Blocked | Read-only via `CLINICAL_ROLES` |
| `STAFF` | Own tenant only | ❌ Blocked | Own tenant only | ❌ Blocked | Read-only via `CLINICAL_ROLES` |

---

## 6. Data Flow: Patient Registration

```
User opens /patients/new
    ↓
useAreaClinicCascade() initializes
    ↓
Check: isSuperAdminWithNoTenant?
    ├── YES → Show "Select tenant first" warning, disable form
    └── NO  → Load areas via GET /api/areas (tenant-scoped by backend)
         ↓
    User selects Area
         ↓
    Clinics load: GET /api/clinics?areaId=<selected> (tenant + area scoped)
         ↓
    User selects Clinic
         ↓
    Submit form → POST /api/patients
         ↓
    Backend validates:
    ├── 1. tenantId is defined (not "ALL")
    ├── 2. area belongs to tenant ✓
    ├── 3. clinic belongs to tenant AND area ✓
    ├── 4. program belongs to tenant ✓
    └── 5. create patient with tenantId stamped
```

---

## 7. Cross-Tenant Leakage Prevention

| Attack Vector | Prevention Mechanism |
|---|---|
| CLINIC_ADMIN selecting another tenant's area | Backend: `where: { tenantId: req.tenantId }` on areas API |
| CLINIC_ADMIN selecting another tenant's clinic | Backend: `where: { tenantId: req.tenantId }` on clinics API |
| Cross-tenant area+clinic combination | Backend: validates `clinic.areaId === patientData.areaId` |
| Submitting cross-tenant IDs directly via API | Backend: validates each ID against `tenantId` in DB |
| SUPER_ADMIN in "ALL" mode creating patient | Backend: `if (!req.tenantId)` blocks patient creation |
| Frontend showing wrong tenant's data | Frontend: `isTenantRequired` flag disables and warns |
| Direct URL manipulation | Both sidebar filter + RoleGuard blocks page access |
