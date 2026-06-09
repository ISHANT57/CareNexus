import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  Users, 
  Activity, 
  Calendar,
  Stethoscope,
  TrendingUp,
  FileText
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { customFetch } from "@workspace/api-client-react";

interface GlobalStats {
  totalPatients: number;
  activePatients: number;
  totalUsers: number;
  totalClinics: number;
  totalPrograms: number;
  newPatientsThisMonth: number;
  pendingCommunications: number;
  outcomesRecorded: number;
}

export function GlobalDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["global-dashboard-stats"],
    queryFn: async () => {
      // By using x-tenant-id: ALL, the backend naturally drops the tenant filter
      const res = await customFetch<GlobalStats>("/api/reports/dashboard", {
        headers: { "x-tenant-id": "ALL" }
      });
      return res;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">
          Aggregated metrics across all registered tenants.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Patients (Global)"
            value={stats?.totalPatients.toString() || "0"}
            subtitle={`${stats?.newPatientsThisMonth || 0} registered this month`}
            icon={Users}
            trend={{ value: 12 }}
          />
          <StatCard
            title="Active Clinics"
            value={stats?.totalClinics.toString() || "0"}
            subtitle="Across all tenants"
            icon={Building2}
          />
          <StatCard
            title="Total Staff Users"
            value={stats?.totalUsers.toString() || "0"}
            subtitle="Active platform accounts"
            icon={Stethoscope}
          />
          <StatCard
            title="Total Programs"
            value={stats?.totalPrograms.toString() || "0"}
            subtitle="Running clinical programs"
            icon={Activity}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Overall metrics and platform engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Global Patient Growth Chart Placeholder
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
            <CardDescription>System-wide audit trail preview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <span className="relative flex h-2 w-2 mr-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">New Tenant Registered</p>
                  <p className="text-sm text-muted-foreground">
                    Just now
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
