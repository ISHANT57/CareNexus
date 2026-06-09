import { useState, useMemo, useCallback } from "react";
import {
  useListPrograms,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
  getListProgramsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FolderGit2, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 20;

const PROGRAM_COLORS = [
  "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
];

// ─── CRITICAL FIX: Defined OUTSIDE the component ─────────────────────────────
// Previously defined inside ProgramsPage(), which caused React to treat it as a
// new component type on every render, unmounting + remounting DOM inputs on every
// keystroke. Now it's a stable reference that React can reconcile normally.
interface ProgramFormFieldsProps {
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
}

function ProgramFormFields({ name, onNameChange, description, onDescriptionChange }: ProgramFormFieldsProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Program Name <span className="text-destructive">*</span></Label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Diabetes Management Programme"
          autoFocus
        />
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Brief description of this clinical program"
        />
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ProgramsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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

  const openCreate = useCallback(() => { setName(""); setDescription(""); setIsCreateOpen(true); }, []);
  const openEdit = useCallback((program: { id: string; name: string; description?: string | null }) => {
    setEditId(program.id); setName(program.name); setDescription(program.description ?? ""); setIsEditOpen(true);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) { toast({ variant: "destructive", title: "Name is required" }); return; }
    try {
      await createProgram.mutateAsync({ data: { name: name.trim(), description: description.trim() || undefined } });
      queryClient.invalidateQueries({ queryKey: getListProgramsQueryKey() });
      setIsCreateOpen(false);
      toast({ title: "Program created successfully" });
    } catch (err: any) { toast({ variant: "destructive", title: "Failed to create", description: err.message }); }
  }, [name, description, createProgram, queryClient, toast]);

  const handleEdit = useCallback(async () => {
    if (!name.trim()) { toast({ variant: "destructive", title: "Name is required" }); return; }
    try {
      await updateProgram.mutateAsync({ id: editId, data: { name: name.trim(), description: description.trim() || undefined } });
      queryClient.invalidateQueries({ queryKey: getListProgramsQueryKey() });
      setIsEditOpen(false);
      toast({ title: "Program updated successfully" });
    } catch (err: any) { toast({ variant: "destructive", title: "Failed to update", description: err.message }); }
  }, [name, description, editId, updateProgram, queryClient, toast]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteProgram.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListProgramsQueryKey() });
      toast({ title: "Program deleted" });
    } catch (err: any) { toast({ variant: "destructive", title: "Failed to delete", description: err.message }); }
  }, [deleteProgram, queryClient, toast]);

  // Memoized filtering — only recomputes when data or search changes
  const filteredPrograms = useMemo(() =>
    (data?.data ?? []).filter((p) =>
      !search || p.name.toLowerCase().includes(search.toLowerCase())
    ),
    [data?.data, search]
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clinical Programs</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {data?.meta?.total ? `${data.meta.total} ` : ""}Care pathways and treatment programs.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />Create Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Create New Program</DialogTitle></DialogHeader>
              <ProgramFormFields
                name={name}
                onNameChange={setName}
                description={description}
                onDescriptionChange={setDescription}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createProgram.isPending || !name.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Program</DialogTitle></DialogHeader>
          <ProgramFormFields
            name={name}
            onNameChange={setName}
            description={description}
            onDescriptionChange={setDescription}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateProgram.isPending || !name.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search programs..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          {search && <Badge variant="secondary">{filteredPrograms.length} shown</Badge>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <FolderGit2 className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">{search ? "No programs match your search" : "No programs yet"}</p>
            {!search && (
              <Button size="sm" className="mt-4" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />Create First Program
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrograms.map((program, index) => {
              const colorClass = PROGRAM_COLORS[index % PROGRAM_COLORS.length];
              return (
                <Card
                  key={program.id}
                  data-testid={`card-program-${program.id}`}
                  className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass.split(" ").slice(0, 2).join(" ")}`}>
                        <FolderGit2 className={`w-5 h-5 ${colorClass.split(" ").slice(2).join(" ")}`} />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                              <AlertDialogDescription>
                                Delete "{program.name}"? Patients enrolled in this program will lose their program assignment.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(program.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm">{program.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {program.description ?? "No description provided."}
                    </p>
                  </CardContent>
                  <CardFooter className="px-5 pb-4 pt-0 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(program.createdAt).toLocaleDateString("en-GB")}
                    </p>
                    {(program as any).enrollmentCount !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {(program as any).enrollmentCount} enrolled
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
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
