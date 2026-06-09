import { useState, useEffect } from "react";
import {
  useListAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
  getListAreasQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Map, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const PAGE_SIZE = 20;

export default function AreasPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListAreas({ page, limit: PAGE_SIZE });
  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createArea = useCreateArea();
  const updateArea = useUpdateArea();
  const deleteArea = useDeleteArea();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaDescription, setNewAreaDescription] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const filteredAreas = (data?.data ?? []).filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateArea = async () => {
    if (!newAreaName.trim()) { toast({ variant: "destructive", title: "Name is required" }); return; }
    try {
      await createArea.mutateAsync({ data: { name: newAreaName.trim(), description: newAreaDescription.trim() || undefined } });
      queryClient.invalidateQueries({ queryKey: getListAreasQueryKey() });
      setIsCreateOpen(false); setNewAreaName(""); setNewAreaDescription("");
      toast({ title: "Area created successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create area", description: err.message });
    }
  };

  const openEdit = (area: { id: string; name: string; description?: string | null }) => {
    setEditId(area.id); setEditName(area.name); setEditDescription(area.description ?? ""); setIsEditOpen(true);
  };

  const handleEditArea = async () => {
    if (!editName.trim()) { toast({ variant: "destructive", title: "Name is required" }); return; }
    try {
      await updateArea.mutateAsync({ id: editId, data: { name: editName.trim(), description: editDescription.trim() || undefined } });
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

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Geographic Areas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {data?.meta?.total?.toLocaleString() ?? "—"} service regions managing clinics and patient assignments.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" />Create Area</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Create New Area</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Area Name <span className="text-destructive">*</span></Label>
                  <Input value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} placeholder="e.g. North Mumbai Region" />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input value={newAreaDescription} onChange={(e) => setNewAreaDescription(e.target.value)} placeholder="Brief description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateArea} disabled={createArea.isPending || !newAreaName.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Area</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Area Name <span className="text-destructive">*</span></Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditArea} disabled={updateArea.isPending || !editName.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-8 space-y-4">
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
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Map className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">{search ? "No areas match your search" : "No areas found"}</p>
          </div>
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

        {totalPages > 1 && !search && (
          <div className="flex items-center justify-between pt-2">
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
      </div>
    </div>
  );
}
