import { useState, useEffect, useMemo } from "react";
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
import { Building2, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Search, X, Phone, Mail, MapPin } from "lucide-react";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [filterArea]);

  const { data, isLoading } = useListClinics({ page, limit: PAGE_SIZE });
  // Fetch ALL areas (no page limit) — FIX for BUG-002
  const { data: areasData, isLoading: areasLoading } = useListAreas({ limit: 500 });
  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createClinic = useCreateClinic();
  const updateClinic = useUpdateClinic();
  const deleteClinic = useDeleteClinic();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ClinicFormState>(EMPTY_FORM);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editForm, setEditForm] = useState<ClinicFormState>(EMPTY_FORM);

  const areaOptions = useMemo(
    () => (areasData?.data ?? []).map((a: any) => ({ value: a.id, label: a.name })),
    [areasData]
  );

  // Client-side filter for name search + area (API search not always available for clinics)
  const filteredClinics = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((clinic) => {
      const matchSearch = !debouncedSearch ||
        clinic.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (clinic.address ?? "").toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchArea = !filterArea || (clinic.area as any)?.id === filterArea;
      return matchSearch && matchArea;
    });
  }, [data?.data, debouncedSearch, filterArea]);

  const handleCreateClinic = async () => {
    if (!createForm.name.trim() || !createForm.areaId) {
      toast({ variant: "destructive", title: "Clinic Name and Area are required" });
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
      areaId: clinic.area?.id ?? "",
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
    <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid gap-2">
        <Label className="text-sm font-medium">Clinic Name <span className="text-destructive">*</span></Label>
        <Input
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="e.g. City General Clinic"
        />
      </div>
      {showArea && (
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Area <span className="text-destructive">*</span></Label>
          <SearchableSelect
            options={areaOptions}
            value={form.areaId}
            onValueChange={(v) => onChange({ ...form, areaId: v })}
            placeholder="Select an area..."
            searchPlaceholder="Search 195 areas..."
            isLoading={areasLoading}
          />
          <p className="text-xs text-muted-foreground">
            All {areasData?.meta?.total ?? areaOptions.length} areas available
          </p>
        </div>
      )}
      <div className="grid gap-2">
        <Label className="text-sm font-medium">Address</Label>
        <Input
          value={form.address}
          onChange={(e) => onChange({ ...form, address: e.target.value })}
          placeholder="Street address"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label className="text-sm font-medium">City</Label>
          <Input
            value={form.city}
            onChange={(e) => onChange({ ...form, city: e.target.value })}
            placeholder="City"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => onChange({ ...form, phone: e.target.value })}
            placeholder="+44 000 000 0000"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label className="text-sm font-medium">Email</Label>
        <Input
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
          type="email"
          placeholder="contact@clinic.nhs.uk"
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clinics</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {data?.meta?.total?.toLocaleString() ?? "—"} clinic locations across all areas.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
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
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); setCreateForm(EMPTY_FORM); }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClinic}
                  disabled={createClinic.isPending || !createForm.name.trim() || !createForm.areaId}
                >
                  {createClinic.isPending ? "Creating..." : "Create Clinic"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Clinic</DialogTitle>
          </DialogHeader>
          <ClinicFormFields form={editForm} onChange={setEditForm} showArea={false} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditClinic} disabled={updateClinic.isPending || !editForm.name.trim()}>
              {updateClinic.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-8 space-y-4">
        {/* Search + filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clinics by name or address..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-64">
            <SearchableSelect
              options={areaOptions}
              value={filterArea}
              onValueChange={(v) => { setFilterArea(v); setPage(1); }}
              placeholder="Filter by area..."
              searchPlaceholder="Search areas..."
              isLoading={areasLoading}
              clearable
            />
          </div>
          {(filterArea || search) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterArea(""); setSearch(""); }} className="text-muted-foreground gap-1">
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}
          {filteredClinics.length !== data?.data?.length && (
            <Badge variant="secondary" className="ml-auto">
              {filteredClinics.length} shown
            </Badge>
          )}
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-16">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Building2 className="w-10 h-10 animate-pulse opacity-30" />
                  <p className="text-sm">Loading clinics...</p>
                </div>
              </div>
            ) : filteredClinics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Building2 className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No clinics found</p>
                <p className="text-sm mt-1">Try adjusting your search or area filter</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Clinic Name</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Area</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Contact</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Address</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClinics.map((clinic) => (
                        <TableRow key={clinic.id} data-testid={`row-clinic-${clinic.id}`} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Building2 className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <span className="font-medium text-sm">{clinic.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {clinic.area?.name ? (
                              <Badge variant="secondary" className="text-xs font-normal">
                                {clinic.area.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                              {(clinic as any).phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {(clinic as any).phone}
                                </div>
                              )}
                              {(clinic as any).email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {(clinic as any).email}
                                </div>
                              )}
                              {!(clinic as any).phone && !(clinic as any).email && "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {clinic.address ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground max-w-[220px]">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {clinic.address}{clinic.city ? `, ${clinic.city}` : ""}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
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
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Clinic</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{clinic.name}"? This action cannot be undone and will affect all associated patients and appointments.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteClinic(clinic.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Delete Clinic
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
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} · {data?.meta?.total?.toLocaleString()} clinics
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                        <ChevronLeft className="w-4 h-4" />
                        Prev
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
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
    </div>
  );
}
