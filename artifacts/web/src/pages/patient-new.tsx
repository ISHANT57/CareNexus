import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePatient, useListPrograms } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Building2, Loader2, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAreaClinicCascade } from "@/hooks/use-area-clinic-cascade";

const patientSchema = z.object({
  nhsNumber: z.string().regex(/^\d{10}$/, "NHS Number must be exactly 10 digits"),
  title: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  mobile: z.string().regex(/^\+?[0-9\s\-()]{10,20}$/, "Please enter a valid mobile number"),
  gender: z.string().optional(),
  dob: z.string().optional(),
  programId: z.string().min(1, "Program is required"),
  clinicId: z.string().min(1, "Clinic is required"),
  areaId: z.string().min(1, "Area is required"),
});

type PatientForm = z.infer<typeof patientSchema>;

export default function NewPatientPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createPatient = useCreatePatient();

  const [programQuery, setProgramQuery] = useState("");
  const { data: programsData } = useListPrograms({ limit: 100, q: programQuery || undefined });
  const programs = programsData?.data ?? [];

  // ── Area → Clinic cascade (tenant-aware) ─────────────────────────────────────
  const { areaId, clinicId, setAreaId, setClinicId, setAreaQuery, setClinicQuery, areas, clinics, areasLoading, clinicsLoading, isTenantRequired } =
    useAreaClinicCascade();

  const form = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nhsNumber: "",
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      gender: "",
      dob: "",
      programId: "",
      clinicId: "",
      areaId: "",
    },
  });

  // Keep form in sync with cascade state
  useEffect(() => {
    form.setValue("areaId", areaId, { shouldValidate: !!areaId });
  }, [areaId]);

  useEffect(() => {
    form.setValue("clinicId", clinicId, { shouldValidate: !!clinicId });
  }, [clinicId]);

  const onSubmit = async (data: PatientForm) => {
    try {
      const payload = {
        ...data,
        gender: (data.gender && ["MALE", "FEMALE", "OTHER"].includes(data.gender.toUpperCase()))
          ? (data.gender.toUpperCase() as "MALE" | "FEMALE" | "OTHER")
          : undefined,
        dob: data.dob ? new Date(data.dob).toISOString() : undefined,
        email: data.email || undefined,
        title: data.title || undefined,
      };
      const patient = await createPatient.mutateAsync({ data: payload as any });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({ title: "Patient registered successfully" });
      setLocation(`/patients/${patient.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Please check the form details.",
      });
    }
  };

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div>
        <div className="mb-6">
          <Link href="/patients">
            <Button variant="ghost" size="sm" className="mb-4 -ml-3 text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Register New Patient</h1>
          <p className="text-muted-foreground mt-2">Enter patient demographics and clinical assignments.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>Basic patient identification</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nhsNumber"
                  render={({ field }) => (
                    <FormItem className="col-span-full md:col-span-1">
                      <FormLabel>NHS Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Mr, Mrs, Dr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
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
                        <Input placeholder="Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <SearchableSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select gender"
                        options={[
                          { label: "Male", value: "MALE" },
                          { label: "Female", value: "FEMALE" },
                          { label: "Other", value: "OTHER" },
                          { label: "Prefer not to say", value: "NOT_SPECIFIED" },
                        ]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="07700 900000" {...field} />
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
                      <FormLabel>Email Address (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="patient@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Clinical Assignments</CardTitle>
                <CardDescription>
                  Select an Area first — the Clinic dropdown will show only clinics within that area.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isTenantRequired && (
                  <div className="col-span-full flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Tenant selection required</p>
                      <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-0.5">
                        You are currently in &ldquo;Platform View (All Tenants)&rdquo; mode. Please select a specific
                        tenant from the sidebar switcher before registering a patient.
                      </p>
                    </div>
                  </div>
                )}
                {/* STEP 1: Area selector */}
                <FormField
                  control={form.control}
                  name="areaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Area
                      </FormLabel>
                      <SearchableSelect
                        value={areaId}
                        onValueChange={(val) => {
                          setAreaId(val);
                          field.onChange(val);
                          form.setValue("clinicId", "");
                          form.setValue("programId", "");
                        }}
                        onSearch={setAreaQuery}
                        disabled={areasLoading}
                        isLoading={areasLoading}
                        placeholder="Select area"
                        options={areas.map(a => ({ label: a.name, value: a.id }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* STEP 2: Clinic selector — disabled until area selected */}
                <FormField
                  control={form.control}
                  name="clinicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        Clinic
                        {areaId && <span className="text-xs text-muted-foreground font-normal ml-1">({clinics.length} available)</span>}
                      </FormLabel>
                      <SearchableSelect
                        value={clinicId}
                        onValueChange={(val) => {
                          setClinicId(val);
                          field.onChange(val);
                          form.setValue("programId", "", { shouldValidate: true });
                        }}
                        onSearch={setClinicQuery}
                        disabled={!areaId || clinicsLoading}
                        isLoading={clinicsLoading}
                        placeholder={!areaId ? "Select area first" : clinics.length === 0 ? "No clinics in this area" : "Select clinic"}
                        emptyMessage="No clinics found in this area"
                        options={clinics.map(c => ({ label: c.name, value: c.id }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* STEP 3: Program selector — disabled until clinic selected */}
                <FormField
                  control={form.control}
                  name="programId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program</FormLabel>
                      <SearchableSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={!clinicId ? "Select clinic first" : "Select program"}
                        disabled={!clinicId}
                        options={programs.map(p => ({ label: p.name, value: p.id }))}
                        onSearch={setProgramQuery}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/patients">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createPatient.isPending || isTenantRequired}>
                {createPatient.isPending ? "Registering..." : "Register Patient"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
