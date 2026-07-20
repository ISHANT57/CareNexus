import { useState, useMemo } from "react";
import {
  useListRoles,
  useCreateRole,
  useListRolePermissions,
  useAddRolePermission,
  useRemoveRolePermission,
  getListRolesQueryKey,
  getListRolePermissionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Shield, Plus, ShieldCheck, ShieldOff, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Resource groups with their actions and descriptions
const RESOURCE_GROUPS = [
  {
    group: "Clinical",
    color: "text-success",
    bgColor: "bg-success/10",
    resources: [
      { key: "patients", label: "Patients", description: "Patient records and demographics" },
      { key: "consultations", label: "Consultations", description: "Clinical consultation notes" },
      { key: "appointments", label: "Appointments", description: "Scheduling and attendance" },
      { key: "journeys", label: "Patient Journey", description: "Status transitions and events" },
      { key: "tasks", label: "Tasks", description: "Patient care tasks and actions" },
      { key: "outcomes", label: "Outcomes", description: "Clinical and lifestyle outcome tracking" },
    ],
  },
  {
    group: "Administration",
    color: "text-primary",
    bgColor: "bg-primary/10",
    resources: [
      { key: "users", label: "Team Members", description: "User accounts and profiles" },
      { key: "roles", label: "Roles", description: "Role definitions and assignments" },
      { key: "assignments", label: "Assignments", description: "Doctor-patient assignments" },
    ],
  },
  {
    group: "Organization",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    resources: [
      { key: "clinics", label: "Clinics", description: "Clinic locations and settings" },
      { key: "areas", label: "Areas", description: "Geographic area management" },
      { key: "programs", label: "Programs", description: "Clinical program pathways" },
    ],
  },
  {
    group: "Communications",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    resources: [
      { key: "communications", label: "SMS / Comms", description: "Patient communications" },
      { key: "notifications", label: "Notifications", description: "System notifications" },
    ],
  },
  {
    group: "System",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    resources: [
      { key: "audit_logs", label: "Audit Logs", description: "System audit trail access" },
      { key: "reports", label: "Reports", description: "Analytics and reporting" },
      { key: "files", label: "File Uploads", description: "Patient document management" },
    ],
  },
];

const ACTIONS = [
  { key: "create", label: "Create", short: "C" },
  { key: "read", label: "Read", short: "R" },
  { key: "update", label: "Update", short: "U" },
  { key: "delete", label: "Delete", short: "D" },
];

export default function RolesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: rolesData, isLoading: isLoadingRoles } = useListRoles();
  const createRole = useCreateRole();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast({ variant: "destructive", title: "Name is required" });
      return;
    }
    try {
      await createRole.mutateAsync({
        data: { name: newRoleName.trim(), description: newRoleDescription.trim() || undefined },
      });
      queryClient.invalidateQueries({ queryKey: getListRolesQueryKey() });
      setIsCreateRoleOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
      toast({ title: "Role created successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create role", description: err.message });
    }
  };

  const selectedRole = rolesData?.data?.find((r) => r.id === selectedRoleId);

  return (
    <div className="page-container animate-in-up flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <PageHeader
        className="shrink-0"
        title="Roles & Permissions"
        description="Define roles and configure granular access control for your team."
        actions={
          <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Role Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Clinical Lead"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateRole()}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Brief description of this role"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRole} disabled={createRole.isPending || !newRoleName.trim()}>
                  {createRole.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex-1 flex gap-6 min-h-0 pt-4">
        {/* Roles List */}
        <div className="w-64 shrink-0 flex flex-col">
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Roles ({rolesData?.data?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {isLoadingRoles ? (
                <div className="p-4 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                </div>
              ) : rolesData?.data?.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No roles configured.
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {rolesData?.data?.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={cn(
                        "w-full text-left px-3 py-3 rounded-lg transition-all border",
                        selectedRoleId === role.id
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-transparent hover:bg-muted/50 hover:border-border"
                      )}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{role.name}</span>
                        </div>
                        {role.isSystem && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[9px] shrink-0",
                              selectedRoleId === role.id && "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                            )}
                          >
                            System
                          </Badge>
                        )}
                      </div>
                      {role.description && (
                        <p className={cn(
                          "text-xs line-clamp-1 ml-6",
                          selectedRoleId === role.id ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {role.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Permissions Panel */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {selectedRole ? (
            <PermissionsMatrix role={selectedRole} />
          ) : (
            <Card className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <ShieldCheck className="w-16 h-16 mb-4 opacity-15" />
              <p className="text-lg font-medium">Select a role</p>
              <p className="text-sm mt-1 text-center max-w-xs">
                Choose a role from the list on the left to view and configure its permissions
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PermissionsMatrix({ role }: { role: { id: string; name: string; isSystem?: boolean | null; description?: string | null } }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const permissionsKey = getListRolePermissionsQueryKey(role.id);
  const { data, isLoading } = useListRolePermissions(role.id, { query: { queryKey: permissionsKey } });
  const addPermission = useAddRolePermission();
  const removePermission = useRemoveRolePermission();

  const [pendingOps, setPendingOps] = useState<Set<string>>(new Set());

  const grantedSet = useMemo(() => {
    const s = new Set<string>();
    data?.data?.forEach((p: any) => {
      s.add(`${p.resource}:${p.action}`);
      if (p.action === "*") {
        // Has wildcard — grant all
        RESOURCE_GROUPS.flatMap((g) => g.resources).forEach((r) => {
          ACTIONS.forEach((a) => s.add(`${r.key}:${a.key}`));
        });
      }
      if (p.resource === "*") {
        RESOURCE_GROUPS.flatMap((g) => g.resources).forEach((r) => {
          s.add(`${r.key}:${p.action}`);
        });
      }
    });
    return s;
  }, [data]);

  const hasFullAccess = data?.data?.some((p: any) => p.resource === "*" && p.action === "*");

  const findPermissionId = (resource: string, action: string) => {
    return data?.data?.find((p: any) =>
      (p.resource === resource && p.action === action) ||
      (p.resource === "*") ||
      (p.resource === resource && p.action === "*")
    )?.id;
  };

  const togglePermission = async (resource: string, action: string) => {
    const opKey = `${resource}:${action}`;
    const isGranted = grantedSet.has(opKey);

    setPendingOps((prev) => new Set(prev).add(opKey));
    try {
      if (isGranted) {
        // Find the exact or parent permission to remove
        const exactPermId = data?.data?.find(
          (p: any) => p.resource === resource && p.action === action
        )?.id;
        if (exactPermId) {
          await removePermission.mutateAsync({ id: role.id, permissionId: exactPermId });
        }
      } else {
        await addPermission.mutateAsync({ id: role.id, data: { resource, action } });
      }
      queryClient.invalidateQueries({ queryKey: permissionsKey });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to update permission", description: err.message });
    } finally {
      setPendingOps((prev) => {
        const next = new Set(prev);
        next.delete(opKey);
        return next;
      });
    }
  };

  const toggleAllForResource = async (resource: string) => {
    const allGranted = ACTIONS.every((a) => grantedSet.has(`${resource}:${a.key}`));
    for (const action of ACTIONS) {
      const opKey = `${resource}:${action.key}`;
      const isGranted = grantedSet.has(opKey);
      if (allGranted && isGranted) {
        const permId = data?.data?.find(
          (p: any) => p.resource === resource && p.action === action.key
        )?.id;
        if (permId) {
          await removePermission.mutateAsync({ id: role.id, permissionId: permId });
        }
      } else if (!allGranted && !isGranted) {
        await addPermission.mutateAsync({ id: role.id, data: { resource, action: action.key } });
      }
    }
    queryClient.invalidateQueries({ queryKey: permissionsKey });
  };

  return (
    <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <CardHeader className="pb-4 border-b border-border shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {role.name}
              {role.isSystem && (
                <Badge variant="outline" className="text-[10px] ml-1">System Role</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {role.description ?? "Configure granular access permissions for this role"}
            </CardDescription>
          </div>
          {hasFullAccess && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Full Access (wildcard)</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="p-6 overflow-x-auto">
           <div className="min-w-[680px] space-y-6">
            {/* Legend */}
            <div className="flex items-center gap-6 text-xs text-muted-foreground pb-2 border-b border-border">
              <span className="font-medium">Permissions Matrix</span>
              {ACTIONS.map((a) => (
                <span key={a.key} className="font-medium uppercase tracking-wider w-16 text-center">
                  {a.label}
                </span>
              ))}
              <span className="font-medium w-16 text-center">All</span>
            </div>

            {RESOURCE_GROUPS.map(({ group, color, bgColor, resources }) => (
              <div key={group}>
                <p className={cn("text-xs font-bold uppercase tracking-widest mb-3", color)}>
                  {group}
                </p>
                <div className="space-y-1.5">
                  {resources.map(({ key: resource, label, description }) => {
                    const allGranted = ACTIONS.every((a) => grantedSet.has(`${resource}:${a.key}`));
                    return (
                      <div
                        key={resource}
                        className={cn(
                          "flex items-center gap-6 px-4 py-3 rounded-lg border transition-colors",
                          allGranted ? `${bgColor} border-current/10` : "border-transparent hover:bg-muted/30"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        {ACTIONS.map((action) => {
                          const opKey = `${resource}:${action.key}`;
                          const granted = grantedSet.has(opKey);
                          const pending = pendingOps.has(opKey);
                          return (
                            <button
                              key={action.key}
                              onClick={() => togglePermission(resource, action.key)}
                              disabled={pending || hasFullAccess}
                              title={`${granted ? "Revoke" : "Grant"} ${action.label} on ${label}`}
                              className={cn(
                                "w-16 h-8 rounded-md border-2 flex items-center justify-center transition-all font-medium text-xs",
                                pending ? "opacity-50 cursor-wait" : "cursor-pointer",
                                granted
                                  ? "bg-primary border-primary text-primary-foreground hover:bg-primary/80"
                                  : "border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:text-primary"
                              )}
                            >
                              {pending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : granted ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <X className="w-3.5 h-3.5 opacity-30" />
                              )}
                            </button>
                          );
                        })}
                        {/* Toggle all for this resource */}
                        <button
                          onClick={() => toggleAllForResource(resource)}
                          disabled={hasFullAccess}
                          title={allGranted ? "Revoke all permissions" : "Grant all permissions"}
                          className={cn(
                            "w-16 h-8 rounded-md border-2 flex items-center justify-center transition-all text-xs font-semibold",
                            allGranted
                              ? "bg-success border-success text-success-foreground hover:bg-success/90"
                              : "border-dashed border-border text-muted-foreground hover:border-success hover:text-success"
                          )}
                        >
                          {allGranted ? "All ✓" : "All"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Raw permissions count */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {data?.data?.length ?? 0} permission rule{data?.data?.length !== 1 ? "s" : ""} configured
                {hasFullAccess && " · Wildcard grants full access"}
              </p>
            </div>
           </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
