import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  className?: string;
}

const variantStyles = {
  default: {
    card: "bg-card border-border",
    icon: "bg-muted text-muted-foreground",
    value: "text-foreground",
  },
  primary: {
    card: "bg-primary/5 border-primary/20",
    icon: "bg-primary/10 text-primary",
    value: "text-primary",
  },
  success: {
    card: "bg-emerald-500/5 border-emerald-500/20",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-400",
  },
  warning: {
    card: "bg-amber-500/5 border-amber-500/20",
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-400",
  },
  destructive: {
    card: "bg-destructive/5 border-destructive/20",
    icon: "bg-destructive/10 text-destructive",
    value: "text-destructive",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-xl border p-5 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5",
        styles.card,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", styles.icon)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      <div>
        <p className={cn("text-2xl font-bold tracking-tight", styles.value)}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          {trend.value > 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          ) : trend.value < 0 ? (
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              trend.value > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : trend.value < 0
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value}%
          </span>
          {trend.label && (
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
