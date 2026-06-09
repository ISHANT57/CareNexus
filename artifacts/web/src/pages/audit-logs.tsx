import { useState } from "react";
import { useListAuditLogs } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ScrollText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 50;

const ACTION_CONFIG: Record<string, { label: string; class: string; dotClass: string }> = {
  CREATE: {
    label: "Created",
    class: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  UPDATE: {
    label: "Updated",
    class: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  PATCH: {
    label: "Modified",
    class: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-400",
  },
  DELETE: {
    label: "Deleted",
    class: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    dotClass: "bg-red-500",
  },
};

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
  const actionLabel = ACTION_CONFIG[action]?.label ?? action;
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
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data, isLoading } = useListAuditLogs({
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;

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

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Immutable, append-only record of all system activity and data access.
            </p>
          </div>
          {data?.meta && (
            <Badge variant="secondary" className="text-sm px-3 py-1.5">
              {data.meta.total.toLocaleString()} total events
            </Badge>
          )}
        </div>
      </div>

      <div className="p-8 space-y-4">
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

        {/* Pagination top */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ScrollText className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No audit logs found</p>
                <p className="text-sm mt-1">
                  {activeFilterCount > 0 ? "Try clearing the filters" : "System events will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold text-xs uppercase tracking-wide w-4"></TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Timestamp</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Actor</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Event</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Entity</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Entity ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log: any) => {
                      const config = ACTION_CONFIG[log.action] ?? {
                        label: log.action,
                        class: "bg-muted text-muted-foreground border-border",
                        dotClass: "bg-muted-foreground",
                      };
                      const isExpanded = expandedRow === log.id;
                      const humanAction = humanizeAction(log.action, log.entity);

                      return (
                        <>
                          <TableRow
                            key={log.id}
                            data-testid={`row-log-${log.id}`}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isExpanded ? "bg-muted/50" : "hover:bg-muted/20"
                            )}
                            onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                          >
                            <TableCell className="w-4 pr-0">
                              <div className={cn("w-2 h-2 rounded-full", config.dotClass)} />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("text-xs font-medium", config.class)}>
                                  {config.label}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{humanAction}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs font-mono">
                                {ENTITY_LABELS[log.entity] ?? log.entity ?? "—"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                                  {log.entityId ?? "—"}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded detail row */}
                          {isExpanded && (
                            <TableRow key={`${log.id}-expanded`} className="bg-muted/30 hover:bg-muted/30">
                              <TableCell colSpan={6} className="p-0">
                                <div className="px-6 py-4 border-t border-border/50">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <JsonViewer data={log.beforeValue} label="Before" />
                                    <JsonViewer data={log.afterValue} label="After" />
                                  </div>
                                  {log.ipAddress && (
                                    <p className="text-xs text-muted-foreground mt-3">
                                      IP Address: <code className="font-mono">{log.ipAddress}</code>
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
