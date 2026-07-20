import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListUsers, useGetMe } from "@workspace/api-client-react";
import { useActiveRole } from "@/hooks/useActiveRole";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { usePagination } from "@/hooks/use-pagination";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, UserCircle, Download } from "lucide-react";
import { cn, exportToCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  AREA_ADMIN: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  CLINIC_ADMIN: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  DOCTOR: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  OPERATOR: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  STAFF: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export default function UsersPage() {
  const { page, pageSize, setPage } = usePagination(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { isSuperAdmin } = useActiveRole();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useListUsers({
    q: debouncedSearch || undefined,
    page,
    limit: pageSize,
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / pageSize) : 1;

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
      Role: u.tenantAssignments?.[0]?.role?.name ?? "",
      Organization: u.tenantAssignments?.[0]?.tenant?.name || "N/A",
      Status: u.status,
      "Last Login": u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("en-GB") : "Never",
      "Created At": new Date(u.createdAt).toLocaleDateString("en-GB")
    }));
    exportToCSV(exportData, `team_members_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const columns: DataTableColumn<any>[] = [
    {
      key: "member",
      header: "Member",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors">
            <span className="text-xs font-bold text-primary">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
          <Link href={`/users/${user.id}`}>
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer">
              {user.firstName} {user.lastName}
            </span>
          </Link>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "text-sm font-medium text-muted-foreground",
      render: (user) => user.email,
    },
    {
      key: "role",
      header: "Role",
      render: (user) => {
        const roleName = user.tenantAssignments?.[0]?.role?.name ?? "";
        const roleClass = ROLE_BADGE[roleName] ?? "bg-muted text-muted-foreground border-border";
        return (
          <Badge variant="outline" className={cn("text-xs font-bold tracking-wider shadow-sm", roleClass)}>
            {roleName.replace(/_/g, " ") || "—"}
          </Badge>
        );
      },
    },
    ...(isSuperAdmin
      ? [
          {
            key: "organization",
            header: "Organization",
            className: "text-sm text-muted-foreground font-medium",
            render: (user: any) => user.tenantAssignments?.[0]?.tenant?.name || "—",
          },
        ]
      : []),
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-bold tracking-wider shadow-sm",
            user.status === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {user.status}
        </Badge>
      ),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      className: "text-sm font-medium text-muted-foreground",
      render: (user) =>
        (user as any).lastLoginAt
          ? new Date((user as any).lastLoginAt).toLocaleDateString("en-GB")
          : "Never",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (user) => (
        <Link href={`/users/${user.id}`}>
          <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold bg-background border border-border shadow-sm hover:bg-primary hover:text-primary-foreground">
            Edit Profile →
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="page-container animate-in-up">
      <PageHeader
        title="Team Members"
        description={`${data?.meta?.total ? `${data.meta.total} ` : ""}Manage access and roles for clinical and admin staff.`}
        actions={
          <>
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
          </>
        }
      />

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

        <Card className="overflow-hidden glass-card border-border/50 shadow-sm rounded-2xl">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              isLoading={isLoading}
              getRowKey={(user) => user.id}
              emptyState={
                <EmptyState
                  icon={UserCircle}
                  title="No team members found"
                  description={search ? "Try adjusting your search query to see more results." : "Invite your first team member to collaborate."}
                  action={
                    !search ? (
                      <Link href="/users/new">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6">
                          <Plus className="w-4 h-4 mr-2" />
                          Invite Member
                        </Button>
                      </Link>
                    ) : undefined
                  }
                />
              }
              pagination={{
                page,
                totalPages,
                totalLabel: `${data?.meta?.total ?? 0} members`,
                onPageChange: setPage,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
