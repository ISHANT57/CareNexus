# Tenant, Area, and Clinic Mapping Report

## 1. Multi-Tenant Data Model (Prisma Schema)

To achieve true multi-tenant isolation without hardcoding, the database schema strictly enforces a hierarchical relationship where every entity is scoped by a `tenantId`.

```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  users    User[]
  areas    Area[]
  clinics  Clinic[]
  patients Patient[]
  
  @@map("tenants")
}

model Area {
  id        String   @id @default(uuid())
  tenantId  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant   Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  clinics  Clinic[]
  patients Patient[]

  @@index([tenantId])
  @@map("areas")
}

model Clinic {
  id        String   @id @default(uuid())
  tenantId  String
  areaId    String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant   Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  area     Area      @relation(fields: [areaId], references: [id], onDelete: Cascade)
  patients Patient[]

  @@index([tenantId])
  @@index([areaId])
  @@map("clinics")
}

model User {
  id        String   @id @default(uuid())
  tenantId  String?  // Nullable ONLY for platform SUPER_ADMIN
  name      String
  email     String   @unique
  role      String   // e.g., 'SUPER_ADMIN', 'CLINIC_ADMIN'
  
  tenant    Tenant?  @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("users")
}

model Patient {
  id        String   @id @default(uuid())
  tenantId  String
  areaId    String
  clinicId  String
  fullName  String
  
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  area     Area   @relation(fields: [areaId], references: [id])
  clinic   Clinic @relation(fields: [clinicId], references: [id])

  @@index([tenantId])
  @@index([areaId])
  @@index([clinicId])
  @@map("patients")
}
```

## 2. Tenant Isolation at the Data Model Level

The core principle of this architecture is **Tenant Context Propagation**. 

1. **Foreign Keys:** `Area`, `Clinic`, `User` (except Super Admins), and `Patient` all carry a foreign key mapping to `Tenant`. This guarantees that no record can exist in a vacuum.
2. **Compound Filtering:** When fetching `Clinics`, we don't just filter by `areaId`. We filter by `tenantId AND areaId`. This ensures that even if a malicious user guesses an `areaId` belonging to another tenant, the `tenantId` filter blocks the query.
3. **Cascading Deletes:** Removing a tenant automatically removes all their localized data, preventing orphaned records.
4. **Indexes:** High-cardinality multi-tenant queries are optimized by indexing `tenantId` on every child table, ensuring quick scope isolation during `SELECT` operations.

## 3. Example Prisma Queries

### Fetching Areas by Tenant ID
This query dynamically loads the areas for the dropdown without relying on static arrays.

```typescript
// For Clinic Admins: tenantId is automatically injected from the JWT/Session
const areas = await prisma.area.findMany({
  where: {
    tenantId: currentUser.tenantId, // Isolated to the active user's tenant
    name: { contains: searchTerm, mode: "insensitive" } // Optional search
  },
  orderBy: { name: 'asc' },
  take: 100 // Pagination limit
});
```

### Fetching Clinics by Tenant ID + Area ID
This query is triggered after the user selects an Area in the UI.

```typescript
const clinics = await prisma.clinic.findMany({
  where: {
    tenantId: currentUser.tenantId, // Security enforcement
    areaId: selectedAreaId          // Cascading relation
  },
  orderBy: { name: 'asc' },
  take: 100 // Pagination limit
});
```

## 4. Automatic Support for New Tenants

Because this data model relies strictly on dynamic foreign key relations rather than hardcoded configuration files or enum types, **onboarding a new tenant requires zero code changes**.

When "XYZ Hospital" is inserted into the `tenants` table along with its `areas` and `clinics`:
1. The new Clinic Admin signs in.
2. The authentication middleware sets `currentUser.tenantId` to XYZ Hospital's ID.
3. The `findMany` queries execute generically. The database returns XYZ Hospital's areas.
4. The React frontend maps over the returned array, rendering the dropdowns natively.

The platform treats XYZ Hospital exactly the same as any legacy hospital, dynamically adapting the UI to the database state.
