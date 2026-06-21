import { useState, useMemo, useEffect } from "react";
import { useListTasks, getListTasksQueryKey, useUpdateTask, useCreateTask, useGetMe, useListPatients, useListUsers } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, User, Clock, ChevronLeft, ChevronRight, PlusCircle, CheckCircle, AlertCircle, Search, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  PENDING: { label: "To Do", class: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20" },
  IN_PROGRESS: { label: "In Progress", class: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
  COMPLETED: { label: "Done", class: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  OVERDUE: { label: "Overdue", class: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
};

const PRIORITY_CONFIG: Record<string, { label: string; icon: any; class: string }> = {
  LOW: { label: "Low", icon: CheckCircle, class: "text-slate-500" },
  MEDIUM: { label: "Medium", icon: Clock, class: "text-amber-500" },
  HIGH: { label: "High", icon: AlertCircle, class: "text-red-500" },
};

const PAGE_SIZE = 20;

export default function TasksPage() {
  const { data: me } = useGetMe();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<any>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", description: "", patientId: "", assignedTo: "", priority: "MEDIUM", dueDate: "" });

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: patientsData, isLoading: patientsLoading } = useListPatients({ limit: 1000 });
  const patientOptions = useMemo(() => (patientsData?.data ?? []).map(p => ({ label: `${p.firstName} ${p.lastName}`, value: p.id })), [patientsData]);

  const { data: usersData, isLoading: usersLoading } = useListUsers({ limit: 1000 });
  const userOptions = useMemo(() => (usersData?.data ?? []).map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id })), [usersData]);

  const queryParams: Record<string, any> = {
    page,
    limit: PAGE_SIZE,
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
  };
  const tasksKey = getListTasksQueryKey(queryParams);

  const { data: tasksData, isLoading } = useListTasks(
    queryParams,
    { query: { enabled: !!me, queryKey: tasksKey } }
  );

  const updateMutation = useUpdateTask();
  const createMutation = useCreateTask();

  const handleStatusUpdate = async (taskId: string, newStatus: any) => {
    setUpdatingTaskId(taskId);
    try {
      await updateMutation.mutateAsync({
        id: taskId,
        data: { status: newStatus }
      });
      queryClient.invalidateQueries({ queryKey: tasksKey });
      toast({ title: `Task updated to ${newStatus}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleCreate = async () => {
    if (!createForm.title || !createForm.patientId || !createForm.assignedTo || !createForm.dueDate) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill all required fields." });
      return;
    }
    try {
      await createMutation.mutateAsync({
        data: {
          title: createForm.title,
          description: createForm.description || undefined,
          patientId: createForm.patientId,
          assignedTo: createForm.assignedTo,
          priority: createForm.priority as any,
          dueDate: new Date(createForm.dueDate).toISOString()
        }
      });
      queryClient.invalidateQueries({ queryKey: tasksKey });
      setIsCreateOpen(false);
      setCreateForm({ title: "", description: "", patientId: "", assignedTo: "", priority: "MEDIUM", dueDate: "" });
      toast({ title: "Task created successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create", description: err.message });
    }
  };

  const allTasks = tasksData?.data ?? [];
  const totalPages = tasksData?.meta ? Math.ceil(tasksData.meta.total / PAGE_SIZE) : 1;
  const paginated = allTasks;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage clinical and administrative tasks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby={undefined} className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="grid gap-2">
                    <Label>Title <span className="text-destructive">*</span></Label>
                    <Input value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} placeholder="Task title..." />
                  </div>
                  <div className="grid gap-2">
                    <Label>Patient <span className="text-destructive">*</span></Label>
                    <SearchableSelect
                      options={patientOptions}
                      value={createForm.patientId}
                      onValueChange={v => setCreateForm({...createForm, patientId: v})}
                      placeholder="Select a patient..."
                      searchPlaceholder="Search patients..."
                      isLoading={patientsLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Assignee <span className="text-destructive">*</span></Label>
                    <SearchableSelect
                      options={userOptions}
                      value={createForm.assignedTo}
                      onValueChange={v => setCreateForm({...createForm, assignedTo: v})}
                      placeholder="Select assignee..."
                      searchPlaceholder="Search staff..."
                      isLoading={usersLoading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Priority <span className="text-destructive">*</span></Label>
                      <Select value={createForm.priority} onValueChange={v => setCreateForm({...createForm, priority: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Due Date <span className="text-destructive">*</span></Label>
                      <Input type="date" value={createForm.dueDate} onChange={e => setCreateForm({...createForm, dueDate: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} placeholder="Additional details..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending || !createForm.title || !createForm.patientId || !createForm.assignedTo || !createForm.dueDate}>
                    {createMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-2 -my-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-44 bg-card">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Done</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>
          {tasksData?.meta && (
            <span className="text-sm text-muted-foreground">{tasksData.meta.total} task{tasksData.meta.total !== 1 ? "s" : ""}</span>
          )}
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-1 p-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <CheckSquare className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No tasks found</p>
                <p className="text-sm mt-1">{filterStatus ? "Try changing the status filter" : "You have no tasks"}</p>
              </div>
            ) : (
              <>
                <div className="max-h-[62vh] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((task) => {
                        const statusCfg = STATUS_CONFIG[task.status] ?? { label: task.status, class: "bg-muted text-muted-foreground" };
                        const priorityCfg = PRIORITY_CONFIG[task.priority] ?? { label: task.priority, icon: AlertCircle, class: "" };
                        const PriorityIcon = priorityCfg.icon;

                        return (
                          <TableRow key={task.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell>
                              <div className="font-medium text-sm">{task.title}</div>
                              {task.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className={cn("flex items-center gap-1.5 text-xs font-medium", priorityCfg.class)}>
                                <PriorityIcon className="w-3.5 h-3.5" />
                                {priorityCfg.label}
                              </div>
                            </TableCell>
                            <TableCell>
                              {task.patient ? (
                                <Link href={`/patients/${task.patientId}`}>
                                  <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                                    {task.patient.firstName} {task.patient.lastName}
                                  </span>
                                </Link>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <User className="w-3.5 h-3.5 shrink-0" />
                                {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                              {(task as any).dueDate
                                ? <span className={cn(new Date((task as any).dueDate) < new Date() && task.status !== "COMPLETED" ? "text-destructive font-medium" : "")}>
                                    {format(new Date((task as any).dueDate), "MMM d, yyyy")}
                                  </span>
                                : "—"
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("text-xs font-medium", statusCfg.class)}>
                                {statusCfg.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {task.status !== "COMPLETED" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStatusUpdate(task.id, task.status === "PENDING" ? "IN_PROGRESS" : "COMPLETED")}
                                  className="h-8 text-xs"
                                  disabled={updatingTaskId === task.id}
                                >
                                  {updatingTaskId === task.id
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : task.status === "PENDING" ? "Start" : "Complete"
                                  }
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                        <ChevronLeft className="w-4 h-4" />Prev
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                        Next<ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
