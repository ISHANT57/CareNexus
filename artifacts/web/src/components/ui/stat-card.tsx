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

const variantStyles = {
  default: {
    card: "bg-card border-border/60",
    icon: "bg-muted-foreground/80 text-white",
  },
  primary: {
    card: "bg-card border-border/60",
    icon: "bg-primary text-primary-foreground",
  },
  success: {
    card: "bg-card border-border/60",
    icon: "bg-success text-success-foreground",
  },
  warning: {
    card: "bg-card border-border/60",
    icon: "bg-warning text-warning-foreground",
  },
  destructive: {
    card: "bg-card border-border/60",
    icon: "bg-destructive text-destructive-foreground",
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
        "rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition-all duration-200",
        href
          ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 group"
          : "hover:shadow-md",
        styles.card,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
        {href && (
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-foreground mt-1">
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
