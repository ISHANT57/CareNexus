import { useState } from "react";
import { useListPrograms, useCreateProgram, useUpdateProgram, useDeleteProgram, getListProgramsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FolderGit2, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

export default function ProgramsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListPrograms({ page, limit: PAGE_SIZE });
  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const openCreate = () => { setName(""); setDescription(""); setIsCreateOpen(true); };
  const openEdit = (program: { id: string; name: string; description?: string | null }) => {
    setEditId(program.id);
    setName(program.name);
    setDescription(program.description ?? "");
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    if (!name.trim()) { toast({ variant: "destructive", title: "Name is required" }); return; }
    try {
      await createProgram.mutateAsync({ data: { name: name.trim(), description: description.trim() || undefined } });
      queryClient.invalidateQueries({ queryKey: getListProgramsQueryKey() });
      setIsCreateOpen(false);
      toast({ title: "Program created" });
    } catch (err: any) { toast({ variant: "destructive", title: "Failed to create", description: err.message }); }
  };

  const handleEdit = async () => {
    if (!name.trim()) { toast({ variant: "destructive", title: "Name is required" }); return; }
    try {
      await updateProgram.mutateAsync({ id: editId, data: { name: name.trim(), description: description.trim() || undefined } });
      queryClient.invalidateQueries({ queryKey: getListProgramsQueryKey() });
      setIsEditOpen(false);
      toast({ title: "Program updated" });
    } catch (err: any) { toast({ variant: "destructive", title: "Failed to update", description: err.message }); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProgram.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListProgramsQueryKey() });
      toast({ title: "Program deleted" });
    } catch (err: any) { toast({ variant: "destructive", title: "Failed to delete", description: err.message }); }
  };

  const ProgramFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Program Name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diabetes Management" />
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Programs</h1>
          <p className="text-muted-foreground mt-2">Care pathways and treatment programs.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Create Program</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Program</DialogTitle></DialogHeader>
            <ProgramFormFields />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createProgram.isPending || !name.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Program</DialogTitle></DialogHeader>
          <ProgramFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateProgram.isPending || !name.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground col-span-full">Loading programs...</div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg col-span-full">
            No programs found.
          </div>
        ) : (
          data.data.map((program) => (
            <Card key={program.id} data-testid={`card-program-${program.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-primary shrink-0" />
                  {program.name}
                </CardTitle>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(program)}>
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
                        <AlertDialogTitle>Delete Program</AlertDialogTitle>
                        <AlertDialogDescription>Delete "{program.name}"? This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(program.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {program.description || 'No description provided.'}
                </p>
                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                  Created {new Date(program.createdAt).toLocaleDateString()}
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
