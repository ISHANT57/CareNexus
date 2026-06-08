import { useState } from "react";
import {
  useListClinics,
  useCreateClinic,
  useUpdateClinic,
  useDeleteClinic,
  getListClinicsQueryKey,
  useListAreas,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

interface ClinicFormState {
  name: string;
  areaId: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

const EMPTY_FORM: ClinicFormState = { name: "", areaId: "", address: "", city: "", phone: "", email: "" };

export default function ClinicsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListClinics({ page, limit: PAGE_SIZE });
  const { data: areasData } = useListAreas();
  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createClinic = useCreateClinic();
  const updateClinic = useUpdateClinic();
  const deleteClinic = useDeleteClinic();

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ClinicFormState>(EMPTY_FORM);

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editForm, setEditForm] = useState<ClinicFormState>(EMPTY_FORM);

  const handleCreateClinic = async () => {
    if (!createForm.name.trim() || !createForm.areaId) {
      toast({ variant: "destructive", title: "Name and Area are required" });
      return;
    }
    try {
      await createClinic.mutateAsync({
        data: {
          name: createForm.name.trim(),
          areaId: createForm.areaId,
          address: createForm.address.trim() || undefined,
          city: createForm.city.trim() || undefined,
          phone: createForm.phone.trim() || undefined,
          email: createForm.email.trim() || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListClinicsQueryKey() });
      setIsCreateOpen(false);
      setCreateForm(EMPTY_FORM);
      toast({ title: "Clinic created successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create clinic", description: err.message });
    }
  };

  const openEdit = (clinic: any) => {
    setEditId(clinic.id);
    setEditForm({
      name: clinic.name ?? "",
      areaId: "", // areaId cannot be changed after creation (API limitation)
      address: clinic.address ?? "",
      city: clinic.city ?? "",
      phone: clinic.phone ?? "",
      email: clinic.email ?? "",
    });
    setIsEditOpen(true);
  };

  const handleEditClinic = async () => {
    if (!editForm.name.trim()) {
      toast({ variant: "destructive", title: "Name is required" });
      return;
    }
    try {
      await updateClinic.mutateAsync({
        id: editId,
        data: {
          name: editForm.name.trim(),
          // areaId is not in ClinicUpdate — area cannot be changed after creation
          address: editForm.address.trim() || undefined,
          city: editForm.city.trim() || undefined,
          phone: editForm.phone.trim() || undefined,
          email: editForm.email.trim() || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListClinicsQueryKey() });
      setIsEditOpen(false);
      toast({ title: "Clinic updated successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to update clinic", description: err.message });
    }
  };

  const handleDeleteClinic = async (id: string) => {
    try {
      await deleteClinic.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListClinicsQueryKey() });
      toast({ title: "Clinic deleted" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete clinic", description: err.message });
    }
  };

  const ClinicFormFields = ({
    form,
    onChange,
    showArea = true,
  }: {
    form: ClinicFormState;
    onChange: (f: ClinicFormState) => void;
    showArea?: boolean;
  }) => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
      <div className="grid gap-2">
        <Label>Clinic Name *</Label>
        <Input
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="e.g. City General Clinic"
        />
      </div>
      {showArea && (
        <div className="grid gap-2">
          <Label>Area *</Label>
          <Select value={form.areaId} onValueChange={(v) => onChange({ ...form, areaId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select an area" />
            </SelectTrigger>
            <SelectContent>
              {areasData?.data?.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid gap-2">
        <Label>Address</Label>
        <Input
          value={form.address}
          onChange={(e) => onChange({ ...form, address: e.target.value })}
          placeholder="Street address"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>City</Label>
          <Input
            value={form.city}
            onChange={(e) => onChange({ ...form, city: e.target.value })}
            placeholder="City"
          />
        </div>
        <div className="grid gap-2">
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => onChange({ ...form, phone: e.target.value })}
            placeholder="Phone number"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Email</Label>
        <Input
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
          type="email"
          placeholder="contact@clinic.com"
        />
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinics</h1>
          <p className="text-muted-foreground mt-2">Physical locations where care is delivered.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Clinic
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Clinic</DialogTitle>
            </DialogHeader>
            <ClinicFormFields form={createForm} onChange={setCreateForm} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateClinic}
                disabled={createClinic.isPending || !createForm.name.trim() || !createForm.areaId}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Clinic</DialogTitle>
          </DialogHeader>
          <ClinicFormFields form={editForm} onChange={setEditForm} showArea={false} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditClinic}
              disabled={updateClinic.isPending || !editForm.name.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading clinics...</div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border-b border-border">
              No clinics found.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic Name</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((clinic) => (
                    <TableRow key={clinic.id} data-testid={`row-clinic-${clinic.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {clinic.name}
                        </div>
                      </TableCell>
                      <TableCell>{clinic.area?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          {(clinic as any).phone && (
                            <div>{(clinic as any).phone}</div>
                          )}
                          {(clinic as any).email && <div>{(clinic as any).email}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {clinic.address ? `${clinic.address}${clinic.city ? `, ${clinic.city}` : ""}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openEdit(clinic)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Clinic</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete "{clinic.name}"? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteClinic(clinic.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
