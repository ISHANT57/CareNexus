import { useParams, Link } from "wouter";
import {
  useGetPatient, getGetPatientQueryKey,
  useUpdatePatientStatus,
  useGetPatientRiskScore, getGetPatientRiskScoreQueryKey,
  useGetPatientJourney, useCreatePatientJourney, getGetPatientJourneyQueryKey,
  useListAssignments, useCreateAssignment, useDeleteAssignment, getListAssignmentsQueryKey,
  useListUsers,
  useCreateCommunication, useListCommunications, getListCommunicationsQueryKey,
  useUploadFile, useListFiles, useDeleteFile, getListFilesQueryKey,
  useListProgramEnrollments, useCreateProgramEnrollment, useCompleteProgramEnrollment, useCancelProgramEnrollment, getListProgramEnrollmentsQueryKey,
  useListPrograms,
  useListAppointments, useCreateAppointment, useCancelAppointment, useCompleteAppointment, useUpdateAppointment, getListAppointmentsQueryKey,
  useListConsultations, useCreateConsultation, useUpdateConsultation, useDeleteConsultation, getListConsultationsQueryKey,
  useListOutcomes, useCreateOutcome, getListOutcomesQueryKey,
  useListOutcomeMetrics,
  useListTasks, useCreateTask, useCompleteTask, useUpdateTask, useDeleteTask, getListTasksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MapPin, Phone, Mail, Calendar, Building2, Activity, ArrowLeft, ChevronDown, Plus, Trash2, UserPlus, MessageSquare, Send, Upload, FileText, Download, CheckCircle, XCircle, Pencil, ClipboardList, Clock, TrendingUp, AlertCircle, Stethoscope, Pill, LogOut, PlayCircle, StopCircle, UserCheck, CalendarCheck, FileEdit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAreaClinicCascade } from "@/hooks/use-area-clinic-cascade";
import { cn } from "@/lib/utils";

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
        <Textarea className="min-h-[80px]" value={form.chiefComplaint} onChange={e => setForm({ ...form, chiefComplaint: e.target.value })} placeholder="Main reason for visit..." />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Symptoms</label>
        <Textarea className="min-h-[80px]" value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} placeholder="Patient reported symptoms..." />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Observations</label>
        <Textarea className="min-h-[80px]" value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Clinical observations..." />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Diagnosis</label>
        <Textarea className="min-h-[80px]" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="Primary and secondary diagnosis..." />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Treatment Plan</label>
        <Textarea className="min-h-[80px]" value={form.treatmentPlan} onChange={e => setForm({ ...form, treatmentPlan: e.target.value })} placeholder="Recommended treatments..." />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Medications</label>
        <Textarea className="min-h-[80px]" value={form.medications} onChange={e => setForm({ ...form, medications: e.target.value })} placeholder="Prescribed medications..." />
      </div>
    </div>
    <div className="grid gap-2">
      <label className="text-sm font-medium">Follow-up Instructions</label>
      <Textarea className="min-h-[80px]" value={form.followUpInstructions} onChange={e => setForm({ ...form, followUpInstructions: e.target.value })} placeholder="Instructions for patient..." />
    </div>
  </div>
);

const getJourneyEventConfig = (status: string) => {
  switch (status) {
    case "REGISTERED":
    case "NEW":
      return { icon: <UserPlus className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", label: "Registered" };
    case "ONBOARDED":
      return { icon: <UserCheck className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Onboarded" };
    case "APPOINTMENT_COMPLETED":
      return { icon: <CalendarCheck className="w-4 h-4" />, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20", label: "Appointment" };
    case "CONSULTATION_COMPLETED":
      return { icon: <Stethoscope className="w-4 h-4" />, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20", label: "Consultation" };
    case "MEDICATION_REQUIRED":
      return { icon: <Pill className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", label: "Medication" };
    case "DISCHARGE":
      return { icon: <LogOut className="w-4 h-4" />, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20", label: "Discharged" };
    case "ENROLLED":
      return { icon: <PlayCircle className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", label: "Enrolled" };
    case "UNENROLLED":
      return { icon: <StopCircle className="w-4 h-4" />, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", label: "Unenrolled" };
    case "PSI":
      return { icon: <FileEdit className="w-4 h-4" />, color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20", label: "PSI Logged" };
    default:
      return { icon: <Activity className="w-4 h-4" />, color: "text-primary", bg: "bg-primary/10 border-primary/20", label: status };
  }
};

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
  const {
    areaId: appointmentAreaId,
    clinicId: appointmentClinicId,
    setAreaId: setAppointmentAreaId,
    setClinicId: setAppointmentClinicId,
    areas: appointmentAreas,
    clinics: appointmentClinics,
    areasLoading: appointmentAreasLoading,
    clinicsLoading: appointmentClinicsLoading,
  } = useAreaClinicCascade();
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

  const [filterConsDoctor, setFilterConsDoctor] = useState("");
  const [filterConsDate, setFilterConsDate] = useState("");

  // ── Outcomes ───────────────────────────────────────────────────────────────────────
  const createOutcome = useCreateOutcome();
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false);
  const [outcomeMetricId, setOutcomeMetricId] = useState("");
  const [outcomeBaseline, setOutcomeBaseline] = useState("");
  const [outcomeCurrent, setOutcomeCurrent] = useState("");
  const [outcomeTarget, setOutcomeTarget] = useState("");
  const [outcomeProgramId, setOutcomeProgramId] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");

  // ── Tasks ──────────────────────────────────────────────────────────────────────────
  const createTask = useCreateTask();
  const completeTaskMutation = useCompleteTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDueTime, setTaskDueTime] = useState("");

  // ── Communications ───────────────────────────────────────────────────────────
  const [commType, setCommType] = useState<"SMS" | "EMAIL">("SMS");

  // ── Queries ───────────────────────────────────────────────────────────────────
  const { data: patient, isLoading } = useGetPatient(id, {
    query: { enabled: !isNew && !!id, queryKey: getGetPatientQueryKey(id) }
  });
  const { data: riskScore, isLoading: isRiskLoading } = useGetPatientRiskScore(id, {
    query: { enabled: !isNew && !!id, queryKey: getGetPatientRiskScoreQueryKey(id) }
  });
  const { data: journeyList, isLoading: isJourneyLoading } = useGetPatientJourney(id, {
    query: { enabled: !isNew && !!id, queryKey: getGetPatientJourneyQueryKey(id) }
  });
  const assignmentsKey = getListAssignmentsQueryKey({ patientId: id });
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useListAssignments(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: assignmentsKey } }
  );
  const { data: usersData } = useListUsers({ limit: 200 }, { query: { enabled: isAssignDialogOpen || isAppointmentDialogOpen || isTaskDialogOpen, queryKey: ["users-all"] } });
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
  const tasksKey = getListTasksQueryKey({ patientId: id });
  const { data: tasksData, isLoading: isTasksLoading } = useListTasks(
    { patientId: id },
    { query: { enabled: !isNew && !!id, queryKey: tasksKey } }
  );

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleStatusChange = async (newStatus: "ACTIVE" | "INACTIVE") => {
    try {
      await updatePatient.mutateAsync({ id, data: { status: newStatus } });
      queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey(id) });
      toast({ title: "Status updated", description: `Patient status changed to ${newStatus}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update failed", description: err.message });
    }
  };

  const filteredConsultations = (consultationsData?.data ?? []).filter((cons) => {
    if (filterConsDoctor && cons.doctorId !== filterConsDoctor) return false;
    if (filterConsDate && cons.consultationDate) {
      const consDate = format(new Date(cons.consultationDate), "yyyy-MM-dd");
      if (consDate !== filterConsDate) return false;
    }
    return true;
  });

  const consDoctorOptions = Array.from(new Set((consultationsData?.data ?? []).map(c => c.doctor?.id).filter(Boolean))).map(docId => {
    const doc = consultationsData?.data?.find(c => c.doctor?.id === docId)?.doctor;
    return { label: `Dr. ${doc?.firstName} ${doc?.lastName}`, value: docId! };
  });

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
      setAppointmentDoctorId(""); setAppointmentAreaId(""); setAppointmentClinicId(""); setAppointmentDate(""); setAppointmentTime("");
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

  const deleteConsultation = useDeleteConsultation();
  const handleDeleteConsultation = async (consultationId: string) => {
    try {
      await deleteConsultation.mutateAsync({ id: consultationId });
      queryClient.invalidateQueries({ queryKey: consultationsKey });
      toast({ title: "Consultation deleted" });
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

  const patientAge = patient.dob
    ? Math.max(0, Math.floor((Date.now() - new Date(patient.dob).getTime()) / 31557600000))
    : null;

  return (
    <div>
      {/* ── Patient record header ───────────────────────────────────────────── */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
          {/* Back nav */}
          <Link href="/patients">
            <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Patients
            </button>
          </Link>

          {/* Patient identity row */}
          <div className="flex items-start justify-between gap-6 pb-5">
            <div className="flex items-start gap-4">
              {/* Initials avatar */}
              <div
                className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-xl font-bold text-white shadow-md"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
              >
                {((patient.firstName?.[0] ?? "") + (patient.lastName?.[0] ?? "")).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {patient.title ? `${patient.title} ` : ""}{patient.firstName} {patient.lastName}
                  </h1>
                  {!isRiskLoading && riskScore ? (
                    <Badge variant="outline" className={cn(
                      "text-[11px] font-semibold uppercase",
                      riskScore.riskLevel === "CRITICAL" || riskScore.riskLevel === "HIGH"
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30"
                        : riskScore.riskLevel === "MEDIUM"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                    )}>
                      {riskScore.riskLevel || "LOW"} RISK
                    </Badge>
                  ) : null}
                </div>

                {/* Demographics chips */}
                <div className="flex items-center gap-2.5 mt-2 flex-wrap text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {patient.nhsNumber || "No NHS number"}
                  </span>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {patientAge != null ? `${patientAge} yrs` : "—"} · {patient.gender || "Unknown"}
                  </span>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    DOB: {patient.dob ? format(new Date(patient.dob), "d MMM yyyy") : "Unknown"}
                  </span>
                  {patient.program?.name && (
                    <>
                      <span className="text-border">·</span>
                      <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                        <Activity className="w-3.5 h-3.5" />
                        {patient.program.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Status + Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" disabled={updatePatient.isPending}>
                    <div className={cn("w-2 h-2 rounded-full", patient.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400")} />
                    {patient.status}
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>Set to ACTIVE</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("INACTIVE")}>Set to INACTIVE</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-2">
                    Actions <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setIsAppointmentDialogOpen(true)}>
                    <Calendar className="w-4 h-4 mr-2" /> New Appointment
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsConsultationDialogOpen(true)}>
                    <ClipboardList className="w-4 h-4 mr-2" /> Record Consultation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsJourneyDialogOpen(true)}>
                    <Activity className="w-4 h-4 mr-2" /> Log Journey Event
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSmsDialogOpen(true)}>
                    <MessageSquare className="w-4 h-4 mr-2" /> Send Message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* ── Stats bar ────────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-t border-border">
          {[
            { label: "Risk Score", value: riskScore?.riskScore ?? 0, sub: riskScore?.riskLevel ?? "Not scored", icon: AlertCircle, chipCls: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400" },
            { label: "Active Programs", value: (enrollments?.data ?? []).filter((e: any) => e.status === "ACTIVE").length, sub: `${enrollments?.data?.length ?? 0} total`, icon: Activity, chipCls: "bg-primary/10 text-primary" },
            { label: "Appointments", value: appointmentsData?.data?.length ?? 0, sub: `${(appointmentsData?.data ?? []).filter((a: any) => a.status === "SCHEDULED").length} upcoming`, icon: Calendar, chipCls: "bg-primary/10 text-primary" },
            { label: "Consultations", value: consultationsData?.data?.length ?? 0, sub: "On record", icon: Stethoscope, chipCls: "bg-primary/10 text-primary" },
          ].map((m) => (
            <div key={m.label} className="px-5 py-3.5 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", m.chipCls)}>
                <m.icon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold leading-none tabular-nums">{m.value}</div>
                <div className="text-xs font-medium text-foreground mt-0.5">{m.label}</div>
                <div className="text-[11px] text-muted-foreground truncate">{m.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Record Consultation Dialog ─────────────────────────────────────────── */}
      <Dialog open={isConsultationDialogOpen} onOpenChange={(open) => { setIsConsultationDialogOpen(open); if (!open) { setSelectedAppointmentId(""); setConsultationForm(emptyConsultationForm); } }}>
        <DialogContent aria-describedby={undefined} className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent aria-describedby={undefined} className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
      <Dialog open={isEditApptDialogOpen} onOpenChange={(open) => { setIsEditApptDialogOpen(open); if (!open) { setEditApptDate(""); setEditApptTime(""); setEditApptDuration(30); setEditApptNotes(""); } }}>
        <DialogContent aria-describedby={undefined}>
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
      <div className="page-container animate-in-up pt-6 pb-12">
      <Tabs defaultValue="overview" className="flex flex-col md:flex-row gap-6 lg:gap-10 items-start">
        <div className="w-full md:w-56 shrink-0 md:sticky md:top-6 flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 px-2">Clinical Record</div>
          <TabsList className="flex flex-row md:flex-col justify-start bg-transparent gap-0.5 w-full h-auto p-0 rounded-none overflow-x-auto md:overflow-visible">
            <TabsTrigger value="overview" className="justify-start px-3 py-2 w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg text-left text-sm gap-2"><User className="w-4 h-4 shrink-0" />Overview</TabsTrigger>
            <TabsTrigger value="journey" className="justify-start px-3 py-2 w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg text-left text-sm gap-2"><Activity className="w-4 h-4 shrink-0" />Journey</TabsTrigger>
            <TabsTrigger value="appointments" className="justify-start px-3 py-2 w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg text-left text-sm gap-2"><Calendar className="w-4 h-4 shrink-0" />Appointments</TabsTrigger>
            <TabsTrigger value="consultations" className="justify-start px-3 py-2 w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg text-left text-sm gap-2"><ClipboardList className="w-4 h-4 shrink-0" />Consultations</TabsTrigger>
            <TabsTrigger value="outcomes" className="justify-start px-3 py-2 w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg text-left text-sm gap-2"><Activity className="w-4 h-4 shrink-0" />Outcomes</TabsTrigger>
            <TabsTrigger value="tasks" className="justify-start px-3 py-2 w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg text-left text-sm gap-2"><ClipboardList className="w-4 h-4 shrink-0" />Tasks</TabsTrigger>
            <TabsTrigger value="files" className="justify-start px-3 py-2 w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg text-left text-sm gap-2"><FileText className="w-4 h-4 shrink-0" />Files</TabsTrigger>
            <TabsTrigger value="communications" className="justify-start px-3 py-2 w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg text-left text-sm gap-2"><MessageSquare className="w-4 h-4 shrink-0" />Communications</TabsTrigger>
          </TabsList>
          <div className="border-t border-border pt-3 mt-1">
            <button className="inline-flex items-center gap-2 px-3 py-2 w-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
              <Download className="w-4 h-4 shrink-0" />
              Export Patient Record
            </button>
          </div>
        </div>
        <div className="flex-1 min-w-0 w-full">

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6 animate-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card">
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

              <Card className="glass-card">
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

              {/* Risk Profile */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      Risk Profile
                    </CardTitle>
                    {isRiskLoading ? (
                      <Skeleton className="h-6 w-16" />
                    ) : riskScore ? (
                      <Badge variant={riskScore.riskLevel === 'HIGH' || riskScore.riskLevel === 'CRITICAL' ? 'destructive' : riskScore.riskLevel === 'MEDIUM' ? 'default' : 'secondary'} className="uppercase">
                        {riskScore.riskLevel || "UNKNOWN"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Scored</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isRiskLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : riskScore ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 pt-2">
                        <div className="text-4xl font-bold tracking-tight text-primary">{riskScore.riskScore ?? "N/A"}</div>
                        <div className="text-sm text-muted-foreground leading-tight">Total<br />Risk Score</div>
                      </div>
                      {riskScore.factors && riskScore.factors.length > 0 && (
                        <div className="space-y-2 mt-4 pt-4 border-t border-border">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contributing Factors</h4>
                          {riskScore.factors.map((f: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50 border border-border/50">
                              <span className="flex items-center gap-2 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                {f.reason}
                              </span>
                              <span className="font-bold text-destructive">+{f.scoreContribution}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-2 text-center bg-muted/30 rounded-lg p-4 border border-dashed border-border mt-2">
                      <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      No risk score calculated for this patient yet.<br/>Scores are updated nightly based on outcomes.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Program Enrollments */}
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Program Enrollments</CardTitle>
                  <Dialog open={isEnrollDialogOpen} onOpenChange={(open) => { setIsEnrollDialogOpen(open); if (!open) { setEnrollProgramId(""); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8"><Plus className="w-4 h-4 mr-1" /> Enroll</Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined}>
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

            {/* Right sidebar */}
            <div className="space-y-5">

              {/* Care Team card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">Care Team</CardTitle>
                  <Dialog open={isAssignDialogOpen} onOpenChange={(open) => { setIsAssignDialogOpen(open); if (!open) { setSelectedDoctorId(""); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7 text-xs"><UserPlus className="w-3.5 h-3.5 mr-1" /> Assign</Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined}>
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
                <CardContent className="pt-0">
                  {isAssignmentsLoading ? <Skeleton className="h-14 w-full" /> : assignmentsData?.data?.length ? (
                    <div className="space-y-3">
                      {assignmentsData.data.map((assignment) => {
                        const initials = ((assignment.doctor?.firstName?.[0] ?? "") + (assignment.doctor?.lastName?.[0] ?? "")).toUpperCase();
                        return (
                          <div key={assignment.id} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: "linear-gradient(135deg, #0b63f6 0%, #4f46e5 100%)" }}
                              >
                                {initials || <User className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{assignment.doctor?.firstName} {assignment.doctor?.lastName}</div>
                                <div className="text-xs text-muted-foreground truncate">{assignment.doctor?.role?.name ?? "Doctor"}{assignment.clinic?.name ? ` · ${assignment.clinic.name}` : ""}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setIsSmsDialogOpen(true)}>
                                <MessageSquare className="w-3.5 h-3.5" />
                              </Button>
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
                          </div>
                        );
                      })}
                    </div>
                  ) : <div className="text-sm text-muted-foreground py-3 text-center">No care team members assigned.</div>}
                </CardContent>
              </Card>

              {/* Patient Summary card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Patient Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2.5">
                  {[
                    { label: "Age", value: patientAge != null ? `${patientAge} years` : "—" },
                    { label: "Gender", value: patient.gender || "—" },
                    { label: "Blood Group", value: (patient as any).bloodGroup || "—" },
                    { label: "Marital Status", value: (patient as any).maritalStatus || "—" },
                    { label: "Language", value: (patient as any).preferredLanguage || "English" },
                    { label: "Emergency Contact", value: (patient as any).emergencyContactName || "—" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground shrink-0">{row.label}</span>
                      <span className="font-medium text-right truncate">{row.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                  <Link href="/audit-logs">
                    <span className="text-xs text-primary hover:underline cursor-pointer">View all</span>
                  </Link>
                </CardHeader>
                <CardContent className="pt-0">
                  {isJourneyLoading ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
                  ) : journeyList?.data?.length ? (
                    <div className="space-y-3">
                      {journeyList.data.slice(0, 4).map((event) => {
                        const cfg = getJourneyEventConfig(event.status);
                        return (
                          <div key={event.id} className="flex items-start gap-2.5">
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px]", cfg.bg, cfg.color)}>
                              {cfg.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold">{cfg.label}</div>
                              {event.notes && <div className="text-[11px] text-muted-foreground truncate">{event.notes}</div>}
                              <div className="text-[11px] text-muted-foreground/70 mt-0.5">{format(new Date(event.createdAt), "d MMM yyyy")}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-2 text-center">No activity yet.</div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </TabsContent>

        {/* ── JOURNEY TAB ──────────────────────────────────────────────────── */}
        <TabsContent value="journey" className="animate-in-up">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Patient Journey</CardTitle>
              <Dialog open={isJourneyDialogOpen} onOpenChange={(open) => { setIsJourneyDialogOpen(open); if (!open) { setJourneyStatus("NEW"); setJourneyNotes(""); } }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8"><Plus className="w-4 h-4 mr-1" /> Record Event</Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined}>
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
                <div className="relative border-l-2 border-border/60 ml-4 pl-6 space-y-8">
                  {journeyList.data.map((event) => {
                    const cfg = getJourneyEventConfig(event.status);
                    return (
                      <div key={event.id} className="relative group">
                        <div className={`absolute -left-[35px] top-1 flex h-6 w-6 items-center justify-center rounded-full border ${cfg.bg} ${cfg.color} ring-4 ring-background transition-transform group-hover:scale-110`}>
                          {cfg.icon}
                        </div>
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-border/50 bg-card/50 shadow-sm transition-colors hover:bg-muted/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs font-semibold border-transparent ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(event.createdAt), 'MMM d, yyyy • h:mm a')}
                            </span>
                          </div>
                          {event.notes && <p className="text-sm text-foreground/90 mt-1 leading-relaxed">{event.notes}</p>}
                          {event.actedByUser && (
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                              <User className="w-3.5 h-3.5" />
                              <span>Recorded by Dr. {event.actedByUser.lastName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="text-sm text-muted-foreground py-4 text-center">No journey events recorded</div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── APPOINTMENTS TAB ──────────────────────────────────────────────── */}
        <TabsContent value="appointments" className="animate-in-up">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><Calendar className="w-4 h-4" /> Appointments</CardTitle>
              <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8"><Plus className="w-4 h-4 mr-1" /> Schedule</Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined}>
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
                      <Label>Area</Label>
                      <Select value={appointmentAreaId} onValueChange={setAppointmentAreaId}>
                        <SelectTrigger>
                          {appointmentAreasLoading ? <span className="text-muted-foreground">Loading...</span> : <SelectValue placeholder="Select area..." />}
                        </SelectTrigger>
                        <SelectContent>
                          {appointmentAreas.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Clinic</Label>
                      <Select value={appointmentClinicId} onValueChange={setAppointmentClinicId} disabled={!appointmentAreaId || appointmentClinicsLoading}>
                        <SelectTrigger>
                          {appointmentClinicsLoading ? <span className="text-muted-foreground">Loading...</span> : !appointmentAreaId ? <span className="text-muted-foreground">Select area first</span> : <SelectValue placeholder="Select clinic..." />}
                        </SelectTrigger>
                        <SelectContent>
                          {appointmentClinics.length === 0 && appointmentAreaId && !appointmentClinicsLoading ? (
                            <div className="py-2 text-center text-sm text-muted-foreground">No clinics in this area</div>
                          ) : (
                            appointmentClinics.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))
                          )}
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
        <TabsContent value="consultations" className="animate-in-up">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Consultation History</CardTitle>
              <div className="flex gap-2">
                <Select value={filterConsDoctor} onValueChange={setFilterConsDoctor}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Doctors</SelectItem>
                    {consDoctorOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <input 
                  type="date" 
                  value={filterConsDate} 
                  onChange={e => setFilterConsDate(e.target.value)} 
                  className="flex h-8 rounded-md border border-input bg-background px-2 text-xs w-32"
                />
                <Button size="sm" variant="outline" className="h-8" onClick={() => openRecordConsultation()}>
                  <Plus className="w-4 h-4 mr-1" /> Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isConsultationsLoading ? <Skeleton className="h-10 w-full" /> : filteredConsultations.length ? (
                <div className="space-y-4">
                  {filteredConsultations.map(cons => (
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
                        {/* MED-004: Edit + Delete consultation actions */}
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-primary" onClick={() => openEditConsultation(cons)}>
                            <Pencil className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete consultation?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the consultation recorded on {cons.consultationDate ? format(new Date(cons.consultationDate), "MMMM d, yyyy") : "this date"}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => cons.id && handleDeleteConsultation(cons.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
        <TabsContent value="outcomes" className="animate-in-up">
          <Card className="glass-card">
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
                <DialogContent aria-describedby={undefined} className="max-w-lg">
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

        {/* ── TASKS TAB ──────────────────────────────────────────────────────── */}
        <TabsContent value="tasks" className="animate-in-up">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Care Tasks
              </CardTitle>
              <Dialog open={isTaskDialogOpen} onOpenChange={(o) => { setIsTaskDialogOpen(o); if (!o) { setTaskTitle(""); setTaskDescription(""); setTaskPriority("MEDIUM"); setTaskAssignedTo(""); setTaskDueDate(""); setTaskDueTime(""); } }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    <Plus className="w-4 h-4 mr-1" /> Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="max-w-lg">
                  <DialogHeader><DialogTitle>Add Care Task</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Task Title <span className="text-destructive">*</span></Label>
                      <Input value={taskTitle} onChange={(e: any) => setTaskTitle(e.target.value)} placeholder="e.g. Schedule blood test..." />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea value={taskDescription} onChange={(e: any) => setTaskDescription(e.target.value)} placeholder="Provide task details..." rows={3} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Assignee <span className="text-destructive">*</span></Label>
                      <Select value={taskAssignedTo} onValueChange={setTaskAssignedTo}>
                        <SelectTrigger><SelectValue placeholder="Select team member..." /></SelectTrigger>
                        <SelectContent>
                          {(usersData?.data ?? []).map((u: any) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.firstName} {u.lastName} — {u.role?.name ?? "Staff"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label>Priority</Label>
                        <Select value={taskPriority} onValueChange={(val: any) => setTaskPriority(val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                          <Label>Due Date <span className="text-destructive">*</span></Label>
                          <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Time <span className="text-destructive">*</span></Label>
                          <input type="time" value={taskDueTime} onChange={e => setTaskDueTime(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
                    <Button
                      onClick={async () => {
                        if (!taskTitle.trim() || !taskAssignedTo || !taskDueDate || !taskDueTime) {
                          toast({ variant: "destructive", title: "All required fields must be filled" }); return;
                        }
                        try {
                          const datetimeStr = `${taskDueDate}T${taskDueTime}:00Z`;
                          await createTask.mutateAsync({ data: {
                            patientId: id,
                            assignedTo: taskAssignedTo,
                            title: taskTitle.trim(),
                            description: taskDescription.trim() || undefined,
                            priority: taskPriority,
                            dueDate: datetimeStr,
                          }});
                          queryClient.invalidateQueries({ queryKey: tasksKey });
                          setIsTaskDialogOpen(false);
                          toast({ title: "Care task created successfully" });
                        } catch (err: any) {
                          toast({ variant: "destructive", title: "Failed to create task", description: err.message });
                        }
                      }}
                      disabled={createTask.isPending || !taskTitle.trim() || !taskAssignedTo || !taskDueDate || !taskDueTime}
                    >
                      {createTask.isPending ? "Creating..." : "Add Task"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isTasksLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
              ) : !tasksData?.data?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ClipboardList className="w-10 h-10 mb-3 opacity-20" />
                  <p className="font-medium text-sm">No tasks assigned yet</p>
                  <p className="text-xs mt-1">Create a care task to coordinate patient support</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasksData.data.map((task: any) => {
                    const isTaskOverdue = task.isOverdue || (task.status !== "COMPLETED" && new Date(task.dueDate) < new Date());
                    const priorityConfig = {
                      LOW: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
                      MEDIUM: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
                      HIGH: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
                      CRITICAL: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50",
                    }[task.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"] || "bg-muted text-muted-foreground";

                    const statusConfig = {
                      PENDING: { label: "Pending", class: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
                      IN_PROGRESS: { label: "In Progress", class: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900" },
                      COMPLETED: { label: "Completed", class: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900" },
                      OVERDUE: { label: "Overdue", class: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900" },
                    }[task.status as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE"] || { label: task.status, class: "bg-muted text-muted-foreground" };

                    return (
                      <div key={task.id} className={cn("border border-border rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 transition-all", task.status === "COMPLETED" && "opacity-75 bg-muted/20")}>
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("font-semibold text-sm", task.status === "COMPLETED" && "line-through text-muted-foreground")}>{task.title}</span>
                            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-full border-transparent", priorityConfig)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-full", statusConfig.class)}>
                              {isTaskOverdue && task.status !== "COMPLETED" ? "OVERDUE" : statusConfig.label}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className={cn("text-xs text-muted-foreground leading-relaxed", task.status === "COMPLETED" && "line-through")}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
                            {task.assignee && (
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                Assigned to {task.assignee.firstName} {task.assignee.lastName}
                              </span>
                            )}
                            <span className={cn("flex items-center gap-1", isTaskOverdue && task.status !== "COMPLETED" && "text-destructive font-semibold")}>
                              <Clock className="w-3.5 h-3.5" />
                              Due: {format(new Date(task.dueDate), 'MMM d, yyyy • h:mm a')}
                            </span>
                            {task.completedAt && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                Completed: {format(new Date(task.completedAt), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-center">
                          {task.status !== "COMPLETED" && (
                            <>
                              {task.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/30"
                                  onClick={async () => {
                                    try {
                                      await updateTaskMutation.mutateAsync({ id: task.id, data: { status: "IN_PROGRESS" } });
                                      queryClient.invalidateQueries({ queryKey: tasksKey });
                                      toast({ title: "Task started" });
                                    } catch (err: any) {
                                      toast({ variant: "destructive", title: "Action failed", description: err.message });
                                    }
                                  }}
                                  disabled={updateTaskMutation.isPending}
                                >
                                  <PlayCircle className="w-4 h-4 mr-1" /> Start
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/30"
                                onClick={async () => {
                                  try {
                                    await completeTaskMutation.mutateAsync({ id: task.id });
                                    queryClient.invalidateQueries({ queryKey: tasksKey });
                                    toast({ title: "Task completed" });
                                  } catch (err: any) {
                                    toast({ variant: "destructive", title: "Action failed", description: err.message });
                                  }
                                }}
                                disabled={completeTaskMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" /> Complete
                              </Button>
                            </>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this care task? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                  onClick={async () => {
                                    try {
                                      await deleteTaskMutation.mutateAsync({ id: task.id });
                                      queryClient.invalidateQueries({ queryKey: tasksKey });
                                      toast({ title: "Task deleted successfully" });
                                    } catch (err: any) {
                                      toast({ variant: "destructive", title: "Failed to delete task", description: err.message });
                                    }
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FILES TAB ────────────────────────────────────────────────────── */}
        <TabsContent value="files" className="animate-in-up">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-4 h-4" /> Files & Documents</CardTitle>
              <Dialog open={isFileDialogOpen} onOpenChange={(open) => { setIsFileDialogOpen(open); if (!open) { setSelectedFile(null); } }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8"><Upload className="w-4 h-4 mr-1" /> Upload</Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined}>
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
        <TabsContent value="communications" className="animate-in-up">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Communications</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant={commType === "SMS" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setCommType("SMS")}>SMS</Button>
                  <Button size="sm" variant={commType === "EMAIL" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setCommType("EMAIL")}>Email</Button>
                </div>
              </div>
              <Dialog open={isSmsDialogOpen} onOpenChange={(open) => { setIsSmsDialogOpen(open); if (!open) { setSmsMessage(""); } }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8"><Send className="w-4 h-4 mr-1" /> Send {commType}</Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined}>
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
        </div>
      </Tabs>
      </div>
    </div>
  );
}
