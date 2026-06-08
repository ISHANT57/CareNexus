import { useParams, Link } from "wouter";
import {
  useGetPatient, getGetPatientQueryKey,
  useUpdatePatientStatus,
  useGetPatientJourney, useCreatePatientJourney, getGetPatientJourneyQueryKey,
  useListAssignments, useCreateAssignment, useDeleteAssignment, getListAssignmentsQueryKey,
  useListUsers,
  useCreateCommunication, useListCommunications, getListCommunicationsQueryKey,
  useUploadFile, useListFiles, useDeleteFile, getListFilesQueryKey,
  useListProgramEnrollments, useCreateProgramEnrollment, useCompleteProgramEnrollment, useCancelProgramEnrollment, getListProgramEnrollmentsQueryKey,
  useListPrograms,
  useListAppointments, useCreateAppointment, useCancelAppointment, useCompleteAppointment, getListAppointmentsQueryKey,
  useListClinics
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MapPin, Phone, Mail, Calendar, Building2, Activity, ArrowLeft, ChevronDown, Plus, Trash2, UserPlus, MessageSquare, Send, Upload, FileText, Download, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const isNew = !id || id === "new";

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updatePatient = useUpdatePatientStatus();
  const createJourneyEvent = useCreatePatientJourney();
  const createAssignment = useCreateAssignment();
  const deleteAssignment = useDeleteAssignment();

  const [isJourneyDialogOpen, setIsJourneyDialogOpen] = useState(false);
  const [journeyStatus, setJourneyStatus] = useState<"NEW" | "PSI" | "DISCHARGE" | "MEDICATION_REQUIRED">("NEW");
  const [journeyNotes, setJourneyNotes] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const createCommunication = useCreateCommunication();

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();

  const enrollmentsKey = getListProgramEnrollmentsQueryKey({ patientId: id });
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useListProgramEnrollments(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: enrollmentsKey } }
  );

  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [enrollProgramId, setEnrollProgramId] = useState("");
  const createEnrollment = useCreateProgramEnrollment();
  const completeEnrollment = useCompleteProgramEnrollment();
  const cancelEnrollment = useCancelProgramEnrollment();

  const { data: programsData } = useListPrograms({ limit: 100 }, { query: { enabled: isEnrollDialogOpen, queryKey: ["programs", "list"] } });

  // Appointments
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [appointmentDoctorId, setAppointmentDoctorId] = useState("");
  const [appointmentClinicId, setAppointmentClinicId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  
  const appointmentsKey = getListAppointmentsQueryKey({ patientId: id });
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useListAppointments(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: appointmentsKey } }
  );

  const createAppointment = useCreateAppointment();
  const cancelAppointmentMutation = useCancelAppointment();
  const completeAppointmentMutation = useCompleteAppointment();

  const { data: clinicsData } = useListClinics({ limit: 100 }, { query: { enabled: isAppointmentDialogOpen, queryKey: ["clinics", "list"] } });

  const handleScheduleAppointment = async () => {
    if (!appointmentDoctorId || !appointmentClinicId || !appointmentDate || !appointmentTime) return;
    try {
      // Combine date and time
      const datetimeStr = `${appointmentDate}T${appointmentTime}:00Z`; // Simple UTC assuming local inputs are handled simply
      await createAppointment.mutateAsync({
        data: {
          patientId: id,
          doctorId: appointmentDoctorId,
          clinicId: appointmentClinicId,
          appointmentDate: datetimeStr,
          durationMinutes: 30
        }
      });
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      setIsAppointmentDialogOpen(false);
      setAppointmentDoctorId("");
      setAppointmentClinicId("");
      setAppointmentDate("");
      setAppointmentTime("");
      toast({ title: "Appointment scheduled successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to schedule", description: err.message });
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'cancel' | 'complete') => {
    try {
      if (action === 'cancel') {
        await cancelAppointmentMutation.mutateAsync({ id: appointmentId });
      } else {
        await completeAppointmentMutation.mutateAsync({ id: appointmentId });
        queryClient.invalidateQueries({ queryKey: getGetPatientJourneyQueryKey(id) });
      }
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      toast({ title: `Appointment ${action === 'cancel' ? 'cancelled' : 'completed'}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    }
  };

  const handleEnroll = async () => {
    if (!enrollProgramId) return;
    try {
      await createEnrollment.mutateAsync({ data: { patientId: id, programId: enrollProgramId } });
      queryClient.invalidateQueries({ queryKey: enrollmentsKey });
      queryClient.invalidateQueries({ queryKey: getGetPatientJourneyQueryKey(id) });
      setIsEnrollDialogOpen(false);
      setEnrollProgramId("");
      toast({ title: "Enrolled successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to enroll", description: err.message });
    }
  };

  const handleCompleteEnrollment = async (enrollmentId: string) => {
    try {
      await completeEnrollment.mutateAsync({ id: enrollmentId });
      queryClient.invalidateQueries({ queryKey: enrollmentsKey });
      toast({ title: "Enrollment completed" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    try {
      await cancelEnrollment.mutateAsync({ id: enrollmentId });
      queryClient.invalidateQueries({ queryKey: enrollmentsKey });
      toast({ title: "Enrollment cancelled" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    }
  };

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      await updatePatient.mutateAsync({
        id,
        data: { status: newStatus }
      });
      queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey(id) });
      toast({
        title: "Status updated",
        description: `Patient status changed to ${newStatus}`
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: err.message
      });
    }
  };

  const { data: patient, isLoading } = useGetPatient(id, {
    query: {
      enabled: !isNew && !!id,
      queryKey: getGetPatientQueryKey(id)
    }
  });

  const { data: journeyList, isLoading: isJourneyLoading } = useGetPatientJourney(id, {
    query: {
      enabled: !isNew && !!id,
      queryKey: getGetPatientJourneyQueryKey(id)
    }
  });

  // Load assignments for this patient
  const assignmentsKey = getListAssignmentsQueryKey({ patientId: id });
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useListAssignments(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: assignmentsKey } }
  );

  // Load users for doctor selection
  const { data: usersData } = useListUsers({ limit: 200 }, { query: { enabled: isAssignDialogOpen, queryKey: ["users-all"] } });

  // SMS communications
  const smsKey = getListCommunicationsQueryKey({ patientId: id });
  const { data: smsHistory, isLoading: isSmsLoading } = useListCommunications(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: smsKey } }
  );

  // Files
  const filesKey = getListFilesQueryKey({ patientId: id });
  const { data: fileList, isLoading: isFileLoading } = useListFiles(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: filesKey } }
  );

  const handleRecordJourney = async () => {
    try {
      await createJourneyEvent.mutateAsync({
        id,
        data: { status: journeyStatus, notes: journeyNotes }
      });
      queryClient.invalidateQueries({ queryKey: getGetPatientJourneyQueryKey(id) });
      setIsJourneyDialogOpen(false);
      setJourneyNotes("");
      toast({ title: "Journey event recorded" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to record event", description: err.message });
    }
  };

  const handleAssignDoctor = async () => {
    if (!selectedDoctorId) return;
    try {
      await createAssignment.mutateAsync({ data: { patientId: id, userId: selectedDoctorId } });
      queryClient.invalidateQueries({ queryKey: assignmentsKey });
      setIsAssignDialogOpen(false);
      setSelectedDoctorId("");
      toast({ title: "Doctor assigned successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to assign doctor", description: err.message });
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    try {
      await deleteAssignment.mutateAsync({ id: assignmentId });
      queryClient.invalidateQueries({ queryKey: assignmentsKey });
      toast({ title: "Assignment removed" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to remove assignment", description: err.message });
    }
  };

  const handleSendSms = async () => {
    if (!smsMessage.trim()) return;
    try {
      await createCommunication.mutateAsync({ data: { patientId: id, type: "SMS", subject: "SMS", body: smsMessage.trim() } });
      queryClient.invalidateQueries({ queryKey: smsKey });
      setIsSmsDialogOpen(false);
      setSmsMessage("");
      toast({ title: "SMS queued successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to send SMS", description: err.message });
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    try {
      await uploadFile.mutateAsync({
        data: {
          file: selectedFile as any, // Orval codegen sets type to Blob, so we cast
          patientId: id
        }
      });
      setSelectedFile(null);
      setIsFileDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: filesKey });
      toast({ title: "File uploaded successfully" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile.mutateAsync({ id: fileId });
      queryClient.invalidateQueries({ queryKey: filesKey });
      toast({ title: "File deleted successfully" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to delete file", description: error.message });
    }
  };

  if (isNew) {
    return <div>New Patient form to be implemented</div>; // handled in patients-new.tsx but just in case
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64 col-span-1" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return <div className="p-8">Patient not found</div>;
  }

  return (
    <div className="p-8 flex-1 overflow-y-auto bg-muted/10">
      <div className="mb-6">
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="mb-4 -ml-3 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {patient.title ? `${patient.title} ` : ''}{patient.firstName} {patient.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-muted-foreground text-sm">
                <span className="font-mono bg-muted px-2 py-0.5 rounded">{patient.nhsNumber}</span>
                <span>•</span>
                <span>{patient.gender || 'Unknown gender'}</span>
                <span>•</span>
                <span>DOB: {patient.dob || 'Unknown'}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 px-3" disabled={updatePatient.isPending}>
                <Badge variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'} className="pointer-events-none">
                  {patient.status}
                </Badge>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange('ACTIVE')}>
                Set to ACTIVE
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('INACTIVE')}>
                Set to INACTIVE
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Primary Mobile</div>
                  <div className="text-sm text-muted-foreground">{patient.mobile || '-'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">{patient.email || '-'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 col-span-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Address</div>
                  <div className="text-sm text-muted-foreground">
                    {[patient.address, patient.city, patient.postalCode, patient.country].filter(Boolean).join(', ') || '-'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Care Details</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <div className="text-sm font-medium mb-1 text-muted-foreground">Program</div>
                   <div className="flex items-center gap-2">
                     <Activity className="w-4 h-4 text-primary" />
                     {patient.program?.name || 'Unassigned'}
                   </div>
                 </div>
                 <div>
                   <div className="text-sm font-medium mb-1 text-muted-foreground">Clinic</div>
                   <div className="flex items-center gap-2">
                     <Building2 className="w-4 h-4 text-primary" />
                     {patient.clinic?.name || 'Unassigned'}
                   </div>
                 </div>
                 <div>
                   <div className="text-sm font-medium mb-1 text-muted-foreground">Area</div>
                   <div className="flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-primary" />
                     {patient.area?.name || 'Unassigned'}
                   </div>
                 </div>
                 <div>
                   <div className="text-sm font-medium mb-1 text-muted-foreground">Registered</div>
                   <div className="flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-primary" />
                     {new Date(patient.createdAt).toLocaleDateString()}
                   </div>
                 </div>
               </div>
             </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Program Enrollments</CardTitle>
              <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    <Plus className="w-4 h-4 mr-1" /> Enroll
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enroll in Program</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Select Program</Label>
                      <Select value={enrollProgramId} onValueChange={setEnrollProgramId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a program..." />
                        </SelectTrigger>
                        <SelectContent>
                          {programsData?.data?.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsEnrollDialogOpen(false); setEnrollProgramId(""); }}>Cancel</Button>
                    <Button onClick={handleEnroll} disabled={!enrollProgramId || createEnrollment.isPending}>Enroll</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isEnrollmentsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : enrollments?.data?.length ? (
                <div className="space-y-4">
                  {enrollments.data.map((enrollment) => (
                    <div key={enrollment.id} className="flex flex-col gap-3 p-4 border rounded-md border-border bg-background">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-primary" />
                          <span className="font-medium">{enrollment.program?.name}</span>
                        </div>
                        <Badge variant={enrollment.status === "ACTIVE" ? "default" : "secondary"}>
                          {enrollment.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center justify-between">
                        <span>Enrolled: {format(new Date(enrollment.enrolledAt), 'MMM d, yyyy')}</span>
                        {enrollment.completedAt && <span>Ended: {format(new Date(enrollment.completedAt), 'MMM d, yyyy')}</span>}
                      </div>
                      {enrollment.status === "ACTIVE" && (
                        <div className="flex justify-end gap-2 pt-2 border-t border-border mt-1">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-destructive">
                                <XCircle className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Enrollment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel the enrollment in {enrollment.program?.name}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancelEnrollment(enrollment.id)}>Yes, Cancel</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary">
                                <CheckCircle className="w-4 h-4 mr-1" /> Complete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Complete Enrollment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Mark the enrollment in {enrollment.program?.name} as successfully completed?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCompleteEnrollment(enrollment.id)}>Yes, Complete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2 text-center">No program enrollments found.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Appointments
              </CardTitle>
              <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    <Plus className="w-4 h-4 mr-1" /> Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Appointment</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Doctor</Label>
                      <Select value={appointmentDoctorId} onValueChange={setAppointmentDoctorId}>
                        <SelectTrigger><SelectValue placeholder="Select doctor..." /></SelectTrigger>
                        <SelectContent>
                          {usersData?.data?.filter(u => u.role?.name === "DOCTOR" || u.role?.name === "SUPERADMIN").map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Clinic</Label>
                      <Select value={appointmentClinicId} onValueChange={setAppointmentClinicId}>
                        <SelectTrigger><SelectValue placeholder="Select clinic..." /></SelectTrigger>
                        <SelectContent>
                          {clinicsData?.data?.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Date</Label>
                        <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Time</Label>
                        <input type="time" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAppointmentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleScheduleAppointment} disabled={!appointmentDoctorId || !appointmentClinicId || !appointmentDate || !appointmentTime || createAppointment.isPending}>
                      Schedule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isAppointmentsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : appointmentsData?.data?.length ? (
                <div className="space-y-3">
                  {appointmentsData.data.map((appt) => (
                    <div key={appt.id} className="flex flex-col gap-2 py-3 border-b border-border last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={appt.status === "SCHEDULED" ? "default" : appt.status === "COMPLETED" ? "secondary" : "destructive"} className="text-xs">
                            {appt.status}
                          </Badge>
                          <span className="text-sm font-medium">
                            {format(new Date(appt.appointmentDate), "MMM d, yyyy 'at' HH:mm")}
                          </span>
                        </div>
                        {appt.status === "SCHEDULED" && (
                          <div className="flex justify-end gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-destructive">
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
                                  <AlertDialogAction onClick={() => handleAppointmentAction(appt.id, 'cancel')}>Yes, Cancel</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary">
                                  <CheckCircle className="w-4 h-4 mr-1" /> Complete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Complete Appointment</AlertDialogTitle>
                                  <AlertDialogDescription>Mark this appointment as successfully completed? This will add a consultation journey event.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Close</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleAppointmentAction(appt.id, 'complete')}>Yes, Complete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1 mt-1">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {appt.clinic?.name}</span>
                      </div>
                      {appt.notes && <p className="text-sm mt-1 bg-muted/50 p-2 rounded-md">{appt.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2 text-center">No appointments found.</div>
              )}
            </CardContent>
          </Card>
        </div>        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Care Team</CardTitle>
              <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    <UserPlus className="w-4 h-4 mr-1" /> Assign Doctor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Doctor to Patient</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Select Team Member</Label>
                      <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a user..." />
                        </SelectTrigger>
                        <SelectContent>
                          {usersData?.data?.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.firstName} {u.lastName} — {u.role?.name ?? "No role"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsAssignDialogOpen(false); setSelectedDoctorId(""); }}>Cancel</Button>
                    <Button onClick={handleAssignDoctor} disabled={!selectedDoctorId || createAssignment.isPending}>Assign</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isAssignmentsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : assignmentsData?.data?.length ? (
                <div className="space-y-3">
                  {assignmentsData.data.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{assignment.user?.firstName} {assignment.user?.lastName}</div>
                          <div className="text-xs text-muted-foreground">{assignment.user?.role?.name}</div>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove {assignment.user?.firstName} {assignment.user?.lastName} from this patient's care team?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUnassign(assignment.id)}>Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2 text-center">No care team members assigned.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Patient Journey</CardTitle>
              <Dialog open={isJourneyDialogOpen} onOpenChange={setIsJourneyDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    <Plus className="w-4 h-4 mr-1" /> Record Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Journey Event</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Select value={journeyStatus} onValueChange={(val) => setJourneyStatus(val as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="PSI">PSI</SelectItem>
                          <SelectItem value="MEDICATION_REQUIRED">Medication Required</SelectItem>
                          <SelectItem value="DISCHARGE">Discharge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Notes (optional)</Label>
                      <Textarea 
                        value={journeyNotes} 
                        onChange={(e) => setJourneyNotes(e.target.value)} 
                        placeholder="Add details..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsJourneyDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRecordJourney} disabled={createJourneyEvent.isPending}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isJourneyLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : journeyList?.data?.length ? (
                <div className="relative border-l ml-3 pl-4 space-y-6">
                  {journeyList.data.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{event.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.createdAt), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        {event.notes && <p className="text-sm mt-1">{event.notes}</p>}
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <User className="w-3 h-3" />
                          {event.actedByUser?.firstName} {event.actedByUser?.lastName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  No journey events recorded
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS Communications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Communications
              </CardTitle>
              <Dialog open={isSmsDialogOpen} onOpenChange={setIsSmsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    <Send className="w-4 h-4 mr-1" /> Send SMS
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send SMS to Patient</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Message</Label>
                      <Textarea
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows={4}
                        maxLength={1600}
                      />
                      <p className="text-xs text-muted-foreground text-right">{smsMessage.length}/1600</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSmsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSendSms} disabled={!smsMessage.trim() || createCommunication.isPending}>
                      Send
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isSmsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : smsHistory?.data?.length ? (
                <div className="space-y-3">
                  {smsHistory.data.map((comm) => (
                    <div key={comm.id} className="flex flex-col gap-1 py-2 border-b border-border last:border-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{comm.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comm.createdAt), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comm.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2 text-center">No messages sent yet.</div>
              )}
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Files & Documents
              </CardTitle>
              <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    <Upload className="w-4 h-4 mr-1" /> Upload
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Select File</Label>
                      <input
                        type="file"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsFileDialogOpen(false); setSelectedFile(null); }}>Cancel</Button>
                    <Button onClick={handleUploadFile} disabled={!selectedFile || uploadFile.isPending}>
                      {uploadFile.isPending ? "Uploading..." : "Upload"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isFileLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : fileList?.data?.length ? (
                <div className="space-y-3">
                  {fileList.data.map((file) => (
                    <div key={file.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none">{file.fileKey}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {format(new Date(file.createdAt), 'MMM d, yyyy')} • {file.uploader?.firstName} {file.uploader?.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </a>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete File</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {file.fileKey}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFile(file.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2 text-center">No files uploaded yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
