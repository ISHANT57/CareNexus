import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Activity, Users, Building2, CheckCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: Users, label: "Patient Management", desc: "Comprehensive patient journey tracking" },
  { icon: Building2, label: "Multi-Clinic Network", desc: "195 areas, 707 clinics connected" },
  { icon: Activity, label: "Clinical Analytics", desc: "Real-time outcome & risk dashboards" },
  { icon: Shield, label: "Enterprise Security", desc: "NHS-compliant, role-based access" },
];

const stats = [
  { value: "195+", label: "Areas" },
  { value: "707+", label: "Clinics" },
  { value: "25+", label: "Programs" },
  { value: "99.9%", label: "Uptime" },
];

export default function LoginPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [statsData, setStatsData] = useState<{ areas: number; clinics: number; programs: number } | null>(null);

  useEffect(() => {
    fetch("/api/health/public-stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setStatsData(data);
      })
      .catch((err) => console.error("Error loading stats:", err));
  }, []);

  const dynamicStats = [
    { value: statsData ? `${statsData.areas}` : "—", label: "Areas" },
    { value: statsData ? `${statsData.clinics}` : "—", label: "Clinics" },
    { value: statsData ? `${statsData.programs}` : "—", label: "Programs" },
    { value: "99.9%", label: "Uptime" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified. You can now sign in.",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await loginMutation.mutateAsync({ data });
      localStorage.setItem("access_token", response.accessToken);
      setAuthTokenGetter(() => localStorage.getItem("access_token"));
      await queryClient.invalidateQueries({ queryKey: ["getMe"] });
      setLocation("/dashboard");
    } catch (error: any) {
      const errorMsg = error.data?.error?.message || error.message || "Please check your credentials and try again.";
      toast({ variant: "destructive", title: "Login failed", description: errorMsg });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Left — Auth Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-12 relative z-10">
        {/* Background subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/3 pointer-events-none" />

        <div className="relative mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your CareNexus account to continue.</p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@nhs.net"
                        className="h-11 bg-background border-border/80 focus-visible:border-primary"
                        {...field}
                        data-testid="input-email"
                      />
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-11 bg-background border-border/80 focus-visible:border-primary pr-10"
                          {...field}
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold mt-2"
                disabled={loginMutation.isPending}
                data-testid="button-submit"
                style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have a tenant account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 pt-6 border-t border-border/60">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>NHS Compliant</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>256-bit Encryption</span>
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
        className="hidden lg:flex relative w-[52%] flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #001f5e 0%, #003f9e 40%, #0066ff 100%)" }}
      >
        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }} />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 border-2 border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-5 border-2 border-white" />
        </div>

        {/* Top — Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
                <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-white text-lg tracking-tight">CareNexus</div>
              <div className="text-white/50 text-[10px] tracking-widest uppercase">Enterprise Healthcare Platform</div>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Clinical-Grade<br />
            <span className="text-blue-300">Healthcare Operations</span>
          </h2>
          <p className="text-white/65 text-base leading-relaxed max-w-md">
            A unified platform for managing patient care, clinical programs, appointments, consultations, and outcomes — built for NHS trusts and healthcare providers.
          </p>
        </div>

        {/* Middle — Feature list */}
        <div className="relative z-10 space-y-4">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-4 group">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
                <Icon className="w-4.5 h-4.5 text-blue-300 w-[18px] h-[18px]" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{label}</div>
                <div className="text-white/50 text-xs mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom — Stats */}
        <div className="relative z-10">
          <div className="grid grid-cols-4 gap-4 pt-8 border-t border-white/10">
            {dynamicStats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-white/50 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
