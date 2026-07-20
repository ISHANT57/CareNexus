import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 opacity-40 text-primary" />
      </div>
      <h3 className="font-semibold text-xl text-foreground">{title}</h3>
      {description && <p className="text-sm mt-2 max-w-sm text-center">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
