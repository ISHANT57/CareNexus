import { useState, useMemo } from "react";
import { useListTasks, getListTasksQueryKey, useUpdateTask, useCreateTask, useGetMe, useListPatients, useListUsers } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, User, Clock, PlusCircle, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, getStatusConfig, type StatusTone } from "@/components/ui/status-badge";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";

// PRIORITY_CONFIG keeps the icon per priority (StatusBadge has no icon slot); the
// color now comes from the shared "taskPriority" tone instead of hardcoded classes.
const PRIORITY_CONFIG: Record<string, { label: string; icon: any }> = {
  LOW: { label: "Low", icon: CheckCircle },
  MEDIUM: { label: "Medium", icon: Clock },
  HIGH: { label: "High", icon: AlertCircle },
};

const TONE_TEXT_CLASS: Record<StatusTone, string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-primary",
  muted: "text-muted-foreground",
};

export default function TasksPage() {
  const { data: me } = useGetMe();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<any>("");
  const { page, pageSize, setPage } = usePagination(20);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", description: "", patientId: "", assignedTo: "", priority: "MEDIUM", dueDate: "" });

  const { data: patientsData, isLoading: patientsLoading } = useListPatients({ limit: 1000 }, { request: { headers: { "x-tenant-id": "ALL" } } });
  const patientOptions = useMemo(() => (patientsData?.data ?? []).map(p => ({ label: `${p.firstName} ${p.lastName}`, value: p.id })), [patientsData]);

  const { data: usersData, isLoading: usersLoading } = useListUsers({ limit: 1000 }, { request: { headers: { "x-tenant-id": "ALL" } } });
  const userOptions = useMemo(() => (usersData?.data ?? []).map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id })), [usersData]);

  const queryParams = filterStatus ? { status: filterStatus } : {};
  const tasksKey = getListTasksQueryKey(queryParams);

  const { data: tasksData, isLoading } = useListTasks(
    queryParams,
    { query: { enabled: !!me, queryKey: tasksKey } }
  );

  const updateMutation = useUpdateTask();
  const createMutation = useCreateTask();

  const handleStatusUpdate = async (taskId: string, newStatus: any) => {
    try {
      await updateMutation.mutateAsync({
        id: taskId,
        data: { status: newStatus }
      });
      queryClient.invalidateQueries({ queryKey: tasksKey });
      toast({ title: `Task updated to ${newStatus}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
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
  const totalPages = Math.max(1, Math.ceil(allTasks.length / pageSize));
  const paginated = allTasks.slice((page - 1) * pageSize, page * pageSize);

  const columns: DataTableColumn<any>[] = [
    {
      key: "title",
      header: "Title",
      render: (task) => (
        <>
          <div className="font-medium text-sm">{task.title}</div>
          {task.description && (
            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</div>
          )}
        </>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (task) => {
        const priorityCfg = PRIORITY_CONFIG[task.priority] ?? { label: task.priority, icon: AlertCircle };
        const PriorityIcon = priorityCfg.icon;
        const tone = getStatusConfig("taskPriority", task.priority).tone;
        return (
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", TONE_TEXT_CLASS[tone])}>
            <PriorityIcon className="w-3.5 h-3.5" />
            {priorityCfg.label}
          </div>
        );
      },
    },
    {
      key: "patient",
      header: "Patient",
      render: (task) =>
        task.patient ? (
          <Link href={`/patients/${task.patientId}`}>
            <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
              {task.patient.firstName} {task.patient.lastName}
            </span>
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "assignee",
      header: "Assignee",
      render: (task) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <User className="w-3.5 h-3.5 shrink-0" />
          {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (task) => <StatusBadge domain="task" status={task.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (task) =>
        task.status !== "COMPLETED" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleStatusUpdate(task.id, task.status === "PENDING" ? "IN_PROGRESS" : "COMPLETED")}
            className="h-8 text-xs"
          >
            {task.status === "PENDING" ? "Start" : "Complete"}
          </Button>
        ),
    },
  ];

  return (
    <div className="page-container animate-in-up">
      <PageHeader
        title="Tasks"
        description="Manage clinical and administrative tasks."
        actions={
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
        }
      />

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
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
          {filterStatus && (
            <Badge variant="secondary">{allTasks.length} shown</Badge>
          )}
        </div>

        <Card className="overflow-hidden border-border/50 shadow-sm rounded-2xl">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={paginated}
              isLoading={isLoading}
              getRowKey={(task) => task.id}
              emptyState={
                <EmptyState
                  icon={CheckSquare}
                  title="No tasks found"
                  description={filterStatus ? "Try changing the status filter" : "You have no tasks"}
                />
              }
              pagination={{
                page,
                totalPages,
                totalLabel: `${allTasks.length.toLocaleString()} total`,
                onPageChange: setPage,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
