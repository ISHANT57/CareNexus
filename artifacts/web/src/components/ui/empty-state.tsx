import * as React from "react";
import { type LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  /** Optional coded SVG illustration (from components/ui/illustrations). Overrides `icon` when set. */
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional call-to-action (e.g. a <Button>) rendered below the description. */
  action?: React.ReactNode;
}

/**
 * Consistent empty / no-data placeholder used across list and detail views.
 * Replaces the ad-hoc "No data found" text scattered through the pages.
 */
export function EmptyState({
  icon: Icon = Inbox,
  illustration,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-14 text-center",
        className,
      )}
      {...props}
    >
      {illustration ? (
        <div className="mb-1 h-32 w-32 text-primary">{illustration}</div>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
