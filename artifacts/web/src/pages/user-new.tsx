import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateUser, useListRoles, useListClinics } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().min(1, "Role is required"),
  clinicIds: z.array(z.string()).optional(),
});

type UserForm = z.infer<typeof userSchema>;

export default function NewUserPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createUser = useCreateUser();

  const { data: roles } = useListRoles();
  const { data: clinics } = useListClinics();

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roleId: "",
      clinicIds: [],
    },
  });

  const selectedRoleId = form.watch("roleId");
  const selectedRoleName = roles?.data.find((r) => r.id === selectedRoleId)?.name;
  // Every non-super role is scoped by clinic assignment — without it they see nothing.
  const needsClinicAssignment = !!selectedRoleName && selectedRoleName !== "SUPER_ADMIN";

  const onSubmit = async (data: UserForm) => {
    try {
      await createUser.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Team member invited successfully" });
      setLocation(`/users`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invitation failed",
        description: error.message || "Please check the form details.",
      });
    }
  };

  return (
    <div className="page-container animate-in-up">
      <div>
        <div className="page-header border-b-0 pb-2 mb-6">
          <div>
            <Link href="/users">
              <Button variant="ghost" size="sm" className="mb-4 -ml-3 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Team Members
              </Button>
            </Link>
            <h1 className="text-h2">Invite Team Member</h1>
            <p className="text-muted-foreground text-sm mt-1">Add a new clinician or staff member to the system.</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="glass-card">
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
                        <Input placeholder="Sarah" {...field} />
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
                        <Input placeholder="Connor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="sarah.connor@nhs.net" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Access & Roles</CardTitle>
                <CardDescription>Determine what this user can see and do</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel>System Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles?.data.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {needsClinicAssignment && (
                  <FormField
                    control={form.control}
                    name="clinicIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Assignments</FormLabel>
                        <CardDescription className="!mt-1">
                          {selectedRoleName === "AREA_ADMIN"
                            ? "Assign at least one clinic — area admins manage every clinic in that clinic's area."
                            : "Assign the clinics this user can access. Required for the user to see any data."}
                        </CardDescription>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-64 overflow-y-auto rounded-lg border border-border p-3 mt-2">
                          {(clinics?.data ?? []).map((c) => {
                            const checked = field.value?.includes(c.id) ?? false;
                            return (
                              <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover:bg-muted">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-border accent-primary"
                                  checked={checked}
                                  onChange={(e) => {
                                    const current = field.value ?? [];
                                    field.onChange(
                                      e.target.checked
                                        ? [...current, c.id]
                                        : current.filter((id) => id !== c.id),
                                    );
                                  }}
                                />
                                <span className="truncate">{c.name}</span>
                              </label>
                            );
                          })}
                          {(clinics?.data ?? []).length === 0 && (
                            <p className="text-sm text-muted-foreground col-span-full">No clinics available — create a clinic first.</p>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/users">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? "Inviting..." : "Invite Member"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
