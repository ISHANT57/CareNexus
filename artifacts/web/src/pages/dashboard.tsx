import { useState, useMemo } from "react";
import {
  useGetDashboardStats,
  useGetPatientsByStatus,
  useGetRecentActivity,
  useGetEnrollmentStats,
  useGetAppointmentStats,
  useGetConsultationStats,
  useListProgramEnrollments,
  useListRiskScores,
  useGetMe,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Users, Activity, Building2, FolderGit2, Calendar,
  Stethoscope, AlertCircle, ChevronRight,
  Target, Bell, Clock, ArrowRight, CheckCircle2,
  BarChart3, CircleDot, PlusCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useTenantContext } from "@/contexts/TenantContext";
import { GlobalDashboard } from "./dashboard/GlobalDashboard";
import { PulseIllustration } from "@/components/ui/illustrations";

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Created", UPDATE: "Updated", DELETE: "Deleted", PATCH: "Modified",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  UPDATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-400",
  PATCH: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
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
  const { data: user } = useGetMe();
  const [programDrillId, setProgramDrillId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: statusData } = useGetPatientsByStatus({ query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: enrollmentStats, isLoading: enrollmentLoading } = useGetEnrollmentStats({ query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivity({ limit: 6 }, { query: { staleTime: 2 * 60 * 1000 } as any });
  const { data: appointmentStats, isLoading: appointmentLoading } = useGetAppointmentStats({ query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: consultationStats, isLoading: consultationLoading } = useGetConsultationStats({ query: { staleTime: 5 * 60 * 1000 } as any });
  const { data: clinicStatsData, isLoading: clinicStatsLoading } = useQuery({
    queryKey: ["reports", "clinic-stats"],
    queryFn: async () => {
      const res = await fetch("/api/reports/clinic-stats", { credentials: "include" });
      if (!res.ok) return [];
      return res.json() as Promise<Array<{ clinicId: string; clinicName: string; areaName: string; patientCount: number; appointmentCount: number; enrollmentCount: number }>>;
    },
    staleTime: 5 * 60 * 1000,
  });
  const clinicStats = useMemo(() => Array.isArray(clinicStatsData) ? clinicStatsData : [], [clinicStatsData]);
  const { data: riskScoresData, isLoading: riskScoresLoading } = useListRiskScores({ limit: 5 } as any, { query: { staleTime: 5 * 60 * 1000 } as any });
  const highRiskPatients = riskScoresData?.data ?? [];
  const { data: programEnrollmentsData, isLoading: programDetailsLoading } = useListProgramEnrollments(
    { programId: programDrillId ?? undefined, limit: 100 } as any,
    { query: { enabled: !!programDrillId, staleTime: 2 * 60 * 1000 } as any }
  );
  const enrollmentByProgram = enrollmentStats?.enrollmentsByProgram ?? [];
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

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const outcomeProgress = stats?.outcomesRecorded && stats.outcomesRecorded > 0
    ? Math.min(100, Math.round((stats.improvingPatients ?? 0) / stats.outcomesRecorded * 100))
    : 0;

  // Clinic load — normalize appointment count to 0–100% vs max
  const maxAppts = Math.max(...clinicStats.map((c: any) => c.appointmentCount ?? 0), 1);
  const clinicLoad = clinicStats.slice(0, 8).map((c: any) => {
    const pct = Math.round(((c.appointmentCount ?? 0) / maxAppts) * 100);
    const level = pct >= 75 ? "high" : pct >= 45 ? "medium" : "low";
    return { ...c, pct, level };
  });

  // Attention items — only truly actionable signals
  const pendingComms = stats?.pendingCommunications ?? 0;
  // Only HIGH/CRITICAL risk levels warrant immediate attention
  const criticalRiskPatients = highRiskPatients.filter(
    (rs: any) => rs.riskLevel === "HIGH" || rs.riskLevel === "CRITICAL"
  );
  const highRiskCount = criticalRiskPatients.length;
  const attentionCount = (pendingComms > 0 ? 1 : 0) + (highRiskCount > 0 ? 1 : 0);
  const attentionLoading = statsLoading || riskScoresLoading;

  // Status distribution for the mini bar
  const totalPatients = stats?.totalPatients ?? 0;
  const activePatients = stats?.activePatients ?? 0;

  return (
    <div className="transition-colors duration-200">
      {/* ── Header banner ────────────────────────────────────────────────────── */}
      <div className="border-b border-border px-8 py-5 relative overflow-hidden bg-background">
        {/* AI-style mesh grid — theme-adaptive dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(218 92% 51%) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Directional glow from top-right */}
        <div className="absolute -top-12 -right-12 w-80 h-64 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-20 bg-emerald-500/5 dark:bg-emerald-500/10 blur-2xl pointer-events-none" />
        {/* Decorative animated illustration watermark */}
        <PulseIllustration className="hidden lg:block absolute top-1/2 right-8 -translate-y-1/2 w-40 h-40 text-primary opacity-[0.08] pointer-events-none" />

        <div className="max-w-7xl relative flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-0.5">
              {now.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {greeting}{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="mt-0.5 text-muted-foreground text-sm">Clinical operations overview for your trust</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/patients/new">
              <Button size="sm" className="h-8 gap-1.5 shadow-sm">
                <PlusCircle className="w-3.5 h-3.5" />New Patient
              </Button>
            </Link>
            <Link href="/appointments">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 bg-background/80 dark:bg-muted/50">
                <Calendar className="w-3.5 h-3.5" />Schedule
              </Button>
            </Link>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-muted-foreground">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Attention Rail ───────────────────────────────────────────────────── */}
      {!attentionLoading && (
        attentionCount > 0 ? (
        <div className="border-b border-border bg-amber-50/60 dark:bg-amber-500/[0.05] px-8 py-2.5">
          <div className="max-w-7xl flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <Bell className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Needs attention</span>
            </div>
            <div className="w-px h-4 bg-amber-200 dark:bg-amber-700" />
            {pendingComms > 0 && (
              <Link href="/notifications">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 px-3 py-0.5 text-xs font-medium cursor-pointer hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors">
                  <CircleDot className="w-3 h-3" />
                  {pendingComms} pending message{pendingComms !== 1 ? "s" : ""}
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </span>
              </Link>
            )}
            {highRiskCount > 0 && (
              <Link href="/patients">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-3 py-0.5 text-xs font-medium cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors">
                  <AlertCircle className="w-3 h-3" />
                  {highRiskCount} critical-risk patient{highRiskCount !== 1 ? "s" : ""}
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </span>
              </Link>
            )}
          </div>
        </div>
        ) : (
        <div className="border-b border-border bg-emerald-50/60 dark:bg-emerald-500/[0.05] px-8 py-2.5">
          <div className="max-w-7xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">All clear — no immediate actions required</span>
          </div>
        </div>
        )
      )}

      <div className="page-container animate-in-up space-y-6">

        {/* ── ROW 1: Operational Command (3-col grid) ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* TODAY'S WORK — left 2 cols */}
          <div className="lg:col-span-2 space-y-4">

            {/* Key operational numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(appointmentLoading || statsLoading || consultationLoading || enrollmentLoading) ? (
                [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
              ) : (
                <>
                  <Link href="/appointments">
                    <div className="bg-card border border-border border-l-4 border-l-blue-500 rounded-xl p-4 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{appointmentStats?.scheduledAppointments ?? 0}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Upcoming Appts</p>
                    </div>
                  </Link>
                  <Link href="/patients">
                    <div className="bg-card border border-border border-l-4 border-l-emerald-500 rounded-xl p-4 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activePatients}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Active Patients</p>
                    </div>
                  </Link>
                  <Link href="/programs">
                    <div className="bg-card border border-border border-l-4 border-l-violet-500 rounded-xl p-4 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-center justify-between mb-2">
                        <FolderGit2 className="w-4 h-4 text-violet-500" />
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{enrollmentStats?.activeEnrollments ?? 0}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Active Enrollments</p>
                    </div>
                  </Link>
                  <div className="bg-card border border-border border-l-4 border-l-cyan-500 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Stethoscope className="w-4 h-4 text-cyan-500" />
                    </div>
                    <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{consultationStats?.consultationsThisMonth ?? 0}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Consults This Month</p>
                  </div>
                </>
              )}
            </div>

            {/* At-Risk Patients Panel */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <CardTitle className="text-sm font-semibold">At-Risk Patients</CardTitle>
                    {criticalRiskPatients.length > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">{criticalRiskPatients.length}</span>
                    )}
                  </div>
                  <Link href="/patients">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                      View all <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>Patients with elevated risk scores requiring clinical review</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {riskScoresLoading ? (
                  <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
                ) : highRiskPatients.length > 0 ? (
                  <div className="space-y-1.5">
                    {highRiskPatients.map((rs: any) => {
                      const riskLevel = rs.riskLevel ?? "LOW";
                      const isCritical = riskLevel === "CRITICAL";
                      const isHigh = riskLevel === "HIGH";
                      const isMedium = riskLevel === "MEDIUM";
                      const circleStyle = isCritical
                        ? "bg-destructive/15 text-destructive"
                        : isHigh
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : isMedium
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground";
                      const scoreDisplay = rs.riskScore != null && rs.riskScore > 0
                        ? rs.riskScore
                        : riskLevel[0];
                      return (
                      <Link key={rs.id} href={`/patients/${rs.patientId ?? rs.id}`}>
                        <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer group">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${circleStyle}`}>
                            {scoreDisplay}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{rs.firstName} {rs.lastName}</p>
                            <p className="text-xs text-muted-foreground">{rs.nhsNumber || "No NHS number"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isCritical || isHigh ? 'destructive' : isMedium ? 'default' : 'secondary'} className="uppercase text-[10px] font-bold">
                              {riskLevel}
                            </Badge>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </Link>
                    );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-50" />
                    <p className="text-sm font-medium">No high-risk patients</p>
                    <p className="text-xs mt-0.5">Risk assessment is up to date</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Program Enrollment — interactive list */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Program Enrollment</CardTitle>
                  </div>
                  <Link href="/programs">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                      Manage <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>Click a program to drill into enrolled patients</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {enrollmentLoading ? (
                  <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}</div>
                ) : enrollmentByProgram.length > 0 ? (
                  <div className="space-y-1">
                    {enrollmentByProgram.slice(0, 6).map((p: any) => {
                      const maxCount = Math.max(...enrollmentByProgram.map((x: any) => x.count), 1);
                      const barPct = Math.round((p.count / maxCount) * 100);
                      return (
                        <button
                          key={p.programId}
                          className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors text-left group"
                          onClick={() => setProgramDrillId(p.programId)}
                        >
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate">{p.programName}</span>
                              <span className="text-xs font-semibold text-muted-foreground ml-2 shrink-0">{p.count}</span>
                            </div>
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary/60 rounded-full transition-all duration-500" style={{ width: `${barPct}%` }} />
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No enrollments yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CLINIC LOAD — right col */}
          <div className="space-y-4">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Clinic Load</CardTitle>
                  </div>
                  <Link href="/clinics">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                      All clinics <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>Appointment volume by facility</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {clinicStatsLoading ? (
                  <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}</div>
                ) : clinicLoad.length > 0 ? (
                  <div className="space-y-3">
                    {clinicLoad.map((c: any) => (
                      <div key={c.clinicId ?? c.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${c.level === "high" ? "bg-rose-500" : c.level === "medium" ? "bg-amber-500" : "bg-emerald-500"}`} />
                            <span className="text-xs font-medium truncate">{c.clinicName ?? c.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono ml-2 shrink-0">{c.appointmentCount ?? 0} appts</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${c.level === "high" ? "bg-rose-500" : c.level === "medium" ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${c.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Low</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Medium</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />High</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No clinic data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Outcome Analytics ring */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Outcome Analytics</CardTitle>
                </div>
                <CardDescription>Patient improvement metrics</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col items-center gap-4">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
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
                    <span className="text-xl font-bold">{stats?.successRate ?? 0}%</span>
                    <span className="text-[10px] text-muted-foreground">success</span>
                  </div>
                </div>
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs">Outcomes recorded</span>
                    <span className="font-semibold text-xs">{stats?.outcomesRecorded ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs">Improving patients</span>
                    <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">{stats?.improvingPatients ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs">New this month</span>
                    <span className="font-semibold text-xs text-violet-600 dark:text-violet-400">{stats?.newPatientsThisMonth ?? 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick snapshot */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Patient Snapshot</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {statsLoading ? (
                  <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
                ) : (statusData ?? []).map((s: any, i: number) => {
                  const pct = totalPatients > 0 ? Math.round((s.count / totalPatients) * 100) : 0;
                  const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-rose-500", "bg-violet-500"];
                  return (
                    <div key={s.status ?? i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground capitalize">{(s.status ?? "").toLowerCase()}</span>
                        <span className="font-medium">{s.count} <span className="text-muted-foreground">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── ROW 2: Activity Feed + Summary Stats ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                </div>
                <Link href="/audit-logs">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                    Audit log <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Latest events across the trust</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {activityLoading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
              ) : activityData && activityData.length > 0 ? (
                <div className="space-y-0.5">
                  {activityData.map((activity: any) => {
                    const actionLabel = ACTION_LABELS[activity.action] ?? activity.action;
                    const actionColor = ACTION_COLORS[activity.action] ?? "bg-muted text-muted-foreground";
                    return (
                      <div key={activity.id} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/40 transition-colors">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">{activity.actor?.firstName?.[0] ?? "S"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-tight">
                            <span className="font-medium text-foreground">{activity.actor ? `${activity.actor.firstName} ${activity.actor.lastName}` : "System"}</span>
                            <span className="text-muted-foreground"> {actionLabel.toLowerCase()} </span>
                            <span className="text-foreground capitalize">{activity.entityType?.toLowerCase()?.replace(/_/g, " ")}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(activity.createdAt).toLocaleString("en-GB")}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] uppercase font-mono shrink-0 ${actionColor}`}>{actionLabel}</Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary metrics — right col */}
          <div className="space-y-3">
            {(appointmentLoading || statsLoading || enrollmentLoading) ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : (
              <>
                <Link href="/appointments?status=COMPLETED">
                  <div className="bg-card border border-border border-l-4 border-l-emerald-500 rounded-xl px-4 py-3 cursor-pointer hover:shadow-sm transition-all group flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Completed Appts</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{appointmentStats?.completedAppointments ?? 0}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
                <Link href="/appointments?status=CANCELLED">
                  <div className="bg-card border border-border border-l-4 border-l-rose-500 rounded-xl px-4 py-3 cursor-pointer hover:shadow-sm transition-all group flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Cancelled Appts</p>
                      <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{appointmentStats?.cancelledAppointments ?? 0}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
                <div className="bg-card border border-border border-l-4 border-l-blue-500 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Completed Programs</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{enrollmentStats?.completedEnrollments ?? 0}</p>
                </div>
                <div className="bg-card border border-border border-l-4 border-l-cyan-500 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Outcomes Recorded</p>
                  <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{stats?.outcomesRecorded ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stats?.improvingPatients ?? 0} improving</p>
                </div>
                <div className="bg-card border border-border border-l-4 border-l-emerald-400 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Success Rate</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats?.successRate ?? 0}%</p>
                  <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, stats?.successRate ?? 0)}%` }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── PROGRAM DRILL-DOWN MODAL ─────────────────────────────────────────── */}
      <Dialog open={!!programDrillId} onOpenChange={(open) => !open && setProgramDrillId(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-primary" />
              {programDetails?.program?.programName ?? "Program"} — Enrolled Patients
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
