import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListUsers, useGetMe, useListRoles, useUpdateUser, useApproveUserEmailChange, useRejectUserEmailChange, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, UserCircle, Download, X, Mail, Phone, MoreVertical, Clock, CalendarDays, BadgeCheck, MailCheck, MailX, ExternalLink, Loader2, Check, Ban } from "lucide-react";
import { cn, exportToCSV } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientAvatar, Pagination } from "@/lib/ui-helpers";
import { PatientsIllustration } from "@/components/ui/illustrations";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 12;

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  AREA_ADMIN: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  CLINIC_ADMIN: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  DOCTOR: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  OPERATOR: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  STAFF: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};


const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRoleId, setFilterRoleId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data: me } = useGetMe();
  const isSuperAdmin = me?.role === "SUPER_ADMIN";
  const canApproveEmailChange = isSuperAdmin || me?.role === "AREA_ADMIN";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();
  const approveEmailChange = useApproveUserEmailChange();
  const rejectEmailChange = useRejectUserEmailChange();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerifyEmail = async (userId: string, verified: boolean) => {
    setVerifyingId(userId);
    try {
      await updateUser.mutateAsync({ id: userId, data: { emailVerified: verified } });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: verified ? "Email verified" : "Email verification revoked" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleEmailChangeDecision = async (userId: string, decision: "approve" | "reject") => {
    setVerifyingId(userId);
    try {
      if (decision === "approve") await approveEmailChange.mutateAsync({ id: userId });
      else await rejectEmailChange.mutateAsync({ id: userId });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: decision === "approve" ? "Email change approved" : "Email change rejected" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    } finally {
      setVerifyingId(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: rolesData } = useListRoles();
  const roleOptions = (rolesData?.data ?? []).filter((r: any) => r.name !== "SUPER_ADMIN");

  const { data, isLoading } = useListUsers({
    q: debouncedSearch || undefined,
    roleId: filterRoleId || undefined,
    page,
    limit: PAGE_SIZE,
  } as any);

  const activeFilterCount = [filterRoleId, filterStatus].filter(Boolean).length;
  const clearFilters = () => { setFilterRoleId(""); setFilterStatus(""); setPage(1); };

  const displayedUsers = filterStatus
    ? (data?.data ?? []).filter((u: any) => u.status === filterStatus)
    : (data?.data ?? []);


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
    <div>
      <div className="border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-1">People & Access</p>
              <h1 className="text-xl font-semibold tracking-tight">Team Members</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{data?.meta?.total ? `${data.meta.total} members · ` : ""}Clinical and admin staff access management.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !data?.data?.length}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Link href="/users/new">
                <Button size="sm" data-testid="button-new-user">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container animate-in-up pt-6 pb-12 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-users"
            />
          </div>
          <Select value={filterRoleId} onValueChange={(v) => { setFilterRoleId(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-44 bg-card">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              {roleOptions.map((r: any) => (
                <SelectItem key={r.id} value={r.id}>{r.name.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-36 bg-card">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="w-3.5 h-3.5" />Clear
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-60 rounded-2xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : displayedUsers.length === 0 ? (
          <EmptyState
            illustration={<PatientsIllustration />}
            icon={UserCircle}
            title="No team members found"
            description={
              search || activeFilterCount > 0
                ? "Try adjusting your search or filters to see more team members."
                : "Invite your first team member to give clinical and admin staff access."
            }
            action={
              search || activeFilterCount > 0 ? undefined : (
                <Link href="/users/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />Invite Member
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayedUsers.map((user: any) => {
                const roleName = (user as any).systemRole ?? user.role?.name ?? "";
                const roleClass = ROLE_BADGE[roleName] ?? "bg-muted text-muted-foreground border-border";
                const shortId = String(user.id).slice(0, 8).toUpperCase();
                return (
                  <div
                    key={user.id}
                    data-testid={`card-user-${user.id}`}
                    className="group relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-colors duration-200 hover:border-primary/40 hover:shadow-md"
                  >
                    {/* Accent header band */}
                    <div className="h-16 bg-primary/5 border-b border-border" />

                    {/* ID chip + menu */}
                    <span className="absolute top-3 left-3 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-background/70 backdrop-blur text-muted-foreground border border-border/50">
                      #{shortId}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-background/70 hover:text-foreground transition-colors" aria-label="Member actions">
                          {verifyingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <Link href={`/users/${user.id}`}>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <ExternalLink className="w-4 h-4" /> Open profile
                          </DropdownMenuItem>
                        </Link>
                        {isSuperAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            {(user as any).emailVerified ? (
                              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleVerifyEmail(user.id, false)}>
                                <MailX className="w-4 h-4" /> Revoke verification
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleVerifyEmail(user.id, true)}>
                                <MailCheck className="w-4 h-4 text-emerald-600" /> Verify email
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        {canApproveEmailChange && (user as any).pendingEmail && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEmailChangeDecision(user.id, "approve")}>
                              <Check className="w-4 h-4 text-emerald-600" /> Approve new email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEmailChangeDecision(user.id, "reject")}>
                              <Ban className="w-4 h-4 text-destructive" /> Reject new email
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Avatar */}
                    <div className="px-5 -mt-8">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover ring-4 ring-card shadow-md" />
                      ) : (
                        <GradientAvatar first={user.firstName} last={user.lastName} className="!w-16 !h-16 !text-lg ring-4 ring-card shadow-md" />
                      )}
                    </div>

                    {/* Identity */}
                    <div className="px-5 pt-3">
                      <Link href={`/users/${user.id}`}>
                        <h3 className="font-semibold text-base leading-tight hover:text-primary cursor-pointer truncate">
                          {user.firstName} {user.lastName}
                        </h3>
                      </Link>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn("text-[11px] font-medium", roleClass)}>
                          {roleName.replace(/_/g, " ") || "—"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px] font-medium",
                            user.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {user.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Two-stat row (Joined / Last active) */}
                    <div className="px-5 mt-4 grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-lg bg-muted/40 py-2">
                        <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground"><CalendarDays className="w-3 h-3" />Joined</div>
                        <div className="text-xs font-semibold mt-0.5">{fmtDate(user.createdAt)}</div>
                      </div>
                      <div className="rounded-lg bg-muted/40 py-2">
                        <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground"><Clock className="w-3 h-3" />Last active</div>
                        <div className="text-xs font-semibold mt-0.5">{user.lastLoginAt ? fmtDate(user.lastLoginAt) : "Never"}</div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="px-5 py-4 mt-3 border-t border-border/60 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <a href={`mailto:${user.email}`} className="truncate hover:text-primary transition-colors">{user.email}</a>
                        {(user as any).emailVerified ? (
                          <span title="Email verified" className="shrink-0 inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                            <BadgeCheck className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span title="Email not verified" className="shrink-0 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1">Unverified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" /><span>{user.mobile || "No phone on file"}</span>
                      </div>
                      {(user as any).pendingEmail && (
                        <div className="flex items-center gap-1.5 text-[11px] text-warning">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">Pending: {(user as any).pendingEmail}</span>
                        </div>
                      )}
                      {isSuperAdmin && (user as any).tenant?.name && (
                        <div className="text-[11px] text-muted-foreground/70 pt-0.5">{(user as any).tenant.name}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={data?.meta?.total ?? 0}
              onPageChange={setPage}
              noun="members"
              className="px-0"
            />
          </>
        )}
      </div>
    </div>
  );
}
