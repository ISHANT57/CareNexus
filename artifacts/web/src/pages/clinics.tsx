import { useState, useEffect, useMemo } from "react";
import {
  useListClinics,
  useCreateClinic,
  useUpdateClinic,
  useDeleteClinic,
  getListClinicsQueryKey,
  useListAreas,
  useListTenants,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/lib/ui-helpers";
import { BuildingsIllustration } from "@/components/ui/illustrations";
import { Building2, Plus, Pencil, Trash2, Search, X, Phone, Mail, MapPin, Download } from "lucide-react";
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
import { EmptyState } from "@/components/ui/empty-state";
import { exportToCSV } from "@/lib/utils";
import { useTenantContext } from "@/contexts/TenantContext";
const PAGE_SIZE = 20;

interface ClinicFormState {
  tenantId: string;
  name: string;
  areaId: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

const EMPTY_FORM: ClinicFormState = { tenantId: "", name: "", areaId: "", address: "", city: "", phone: "", email: "" };

export default function ClinicsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterTenant, setFilterTenant] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const { activeTenantId } = useTenantContext();
  const isScopedToTenant = activeTenantId !== "ALL";

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [filterArea, filterTenant]);

  const { data: tenantsData, isLoading: tenantsLoading } = useListTenants(
    { limit: 500 },
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );

  // Area filter options scope to the active tenant (or all tenants in Platform View),
  // inheriting the switcher's x-tenant-id from the global API client.
  const { data: areasData, isLoading: areasLoading } = useListAreas(
    { limit: 500, tenantId: filterTenant || undefined } as any,
  );

  // Main clinic list inherits the active tenant: a specific tenant shows only its own
  // clinics; "Platform View" shows all tenants' clinics.
  const { data, isLoading } = useListClinics(
    {
      page,
      limit: PAGE_SIZE,
      tenantId: filterTenant || undefined,
      areaId: filterArea || undefined,
    } as any,
  );

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createClinic = useCreateClinic({ request: { headers: { "x-tenant-id": "ALL" } } });
  const updateClinic = useUpdateClinic({ request: { headers: { "x-tenant-id": "ALL" } } });
  const deleteClinic = useDeleteClinic({ request: { headers: { "x-tenant-id": "ALL" } } });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ClinicFormState>(EMPTY_FORM);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editForm, setEditForm] = useState<ClinicFormState>(EMPTY_FORM);

  const { data: allAreasData, isLoading: allAreasLoading } = useListAreas(
    { limit: 1000 },
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );

  const { data: allClinicsData, isLoading: allClinicsLoading } = useListClinics(
    { limit: 1000 },
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );

  const tenantOptions = useMemo(() => (tenantsData?.data ?? []).map((t: any) => ({ label: t.name, value: t.id })), [tenantsData]);
  const areaOptions = useMemo(() => (areasData?.data ?? []).map((a: any) => ({ label: a.name, value: a.id })), [areasData]);

  // Options for Area dropdown in Create/Edit forms (only areas belonging to selected tenant)
  const createFormAreaOptions = useMemo(() => {
    if (!createForm.tenantId || !allAreasData?.data) return [];
    const tenantAreas = allAreasData.data.filter((a: any) => a.tenantId === createForm.tenantId);
    return tenantAreas.map((a: any) => ({ label: a.name, value: a.id }));
  }, [allAreasData, createForm.tenantId]);

  const editFormAreaOptions = useMemo(() => {
    if (!editForm.tenantId || !allAreasData?.data) return [];
    const tenantAreas = allAreasData.data.filter((a: any) => a.tenantId === editForm.tenantId);
    return tenantAreas.map((a: any) => ({ label: a.name, value: a.id }));
  }, [allAreasData, editForm.tenantId]);

  // Options for Clinic Name dropdown in Create/Edit forms (filtered by selected area name)
  const getClinicOptionsForAreaId = (areaId: string) => {
    if (!areaId || !allAreasData?.data) return [];
    const area = allAreasData.data.find((a: any) => a.id === areaId);
    if (!area) return [];
    const clinicsForArea = allClinicsData?.data?.filter((c: any) => c.area?.name === area.name) ?? [];
    const uniqueClinicNames = Array.from(new Set(clinicsForArea.map((c: any) => c.name)));
    return uniqueClinicNames.map((name) => ({ label: name as string, value: name as string })).sort((a, b) => a.label.localeCompare(b.label));
  };

  const createFormClinicOptions = useMemo(() => getClinicOptionsForAreaId(createForm.areaId), [allAreasData, allClinicsData, createForm.areaId]);
  const editFormClinicOptions = useMemo(() => getClinicOptionsForAreaId(editForm.areaId), [allAreasData, allClinicsData, editForm.areaId]);


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
      tenantId: clinic.tenantId ?? clinic.area?.tenantId ?? "",
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
      setEditForm(EMPTY_FORM);
      toast({ title: "Clinic updated successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to update clinic", description: err.message });
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteClinic.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListClinicsQueryKey() });
      toast({ title: "Clinic deleted successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete clinic", description: err.message });
    }
  };

  const ClinicFormFields = ({
    form,
    onChange,
    showArea = true,
    tenantLocked = false,
    areaOptions,
    areasLoading,
    clinicOptions,
    clinicsLoading,
  }: {
    form: ClinicFormState;
    onChange: (f: ClinicFormState) => void;
    showArea?: boolean;
    tenantLocked?: boolean;
    areaOptions: { label: string; value: string }[];
    areasLoading: boolean;
    clinicOptions: { label: string; value: string }[];
    clinicsLoading: boolean;
  }) => (
    <div className="grid gap-6 py-4 max-h-[65vh] overflow-y-auto pr-1">
      {/* Location Hierarchy Section */}
      <div className="space-y-4 p-4 border border-border/50 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Location Hierarchy
        </h3>
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Hospital / Tenant <span className="text-destructive">*</span></Label>
          <SearchableSelect
            options={tenantOptions}
            value={form.tenantId}
            onValueChange={(v) => onChange({ ...form, tenantId: v, areaId: "", name: "" })}
            placeholder="Select hospital..."
            searchPlaceholder="Search hospitals..."
            isLoading={tenantsLoading}
            disabled={tenantLocked}
          />
        </div>
        {showArea && (
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Area <span className="text-destructive">*</span></Label>
            <SearchableSelect
              options={areaOptions}
              value={form.areaId}
              onValueChange={(v) => onChange({ ...form, areaId: v, name: "" })}
              placeholder={form.tenantId ? "Select an area..." : "Select hospital first..."}
              searchPlaceholder="Search areas..."
              isLoading={areasLoading}
              disabled={!form.tenantId}
            />
            <p className="text-xs text-muted-foreground">
              {areaOptions.length} areas available
            </p>
          </div>
        )}
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Clinic Name <span className="text-destructive">*</span></Label>
          <SearchableSelect
            options={clinicOptions}
            value={form.name}
            onValueChange={(v) => onChange({ ...form, name: v })}
            placeholder={form.areaId ? "Select a clinic..." : "Select area first..."}
            searchPlaceholder="Search master clinics..."
            isLoading={clinicsLoading}
            disabled={!form.areaId}
          />
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="space-y-4 p-4 border border-border/50 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-sm text-primary mb-2">Contact Information</h3>
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
    </div>
  );

  const handleExport = () => {
    if (!filteredClinics.length) {
      toast({ title: "No data", description: "There are no clinics to export." });
      return;
    }
    const exportData = filteredClinics.map((c: any) => ({
      ID: c.id,
      "Clinic Name": c.name,
      "Area Name": c.area?.name || "N/A",
      Address: c.address || "N/A",
      City: c.city || "N/A",
      Phone: c.phone || "N/A",
      Email: c.email || "N/A"
    }));
    exportToCSV(exportData, `clinics_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div>
      <div className="border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-1">Clinical Locations</p>
              <h1 className="text-xl font-semibold tracking-tight">Clinics</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{data?.meta?.total?.toLocaleString() ?? "—"} clinic locations across all areas.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !filteredClinics.length}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (open && isScopedToTenant) setCreateForm({ ...EMPTY_FORM, tenantId: activeTenantId });
                else if (!open) setCreateForm(EMPTY_FORM);
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Clinic
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Clinic</DialogTitle>
              </DialogHeader>
              <ClinicFormFields
                form={createForm}
                onChange={setCreateForm}
                tenantLocked={isScopedToTenant}
                areaOptions={createFormAreaOptions}
                areasLoading={allAreasLoading}
                clinicOptions={createFormClinicOptions}
                clinicsLoading={allClinicsLoading}
              />
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
        </div>
      </div>
      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Clinic</DialogTitle>
          </DialogHeader>
          <ClinicFormFields
            form={editForm}
            onChange={setEditForm}
            showArea={false}
            areaOptions={editFormAreaOptions}
            areasLoading={allAreasLoading}
            clinicOptions={editFormClinicOptions}
            clinicsLoading={allClinicsLoading}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditClinic} disabled={updateClinic.isPending || !editForm.name.trim()}>
              {updateClinic.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="page-container animate-in-up pt-6 pb-12 space-y-4">
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
              <EmptyState
                illustration={<BuildingsIllustration />}
                icon={Building2}
                title={search || filterArea ? "No clinics match your filters" : "No clinics found"}
                description={
                  search || filterArea
                    ? "Try adjusting your search or area filter to see more results."
                    : "Create your first clinic to start managing care locations."
                }
                className="border-0 bg-transparent rounded-none"
              />
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
                                      Are you sure you want to delete "{clinic.name}"? This action cannot be undone and will affect all users assigned to this clinic.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => confirmDelete(clinic.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
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
                </div>

                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={data?.meta?.total ?? 0}
                  onPageChange={setPage}
                  noun="clinics"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
