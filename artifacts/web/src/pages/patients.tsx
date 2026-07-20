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
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, getStatusConfig, getToneBadgeClass } from "@/components/ui/status-badge";
import { Search, Plus, Upload, Filter, X, User, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn, exportToCSV } from "@/lib/utils";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { usePagination } from "@/hooks/use-pagination";

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
  const { page, pageSize, setPage } = usePagination(20);
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
    limit: pageSize,
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / pageSize) : 1;
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

  const columns: DataTableColumn<any>[] = [
    {
      key: "nhsNumber",
      header: "NHS Number",
      className: "font-mono text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors",
      render: (patient) => patient.nhsNumber ?? "—",
    },
    {
      key: "name",
      header: "Name",
      render: (patient) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors">
            <span className="text-xs font-bold text-primary">{patient.firstName?.[0]}</span>
          </div>
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {patient.firstName} {patient.lastName}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (patient) => <StatusBadge domain="patient" status={patient.status ?? "INACTIVE"} />,
    },
    {
      key: "risk",
      header: "Risk Profile",
      render: (patient) =>
        patient.riskLevel ? (
          <Badge
            variant="outline"
            className={cn("uppercase font-semibold text-[10px] tracking-wider", getToneBadgeClass(getStatusConfig("patientRisk", patient.riskLevel).tone))}
          >
            {getStatusConfig("patientRisk", patient.riskLevel).label} ({patient.riskScore ?? 0})
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "program",
      header: "Program",
      className: "text-sm font-medium text-muted-foreground",
      render: (patient) => patient.program?.name ?? "—",
    },
    {
      key: "clinic",
      header: "Clinic",
      className: "text-sm font-medium text-muted-foreground",
      render: (patient) => patient.clinic?.name ?? "—",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (patient) => (
        <Link href={`/patients/${patient.id}`}>
          <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold bg-background border border-border shadow-sm hover:bg-primary hover:text-primary-foreground">
            View Profile →
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="page-container animate-in-up">
      <PageHeader
        title="Patients"
        description="Manage patient records, demographics, and care assignments."
        actions={
          <>
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
                  <Button variant="outline" onClick={() => { setIsImportOpen(false); setImportFile(null); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={!importFile || importPatients.isPending}>
                    {importPatients.isPending ? "Importing..." : "Import"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Link href="/patients/new">
              <Button data-testid="button-new-patient" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                New Patient
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-4">
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
              Clear
            </Button>
          )}

          {data?.meta && (
            <span className="text-sm text-muted-foreground ml-auto whitespace-nowrap">
              {data.meta.total.toLocaleString()} patient{data.meta.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Expanded Filter panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in-up">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </Label>
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
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Program
              </Label>
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
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Area
              </Label>
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

        {/* Table / Data Grid */}
        <Card className="overflow-hidden border-border/50 shadow-sm rounded-2xl">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              isLoading={isLoading}
              getRowKey={(patient) => patient.id}
              emptyState={
                <EmptyState
                  icon={User}
                  title="No patients found"
                  description={
                    search || activeFilterCount > 0
                      ? "Try adjusting your search query or removing some filters to see more results."
                      : "Your registry is empty. Add your first patient record to begin."
                  }
                  action={
                    !search && !activeFilterCount ? (
                      <Link href="/patients/new">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6">
                          <Plus className="w-4 h-4 mr-2" />
                          Register New Patient
                        </Button>
                      </Link>
                    ) : undefined
                  }
                />
              }
              pagination={{
                page,
                totalPages,
                totalLabel: `${data?.meta?.total?.toLocaleString() ?? 0} total`,
                onPageChange: setPage,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
