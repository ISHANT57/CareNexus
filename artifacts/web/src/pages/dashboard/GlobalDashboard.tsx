import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Users,
  Activity,
  Calendar,
  Stethoscope,
  FileText,
  MapPin,
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
  useGetRecentActivity,
} from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

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

const DONUT_COLORS = ["hsl(218,92%,51%)", "hsl(199,89%,48%)", "hsl(25,100%,55%)", "hsl(265,60%,58%)", "hsl(0,72%,58%)"];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">{p.name}: <span className="font-bold text-foreground">{p.value}</span></p>
      ))}
    </div>
  );
};

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

  const isLoading = statsLoading || tenantsLoading || areasLoading || apptLoading || consultLoading;

  const statusPie = (statusData ?? []).map((s: any) => ({ name: s.status, value: s.count }));
  const topClinics = (apptStats?.appointmentsByClinic ?? [])
    .slice().sort((a: any, b: any) => b.count - a.count).slice(0, 8);
  const topDoctors = (consultStats?.consultationsByDoctor ?? [])
    .slice().sort((a: any, b: any) => b.count - a.count).slice(0, 8);

  return (
    <div>
      {/* Header banner */}
      <div className="border-b border-border px-8 py-6 relative overflow-hidden bg-background">
        {/* AI-style mesh grid — theme-adaptive */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(265 60% 58%) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-12 -right-12 w-80 h-64 rounded-full bg-violet-500/10 dark:bg-violet-500/20 blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between max-w-7xl">
          <div>
            <div className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-1">Super Admin · Platform View</div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Overview</h1>
            <p className="mt-1 text-muted-foreground text-sm">Aggregated metrics across all registered tenants</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground">All Tenants</span>
          </div>
        </div>
      </div>

      <div className="page-container animate-in-up space-y-6">

      {/* ── KPI tiles ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Hospitals / Tenants" value={tenantsData?.meta?.total?.toString() || "0"} subtitle="Registered networks" icon={Building2} variant="primary" href="/tenants" className="interactive-card" />
          <StatCard title="Total Areas" value={areasData?.meta?.total?.toString() || "0"} subtitle="Geographical regions" icon={MapPin} variant="success" href="/areas" className="interactive-card" />
          <StatCard title="Total Clinics" value={stats?.totalClinics?.toString() || "0"} subtitle="Active facilities" icon={Building2} variant="warning" href="/clinics" className="interactive-card" />
          <StatCard title="Total Programs" value={stats?.totalPrograms?.toString() || "0"} subtitle="Running programs" icon={Activity} variant="default" href="/programs" className="interactive-card" />
          <StatCard title="Doctors / Staff" value={stats?.totalUsers?.toString() || "0"} subtitle="Platform accounts" icon={Stethoscope} variant="success" href="/users" className="interactive-card" />
          <StatCard title="Total Patients" value={stats?.totalPatients?.toString() || "0"} subtitle={`${stats?.newPatientsThisMonth || 0} new this month`} icon={Users} variant="primary" href="/patients" className="interactive-card" />
          <StatCard title="Total Appointments" value={apptStats?.totalAppointments?.toString() || "0"} subtitle="All time" icon={Calendar} variant="warning" href="/appointments" className="interactive-card" />
          <StatCard title="Total Consultations" value={consultStats?.totalConsultations?.toString() || "0"} subtitle="All time" icon={FileText} variant="default" href="/patients" className="interactive-card" />
        </div>
      )}

      {/* ── Charts row 1: donut + clinics bar ──────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Patients by Status</CardTitle>
            <CardDescription>Distribution across all tenants</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {statusLoading ? (
              <div className="h-full w-full bg-muted/30 rounded-xl animate-pulse" />
            ) : statusPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="48%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                    {statusPie.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                No patient data found
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Clinics by Appointments</CardTitle>
            <CardDescription>Busiest facilities across the platform</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {apptLoading ? (
              <div className="h-full w-full bg-muted/30 rounded-xl animate-pulse" />
            ) : topClinics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClinics} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="clinicName" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="count" fill="hsl(218,92%,51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                No appointment data found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row 2: doctors bar + activity ───────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Consultations by Doctor</CardTitle>
            <CardDescription>Clinical volume per staff member</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {consultLoading ? (
              <div className="h-full w-full bg-muted/30 rounded-xl animate-pulse" />
            ) : topDoctors.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDoctors} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="doctorName" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="count" fill="hsl(190,80%,45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                No consultation data found
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Platform Activity</CardTitle>
            <CardDescription>System-wide audit trail preview</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />)}</div>
            ) : Array.isArray(activityData) && activityData.length > 0 ? (
              <div className="space-y-6">
                {activityData.map((log: any) => {
                  const isCreate = log.action === "CREATE";
                  const isDelete = log.action === "DELETE";
                  return (
                    <div key={log.id} className="flex items-start">
                      <span className="relative flex h-2 w-2 mr-4 mt-1.5">
                        {isCreate && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isCreate ? 'bg-emerald-500' : isDelete ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                      </span>
                      <div className="ml-2 space-y-1 w-full">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">
                            {log.action}{log.entityType ? ` · ${log.entityType.toLowerCase().replace(/_/g, " ")}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground ml-auto">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate w-48 lg:w-64">
                          By {log.actor?.firstName ? `${log.actor.firstName} ${log.actor.lastName ?? ""}`.trim() : 'System'} ({log.tenant?.name || 'Global'})
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
    </div>
  );
}
