import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListPatients, useImportPatients, getListPatientsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const importPatients = useImportPatients();

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useListPatients({
    q: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;

  const handleImport = async () => {
    if (!importFile) return;
    try {
      const res = await importPatients.mutateAsync({
        data: { file: importFile as any }
      });
      setIsImportOpen(false);
      setImportFile(null);
      queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
      toast({ 
        title: "Import Successful", 
        description: `Imported ${res.successCount} patients. ${res.errorCount > 0 ? `${res.errorCount} failed.` : ''}` 
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Import failed", description: err.message });
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground mt-2">Manage patient records and demographics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">CSV must include columns: firstName, lastName. Optional: email, mobile, dateOfBirth, nhsNumber.</p>
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
            <Button data-testid="button-new-patient">
              <Plus className="w-4 h-4 mr-2" />
              New Patient
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, NHS number..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-patients"
              />
            </div>
            {data?.meta && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {data.meta.total} patient{data.meta.total !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
              No patients found matching your criteria.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NHS Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Clinic</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((patient) => (
                    <TableRow key={patient.id} data-testid={`row-patient-${patient.id}`}>
                      <TableCell className="font-medium font-mono text-sm">{patient.nhsNumber}</TableCell>
                      <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                      <TableCell>
                        <Badge variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{patient.program?.name || '-'}</TableCell>
                      <TableCell>{patient.clinic?.name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/patients/${patient.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
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
