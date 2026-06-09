import {
  useGetDashboardStats,
  useGetPatientsByStatus,
  useGetPatientsByProgram,
  useGetRecentActivity,
  useGetEnrollmentStats,
  useGetAppointmentStats,
  useGetConsultationStats,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  Users,
  Activity,
  Building2,
  FolderGit2,
  Calendar,
  MessageSquare,
  Stethoscope,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  PATCH: "Modified",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  UPDATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-400",
  PATCH: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

const CHART_COLORS = [
  "hsl(213,100%,45%)",
  "hsl(158,64%,40%)",
  "hsl(280,65%,55%)",
  "hsl(38,92%,50%)",
  "hsl(0,72%,55%)",
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: statusData, isLoading: statusLoading } = useGetPatientsByStatus();
  const { data: programData, isLoading: programLoading } = useGetPatientsByProgram();
  const { data: enrollmentStats, isLoading: enrollmentLoading } = useGetEnrollmentStats();
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivity({ limit: 8 });
  const { data: appointmentStats, isLoading: appointmentLoading } = useGetAppointmentStats();
  const { data: consultationStats, isLoading: consultationLoading } = useGetConsultationStats();

  const isLoadingPrimary = statsLoading || enrollmentLoading || appointmentLoading || consultationLoading;

  // Top 10 clinics for chart readability
  const topClinics = appointmentStats?.appointmentsByClinic
    ?.slice()
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10);

  const topDoctors = appointmentStats?.appointmentsByDoctor
    ?.slice()
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-[hsl(213,100%,31%)] to-[hsl(213,100%,42%)] px-8 py-8 text-white">
        <div className="max-w-6xl">
          <div className="text-sm font-medium opacity-80 mb-1">
            {now.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting} 👋</h1>
          <p className="mt-1 text-white/70 text-sm">Clinical operations overview for your trust</p>
        </div>
      </div>

      <div className="p-8 space-y-8 max-w-[1400px] animate-in-up">

        {/* Primary KPI Row */}
        {isLoadingPrimary ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="Total Patients"
              value={stats?.totalPatients ?? 0}
              subtitle={`${stats?.activePatients ?? 0} active`}
              icon={Users}
              variant="default"
            />
            <StatCard
              title="Active Enrollments"
              value={enrollmentStats?.activeEnrollments ?? 0}
              subtitle={`${enrollmentStats?.totalEnrollments ?? 0} total`}
              icon={FolderGit2}
              variant="primary"
            />
            <StatCard
              title="Scheduled Appts"
              value={appointmentStats?.scheduledAppointments ?? 0}
              subtitle="Upcoming"
              icon={Calendar}
              variant="warning"
            />
            <StatCard
              title="Consultations"
              value={consultationStats?.consultationsThisMonth ?? 0}
              subtitle="This month"
              icon={Stethoscope}
              variant="success"
            />
            <StatCard
              title="Clinics"
              value={stats?.totalClinics ?? 0}
              subtitle={`${stats?.totalPrograms ?? 0} programs`}
              icon={Building2}
              variant="default"
            />
            <StatCard
              title="Pending Comms"
              value={stats?.pendingCommunications ?? 0}
              subtitle="Requires action"
              icon={MessageSquare}
              variant={stats?.pendingCommunications ? "destructive" : "default"}
            />
          </div>
        )}

        {/* Secondary stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {appointmentLoading || statsLoading ? (
            [...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : (
            <>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Completed Appts</p>
                <p className="text-2xl font-bold mt-1">{appointmentStats?.completedAppointments ?? 0}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Cancelled Appts</p>
                <p className="text-2xl font-bold mt-1 text-destructive">{appointmentStats?.cancelledAppointments ?? 0}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Completed Enrollments</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{enrollmentStats?.completedEnrollments ?? 0}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">New This Month</p>
                <p className="text-2xl font-bold mt-1">{stats?.newPatientsThisMonth ?? 0}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Outcomes Recorded</p>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{stats?.outcomesRecorded ?? 0}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Success Rate</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats?.successRate ?? 0}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats?.improvingPatients ?? 0} improving</p>
              </div>
            </>
          )}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patients by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Patients by Status</CardTitle>
              <CardDescription>Current distribution of patient journey statuses</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {statusLoading ? (
                <Skeleton className="h-full w-full" />
              ) : statusData && statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                      stroke="none"
                    >
                      {statusData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <AlertCircle className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No patient status data</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patients by Program */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Patients by Program</CardTitle>
              <CardDescription>Enrollment numbers across active programs</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {programLoading ? (
                <Skeleton className="h-full w-full" />
              ) : programData && programData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={programData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="programName"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar dataKey="count" fill="hsl(213,100%,45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <AlertCircle className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No program data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appointments Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top 10 Clinics by Appointments</CardTitle>
              <CardDescription>Volume of appointments at each clinic</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {appointmentLoading ? (
                <Skeleton className="h-full w-full" />
              ) : topClinics && topClinics.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topClinics} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="clinicName"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar dataKey="count" fill="hsl(158,64%,40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <AlertCircle className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No appointment data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Consultations by Doctor</CardTitle>
              <CardDescription>Consultation volume per clinical staff member</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {consultationLoading ? (
                <Skeleton className="h-full w-full" />
              ) : consultationStats?.consultationsByDoctor && consultationStats.consultationsByDoctor.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={consultationStats.consultationsByDoctor.slice(0, 10)}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="doctorName"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar dataKey="count" fill="hsl(280,65%,55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <AlertCircle className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No consultation data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
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
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : activityData && activityData.length > 0 ? (
              <div className="space-y-1">
                {activityData.map((activity: any) => {
                  const actionLabel = ACTION_LABELS[activity.action] ?? activity.action;
                  const actionColor = ACTION_COLORS[activity.action] ?? "bg-muted text-muted-foreground";
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {(activity.actor?.firstName?.[0] ?? "S")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          <span className="text-foreground">
                            {activity.actor ? `${activity.actor.firstName} ${activity.actor.lastName}` : "System"}
                          </span>
                          <span className="text-muted-foreground"> {actionLabel} </span>
                          <span className="text-foreground capitalize">
                            {activity.entityType?.toLowerCase()?.replace(/_/g, " ")}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString("en-GB")}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-mono shrink-0 ${actionColor}`}
                      >
                        {actionLabel}
                      </Badge>
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
    </div>
  );
}
