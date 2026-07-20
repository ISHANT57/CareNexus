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
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { usePagination } from "@/hooks/use-pagination";
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
import { exportToCSV } from "@/lib/utils";
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
  const { page, pageSize, setPage } = usePagination(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterTenant, setFilterTenant] = useState("");
  const [filterArea, setFilterArea] = useState("");

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [filterArea, filterTenant]);

  const { data: tenantsData, isLoading: tenantsLoading } = useListTenants(
    { limit: 500 },
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );

  const { data: areasData, isLoading: areasLoading } = useListAreas(
    { limit: 500, tenantId: filterTenant || undefined } as any,
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );

  const { data, isLoading } = useListClinics(
    {
      page,
      limit: pageSize,
      tenantId: filterTenant || undefined,
      areaId: filterArea || undefined,
    } as any,
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );
  const totalPages = data?.meta ? Math.ceil(data.meta.total / pageSize) : 1;

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
    areaOptions,
    areasLoading,
    clinicOptions,
    clinicsLoading,
  }: {
    form: ClinicFormState;
    onChange: (f: ClinicFormState) => void;
    showArea?: boolean;
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
            creatable
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

  const columns: DataTableColumn<any>[] = [
    {
      key: "name",
      header: "Clinic Name",
      render: (clinic) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{clinic.name}</span>
        </div>
      ),
    },
    {
      key: "area",
      header: "Area",
      render: (clinic) =>
        clinic.area?.name ? (
          <Badge variant="secondary" className="text-xs font-medium bg-muted/50 border-border/50">
            {clinic.area.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (clinic) => (
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {clinic.phone && (
            <div className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-muted-foreground/70" />
              {clinic.phone}
            </div>
          )}
          {clinic.email && (
            <div className="flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
              {clinic.email}
            </div>
          )}
          {!clinic.phone && !clinic.email && "—"}
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (clinic) =>
        clinic.address ? (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-[220px]">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
            <span className="line-clamp-2 font-medium">
              {clinic.address}{clinic.city ? `, ${clinic.city}` : ""}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (clinic) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 bg-background border border-border shadow-sm hover:bg-primary hover:text-primary-foreground"
            onClick={() => openEdit(clinic)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 bg-background border border-border shadow-sm text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10">
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
      ),
    },
  ];

  return (
    <div className="page-container animate-in-up">
      <PageHeader
        title="Clinics"
        description={`${data?.meta?.total?.toLocaleString() ?? "—"} clinic locations across all areas.`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !filteredClinics.length}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
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
          </>
        }
      />
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

        {/* Table / Data Grid */}
        <Card className="overflow-hidden glass-card border-border/50 shadow-sm rounded-2xl">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredClinics}
              isLoading={isLoading}
              getRowKey={(clinic) => clinic.id}
              emptyState={
                <EmptyState
                  icon={Building2}
                  title="No clinics found"
                  description="Try adjusting your search query or area filter to see more results."
                  action={
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Clinic
                    </Button>
                  }
                />
              }
              pagination={{
                page,
                totalPages,
                totalLabel: `${data?.meta?.total?.toLocaleString() ?? 0} clinics`,
                onPageChange: setPage,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
