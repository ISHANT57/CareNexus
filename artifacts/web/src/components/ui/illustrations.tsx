import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * On-brand, coded SVG illustrations (no image assets, no external calls).
 * They inherit the theme via `text-primary` + CSS-variable gradients, so they
 * adapt to light/dark automatically. Subtle CSS animation gives them life.
 *
 * Usage: <Illustration name="patients" className="w-40 h-40" />
 * or import a specific one: <PatientsIllustration />
 */

type IllustrationProps = React.SVGProps<SVGSVGElement> & { className?: string };

const baseClass = "text-primary";

/** Shared soft gradient + glow defs, unique per instance id. */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id={`${id}-soft`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
      </linearGradient>
    </defs>
  );
}

function Frame({ children, className, ...props }: IllustrationProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      role="img"
      aria-hidden="true"
      className={cn(baseClass, "cx-illustration", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

/** Patients / people */
export function PatientsIllustration({ className, ...props }: IllustrationProps) {
  return (
    <Frame className={className} {...props}>
      <Defs id="ill-patients" />
      <circle cx="80" cy="80" r="62" fill="url(#ill-patients-soft)" className="cx-pulse" />
      <circle cx="80" cy="60" r="22" fill="url(#ill-patients-g)" />
      <path d="M42 118c0-21 17-34 38-34s38 13 38 34" fill="url(#ill-patients-g)" />
      <circle cx="122" cy="52" r="12" fill="currentColor" opacity="0.35" className="cx-float" />
      <circle cx="36" cy="98" r="8" fill="currentColor" opacity="0.25" className="cx-float-slow" />
    </Frame>
  );
}

/** Search / no results */
export function SearchIllustration({ className, ...props }: IllustrationProps) {
  return (
    <Frame className={className} {...props}>
      <Defs id="ill-search" />
      <circle cx="80" cy="80" r="62" fill="url(#ill-search-soft)" />
      <circle cx="72" cy="72" r="30" stroke="url(#ill-search-g)" strokeWidth="8" fill="none" className="cx-pulse" />
      <rect x="94" y="94" width="34" height="12" rx="6" transform="rotate(45 94 94)" fill="url(#ill-search-g)" />
      <circle cx="118" cy="44" r="6" fill="currentColor" opacity="0.3" className="cx-float" />
    </Frame>
  );
}

/** Calendar / appointments */
export function CalendarIllustration({ className, ...props }: IllustrationProps) {
  return (
    <Frame className={className} {...props}>
      <Defs id="ill-cal" />
      <circle cx="80" cy="80" r="62" fill="url(#ill-cal-soft)" />
      <rect x="42" y="46" width="76" height="68" rx="12" fill="url(#ill-cal-g)" />
      <rect x="42" y="46" width="76" height="20" rx="12" fill="currentColor" opacity="0.55" />
      <rect x="56" y="38" width="8" height="18" rx="4" fill="currentColor" />
      <rect x="96" y="38" width="8" height="18" rx="4" fill="currentColor" />
      <circle cx="66" cy="82" r="5" fill="white" opacity="0.85" />
      <circle cx="86" cy="82" r="5" fill="white" opacity="0.55" />
      <circle cx="106" cy="82" r="5" fill="white" opacity="0.55" />
      <circle cx="66" cy="100" r="5" fill="white" opacity="0.55" />
      <circle cx="86" cy="100" r="5" fill="white" opacity="0.85" className="cx-pulse" />
    </Frame>
  );
}

/** Tasks / checklist */
export function TasksIllustration({ className, ...props }: IllustrationProps) {
  return (
    <Frame className={className} {...props}>
      <Defs id="ill-tasks" />
      <circle cx="80" cy="80" r="62" fill="url(#ill-tasks-soft)" />
      <rect x="46" y="40" width="68" height="80" rx="12" fill="url(#ill-tasks-g)" />
      <rect x="58" y="34" width="44" height="16" rx="8" fill="currentColor" opacity="0.6" />
      <path d="M60 68l6 6 12-12" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="cx-draw" />
      <rect x="84" y="66" width="20" height="6" rx="3" fill="white" opacity="0.7" />
      <path d="M60 92l6 6 12-12" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="cx-draw cx-draw-2" />
      <rect x="84" y="90" width="20" height="6" rx="3" fill="white" opacity="0.5" />
    </Frame>
  );
}

/** Buildings / clinics / tenants */
export function BuildingsIllustration({ className, ...props }: IllustrationProps) {
  return (
    <Frame className={className} {...props}>
      <Defs id="ill-build" />
      <circle cx="80" cy="80" r="62" fill="url(#ill-build-soft)" />
      <rect x="50" y="60" width="34" height="58" rx="6" fill="url(#ill-build-g)" />
      <rect x="86" y="44" width="30" height="74" rx="6" fill="currentColor" opacity="0.55" />
      <rect x="58" y="70" width="8" height="8" rx="2" fill="white" opacity="0.85" />
      <rect x="70" y="70" width="8" height="8" rx="2" fill="white" opacity="0.6" />
      <rect x="58" y="86" width="8" height="8" rx="2" fill="white" opacity="0.6" />
      <rect x="70" y="86" width="8" height="8" rx="2" fill="white" opacity="0.85" />
      <rect x="94" y="56" width="7" height="7" rx="2" fill="white" opacity="0.8" />
      <rect x="104" y="56" width="7" height="7" rx="2" fill="white" opacity="0.55" />
      <path d="M96 30v14M89 37h14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="cx-pulse" />
    </Frame>
  );
}

/** Map / areas / regions */
export function MapIllustration({ className, ...props }: IllustrationProps) {
  return (
    <Frame className={className} {...props}>
      <Defs id="ill-map" />
      <circle cx="80" cy="80" r="62" fill="url(#ill-map-soft)" />
      <path d="M52 52l28-10 28 10v56l-28-10-28 10z" fill="url(#ill-map-g)" />
      <path d="M80 42v56M52 52l28-10M108 52l-28-10" stroke="white" strokeWidth="2.5" opacity="0.5" />
      <path d="M80 60c-8 0-14 6-14 14 0 10 14 22 14 22s14-12 14-22c0-8-6-14-14-14z" fill="currentColor" className="cx-float" />
      <circle cx="80" cy="74" r="5" fill="white" />
    </Frame>
  );
}

/** Programs / care pathways */
export function ProgramsIllustration({ className, ...props }: IllustrationProps) {
  return (
    <Frame className={className} {...props}>
      <Defs id="ill-prog" />
      <circle cx="80" cy="80" r="62" fill="url(#ill-prog-soft)" />
      <circle cx="52" cy="58" r="12" fill="url(#ill-prog-g)" />
      <circle cx="108" cy="58" r="12" fill="currentColor" opacity="0.5" />
      <circle cx="80" cy="106" r="12" fill="currentColor" opacity="0.7" />
      <path d="M62 62l14 34M98 62L84 96" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <path d="M64 58h32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5" className="cx-pulse" />
    </Frame>
  );
}

/** Health pulse / general clinical */
export function PulseIllustration({ className, ...props }: IllustrationProps) {
  return (
    <Frame className={className} {...props}>
      <Defs id="ill-pulse" />
      <circle cx="80" cy="80" r="62" fill="url(#ill-pulse-soft)" />
      <circle cx="80" cy="80" r="42" fill="url(#ill-pulse-g)" />
      <path d="M50 80h12l6-14 10 30 8-22 6 6h18" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" className="cx-draw" />
    </Frame>
  );
}

/** Notifications / bell */
export function NotificationsIllustration({ className, ...props }: IllustrationProps) {
  return (
    <Frame className={className} {...props}>
      <Defs id="ill-bell" />
      <circle cx="80" cy="80" r="62" fill="url(#ill-bell-soft)" />
      <path d="M80 40c-14 0-24 10-24 24v18l-8 10h64l-8-10V64c0-14-10-24-24-24z" fill="url(#ill-bell-g)" className="cx-swing" />
      <path d="M70 100a10 10 0 0020 0" fill="currentColor" />
      <circle cx="104" cy="50" r="8" fill="currentColor" className="cx-pulse" />
    </Frame>
  );
}

const REGISTRY = {
  patients: PatientsIllustration,
  search: SearchIllustration,
  calendar: CalendarIllustration,
  tasks: TasksIllustration,
  buildings: BuildingsIllustration,
  map: MapIllustration,
  programs: ProgramsIllustration,
  pulse: PulseIllustration,
  notifications: NotificationsIllustration,
} as const;

export type IllustrationName = keyof typeof REGISTRY;

/** Convenience: pick an illustration by name. */
export function Illustration({ name, className, ...props }: IllustrationProps & { name: IllustrationName }) {
  const Cmp = REGISTRY[name] ?? PulseIllustration;
  return <Cmp className={className} {...props} />;
}
