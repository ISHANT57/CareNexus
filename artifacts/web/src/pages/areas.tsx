import { useState } from "react";
import {
  useListAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
  getListAreasQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

export default function AreasPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListAreas({ page, limit: PAGE_SIZE });
  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createArea = useCreateArea();
  const updateArea = useUpdateArea();
  const deleteArea = useDeleteArea();

  // Create dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaDescription, setNewAreaDescription] = useState("");

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleCreateArea = async () => {
    if (!newAreaName.trim()) {
      toast({ variant: "destructive", title: "Name is required" });
      return;
    }
    try {
      await createArea.mutateAsync({
        data: { name: newAreaName.trim(), description: newAreaDescription.trim() || undefined },
      });
      queryClient.invalidateQueries({ queryKey: getListAreasQueryKey() });
      setIsCreateOpen(false);
      setNewAreaName("");
      setNewAreaDescription("");
      toast({ title: "Area created successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create area", description: err.message });
    }
  };

  const openEdit = (area: { id: string; name: string; description?: string | null }) => {
    setEditId(area.id);
    setEditName(area.name);
    setEditDescription(area.description ?? "");
    setIsEditOpen(true);
  };

  const handleEditArea = async () => {
    if (!editName.trim()) {
      toast({ variant: "destructive", title: "Name is required" });
      return;
    }
    try {
      await updateArea.mutateAsync({
        id: editId,
        data: { name: editName.trim(), description: editDescription.trim() || undefined },
      });
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
    <div className="p-8 space-y-6 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Geographic Areas</h1>
          <p className="text-muted-foreground mt-2">Service regions for clinics and patient assignment.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Area
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Area</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Area Name *</Label>
                <Input
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  placeholder="e.g. North Region"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description (optional)</Label>
                <Input
                  value={newAreaDescription}
                  onChange={(e) => setNewAreaDescription(e.target.value)}
                  placeholder="Brief description of the area"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateArea} disabled={createArea.isPending || !newAreaName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Area</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Area Name *</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. North Region"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description (optional)</Label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditArea} disabled={updateArea.isPending || !editName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground col-span-full">Loading areas...</div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg col-span-full">
            No areas found.
          </div>
        ) : (
          data.data.map((area) => (
            <Card key={area.id} data-testid={`card-area-${area.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary shrink-0" />
                  {area.name}
                </CardTitle>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => openEdit(area)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Area</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete "{area.name}"? This cannot be undone and will affect all clinics
                          and patients in this area.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteArea(area.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {area.description || "No description provided."}
                </p>
                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                  Created {new Date(area.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 p-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
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
        </div>
      )}
    </div>
  );
}
