import { useState, useMemo, useCallback } from "react";
import {
  useListPrograms,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
  getListProgramsQueryKey,
  useListTenants,
  useListAreas,
  useListClinics,
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
import { FolderGit2, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Users, Building2, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn, exportToCSV } from "@/lib/utils";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { Filter, X } from "lucide-react";
import { Download } from "lucide-react";
import { useTenantContext } from "@/contexts/TenantContext";

const PAGE_SIZE = 20;

const PROGRAM_COLORS = [
  "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
];

interface ProgramFormFieldsProps {
  tenantId: string;
  onTenantIdChange: (v: string) => void;
  tenantOptions: { label: string; value: string }[];
  tenantsLoading: boolean;

  areaId: string;
  onAreaIdChange: (v: string) => void;
  areaOptions: { label: string; value: string }[];
  areasLoading: boolean;

  clinicId: string;
  onClinicIdChange: (v: string) => void;
  clinicOptions: { label: string; value: string }[];
  clinicsLoading: boolean;

  name: string;
  onNameChange: (v: string) => void;
  programOptions: { label: string; value: string }[];
  programsLoading: boolean;
  description: string;
  onDescriptionChange: (v: string) => void;
}

function ProgramFormFields({
  tenantId, onTenantIdChange, tenantOptions, tenantsLoading,
  areaId, onAreaIdChange, areaOptions, areasLoading,
  clinicId, onClinicIdChange, clinicOptions, clinicsLoading,
  name, onNameChange, programOptions, programsLoading, description, onDescriptionChange
}: ProgramFormFieldsProps) {
  return (
    <div className="grid gap-6 py-4 max-h-[65vh] overflow-y-auto pr-1">
      {/* Scope & Location Section */}
      <div className="space-y-4 p-4 border border-border/50 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Scope & Location
        </h3>
        {/* Tenant field removed as requested */}
        <div className="grid gap-2">
          <Label>Area <span className="text-muted-foreground text-xs font-normal ml-2">(Optional)</span></Label>
          <SearchableSelect
            options={areaOptions}
            value={areaId}
            onValueChange={(v) => { onAreaIdChange(v); onClinicIdChange(""); }}
            placeholder={tenantId ? "Select an area..." : "Please switch to a specific hospital"}
            searchPlaceholder="Search areas..."
            isLoading={areasLoading}
            disabled={!tenantId}
            clearable
          />
        </div>
        <div className="grid gap-2">
          <Label>Clinic / Branch <span className="text-muted-foreground text-xs font-normal ml-2">(Optional)</span></Label>
          <SearchableSelect
            options={clinicOptions}
            value={clinicId}
            onValueChange={onClinicIdChange}
            placeholder={areaId ? "Select a clinic..." : "Select area first..."}
            searchPlaceholder="Search clinics..."
            isLoading={clinicsLoading}
            disabled={!areaId}
            clearable
          />
        </div>
      </div>

      {/* Program Details Section */}
      <div className="space-y-4 p-4 border border-border/50 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Program Details
        </h3>
        <div className="grid gap-2">
          <Label>Program Name <span className="text-destructive">*</span></Label>
          <SearchableSelect
            options={programOptions}
            value={name}
            onValueChange={onNameChange}
            placeholder="Select or create a program..."
            searchPlaceholder="Search or create programs..."
            isLoading={programsLoading}
            creatable
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
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ProgramsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { filters, setFilter, clearFilters } = useUrlFilters<{
    tenantId: string;
    areaId: string;
    clinicId: string;
  }>();

  const filterTenant = filters.tenantId || "";
  const filterArea = filters.areaId || "";
  const filterClinic = filters.clinicId || "";
  const [showFilters, setShowFilters] = useState(false);
  const { activeTenantId } = useTenantContext();

  const [tenantQuery, setTenantQuery] = useState("");
  const [areaQuery, setAreaQuery] = useState("");
  const [clinicQuery, setClinicQuery] = useState("");

  const { data, isLoading } = useListPrograms(
    { 
      page, 
      limit: PAGE_SIZE,
      tenantId: filterTenant || undefined,
      areaId: filterArea || undefined,
      clinicId: filterClinic || undefined,
      q: search || undefined
    } as any,
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );
  const { data: tenantsData, isLoading: tenantsLoading } = useListTenants(
    { limit: 500, q: tenantQuery || undefined },
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );
  
  const tenantOptions = useMemo(() => {
    return (tenantsData?.data ?? []).map((t: any) => ({ label: t.name, value: t.id }));
  }, [tenantsData]);

  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;
  const activeFilterCount = [filterTenant, filterArea, filterClinic].filter(Boolean).length;
  const createProgram = useCreateProgram({ request: { headers: { "x-tenant-id": "ALL" } } });
  const updateProgram = useUpdateProgram({ request: { headers: { "x-tenant-id": "ALL" } } });
  const deleteProgram = useDeleteProgram({ request: { headers: { "x-tenant-id": "ALL" } } });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: areasData, isLoading: areasLoading } = useListAreas(
    { limit: 500, tenantId: tenantId || undefined, q: areaQuery || undefined } as any,
    { request: { headers: { "x-tenant-id": "ALL" } }, query: { enabled: !!tenantId } as any }
  );
  const areaOptions = useMemo(() => (areasData?.data ?? []).map((a: any) => ({ label: a.name, value: a.id })), [areasData]);

  const { data: clinicsData, isLoading: clinicsLoading } = useListClinics(
    { limit: 500, areaId: areaId || undefined, q: clinicQuery || undefined } as any,
    { request: { headers: { "x-tenant-id": "ALL" } }, query: { enabled: !!areaId } as any }
  );
  const clinicOptions = useMemo(() => (clinicsData?.data ?? []).map((c: any) => ({ label: c.name, value: c.id })), [clinicsData]);

  const { data: allProgramsData, isLoading: allProgramsLoading } = useListPrograms(
    { limit: 1000 },
    { request: { headers: { "x-tenant-id": "ALL" } } }
  );

  const programOptions = useMemo(() => {
    const uniqueNames = Array.from(new Set((allProgramsData?.data ?? []).map((p: any) => p.name)));
    return uniqueNames.map(name => ({ label: name as string, value: name as string })).sort((a, b) => a.label.localeCompare(b.label));
  }, [allProgramsData]);

  const openCreate = useCallback(() => { setName(""); setDescription(""); setTenantId(activeTenantId === "ALL" ? "" : activeTenantId); setAreaId(""); setClinicId(""); setIsCreateOpen(true); }, [activeTenantId]);
  const openEdit = useCallback((program: any) => {
    setEditId(program.id); setName(program.name); setDescription(program.description ?? ""); 
    setTenantId(program.tenantId ?? ""); setAreaId(program.areaId ?? ""); setClinicId(program.clinicId ?? ""); 
    setIsEditOpen(true);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !tenantId) { toast({ variant: "destructive", title: "Name and Tenant are required" }); return; }
    try {
      await createProgram.mutateAsync({ data: { tenantId, areaId: areaId || undefined, clinicId: clinicId || undefined, name: name.trim(), description: description.trim() || undefined } as any });
      queryClient.invalidateQueries({ queryKey: getListProgramsQueryKey() });
      setIsCreateOpen(false);
      toast({ title: "Program created successfully" });
    } catch (err: any) { toast({ variant: "destructive", title: "Failed to create", description: err.message }); }
  }, [name, description, tenantId, createProgram, queryClient, toast]);

  const handleEdit = useCallback(async () => {
    if (!name.trim() || !tenantId) { toast({ variant: "destructive", title: "Name and Tenant are required" }); return; }
    try {
      await updateProgram.mutateAsync({ id: editId, data: { tenantId, areaId: areaId || undefined, clinicId: clinicId || undefined, name: name.trim(), description: description.trim() || undefined } as any });
      queryClient.invalidateQueries({ queryKey: getListProgramsQueryKey() });
      setIsEditOpen(false);
      toast({ title: "Program updated successfully" });
    } catch (err: any) { toast({ variant: "destructive", title: "Failed to update", description: err.message }); }
  }, [name, description, editId, tenantId, areaId, clinicId, updateProgram, queryClient, toast]);

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

  const handleExport = () => {
    if (!filteredPrograms.length) {
      toast({ title: "No data", description: "There are no programs to export." });
      return;
    }
    const exportData = filteredPrograms.map((p: any) => ({
      ID: p.id,
      "Program Name": p.name,
      Description: p.description || "N/A",
      "Created At": new Date(p.createdAt).toLocaleDateString("en-GB")
    }));
    exportToCSV(exportData, `programs_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="page-container animate-in-up">
      <div className="page-header">
        <div>
          <h1 className="text-h2">Clinical Programs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.meta?.total ? `${data.meta.total} ` : ""}Care pathways and treatment programs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !filteredPrograms.length}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <Plus className="w-4 h-4 mr-2" />Create Program
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="max-w-sm">
              <DialogHeader><DialogTitle>Create New Program</DialogTitle></DialogHeader>
              <ProgramFormFields
                tenantId={tenantId} onTenantIdChange={setTenantId}
                tenantOptions={tenantOptions} tenantsLoading={tenantsLoading}
                areaId={areaId} onAreaIdChange={setAreaId}
                areaOptions={areaOptions} areasLoading={areasLoading}
                clinicId={clinicId} onClinicIdChange={setClinicId}
                clinicOptions={clinicOptions} clinicsLoading={clinicsLoading}
                name={name} onNameChange={setName}
                programOptions={programOptions} programsLoading={allProgramsLoading}
                description={description} onDescriptionChange={setDescription}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createProgram.isPending || !name.trim() || !tenantId}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Program</DialogTitle></DialogHeader>
          <ProgramFormFields
            tenantId={tenantId} onTenantIdChange={setTenantId}
            tenantOptions={tenantOptions} tenantsLoading={tenantsLoading}
            areaId={areaId} onAreaIdChange={setAreaId}
            areaOptions={areaOptions} areasLoading={areasLoading}
            clinicId={clinicId} onClinicIdChange={setClinicId}
            clinicOptions={clinicOptions} clinicsLoading={clinicsLoading}
            name={name} onNameChange={setName}
            programOptions={programOptions} programsLoading={allProgramsLoading}
            description={description} onDescriptionChange={setDescription}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateProgram.isPending || !name.trim() || !tenantId}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-8 space-y-4">
        {/* Search + Filter bar */}
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

          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary-foreground text-primary rounded-full text-xs font-bold w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}

          {search && <Badge variant="secondary">{filteredPrograms.length} shown</Badge>}
        </div>

        {/* Expanded Filter panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in-up">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tenant / Hospital
              </Label>
              <SearchableSelect
                options={tenantOptions}
                value={filterTenant}
                onValueChange={(v) => { setFilter("tenantId", v); setFilter("areaId", ""); setFilter("clinicId", ""); }}
                onSearch={setTenantQuery}
                placeholder="All tenants"
                searchPlaceholder="Search tenants..."
                clearable
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Area
              </Label>
              <SearchableSelect
                options={areaOptions}
                value={filterArea}
                onValueChange={(v) => { setFilter("areaId", v); setFilter("clinicId", ""); }}
                onSearch={setAreaQuery}
                placeholder="All areas"
                searchPlaceholder="Search areas..."
                clearable
                disabled={!filterTenant && tenantOptions.length > 0}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center justify-between">
                <span>Clinic</span>
              </Label>
              <SearchableSelect
                options={clinicOptions}
                value={filterClinic}
                onValueChange={(v) => setFilter("clinicId", v)}
                onSearch={setClinicQuery}
                placeholder="All clinics"
                searchPlaceholder="Search clinics..."
                clearable
                disabled={!filterArea && areaOptions.length > 0}
              />
            </div>
          </div>
        )}

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
