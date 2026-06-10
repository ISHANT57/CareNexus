import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  Users, 
  Activity, 
  Calendar,
  Stethoscope,
  TrendingUp,
  FileText,
  MapPin
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  customFetch, 
  useListTenants, 
  useListAreas, 
  useGetAppointmentStats, 
  useGetConsultationStats,
  useGetPatientsByStatus,
  useGetRecentActivity
} from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
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
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["global-dashboard-stats"],
    queryFn: async () => {
      const res = await customFetch<GlobalStats>("/api/reports/dashboard", {
        headers: { "x-tenant-id": "ALL" }
      });
      return res;
    },
  });

  const { data: tenantsData, isLoading: tenantsLoading } = useListTenants({ limit: 1 } as any, { request: { headers: { "x-tenant-id": "ALL" } }, query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: areasData, isLoading: areasLoading } = useListAreas({ limit: 1 } as any, { request: { headers: { "x-tenant-id": "ALL" } }, query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: apptStats, isLoading: apptLoading } = useGetAppointmentStats({ request: { headers: { "x-tenant-id": "ALL" } }, query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: consultStats, isLoading: consultLoading } = useGetConsultationStats({ request: { headers: { "x-tenant-id": "ALL" } }, query: { staleTime: 5 * 60 * 1000 } as any });

  const { data: statusData, isLoading: statusLoading } = useGetPatientsByStatus({ request: { headers: { "x-tenant-id": "ALL" } }, query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivity({ limit: 8 }, { request: { headers: { "x-tenant-id": "ALL" } }, query: { staleTime: 2 * 60 * 1000 } as any });

  const isLoading = statsLoading || tenantsLoading || areasLoading || apptLoading || consultLoading || statusLoading || activityLoading;
  
  const chartColors = ["hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];
  const formattedStatusData = (statusData ?? []).map((s: any) => ({
    name: s.status,
    value: s.count
  }));

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
            title="Total Hospitals/Tenants"
            value={tenantsData?.meta?.total?.toString() || "0"}
            subtitle="Registered healthcare networks"
            icon={Building2}
            href="/tenants"
            className="interactive-card glass-card"
          />
          <StatCard
            title="Total Areas"
            value={areasData?.meta?.total?.toString() || "0"}
            subtitle="Geographical regions"
            icon={MapPin}
            href="/areas"
            className="interactive-card glass-card"
          />
          <StatCard
            title="Total Clinics"
            value={stats?.totalClinics.toString() || "0"}
            subtitle="Active medical facilities"
            icon={Building2}
            href="/clinics"
            className="interactive-card glass-card"
          />
          <StatCard
            title="Total Programs"
            value={stats?.totalPrograms.toString() || "0"}
            subtitle="Running clinical programs"
            icon={Activity}
            href="/programs"
            className="interactive-card glass-card"
          />
          <StatCard
            title="Total Doctors (Staff)"
            value={stats?.totalUsers.toString() || "0"}
            subtitle="Active platform accounts"
            icon={Stethoscope}
            href="/users"
            className="interactive-card glass-card"
          />
          <StatCard
            title="Total Patients"
            value={stats?.totalPatients.toString() || "0"}
            subtitle={`${stats?.newPatientsThisMonth || 0} registered this month`}
            icon={Users}
            href="/patients"
            className="interactive-card glass-card"
          />
          <StatCard
            title="Total Appointments"
            value={apptStats?.totalAppointments?.toString() || "0"}
            subtitle="All time appointments"
            icon={Calendar}
            href="/appointments"
            className="interactive-card glass-card"
          />
          <StatCard
            title="Total Consultations"
            value={consultStats?.totalConsultations?.toString() || "0"}
            subtitle="All time consultations"
            icon={FileText}
            href="/patients"
            className="interactive-card glass-card"
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-card">
          <CardHeader>
            <CardTitle>Global Patient Status Distribution</CardTitle>
            <CardDescription>Aggregation of all patients across tenants</CardDescription>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse flex gap-2"><div className="w-4 h-32 bg-muted rounded"></div><div className="w-4 h-48 bg-muted rounded"></div></div>
              </div>
            ) : formattedStatusData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "hsl(var(--muted)/0.5)" }} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {formattedStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                No patient data found
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 glass-card">
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
            <CardDescription>System-wide audit trail preview</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
               <div className="space-y-4">{[...Array(5)].map((_,i) => <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />)}</div>
            ) : Array.isArray(activityData) && activityData.length > 0 ? (
              <div className="space-y-6">
                {activityData.map((log: any) => {
                  const isCreate = log.action === "CREATE";
                  const isDelete = log.action === "DELETE";
                  const isUpdate = log.action === "UPDATE" || log.action === "PATCH";
                  
                  return (
                    <div key={log.id} className="flex items-start">
                      <span className="relative flex h-2 w-2 mr-4 mt-1.5">
                        {isCreate && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isCreate ? 'bg-emerald-500' : isDelete ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                      </span>
                      <div className="ml-2 space-y-1 w-full">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">{log.action} {log.module}</p>
                          <p className="text-xs text-muted-foreground ml-auto">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate w-48 lg:w-64">
                          By {log.user?.firstName || 'System'} ({log.tenant?.name || 'Global'})
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                No recent activity logged
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
