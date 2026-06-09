import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  useGetDashboardStats,
  useGetPatientsByStatus,
  useGetPatientsByProgram,
  useGetRecentActivity,
  useGetEnrollmentStats,
  useGetAppointmentStats,
  useGetConsultationStats,
  useListClinics,
  useListProgramEnrollments,
  useGetMe,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  Users, Activity, Building2, FolderGit2, Calendar, MessageSquare,
  Stethoscope, ClipboardCheck, TrendingUp, AlertCircle, X, ChevronRight,
  MapPin, Target,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useTenantContext } from "@/contexts/TenantContext";
import { GlobalDashboard } from "./dashboard/GlobalDashboard";

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Created", UPDATE: "Updated", DELETE: "Deleted", PATCH: "Modified",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  UPDATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-400",
  PATCH: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

const CHART_COLORS = [
  "hsl(213,100%,45%)", "hsl(158,64%,40%)", "hsl(280,65%,55%)",
  "hsl(38,92%,50%)", "hsl(0,72%,55%)", "hsl(190,80%,45%)",
];

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

// Custom tooltip for charts
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">{p.name}: <span className="font-bold text-foreground">{p.value}</span></p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { data: user } = useGetMe();
  const { activeTenantId } = useTenantContext();

  if (user?.role === "SUPER_ADMIN" && activeTenantId === "ALL") {
    return <GlobalDashboard />;
  }

  return <TenantDashboard />;
}

function TenantDashboard() {
  const [, navigate] = useLocation();
  const [programDrillId, setProgramDrillId] = useState<string | null>(null);

  // ── Data queries (all with 5-min staleTime) ──────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { staleTime: 5 * 60 * 1000 } as any
  });
  const { data: statusData, isLoading: statusLoading } = useGetPatientsByStatus({
    query: { staleTime: 5 * 60 * 1000 } as any
  });
  const { data: programData, isLoading: programLoading } = useGetPatientsByProgram({
    query: { staleTime: 5 * 60 * 1000 } as any
  });
  const { data: enrollmentStats, isLoading: enrollmentLoading } = useGetEnrollmentStats({
    query: { staleTime: 5 * 60 * 1000 } as any
  });
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivity(
    { limit: 8 }, { query: { staleTime: 2 * 60 * 1000 } as any }
  );
  const { data: appointmentStats, isLoading: appointmentLoading } = useGetAppointmentStats({
    query: { staleTime: 5 * 60 * 1000 } as any
  });
  const { data: consultationStats, isLoading: consultationLoading } = useGetConsultationStats({
    query: { staleTime: 5 * 60 * 1000 } as any
  });
  // Clinic overview — use standard list endpoint (top 20)
  const { data: clinicsData, isLoading: clinicStatsLoading } = useListClinics(
    { limit: 20 } as any,
    { query: { staleTime: 5 * 60 * 1000 } as any }
  );
  const clinicStats = useMemo(() => clinicsData?.data ?? [], [clinicsData]);

  // Program drill-down (lazy) — load enrollments for the selected program
  const { data: programEnrollmentsData, isLoading: programDetailsLoading } = useListProgramEnrollments(
    { programId: programDrillId ?? undefined, limit: 100 } as any,
    { query: { enabled: !!programDrillId, staleTime: 2 * 60 * 1000 } as any }
  );
  // Shape drill-down data to match the template
  const programDetails = useMemo(() => {
    if (!programDrillId || !programEnrollmentsData) return null;
    const enrollments = programEnrollmentsData.data ?? [];
    return {
      program: enrollmentByProgram.find((p: any) => p.programId === programDrillId),
      total: enrollments.length,
      active: enrollments.filter((e: any) => e.status === "ACTIVE").length,
      completed: enrollments.filter((e: any) => e.status === "COMPLETED").length,
      cancelled: enrollments.filter((e: any) => e.status === "CANCELLED").length,
      enrollments: enrollments.map((e: any) => ({
        enrollmentId: e.id,
        patientId: e.patient?.id ?? "",
        patientName: e.patient ? `${e.patient.firstName} ${e.patient.lastName}` : "Unknown",
        nhsNumber: e.patient?.nhsNumber ?? "—",
        clinicName: e.patient?.clinic?.name ?? null,
        doctorName: e.doctor ? `${e.doctor.firstName} ${e.doctor.lastName}` : null,
        status: e.status,
      })),
    };
  }, [programDrillId, programEnrollmentsData, enrollmentByProgram]);

  const isLoadingPrimary = statsLoading || enrollmentLoading || appointmentLoading || consultationLoading;

  const topClinics = (appointmentStats?.appointmentsByClinic ?? [])
    .slice().sort((a: any, b: any) => b.count - a.count).slice(0, 10);

  const topDoctors = (consultationStats?.consultationsByDoctor ?? [])
    .slice().sort((a: any, b: any) => b.count - a.count).slice(0, 10);

  // Enrollment bars — use enrollment stats grouped by program
  const enrollmentByProgram = enrollmentStats?.enrollmentsByProgram ?? [];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  // Outcome progress percentage
  const outcomeProgress = stats?.outcomesRecorded && stats.outcomesRecorded > 0
    ? Math.min(100, Math.round((stats.improvingPatients ?? 0) / stats.outcomesRecorded * 100))
    : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* ── Header banner ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[hsl(213,100%,31%)] to-[hsl(213,100%,42%)] px-8 py-8 text-white">
        <div className="max-w-7xl">
          <div className="text-sm font-medium opacity-80 mb-1">
            {now.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting} 👋</h1>
          <p className="mt-1 text-white/70 text-sm">Clinical operations command centre — click any card to navigate</p>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 max-w-[1400px] animate-in-up">

        {/* ── PRIMARY KPI ROW — all clickable ────────────────────────────────── */}
        {isLoadingPrimary ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Patients" value={stats?.totalPatients ?? 0} subtitle={`${stats?.activePatients ?? 0} active`} icon={Users} variant="default" href="/patients" />
            <StatCard title="Active Enrollments" value={enrollmentStats?.activeEnrollments ?? 0} subtitle={`${enrollmentStats?.totalEnrollments ?? 0} total`} icon={FolderGit2} variant="primary" href="/programs" />
            <StatCard title="Scheduled Appts" value={appointmentStats?.scheduledAppointments ?? 0} subtitle="Upcoming" icon={Calendar} variant="warning" href="/appointments" />
            <StatCard title="Consultations" value={consultationStats?.consultationsThisMonth ?? 0} subtitle="This month" icon={Stethoscope} variant="success" href="/patients" />
            <StatCard title="Clinics" value={stats?.totalClinics ?? 0} subtitle={`${stats?.totalPrograms ?? 0} programs`} icon={Building2} variant="default" href="/clinics" />
            <StatCard title="Pending Comms" value={stats?.pendingCommunications ?? 0} subtitle="Requires action" icon={MessageSquare} variant={stats?.pendingCommunications ? "destructive" : "default"} href="/notifications" />
          </div>
        )}

        {/* ── SECONDARY STATS ROW ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {appointmentLoading || statsLoading ? (
            [...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : (
            <>
              <Link href="/appointments">
                <div className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Completed Appts</p>
                  <p className="text-2xl font-bold mt-1">{appointmentStats?.completedAppointments ?? 0}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
              <Link href="/appointments">
                <div className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Cancelled Appts</p>
                  <p className="text-2xl font-bold mt-1 text-destructive">{appointmentStats?.cancelledAppointments ?? 0}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
              <Link href="/programs">
                <div className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Completed Enrollments</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{enrollmentStats?.completedEnrollments ?? 0}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
              <Link href="/patients">
                <div className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">New This Month</p>
                  <p className="text-2xl font-bold mt-1">{stats?.newPatientsThisMonth ?? 0}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Outcomes Recorded</p>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{stats?.outcomesRecorded ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats?.improvingPatients ?? 0} improving</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Success Rate</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats?.successRate ?? 0}%</p>
                <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, stats?.successRate ?? 0)}%` }} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── CHARTS ROW 1 — Status pie + Program bar ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patients by Status — clickable segments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Patients by Status</CardTitle>
              <CardDescription>Click a segment to view those patients</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {statusLoading ? <Skeleton className="h-full w-full" />
                : statusData && statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%" cy="45%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={3} dataKey="count" nameKey="status"
                        stroke="none"
                        onClick={(entry: any) => navigate(`/patients?status=${entry.status}`)}
                        style={{ cursor: "pointer" }}
                      >
                        {statusData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} className="hover:opacity-80 transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <AlertCircle className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No patient data yet</p>
                    <Link href="/patients/new"><Button size="sm" variant="outline" className="text-xs">Add first patient</Button></Link>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Patients by Program — clickable bars */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Patients by Program</CardTitle>
              <CardDescription>Click a bar to see enrolled patients</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {programLoading ? <Skeleton className="h-full w-full" />
                : programData && programData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={programData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                      onClick={(e: any) => {
                        if (e?.activePayload?.[0]) setProgramDrillId(e.activePayload[0].payload.programId);
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="programName" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                      <Bar dataKey="count" fill="hsl(213,100%,45%)" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <AlertCircle className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No program data yet</p>
                    <Link href="/programs"><Button size="sm" variant="outline" className="text-xs">View Programs</Button></Link>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* ── CHARTS ROW 2 — Clinics + Consultations ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Clinics by Appointments</CardTitle>
              <CardDescription>Click a bar to view that clinic's patients</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {appointmentLoading ? <Skeleton className="h-full w-full" />
                : topClinics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topClinics} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                      onClick={(e: any) => {
                        if (e?.activePayload?.[0]) navigate(`/clinics`);
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="clinicName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                      <Bar dataKey="count" fill="hsl(158,64%,40%)" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <AlertCircle className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No appointment data yet</p>
                    <p className="text-xs">Appointments will appear here once scheduled</p>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Consultations by Doctor</CardTitle>
              <CardDescription>Volume per clinical staff member</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {consultationLoading ? <Skeleton className="h-full w-full" />
                : topDoctors.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topDoctors} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="doctorName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                      <Bar dataKey="count" fill="hsl(280,65%,55%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <AlertCircle className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No consultation data yet</p>
                    <p className="text-xs">Consultations will appear here once recorded</p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* ── CLINIC PERFORMANCE TABLE ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Clinic Performance Overview
            </CardTitle>
            <CardDescription>Patients, appointments, and enrollments per clinic</CardDescription>
          </CardHeader>
          <CardContent>
            {clinicStatsLoading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}</div>
            ) : clinicStats && clinicStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Clinic</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Area</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinicStats.slice(0, 10).map((c: any) => (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-medium">{c.name}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />{c.area?.name || "—"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{c.city || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {clinicStats.length > 10 && (
                  <div className="pt-3 text-center">
                    <Link href="/clinics"><Button size="sm" variant="outline" className="text-xs">View all clinics →</Button></Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No clinic data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── PROGRAM ANALYTICS + OUTCOME RING ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrollment by Program — clickable rows */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-primary" />
                Program Enrollment Overview
              </CardTitle>
              <CardDescription>Click a program to see enrolled patients</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollmentLoading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded" />)}</div>
              ) : enrollmentByProgram.length > 0 ? (
                <div className="space-y-2">
                  {enrollmentByProgram.slice(0, 8).map((p: any) => (
                    <button
                      key={p.programId}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      onClick={() => setProgramDrillId(p.programId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-medium text-sm">{p.programName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{p.count} enrolled</Badge>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No programs with enrollments yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outcome Progress Ring */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Outcome Analytics
              </CardTitle>
              <CardDescription>Patient improvement metrics</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-4">
              {/* Progress ring */}
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="hsl(158,64%,40%)" strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - outcomeProgress / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{stats?.successRate ?? 0}%</span>
                  <span className="text-xs text-muted-foreground">success</span>
                </div>
              </div>
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outcomes recorded</span>
                  <span className="font-semibold">{stats?.outcomesRecorded ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Improving patients</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats?.improvingPatients ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RECENT ACTIVITY ──────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest audit events across the trust</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
            ) : activityData && activityData.length > 0 ? (
              <div className="space-y-1">
                {activityData.map((activity: any) => {
                  const actionLabel = ACTION_LABELS[activity.action] ?? activity.action;
                  const actionColor = ACTION_COLORS[activity.action] ?? "bg-muted text-muted-foreground";
                  return (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{(activity.actor?.firstName?.[0] ?? "S")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          <span className="text-foreground">{activity.actor ? `${activity.actor.firstName} ${activity.actor.lastName}` : "System"}</span>
                          <span className="text-muted-foreground"> {actionLabel} </span>
                          <span className="text-foreground capitalize">{activity.entityType?.toLowerCase()?.replace(/_/g, " ")}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleString("en-GB")}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] uppercase font-mono shrink-0 ${actionColor}`}>{actionLabel}</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No recent activity found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── PROGRAM DRILL-DOWN MODAL ─────────────────────────────────────────── */}
      <Dialog open={!!programDrillId} onOpenChange={(open) => !open && setProgramDrillId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-primary" />
              {programDetails?.program?.name ?? "Program"} — Enrolled Patients
            </DialogTitle>
          </DialogHeader>

          {programDetailsLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
          ) : programDetails ? (
            <>
              {/* Summary */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Total", value: programDetails.total, color: "text-foreground" },
                  { label: "Active", value: programDetails.active, color: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Completed", value: programDetails.completed, color: "text-blue-600 dark:text-blue-400" },
                  { label: "Cancelled", value: programDetails.cancelled, color: "text-destructive" },
                ].map((s) => (
                  <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Patient list */}
              <div className="space-y-2">
                {programDetails.enrollments.map((e: any) => (
                  <Link key={e.enrollmentId} href={`/patients/${e.patientId}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {e.patientName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{e.patientName}</p>
                          <p className="text-xs text-muted-foreground">{e.nhsNumber} · {e.clinicName || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {e.doctorName && <span className="text-xs text-muted-foreground hidden sm:block">Dr. {e.doctorName}</span>}
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_BADGE[e.status] ?? "bg-muted"}`}
                        >
                          {e.status}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {programDetails.enrollments.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No patients enrolled in this program</p>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
