import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Lock, CheckCircle, ArrowRight,
  Building2, Users, Activity, Eye, EyeOff, Mail, Globe,
} from "lucide-react";

// ── Brand
const BLUE = "#0b63f6";
const NAVY = "#060d1b";
const NAVY_CARD = "#0d1f3c";
const NAVY_BORDER = "#1a2f52";
const GREEN = "#059669";
const VIOLET = "#7c3aed";
const AMBER = "#f59e0b";
const blueGrad = "linear-gradient(135deg, #0a3d91 0%, #0b63f6 100%)";

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
  {
    icon: Users, color: BLUE, bg: "rgba(11,99,246,0.12)",
    title: "Multi-tenant patient management",
    desc: "Isolated, secure environments for every healthcare organisation",
  },
  {
    icon: Building2, color: GREEN, bg: "rgba(5,150,105,0.12)",
    title: "Area & clinic hierarchy",
    desc: "Manage hundreds of clinics across geographic areas from one control plane",
  },
  {
    icon: Activity, color: VIOLET, bg: "rgba(124,58,237,0.12)",
    title: "Real-time clinical analytics",
    desc: "Programme outcomes, patient risk, and ICB-ready reporting dashboards",
  },
  {
    icon: Shield, color: AMBER, bg: "rgba(245,158,11,0.12)",
    title: "Enterprise-grade security",
    desc: "NHS-compliant, role-based access with full GDPR audit trail",
  },
];

const steps = [
  { n: "1", label: "Register" },
  { n: "2", label: "Verify email" },
  { n: "3", label: "Set up clinics" },
  { n: "4", label: "Go live" },
];

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { tenantName: "", tenantDomain: "", firstName: "", lastName: "", email: "", password: "" },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync({ data });
      toast({
        title: "Registration successful",
        description: "Please check your email for the verification link before signing in.",
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
    <div className="min-h-screen w-full flex overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── LEFT — Auth panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-card relative overflow-y-auto">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ background: blueGrad }} />

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
          <div className="mx-auto w-full max-w-[420px]">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: blueGrad }}>
                <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                  <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
                  <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
                </svg>
              </div>
              <div>
                <div className="font-extrabold text-xl tracking-tight leading-none text-primary">CareNexus</div>
                <div className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5 font-medium">Enterprise Healthcare Platform</div>
              </div>
            </div>

            {/* Onboarding stepper */}
            <div className="flex items-center gap-0 mb-8">
              {steps.map((s, i) => (
                <div key={s.n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${i === 0 ? "text-white" : "bg-muted text-muted-foreground"}`}
                      style={i === 0 ? { background: blueGrad } : undefined}
                    >
                      {i === 0 ? s.n : <span>{s.n}</span>}
                    </div>
                    <span className={`text-[9px] font-semibold whitespace-nowrap ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-px mx-2 mb-4" style={{ background: i === 0 ? BLUE : "hsl(var(--border))" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">Create your organisation</h1>
              <p className="text-sm text-muted-foreground">Register a new CareNexus tenant for your healthcare provider.</p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* Organisation Details */}
                <div className="rounded-2xl border border-border bg-muted/50/60 p-5 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${BLUE}12` }}>
                      <Building2 className="w-3.5 h-3.5" style={{ color: BLUE }} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Organisation Details</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="tenantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Organisation Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="St. Jude's Mental Health Trust"
                            className="h-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-blue-500/20 rounded-xl text-sm"
                            {...field}
                          />
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
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subdomain</FormLabel>
                        <FormControl>
                          <div className="flex items-center rounded-xl overflow-hidden border border-border bg-card focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <div className="flex items-center pl-3 shrink-0">
                              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <Input
                              placeholder="stjudes"
                              {...field}
                              className="h-10 border-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground rounded-none text-sm flex-1"
                            />
                            <div className="px-3 h-10 flex items-center text-sm font-semibold text-muted-foreground border-l border-border bg-muted/50 shrink-0 whitespace-nowrap">
                              .carenexus.health
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Administrator Account */}
                <div className="rounded-2xl border border-border bg-muted/50/60 p-5 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${VIOLET}12` }}>
                      <Users className="w-3.5 h-3.5" style={{ color: VIOLET }} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Administrator Account</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane" className="h-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-blue-500/20 rounded-xl text-sm" {...field} />
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
                          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" className="h-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-blue-500/20 rounded-xl text-sm" {...field} />
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
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Admin Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                              placeholder="admin@northgate.nhs.uk"
                              className="h-10 pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-blue-500/20 rounded-xl text-sm"
                              {...field}
                            />
                          </div>
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
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Minimum 8 characters"
                              className="h-10 pl-9 pr-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-blue-500/20 rounded-xl text-sm"
                              {...field}
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
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-bold text-white rounded-xl shadow-md hover:opacity-90 transition-opacity"
                  disabled={registerMutation.isPending}
                  style={{ background: blueGrad }}
                >
                  {registerMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Complete Registration <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </Form>

            {/* Sign-in link */}
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: BLUE }}>
                Sign in
              </Link>
            </p>

            {/* Trust badges */}
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-5">
              {[
                { icon: Shield, label: "NHS Compliant", color: "#059669" },
                { icon: Lock, label: "256-bit Encrypted", color: BLUE },
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
        className="hidden lg:flex relative w-[52%] flex-col overflow-hidden"
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

            {/* Free setup badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ background: "rgba(11,99,246,0.15)", borderColor: "rgba(11,99,246,0.3)" }}>
              <CheckCircle className="w-3 h-3" style={{ color: "#60a5fa" }} />
              <span className="text-[10px] font-bold" style={{ color: "#93c5fd" }}>Free onboarding included</span>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h2 className="text-4xl xl:text-[2.75rem] font-extrabold text-white leading-tight tracking-tight mb-4">
              Everything your<br />
              <span style={{ background: "linear-gradient(90deg, #60a5fa 0%, #818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                clinical team needs
              </span>
            </h2>
            <p className="text-base leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.5)" }}>
              From patient onboarding to outcome tracking, CareNexus provides an end-to-end care management system built for healthcare excellence.
            </p>
          </div>

          {/* Benefits — vertical list with colored icons */}
          <div className="space-y-3 mb-10">
            {benefits.map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl p-4 transition-all duration-200"
                style={{ background: NAVY_CARD, border: `1px solid ${NAVY_BORDER}` }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-snug">{title}</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div
            className="mt-auto rounded-2xl p-5"
            style={{ background: NAVY_CARD, border: `1px solid ${NAVY_BORDER}` }}
          >
            {/* Quote marks */}
            <div className="text-4xl font-serif leading-none mb-2" style={{ color: `${BLUE}50` }}>"</div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>
              CareNexus transformed how we manage our patient pathways. The visibility across all our clinics is unprecedented.
            </p>
            <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: NAVY_BORDER }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0" style={{ background: blueGrad }}>
                SM
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Dr. Sarah Mitchell</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Clinical Director, Northgate NHS Trust</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-xs">★</span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom trust line */}
          <div className="mt-5 flex items-center justify-center gap-2 py-3 border-t" style={{ borderColor: NAVY_BORDER }}>
            <Lock className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Your data is encrypted end-to-end · NHS-compliant from day one
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
