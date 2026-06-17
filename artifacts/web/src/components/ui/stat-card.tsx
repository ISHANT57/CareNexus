import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { Link } from "wouter";

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
  /** If provided, the card becomes a navigation link */
  href?: string;
}

// Flat, restrained icon tiles — soft tint + saturated glyph, no gradients or glow.
const variantStyles = {
  default: {
    card: "bg-card border-border",
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
    value: "text-foreground",
  },
  primary: {
    card: "bg-card border-border",
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  success: {
    card: "bg-card border-border",
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    value: "text-foreground",
  },
  warning: {
    card: "bg-card border-border",
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    value: "text-foreground",
  },
  destructive: {
    card: "bg-card border-border",
    icon: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    value: "text-foreground",
  },
};

function StatCardInner({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
  href,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-xl border p-5 flex flex-col gap-3 transition-colors duration-200",
        href
          ? "cursor-pointer hover:border-primary/40 hover:shadow-sm group"
          : "",
        styles.card,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-center gap-1.5">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", styles.icon)}>
            <Icon className="w-5 h-5" />
          </div>
          {href && (
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>

      <div>
        <p className={cn("text-3xl font-bold tracking-tight", styles.value)}>
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

export function StatCard(props: StatCardProps) {
  if (props.href) {
    return (
      <Link href={props.href}>
        <StatCardInner {...props} />
      </Link>
    );
  }
  return <StatCardInner {...props} />;
}
