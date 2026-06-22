import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  /** Optional visually-hidden label for screen readers. */
  label?: string;
}

/** Lightweight, accessible loading spinner. */
export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2 className={cn("h-4 w-4 animate-spin text-muted-foreground", className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
