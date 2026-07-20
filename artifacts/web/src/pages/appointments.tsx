import { useState, useMemo } from "react";
import { 
  useListAppointments, getListAppointmentsQueryKey, useCancelAppointment, 
  useCompleteAppointment, useGetMe, useListRoles, useListUsers, useListClinics 
} from "@workspace/api-client-react";
import { useActiveRole } from "@/hooks/useActiveRole";
import { useQueryClient } from "@tanstack/react-query";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge, getStatusConfig, getToneDotClass } from "@/components/ui/status-badge";
import { 
  Calendar as CalendarIcon, User, Building2, CheckCircle, XCircle, 
  ChevronLeft, ChevronRight, Filter, X, Clock, AlertCircle 
} from "lucide-react";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const PAGE_SIZE = 20;

export default function AppointmentsPage() {
  const { user: me, isDoctor } = useActiveRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { filters, setFilter, clearFilters } = useUrlFilters<{
    status: string; doctorId: string; clinicId: string;
  }>();

  const filterStatus = filters.status || "";
  const filterDoctor = filters.doctorId || "";
  const filterClinic = filters.clinicId || "";
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const queryParams = {
    ...(isDoctor ? { doctorId: me?.id } : filterDoctor ? { doctorId: filterDoctor } : {}),
    ...(filterClinic ? { clinicId: filterClinic } : {}),
    ...(filterStatus ? { status: filterStatus } : {}),
    page, limit: PAGE_SIZE,
    sortBy: "appointmentDate", sortOrder: "asc" // Important for timeline flow
  };
  const appointmentsKey = getListAppointmentsQueryKey(queryParams);

  const { data: appointmentsData, isLoading } = useListAppointments(queryParams, { query: { enabled: !!me, queryKey: appointmentsKey } });
  
  const cancelMutation = useCancelAppointment();
  const completeMutation = useCompleteAppointment();

  const handleAction = async (appointmentId: string, action: "cancel" | "complete") => {
    try {
      if (action === "cancel") await cancelMutation.mutateAsync({ id: appointmentId });
      else await completeMutation.mutateAsync({ id: appointmentId });
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      toast({ title: `Appointment ${action === "cancel" ? "cancelled" : "completed"}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    }
  };

  const { data: rolesData } = useListRoles();
  const doctorRoleId = rolesData?.data?.find(r => r.name === "DOCTOR")?.id;
  const { data: usersData, isLoading: usersLoading } = useListUsers({ limit: 500, roleId: doctorRoleId }, { query: { enabled: !isDoctor && !!doctorRoleId } as any });
  const { data: clinicsData, isLoading: clinicsLoading } = useListClinics({ limit: 500 });

  const doctorOptions = (usersData?.data ?? []).map((u: any) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
  const clinicOptions = (clinicsData?.data ?? []).map((c: any) => ({ label: c.name, value: c.id }));

  const allAppointments = appointmentsData?.data ?? [];
  const totalPages = appointmentsData?.meta ? Math.ceil(appointmentsData.meta.total / PAGE_SIZE) : 1;
  const activeFilterCount = [filterStatus, filterDoctor, filterClinic].filter(Boolean).length;

  // Group appointments by date string
  const groupedAppointments = useMemo(() => {
    return allAppointments.reduce((acc, appt) => {
      const dateStr = format(parseISO(appt.appointmentDate), "yyyy-MM-dd");
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(appt);
      return acc;
    }, {} as Record<string, typeof allAppointments>);
  }, [allAppointments]);

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMMM do");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background/50">
      <div className="p-8 space-y-6 animate-in-up">
        <PageHeader
          title="Timeline Scheduler"
          description={`${isDoctor ? "Your clinical schedule." : "Global clinical appointments across the trust."} ${appointmentsData?.meta?.total ?? 0} scheduled.`}
        />

        {/* ── FILTER BAR ────────────────────────────────────── */}
        <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border shadow-sm">
          <Button variant={showFilters ? "secondary" : "ghost"} onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="w-4 h-4" /> Filters
            {activeFilterCount > 0 && <span className="bg-primary text-primary-foreground rounded-full text-xs font-bold w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} className="gap-1 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" /> Clear All
            </Button>
          )}
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border shadow-sm rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
              <Select value={filterStatus} onValueChange={(v) => { setFilter("status", v === "ALL" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-full bg-background"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isDoctor && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Doctor</label>
                <SearchableSelect options={doctorOptions} value={filterDoctor} onValueChange={(v) => { setFilter("doctorId", v); setPage(1); }} placeholder="All doctors" searchPlaceholder="Search doctors..." isLoading={usersLoading} clearable />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinic</label>
              <SearchableSelect options={clinicOptions} value={filterClinic} onValueChange={(v) => { setFilter("clinicId", v); setPage(1); }} placeholder="All clinics" searchPlaceholder="Search clinics..." isLoading={clinicsLoading} clearable />
            </div>
          </motion.div>
        )}

        {/* ── TIMELINE ──────────────────────────────────────── */}
        <div className="relative pt-4">
          {isLoading ? (
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-20 shrink-0"><Skeleton className="h-6 w-16" /></div>
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : allAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground glass-card rounded-2xl">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 opacity-50" />
              </div>
              <p className="font-medium text-lg text-foreground">No appointments found</p>
              <p className="text-sm mt-1">{filterStatus ? "Adjust your filters to see more results." : "Your schedule is completely clear."}</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedAppointments).map(([dateStr, appts], dayIndex) => {
                const dateLabel = getDateLabel(dateStr);
                const isPastDay = isPast(parseISO(dateStr)) && !isToday(parseISO(dateStr));
                
                return (
                  <div key={dateStr} className="relative">
                    {/* Day Header */}
                    <div className="sticky top-0 z-10 flex items-center mb-6 bg-background/90 backdrop-blur-md py-2 -mx-4 px-4 rounded-lg">
                      <div className="flex items-center gap-3">
                         <div className={cn("px-3 py-1 rounded-full text-sm font-bold shadow-sm", isToday(parseISO(dateStr)) ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground")}>
                           {dateLabel}
                         </div>
                         <span className="text-sm font-medium text-muted-foreground">{format(parseISO(dateStr), "MMM d, yyyy")}</span>
                      </div>
                    </div>

                    {/* Timeline items for this day */}
                    <div className="space-y-4 ml-4 sm:ml-12 relative">
                      {/* Vertical line connecting appointments in this day */}
                      <div className="absolute top-6 bottom-0 left-[19px] w-px bg-border/80" />

                      {appts.map((appt, i) => {
                        const timeStr = format(parseISO(appt.appointmentDate), "HH:mm");
                        const isPastAppt = isPastDay || (isToday(parseISO(dateStr)) && isPast(parseISO(appt.appointmentDate)));

                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            key={appt.id} className="relative flex items-start gap-4 sm:gap-6 group"
                          >
                            {/* Time indicator (left) */}
                            <div className="w-12 pt-4 shrink-0 text-right hidden sm:block">
                              <span className={cn("text-sm font-bold", isPastAppt ? "text-muted-foreground" : "text-foreground")}>{timeStr}</span>
                            </div>

                            {/* Timeline dot */}
                            <div className="relative flex flex-col items-center mt-4 z-10">
                              <div className={cn("w-[10px] h-[10px] rounded-full border-2 ring-4 ring-background shadow-sm transition-transform group-hover:scale-125", getToneDotClass(getStatusConfig("appointment", appt.status).tone), isPastAppt ? "opacity-50 grayscale" : "")} />
                            </div>

                            {/* Appointment Card */}
                            <Card className={cn("flex-1 glass-card overflow-hidden transition-all hover:shadow-md hover:border-primary/30", isPastAppt ? "opacity-75" : "")}>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                {/* Left section: Patient & Info */}
                                <div className="flex-1 p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <Link href={`/patients/${appt.patientId}`}>
                                      <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                                        {appt.patient?.firstName} {appt.patient?.lastName}
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-1 text-primary" />
                                      </h3>
                                    </Link>
                                    <StatusBadge domain="appointment" status={appt.status} className="ml-2 font-semibold" />
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded-md">
                                      <Clock className="w-3.5 h-3.5 text-primary" />
                                      <span className="font-medium text-foreground sm:hidden">{timeStr}</span>
                                      <span className="capitalize">{(appt as any).appointmentType?.toLowerCase() || "Standard Checkup"}</span>
                                    </div>
                                    {!isDoctor && (
                                      <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5" />
                                      <span className="truncate max-w-[200px]">{appt.clinic?.name || "No Clinic Assigned"}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right section: Actions */}
                                {appt.status === "SCHEDULED" && (
                                  <div className="bg-muted/20 border-t sm:border-t-0 sm:border-l border-border p-4 flex sm:flex-col justify-end gap-2 shrink-0 sm:w-32">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="w-full h-8 text-xs bg-emerald-500/5 text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/50 dark:hover:bg-emerald-950/30 transition-colors">
                                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Complete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Complete Appointment</AlertDialogTitle><AlertDialogDescription>Mark this appointment as successfully completed?</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Back</AlertDialogCancel><AlertDialogAction onClick={() => handleAction(appt.id, "complete")}>Confirm Completion</AlertDialogAction></AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="w-full h-8 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                                          <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Cancel Appointment</AlertDialogTitle><AlertDialogDescription>Are you sure you want to cancel? The patient may be notified.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Keep</AlertDialogCancel><AlertDialogAction onClick={() => handleAction(appt.id, "cancel")} className="bg-destructive hover:bg-destructive/90">Yes, Cancel</AlertDialogAction></AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── PAGINATION ────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-6 mt-8 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">Showing page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="glass-card">
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="glass-card">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
