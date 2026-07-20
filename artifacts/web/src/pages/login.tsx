import { useEffect, useState } from "react";
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
import {
  Shield, Lock, Activity, Users, Building2,
  CheckCircle, ArrowRight, Eye, EyeOff, Mail,
  Zap, Globe,
} from "lucide-react";

const BLUE = "#0b63f6";
const NAVY = "#060d1b";
const NAVY_CARD = "#0d1f3c";
const NAVY_BORDER = "#1a2f52";
const GREEN = "#059669";
const VIOLET = "#7c3aed";
const AMBER = "#f59e0b";
const blueGrad = "linear-gradient(135deg, #0a3d91 0%, #0b63f6 100%)";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  {
    icon: Users,
    label: "Patient Management",
    desc: "Comprehensive patient journey tracking and management",
    color: BLUE,
    bgColor: "rgba(11,99,246,0.12)",
  },
  {
    icon: Building2,
    label: "Multi-Clinic Network",
    desc: "Manage multiple clinics and locations seamlessly",
    color: GREEN,
    bgColor: "rgba(5,150,105,0.12)",
  },
  {
    icon: Activity,
    label: "Clinical Analytics",
    desc: "Real-time outcome tracking and advanced dashboards",
    color: VIOLET,
    bgColor: "rgba(124,58,237,0.12)",
  },
  {
    icon: Shield,
    label: "Enterprise Security",
    desc: "NHS-compliant, role-based access and data protection",
    color: AMBER,
    bgColor: "rgba(245,158,11,0.12)",
  },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [statsData, setStatsData] = useState<{ areas: number; clinics: number; programs: number } | null>(null);

  useEffect(() => {
    fetch("/api/health/public-stats")
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); })
      .then((data) => setStatsData(data))
      .catch((err) => console.error("Error loading stats:", err));
  }, []);

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

  const dynamicStats = [
    { value: statsData ? `${statsData.areas}` : "195+", label: "Areas", sublabel: "Across all regions", icon: Globe, color: BLUE },
    { value: statsData ? `${statsData.clinics}` : "707+", label: "Clinics", sublabel: "Connected facilities", icon: Building2, color: GREEN },
    { value: statsData ? `${statsData.programs}` : "25+", label: "Programs", sublabel: "Active programmes", icon: Users, color: VIOLET },
    { value: "99.9%", label: "Uptime", sublabel: "System reliability", icon: Zap, color: AMBER },
  ];

  return (
    <div className="min-h-screen w-full flex overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── LEFT — Auth panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-card relative">
        {/* Subtle top line accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: blueGrad }} />

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
          <div className="mx-auto w-full max-w-[380px]">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: blueGrad }}>
                <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                  <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
                  <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
                </svg>
              </div>
              <div>
                <div className="font-extrabold text-xl tracking-tight text-primary leading-none">CareNexus</div>
                <div className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5 font-medium">Enterprise Healthcare Platform</div>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">
                Welcome back <span role="img" aria-label="wave">👋</span>
              </h1>
              <p className="text-sm text-muted-foreground">Sign in to continue to your CareNexus account.</p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground">Email address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            placeholder="name@nhs.net"
                            className="h-11 pl-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-blue-500/20 rounded-xl"
                            {...field}
                            data-testid="input-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-1.5">
                        <FormLabel className="text-sm font-semibold text-foreground">Password</FormLabel>
                        <Link href="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: BLUE }}>
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-11 pl-9 pr-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-blue-500/20 rounded-xl"
                            {...field}
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
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

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-bold text-white rounded-xl shadow-md hover:opacity-90 transition-opacity mt-2"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit"
                  style={{ background: blueGrad }}
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </Form>

            {/* OR divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* NHS Identity SSO */}
            <button
              type="button"
              className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted/50 hover:border-border transition-all shadow-sm"
            >
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span>Sign in with NHS Identity</span>
              {/* NHS badge */}
              <span className="ml-1 text-xs font-extrabold text-white px-2 py-0.5 rounded" style={{ background: "#005EB8", letterSpacing: "-0.02em" }}>NHS</span>
            </button>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have a tenant account?{" "}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: BLUE }}>
                Register here
              </Link>
            </p>

            {/* Trust badges */}
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-5">
              {[
                { icon: Shield, label: "NHS Compliant", color: "#059669" },
                { icon: Shield, label: "256-bit Encryption", color: BLUE },
                { icon: CheckCircle, label: "HIPAA Ready", color: BLUE },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 sm:px-12 lg:px-16 py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} CareNexus. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <a href="#" className="hover:text-muted-foreground transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-muted-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Branding panel (desktop only) ─────────────────── */}
      <div
        className="hidden lg:flex relative w-[54%] flex-col overflow-hidden"
        style={{ background: NAVY }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Cross watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none" style={{ opacity: 0.03 }}>
          <svg viewBox="0 0 200 200" fill="none" style={{ width: "480px", height: "480px" }}>
            <rect x="80" y="10" width="40" height="180" rx="8" fill="white" />
            <rect x="10" y="80" width="180" height="40" rx="8" fill="white" />
          </svg>
        </div>

        {/* Radial glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(circle at 80% 10%, rgba(11,99,246,0.18) 0%, transparent 60%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none" style={{ background: "radial-gradient(circle at 20% 90%, rgba(124,58,237,0.12) 0%, transparent 60%)" }} />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">

          {/* Top bar */}
          <div className="flex items-start justify-between mb-12">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                  <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.9" />
                  <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.9" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-white text-base leading-none">CareNexus</div>
                <div className="text-[9px] tracking-widest uppercase mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>Enterprise Healthcare Platform</div>
              </div>
            </div>

            {/* Platform status badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ background: "rgba(5,150,105,0.12)", borderColor: "rgba(5,150,105,0.25)" }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN }} />
              <div className="text-right">
                <p className="text-[9px] font-bold text-emerald-400 leading-none">Platform Status</p>
                <p className="text-[9px] text-emerald-300/70 mt-0.5 leading-none">All Systems Operational</p>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h2 className="text-4xl xl:text-[2.75rem] font-extrabold text-white leading-tight tracking-tight mb-4">
              Clinical-Grade<br />
              <span style={{ background: "linear-gradient(90deg, #60a5fa 0%, #818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Healthcare Operations
              </span>
            </h2>
            <p className="text-base leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.55)" }}>
              A unified platform for managing patient care, clinical programs, appointments, consultations, and outcomes — built for NHS trusts and healthcare providers.
            </p>
          </div>

          {/* Feature cards — 2×2 grid */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {features.map(({ icon: Icon, label, desc, color, bgColor }) => (
              <div
                key={label}
                className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02] cursor-default"
                style={{ background: NAVY_CARD, border: `1px solid ${NAVY_BORDER}` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bgColor }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="font-bold text-sm text-white mb-1">{label}</p>
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-auto">
            <div className="grid grid-cols-4 gap-3 pt-8 border-t" style={{ borderColor: NAVY_BORDER }}>
              {dynamicStats.map(({ value, label, sublabel, icon: Icon, color }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color, width: "18px", height: "18px" }} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-white leading-none">{value}</p>
                    <p className="text-[11px] font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{sublabel}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom trust line */}
            <div className="mt-6 flex items-center justify-center gap-2 py-3 border-t" style={{ borderColor: NAVY_BORDER }}>
              <Lock className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                Trusted by healthcare providers worldwide · Secure. Compliant. Reliable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
