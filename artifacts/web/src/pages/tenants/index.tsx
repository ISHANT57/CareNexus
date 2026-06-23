import { useQuery } from "@tanstack/react-query";
import { Building2, Activity, Users, Plus, Map } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { customFetch } from "@workspace/api-client-react";
import { Link } from "wouter";

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
    clinics: number;
  };
}

export default function TenantsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tenants-admin-list"],
    queryFn: async () => {
      const res = await customFetch<{ data: TenantData[] }>("/api/tenants?limit=1000", {
        headers: { "x-tenant-id": "ALL" }
      });
      return res.data;
    },
  });

  return (
    <div className="page-container animate-in-up">
      <div className="page-header">
        <div>
          <h1 className="text-h2">Tenants</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.length ? `${data.length} organizations · ` : ""}Platform governance and tenant isolation management.
          </p>
        </div>
        <Link href="/onboarding">
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Register Tenant
          </Button>
        </Link>
      </div>

      <div className="p-8">
      {!isLoading && (!data || data.length === 0) ? (
        <EmptyState
          icon={Building2}
          title="No tenants yet"
          description="Register your first healthcare organization to begin onboarding areas, clinics, and staff."
          action={
            <Link href="/onboarding">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />Register Tenant
              </Button>
            </Link>
          }
        />
      ) : (
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
                  <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Map className="w-3 h-3" /> Areas
                      </span>
                      <span className="font-semibold">{tenant._count.areas}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Clinics
                      </span>
                      <span className="font-semibold">{tenant._count.clinics}</span>
                    </div>
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
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    Created {format(new Date(tenant.createdAt), "MMM d, yyyy")}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
      )}
      </div>
    </div>
  );
}
