import { Check, ChevronsUpDown, Building2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useMemo } from "react";
import { useGetMe, useListTenants } from "@workspace/api-client-react";
import { useTenantContext } from "@/contexts/TenantContext";

export function TenantSwitcher() {
  const { data: user } = useGetMe();
  const { activeTenantId, setActiveTenantId } = useTenantContext();
  const [open, setOpen] = useState(false);

  // Users can see their assigned tenants
  const tenantAssignments = user?.tenantAssignments || [];
  const isSuperAdmin = tenantAssignments.some(a => a.role === "SUPER_ADMIN");

  const { data: tenantsData } = useListTenants(
    { limit: 500 },
    { request: { headers: { "x-tenant-id": "ALL" } }, query: { enabled: !!isSuperAdmin } as any }
  );

  // Filter out duplicate tenants if they happen to have multiple roles in one tenant
  const uniqueTenants = useMemo(() => {
    if (isSuperAdmin && tenantsData?.data) {
      return tenantsData.data.map((t: any) => ({
        id: t.id,
        name: t.name,
        role: "SUPER_ADMIN",
      }));
    }
    const map = new Map<string, { id: string; name: string; role: string }>();
    for (const a of tenantAssignments) {
      if (a.status === "ACTIVE" && !map.has(a.tenantId)) {
        map.set(a.tenantId, { id: a.tenantId, name: a.tenantName || "Unknown Tenant", role: a.role });
      }
    }
    return Array.from(map.values());
  }, [tenantAssignments, isSuperAdmin, tenantsData]);

  if (uniqueTenants.length <= 1 && !isSuperAdmin) {
    return null; // No need to show switcher if they only have 1 tenant and are not a super admin
  }

  const activeTenant = activeTenantId === "ALL" 
    ? { id: "ALL", name: "Platform View (All Tenants)" } 
    : uniqueTenants.find((t) => t.id === activeTenantId);

  // If a non-superadmin logs in and activeTenant is ALL (from localstorage default), switch to their first tenant
  if (activeTenantId === "ALL" && !isSuperAdmin && uniqueTenants.length > 0) {
    setActiveTenantId(uniqueTenants[0].id);
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between mt-4 bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <div className="flex items-center gap-2 truncate">
            {activeTenantId === "ALL" ? <Globe className="w-4 h-4 shrink-0" /> : <Building2 className="w-4 h-4 shrink-0" />}
            <span className="truncate">
              {activeTenant?.name ?? "Select Tenant..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tenants..." />
          <CommandList>
            <CommandEmpty>No tenant found.</CommandEmpty>
            
            {isSuperAdmin && (
              <CommandGroup heading="Platform">
                <CommandItem
                  value="Platform View (All Tenants)"
                  onSelect={() => {
                    setActiveTenantId("ALL");
                    setOpen(false);
                    window.location.href = "/dashboard"; // hard reload to clear cache
                  }}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Platform View (All Tenants)
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      activeTenantId === "ALL" ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup heading="Your Workspaces">
              {uniqueTenants.map((tenant) => (
                <CommandItem
                  key={tenant.id}
                  value={tenant.name}
                  onSelect={() => {
                    setActiveTenantId(tenant.id);
                    setOpen(false);
                    window.location.href = "/dashboard"; // hard reload to clear cache
                  }}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <div className="flex flex-col items-start truncate">
                    <span className="truncate">{tenant.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{tenant.role.replace("_", " ")}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      activeTenantId === tenant.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
