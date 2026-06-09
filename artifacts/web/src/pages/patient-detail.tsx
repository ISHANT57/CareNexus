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
  useListAppointments, useCreateAppointment, useCancelAppointment, useCompleteAppointment, useUpdateAppointment, getListAppointmentsQueryKey,
  useListClinics,
  useListConsultations, useCreateConsultation, useUpdateConsultation, getListConsultationsQueryKey,
  useListOutcomes, useCreateOutcome, getListOutcomesQueryKey,
  useListOutcomeMetrics,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MapPin, Phone, Mail, Calendar, Building2, Activity, ArrowLeft, ChevronDown, Plus, Trash2, UserPlus, MessageSquare, Send, Upload, FileText, Download, CheckCircle, XCircle, Pencil, ClipboardList, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const emptyConsultationForm = {
  chiefComplaint: "", symptoms: "", observations: "", diagnosis: "",
  treatmentPlan: "", medications: "", followUpInstructions: ""
};

// ── ConsultationFormFields at module scope (prevents remount on every render) ──
const ConsultationFormFields = ({ form, setForm }: { form: typeof emptyConsultationForm; setForm: (f: typeof emptyConsultationForm) => void }) => (
  <div className="grid gap-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Chief Complaint</label>
        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.chiefComplaint} onChange={e => setForm({ ...form, chiefComplaint: e.target.value })} placeholder="Main reason for visit..." />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Symptoms</label>
        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} placeholder="Patient reported symptoms..." />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Observations</label>
        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Clinical observations..." />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Diagnosis</label>
        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="Primary and secondary diagnosis..." />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Treatment Plan</label>
        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.treatmentPlan} onChange={e => setForm({ ...form, treatmentPlan: e.target.value })} placeholder="Recommended treatments..." />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Medications</label>
        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.medications} onChange={e => setForm({ ...form, medications: e.target.value })} placeholder="Prescribed medications..." />
      </div>
    </div>
    <div className="grid gap-2">
      <label className="text-sm font-medium">Follow-up Instructions</label>
      <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.followUpInstructions} onChange={e => setForm({ ...form, followUpInstructions: e.target.value })} placeholder="Instructions for patient..." />
    </div>
  </div>
);

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const isNew = !id || id === "new";

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── Patient status ────────────────────────────────────────────────────────────
  const updatePatient = useUpdatePatientStatus();

  // ── Journey ───────────────────────────────────────────────────────────────────
  const createJourneyEvent = useCreatePatientJourney();
  const [isJourneyDialogOpen, setIsJourneyDialogOpen] = useState(false);
  const [journeyStatus, setJourneyStatus] = useState<"NEW" | "PSI" | "DISCHARGE" | "MEDICATION_REQUIRED">("NEW");
  const [journeyNotes, setJourneyNotes] = useState("");

  // ── Assignments ───────────────────────────────────────────────────────────────
  const createAssignment = useCreateAssignment();
  const deleteAssignment = useDeleteAssignment();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  // ── SMS ───────────────────────────────────────────────────────────────────────
  const createCommunication = useCreateCommunication();
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");

  // ── Files ─────────────────────────────────────────────────────────────────────
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ── Program Enrollments ───────────────────────────────────────────────────────
  const createEnrollment = useCreateProgramEnrollment();
  const completeEnrollment = useCompleteProgramEnrollment();
  const cancelEnrollment = useCancelProgramEnrollment();
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [enrollProgramId, setEnrollProgramId] = useState("");

  // ── Appointments ──────────────────────────────────────────────────────────────
  const createAppointment = useCreateAppointment();
  const cancelAppointmentMutation = useCancelAppointment();
  const completeAppointmentMutation = useCompleteAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [appointmentDoctorId, setAppointmentDoctorId] = useState("");
  const [appointmentClinicId, setAppointmentClinicId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [isEditApptDialogOpen, setIsEditApptDialogOpen] = useState(false);
  const [editApptId, setEditApptId] = useState("");
  const [editApptDate, setEditApptDate] = useState("");
  const [editApptTime, setEditApptTime] = useState("");
  const [editApptDuration, setEditApptDuration] = useState(30);
  const [editApptNotes, setEditApptNotes] = useState("");

  // ── Consultations ─────────────────────────────────────────────────────────────
  const createConsultation = useCreateConsultation();
  const updateConsultation = useUpdateConsultation();
  const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [consultationForm, setConsultationForm] = useState(emptyConsultationForm);
  // Edit consultation state
  const [isEditConsultationDialogOpen, setIsEditConsultationDialogOpen] = useState(false);
  const [editConsultationId, setEditConsultationId] = useState("");
  const [editConsultationForm, setEditConsultationForm] = useState(emptyConsultationForm);

  // ── Outcomes ───────────────────────────────────────────────────────────────────────
  const createOutcome = useCreateOutcome();
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false);
  const [outcomeMetricId, setOutcomeMetricId] = useState("");
  const [outcomeBaseline, setOutcomeBaseline] = useState("");
  const [outcomeCurrent, setOutcomeCurrent] = useState("");
  const [outcomeTarget, setOutcomeTarget] = useState("");
  const [outcomeProgramId, setOutcomeProgramId] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");

  // ── Communications ───────────────────────────────────────────────────────────
  const [commType, setCommType] = useState<"SMS" | "EMAIL">("SMS");

  // ── Queries ───────────────────────────────────────────────────────────────────
  const { data: patient, isLoading } = useGetPatient(id, {
    query: { enabled: !isNew && !!id, queryKey: getGetPatientQueryKey(id) }
  });
  const { data: journeyList, isLoading: isJourneyLoading } = useGetPatientJourney(id, {
    query: { enabled: !isNew && !!id, queryKey: getGetPatientJourneyQueryKey(id) }
  });
  const assignmentsKey = getListAssignmentsQueryKey({ patientId: id });
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useListAssignments(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: assignmentsKey } }
  );
  const { data: usersData } = useListUsers({ limit: 200 }, { query: { enabled: isAssignDialogOpen || isAppointmentDialogOpen, queryKey: ["users-all"] } });
  const smsKey = getListCommunicationsQueryKey({ patientId: id });
  const { data: smsHistory, isLoading: isSmsLoading } = useListCommunications(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: smsKey } }
  );
  const filesKey = getListFilesQueryKey({ patientId: id });
  const { data: fileList, isLoading: isFileLoading } = useListFiles(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: filesKey } }
  );
  const enrollmentsKey = getListProgramEnrollmentsQueryKey({ patientId: id });
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useListProgramEnrollments(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: enrollmentsKey } }
  );
  const { data: programsData } = useListPrograms({ limit: 100 }, { query: { enabled: isEnrollDialogOpen, queryKey: ["programs", "list"] } });
  const appointmentsKey = getListAppointmentsQueryKey({ patientId: id });
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useListAppointments(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: appointmentsKey } }
  );
  const { data: clinicsData } = useListClinics({ limit: 100 }, { query: { enabled: isAppointmentDialogOpen, queryKey: ["clinics", "list"] } });
  const consultationsKey = getListConsultationsQueryKey({ patientId: id });
  const { data: consultationsData, isLoading: isConsultationsLoading } = useListConsultations(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: consultationsKey } }
  );
  const outcomesKey = getListOutcomesQueryKey({ patientId: id });
  const { data: outcomesData, isLoading: isOutcomesLoading } = useListOutcomes(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: outcomesKey } }
  );
  const { data: outcomeMetricsData } = useListOutcomeMetrics(
    { limit: 100 },
    { query: { enabled: isOutcomeDialogOpen, queryKey: ["outcome-metrics", "active"] } }
  );

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleStatusChange = async (newStatus: "ACTIVE" | "INACTIVE") => {
    try {
      await updatePatient.mutateAsync({ id, data: { status: newStatus } });
      queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey(id) });
      toast({ title: "Status updated", description: `Patient status changed to ${newStatus}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to update status", description: err.message });
    }
  };

  const handleRecordJourney = async () => {
    try {
      await createJourneyEvent.mutateAsync({ id, data: { status: journeyStatus, notes: journeyNotes } });
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
      // Use the patient's existing clinicId and areaId for context
      const clinicId = patient?.clinic?.id ?? "";
      const areaId = patient?.area?.id ?? "";
      if (!clinicId || !areaId) {
        toast({ variant: "destructive", title: "Cannot assign", description: "Patient must have a clinic and area set before assigning a doctor." });
        return;
      }
      await createAssignment.mutateAsync({ data: { patientId: id, doctorId: selectedDoctorId, clinicId, areaId } });
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
      const subject = commType === "EMAIL"
        ? (document.getElementById("comm-subject") as HTMLInputElement)?.value?.trim() || "Message"
        : commType;
      await createCommunication.mutateAsync({
        data: { patientId: id, type: commType, channel: commType, subject, body: smsMessage.trim() } as any
      });
      queryClient.invalidateQueries({ queryKey: smsKey });
      setIsSmsDialogOpen(false);
      setSmsMessage("");
      toast({ title: `${commType} sent successfully` });
    } catch (err: any) {
      toast({ variant: "destructive", title: `Failed to send ${commType}`, description: err.message });
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    try {
      await uploadFile.mutateAsync({ data: { file: selectedFile as any, patientId: id } });
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

  const handleScheduleAppointment = async () => {
    if (!appointmentDoctorId || !appointmentClinicId || !appointmentDate || !appointmentTime) return;
    try {
      const datetimeStr = `${appointmentDate}T${appointmentTime}:00Z`;
      await createAppointment.mutateAsync({
        data: { patientId: id, doctorId: appointmentDoctorId, clinicId: appointmentClinicId, appointmentDate: datetimeStr, durationMinutes: 30 }
      });
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      setIsAppointmentDialogOpen(false);
      setAppointmentDoctorId(""); setAppointmentClinicId(""); setAppointmentDate(""); setAppointmentTime("");
      toast({ title: "Appointment scheduled successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to schedule", description: err.message });
    }
  };

  const openEditAppointment = (appt: any) => {
    setEditApptId(appt.id);
    const d = new Date(appt.appointmentDate);
    setEditApptDate(format(d, "yyyy-MM-dd"));
    setEditApptTime(format(d, "HH:mm"));
    setEditApptDuration(appt.durationMinutes || 30);
    setEditApptNotes(appt.notes || "");
    setIsEditApptDialogOpen(true);
  };

  const handleUpdateAppointment = async () => {
    if (!editApptId || !editApptDate || !editApptTime) return;
    try {
      const datetimeStr = `${editApptDate}T${editApptTime}:00Z`;
      await updateAppointmentMutation.mutateAsync({ id: editApptId, data: { appointmentDate: datetimeStr, durationMinutes: editApptDuration, notes: editApptNotes } });
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      setIsEditApptDialogOpen(false);
      toast({ title: "Appointment updated successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to update", description: err.message });
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: "cancel" | "complete") => {
    try {
      if (action === "cancel") {
        await cancelAppointmentMutation.mutateAsync({ id: appointmentId });
      } else {
        await completeAppointmentMutation.mutateAsync({ id: appointmentId });
        queryClient.invalidateQueries({ queryKey: getGetPatientJourneyQueryKey(id) });
      }
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      toast({ title: `Appointment ${action === "cancel" ? "cancelled" : "completed"}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    }
  };

  // Opens Record Consultation dialog pre-selecting a specific appointment
  const openRecordConsultation = (appointmentId?: string) => {
    if (appointmentId) setSelectedAppointmentId(appointmentId);
    setConsultationForm(emptyConsultationForm);
    setIsConsultationDialogOpen(true);
  };

  const handleRecordConsultation = async () => {
    try {
      const appt = appointmentsData?.data?.find(a => a.id === selectedAppointmentId);
      if (!appt) throw new Error("Appointment not found");
      await createConsultation.mutateAsync({
        data: {
          patientId: id,
          appointmentId: appt.id,
          doctorId: appt.doctorId,
          clinicId: appt.clinicId,
          ...consultationForm
        }
      });
      toast({ title: "Success", description: "Consultation notes recorded successfully." });
      setIsConsultationDialogOpen(false);
      setSelectedAppointmentId("");
      setConsultationForm(emptyConsultationForm);
      queryClient.invalidateQueries({ queryKey: consultationsKey });
      queryClient.invalidateQueries({ queryKey: getGetPatientJourneyQueryKey(id) });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  };

  const openEditConsultation = (cons: any) => {
    setEditConsultationId(cons.id);
    setEditConsultationForm({
      chiefComplaint: cons.chiefComplaint ?? "",
      symptoms: cons.symptoms ?? "",
      observations: cons.observations ?? "",
      diagnosis: cons.diagnosis ?? "",
      treatmentPlan: cons.treatmentPlan ?? "",
      medications: cons.medications ?? "",
      followUpInstructions: cons.followUpInstructions ?? "",
    });
    setIsEditConsultationDialogOpen(true);
  };

  const handleUpdateConsultation = async () => {
    if (!editConsultationId) return;
    try {
      await updateConsultation.mutateAsync({ id: editConsultationId, data: editConsultationForm });
      queryClient.invalidateQueries({ queryKey: consultationsKey });
      setIsEditConsultationDialogOpen(false);
      toast({ title: "Consultation updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────────
  if (isNew) return <div>New Patient form handled in patient-new.tsx</div>;

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

  if (!patient) return <div className="p-8">Patient not found</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto bg-muted/10">
      {/* ── Patient Header (always visible) ──────────────────────────────────── */}
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
              <DropdownMenuItem onClick={() => handleStatusChange('ACTIVE')}>Set to ACTIVE</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('INACTIVE')}>Set to INACTIVE</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Record Consultation Dialog ─────────────────────────────────────────── */}
      <Dialog open={isConsultationDialogOpen} onOpenChange={setIsConsultationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Consultation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Appointment</Label>
              <Select value={selectedAppointmentId} onValueChange={setSelectedAppointmentId}>
                <SelectTrigger><SelectValue placeholder="Select completed appointment..." /></SelectTrigger>
                <SelectContent>
                  {appointmentsData?.data?.filter(a => a.status === "COMPLETED").map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {format(new Date(a.appointmentDate), "MMM d, yyyy")} — Dr. {a.doctor?.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ConsultationFormFields form={consultationForm} setForm={setConsultationForm} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsultationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordConsultation} disabled={!selectedAppointmentId || !consultationForm.chiefComplaint || !consultationForm.diagnosis || createConsultation.isPending}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Consultation Dialog ──────────────────────────────────────────── */}
      <Dialog open={isEditConsultationDialogOpen} onOpenChange={setIsEditConsultationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Consultation Notes</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ConsultationFormFields form={editConsultationForm} setForm={setEditConsultationForm} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditConsultationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateConsultation} disabled={!editConsultationForm.chiefComplaint || !editConsultationForm.diagnosis || updateConsultation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Appointment Dialog ───────────────────────────────────────────── */}
      <Dialog open={isEditApptDialogOpen} onOpenChange={setIsEditApptDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input type="date" value={editApptDate} onChange={e => setEditApptDate(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <input type="time" value={editApptTime} onChange={e => setEditApptTime(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <input type="number" min="1" value={editApptDuration} onChange={e => setEditApptDuration(parseInt(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea value={editApptNotes} onChange={e => setEditApptNotes(e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditApptDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateAppointment} disabled={!editApptDate || !editApptTime || updateAppointmentMutation.isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start bg-muted/50 rounded-lg p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="overview" className="gap-2"><User className="w-4 h-4" />Overview</TabsTrigger>
          <TabsTrigger value="journey" className="gap-2"><Activity className="w-4 h-4" />Journey</TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2"><Calendar className="w-4 h-4" />Appointments</TabsTrigger>
          <TabsTrigger value="consultations" className="gap-2"><ClipboardList className="w-4 h-4" />Consultations</TabsTrigger>
          <TabsTrigger value="outcomes" className="gap-2"><Activity className="w-4 h-4" />Outcomes</TabsTrigger>
          <TabsTrigger value="files" className="gap-2"><FileText className="w-4 h-4" />Files</TabsTrigger>
          <TabsTrigger value="communications" className="gap-2"><MessageSquare className="w-4 h-4" />Communications</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
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
                <CardHeader><CardTitle className="text-lg">Care Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium mb-1 text-muted-foreground">Program</div>
                      <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />{patient.program?.name || 'Unassigned'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1 text-muted-foreground">Clinic</div>
                      <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />{patient.clinic?.name || 'Unassigned'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1 text-muted-foreground">Area</div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{patient.area?.name || 'Unassigned'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1 text-muted-foreground">Registered</div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />{new Date(patient.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Program Enrollments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Program Enrollments</CardTitle>
                  <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8"><Plus className="w-4 h-4 mr-1" /> Enroll</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Enroll in Program</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Select Program</Label>
                          <Select value={enrollProgramId} onValueChange={setEnrollProgramId}>
                            <SelectTrigger><SelectValue placeholder="Choose a program..." /></SelectTrigger>
                            <SelectContent>
                              {programsData?.data?.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
                  {isEnrollmentsLoading ? <Skeleton className="h-20 w-full" /> : enrollments?.data?.length ? (
                    <div className="space-y-4">
                      {enrollments.data.map((enrollment) => (
                        <div key={enrollment.id} className="flex flex-col gap-3 p-4 border rounded-md border-border bg-background">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Activity className="w-5 h-5 text-primary" />
                              <span className="font-medium">{enrollment.program?.name}</span>
                            </div>
                            <Badge variant={enrollment.status === "ACTIVE" ? "default" : "secondary"}>{enrollment.status}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center justify-between">
                            <span>Enrolled: {format(new Date(enrollment.enrolledAt), 'MMM d, yyyy')}</span>
                            {enrollment.completedAt && <span>Ended: {format(new Date(enrollment.completedAt), 'MMM d, yyyy')}</span>}
                          </div>
                          {enrollment.status === "ACTIVE" && (
                            <div className="flex justify-end gap-2 pt-2 border-t border-border mt-1">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-destructive"><XCircle className="w-4 h-4 mr-1" /> Cancel</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Cancel Enrollment</AlertDialogTitle><AlertDialogDescription>Are you sure you want to cancel the enrollment in {enrollment.program?.name}?</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCancelEnrollment(enrollment.id)}>Yes, Cancel</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary"><CheckCircle className="w-4 h-4 mr-1" /> Complete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Complete Enrollment</AlertDialogTitle><AlertDialogDescription>Mark the enrollment in {enrollment.program?.name} as successfully completed?</AlertDialogDescription></AlertDialogHeader>
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
                  ) : <div className="text-sm text-muted-foreground py-2 text-center">No program enrollments found.</div>}
                </CardContent>
              </Card>
            </div>

            {/* Care Team sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Care Team</CardTitle>
                  <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8"><UserPlus className="w-4 h-4 mr-1" /> Assign Doctor</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Assign Doctor to Patient</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Select Team Member</Label>
                          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                            <SelectTrigger><SelectValue placeholder="Choose a user..." /></SelectTrigger>
                            <SelectContent>
                              {usersData?.data?.map((u) => (
                                <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} — {u.role?.name ?? "No role"}</SelectItem>
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
                  {isAssignmentsLoading ? <Skeleton className="h-10 w-full" /> : assignmentsData?.data?.length ? (
                    <div className="space-y-3">
                      {assignmentsData.data.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{assignment.doctor?.firstName} {assignment.doctor?.lastName}</div>
                              <div className="text-xs text-muted-foreground">{assignment.doctor?.role?.name ?? "Doctor"} {assignment.clinic?.name ? `• ${assignment.clinic.name}` : ""}</div>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Remove Assignment</AlertDialogTitle><AlertDialogDescription>Remove {assignment.doctor?.firstName} {assignment.doctor?.lastName} from this patient's care team?</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUnassign(assignment.id)}>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-sm text-muted-foreground py-2 text-center">No care team members assigned.</div>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── JOURNEY TAB ──────────────────────────────────────────────────── */}
        <TabsContent value="journey">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Patient Journey</CardTitle>
              <Dialog open={isJourneyDialogOpen} onOpenChange={setIsJourneyDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8"><Plus className="w-4 h-4 mr-1" /> Record Event</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Record Journey Event</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Select value={journeyStatus} onValueChange={(val) => setJourneyStatus(val as any)}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
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
                      <Textarea value={journeyNotes} onChange={(e) => setJourneyNotes(e.target.value)} placeholder="Add details..." />
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
                <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
              ) : journeyList?.data?.length ? (
                <div className="relative border-l ml-3 pl-4 space-y-6">
                  {journeyList.data.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{event.status}</Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(event.createdAt), 'MMM d, yyyy HH:mm')}</span>
                        </div>
                        {event.notes && <p className="text-sm mt-1">{event.notes}</p>}
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <User className="w-3 h-3" />{event.actedByUser?.firstName} {event.actedByUser?.lastName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-sm text-muted-foreground py-4 text-center">No journey events recorded</div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── APPOINTMENTS TAB ──────────────────────────────────────────────── */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><Calendar className="w-4 h-4" /> Appointments</CardTitle>
              <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8"><Plus className="w-4 h-4 mr-1" /> Schedule</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Schedule Appointment</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Doctor</Label>
                      <Select value={appointmentDoctorId} onValueChange={setAppointmentDoctorId}>
                        <SelectTrigger><SelectValue placeholder="Select doctor..." /></SelectTrigger>
                        <SelectContent>
                          {usersData?.data?.filter(u => u.role?.name === "DOCTOR" || u.role?.name === "SUPER_ADMIN" || u.role?.name === "CLINIC_ADMIN").map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} — {u.role?.name}</SelectItem>
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
                    <Button onClick={handleScheduleAppointment} disabled={!appointmentDoctorId || !appointmentClinicId || !appointmentDate || !appointmentTime || createAppointment.isPending}>Schedule</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isAppointmentsLoading ? <Skeleton className="h-10 w-full" /> : appointmentsData?.data?.length ? (
                <div className="space-y-3">
                  {appointmentsData.data.map((appt) => {
                    const apptConsultation = consultationsData?.data?.find(c => c.appointmentId === appt.id);
                    return (
                      <div key={appt.id} className="flex flex-col gap-2 py-3 border-b border-border last:border-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={appt.status === "SCHEDULED" ? "default" : appt.status === "COMPLETED" ? "secondary" : "destructive"} className="text-xs">
                              {appt.status}
                            </Badge>
                            <span className="text-sm font-medium">{format(new Date(appt.appointmentDate), "MMM d, yyyy 'at' HH:mm")}</span>
                          </div>
                          <div className="flex gap-2">
                            {appt.status === "SCHEDULED" && (
                              <>
                                <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-primary" onClick={() => openEditAppointment(appt)}>
                                  <Pencil className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-destructive"><XCircle className="w-4 h-4 mr-1" /> Cancel</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Cancel Appointment</AlertDialogTitle><AlertDialogDescription>Are you sure you want to cancel this appointment?</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Close</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleAppointmentAction(appt.id, "cancel")}>Yes, Cancel</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary"><CheckCircle className="w-4 h-4 mr-1" /> Complete</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Complete Appointment</AlertDialogTitle><AlertDialogDescription>Mark this appointment as successfully completed?</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Close</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleAppointmentAction(appt.id, "complete")}>Yes, Complete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            {/* KI-004: Record Consultation shortcut on completed appointments */}
                            {appt.status === "COMPLETED" && !apptConsultation && (
                              <Button size="sm" variant="outline" className="h-8 border-primary/40 text-primary hover:bg-primary/5" onClick={() => openRecordConsultation(appt.id)}>
                                <ClipboardList className="w-4 h-4 mr-1" /> Record Consultation
                              </Button>
                            )}
                            {appt.status === "COMPLETED" && apptConsultation && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 px-2">
                                <CheckCircle className="w-3 h-3 text-emerald-500" /> Consultation recorded
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1 mt-1">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</span>
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {appt.clinic?.name}</span>
                          {appt.durationMinutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.durationMinutes} min</span>}
                        </div>
                        {appt.notes && <p className="text-sm mt-1 bg-muted/50 p-2 rounded-md">{appt.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : <div className="text-sm text-muted-foreground py-2 text-center">No appointments found.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CONSULTATIONS TAB ─────────────────────────────────────────────── */}
        <TabsContent value="consultations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Consultation History</CardTitle>
              <Button size="sm" variant="outline" className="h-8" onClick={() => openRecordConsultation()}>
                <Plus className="w-4 h-4 mr-1" /> Record
              </Button>
            </CardHeader>
            <CardContent>
              {isConsultationsLoading ? <Skeleton className="h-10 w-full" /> : consultationsData?.data?.length ? (
                <div className="space-y-4">
                  {consultationsData.data.map(cons => (
                    <div key={cons.id} className="p-4 border rounded-lg bg-card/50 text-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-base">{cons.consultationDate ? format(new Date(cons.consultationDate), "MMMM d, yyyy") : ""}</div>
                          <div className="text-muted-foreground flex gap-3 mt-1">
                            <span>Dr. {cons.doctor?.lastName}</span>
                            <span>•</span>
                            <span>{cons.clinic?.name}</span>
                          </div>
                        </div>
                        {/* KI-002: Edit button */}
                        <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-primary" onClick={() => openEditConsultation(cons)}>
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
                        <div>
                          <span className="font-medium text-xs uppercase text-muted-foreground">Complaint:</span>
                          <p className="mt-0.5">{cons.chiefComplaint}</p>
                        </div>
                        <div>
                          <span className="font-medium text-xs uppercase text-muted-foreground">Diagnosis:</span>
                          <p className="mt-0.5">{cons.diagnosis}</p>
                        </div>
                        <div>
                          <span className="font-medium text-xs uppercase text-muted-foreground">Symptoms:</span>
                          <p className="mt-0.5">{cons.symptoms}</p>
                        </div>
                        <div>
                          <span className="font-medium text-xs uppercase text-muted-foreground">Observations:</span>
                          <p className="mt-0.5">{cons.observations}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-xs uppercase text-muted-foreground">Treatment & Medications:</span>
                          <p className="mt-0.5">{cons.treatmentPlan}</p>
                          {cons.medications && <p className="mt-1 text-muted-foreground italic">Rx: {cons.medications}</p>}
                        </div>
                        {cons.followUpInstructions && (
                          <div className="col-span-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                            <span className="font-medium text-xs uppercase text-amber-700 dark:text-amber-400">Follow-up Instructions:</span>
                            <p className="mt-0.5 text-amber-900 dark:text-amber-200">{cons.followUpInstructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-sm text-muted-foreground py-2 text-center">No consultations recorded.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── OUTCOMES TAB ───────────────────────────────────────────────────── */}
        <TabsContent value="outcomes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Clinical Outcomes
              </CardTitle>
              <Dialog open={isOutcomeDialogOpen} onOpenChange={(o) => { setIsOutcomeDialogOpen(o); if (!o) { setOutcomeMetricId(""); setOutcomeBaseline(""); setOutcomeCurrent(""); setOutcomeTarget(""); setOutcomeProgramId(""); setOutcomeNotes(""); } }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    <Plus className="w-4 h-4 mr-1" /> Record Outcome
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Record Clinical Outcome</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Outcome Metric <span className="text-destructive">*</span></Label>
                      <Select value={outcomeMetricId} onValueChange={setOutcomeMetricId}>
                        <SelectTrigger><SelectValue placeholder="Select metric..." /></SelectTrigger>
                        <SelectContent>
                          {(outcomeMetricsData?.data ?? []).map((m: any) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({m.unit}) — {m.category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Program <span className="text-destructive">*</span></Label>
                      <Select value={outcomeProgramId} onValueChange={setOutcomeProgramId}>
                        <SelectTrigger><SelectValue placeholder="Select program..." /></SelectTrigger>
                        <SelectContent>
                          {(programsData?.data ?? []).map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="grid gap-2">
                        <Label>Baseline Value <span className="text-destructive">*</span></Label>
                        <input type="number" value={outcomeBaseline} onChange={e => setOutcomeBaseline(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="0" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Current Value <span className="text-destructive">*</span></Label>
                        <input type="number" value={outcomeCurrent} onChange={e => setOutcomeCurrent(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="0" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Target Value <span className="text-destructive">*</span></Label>
                        <input type="number" value={outcomeTarget} onChange={e => setOutcomeTarget(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="0" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Notes</Label>
                      <Textarea value={outcomeNotes} onChange={e => setOutcomeNotes(e.target.value)} placeholder="Clinical notes..." rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOutcomeDialogOpen(false)}>Cancel</Button>
                    <Button
                      onClick={async () => {
                        if (!outcomeMetricId || !outcomeProgramId || !outcomeBaseline || !outcomeCurrent || !outcomeTarget) {
                          toast({ variant: "destructive", title: "All required fields must be filled" }); return;
                        }
                        try {
                          await createOutcome.mutateAsync({ data: {
                            patientId: id,
                            programId: outcomeProgramId,
                            outcomeMetricId,
                            baselineValue: parseFloat(outcomeBaseline),
                            currentValue: parseFloat(outcomeCurrent),
                            targetValue: parseFloat(outcomeTarget),
                            notes: outcomeNotes || undefined,
                          }});
                          queryClient.invalidateQueries({ queryKey: outcomesKey });
                          setIsOutcomeDialogOpen(false);
                          toast({ title: "Outcome recorded successfully" });
                        } catch (err: any) {
                          toast({ variant: "destructive", title: "Failed to record outcome", description: err.message });
                        }
                      }}
                      disabled={createOutcome.isPending || !outcomeMetricId || !outcomeProgramId || !outcomeBaseline || !outcomeCurrent || !outcomeTarget}
                    >
                      {createOutcome.isPending ? "Recording..." : "Record Outcome"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isOutcomesLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
              ) : !outcomesData?.data?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <TrendingUp className="w-10 h-10 mb-3 opacity-20" />
                  <p className="font-medium text-sm">No outcomes recorded yet</p>
                  <p className="text-xs mt-1">Record clinical outcomes to track patient progress</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {outcomesData.data.map((outcome: any) => {
                    const pct = outcome.progressPct ?? 0;
                    const improved = (outcome.currentValue ?? 0) >= (outcome.baselineValue ?? 0);
                    const metricName = outcome.outcomeMetric?.name ?? "Outcome";
                    const unit = outcome.unit ?? outcome.outcomeMetric?.unit ?? "";
                    const category = outcome.outcomeMetric?.category ?? "";
                    return (
                      <div key={outcome.id} className="border border-border rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{metricName}</span>
                              {category && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{category}</span>}
                              {outcome.targetAchieved && (
                                <span className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Target Achieved
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Recorded {outcome.measuredAt ? format(new Date(outcome.measuredAt), 'MMM d, yyyy') : format(new Date(outcome.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground">
                              {outcome.currentValue} {unit}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {improved ? '↑' : '↓'} {Math.abs(outcome.improvementPct ?? 0).toFixed(1)}% vs baseline
                            </div>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Baseline: {outcome.baselineValue} {unit}</span>
                            <span>Target: {outcome.targetValue} {unit}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, pct)}%`,
                                background: pct >= 100 ? '#10b981' : pct >= 50 ? '#3b82f6' : '#f59e0b'
                              }}
                            />
                          </div>
                          <div className="text-right text-xs text-muted-foreground">{pct}% to target</div>
                        </div>
                        {outcome.notes && (
                          <p className="text-xs text-muted-foreground border-t border-border pt-2">{outcome.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FILES TAB ────────────────────────────────────────────────────── */}
        <TabsContent value="files">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-4 h-4" /> Files & Documents</CardTitle>
              <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8"><Upload className="w-4 h-4 mr-1" /> Upload</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Upload File</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Select File</Label>
                      <input type="file" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsFileDialogOpen(false); setSelectedFile(null); }}>Cancel</Button>
                    <Button onClick={handleUploadFile} disabled={!selectedFile || uploadFile.isPending}>{uploadFile.isPending ? "Uploading..." : "Upload"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isFileLoading ? <Skeleton className="h-10 w-full" /> : fileList?.data?.length ? (
                <div className="space-y-3">
                  {fileList.data.map((file) => (
                    <div key={file.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none">{file.fileKey}</span>
                          <span className="text-xs text-muted-foreground mt-1">{format(new Date(file.createdAt), 'MMM d, yyyy')} • {file.uploader?.firstName} {file.uploader?.lastName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Download className="w-4 h-4 text-muted-foreground" /></Button>
                        </a>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete File</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete {file.fileKey}? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
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
              ) : <div className="text-sm text-muted-foreground py-2 text-center">No files uploaded yet.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── COMMUNICATIONS TAB ────────────────────────────────────────────── */}
        <TabsContent value="communications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Communications</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant={commType === "SMS" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setCommType("SMS")}>SMS</Button>
                  <Button size="sm" variant={commType === "EMAIL" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setCommType("EMAIL")}>Email</Button>
                </div>
              </div>
              <Dialog open={isSmsDialogOpen} onOpenChange={setIsSmsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8"><Send className="w-4 h-4 mr-1" /> Send {commType}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Send {commType} to Patient</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    {commType === "EMAIL" && (
                      <div className="grid gap-2">
                        <Label>Subject</Label>
                        <input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Email subject..."
                          id="comm-subject"
                        />
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label>{commType === "EMAIL" ? "Body" : "Message"}</Label>
                      <Textarea value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} placeholder={commType === "SMS" ? "Type your SMS message..." : "Type your email body..."} rows={4} maxLength={commType === "SMS" ? 1600 : 5000} />
                      <p className="text-xs text-muted-foreground text-right">{smsMessage.length}/{commType === "SMS" ? 1600 : 5000}</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSmsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSendSms} disabled={!smsMessage.trim() || createCommunication.isPending}>Send</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isSmsLoading ? <Skeleton className="h-10 w-full" /> : smsHistory?.data?.length ? (
                <div className="space-y-3">
                  {smsHistory.data.map((comm) => (
                    <div key={comm.id} className="flex flex-col gap-1 py-2 border-b border-border last:border-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{comm.status}</Badge>
                        <span className="text-xs text-muted-foreground">{format(new Date(comm.createdAt), 'MMM d, yyyy HH:mm')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comm.body}</p>
                    </div>
                  ))}
                </div>
              ) : <div className="text-sm text-muted-foreground py-2 text-center">No messages sent yet.</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
