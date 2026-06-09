import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useListPatients,
  useImportPatients,
  useListPrograms,
  useListClinics,
  getListPatientsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight, Upload, Filter, X, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DISCHARGE", label: "Discharged" },
  { value: "NEW", label: "New" },
  { value: "PSI", label: "PSI" },
  { value: "MEDICATION_REQUIRED", label: "Medication Required" },
  { value: "CONSULTATION_COMPLETED", label: "Consultation Completed" },
];

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: "Active", class: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  INACTIVE: { label: "Inactive", class: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  DISCHARGE: { label: "Discharged", class: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
  NEW: { label: "New", class: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  PSI: { label: "PSI", class: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" },
  MEDICATION_REQUIRED: { label: "Medication Req.", class: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
  CONSULTATION_COMPLETED: { label: "Consultation Done", class: "bg-primary/10 text-primary border-primary/20" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_BADGE[status] ?? { label: status, class: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.class)}>
      {config.label}
    </Badge>
  );
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterClinic, setFilterClinic] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const importPatients = useImportPatients();

  const { data: programsData } = useListPrograms({ limit: 100 });
  const { data: clinicsData } = useListClinics({ limit: 100 });

  const programOptions = (programsData?.data ?? []).map((p: any) => ({
    value: p.id,
    label: p.name,
  }));

  const clinicOptions = (clinicsData?.data ?? []).map((c: any) => ({
    value: c.id,
    label: c.name,
    description: c.area?.name,
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
  }, [filterStatus, filterProgram, filterClinic]);

  const { data, isLoading } = useListPatients({
    q: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;

  const activeFilterCount = [filterStatus, filterProgram, filterClinic].filter(Boolean).length;

  const clearFilters = () => {
    setFilterStatus("");
    setFilterProgram("");
    setFilterClinic("");
  };

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

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage patient records, demographics, and care assignments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
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
              <Button data-testid="button-new-patient" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Patient
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-4">
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
          <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in-up">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </Label>
              <SearchableSelect
                options={STATUS_OPTIONS}
                value={filterStatus}
                onValueChange={setFilterStatus}
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
                onValueChange={setFilterProgram}
                placeholder="All programs"
                searchPlaceholder="Search programs..."
                clearable
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Clinic
              </Label>
              <SearchableSelect
                options={clinicOptions}
                value={filterClinic}
                onValueChange={setFilterClinic}
                placeholder="All clinics"
                searchPlaceholder="Search clinics..."
                clearable
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
                <User className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No patients found</p>
                <p className="text-sm mt-1">
                  {search || activeFilterCount > 0
                    ? "Try adjusting your search or filters"
                    : "Add your first patient to get started"}
                </p>
                {!search && !activeFilterCount && (
                  <Link href="/patients/new">
                    <Button size="sm" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Patient
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">NHS Number</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Name</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Status</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Program</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Clinic</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((patient) => (
                        <TableRow
                          key={patient.id}
                          data-testid={`row-patient-${patient.id}`}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {patient.nhsNumber ?? "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-primary">
                                  {patient.firstName?.[0]}
                                </span>
                              </div>
                              <span className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={patient.status ?? "INACTIVE"} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {(patient as any).program?.name ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {patient.clinic?.name ?? "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/patients/${patient.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                View →
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} · {data.meta?.total?.toLocaleString()} total
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
    </div>
  );
}
