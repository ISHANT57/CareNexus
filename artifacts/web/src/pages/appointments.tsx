import { useListAppointments, getListAppointmentsQueryKey, useCancelAppointment, useCompleteAppointment, useGetMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, User, Building2, CheckCircle, XCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AppointmentsPage() {
  const { data: me } = useGetMe();
  const isDoctor = me?.role === "DOCTOR";
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryParams = isDoctor ? { doctorId: me?.id } : {};
  const appointmentsKey = getListAppointmentsQueryKey(queryParams);
  
  const { data: appointmentsData, isLoading } = useListAppointments(
    queryParams,
    { query: { enabled: !!me, queryKey: appointmentsKey } }
  );

  const cancelAppointmentMutation = useCancelAppointment();
  const completeAppointmentMutation = useCompleteAppointment();

  const handleAction = async (appointmentId: string, action: 'cancel' | 'complete') => {
    try {
      if (action === 'cancel') {
        await cancelAppointmentMutation.mutateAsync({ id: appointmentId });
      } else {
        await completeAppointmentMutation.mutateAsync({ id: appointmentId });
      }
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      toast({ title: `Appointment ${action === 'cancel' ? 'cancelled' : 'completed'}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    }
  };

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-2">Manage clinical appointments and schedules.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {isDoctor ? "My Upcoming Appointments" : "All Appointments"}
          </CardTitle>
          <CardDescription>
            {isDoctor ? "Appointments scheduled with you." : "View all scheduled appointments across the tenant."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : appointmentsData?.data?.length ? (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date & Time</th>
                    <th className="px-4 py-3 font-medium">Patient</th>
                    {!isDoctor && <th className="px-4 py-3 font-medium">Doctor</th>}
                    <th className="px-4 py-3 font-medium">Clinic</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {appointmentsData.data.map((appt) => (
                    <tr key={appt.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {format(new Date(appt.appointmentDate), "MMM d, yyyy HH:mm")}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/patients/${appt.patientId}`} className="text-primary hover:underline font-medium">
                          {appt.patient?.firstName} {appt.patient?.lastName}
                        </Link>
                      </td>
                      {!isDoctor && (
                        <td className="px-4 py-3 text-muted-foreground flex items-center gap-2">
                          <User className="w-4 h-4" /> Dr. {appt.doctor?.lastName}
                        </td>
                      )}
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" /> {appt.clinic?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={appt.status === "SCHEDULED" ? "default" : appt.status === "COMPLETED" ? "secondary" : "destructive"}>
                          {appt.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {appt.status === "SCHEDULED" && (
                          <div className="flex justify-end gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary px-2">
                                  <CheckCircle className="w-4 h-4 mr-1" /> Complete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Complete Appointment</AlertDialogTitle>
                                  <AlertDialogDescription>Mark this appointment as completed?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Close</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleAction(appt.id, 'complete')}>Yes, Complete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-destructive px-2">
                                  <XCircle className="w-4 h-4 mr-1" /> Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to cancel this appointment?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Close</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleAction(appt.id, 'cancel')}>Yes, Cancel</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No appointments scheduled.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
