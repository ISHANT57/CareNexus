import { useState } from "react";
import { useListAppointments, getListAppointmentsQueryKey, useCancelAppointment, useCompleteAppointment, useGetMe, useListRoles } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, User, Building2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useListUsers, useListClinics } from "@workspace/api-client-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  SCHEDULED: { label: "Scheduled", class: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  COMPLETED: { label: "Completed", class: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", class: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
  NO_SHOW: { label: "No Show", class: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
};

const PAGE_SIZE = 20;

export default function AppointmentsPage() {
  const { data: me } = useGetMe();
  const isDoctor = me?.role === "DOCTOR";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { filters, setFilter, clearFilters } = useUrlFilters<{
    status: string;
    doctorId: string;
    clinicId: string;
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
    page,
    limit: PAGE_SIZE,
  };
  const appointmentsKey = getListAppointmentsQueryKey(queryParams);

  const { data: appointmentsData, isLoading } = useListAppointments(
    queryParams,
    { query: { enabled: !!me, queryKey: appointmentsKey } }
  );

  const cancelMutation = useCancelAppointment();
  const completeMutation = useCompleteAppointment();

  const handleAction = async (appointmentId: string, action: "cancel" | "complete") => {
    try {
      if (action === "cancel") {
        await cancelMutation.mutateAsync({ id: appointmentId });
      } else {
        await completeMutation.mutateAsync({ id: appointmentId });
      }
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      toast({ title: `Appointment ${action === "cancel" ? "cancelled" : "completed"} successfully` });
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

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isDoctor ? "Your scheduled appointments" : "All clinical appointments across the trust"}.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="w-4 h-4" />
            {appointmentsData?.meta?.total ?? 0} total
          </div>
        </div>
      </div>

      <div className="p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary-foreground text-primary rounded-full text-xs font-bold w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}
        </div>

        {/* Expanded Filter panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in-up">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </div>
              <Select value={filterStatus} onValueChange={(v) => { setFilter("status", v === "ALL" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-full bg-card">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
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
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Doctor
                </div>
                <SearchableSelect
                  options={doctorOptions}
                  value={filterDoctor}
                  onValueChange={(v) => { setFilter("doctorId", v); setPage(1); }}
                  placeholder="All doctors"
                  searchPlaceholder="Search doctors..."
                  isLoading={usersLoading}
                  clearable
                />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Clinic
              </div>
              <SearchableSelect
                options={clinicOptions}
                value={filterClinic}
                onValueChange={(v) => { setFilter("clinicId", v); setPage(1); }}
                placeholder="All clinics"
                searchPlaceholder="Search clinics..."
                isLoading={clinicsLoading}
                clearable
              />
            </div>
          </div>
        )}

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-1 p-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : allAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No appointments found</p>
                <p className="text-sm mt-1">{filterStatus ? "Try changing the status filter" : "No appointments scheduled yet"}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Date & Time</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Patient</TableHead>
                        {!isDoctor && <TableHead className="font-semibold text-xs uppercase tracking-wide">Doctor</TableHead>}
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Clinic</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Status</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Type</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAppointments.map((appt) => {
                        const statusCfg = STATUS_CONFIG[appt.status] ?? { label: appt.status, class: "bg-muted text-muted-foreground" };
                        return (
                          <TableRow key={appt.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="whitespace-nowrap text-sm">
                              <div className="font-medium">{format(new Date(appt.appointmentDate), "MMM d, yyyy")}</div>
                              <div className="text-xs text-muted-foreground">{format(new Date(appt.appointmentDate), "HH:mm")}</div>
                            </TableCell>
                            <TableCell>
                              <Link href={`/patients/${appt.patientId}`}>
                                <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                                  {appt.patient?.firstName} {appt.patient?.lastName}
                                </span>
                              </Link>
                            </TableCell>
                            {!isDoctor && (
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <User className="w-3.5 h-3.5 shrink-0" />
                                  {appt.doctor ? `${appt.doctor.firstName} ${appt.doctor.lastName}` : "—"}
                                </div>
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Building2 className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[140px]">{appt.clinic?.name ?? "—"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("text-xs font-medium", statusCfg.class)}>
                                {statusCfg.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground capitalize">
                                {(appt as any).appointmentType?.toLowerCase() ?? "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {appt.status === "SCHEDULED" && (
                                <div className="flex justify-end gap-1">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
                                        <CheckCircle className="w-3.5 h-3.5 mr-1" />Complete
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Complete Appointment</AlertDialogTitle>
                                        <AlertDialogDescription>Mark this appointment as completed?</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleAction(appt.id, "complete")}>
                                          Yes, Complete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-destructive">
                                        <XCircle className="w-3.5 h-3.5 mr-1" />Cancel
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                        <AlertDialogDescription>Are you sure you want to cancel this appointment?</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Keep</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleAction(appt.id, "cancel")} className="bg-destructive hover:bg-destructive/90">
                                          Yes, Cancel
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                        <ChevronLeft className="w-4 h-4" />Prev
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                        Next<ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
