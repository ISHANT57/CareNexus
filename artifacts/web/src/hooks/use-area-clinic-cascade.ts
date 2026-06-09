import { useState, useEffect } from "react";
import { useListAreas, useListClinics } from "@workspace/api-client-react";
import { useGetMe } from "@workspace/api-client-react";
import { useTenantContext } from "@/contexts/TenantContext";

/**
 * Shared hook that enforces the Area → Clinic cascade relationship.
 *
 * Tenant Awareness:
 * - For regular users (CLINIC_ADMIN, DOCTOR, etc.): their JWT tenantId is used
 *   automatically by the backend, so areas/clinics are always scoped to their org.
 * - For SUPER_ADMIN with activeTenantId="ALL": areas are NOT loaded (no valid
 *   tenant context — SUPER_ADMIN must select a specific tenant first).
 * - For SUPER_ADMIN with a specific tenant selected: areas/clinics are scoped to
 *   that tenant via the X-Tenant-Id header sent by the API client.
 *
 * Area → Clinic cascade:
 * - Areas load on mount (tenant-scoped).
 * - Clinics only load after an area is selected, filtered to that area.
 * - Selecting a new area resets the clinic selection.
 *
 * @param initialAreaId   Pre-selected area (for edit flows with existing patient data)
 * @param initialClinicId Pre-selected clinic (for edit flows with existing patient data)
 */
export function useAreaClinicCascade(
  initialAreaId = "",
  initialClinicId = ""
) {
  const [areaId, setAreaIdInternal] = useState(initialAreaId);
  const [clinicId, setClinicId] = useState(initialClinicId);

  const { data: me } = useGetMe({ query: { queryKey: ["getMe"] } });
  const { activeTenantId } = useTenantContext();

  // A SUPER_ADMIN with activeTenantId="ALL" has no specific tenant context
  // → disable area/clinic loading until they select a specific tenant
  const isSuperAdminWithNoTenant =
    me?.role === "SUPER_ADMIN" && activeTenantId === "ALL";

  // Fetch tenant-scoped areas. Limit 1000 to cover large tenants.
  // Backend filters by req.tenantId automatically (set by requireTenant middleware
  // from either the user's JWT or X-Tenant-Id header for SUPER_ADMIN).
  const { data: areasData, isLoading: areasLoading } = useListAreas(
    { limit: 1000 },
    { query: { enabled: !isSuperAdminWithNoTenant } as any }
  );

  // Fetch clinics ONLY for the selected area — backend supports ?areaId=
  // Also tenant-scoped by the backend automatically.
  const { data: clinicsData, isLoading: clinicsLoading } = useListClinics(
    { areaId: areaId || undefined, limit: 1000 },
    { query: { enabled: !!areaId && !isSuperAdminWithNoTenant } as any }
  );

  const areas = areasData?.data ?? [];
  const clinics = clinicsData?.data ?? [];

  // When area changes, reset clinic selection
  const setAreaId = (newAreaId: string) => {
    setAreaIdInternal(newAreaId);
    setClinicId(""); // Reset clinic whenever area changes
  };

  // Sync with initial values (e.g. when patient data loads asynchronously)
  useEffect(() => {
    if (initialAreaId && initialAreaId !== areaId) {
      setAreaIdInternal(initialAreaId);
    }
  }, [initialAreaId]);

  useEffect(() => {
    if (initialClinicId && initialClinicId !== clinicId) {
      setClinicId(initialClinicId);
    }
  }, [initialClinicId]);

  return {
    areaId,
    clinicId,
    setAreaId,
    setClinicId,
    areas,
    clinics,
    areasLoading,
    clinicsLoading,
    /** True if area is selected but clinics are still loading */
    isClinicsReady: !!areaId && !clinicsLoading,
    /** True when SUPER_ADMIN hasn't selected a specific tenant yet */
    isTenantRequired: isSuperAdminWithNoTenant,
  };
}
