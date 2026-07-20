import { useState, useMemo } from "react";
import { useListTenants } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Activity, Users, Plus, Search, Download, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { exportToCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

export default function TenantsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data, isLoading } = useListTenants(
    { page, limit: PAGE_SIZE },
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );

  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;

  // Real-time filtering
  const filteredTenants = useMemo(() => {
    const list = data?.data ?? [];
    if (!search) return list;
    return list.filter((t: any) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.domain.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.data, search]);

  const handleExport = () => {
    if (!filteredTenants.length) {
      toast({ title: "No data", description: "There are no tenants to export." });
      return;
    }
    const exportData = filteredTenants.map((t: any) => ({
      ID: t.id,
      "Organization Name": t.name,
      Domain: t.domain,
      Status: t.isActive ? "Active" : "Inactive",
      "Total Users": t._count?.users ?? 0,
      "Total Patients": t._count?.patients ?? 0,
      "Created At": format(new Date(t.createdAt), "yyyy-MM-dd")
    }));
    exportToCSV(exportData, `tenants_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="page-container animate-in-up p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Tenant Organizations</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Global governance and isolated workspace management.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handleExport} disabled={isLoading || !filteredTenants.length} className="bg-card hover:bg-muted border-border text-foreground shadow-sm rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/onboarding">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Register Tenant
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations or domains..."
              className="pl-10 h-11 bg-muted/50 border-border focus-visible:bg-card focus-visible:ring-primary/20 rounded-xl transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          {search && <Badge variant="secondary" className="bg-muted text-muted-foreground px-3 py-1 rounded-lg">{filteredTenants.length} matches</Badge>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl bg-card border border-border shadow-sm" />
            ))}
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-border shadow-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-2">No organizations found</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center mb-8">
              {search ? "Try adjusting your search terms." : "Register your first tenant to start managing data."}
            </p>
            {!search && (
              <Link href="/onboarding">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6">Register Tenant</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant: any, index) => (
              <Card 
                key={tenant.id} 
                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card rounded-2xl border border-border hover:border-primary/30 overflow-hidden animate-in-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className={tenant.isActive ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"} variant="outline">
                      {tenant.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{tenant.name}</CardTitle>
                    <CardDescription className="font-mono text-xs text-muted-foreground mt-1.5 font-medium">{tenant.domain}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                    <div className="bg-muted p-3 rounded-xl border border-border">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5" /> Users
                      </span>
                      <span className="font-extrabold text-lg text-foreground">{tenant._count?.users ?? 0}</span>
                    </div>
                    <div className="bg-muted p-3 rounded-xl border border-border">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Activity className="w-3.5 h-3.5" /> Patients
                      </span>
                      <span className="font-extrabold text-lg text-foreground">{tenant._count?.patients ?? 0}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-muted/50 border-t border-border">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Onboarded {format(new Date(tenant.createdAt), "MMM d, yyyy")}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && !search && (
          <div className="flex items-center justify-between pt-4 mt-8 border-t border-border">
            <span className="text-sm font-semibold text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="bg-card border-border rounded-xl shadow-sm h-10" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button variant="outline" className="bg-card border-border rounded-xl shadow-sm h-10" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
