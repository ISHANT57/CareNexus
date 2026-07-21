# Patient Registration Flow Report

## 1. End-to-End Flow Description

The patient registration flow operates on a strict sequence of context propagation and cascading data fetches.

1. **Auth & Tenant Detection:** The user logs in. The backend validates the credentials and returns a JWT/Session containing the user's `id`, `role`, and `tenantId`. The frontend React context stores this state.
2. **Component Mount:** The `PatientRegistration` component mounts. A request is immediately sent to `/api/areas` to populate the first tier of the assignment cascade.
3. **Area Load:** The backend receives the request, extracts the `tenantId` from the auth middleware, and queries the database for matching areas. The frontend renders the Area dropdown.
4. **Clinic Load (Debounced & Cascading):** The user selects an Area. The frontend captures the `selectedAreaId` and dispatches a request to `/api/clinics?areaId={selectedAreaId}`. The backend returns clinics scoped to both the active `tenantId` and the requested `areaId`. The Clinic dropdown unlocks and populates.
5. **Patient Create:** The user fills in the demographic details and submits. The frontend sends a POST request containing the `areaId` and `clinicId`. The backend enforces that both IDs belong to the user's `tenantId`, forcefully injects the `tenantId` into the payload, and saves the `Patient` record.

## 2. API Endpoint Designs

### `GET /api/areas`
* **Purpose:** Fetch areas belonging to the authenticated tenant.
* **Authentication:** Required.
* **Behavior:** 
  * If `SUPER_ADMIN` and an explicit `x-tenant-id` header is passed, fetch areas for that specific tenant.
  * If `CLINIC_ADMIN`, automatically force `tenantId` to the user's JWT `tenantId`.
* **Example Backend Implementation (Express/Node):**
```typescript
router.get("/api/areas", authenticate, async (req, res) => {
  // getRoleScope forces tenant isolation based on role
  const where = {
    tenantId: req.tenantId, // Injected via middleware
    ...(req.query.q ? { name: { contains: req.query.q as string, mode: "insensitive" } } : {})
  };

  const areas = await prisma.area.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 1000 // Support full lists
  });

  res.json({ data: areas });
});
```

### `GET /api/clinics`
* **Purpose:** Fetch clinics belonging to a specific area and tenant.
* **Authentication:** Required.
* **Example Backend Implementation:**
```typescript
router.get("/api/clinics", authenticate, async (req, res) => {
  const { areaId, q } = req.query;

  const where = {
    tenantId: req.tenantId,
    ...(areaId ? { areaId: areaId as string } : {}),
    ...(q ? { name: { contains: q as string, mode: "insensitive" } } : {})
  };

  const clinics = await prisma.clinic.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 1000
  });

  res.json({ data: clinics });
});
```

### `POST /api/patients`
* **Purpose:** Register a new patient.
* **Authentication:** Required.
* **Example Backend Implementation:**
```typescript
router.post("/api/patients", authenticate, async (req, res) => {
  const { areaId, clinicId, fullName, ...otherFields } = req.body;

  // Security Check: Verify area and clinic belong to the tenant
  const validClinic = await prisma.clinic.findFirst({
    where: { id: clinicId, areaId: areaId, tenantId: req.tenantId }
  });

  if (!validClinic) {
    return res.status(403).json({ error: "Invalid clinical assignment for current tenant." });
  }

  // Create patient with forceful tenant scoping
  const patient = await prisma.patient.create({
    data: {
      ...otherFields,
      fullName,
      tenantId: req.tenantId,
      areaId,
      clinicId
    }
  });

  res.status(201).json(patient);
});
```

## 3. React + TypeScript Frontend Logic

The frontend utilizes React Query for intelligent caching and a custom hook to manage the cascading logic.

### Cascading State Management Hook
```typescript
export function useAreaClinicCascade() {
  const [areaId, setAreaId] = useState<string>("");
  const [clinicId, setClinicId] = useState<string>("");

  // Debounced/Cached fetch for areas
  const { data: areasData, isLoading: areasLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: () => fetch('/api/areas').then(res => res.json())
  });

  // Cascading fetch for clinics (Disabled until areaId is present)
  const { data: clinicsData, isLoading: clinicsLoading } = useQuery({
    queryKey: ['clinics', areaId],
    queryFn: () => fetch(`/api/clinics?areaId=${areaId}`).then(res => res.json()),
    enabled: !!areaId // Prevents fetching before Area is selected
  });

  // Reset clinic selection when Area changes
  const handleAreaChange = (newAreaId: string) => {
    setAreaId(newAreaId);
    setClinicId("");
  };

  return {
    areaId,
    clinicId,
    setAreaId: handleAreaChange,
    setClinicId,
    areas: areasData?.data ?? [],
    clinics: clinicsData?.data ?? [],
    areasLoading,
    clinicsLoading
  };
}
```

### Dropdown Rendering Strategy
The UI gracefully degrades based on the cascading state. The `Clinic` dropdown remains disabled and shows a placeholder context until the prerequisite API call resolves.

```tsx
<Select disabled={!areaId || clinicsLoading} value={clinicId} onValueChange={setClinicId}>
  <SelectTrigger>
    {clinicsLoading ? (
      "Loading..."
    ) : !areaId ? (
      "Select area first"
    ) : (
      <SelectValue placeholder="Select clinic" />
    )}
  </SelectTrigger>
  <SelectContent>
    {clinics.map(clinic => (
      <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```
