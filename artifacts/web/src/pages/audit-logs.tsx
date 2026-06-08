import { useState } from "react";
import { useListAuditLogs } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const PAGE_SIZE = 50;

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListAuditLogs({ 
    page, 
    limit: PAGE_SIZE 
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">Comprehensive record of system activity and data access.</p>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            {data?.meta ? (
              <span className="text-sm text-muted-foreground">
                Showing {data.data.length} of {data.meta.total} logs
              </span>
            ) : <span />}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>
                <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
                  Page {page}
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex justify-center p-8">
               <Loader2 className="w-6 h-6 animate-spin text-primary" />
             </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No audit logs found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((log) => (
                  <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase font-mono text-[10px]">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.entity}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.entityId || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
