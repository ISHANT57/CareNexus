import { useParams, Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetUser,
  useUpdateUser,
  useListRoles,
  useListClinics,
  useListPrograms,
  useAssignUserClinic,
  useUnassignUserClinic,
  useAssignUserProgram,
  useUnassignUserProgram,
  useGetMe,
  getGetUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Plus, X, Building2, FolderGit2, BadgeCheck, MailCheck, MailX } from "lucide-react";
import { useEffect, useState } from "react";

const userEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobile: z.string().regex(/^\+?[0-9\s\-()]{10,20}$/, "Invalid mobile format").optional().or(z.literal('')),
  roleId: z.string().min(1, "Role is required"),
});

type UserEditForm = z.infer<typeof userEditSchema>;

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetUser(id, {
    query: { enabled: !!id, queryKey: getGetUserQueryKey(id) },
  });
  const { data: roles } = useListRoles();
  const { data: clinics } = useListClinics({ limit: 1000 });
  const { data: programs } = useListPrograms({ limit: 1000 });
  const { data: me } = useGetMe();
  const isSuperAdmin = me?.role === "SUPER_ADMIN";
  const updateUser = useUpdateUser();
  const [verifying, setVerifying] = useState(false);

  const handleToggleVerify = async (verified: boolean) => {
    setVerifying(true);
    try {
      await updateUser.mutateAsync({ id, data: { emailVerified: verified } });
      queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(id) });
      toast({ title: verified ? "Email verified" : "Email verification revoked" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    } finally {
      setVerifying(false);
    }
  };
  const assignClinic = useAssignUserClinic();
  const unassignClinic = useUnassignUserClinic();
  const assignProgram = useAssignUserProgram();
  const unassignProgram = useUnassignUserProgram();
  const [clinicToAdd, setClinicToAdd] = useState("");
  const [programToAdd, setProgramToAdd] = useState("");

  const refreshUser = () => queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(id) });
  const clinicAssignments = (((user as any)?.clinicAssignments ?? []) as Array<{ clinicId: string; clinic?: { id: string; name: string } }>);
  const programAssignments = (((user as any)?.programAssignments ?? []) as Array<{ programId: string; program?: { id: string; name: string } }>);
  const assignedClinicIds = new Set(clinicAssignments.map((a) => a.clinicId));
  const assignedProgramIds = new Set(programAssignments.map((a) => a.programId));

  const handleAddClinic = async () => {
    if (!clinicToAdd) return;
    try { await assignClinic.mutateAsync({ id, data: { clinicId: clinicToAdd } }); setClinicToAdd(""); refreshUser(); toast({ title: "Clinic assigned" }); }
    catch (err: any) { toast({ variant: "destructive", title: "Failed to assign clinic", description: err.message }); }
  };
  const handleRemoveClinic = async (clinicId: string) => {
    try { await unassignClinic.mutateAsync({ id, clinicId }); refreshUser(); toast({ title: "Clinic removed" }); }
    catch (err: any) { toast({ variant: "destructive", title: "Failed to remove clinic", description: err.message }); }
  };
  const handleAddProgram = async () => {
    if (!programToAdd) return;
    try { await assignProgram.mutateAsync({ id, data: { programId: programToAdd } }); setProgramToAdd(""); refreshUser(); toast({ title: "Program assigned" }); }
    catch (err: any) { toast({ variant: "destructive", title: "Failed to assign program", description: err.message }); }
  };
  const handleRemoveProgram = async (programId: string) => {
    try { await unassignProgram.mutateAsync({ id, programId }); refreshUser(); toast({ title: "Program removed" }); }
    catch (err: any) { toast({ variant: "destructive", title: "Failed to remove program", description: err.message }); }
  };

  const form = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    defaultValues: { firstName: "", lastName: "", mobile: "", roleId: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        mobile: user.mobile ?? "",
        roleId: user.role?.id ?? "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UserEditForm) => {
    try {
      await updateUser.mutateAsync({ id, data });
      queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User updated successfully" });
      setLocation("/users");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update failed", description: err.message });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-8">User not found.</div>;
  }

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/users">
            <Button variant="ghost" size="sm" className="mb-4 -ml-3 text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Team Members
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-muted-foreground">{user.email}</p>
                  {(user as any).emailVerified ? (
                    <Badge variant="outline" className="gap-1 text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"} className="ml-2">
                {user.status}
              </Badge>
            </div>
            {isSuperAdmin && (
              (user as any).emailVerified ? (
                <Button type="button" variant="outline" size="sm" onClick={() => handleToggleVerify(false)} disabled={verifying}>
                  {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MailX className="w-4 h-4 mr-2" />}
                  Revoke verification
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={() => handleToggleVerify(true)} disabled={verifying}>
                  {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MailCheck className="w-4 h-4 mr-2" />}
                  Verify email
                </Button>
              )
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+44 7xxx xxxxxx" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access & Role</CardTitle>
                <CardDescription>Change the user's system role.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel>System Role</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles?.data.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/users">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* ── Assignments (clinic + program scope) ─────────────────────────── */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Clinic Access</CardTitle>
            <CardDescription>Clinics this user can access. Determines which patients & data are visible to non-admin roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {clinicAssignments.length === 0 && (
                <p className="text-sm text-muted-foreground">No clinics assigned yet.</p>
              )}
              {clinicAssignments.map((a) => (
                <span key={a.clinicId} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  {a.clinic?.name ?? a.clinicId}
                  <button type="button" onClick={() => handleRemoveClinic(a.clinicId)} className="text-muted-foreground hover:text-destructive" aria-label="Remove clinic">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={clinicToAdd} onValueChange={setClinicToAdd}>
                <SelectTrigger className="sm:max-w-md"><SelectValue placeholder="Select a clinic to assign" /></SelectTrigger>
                <SelectContent>
                  {(clinics?.data ?? []).filter((c: any) => !assignedClinicIds.has(c.id)).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.area?.name ? ` · ${c.area.name}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddClinic} disabled={!clinicToAdd || assignClinic.isPending}>
                <Plus className="h-4 w-4 mr-1" /> Assign clinic
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FolderGit2 className="w-5 h-5 text-primary" /> Program Access</CardTitle>
            <CardDescription>Programs (workflows) this user is responsible for.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {programAssignments.length === 0 && (
                <p className="text-sm text-muted-foreground">No programs assigned yet.</p>
              )}
              {programAssignments.map((a) => (
                <span key={a.programId} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  {a.program?.name ?? a.programId}
                  <button type="button" onClick={() => handleRemoveProgram(a.programId)} className="text-muted-foreground hover:text-destructive" aria-label="Remove program">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={programToAdd} onValueChange={setProgramToAdd}>
                <SelectTrigger className="sm:max-w-md"><SelectValue placeholder="Select a program to assign" /></SelectTrigger>
                <SelectContent>
                  {(programs?.data ?? []).filter((p: any) => !assignedProgramIds.has(p.id)).map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddProgram} disabled={!programToAdd || assignProgram.isPending}>
                <Plus className="h-4 w-4 mr-1" /> Assign program
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
