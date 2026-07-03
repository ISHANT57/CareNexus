import { useState, useMemo } from "react";
import {
  useListAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
  getListAreasQueryKey,
  useListTenants,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Map, Plus, Pencil, Trash2, Search, Building2, Download } from "lucide-react";
import { Pagination } from "@/lib/ui-helpers";
import { MapIllustration } from "@/components/ui/illustrations";
import { Button } from "@/components/ui/button";
import { cn, exportToCSV } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTenantContext } from "@/contexts/TenantContext";

const PAGE_SIZE = 20;

export default function AreasPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { activeTenantId } = useTenantContext();
  const isScopedToTenant = activeTenantId !== "ALL";
  // Main list inherits the active tenant from the switcher (global x-tenant-id getter):
  // a specific tenant shows only its own areas; "Platform View" shows all tenants' areas.
  const { data, isLoading } = useListAreas(
    { page, limit: PAGE_SIZE },
  );
  const { data: tenantsData, isLoading: tenantsLoading } = useListTenants(
    { limit: 500 },
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );

  const { data: allAreasData, isLoading: allAreasLoading } = useListAreas(
    { limit: 1000 },
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );
  
  const tenantOptions = useMemo(() => {
    return (tenantsData?.data ?? []).map((t: any) => ({ label: t.name, value: t.id }));
  }, [tenantsData]);

  const masterAreaOptions = useMemo(() => {
    const uniqueNames = Array.from(new Set((allAreasData?.data ?? []).map((a: any) => a.name)));
    return uniqueNames.map(name => ({ label: name as string, value: name as string })).sort((a, b) => a.label.localeCompare(b.label));
  }, [allAreasData]);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createArea = useCreateArea({ request: { headers: { "x-tenant-id": "ALL" } } });
  const updateArea = useUpdateArea({ request: { headers: { "x-tenant-id": "ALL" } } });
  const deleteArea = useDeleteArea({ request: { headers: { "x-tenant-id": "ALL" } } });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAreaTenantId, setNewAreaTenantId] = useState("");
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaDescription, setNewAreaDescription] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editTenantId, setEditTenantId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Memoized — only recomputes when data or search changes, not on dialog state changes
  const filteredAreas = useMemo(() =>
    (data?.data ?? []).filter((a) =>
      !search || a.name.toLowerCase().includes(search.toLowerCase())
    ),
    [data?.data, search]
  );

  const handleCreateArea = async () => {
    if (!newAreaName.trim() || !newAreaTenantId) { toast({ variant: "destructive", title: "Name and Tenant are required" }); return; }
    try {
      await createArea.mutateAsync({ data: { tenantId: newAreaTenantId, name: newAreaName.trim(), description: newAreaDescription.trim() || undefined } as any });
      queryClient.invalidateQueries({ queryKey: getListAreasQueryKey() });
      setIsCreateOpen(false); setNewAreaName(""); setNewAreaDescription(""); setNewAreaTenantId("");
      toast({ title: "Area created successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create area", description: err.message });
    }
  };

  const openEdit = (area: any) => {
    setEditId(area.id); setEditName(area.name); setEditDescription(area.description ?? ""); setEditTenantId(area.tenantId); setIsEditOpen(true);
  };

  const handleEditArea = async () => {
    if (!editName.trim() || !editTenantId) { toast({ variant: "destructive", title: "Name and Tenant are required" }); return; }
    try {
      await updateArea.mutateAsync({ id: editId, data: { tenantId: editTenantId, name: editName.trim(), description: editDescription.trim() || undefined } as any });
      queryClient.invalidateQueries({ queryKey: getListAreasQueryKey() });
      setIsEditOpen(false);
      toast({ title: "Area updated successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to update area", description: err.message });
    }
  };

  const handleDeleteArea = async (id: string) => {
    try {
      await deleteArea.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListAreasQueryKey() });
      toast({ title: "Area deleted" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete area", description: err.message });
    }
  };

  const handleExport = () => {
    if (!filteredAreas.length) {
      toast({ title: "No data", description: "There are no areas to export." });
      return;
    }
    const exportData = filteredAreas.map((a: any) => ({
      ID: a.id,
      "Area Name": a.name,
      Description: a.description || "N/A",
      "Created At": new Date(a.createdAt).toLocaleDateString("en-GB")
    }));
    exportToCSV(exportData, `areas_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div>
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-1">Service Geography</p>
              <h1 className="text-xl font-semibold tracking-tight">Geographic Areas</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{data?.meta?.total?.toLocaleString() ?? "—"} service regions managing clinics and patient assignments.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !filteredAreas.length}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
              <Dialog open={isCreateOpen} onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (open && isScopedToTenant) setNewAreaTenantId(activeTenantId);
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Area
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="max-w-sm">
              <DialogHeader><DialogTitle>Create New Area</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Tenant / Hospital <span className="text-destructive">*</span></Label>
                  <SearchableSelect
                    options={tenantOptions}
                    value={newAreaTenantId}
                    onValueChange={setNewAreaTenantId}
                    placeholder="Select a tenant..."
                    searchPlaceholder="Search tenants..."
                    isLoading={tenantsLoading}
                    disabled={isScopedToTenant}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Area Name <span className="text-destructive">*</span></Label>
                  <SearchableSelect
                    options={masterAreaOptions}
                    value={newAreaName}
                    onValueChange={setNewAreaName}
                    placeholder="Select an area..."
                    searchPlaceholder="Search master areas..."
                    isLoading={allAreasLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input value={newAreaDescription} onChange={(e) => setNewAreaDescription(e.target.value)} placeholder="Brief description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateArea} disabled={createArea.isPending || !newAreaName.trim() || !newAreaTenantId}>Create</Button>
              </DialogFooter>
            </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Area</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tenant / Hospital <span className="text-destructive">*</span></Label>
              <SearchableSelect
                options={tenantOptions}
                value={editTenantId}
                onValueChange={setEditTenantId}
                placeholder="Select a tenant..."
                searchPlaceholder="Search tenants..."
                isLoading={tenantsLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label>Area Name <span className="text-destructive">*</span></Label>
              <SearchableSelect
                options={masterAreaOptions}
                value={editName}
                onValueChange={setEditName}
                placeholder="Select an area..."
                searchPlaceholder="Search master areas..."
                isLoading={allAreasLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditArea} disabled={updateArea.isPending || !editName.trim() || !editTenantId}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="page-container animate-in-up pt-6 pb-12 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search areas..." className="pl-9 bg-card" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          {search && <Badge variant="secondary">{filteredAreas.length} shown</Badge>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : filteredAreas.length === 0 ? (
          <EmptyState
            illustration={<MapIllustration />}
            icon={Map}
            title={search ? "No areas match your search" : "No areas found"}
            description={
              search
                ? "Try a different name or clear the search to see all areas."
                : "Create your first geographic area to start organizing clinics and patient assignments."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAreas.map((area) => (
              <Card key={area.id} data-testid={`card-area-${area.id}`} className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Map className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(area)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Area</AlertDialogTitle>
                            <AlertDialogDescription>Delete "{area.name}"? This affects all clinics and patients in this area.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteArea(area.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight">{area.name}</h3>
                  {area.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{area.description}</p>
                  )}
                </CardContent>
                <CardFooter className="px-4 pb-4 pt-0">
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(area.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!search && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={data?.meta?.total ?? 0}
            onPageChange={setPage}
            noun="areas"
            className="px-0"
          />
        )}
      </div>
    </div>
  );
}
