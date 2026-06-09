import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, CheckCircle, ArrowRight, Building2, Users, Activity } from "lucide-react";

const registerSchema = z.object({
  tenantName: z.string().min(2, "Organisation name is required"),
  tenantDomain: z.string().min(2, "Domain is required"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

const benefits = [
  { icon: Users, text: "Multi-tenant patient management" },
  { icon: Building2, text: "Area & clinic hierarchy" },
  { icon: Activity, text: "Real-time clinical analytics" },
  { icon: Shield, text: "Enterprise-grade security" },
];

export default function RegisterPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tenantName: "",
      tenantDomain: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync({ data });
      toast({
        title: "Registration successful",
        description: "Please check the server console for the email verification link to verify your account before logging in.",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Please check your details and try again.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Left — Auth Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-12 relative z-10 overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/3 pointer-events-none" />

        <div className="relative mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
            >
              <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
                <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-xl tracking-tight text-foreground leading-none">CareNexus</div>
              <div className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Connected Care. Better Outcomes.</div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">Create your organisation</h1>
            <p className="text-sm text-muted-foreground">Register a new CareNexus tenant for your healthcare provider.</p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Organisation section */}
              <div className="space-y-4 p-4 border border-border/60 rounded-xl bg-muted/20">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Organisation Details
                </h3>
                <FormField
                  control={form.control}
                  name="tenantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Organisation Name</FormLabel>
                      <FormControl>
                        <Input placeholder="St. Jude's Mental Health Trust" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tenantDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Subdomain</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input placeholder="stjudes" {...field} className="rounded-r-none h-10 border-r-0 focus-visible:z-10" />
                          <div className="bg-muted border border-border px-3 py-2 text-sm text-muted-foreground rounded-r-lg h-10 flex items-center shrink-0">
                            .carenexus.health
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Admin account section */}
              <div className="space-y-4 p-4 border border-border/60 rounded-xl bg-muted/20">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Administrator Account
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane" className="h-10" {...field} />
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
                        <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Admin Email</FormLabel>
                      <FormControl>
                        <Input placeholder="jane.doe@nhs.net" className="h-10" {...field} />
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
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Min. 8 characters" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold"
                disabled={registerMutation.isPending}
                style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Complete Registration <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-5 border-t border-border/60">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>NHS Compliant</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Encrypted</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
                <span>HIPAA Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Branding Panel (desktop only) */}
      <div
        className="hidden lg:flex relative w-[45%] flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #001f5e 0%, #003f9e 40%, #0066ff 100%)" }}
      >
        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }} />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise Healthcare Platform
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Everything your<br />
            <span className="text-blue-300">clinical team needs</span>
          </h2>
          <p className="text-white/65 text-base leading-relaxed">
            From patient onboarding to outcome tracking, CareNexus provides an end-to-end care management system built for healthcare excellence.
          </p>
        </div>

        {/* Benefits list */}
        <div className="relative z-10 space-y-4">
          {benefits.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-blue-300" />
              </div>
              <span className="text-white/80 text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 p-5 bg-white/8 rounded-xl border border-white/10">
          <p className="text-white/70 text-sm italic leading-relaxed">
            "CareNexus transformed how we manage our patient pathways. The visibility across all our clinics is unprecedented."
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-400/30 flex items-center justify-center text-xs font-bold text-white">SM</div>
            <div>
              <div className="text-white text-xs font-medium">Dr. Sarah Mitchell</div>
              <div className="text-white/40 text-[10px]">Clinical Director, Northgate NHS Trust</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
