import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useListPatients,
  useImportPatients,
  useListPrograms,
  useListAreas,
  useListClinics,
  getListPatientsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Loader2, Upload, Filter, X, User, Download, Eye, MoreHorizontal, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { exportToCSV } from "@/lib/utils";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { GradientAvatar, ProgramIcon, StatusBadge, RiskBadge, Pagination } from "@/lib/ui-helpers";
import { PatientsIllustration, SearchIllustration } from "@/components/ui/illustrations";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DISCHARGE", label: "Discharged" },
  { value: "NEW", label: "New" },
  { value: "PSI", label: "PSI" },
  { value: "MEDICATION_REQUIRED", label: "Medication Required" },
  { value: "CONSULTATION_COMPLETED", label: "Consultation Completed" },
];

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const { filters, setFilter, clearFilters } = useUrlFilters<{
    status: string;
    programId: string;
    areaId: string;
    clinicId: string;
  }>();
  
  const filterStatus = filters.status || "";
  const filterProgram = filters.programId || "";
  const filterArea = filters.areaId || "";
  const filterClinic = filters.clinicId || "";
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const importPatients = useImportPatients();

  const [programQuery, setProgramQuery] = useState("");
  const [areaQuery, setAreaQuery] = useState("");
  const [clinicQuery, setClinicQuery] = useState("");

  const { data: programsData } = useListPrograms({ limit: 100, q: programQuery || undefined });
  const { data: areasData } = useListAreas({ limit: 500, q: areaQuery || undefined });
  const { data: clinicsData } = useListClinics(
    { areaId: filterArea || undefined, limit: 500, q: clinicQuery || undefined },
    { query: { enabled: true } as any }
  );

  const programOptions = (programsData?.data ?? []).map((p: any) => ({
    value: p.id,
    label: p.name,
  }));

  const areaOptions = (areasData?.data ?? []).map((a: any) => ({
    value: a.id,
    label: a.name,
  }));

  const clinicOptions = (clinicsData?.data ?? []).map((c: any) => ({
    value: c.id,
    label: c.name,
    description: filterArea ? undefined : c.area?.name,
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterProgram, filterArea, filterClinic]);

  useEffect(() => {
    setFilter("clinicId", "");
  }, [filterArea]);

  const { data, isLoading } = useListPatients({
    q: debouncedSearch || undefined,
    status: filterStatus || undefined,
    programId: filterProgram || undefined,
    areaId: filterArea || undefined,
    clinicId: filterClinic || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const activeFilterCount = [filterStatus, filterProgram, filterArea, filterClinic].filter(Boolean).length;

  const handleImport = async () => {
    if (!importFile) return;
    try {
      const res = await importPatients.mutateAsync({
        data: { file: importFile as any },
      });
      setIsImportOpen(false);
      setImportFile(null);
      queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
      toast({
        title: "Import Successful",
        description: `Imported ${res.successCount} patients.${res.errorCount > 0 ? ` ${res.errorCount} failed.` : ""}`,
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Import failed", description: err.message });
    }
  };

  const handleExport = () => {
    if (!data?.data?.length) {
      toast({ title: "No data", description: "There is no data to export." });
      return;
    }
    const exportData = data.data.map(p => ({
      ID: p.id,
      "NHS Number": p.nhsNumber || "N/A",
      "First Name": p.firstName,
      "Last Name": p.lastName,
      Status: p.status,
      "Date of Birth": (p as any).dateOfBirth,
      Email: p.email,
      Mobile: p.mobile,
      "Program Name": (p as any).program?.name || "N/A",
      "Clinic Name": p.clinic?.name || "N/A"
    }));
    exportToCSV(exportData, `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div>
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-1">Clinical Records</p>
              <h1 className="text-xl font-semibold tracking-tight">Patients</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {data?.meta?.total ? `${data.meta.total.toLocaleString()} patients · ` : ""}Manage records, demographics, and care assignments.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !data?.data?.length}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>

              <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle>Bulk Import Patients</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>CSV File</Label>
                      <input
                        type="file"
                        accept=".csv"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Required columns: firstName, lastName. Optional: email, mobile, dateOfBirth, nhsNumber.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsImportOpen(false); setImportFile(null); }}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!importFile || importPatients.isPending}>
                      {importPatients.isPending ? "Importing..." : "Import"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Link href="/patients/new">
                <Button data-testid="button-new-patient" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Patient
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="page-container animate-in-up pt-6 pb-12 space-y-4">

        {/* Search + Filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, NHS number, mobile..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-patients"
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
              Clear filters
            </Button>
          )}

          {data?.meta && (
            <span className="text-sm text-muted-foreground ml-auto whitespace-nowrap">
              {data.meta.total.toLocaleString()} patient{data.meta.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in-up">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</Label>
              <SearchableSelect
                options={STATUS_OPTIONS}
                value={filterStatus}
                onValueChange={(v) => setFilter("status", v)}
                placeholder="All statuses"
                searchPlaceholder="Search status..."
                clearable
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Program</Label>
              <SearchableSelect
                options={programOptions}
                value={filterProgram}
                onValueChange={(v) => setFilter("programId", v)}
                onSearch={setProgramQuery}
                placeholder="All programs"
                searchPlaceholder="Search programs..."
                clearable
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Area</Label>
              <SearchableSelect
                options={areaOptions}
                value={filterArea}
                onValueChange={(v) => setFilter("areaId", v)}
                onSearch={setAreaQuery}
                placeholder="All areas"
                searchPlaceholder="Search areas..."
                clearable
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center justify-between">
                <span>Clinic</span>
                {filterArea && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">Filtered</span>}
              </Label>
              <SearchableSelect
                options={clinicOptions}
                value={filterClinic}
                onValueChange={(v) => setFilter("clinicId", v)}
                onSearch={setClinicQuery}
                placeholder="All clinics"
                searchPlaceholder="Search clinics..."
                clearable
                disabled={!filterArea && clinicOptions.length > 50}
              />
            </div>
          </div>
        )}

        {/* Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !data?.data || data.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="w-32 h-32 mb-1 text-primary">
                  {search || activeFilterCount > 0 ? <SearchIllustration /> : <PatientsIllustration />}
                </div>
                <p className="font-semibold text-foreground">No patients found</p>
                <p className="text-sm mt-1">
                  {search || activeFilterCount > 0
                    ? "Try adjusting your search or filters"
                    : "Add your first patient to get started"}
                </p>
                {!search && !activeFilterCount && (
                  <Link href="/patients/new">
                    <Button size="sm" className="mt-5">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Patient
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-36">NHS Number</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Program</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinic</TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((patient) => {
                      const riskLevel = (patient as any).riskLevel as string | undefined;
                      const riskScore = (patient as any).riskScore as number | undefined;
                      const programName = (patient as any).program?.name as string | undefined;
                      return (
                        <TableRow
                          key={patient.id}
                          data-testid={`row-patient-${patient.id}`}
                          className="group/row hover:bg-muted/30 transition-colors border-b border-border/50"
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {patient.nhsNumber ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Link href={`/patients/${patient.id}`} className="flex items-center gap-3 group/name">
                              <GradientAvatar first={patient.firstName} last={patient.lastName} />
                              <span className="font-medium group-hover/name:text-primary transition-colors">
                                {patient.firstName} {patient.lastName}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={patient.status ?? "INACTIVE"} />
                          </TableCell>
                          <TableCell>
                            <RiskBadge level={riskLevel} score={riskScore} />
                          </TableCell>
                          <TableCell>
                            {programName ? (
                              <div className="flex items-center gap-1.5 text-sm">
                                <ProgramIcon name={programName} />
                                <span className="text-foreground/80 truncate max-w-[140px]">{programName}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {patient.clinic?.name ? (
                              <div className="flex items-center gap-1.5 text-sm">
                                <Building2 className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                                <span className="text-muted-foreground truncate max-w-[140px]">{patient.clinic.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/patients/${patient.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View Details
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <Link href={`/patients/${patient.id}`}>
                                    <DropdownMenuItem className="gap-2 cursor-pointer">
                                      <Eye className="w-4 h-4" />
                                      View Details
                                    </DropdownMenuItem>
                                  </Link>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={data.meta?.total ?? 0}
                  onPageChange={setPage}
                  noun="patients"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
