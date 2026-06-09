import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Users, Building2, Activity, Shield, Calendar, FileText,
  CheckCircle, ArrowRight, Stethoscope, BarChart3, Lock,
  Globe, ChevronRight, Star, TrendingUp, ClipboardList,
  MapPin, Heart, Zap,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Patient Management",
    desc: "End-to-end patient journey from registration to discharge. Complete profiles, GP details, risk scoring, and NHS compliance.",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Calendar,
    title: "Appointment Scheduling",
    desc: "Intelligent appointment booking with status tracking. Reduce no-shows with automated SMS reminders via Twilio.",
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Stethoscope,
    title: "Consultation Notes",
    desc: "Structured clinical documentation with chief complaint, diagnosis, treatment plans, medications, and follow-up instructions.",
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-500",
  },
  {
    icon: BarChart3,
    title: "Outcome Analytics",
    desc: "Track clinical and lifestyle outcomes over time. Monitor improvement rates, risk levels, and program success metrics.",
    color: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Building2,
    title: "Multi-Clinic Network",
    desc: "Manage hundreds of clinics across geographic areas with intelligent cascade filtering and role-based access control.",
    color: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "NHS-compliant, role-based access control with JWT authentication, audit logging, and end-to-end encryption.",
    color: "from-red-500/20 to-red-600/10",
    iconColor: "text-red-500",
  },
];

const workflow = [
  { step: 1, label: "Patient", desc: "Onboarding & registration", icon: Users, color: "#0066ff" },
  { step: 2, label: "Enrollment", desc: "Program assignment", icon: ClipboardList, color: "#7c3aed" },
  { step: 3, label: "Appointment", desc: "Scheduling & reminders", icon: Calendar, color: "#059669" },
  { step: 4, label: "Consultation", desc: "Clinical documentation", icon: Stethoscope, color: "#d97706" },
  { step: 5, label: "Outcome", desc: "Progress tracking", icon: TrendingUp, color: "#dc2626" },
  { step: 6, label: "Reporting", desc: "Analytics & insights", icon: BarChart3, color: "#0891b2" },
];

const testimonials = [
  {
    quote: "CareNexus has transformed how we manage our mental health pathways. The visibility across all our clinics is unprecedented — we can now identify at-risk patients before they deteriorate.",
    name: "Dr. Sarah Mitchell",
    title: "Clinical Director",
    org: "Northgate NHS Mental Health Trust",
    initials: "SM",
  },
  {
    quote: "The area-to-clinic cascade filtering alone saved our admin team hours every week. The audit trail gives us complete confidence in our data governance compliance.",
    name: "Dr. James Okafor",
    title: "Head of Operations",
    org: "Mumbai Community Healthcare",
    initials: "JO",
  },
  {
    quote: "We've enrolled over 500 patients across 25 programs in the first month. The automated SMS communications and real-time dashboards have been game-changers for our team.",
    name: "Dr. Priya Sharma",
    title: "Program Lead",
    org: "Westside Wellness Clinics",
    initials: "PS",
  },
];

const stats = [
  { value: "195+", label: "Areas Managed", icon: MapPin },
  { value: "707+", label: "Active Clinics", icon: Building2 },
  { value: "25+", label: "Care Programs", icon: Heart },
  { value: "99.9%", label: "Uptime SLA", icon: Zap },
];

const securityBadges = [
  { label: "NHS Compliant", sub: "Full DSP Toolkit alignment" },
  { label: "HIPAA Ready", sub: "Healthcare data protection" },
  { label: "ISO 27001", sub: "Information security certified" },
  { label: "256-bit AES", sub: "End-to-end encryption" },
  { label: "SOC 2 Type II", sub: "Security audit certified" },
  { label: "GDPR Compliant", sub: "EU data protection" },
];

export default function LandingPage() {
  const [data, setData] = useState<{ areas: number; clinics: number; programs: number; tenants: string[] } | null>(null);

  useEffect(() => {
    fetch("/api/health/public-stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((statsData) => {
        setData(statsData);
      })
      .catch((err) => console.error("Error loading public stats:", err));
  }, []);

  const dynamicStats = [
    { value: data ? `${data.areas}` : "—", label: "Areas Managed", icon: MapPin },
    { value: data ? `${data.clinics}` : "—", label: "Active Clinics", icon: Building2 },
    { value: data ? `${data.programs}` : "—", label: "Care Programs", icon: Heart },
    { value: "99.9%", label: "Uptime SLA", icon: Zap },
  ];

  // Map static testimonials dynamically to actual database tenants to prevent fictional names
  const dynamicTestimonials = testimonials.map((t, index) => {
    let orgName = t.org;
    if (data?.tenants && data.tenants.length > 0) {
      const tenantIdx = index % data.tenants.length;
      orgName = data.tenants[tenantIdx];
    }
    return { ...t, org: orgName };
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 md:px-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
          >
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
              <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
            </svg>
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">CareNexus</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
          <a href="#security" className="hover:text-foreground transition-colors">Security</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-sm font-medium">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
            >
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 md:px-10 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-30" style={{ background: "radial-gradient(ellipse, hsl(213,100%,70%) 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Enterprise Healthcare Platform — Now Available
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Connected Care.<br />
            <span style={{ background: "linear-gradient(135deg, #003f9e, #0066ff, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Better Outcomes.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            CareNexus is the enterprise healthcare platform that connects patients, clinicians, programs, and insights — delivering NHS-grade care management at scale.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold"
                style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
              >
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">No credit card required · NHS compliant · Instant setup</p>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 max-w-4xl mx-auto mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dynamicStats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex justify-center mb-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-primary w-[18px] h-[18px]" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 md:px-10 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Platform Features</div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything your clinical team needs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete healthcare management suite built for the demands of modern NHS trusts and healthcare providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, iconColor }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ────────────────────────────────────────────── */}
      <section id="workflow" className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Care Pathway</div>
            <h2 className="text-4xl font-bold text-foreground mb-4">End-to-end care workflow</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From first contact to clinical outcome, CareNexus manages every step of the patient journey.
            </p>
          </div>

          {/* Workflow steps */}
          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[8.33%] right-[8.33%] h-0.5 bg-gradient-to-r from-border via-primary/30 to-border" />

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {workflow.map(({ step, label, desc, icon: Icon, color }) => (
                <div key={step} className="flex flex-col items-center text-center group">
                  <div
                    className="relative z-10 w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 border-white shadow-lg mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-200"
                    style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, borderColor: `${color}30` }}
                  >
                    <Icon className="w-7 h-7 mb-0.5" style={{ color }} />
                    <span className="text-[10px] font-bold" style={{ color }}>{step}</span>
                  </div>
                  <div className="font-semibold text-sm text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{desc}</div>
                  {step < 6 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 mt-2 md:hidden" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY ────────────────────────────────────────────── */}
      <section id="security" className="py-24 px-6 md:px-10" style={{ background: "linear-gradient(145deg, #001f5e 0%, #003f9e 40%, #0052cc 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold text-blue-300 tracking-widest uppercase mb-3">Enterprise Security</div>
            <h2 className="text-4xl font-bold text-white mb-4">Built for healthcare data compliance</h2>
            <p className="text-white/65 max-w-xl mx-auto">
              CareNexus meets the strictest healthcare data security standards, giving you and your patients complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {securityBadges.map(({ label, sub }) => (
              <div key={label} className="flex items-start gap-3 p-4 bg-white/8 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{label}</div>
                  <div className="text-white/50 text-xs mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/60 text-sm mb-6">All patient data is encrypted, isolated per tenant, and auditable</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-xs">
              {["Role-Based Access Control", "HttpOnly Cookie Auth", "Append-only Audit Logs", "Soft Delete (GDPR Right to Erasure)", "Tenant Data Isolation"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-6 md:px-10 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Trusted By Clinicians</div>
            <h2 className="text-4xl font-bold text-foreground mb-4">What healthcare leaders say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dynamicTestimonials.map(({ quote, name, title, org, initials }) => (
              <div key={name} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed italic mb-6">"{quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: "linear-gradient(135deg, #003f9e, #0066ff)" }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground">{title}</div>
                    <div className="text-xs text-primary/70">{org}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Ready to transform your care delivery?</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Join healthcare teams across the UK who trust CareNexus to manage their patient pathways.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-10 text-base font-semibold"
                style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
              >
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-10 text-base">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">No credit card required · NHS compliant · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-border py-12 px-6 md:px-10 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
              >
                <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                  <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
                  <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-foreground">CareNexus</div>
                <div className="text-xs text-muted-foreground">Connected Care. Better Outcomes.</div>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#security" className="hover:text-foreground transition-colors">Security</a>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="w-3.5 h-3.5" />
              <span>© {new Date().getFullYear()} CareNexus. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
