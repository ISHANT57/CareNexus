import { useState, useMemo } from "react";
import {
  useGetDashboardStats, useGetPatientsByStatus, useGetPatientsByProgram,
  useGetRecentActivity, useGetEnrollmentStats, useGetAppointmentStats,
  useGetConsultationStats, useListProgramEnrollments, useListRiskScores, useGetMe,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  Users, Activity, Building2, FolderGit2, Calendar,
  Stethoscope, Target, AlertCircle, ChevronRight, ShieldAlert,
  UserPlus, Clock
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useTenantContext } from "@/contexts/TenantContext";
import { GlobalDashboard } from "./dashboard/GlobalDashboard";

const ACTION_LABELS: Record<string, string> = { CREATE: "Created", UPDATE: "Updated", DELETE: "Deleted", PATCH: "Modified" };

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-2 pb-2 border-b border-border">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

import { useActiveRole } from "@/hooks/useActiveRole";

export default function DashboardPage() {
  const { isSuperAdmin } = useActiveRole();
  const { activeTenantId } = useTenantContext();

  if (isSuperAdmin && activeTenantId === "ALL") {
    return <GlobalDashboard />;
  }

  return <TenantDashboard />;
}

function TenantDashboard() {
  const { user, isClinicAdmin, isDoctor } = useActiveRole();
  const [programDrillId, setProgramDrillId] = useState<string | null>(null);

  // Use Memoized queries and standard stale time optimizations
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: programData, isLoading: programLoading } = useGetPatientsByProgram({ query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: enrollmentStats, isLoading: enrollmentLoading } = useGetEnrollmentStats({ query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivity({ limit: 6 }, { query: { staleTime: 2 * 60 * 1000 } as any });
  const { data: appointmentStats, isLoading: appointmentLoading } = useGetAppointmentStats({ query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: consultationStats, isLoading: consultationLoading } = useGetConsultationStats({ query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: riskScoresData, isLoading: riskScoresLoading } = useListRiskScores({ limit: 5 } as any, { query: { staleTime: 5 * 60 * 1000 } as any });

  const isLoadingPrimary = statsLoading || enrollmentLoading || appointmentLoading || consultationLoading;
  
  const highRiskPatients = useMemo(() => riskScoresData?.data ?? [], [riskScoresData]);
  const activityList = useMemo(() => activityData ?? [], [activityData]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page-container animate-in-up">
      <div className="space-y-8">

        {/* ── HEADER ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
              {greeting}, {user?.firstName} 👋
            </h1>
            <p className="text-muted-foreground">Here is your clinical network overview for today.</p>
          </div>
          <Badge variant="outline" className="bg-card border-border text-foreground px-4 py-1.5 shadow-sm rounded-lg text-sm font-medium">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            {now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" })}
          </Badge>
        </div>

        {/* ── KPI ROW ─────────────────────────────────────── */}
        {isLoadingPrimary ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {isDoctor ? (
              <>
                <StatCard title="My Patients" value={stats?.totalPatients ?? 0} icon={Users} variant="primary" trend={{ value: 3, label: "this week" }} href="/patients" />
                <StatCard title="Today's Appts" value={appointmentStats?.scheduledAppointments ?? 0} icon={Calendar} variant="primary" trend={{ value: -1, label: "vs yesterday" }} href="/appointments" />
                <StatCard title="Consultations" value={consultationStats?.consultationsThisMonth ?? 0} icon={Stethoscope} variant="primary" trend={{ value: 12, label: "this month" }} href="/patients" />
                <StatCard title="Pending Tasks" value={stats?.pendingCommunications ?? 0} icon={Activity} variant="warning" trend={{ value: 2, label: "urgent" }} />
              </>
            ) : isClinicAdmin ? (
              <>
                <StatCard title="Clinic Patients" value={stats?.totalPatients ?? 0} icon={Users} variant="primary" trend={{ value: 8, label: "this month" }} href="/patients" />
                <StatCard title="Active Programs" value={stats?.totalPrograms ?? 0} icon={FolderGit2} variant="primary" subtitle="Stable" href="/programs" />
                <StatCard title="Staff Members" value={stats?.totalUsers ?? 0} icon={Stethoscope} variant="primary" trend={{ value: 1, label: "new this week" }} href="/users" />
                <StatCard title="Appointments" value={appointmentStats?.scheduledAppointments ?? 0} icon={Calendar} variant="primary" trend={{ value: 15, label: "vs last month" }} href="/appointments" />
              </>
            ) : (
              <>
                <StatCard title="Total Patients" value={stats?.totalPatients ?? 0} icon={Users} variant="primary" trend={{ value: 12, label: "vs last month" }} href="/patients" />
                <StatCard title="Active Enrollments" value={enrollmentStats?.activeEnrollments ?? 0} icon={FolderGit2} variant="primary" trend={{ value: 5, label: "this week" }} href="/programs" />
                <StatCard title="Scheduled Appts" value={appointmentStats?.scheduledAppointments ?? 0} icon={Calendar} variant="primary" trend={{ value: 18, label: "this month" }} href="/appointments" />
                <StatCard title="Active Clinics" value={stats?.totalClinics ?? 0} icon={Building2} variant="primary" subtitle="Stable" href="/clinics" />
              </>
            )}
          </div>
        )}

        {/* ── MAIN CONTENT GRID ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Charts (takes 2 cols) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Enrollment Chart */}
            <Card className="border-border/60 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-border/60 px-6 py-6">
                <CardTitle className="text-lg font-semibold text-foreground">Program Enrollments</CardTitle>
                <CardDescription>Distribution of patients across care pathways</CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[340px]">
                {programLoading ? <Skeleton className="h-full w-full rounded-xl" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={programData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      onClick={(e: any) => e?.activePayload?.[0] && setProgramDrillId(e.activePayload[0].payload.programId)}
                    >
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(209, 100%, 36%)" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(192, 91%, 36%)" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="programName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dx={-10} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                      <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} style={{ cursor: "pointer" }} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Success Outcomes Card */}
            <Card className="border-border/60 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-border/60 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">Clinical Outcomes</CardTitle>
                    <CardDescription>Patient improvement rates across programs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                 {statsLoading ? <Skeleton className="w-full h-40 rounded-xl" /> : (
                   <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
                     <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                       <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                         <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                         <circle
                           cx="60" cy="60" r="50" fill="none"
                           stroke="hsl(var(--success))" strokeWidth="10" strokeLinecap="round"
                           strokeDasharray={`${2 * Math.PI * 50}`}
                           strokeDashoffset={`${2 * Math.PI * 50 * (1 - (stats?.successRate || 0) / 100)}`}
                           className="transition-all duration-1000 ease-out"
                         />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-bold text-foreground tracking-tight">{stats?.successRate ?? 0}%</span>
                         <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">Success</span>
                       </div>
                     </div>
                     <div className="flex flex-col gap-3 w-full md:min-w-[200px] md:w-auto">
                       <div className="bg-muted rounded-xl p-4 flex items-center justify-between">
                         <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Recorded</div>
                         <div className="text-xl font-bold text-foreground">{stats?.outcomesRecorded ?? 0}</div>
                       </div>
                       <div className="bg-success/10 rounded-xl p-4 flex items-center justify-between">
                         <div className="text-xs font-semibold text-success uppercase tracking-wider">Improving</div>
                         <div className="text-xl font-bold text-success">{stats?.improvingPatients ?? 0}</div>
                       </div>
                     </div>
                   </div>
                 )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Activity & Alerts (takes 1 col) */}
          <div className="space-y-6">

            {/* High Risk Patients */}
            <Card className="border-border/60 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-border/60 px-4 py-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" /> High Risk Patients
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/60">
                  {riskScoresLoading ? <div className="p-6"><Skeleton className="h-40" /></div> :
                   highRiskPatients.length > 0 ? highRiskPatients.map((rs: any) => (
                    <Link key={rs.id} href={`/patients/${rs.id}`}>
                      <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                            <span className="font-semibold text-destructive text-sm">{rs.riskScore ?? 0}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{rs.firstName} {rs.lastName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{rs.nhsNumber || "No NHS number"}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  )) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">No high risk patients identified.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border/60 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-border/60 px-4 py-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-border/60">
                  {activityLoading ? <div className="p-6"><Skeleton className="h-40" /></div> :
                   activityList.length > 0 ? activityList.map((activity: any) => (
                    <div key={activity.id} className="p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors">
                       <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        activity.action === 'CREATE' ? 'bg-success/10 text-success' :
                        activity.action === 'DELETE' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                      }`}>
                        {activity.action === 'CREATE' ? <UserPlus className="w-4 h-4" /> : activity.action === 'DELETE' ? <ShieldAlert className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 pt-0.5 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {activity.actor ? `${activity.actor.firstName} ${activity.actor.lastName}` : "System"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ACTION_LABELS[activity.action] ?? activity.action.toLowerCase()} a {activity.entityType?.toLowerCase()}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mt-2">{new Date(activity.createdAt).toLocaleString("en-GB")}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">No recent activity found.</div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}
