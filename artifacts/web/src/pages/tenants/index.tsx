import { useQuery } from "@tanstack/react-query";
import { Building2, Activity, Users, Plus } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { customFetch } from "@workspace/api-client-react";

interface TenantData {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    users: number;
    patients: number;
    areas: number;
  };
}

export default function TenantsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tenants-admin-list"],
    queryFn: async () => {
      const res = await customFetch<{ data: TenantData[] }>("/api/tenants", {
        headers: { "x-tenant-id": "ALL" }
      });
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground mt-1">
            Platform governance and tenant isolation management.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Register Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          : data?.map((tenant) => (
              <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      {tenant.name}
                    </CardTitle>
                    <Badge variant={tenant.isActive ? "default" : "destructive"}>
                      {tenant.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-xs mt-1">
                    {tenant.domain}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> Users
                      </span>
                      <span className="font-semibold">{tenant._count.users}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Patients
                      </span>
                      <span className="font-semibold">{tenant._count.patients}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-muted-foreground">Created</span>
                      <span className="font-medium text-sm">
                        {format(new Date(tenant.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
