import { useState, useEffect } from "react";
import { useListAreas, useListClinics } from "@workspace/api-client-react";

/**
 * Shared hook that enforces the Area → Clinic cascade relationship.
 * When an area is selected, only clinics belonging to that area are fetched.
 * When the area changes, the selected clinicId is automatically reset.
 *
 * @param initialAreaId - Pre-selected area (e.g. when editing an existing patient)
 * @param initialClinicId - Pre-selected clinic (e.g. when editing an existing patient)
 */
export function useAreaClinicCascade(
  initialAreaId = "",
  initialClinicId = ""
) {
  const [areaId, setAreaIdInternal] = useState(initialAreaId);
  const [clinicId, setClinicId] = useState(initialClinicId);

  // Fetch all areas (typically < 500 — manageable)
  const { data: areasData, isLoading: areasLoading } = useListAreas({ limit: 500 });

  // Fetch clinics ONLY for the selected area — the backend already supports ?areaId=
  const { data: clinicsData, isLoading: clinicsLoading } = useListClinics(
    { areaId: areaId || undefined, limit: 500 },
    { query: { enabled: !!areaId } as any }
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
  };
}
