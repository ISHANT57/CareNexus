import { useQuery } from "@tanstack/react-query";
import { 
  Building2, Users, Activity, Calendar, Stethoscope, 
  TrendingUp, MapPin, ShieldAlert, FolderGit2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  customFetch, useGetAppointmentStats, useGetConsultationStats,
  useGetPatientsByStatus, useGetRecentActivity
} from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, PieChart, Pie, Legend
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
  totalTenants: number;
  totalAreas: number;
}

export function GlobalDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["global-dashboard-stats"],
    queryFn: async () => await customFetch<GlobalStats>("/api/reports/dashboard", { headers: { "x-tenant-id": "ALL" } }),
  });

  const { data: statusData, isLoading: statusLoading } = useGetPatientsByStatus({ request: { headers: { "x-tenant-id": "ALL" } }, query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivity({ limit: 10 }, { request: { headers: { "x-tenant-id": "ALL" } }, query: { staleTime: 2 * 60 * 1000 } as any });

  const isLoading = statsLoading || statusLoading || activityLoading;

  // MOCK DATA for premium visualizations
  const growthData = [
    { month: 'Jan', patients: 4000, tenants: 24 },
    { month: 'Feb', patients: 5200, tenants: 28 },
    { month: 'Mar', patients: 6100, tenants: 35 },
    { month: 'Apr', patients: 8400, tenants: 42 },
    { month: 'May', patients: 10200, tenants: 48 },
    { month: 'Jun', patients: 12500, tenants: 55 },
  ];

  const programDist = [
    { name: 'Cardiology', value: 35 },
    { name: 'Mental Health', value: 45 },
    { name: 'Orthopedics', value: 15 },
    { name: 'Pediatrics', value: 5 },
  ];

  return (
    <div className="page-container animate-in-up">
      <PageHeader
        title="Super Admin Overview"
        description="Platform-wide analytics and network health."
        actions={
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" /> All Systems Operational
          </Badge>
        }
      />

      <div className="space-y-8">
        {/* ── TOP KPI CARDS ─────────────────────────────────── */}
        {isLoading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard title="Total Tenants" value={stats?.totalTenants ?? 0} icon={Building2} variant="primary" trend={{ value: 12, label: "vs last month" }} />
            <StatCard title="Total Areas" value={stats?.totalAreas ?? 0} icon={MapPin} variant="primary" trend={{ value: 8, label: "vs last month" }} />
            <StatCard title="Total Clinics" value={stats?.totalClinics ?? 0} icon={Activity} variant="primary" trend={{ value: 15, label: "vs last month" }} />
            <StatCard title="Total Programs" value={stats?.totalPrograms ?? 0} icon={FolderGit2} variant="primary" trend={{ value: 4, label: "vs last month" }} />
            <StatCard title="Active Users" value={stats?.totalUsers ?? 0} icon={Stethoscope} variant="primary" trend={{ value: 22, label: "vs last month" }} />
            <StatCard title="Total Patients" value={stats?.totalPatients ?? 0} icon={Users} variant="primary" trend={{ value: 34, label: "vs last month" }} />
          </div>
        )}

      {/* ── MIDDLE SECTION (CHARTS) ───────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Growth Chart (Spans 2 columns) */}
        <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-muted/20">
            <CardTitle className="text-lg">Platform Growth</CardTitle>
            <CardDescription>Patient and tenant acquisition over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(216, 100%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(216, 100%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Area type="monotone" dataKey="patients" stroke="hsl(216, 100%, 50%)" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Program Distribution */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-muted/20">
            <CardTitle className="text-lg">Program Distribution</CardTitle>
            <CardDescription>Patients enrolled by program type</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[320px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programDist}
                    cx="50%" cy="45%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5} dataKey="value"
                    stroke="none"
                  >
                    {programDist.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={["#0066ff", "#0ba5e9", "#f59e0b", "#1c9d4b"][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── BOTTOM SECTION (LISTS) ────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Audit Logs */}
        <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/20">
            <div>
              <CardTitle className="text-lg">Global Audit Logs</CardTitle>
              <CardDescription>Live feed of system modifications</CardDescription>
            </div>
            <Badge variant="secondary">Live</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
              {activityLoading ? (
                 <div className="p-4 space-y-4">{[...Array(4)].map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : Array.isArray(activityData) && activityData.length > 0 ? (
                activityData.map((log: any) => (
                  <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      log.action === 'CREATE' ? 'bg-success/10 text-success' :
                      log.action === 'DELETE' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                    }`}>
                      {log.action === 'CREATE' ? <TrendingUp className="w-5 h-5" /> : log.action === 'DELETE' ? <ShieldAlert className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "System"} <span className="font-normal text-muted-foreground">{(log.action || '').toLowerCase()}d a</span> {log.entityType?.toLowerCase() || 'record'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        Tenant: {log.tenant?.name || 'System Level'}
                      </p>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground">No recent activity.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/30 bg-muted/20">
            <CardTitle className="text-lg">System Alerts</CardTitle>
            <CardDescription>Warnings and notifications</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              <div className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">API Rate Limit Warning</p>
                  <p className="text-xs text-muted-foreground mt-1">St. Judes Trust is approaching 90% of their API quota.</p>
                </div>
              </div>
              <div className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <FolderGit2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">New Program Template</p>
                  <p className="text-xs text-muted-foreground mt-1">Cardiac Rehab V2 template is now available for all tenants.</p>
                </div>
              </div>
              <div className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold">New Tenant Onboarded</p>
                  <p className="text-xs text-muted-foreground mt-1">London Bridge Hospital completed setup.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
