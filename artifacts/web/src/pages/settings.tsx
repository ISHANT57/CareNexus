import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMe, useUpdateTenant, useChangePassword } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { useTheme } from "@/components/ui/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Sun, Moon, Monitor, Loader2 } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});
type PasswordForm = z.infer<typeof passwordSchema>;

const orgSchema = z.object({ name: z.string().min(2, "Name is required") });
type OrgForm = z.infer<typeof orgSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe();
  const { theme, setTheme } = useTheme();
  const changePassword = useChangePassword();
  const updateTenant = useUpdateTenant();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const canEditOrg = isSuperAdmin && !!user?.tenantId;

  const pwForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: "", newPassword: "" } });
  const orgForm = useForm<OrgForm>({ resolver: zodResolver(orgSchema), defaultValues: { name: "" } });

  useEffect(() => { if (user?.tenantName) orgForm.reset({ name: user.tenantName }); }, [user?.tenantName]);

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
