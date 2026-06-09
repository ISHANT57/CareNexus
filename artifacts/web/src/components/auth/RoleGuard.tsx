import { useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  /** Roles that ARE allowed to access this route */
  allowedRoles: string[];
  children: React.ReactNode;
  /** Where to redirect unauthorized users. Defaults to "/dashboard" */
  redirectTo?: string;
}

/**
 * RoleGuard — prevents direct URL access to role-restricted pages.
 *
 * This complements sidebar visibility filtering (which hides nav items)
 * with an actual redirect/block when a user navigates directly to a
 * restricted URL (e.g., typing /tenants in the address bar).
 *
 * Backend APIs are also protected with SUPER_ADMIN_ONLY middleware,
 * so this is a defense-in-depth UX improvement.
 */
export function RoleGuard({ allowedRoles, children, redirectTo = "/dashboard" }: RoleGuardProps) {
  const { data: user, isLoading } = useGetMe({
    query: { queryKey: ["getMe"], retry: false },
  });
  const [, setLocation] = useLocation();

  const isAuthorized = user?.role && allowedRoles.includes(user.role);

  useEffect(() => {
    if (!isLoading && user && !isAuthorized) {
      setLocation(redirectTo);
    }
  }, [isLoading, user, isAuthorized, setLocation, redirectTo]);

  if (isLoading) return null;

  if (!isAuthorized) {
    // Show a brief access-denied UI before redirect takes effect
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground text-sm mt-1">
            You don&apos;t have permission to view this page.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Required role: {allowedRoles.join(" or ")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
