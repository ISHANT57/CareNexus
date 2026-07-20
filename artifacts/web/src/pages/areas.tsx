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
import { Map, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Search, Building2, Download } from "lucide-react";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { usePagination } from "@/hooks/use-pagination";

export default function AreasPage() {
  const { page, pageSize, setPage } = usePagination(20);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListAreas(
    { page, limit: pageSize },
    { request: { headers: { "x-tenant-id": "ALL" } } }
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

  const totalPages = data?.meta ? Math.ceil(data.meta.total / pageSize) : 1;
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
    <div className="page-container animate-in-up">
      <PageHeader
        title="Geographic Areas"
        description={`${data?.meta?.total?.toLocaleString() ?? "—"} service regions managing clinics and patient assignments.`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !filteredAreas.length}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
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
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Area Name <span className="text-destructive">*</span></Label>
                    <SearchableSelect
                      options={masterAreaOptions}
                      value={newAreaName}
                      onValueChange={setNewAreaName}
                      placeholder="Select or type an area..."
                      searchPlaceholder="Search or create areas..."
                      isLoading={allAreasLoading}
                      creatable
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
          </>
        }
      />

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
                placeholder="Select or type an area..."
                searchPlaceholder="Search or create areas..."
                isLoading={allAreasLoading}
                creatable
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

      <div className="p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search areas..." className="pl-10 bg-card" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          {search && <Badge variant="secondary">{filteredAreas.length} shown</Badge>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl bg-muted/40" />
            ))}
          </div>
        ) : filteredAreas.length === 0 ? (
          <div className="glass-card rounded-3xl border border-border/50">
            <EmptyState
              icon={Map}
              title="No geographic areas"
              description={search ? "No areas match your search." : "Define your first service region to start assigning clinics."}
              action={
                !search ? (
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Area
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAreas.map((area, index) => (
              <Card 
                key={area.id} 
                data-testid={`card-area-${area.id}`} 
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 glass-card rounded-2xl border border-border/60 hover:border-primary/30 animate-in-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                      <Map className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 bg-background border border-border shadow-sm hover:bg-primary hover:text-primary-foreground" onClick={() => openEdit(area)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 bg-background border border-border shadow-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
                  <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors">{area.name}</h3>
                  {area.description && (
                    <p className="text-sm font-medium text-muted-foreground mt-2 line-clamp-2">{area.description}</p>
                  )}
                </CardContent>
                <CardFooter className="px-4 pb-4 pt-0 mt-auto">
                  <div className="flex items-center w-full pt-4 border-t border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Created {new Date(area.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && !search && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
                <ChevronLeft className="w-4 h-4" />Prev
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
                Next<ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
