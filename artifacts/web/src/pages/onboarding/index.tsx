import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useListRoles, customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Map,
  ShieldAlert,
  CheckCircle2,
  User,
  ListTodo,
  Loader2,
  FolderGit2,
  Hospital
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sequential API calls using direct customFetch or api-client actions
import {
  createTenant,
  createArea,
  createClinic,
  createProgram,
  createUser
} from "@workspace/api-client-react";

export default function OnboardingPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: roles, isLoading: loadingRoles } = useListRoles();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Tenant
    tenantName: "",
    tenantDomain: "",
    // Step 2: Area
    areaName: "",
    areaDescription: "",
    // Step 3: Clinic
    clinicName: "",
    clinicAddress: "",
    clinicCity: "",
    clinicPhone: "",
    clinicEmail: "",
    // Step 4: Program
    programName: "",
    programDescription: "",
    // Step 5: Clinic Admin User
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    adminMobile: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step names
  const steps = [
    { title: "Tenant", icon: Building2, desc: "Organization details" },
    { title: "Area", icon: Map, desc: "Regional scope" },
    { title: "Clinic", icon: Hospital, desc: "Primary clinic site" },
    { title: "Program", icon: FolderGit2, desc: "Initial care program" },
    { title: "Clinic Admin", icon: User, desc: "Manager credentials" },
    { title: "Confirm", icon: ListTodo, desc: "Review & Provision" },
  ];

  // Client-side step validation
  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.tenantName.trim()) {
          toast({ variant: "destructive", title: "Tenant Name required" });
          return false;
        }
        if (!formData.tenantDomain.trim()) {
          toast({ variant: "destructive", title: "Tenant Domain required" });
          return false;
        }
        // Domain format validation (simple check)
        if (!/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(formData.tenantDomain)) {
          toast({ variant: "destructive", title: "Invalid Domain", description: "Must be a valid domain (e.g. apollo.com)" });
          return false;
        }
        return true;
      case 2:
        if (!formData.areaName.trim()) {
          toast({ variant: "destructive", title: "Area Name required" });
          return false;
        }
        return true;
      case 3:
        if (!formData.clinicName.trim()) {
          toast({ variant: "destructive", title: "Clinic Name required" });
          return false;
        }
        return true;
      case 4:
        if (!formData.programName.trim()) {
          toast({ variant: "destructive", title: "Program Name required" });
          return false;
        }
        return true;
      case 5:
        if (!formData.adminFirstName.trim()) {
          toast({ variant: "destructive", title: "Admin First Name required" });
          return false;
        }
        if (!formData.adminLastName.trim()) {
          toast({ variant: "destructive", title: "Admin Last Name required" });
          return false;
        }
        if (!formData.adminEmail.trim()) {
          toast({ variant: "destructive", title: "Admin Email required" });
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
          toast({ variant: "destructive", title: "Invalid Email", description: "Please provide a valid email format" });
          return false;
        }
        if (formData.adminPassword.length < 8) {
          toast({ variant: "destructive", title: "Password too short", description: "Must be at least 8 characters long" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleProvision = async () => {
    setIsSubmitting(true);
    setSubmitProgress([]);

    // Find the Clinic Admin role ID
    const clinicAdminRole = roles?.data.find((r) => r.name === "CLINIC_ADMIN");
    if (!clinicAdminRole) {
      toast({
        variant: "destructive",
        title: "Role missing",
        description: "CLINIC_ADMIN role could not be resolved. Please make sure database roles are seeded.",
      });
      setIsSubmitting(false);
      return;
    }

    const addProgress = (msg: string) => {
      setSubmitProgress((prev) => [...prev, msg]);
    };

    try {
      // Step 1: Create Tenant
      setCurrentAction("Creating Organization...");
      addProgress("Initializing tenant creation...");
      const tenant = await createTenant({
        name: formData.tenantName,
        domain: formData.tenantDomain,
      });
      addProgress(`Tenant "${tenant.name}" created successfully (ID: ${tenant.id}).`);

      // Set headers for all subsequent calls
      const headers = { "x-tenant-id": tenant.id };

      // Step 2: Create Area
      setCurrentAction("Creating Area/Region...");
      addProgress("Creating regional area context...");
      const area = await createArea(
        {
          name: formData.areaName,
          description: formData.areaDescription || `Initial area for ${tenant.name}`,
        },
        { headers }
      );
      addProgress(`Area "${area.name}" created (ID: ${area.id}).`);

      // Step 3: Create Clinic
      setCurrentAction("Creating Clinic Site...");
      addProgress("Creating primary clinic site...");
      const clinic = await createClinic(
        {
          name: formData.clinicName,
          areaId: area.id,
          address: formData.clinicAddress || undefined,
          city: formData.clinicCity || undefined,
          phone: formData.clinicPhone || undefined,
          email: formData.clinicEmail || undefined,
        },
        { headers }
      );
      addProgress(`Clinic "${clinic.name}" created (ID: ${clinic.id}).`);

      // Step 4: Create Program
      setCurrentAction("Creating Care Program...");
      addProgress("Creating primary care program...");
      const program = await createProgram(
        {
          name: formData.programName,
          description: formData.programDescription || `Default program for ${tenant.name}`,
        },
        { headers }
      );
      addProgress(`Program "${program.name}" created (ID: ${program.id}).`);

      // Step 5: Create Clinic Admin User
      setCurrentAction("Creating Clinic Administrator...");
      addProgress("Creating administrator credentials...");
      const user = await createUser(
        {
          roleId: clinicAdminRole.id,
          firstName: formData.adminFirstName,
          lastName: formData.adminLastName,
          email: formData.adminEmail,
          password: formData.adminPassword,
          mobile: formData.adminMobile || undefined,
          clinicIds: [clinic.id],
          programIds: [program.id],
        },
        { headers }
      );
      addProgress(`Administrator "${user.firstName} ${user.lastName}" provisioned.`);

      setCurrentAction("Onboarding complete!");
      addProgress("Finalizing configuration...");

      // Invalidate dashboard and lists
      queryClient.invalidateQueries({ queryKey: ["tenants-admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });

      toast({
        title: "Hospital Provisioned Successfully!",
        description: `Tenant, Area, Clinic, Program, and Admin account created for ${tenant.name}`,
      });

      // Redirect back to Tenants view after brief delay
      setTimeout(() => {
        setLocation("/tenants");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Provisioning Failed",
        description: err.message || "An unexpected error occurred during sequencing.",
      });
      addProgress(`❌ Error: ${err.message || "Operation failed."}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container animate-in-up">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/tenants">
            <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tenants
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Hospital Onboarding Wizard</h1>
          <p className="text-muted-foreground mt-1">
            Provision a new Tenant environment along with its Area, Clinic, Care Program, and Administrator in a single unified flow.
          </p>
        </div>

        {/* Stepper Header */}
        <div className="relative mb-10">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0 hidden md:block" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-4 md:gap-0">
            {steps.map((s, idx) => {
              const stepNum = idx + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              const Icon = s.icon;

              return (
                <div key={idx} className="flex-1 flex flex-row md:flex-col items-center md:text-center px-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold shrink-0 shadow-sm",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary scale-110 ring-4 ring-primary/20"
                        : isCompleted
                        ? "bg-success text-success-foreground border-success"
                        : "bg-background text-muted-foreground border-muted-foreground/30"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                  </div>
                  <div className="ml-4 md:ml-0 md:mt-2">
                    <p className={cn("text-xs font-semibold tracking-wide uppercase", isActive ? "text-primary font-bold" : isCompleted ? "text-success" : "text-muted-foreground")}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground hidden lg:block max-w-[120px] mx-auto mt-0.5 leading-tight">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        {!isSubmitting ? (
          <Card className="glass-card shadow-lg border-primary/10">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {(() => {
                    const CurrentIcon = steps[step - 1].icon;
                    return <CurrentIcon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <CardTitle className="text-xl">Step {step}: {steps[step - 1].title}</CardTitle>
                  <CardDescription className="text-sm mt-0.5">{steps[step - 1].desc}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 min-h-[300px]">
              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Tenant/Hospital Name *</label>
                    <Input
                      placeholder="e.g. Sahayog Super Specialty Hospital"
                      value={formData.tenantName}
                      onChange={(e) => updateField("tenantName", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">The formal legal/operating name of this healthcare organization.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Tenant Domain *</label>
                    <Input
                      placeholder="e.g. sahayog.com"
                      value={formData.tenantDomain}
                      onChange={(e) => updateField("tenantDomain", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Used for workspace URL partitioning and authentication rules.</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Area/Region Name *</label>
                    <Input
                      placeholder="e.g. Mumbai East Region"
                      value={formData.areaName}
                      onChange={(e) => updateField("areaName", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">A geographic or functional grouping inside this tenant.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Description</label>
                    <Textarea
                      placeholder="Enter a brief description of this operational region"
                      value={formData.areaDescription}
                      onChange={(e) => updateField("areaDescription", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Clinic Name *</label>
                    <Input
                      placeholder="e.g. Sahayog Clinic Bhandup"
                      value={formData.clinicName}
                      onChange={(e) => updateField("clinicName", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">The actual location site where healthcare is delivered.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">City</label>
                      <Input
                        placeholder="Mumbai"
                        value={formData.clinicCity}
                        onChange={(e) => updateField("clinicCity", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Phone Number</label>
                      <Input
                        placeholder="+91 22 2345 6789"
                        value={formData.clinicPhone}
                        onChange={(e) => updateField("clinicPhone", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Clinic Email</label>
                      <Input
                        type="email"
                        placeholder="bhandup@sahayog.com"
                        value={formData.clinicEmail}
                        onChange={(e) => updateField("clinicEmail", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Address</label>
                      <Input
                        placeholder="LBS Road, Bhandup West"
                        value={formData.clinicAddress}
                        onChange={(e) => updateField("clinicAddress", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Initial Care Program Name *</label>
                    <Input
                      placeholder="e.g. Remote Hypertension Monitoring"
                      value={formData.programName}
                      onChange={(e) => updateField("programName", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">The default clinical care program patients will be registered to.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Description</label>
                    <Textarea
                      placeholder="Clinical guidelines, scope, or target cohort description"
                      value={formData.programDescription}
                      onChange={(e) => updateField("programDescription", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Admin First Name *</label>
                      <Input
                        placeholder="John"
                        value={formData.adminFirstName}
                        onChange={(e) => updateField("adminFirstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Admin Last Name *</label>
                      <Input
                        placeholder="Doe"
                        value={formData.adminLastName}
                        onChange={(e) => updateField("adminLastName", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="admin@sahayog.com"
                      value={formData.adminEmail}
                      onChange={(e) => updateField("adminEmail", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Initial Password *</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={formData.adminPassword}
                        onChange={(e) => updateField("adminPassword", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Mobile Number</label>
                      <Input
                        placeholder="+91 98765 43210"
                        value={formData.adminMobile}
                        onChange={(e) => updateField("adminMobile", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6">
                  <p className="text-muted-foreground text-sm">
                    Please review all parameters before provisioning this hospital. All entities will be constructed sequentially.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2 bg-muted/20">
                      <h3 className="font-semibold flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-primary" /> Tenant Info
                      </h3>
                      <p className="text-sm"><span className="text-muted-foreground">Name:</span> {formData.tenantName}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Domain:</span> {formData.tenantDomain}</p>
                    </div>

                    <div className="border rounded-lg p-4 space-y-2 bg-muted/20">
                      <h3 className="font-semibold flex items-center gap-2 text-sm">
                        <Map className="w-4 h-4 text-primary" /> Area Info
                      </h3>
                      <p className="text-sm"><span className="text-muted-foreground">Name:</span> {formData.areaName}</p>
                      {formData.areaDescription && <p className="text-sm truncate"><span className="text-muted-foreground">Desc:</span> {formData.areaDescription}</p>}
                    </div>

                    <div className="border rounded-lg p-4 space-y-2 bg-muted/20">
                      <h3 className="font-semibold flex items-center gap-2 text-sm">
                        <Hospital className="w-4 h-4 text-primary" /> Clinic Info
                      </h3>
                      <p className="text-sm"><span className="text-muted-foreground">Name:</span> {formData.clinicName}</p>
                      {formData.clinicCity && <p className="text-sm"><span className="text-muted-foreground">Location:</span> {formData.clinicCity}</p>}
                    </div>

                    <div className="border rounded-lg p-4 space-y-2 bg-muted/20">
                      <h3 className="font-semibold flex items-center gap-2 text-sm">
                        <FolderGit2 className="w-4 h-4 text-primary" /> Care Program
                      </h3>
                      <p className="text-sm"><span className="text-muted-foreground">Name:</span> {formData.programName}</p>
                    </div>

                    <div className="border rounded-lg p-4 space-y-2 bg-muted/20 md:col-span-2">
                      <h3 className="font-semibold flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-primary" /> Clinic Administrator
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p><span className="text-muted-foreground">Name:</span> {formData.adminFirstName} {formData.adminLastName}</p>
                        <p><span className="text-muted-foreground">Email:</span> {formData.adminEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border-warning/30 border bg-warning/5 p-4 flex gap-3 text-warning-foreground text-sm">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-warning" />
                    <div>
                      <h4 className="font-semibold text-warning">Infrastructure Provisioning warning</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        This action will write live entities to the production environment. Complete rollbacks must be performed manually if errors occur mid-provisioning.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <Button onClick={handleNext}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleProvision}
                  className="bg-primary hover:bg-primary/90"
                  disabled={loadingRoles}
                >
                  {loadingRoles ? "Resolving Roles..." : "Provision Hospital"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          /* Submission / Provisioning Progress Card */
          <Card className="glass-card shadow-lg border-primary/20">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <div>
                  <CardTitle className="text-xl">Provisioning Hospital Environment...</CardTitle>
                  <CardDescription className="text-sm mt-0.5">{currentAction}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="bg-black/95 text-green-400 font-mono text-xs p-4 rounded-lg min-h-[200px] max-h-[300px] overflow-y-auto space-y-2 border border-border">
                  {submitProgress.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-muted-foreground select-none">[{i + 1}]</span>
                      <span className="whitespace-pre-wrap">{p}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-primary animate-pulse">
                    <span>&gt;</span>
                    <span>{currentAction}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Please do not reload the page or navigate away.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
