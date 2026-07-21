import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMe, useUpdateTenant, useChangePassword, useRequestEmailChange, useCancelEmailChange, getGetMeQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { useTheme } from "@/components/ui/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Sun, Moon, Monitor, Loader2, Clock, X } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});
type PasswordForm = z.infer<typeof passwordSchema>;

const orgSchema = z.object({ name: z.string().min(2, "Name is required") });
type OrgForm = z.infer<typeof orgSchema>;

const emailSchema = z.object({ newEmail: z.string().email("Enter a valid email address") });
type EmailForm = z.infer<typeof emailSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe();
  const { theme, setTheme } = useTheme();
  const changePassword = useChangePassword();
  const updateTenant = useUpdateTenant();
  const requestEmailChange = useRequestEmailChange();
  const cancelEmailChange = useCancelEmailChange();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const canEditOrg = isSuperAdmin && !!user?.tenantId;

  const pwForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: "", newPassword: "" } });
  const orgForm = useForm<OrgForm>({ resolver: zodResolver(orgSchema), defaultValues: { name: "" } });
  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema), defaultValues: { newEmail: "" } });

  useEffect(() => { if (user?.tenantName) orgForm.reset({ name: user.tenantName }); }, [user?.tenantName]);

  const onEmailSubmit = async (data: EmailForm) => {
    try {
      await requestEmailChange.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: "Email change requested", description: "An area admin or super admin must approve it before it takes effect." });
      emailForm.reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Request failed", description: error.message });
    }
  };

  const onCancelEmailChange = async () => {
    try {
      await cancelEmailChange.mutateAsync();
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: "Pending email change cancelled" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Cancel failed", description: error.message });
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await changePassword.mutateAsync({ data });
      toast({ title: "Password changed successfully" });
      pwForm.reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to change password", description: error.message || "Please check your current password." });
    }
  };

  const onOrgSubmit = async (data: OrgForm) => {
    if (!user?.tenantId) return;
    try {
      await updateTenant.mutateAsync({ id: user.tenantId, data });
      queryClient.invalidateQueries({ queryKey: ["getMe"] });
      toast({ title: "Organisation profile updated" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update failed", description: error.message });
    }
  };

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "system" as const, icon: Monitor, label: "System" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
  ];

  return (
    <div className="page-container max-w-4xl">
      <PageHeader title="Settings" description="Manage your account, organisation and appearance." />

      <div className="space-y-6">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your personal profile.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><div className="text-muted-foreground">Name</div><div className="mt-1 font-medium">{user?.firstName} {user?.lastName}</div></div>
            <div><div className="text-muted-foreground">Email</div><div className="mt-1 font-medium">{user?.email}</div></div>
            <div><div className="text-muted-foreground">Role</div><div className="mt-1"><Badge variant="secondary">{user?.role?.replace(/_/g, " ")}</Badge></div></div>
            <div><div className="text-muted-foreground">Organisation</div><div className="mt-1 font-medium">{user?.tenantName}</div></div>
          </CardContent>
        </Card>

        {/* Email address */}
        <Card>
          <CardHeader>
            <CardTitle>Email Address</CardTitle>
            <CardDescription>Changing your email requires approval from an Area Admin or Super Admin before it takes effect.</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.pendingEmail ? (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-warning shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Pending approval: {user.pendingEmail}</div>
                    <div className="text-muted-foreground">
                      {user.pendingEmailRequestedAt ? `Requested ${new Date(user.pendingEmailRequestedAt).toLocaleDateString("en-GB")}` : "Requested"} — an admin must approve this before it applies.
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onCancelEmailChange} disabled={cancelEmailChange.isPending}>
                  <X className="w-3.5 h-3.5 mr-1.5" />Cancel
                </Button>
              </div>
            ) : (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 max-w-md">
                  <FormField control={emailForm.control} name="newEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={requestEmailChange.isPending}>
                    {requestEmailChange.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Requesting…</> : "Request Email Change"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Organisation profile */}
        <Card>
          <CardHeader>
            <CardTitle>Organisation Profile</CardTitle>
            <CardDescription>{canEditOrg ? "Update your organisation's details." : "Organisation details (read-only for your role)."}</CardDescription>
          </CardHeader>
          <CardContent>
            {canEditOrg ? (
              <Form {...orgForm}>
                <form onSubmit={orgForm.handleSubmit(onOrgSubmit)} className="space-y-4 max-w-md">
                  <FormField control={orgForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organisation Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={updateTenant.isPending}>
                    {updateTenant.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : "Save changes"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><div className="text-muted-foreground">Organisation Name</div><div className="mt-1 font-medium">{user?.tenantName}</div></div>
                <div><div className="text-muted-foreground">Tenant ID</div><div className="mt-1 font-mono text-xs bg-muted p-2 rounded">{user?.tenantId}</div></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how CareNexus looks on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="inline-flex items-center gap-1 rounded-lg border border-border p-1">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${theme === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...pwForm}>
              <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <FormField control={pwForm.control} name="currentPassword" render={({ field }) => (
                  <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={pwForm.control} name="newPassword" render={({ field }) => (
                  <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending ? "Updating…" : "Update Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
