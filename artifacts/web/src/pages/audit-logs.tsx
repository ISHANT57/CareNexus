import { useState } from "react";
import { useListAuditLogs } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { usePagination } from "@/hooks/use-pagination";
import { ChevronDown, ChevronUp, ScrollText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  PATCH: "Modified",
  DELETE: "Deleted",
};

function actionToneClass(action: string): string {
  if (action === "CREATE") return "bg-success/10 text-success border-success/20";
  if (action === "DELETE") return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-primary/10 text-primary border-primary/20";
}

function actionDotClass(action: string): string {
  if (action === "CREATE") return "bg-success";
  if (action === "DELETE") return "bg-destructive";
  return "bg-primary";
}

const ENTITY_LABELS: Record<string, string> = {
  Patient: "Patient",
  Consultation: "Consultation",
  Appointment: "Appointment",
  ProgramEnrollment: "Program Enrollment",
  Assignment: "Care Assignment",
  User: "Team Member",
  Clinic: "Clinic",
  Area: "Area",
  Program: "Program",
  Role: "Role",
  SmsMessage: "SMS Message",
};

function humanizeAction(action: string, entityType: string): string {
  const actionLabel = ACTION_LABELS[action] ?? action;
  const entityLabel = ENTITY_LABELS[entityType] ?? entityType?.replace(/_/g, " ");
  return `${actionLabel} ${entityLabel}`;
}

function JsonViewer({ data, label }: { data: any; label: string }) {
  if (!data) return <span className="text-muted-foreground italic">None</span>;
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return (
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-x-auto max-h-40 border border-border font-mono leading-relaxed">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      </div>
    );
  } catch {
    return <span className="text-xs text-muted-foreground font-mono">{String(data)}</span>;
  }
}

export default function AuditLogsPage() {
  const { page, pageSize, setPage } = usePagination(50);
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data, isLoading } = useListAuditLogs({
    page,
    limit: pageSize,
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / pageSize) : 1;

  const activeFilterCount = [filterAction, filterEntity].filter(Boolean).length;

  const clearFilters = () => {
    setFilterAction("");
    setFilterEntity("");
    setPage(1);
  };

  // Client-side filter (API doesn't expose filter params in generated hooks)
  const filteredLogs = (data?.data ?? []).filter((log: any) => {
    if (filterAction && log.action !== filterAction) return false;
    if (filterEntity && log.entity !== filterEntity) return false;
    return true;
  });

  // Get unique entities from current page for filter dropdown
  const uniqueEntities = Array.from(
    new Set((data?.data ?? []).map((l: any) => l.entity).filter(Boolean))
  ).sort() as string[];

  const expandedLog: any = filteredLogs.find((log: any) => log.id === expandedRow);

  const columns: DataTableColumn<any>[] = [
    {
      key: "indicator",
      header: "",
      headerClassName: "w-4",
      className: "w-4 pr-0",
      render: (log) => <div className={cn("w-2 h-2 rounded-full", actionDotClass(log.action))} />,
    },
    {
      key: "timestamp",
      header: "Timestamp",
      className: "text-sm text-muted-foreground whitespace-nowrap",
      render: (log) =>
        new Date(log.createdAt).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      key: "actor",
      header: "Actor",
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">
              {log.user ? log.user.firstName?.[0] : "S"}
            </span>
          </div>
          <span className="text-sm font-medium">
            {log.user ? `${log.user.firstName} ${log.user.lastName}` : "System"}
          </span>
        </div>
      ),
    },
    {
      key: "event",
      header: "Event",
      render: (log) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs font-medium", actionToneClass(log.action))}>
            {ACTION_LABELS[log.action] ?? log.action}
          </Badge>
          <span className="text-sm text-muted-foreground">{humanizeAction(log.action, log.entity)}</span>
        </div>
      ),
    },
    {
      key: "entity",
      header: "Entity",
      render: (log) => (
        <Badge variant="secondary" className="text-xs font-mono">
          {ENTITY_LABELS[log.entity] ?? log.entity ?? "—"}
        </Badge>
      ),
    },
    {
      key: "entityId",
      header: "Entity ID",
      render: (log) => (
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
            {log.entityId ?? "—"}
          </span>
          {expandedRow === log.id ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container animate-in-up">
      <PageHeader
        title="Audit Logs"
        description="Immutable, append-only record of all system activity and data access."
        actions={
          data?.meta ? (
            <Badge variant="secondary" className="text-sm px-3 py-1.5">
              {data.meta.total.toLocaleString()} total events
            </Badge>
          ) : undefined
        }
      />

      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</Label>
            <Select value={filterAction} onValueChange={(v) => { setFilterAction(v === "ALL" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All actions</SelectItem>
                <SelectItem value="CREATE">Created</SelectItem>
                <SelectItem value="UPDATE">Updated</SelectItem>
                <SelectItem value="DELETE">Deleted</SelectItem>
                <SelectItem value="PATCH">Modified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entity Type</Label>
            <Select value={filterEntity} onValueChange={(v) => { setFilterEntity(v === "ALL" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All entities</SelectItem>
                {uniqueEntities.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {ENTITY_LABELS[entity] ?? entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground h-9">
              <X className="w-3.5 h-3.5" />
              Clear filters ({activeFilterCount})
            </Button>
          )}

          <div className="ml-auto text-sm text-muted-foreground self-center">
            {filterAction || filterEntity ? (
              <span>{filteredLogs.length} of {data?.data?.length ?? 0} shown (this page)</span>
            ) : (
              data?.meta && <span>Page {page} of {totalPages}</span>
            )}
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden border-border/50 shadow-sm rounded-2xl">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredLogs}
              isLoading={isLoading}
              getRowKey={(log) => log.id}
              onRowClick={(log) => setExpandedRow(expandedRow === log.id ? null : log.id)}
              emptyState={
                <EmptyState
                  icon={ScrollText}
                  title="No audit logs found"
                  description={activeFilterCount > 0 ? "Try clearing the filters" : "System events will appear here"}
                />
              }
              pagination={{
                page,
                totalPages,
                totalLabel: `${data?.meta?.total?.toLocaleString() ?? 0} total`,
                onPageChange: setPage,
              }}
            />

            {/* Expanded detail panel for the selected row */}
            {expandedLog && (
              <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <JsonViewer data={expandedLog.beforeValue} label="Before" />
                  <JsonViewer data={expandedLog.afterValue} label="After" />
                </div>
                {expandedLog.ipAddress && (
                  <p className="text-xs text-muted-foreground mt-3">
                    IP Address: <code className="font-mono">{expandedLog.ipAddress}</code>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
