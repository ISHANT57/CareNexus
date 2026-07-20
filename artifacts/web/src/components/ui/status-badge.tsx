import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "destructive" | "info" | "muted";

const TONE_BADGE_CLASS: Record<StatusTone, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-primary/10 text-primary border-primary/20",
  muted: "bg-muted text-muted-foreground border-border",
};

const TONE_DOT_CLASS: Record<StatusTone, string> = {
  success: "bg-success border-success/30",
  warning: "bg-warning border-warning/30",
  destructive: "bg-destructive border-destructive/30",
  info: "bg-primary border-primary/30",
  muted: "bg-muted-foreground/50 border-border",
};

type StatusEntry = { label: string; tone: StatusTone };

const STATUS_CONFIG = {
  patient: {
    ACTIVE: { label: "Active", tone: "success" },
    INACTIVE: { label: "Inactive", tone: "muted" },
    DISCHARGE: { label: "Discharged", tone: "info" },
    NEW: { label: "New", tone: "warning" },
    PSI: { label: "PSI", tone: "info" },
    MEDICATION_REQUIRED: { label: "Medication Req.", tone: "destructive" },
    CONSULTATION_COMPLETED: { label: "Consultation Done", tone: "info" },
  },
  appointment: {
    SCHEDULED: { label: "Scheduled", tone: "warning" },
    COMPLETED: { label: "Completed", tone: "success" },
    CANCELLED: { label: "Cancelled", tone: "destructive" },
    NO_SHOW: { label: "No Show", tone: "muted" },
  },
  task: {
    PENDING: { label: "To Do", tone: "muted" },
    IN_PROGRESS: { label: "In Progress", tone: "info" },
    COMPLETED: { label: "Done", tone: "success" },
    OVERDUE: { label: "Overdue", tone: "destructive" },
  },
  taskPriority: {
    LOW: { label: "Low", tone: "muted" },
    MEDIUM: { label: "Medium", tone: "warning" },
    HIGH: { label: "High", tone: "destructive" },
  },
  patientRisk: {
    LOW: { label: "Low", tone: "success" },
    MEDIUM: { label: "Medium", tone: "warning" },
    HIGH: { label: "High", tone: "destructive" },
    CRITICAL: { label: "Critical", tone: "destructive" },
  },
} satisfies Record<string, Record<string, StatusEntry>>;

export type StatusDomain = keyof typeof STATUS_CONFIG;

export function getStatusConfig(domain: StatusDomain, status: string): StatusEntry {
  const domainConfig = STATUS_CONFIG[domain] as Record<string, StatusEntry>;
  return domainConfig[status] ?? { label: status, tone: "muted" };
}

export function getToneDotClass(tone: StatusTone) {
  return TONE_DOT_CLASS[tone];
}

export function getToneBadgeClass(tone: StatusTone) {
  return TONE_BADGE_CLASS[tone];
}

interface StatusBadgeProps {
  domain: StatusDomain;
  status: string;
  className?: string;
}

export function StatusBadge({ domain, status, className }: StatusBadgeProps) {
  const { label, tone } = getStatusConfig(domain, status);
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", TONE_BADGE_CLASS[tone], className)}>
      {label}
    </Badge>
  );
}
