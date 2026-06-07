import { useState } from "react";
import { 
  useListRoles, 
  useCreateRole, 
  useListRolePermissions, 
  useAddRolePermission, 
  useRemoveRolePermission,
  getListRolesQueryKey,
  getListRolePermissionsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Shield, Plus, Trash2, ShieldCheck, Check, Search, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
        data: { name: newRoleName.trim(), description: newRoleDescription.trim() || undefined }
      });
      queryClient.invalidateQueries({ queryKey: getListRolesQueryKey() });
      setIsCreateRoleOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
      toast({ title: "Role created" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create", description: err.message });
    }
  };

  const selectedRole = rolesData?.data?.find(r => r.id === selectedRoleId);

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-2">Manage access control and capabilities.</p>
        </div>
        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Role Name</Label>
                <Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g. Clinical Lead" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input value={newRoleDescription} onChange={(e) => setNewRoleDescription(e.target.value)} placeholder="Brief description" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateRole} disabled={createRole.isPending || !newRoleName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Roles List */}
        <Card className="w-1/3 flex flex-col min-h-0">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-lg">Roles</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {isLoadingRoles ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : rolesData?.data?.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No roles found.</div>
            ) : (
              <div className="divide-y divide-border">
                {rolesData?.data?.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedRoleId === role.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${selectedRoleId === role.id ? "text-primary" : "text-muted-foreground"}`} />
                        {role.name}
                      </div>
                      {role.isSystem && <Badge variant="secondary" className="text-[10px]">System</Badge>}
                    </div>
                    {role.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 ml-6">{role.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions Panel */}
        <Card className="flex-1 flex flex-col min-h-0">
          {selectedRole ? (
            <PermissionsManager role={selectedRole} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center h-full">
              <ShieldCheck className="w-12 h-12 mb-4 text-muted-foreground/30" />
              <p className="text-lg font-medium">Select a role</p>
              <p className="text-sm">Choose a role from the list to manage its permissions</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Map of common resources and actions in the system for the UI
const RESOURCES = [
  "patients", "users", "roles", "clinics", "programs", "areas", "assignments", "communications", "journeys"
];

const ACTIONS = [
  "create", "read", "update", "delete", "manage"
];

function PermissionsManager({ role }: { role: { id: string; name: string; isSystem?: boolean | null; description?: string | null } }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const permissionsKey = getListRolePermissionsQueryKey(role.id);
  const { data, isLoading } = useListRolePermissions(role.id, { query: { queryKey: permissionsKey } });
  const addPermission = useAddRolePermission();
  const removePermission = useRemoveRolePermission();

  const [resource, setResource] = useState(RESOURCES[0]);
  const [action, setAction] = useState(ACTIONS[0]);

  const handleAdd = async () => {
    try {
      await addPermission.mutateAsync({
        id: role.id,
        data: { resource, action }
      });
      queryClient.invalidateQueries({ queryKey: permissionsKey });
      toast({ title: "Permission added" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to add", description: err.message });
    }
  };

  const handleRemove = async (permissionId: string) => {
    try {
      await removePermission.mutateAsync({ id: role.id, permissionId });
      queryClient.invalidateQueries({ queryKey: permissionsKey });
      toast({ title: "Permission removed" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to remove", description: err.message });
    }
  };

  const hasFullAccess = data?.data?.some(p => p.resource === "*" && p.action === "*");

  return (
    <>
      <CardHeader className="pb-4 border-b border-border shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{role.name} Permissions</CardTitle>
            <CardDescription className="mt-1">{role.description || "Manage access to resources for this role"}</CardDescription>
          </div>
          {role.isSystem && (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              System predefined role
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex flex-col h-full overflow-hidden">
        {hasFullAccess && (
          <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-primary">Full System Access</h4>
              <p className="text-sm text-primary/80">This role has unrestricted access (`*` on `*`). Individual permissions are bypassed.</p>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div className="space-y-2">
            <Label>Resource</Label>
            <select 
              value={resource} 
              onChange={e => setResource(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="*">All Resources (*)</option>
              {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Action</Label>
            <select 
              value={action} 
              onChange={e => setAction(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="*">All Actions (*)</option>
              {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <Button onClick={handleAdd} disabled={addPermission.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>

        <div className="font-medium text-sm text-muted-foreground mb-3">Active Rules ({data?.data?.length || 0})</div>
        
        <div className="flex-1 overflow-y-auto min-h-0 border rounded-md">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading permissions...</div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground h-full">
              <ShieldOff className="w-8 h-8 mb-2 opacity-20" />
              No permissions granted
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.data.map(p => (
                <div key={p.id} className="p-3 flex items-center justify-between hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono font-medium">
                      {p.action}
                    </div>
                    <span className="text-sm text-muted-foreground">on</span>
                    <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-mono font-medium">
                      {p.resource}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(p.id)}
                    disabled={removePermission.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </>
  );
}
