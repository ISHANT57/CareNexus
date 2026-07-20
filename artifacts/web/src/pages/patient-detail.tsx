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
import { User, MapPin, Phone, Mail, Calendar, Building2, Activity, ArrowLeft, ChevronDown, Plus, Trash2, UserPlus, MessageSquare, Send, Upload, FileText, Download, CheckCircle, XCircle, Pencil, ClipboardList, Clock, TrendingUp, TrendingDown, AlertCircle, Stethoscope, Pill, LogOut, PlayCircle, StopCircle, UserCheck, CalendarCheck, FileEdit } from "lucide-react";
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

const getJourneyEventConfig = (status: string) => {
  switch (status) {
    case "REGISTERED":
    case "NEW":
      return { icon: <UserPlus className="w-4 h-4" />, color: "text-primary", bg: "bg-primary/10 border-primary/20", label: "Registered" };
    case "ONBOARDED":
      return { icon: <UserCheck className="w-4 h-4" />, color: "text-success", bg: "bg-success/10 border-success/20", label: "Onboarded" };
    case "APPOINTMENT_COMPLETED":
      return { icon: <CalendarCheck className="w-4 h-4" />, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20", label: "Appointment" };
    case "CONSULTATION_COMPLETED":
      return { icon: <Stethoscope className="w-4 h-4" />, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20", label: "Consultation" };
    case "MEDICATION_REQUIRED":
      return { icon: <Pill className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", label: "Medication" };
    case "DISCHARGE":
      return { icon: <LogOut className="w-4 h-4" />, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20", label: "Discharged" };
    case "ENROLLED":
      return { icon: <PlayCircle className="w-4 h-4" />, color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/20", label: "Enrolled" };
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
  const deleteConsultation = useDeleteConsultation();
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

  const handleDeleteConsultation = async (id: string) => {
    try {
      await deleteConsultation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: consultationsKey });
      toast({ title: "Success", description: "Consultation note deleted." });
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
    <div className="page-container animate-in-up">
      {/* ── Patient Header (Premium Redesign) ──────────────────────────────────── */}
      <div className="relative mb-8 pt-2">
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="absolute -top-10 -left-4 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-end gap-6 bg-card/40 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-sm glass-card">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                <span className="text-3xl font-bold text-primary">
                  {patient.firstName?.[0]}{patient.lastName?.[0]}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 border border-border/50 shadow-sm">
                <Badge variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'} className="w-3 h-3 p-0 rounded-full flex items-center justify-center shadow-none border-none">
                  <span className="sr-only">{patient.status}</span>
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {patient.title ? `${patient.title} ` : ''}{patient.firstName} {patient.lastName}
                </h1>
                {isRiskLoading ? (
                  <Skeleton className="h-6 w-16 rounded-full" />
                ) : riskScore ? (
                  <Badge variant={riskScore.riskLevel === 'HIGH' || riskScore.riskLevel === 'CRITICAL' ? 'destructive' : riskScore.riskLevel === 'MEDIUM' ? 'default' : 'secondary'} className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-0.5 shadow-sm">
                    {riskScore.riskLevel || "UNKNOWN RISK"}
                  </Badge>
                ) : null}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs bg-muted/60 text-muted-foreground px-2 py-1 rounded-md border border-border/50 font-medium">
                  NHS: {patient.nhsNumber ?? "—"}
                </span>
                <span className="text-muted-foreground/60">•</span>
                <span className="text-sm font-medium text-muted-foreground">{patient.gender || 'Unknown gender'}</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  DOB: {patient.dob ? format(new Date(patient.dob), "dd MMM yyyy") : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-10 px-4 rounded-xl border-border/60 hover:bg-muted/50 transition-colors shadow-sm" disabled={updatePatient.isPending}>
                  <Badge variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'} className="pointer-events-none rounded-md px-1.5 py-0">
                    {patient.status}
                  </Badge>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => handleStatusChange('ACTIVE')} className="rounded-lg cursor-pointer">Set to ACTIVE</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('INACTIVE')} className="rounded-lg cursor-pointer">Set to INACTIVE</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 transition-all font-medium">
                  Quick Actions <ChevronDown className="w-4 h-4 ml-2 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuItem onClick={() => setIsAppointmentDialogOpen(true)} className="rounded-lg cursor-pointer py-2">
                  <Calendar className="w-4 h-4 mr-3 text-primary/70" /> Schedule Appointment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsConsultationDialogOpen(true)} className="rounded-lg cursor-pointer py-2">
                  <ClipboardList className="w-4 h-4 mr-3 text-primary/70" /> Record Consultation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsJourneyDialogOpen(true)} className="rounded-lg cursor-pointer py-2">
                  <Activity className="w-4 h-4 mr-3 text-primary/70" /> Log Journey Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSmsDialogOpen(true)} className="rounded-lg cursor-pointer py-2">
                  <MessageSquare className="w-4 h-4 mr-3 text-primary/70" /> Send Message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Record Consultation Dialog ─────────────────────────────────────────── */}
      <Dialog open={isConsultationDialogOpen} onOpenChange={setIsConsultationDialogOpen}>
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
      <Dialog open={isEditApptDialogOpen} onOpenChange={setIsEditApptDialogOpen}>
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
      <Tabs defaultValue="overview" className="flex flex-col md:flex-row gap-6 lg:gap-10 items-start">
        <div className="w-full md:w-64 shrink-0 md:sticky md:top-6">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4 px-4">Clinical Record</div>
          <TabsList className="flex flex-row md:flex-col justify-start bg-transparent space-y-2 w-full h-auto p-0 rounded-none overflow-x-auto md:overflow-visible scrollbar-none">
            <TabsTrigger value="overview" className="justify-start px-4 py-3 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-xl text-left font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <User className="w-4 h-4 mr-3" />Overview
            </TabsTrigger>
            <TabsTrigger value="journey" className="justify-start px-4 py-3 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-xl text-left font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <Activity className="w-4 h-4 mr-3" />Journey Timeline
            </TabsTrigger>
            <TabsTrigger value="appointments" className="justify-start px-4 py-3 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-xl text-left font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <Calendar className="w-4 h-4 mr-3" />Appointments
            </TabsTrigger>
            <TabsTrigger value="consultations" className="justify-start px-4 py-3 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-xl text-left font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <Stethoscope className="w-4 h-4 mr-3" />Consultations
            </TabsTrigger>
            <TabsTrigger value="outcomes" className="justify-start px-4 py-3 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-xl text-left font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <TrendingUp className="w-4 h-4 mr-3" />Clinical Outcomes
            </TabsTrigger>
            <TabsTrigger value="tasks" className="justify-start px-4 py-3 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-xl text-left font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <ClipboardList className="w-4 h-4 mr-3" />Care Tasks
            </TabsTrigger>
            <TabsTrigger value="files" className="justify-start px-4 py-3 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-xl text-left font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <FileText className="w-4 h-4 mr-3" />Documents
            </TabsTrigger>
            <TabsTrigger value="communications" className="justify-start px-4 py-3 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-xl text-left font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <MessageSquare className="w-4 h-4 mr-3" />Communications
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 min-w-0 w-full">

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6 animate-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card bg-gradient-to-br from-card/50 to-muted/20 border-border/50 hover:border-primary/20 transition-all shadow-sm">
                  <CardHeader className="pb-4"><CardTitle className="text-lg font-bold flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />Contact</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Mobile</div>
                        <div className="text-sm font-medium">{patient.mobile || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</div>
                        <div className="text-sm font-medium break-all">{patient.email || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Home Address</div>
                        <div className="text-sm font-medium leading-relaxed">
                          {[patient.address, patient.city, patient.postalCode, patient.country].filter(Boolean).join(', ') || '—'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-gradient-to-bl from-card/50 to-muted/20 border-border/50 hover:border-primary/20 transition-all shadow-sm">
                  <CardHeader className="pb-4"><CardTitle className="text-lg font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />Care Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Program</div>
                        <div className="text-sm font-medium">{patient.program?.name || 'Unassigned'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Clinic</div>
                        <div className="text-sm font-medium">{patient.clinic?.name || 'Unassigned'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registration Date</div>
                        <div className="text-sm font-medium">{format(new Date(patient.createdAt), 'MMMM d, yyyy')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Profile */}
              <Card className="glass-card border-border/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      Clinical Risk Profile
                    </CardTitle>
                    {isRiskLoading ? (
                      <Skeleton className="h-6 w-20 rounded-full" />
                    ) : riskScore ? (
                      <Badge variant={riskScore.riskLevel === 'HIGH' || riskScore.riskLevel === 'CRITICAL' ? 'destructive' : riskScore.riskLevel === 'MEDIUM' ? 'default' : 'secondary'} className="uppercase font-bold tracking-wider px-3 shadow-sm">
                        {riskScore.riskLevel || "UNKNOWN"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="font-semibold text-muted-foreground">Not Scored</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isRiskLoading ? (
                    <Skeleton className="h-24 w-full rounded-xl mt-4" />
                  ) : riskScore ? (
                    <div className="space-y-6 mt-4">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-[6px] border-primary/20 shadow-inner bg-card">
                          <span className="text-4xl font-black text-primary tracking-tighter">{riskScore.riskScore ?? "N/A"}</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold tracking-tight">Overall Risk Score</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">Calculated automatically based on demographic factors, clinical history, and recent outcome metrics.</p>
                        </div>
                      </div>
                      {riskScore.factors && riskScore.factors.length > 0 && (
                        <div className="space-y-3 pt-6 border-t border-border/50">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Contributing Factors</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {riskScore.factors.map((f: any, idx: number) => (
                              <div key={idx} className="flex items-start justify-between p-3 rounded-xl bg-card/50 border border-border/50 hover:border-border transition-colors">
                                <div className="flex items-start gap-3">
                                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                  <span className="text-sm font-medium text-foreground/90">{f.reason}</span>
                                </div>
                                <span className="font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md text-xs whitespace-nowrap">+{f.scoreContribution}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50 mt-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Activity className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <h4 className="text-base font-semibold text-foreground mb-1">No risk score available</h4>
                      <p className="text-sm text-muted-foreground max-w-sm">Risk scores are automatically calculated nightly based on new clinical data and outcomes.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Program Enrollments */}
              <Card className="glass-card border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 mb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Active Programs
                  </CardTitle>
                  <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 rounded-full px-4 border-primary/20 text-primary hover:bg-primary/5 font-semibold">
                        <Plus className="w-4 h-4 mr-1.5" /> Enroll Patient
                      </Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined} className="rounded-2xl">
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
                        <Button onClick={handleEnroll} disabled={!enrollProgramId || createEnrollment.isPending}>Enroll Patient</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {isEnrollmentsLoading ? <Skeleton className="h-32 w-full rounded-2xl" /> : enrollments?.data?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {enrollments.data.map((enrollment) => (
                        <div key={enrollment.id} className="group relative flex flex-col p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-primary" />
                              </div>
                              <h4 className="font-bold text-foreground">{enrollment.program?.name}</h4>
                            </div>
                            <Badge variant={enrollment.status === "ACTIVE" ? "default" : "secondary"} className="shadow-sm">{enrollment.status}</Badge>
                          </div>
                          
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground font-medium">Enrolled</span>
                              <span className="text-foreground font-medium">{format(new Date(enrollment.enrolledAt), 'MMM d, yyyy')}</span>
                            </div>
                            {enrollment.completedAt && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Ended</span>
                                <span className="text-foreground font-medium">{format(new Date(enrollment.completedAt), 'MMM d, yyyy')}</span>
                              </div>
                            )}
                          </div>
                          
                          {enrollment.status === "ACTIVE" && (
                            <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"><XCircle className="w-4 h-4 mr-2" /> Cancel</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                  <AlertDialogHeader><AlertDialogTitle>Cancel Enrollment</AlertDialogTitle><AlertDialogDescription>Are you sure you want to cancel the enrollment in {enrollment.program?.name}?</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleCancelEnrollment(enrollment.id)}>Yes, Cancel</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10"><CheckCircle className="w-4 h-4 mr-2" /> Complete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
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
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Activity className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <h4 className="text-base font-semibold text-foreground mb-1">No active programs</h4>
                      <p className="text-sm text-muted-foreground max-w-sm">Patient is not currently enrolled in any long-term care programs.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Care Team sidebar */}
            <div className="space-y-6">
              <Card className="glass-card border-border/50 shadow-sm sticky top-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 mb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary" /> Care Team
                  </CardTitle>
                  <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined} className="rounded-2xl">
                      <DialogHeader><DialogTitle>Assign Team Member</DialogTitle></DialogHeader>
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
                <CardContent className="p-4 pt-0">
                  {isAssignmentsLoading ? <Skeleton className="h-48 w-full rounded-2xl" /> : assignmentsData?.data?.length ? (
                    <div className="space-y-3">
                      {assignmentsData.data.map((assignment) => (
                        <div key={assignment.id} className="group flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border hover:bg-card transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                              <span className="font-bold text-primary text-sm">{assignment.doctor?.firstName?.[0]}{assignment.doctor?.lastName?.[0]}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold truncate text-foreground">Dr. {assignment.doctor?.firstName} {assignment.doctor?.lastName}</div>
                              <div className="text-xs font-medium text-muted-foreground truncate">{assignment.doctor?.role?.name ?? "Clinician"}</div>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader><AlertDialogTitle>Remove Assignment</AlertDialogTitle><AlertDialogDescription>Remove {assignment.doctor?.firstName} {assignment.doctor?.lastName} from this patient's care team?</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleUnassign(assignment.id)}>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <User className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">No care team assigned.</p>
                    </div>
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
              <Dialog open={isJourneyDialogOpen} onOpenChange={setIsJourneyDialogOpen}>
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
          <Card className="glass-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50 mb-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                Appointments
              </CardTitle>
              <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-10 rounded-xl px-6 bg-primary hover:bg-primary/90 shadow-sm font-semibold">
                    <Plus className="w-4 h-4 mr-2" /> Schedule New
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="rounded-2xl">
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
              {isAppointmentsLoading ? <Skeleton className="h-48 w-full rounded-2xl" /> : appointmentsData?.data?.length ? (
                <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/60 before:to-transparent">
                  {appointmentsData.data.map((appt) => {
                    const apptConsultation = consultationsData?.data?.find(c => c.appointmentId === appt.id);
                    const isCompleted = appt.status === "COMPLETED";
                    const isCancelled = appt.status === "CANCELLED";
                    const dotColor = isCompleted ? "bg-secondary border-secondary/20" : isCancelled ? "bg-destructive border-destructive/20" : "bg-primary border-primary/20";
                    return (
                      <div key={appt.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 ring-4 ring-background ${dotColor} absolute left-0 md:left-1/2 -translate-x-1/2 -translate-y-4 sm:translate-y-0 transform transition-transform group-hover:scale-125 z-10`} />
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <Badge variant={appt.status === "SCHEDULED" ? "default" : appt.status === "COMPLETED" ? "secondary" : "destructive"} className="text-[10px] font-bold tracking-wider px-2 shadow-sm">
                                {appt.status}
                              </Badge>
                              <span className="text-sm font-bold text-foreground">
                                {format(new Date(appt.appointmentDate), "MMM d, yyyy")}
                              </span>
                              <span className="text-sm text-muted-foreground font-medium">
                                {format(new Date(appt.appointmentDate), "h:mm a")}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4 bg-muted/30 p-3 rounded-xl border border-border/50">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-foreground truncate">Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate mt-0.5">
                                <Building2 className="w-3.5 h-3.5" /> {appt.clinic?.name}
                                {appt.durationMinutes && <><span className="mx-1 opacity-50">•</span><Clock className="w-3.5 h-3.5" /> {appt.durationMinutes} min</>}
                              </div>
                            </div>
                          </div>

                          {appt.notes && <p className="text-sm text-muted-foreground italic bg-muted/20 p-3 rounded-xl mb-4 border border-dashed border-border/50">{appt.notes}</p>}

                          <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
                            {appt.status === "SCHEDULED" && (
                              <>
                                <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-primary rounded-lg" onClick={() => openEditAppointment(appt)}>
                                  <Pencil className="w-4 h-4 mr-1.5" /> Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"><CheckCircle className="w-4 h-4 mr-1.5" /> Complete</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader><AlertDialogTitle>Complete Appointment</AlertDialogTitle><AlertDialogDescription>Mark this appointment as successfully completed?</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Close</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleAppointmentAction(appt.id, "complete")}>Yes, Complete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"><XCircle className="w-4 h-4 mr-1.5" /> Cancel</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader><AlertDialogTitle>Cancel Appointment</AlertDialogTitle><AlertDialogDescription>Are you sure you want to cancel this appointment?</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Close</AlertDialogCancel>
                                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleAppointmentAction(appt.id, "cancel")}>Yes, Cancel</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            {appt.status === "COMPLETED" && !apptConsultation && (
                              <Button size="sm" variant="outline" className="h-8 border-primary/30 text-primary hover:bg-primary/5 rounded-lg font-medium" onClick={() => openRecordConsultation(appt.id)}>
                                <ClipboardList className="w-4 h-4 mr-1.5" /> Record Consultation
                              </Button>
                            )}
                            {appt.status === "COMPLETED" && apptConsultation && (
                              <span className="text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-success/20">
                                <CheckCircle className="w-3.5 h-3.5" /> Consultation recorded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">No appointments yet</h4>
                  <p className="text-sm text-muted-foreground max-w-sm">Schedule the first appointment to begin the patient's care journey.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CONSULTATIONS TAB ─────────────────────────────────────────────── */}
        <TabsContent value="consultations" className="animate-in-up">
          <Card className="glass-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50 mb-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                Consultation History
              </CardTitle>
              <div className="flex gap-3">
                <Select value={filterConsDoctor} onValueChange={setFilterConsDoctor}>
                  <SelectTrigger className="w-40 h-10 rounded-xl bg-background border-border/60">
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ALL">All Doctors</SelectItem>
                    {consDoctorOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <input 
                    type="date" 
                    value={filterConsDate} 
                    onChange={e => setFilterConsDate(e.target.value)} 
                    className="flex h-10 rounded-xl border border-border/60 bg-background px-3 text-sm w-40"
                  />
                </div>
                <Button size="sm" className="h-10 rounded-xl px-6 bg-primary hover:bg-primary/90 shadow-sm font-semibold" onClick={() => openRecordConsultation()}>
                  <Plus className="w-4 h-4 mr-2" /> Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isConsultationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
                </div>
              ) : filteredConsultations.length ? (
                <div className="space-y-6">
                  {filteredConsultations.map(cons => (
                    <div key={cons.id} className="group relative rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                      
                      <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0 border border-primary/20">
                              <span className="text-sm font-bold leading-none mb-0.5">{cons.consultationDate ? format(new Date(cons.consultationDate), "d") : "-"}</span>
                              <span className="text-[10px] uppercase font-semibold leading-none">{cons.consultationDate ? format(new Date(cons.consultationDate), "MMM") : "-"}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-foreground">
                                {cons.consultationDate ? format(new Date(cons.consultationDate), "EEEE, MMMM d, yyyy") : "Consultation"}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                                  <User className="w-3.5 h-3.5" /> Dr. {cons.doctor?.lastName}
                                </span>
                                <span className="text-muted-foreground/40">•</span>
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <MapPin className="w-3.5 h-3.5" /> {cons.clinic?.name}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* KI-002: Edit button */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" className="h-9 rounded-lg hover:bg-primary/5 hover:text-primary hover:border-primary/30" onClick={() => openEditConsultation(cons)}>
                              <Pencil className="w-4 h-4 mr-2" /> Edit Record
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Consultation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this consultation note? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteConsultation(cons.id!)}>
                                    Yes, Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl border border-border/50">
                          <div className="space-y-4">
                            <div>
                              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> Chief Complaint
                              </span>
                              <p className="text-sm font-medium text-foreground bg-background border border-border/50 p-3 rounded-lg leading-relaxed shadow-sm">
                                {cons.chiefComplaint || <span className="text-muted-foreground italic">No details provided</span>}
                              </p>
                            </div>
                            <div>
                              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                <Stethoscope className="w-3.5 h-3.5" /> Diagnosis
                              </span>
                              <p className="text-sm font-medium text-foreground bg-background border border-border/50 p-3 rounded-lg leading-relaxed shadow-sm border-l-4 border-l-indigo-500">
                                {cons.diagnosis || <span className="text-muted-foreground italic">No details provided</span>}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                  Symptoms
                                </span>
                                <p className="text-sm text-foreground">
                                  {cons.symptoms || <span className="text-muted-foreground italic">None noted</span>}
                                </p>
                              </div>
                              <div>
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                  Observations
                                </span>
                                <p className="text-sm text-foreground">
                                  {cons.observations || <span className="text-muted-foreground italic">None noted</span>}
                                </p>
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t border-border/50">
                              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Treatment & Medications
                              </span>
                              <p className="text-sm text-foreground leading-relaxed">
                                {cons.treatmentPlan || <span className="text-muted-foreground italic">No treatment plan</span>}
                              </p>
                              {cons.medications && (
                                <div className="mt-2.5 flex items-start gap-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
                                  <Pill className="w-4 h-4 mt-0.5 shrink-0" />
                                  <p className="text-sm font-medium italic">Rx: {cons.medications}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {cons.followUpInstructions && (
                            <div className="lg:col-span-2 mt-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3 shadow-sm">
                              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 block">Follow-up Instructions</span>
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-200 leading-relaxed">
                                  {cons.followUpInstructions}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ClipboardList className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">No consultations found</h4>
                  <p className="text-sm text-muted-foreground max-w-sm mb-6">
                    Record clinical encounters, diagnoses, and treatment plans to maintain a complete medical history.
                  </p>
                  <Button onClick={() => openRecordConsultation()} className="rounded-xl px-6 bg-primary hover:bg-primary/90 shadow-sm font-semibold">
                    <Plus className="w-4 h-4 mr-2" /> Record First Consultation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── OUTCOMES TAB ───────────────────────────────────────────────────── */}
        <TabsContent value="outcomes" className="animate-in-up">
          <Card className="glass-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50 mb-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                Clinical Outcomes
              </CardTitle>
              <Dialog open={isOutcomeDialogOpen} onOpenChange={(o) => { setIsOutcomeDialogOpen(o); if (!o) { setOutcomeMetricId(""); setOutcomeBaseline(""); setOutcomeCurrent(""); setOutcomeTarget(""); setOutcomeProgramId(""); setOutcomeNotes(""); } }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-10 rounded-xl px-6 bg-primary hover:bg-primary/90 shadow-sm font-semibold">
                    <Plus className="w-4 h-4 mr-2" /> Record Outcome
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="rounded-2xl">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
                </div>
              ) : !outcomesData?.data?.length ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">No outcomes recorded</h4>
                  <p className="text-sm text-muted-foreground max-w-sm">Record clinical outcomes to track patient progress against care program goals.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {outcomesData.data.map((outcome: any) => {
                    const pct = outcome.progressPct ?? 0;
                    const improved = (outcome.currentValue ?? 0) >= (outcome.baselineValue ?? 0);
                    const metricName = outcome.outcomeMetric?.name ?? "Outcome";
                    const unit = outcome.unit ?? outcome.outcomeMetric?.unit ?? "";
                    const category = outcome.outcomeMetric?.category ?? "";
                    const isAchieved = outcome.targetAchieved;
                    
                    return (
                      <div key={outcome.id} className={`group flex flex-col p-4 rounded-2xl bg-card border ${isAchieved ? 'border-emerald-500/30 shadow-emerald-500/5' : 'border-border/60'} shadow-sm hover:shadow-md transition-all`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <h4 className="font-bold text-foreground">{metricName}</h4>
                              {category && <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider px-2 bg-muted/50 text-muted-foreground">{category}</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              Recorded: {outcome.measuredAt ? format(new Date(outcome.measuredAt), 'MMM d, yyyy') : format(new Date(outcome.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          
                          {isAchieved && (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/10 text-success">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-end justify-between mb-6 bg-muted/20 p-4 rounded-xl border border-border/50">
                          <div>
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Current</div>
                            <div className="text-3xl font-black text-foreground tracking-tight">
                              {outcome.currentValue} <span className="text-lg font-semibold text-muted-foreground">{unit}</span>
                            </div>
                          </div>
                          <div className={`flex flex-col items-end ${improved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            <div className="flex items-center gap-1 text-sm font-bold bg-background/50 px-2 py-1 rounded-md">
                              {improved ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              {Math.abs(outcome.improvementPct ?? 0).toFixed(1)}%
                            </div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">Vs Baseline</div>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="space-y-2 mt-auto">
                          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-border" /> {outcome.baselineValue} {unit}</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary/40" /> {outcome.targetValue} {unit}</span>
                          </div>
                          <div className="w-full bg-muted/50 rounded-full h-3 border border-border/50 overflow-hidden relative">
                            <div
                              className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${Math.min(100, pct)}%`,
                                background: pct >= 100 ? 'hsl(var(--success))' : pct >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--warning))'
                              }}
                            />
                          </div>
                          <div className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{pct}% to target</div>
                        </div>
                        
                        {outcome.notes && (
                          <div className="mt-4 pt-3 border-t border-border/50 text-sm text-muted-foreground italic bg-muted/20 p-3 rounded-xl border-dashed">
                            {outcome.notes}
                          </div>
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
        {/* ── TASKS TAB ──────────────────────────────────────────────────────── */}
        <TabsContent value="tasks" className="animate-in-up">
          <Card className="glass-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50 mb-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                Care Tasks
              </CardTitle>
              <Dialog open={isTaskDialogOpen} onOpenChange={(o) => { setIsTaskDialogOpen(o); if (!o) { setTaskTitle(""); setTaskDescription(""); setTaskPriority("MEDIUM"); setTaskAssignedTo(""); setTaskDueDate(""); setTaskDueTime(""); } }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-10 rounded-xl px-6 bg-primary hover:bg-primary/90 shadow-sm font-semibold">
                    <Plus className="w-4 h-4 mr-2" /> Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="max-w-lg rounded-2xl">
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
                <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div>
              ) : !tasksData?.data?.length ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">No tasks assigned</h4>
                  <p className="text-sm text-muted-foreground max-w-sm">Create a care task to coordinate patient support across the care team.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasksData.data.map((task: any) => {
                    const isTaskOverdue = task.isOverdue || (task.status !== "COMPLETED" && new Date(task.dueDate) < new Date());
                    const priorityConfig = {
                      LOW: "bg-muted text-muted-foreground border-border",
                      MEDIUM: "bg-primary/10 text-primary border-primary/20",
                      HIGH: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50",
                      CRITICAL: "bg-destructive/10 text-destructive border-destructive/20",
                    }[task.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"] || "bg-muted text-muted-foreground border-border";

                    const statusConfig = {
                      PENDING: { label: "Pending", class: "bg-muted text-muted-foreground border-border shadow-sm" },
                      IN_PROGRESS: { label: "In Progress", class: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm" },
                      COMPLETED: { label: "Completed", class: "bg-success/10 text-success border-success/20 shadow-sm" },
                      OVERDUE: { label: "Overdue", class: "bg-rose-50 text-rose-700 border-rose-200 shadow-sm" },
                    }[task.status as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE"] || { label: task.status, class: "bg-muted text-muted-foreground" };

                    return (
                      <div key={task.id} className={cn("group flex flex-col md:flex-row justify-between gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all", task.status === "COMPLETED" && "opacity-75 bg-muted/20 hover:border-border/60")}>
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={cn("font-bold text-base text-foreground", task.status === "COMPLETED" && "line-through text-muted-foreground")}>{task.title}</span>
                            <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider px-2 border", priorityConfig)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider px-2 border", statusConfig.class)}>
                              {isTaskOverdue && task.status !== "COMPLETED" ? "OVERDUE" : statusConfig.label}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className={cn("text-sm text-muted-foreground leading-relaxed", task.status === "COMPLETED" && "line-through")}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium pt-2 text-muted-foreground">
                            {task.assignee && (
                              <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
                                <User className="w-3.5 h-3.5" />
                                {task.assignee.firstName} {task.assignee.lastName}
                              </span>
                            )}
                            <span className={cn("flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50", isTaskOverdue && task.status !== "COMPLETED" && "bg-destructive/10 text-destructive border-destructive/20 font-bold")}>
                              <Clock className="w-3.5 h-3.5" />
                              Due: {format(new Date(task.dueDate), 'MMM d, yyyy • h:mm a')}
                            </span>
                            {task.completedAt && (
                              <span className="flex items-center gap-1.5 text-success bg-success/10 px-2.5 py-1 rounded-md border border-success/20">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Completed: {format(new Date(task.completedAt), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-center border-t border-border/50 md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0 w-full md:w-auto mt-2 md:mt-0">
                          {task.status !== "COMPLETED" && (
                            <>
                              {task.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-9 w-full md:w-auto text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
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
                                  <PlayCircle className="w-4 h-4 mr-1.5" /> Start
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-full md:w-auto text-xs font-semibold text-success hover:text-success hover:bg-success/10 border border-transparent hover:border-success/30 rounded-lg transition-all"
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
                                <CheckCircle className="w-4 h-4 mr-1.5" /> Complete
                              </Button>
                            </>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
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
          <Card className="glass-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50 mb-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                Files & Documents
              </CardTitle>
              <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-10 rounded-xl px-6 bg-primary hover:bg-primary/90 shadow-sm font-semibold">
                    <Upload className="w-4 h-4 mr-2" /> Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="rounded-2xl">
                  <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-6">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl p-8 bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-primary font-semibold hover:underline">Click to browse</span>
                        <span className="text-muted-foreground ml-1">or drag and drop</span>
                        <input id="file-upload" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-2">Securely upload patient reports, scans, or identification</p>
                      {selectedFile && (
                        <div className="mt-4 p-3 bg-card border border-border/50 rounded-lg flex items-center gap-3 w-full">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsFileDialogOpen(false); setSelectedFile(null); }}>Cancel</Button>
                    <Button onClick={handleUploadFile} disabled={!selectedFile || uploadFile.isPending} className="px-6">{uploadFile.isPending ? "Uploading..." : "Upload Document"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isFileLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                </div>
              ) : fileList?.data?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {fileList.data.map((file) => {
                    const ext = file.fileKey.split('.').pop()?.toLowerCase();
                    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '');
                    const isPdf = ext === 'pdf';
                    
                    return (
                      <div key={file.id} className="group flex flex-col p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-sm p-1 rounded-lg border border-border/50 shadow-sm">
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md hover:text-primary hover:bg-primary/10">
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md hover:text-destructive hover:bg-destructive/10 text-muted-foreground">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader><AlertDialogTitle>Delete Document</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete <span className="font-semibold">{file.fileKey}</span>? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={() => handleDeleteFile(file.id)}>Yes, Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${isPdf ? 'bg-destructive/10 text-destructive border border-destructive/20' : isImage ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                            {isPdf ? <FileText className="w-8 h-8" /> : isImage ? <FileText className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                          </div>
                          <div className="text-center w-full">
                            <h4 className="text-sm font-bold text-foreground truncate px-2" title={file.fileKey}>{file.fileKey}</h4>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">{format(new Date(file.createdAt), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-border/50 mt-auto">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <User className="w-3 h-3" />
                            </div>
                            <span className="truncate">Uploaded by {file.uploader?.firstName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">No documents found</h4>
                  <p className="text-sm text-muted-foreground max-w-sm">Securely upload patient reports, identification, or clinical scans here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── COMMUNICATIONS TAB ────────────────────────────────────────────── */}
        <TabsContent value="communications" className="animate-in-up">
          <Card className="glass-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  Communications
                </CardTitle>
                <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 shadow-inner">
                  <Button size="sm" variant={commType === "SMS" ? "default" : "ghost"} className={`h-8 rounded-lg px-4 text-xs font-semibold transition-all ${commType === "SMS" ? "shadow-sm" : ""}`} onClick={() => setCommType("SMS")}>SMS</Button>
                  <Button size="sm" variant={commType === "EMAIL" ? "default" : "ghost"} className={`h-8 rounded-lg px-4 text-xs font-semibold transition-all ${commType === "EMAIL" ? "shadow-sm" : ""}`} onClick={() => setCommType("EMAIL")}>Email</Button>
                </div>
              </div>
              <Dialog open={isSmsDialogOpen} onOpenChange={setIsSmsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-10 rounded-xl px-6 bg-primary hover:bg-primary/90 shadow-sm font-semibold">
                    <Send className="w-4 h-4 mr-2" /> New Message
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="rounded-2xl max-w-md">
                  <DialogHeader><DialogTitle>New {commType} Message</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    {commType === "EMAIL" && (
                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</Label>
                        <Input
                          type="text"
                          className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                          placeholder="e.g. Test Results Available"
                          id="comm-subject"
                        />
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message Body</Label>
                      <Textarea 
                        value={smsMessage} 
                        onChange={(e) => setSmsMessage(e.target.value)} 
                        placeholder={commType === "SMS" ? "Type your SMS message..." : "Type your email body..."} 
                        rows={6} 
                        className="rounded-xl border-input bg-background resize-none"
                        maxLength={commType === "SMS" ? 1600 : 5000} 
                      />
                      <div className="flex justify-end">
                        <span className={`text-[10px] font-bold ${smsMessage.length > (commType === "SMS" ? 1500 : 4800) ? "text-amber-500" : "text-muted-foreground"}`}>
                          {smsMessage.length} / {commType === "SMS" ? 1600 : 5000}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSmsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                    <Button onClick={handleSendSms} disabled={!smsMessage.trim() || createCommunication.isPending} className="rounded-xl px-6">
                      {createCommunication.isPending ? "Sending..." : "Send Message"} <Send className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isSmsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                </div>
              ) : smsHistory?.data?.length ? (
                <div className="space-y-4 pr-2 max-h-[600px] overflow-y-auto">
                  {smsHistory.data.map((comm) => {
                    const isDelivered = comm.status === "DELIVERED" || comm.status === "SENT";
                    const isFailed = comm.status === "FAILED";
                    
                    return (
                      <div key={comm.id} className="flex flex-col gap-2 p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              {comm.type === "SMS" ? <MessageSquare className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-sm font-bold">{comm.type || "Message"}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                              {format(new Date(comm.createdAt), 'MMM d, yyyy • h:mm a')}
                            </span>
                            <Badge 
                              variant={isDelivered ? "default" : isFailed ? "destructive" : "secondary"} 
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 ${isDelivered ? 'bg-success/10 text-success hover:bg-success/20 border-success/20' : ''}`}
                            >
                              {comm.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap pl-10">
                          {comm.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">No communications history</h4>
                  <p className="text-sm text-muted-foreground max-w-sm mb-6">
                    Send secure messages to the patient via SMS or Email directly from the platform.
                  </p>
                  <Button onClick={() => setIsSmsDialogOpen(true)} className="rounded-xl px-6 bg-primary hover:bg-primary/90 shadow-sm font-semibold">
                    <Send className="w-4 h-4 mr-2" /> Send First Message
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
