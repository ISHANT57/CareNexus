import { useGetMe } from "@workspace/api-client-react";
import { useTenantContext } from "@/contexts/TenantContext";
import { useEffect } from "react";

export function useActiveRole() {
  const { data: user, isLoading } = useGetMe();
  const { activeTenantId, setActiveTenantId } = useTenantContext();

  const tenantAssignments = user?.tenantAssignments || [];
  const isSuperAdmin = tenantAssignments.some((a: any) => a.role === "SUPER_ADMIN" && a.status === "ACTIVE");
  const firstActiveAssignment = tenantAssignments.find((a: any) => a.status === "ACTIVE");

  // Sync activeTenantId if it is "ALL" and user is not super admin
  useEffect(() => {
    if (user && activeTenantId === "ALL" && !isSuperAdmin && firstActiveAssignment) {
      setActiveTenantId(firstActiveAssignment.tenantId);
    }
  }, [user, activeTenantId, isSuperAdmin, firstActiveAssignment, setActiveTenantId]);

  if (!user) {
    return {
      role: undefined,
      isSuperAdmin: false,
      isClinicAdmin: false,
      isDoctor: false,
      isAreaAdmin: false,
      user,
      activeAssignment: undefined,
      isLoading,
    };
  }

  // Find assignment matching current activeTenantId (or fallback to first active if "ALL" and not superadmin)
  const activeAssignment = (activeTenantId === "ALL" && !isSuperAdmin)
    ? firstActiveAssignment
    : tenantAssignments.find((a: any) => a.tenantId === activeTenantId && a.status === "ACTIVE");
  
  // If a user is globally a super admin, they retain the SUPER_ADMIN role across all tenant scopes
  const role = isSuperAdmin ? "SUPER_ADMIN" : activeAssignment?.role;

  return {
    role,
    isSuperAdmin: role === "SUPER_ADMIN",
    isClinicAdmin: role === "CLINIC_ADMIN",
    isDoctor: role === "DOCTOR",
    isAreaAdmin: role === "AREA_ADMIN",
    user,
    activeAssignment,
    isLoading,
  };
}
