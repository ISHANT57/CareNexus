import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTablePagination {
  page: number;
  totalPages: number;
  totalLabel?: string;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  skeletonRows?: number;
  emptyState: React.ReactNode;
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pagination?: DataTablePagination;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  skeletonRows = 5,
  emptyState,
  getRowKey,
  onRowClick,
  pagination,
}: DataTableProps<T>) {
  if (!isLoading && data.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-border/50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn("font-bold text-xs uppercase tracking-wider text-muted-foreground", col.headerClassName)}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-b-border/50">
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((row, index) => (
                <TableRow
                  key={getRowKey(row)}
                  className={cn(
                    "group hover:bg-primary/[0.02] transition-colors border-b-border/50 animate-in-up",
                    onRowClick && "cursor-pointer"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
            {pagination.totalLabel ? ` · ${pagination.totalLabel}` : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
