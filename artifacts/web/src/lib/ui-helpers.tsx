import * as React from "react";
import {
  ChevronLeft, ChevronRight, User,
  Heart, HeartPulse, Droplet, Activity, Users, Brain,
  Baby, Bone, Wind, Stethoscope, FolderGit2, type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Avatars — deterministic gradient from a name hash
// ─────────────────────────────────────────────────────────────
export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
  "linear-gradient(135deg, #0b63f6 0%, #0891b2 100%)",
  "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
  "linear-gradient(135deg, #dc2626 0%, #be185d 100%)",
  "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
  "linear-gradient(135deg, #0891b2 0%, #0369a1 100%)",
  "linear-gradient(135deg, #be185d 0%, #9333ea 100%)",
  "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
];

export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function getInitials(first?: string | null, last?: string | null): string {
  const f = (first ?? "").trim();
  const l = (last ?? "").trim();
  if (f || l) return ((f[0] ?? "") + (l[0] ?? "")).toUpperCase();
  return "";
}

const AVATAR_SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
} as const;

export function GradientAvatar({
  name,
  first,
  last,
  size = "sm",
  className,
}: {
  name?: string;
  first?: string | null;
  last?: string | null;
  size?: keyof typeof AVATAR_SIZES;
  className?: string;
}) {
  const label = name ?? `${first ?? ""} ${last ?? ""}`;
  const initials = name
    ? name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : getInitials(first, last);
  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center font-bold text-white shadow-sm",
        AVATAR_SIZES[size],
        className
      )}
      style={{ background: getAvatarGradient(label.trim() || "?") }}
    >
      {initials || <User className="w-3.5 h-3.5" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Program-type icons — distinct glyph + color per care programme
// ─────────────────────────────────────────────────────────────
type ProgramGlyph = { icon: LucideIcon; color: string };

const PROGRAM_ICON_RULES: { match: RegExp; glyph: ProgramGlyph }[] = [
  { match: /cardiac|heart|cardio/i, glyph: { icon: Heart, color: "#e11d48" } },
  { match: /diabet/i, glyph: { icon: Droplet, color: "#0891b2" } },
  { match: /hypertens|blood pressure|bp/i, glyph: { icon: HeartPulse, color: "#dc2626" } },
  { match: /elder|geriatr|senior|age/i, glyph: { icon: Users, color: "#7c3aed" } },
  { match: /women|maternity|gyna|obstet/i, glyph: { icon: Baby, color: "#db2777" } },
  { match: /mental|camhs|psych|wellbeing|anxiety/i, glyph: { icon: Brain, color: "#9333ea" } },
  { match: /msk|muscul|ortho|bone|joint|rehab/i, glyph: { icon: Bone, color: "#d97706" } },
  { match: /respir|asthma|copd|pulmon|lung/i, glyph: { icon: Wind, color: "#0ea5e9" } },
  { match: /weight|nutrition|lifestyle|obesity/i, glyph: { icon: Activity, color: "#16a34a" } },
];

const DEFAULT_PROGRAM_GLYPH: ProgramGlyph = { icon: Stethoscope, color: "#0b63f6" };

export function getProgramGlyph(name?: string | null): ProgramGlyph {
  if (!name) return DEFAULT_PROGRAM_GLYPH;
  return PROGRAM_ICON_RULES.find((r) => r.match.test(name))?.glyph ?? DEFAULT_PROGRAM_GLYPH;
}

/** Small colored program glyph, used in tables/cards. */
export function ProgramIcon({ name, className }: { name?: string | null; className?: string }) {
  const { icon: Icon, color } = getProgramGlyph(name);
  return <Icon className={cn("w-3.5 h-3.5 shrink-0", className)} style={{ color }} />;
}

// A neutral fallback glyph for "no programme" cases.
export const ProgramFallbackIcon = FolderGit2;

// ─────────────────────────────────────────────────────────────
// Status / risk badges — soft outline pattern
// ─────────────────────────────────────────────────────────────
export const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: "Active", class: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  INACTIVE: { label: "Inactive", class: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  DISCHARGE: { label: "Discharged", class: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
  NEW: { label: "New", class: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  PSI: { label: "PSI", class: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" },
  MEDICATION_REQUIRED: { label: "Medication Req.", class: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
  CONSULTATION_COMPLETED: { label: "Consultation Done", class: "bg-primary/10 text-primary border-primary/20" },
};

export function StatusBadge({
  status,
  map = STATUS_BADGE,
  className,
}: {
  status: string;
  map?: Record<string, { label: string; class: string }>;
  className?: string;
}) {
  const config = map[status] ?? { label: status, class: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.class, className)}>
      {config.label}
    </Badge>
  );
}

/** Risk-level badge (LOW / MEDIUM / HIGH / CRITICAL) with optional numeric score. */
export function RiskBadge({ level, score }: { level?: string | null; score?: number | null }) {
  if (!level) return <span className="text-muted-foreground text-xs">—</span>;
  const upper = level.toUpperCase();
  const cls =
    upper === "CRITICAL" || upper === "HIGH"
      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
      : upper === "MEDIUM"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase", cls)}>
      {upper} ({score ?? 0})
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────
// Pagination — numbered with ellipses
// ─────────────────────────────────────────────────────────────
export function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "...", total];
  if (current >= total - 2) return [1, "...", total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  noun = "results",
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  noun?: string;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className={cn("flex items-center justify-between px-6 py-4 border-t border-border", className)}>
      <span className="text-sm text-muted-foreground">
        Showing {from} to {to} of {total.toLocaleString()} {noun}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        {getPageNumbers(page, totalPages).map((pg, i) =>
          pg === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-muted-foreground select-none">…</span>
          ) : (
            <Button
              key={`page-${pg}`}
              variant={page === pg ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0 text-xs"
              onClick={() => onPageChange(pg as number)}
            >
              {pg}
            </Button>
          )
        )}
        <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
