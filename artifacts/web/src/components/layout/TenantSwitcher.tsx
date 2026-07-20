import { useQuery } from "@tanstack/react-query";
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
import { useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { useTenantContext } from "@/contexts/TenantContext";
import { customFetch } from "@workspace/api-client-react";

interface Tenant {
  id: string;
  name: string;
}

export function TenantSwitcher() {
  const { data: user } = useGetMe();
  const { activeTenantId, setActiveTenantId } = useTenantContext();
  const [open, setOpen] = useState(false);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants-list"],
    queryFn: async () => {
      // Temporarily bypass activeTenantId to fetch ALL tenants
      const res = await customFetch<{ data: Tenant[] }>("/api/tenants?limit=1000", {
        headers: { "x-tenant-id": "ALL" }
      });
      return res.data;
    },
    enabled: isSuperAdmin,
  });

  if (!isSuperAdmin) return null;

  const activeTenant = activeTenantId === "ALL" 
    ? { id: "ALL", name: "Platform View (All Tenants)" } 
    : tenants.find((t) => t.id === activeTenantId);

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
            <CommandGroup heading="Tenants">
              {tenants.map((tenant) => (
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
                  <span className="truncate">{tenant.name}</span>
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
