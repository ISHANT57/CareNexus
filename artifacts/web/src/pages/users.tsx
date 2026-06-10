import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListUsers, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight, UserCircle, Download } from "lucide-react";
import { cn, exportToCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  AREA_ADMIN: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  CLINIC_ADMIN: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  DOCTOR: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  OPERATOR: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  STAFF: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data: me } = useGetMe();
  const isSuperAdmin = me?.role === "SUPER_ADMIN";
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useListUsers({
    q: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;

  const handleExport = () => {
    if (!data?.data || data.data.length === 0) {
      toast({ title: "No data", description: "There are no users to export." });
      return;
    }
    const exportData = data.data.map((u: any) => ({
      ID: u.id,
      "First Name": u.firstName,
      "Last Name": u.lastName,
      Email: u.email,
      Role: u.systemRole ?? u.role?.name ?? "",
      Organization: u.tenant?.name || "N/A",
      Status: u.status,
      "Last Login": u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("en-GB") : "Never",
      "Created At": new Date(u.createdAt).toLocaleDateString("en-GB")
    }));
    exportToCSV(exportData, `team_members_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="page-container animate-in-up">
      <div className="page-header">
        <div>
          <h1 className="text-h2">Team Members</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.meta?.total ? `${data.meta.total} ` : ""}Manage access and roles for clinical and admin staff.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !data?.data?.length}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/users/new">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" data-testid="button-new-user">
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-users"
            />
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !data?.data || data.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <UserCircle className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No team members found</p>
                <p className="text-sm mt-1">{search ? "Try a different search" : "Invite your first team member"}</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Member</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Email</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Role</TableHead>
                      {isSuperAdmin && <TableHead className="font-semibold text-xs uppercase tracking-wide">Organization</TableHead>}
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Status</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Last Login</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((user) => {
                      const roleName = (user as any).systemRole ?? user.role?.name ?? "";
                      const roleClass = ROLE_BADGE[roleName] ?? "bg-muted text-muted-foreground border-border";
                      return (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-primary">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                              </div>
                              <Link href={`/users/${user.id}`}>
                                <span className="text-sm font-medium hover:text-primary cursor-pointer">
                                  {user.firstName} {user.lastName}
                                </span>
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-xs font-medium", roleClass)}>
                              {roleName.replace(/_/g, " ") || user.role?.name || "—"}
                            </Badge>
                          </TableCell>
                          {isSuperAdmin && (
                            <TableCell className="text-sm text-muted-foreground font-medium">
                              {(user as any).tenant?.name || "—"}
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-medium",
                                user.status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-muted text-muted-foreground border-border"
                              )}
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {(user as any).lastLoginAt
                              ? new Date((user as any).lastLoginAt).toLocaleDateString("en-GB")
                              : "Never"
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/users/${user.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                Edit →
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages} · {data.meta?.total} members</span>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
