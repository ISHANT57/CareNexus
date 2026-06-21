import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Users, Building2, Shield, Calendar, Stethoscope, BarChart3,
  CheckCircle, ArrowRight, Star, TrendingUp, ClipboardList,
  Globe, Phone, Cloud, FileX, Database, MonitorSmartphone,
  Network, Wallet, HeartHandshake, Gauge, Headphones, Quote,
  MapPin, Heart, Zap, ChevronRight, Mail,
  Linkedin, Twitter, Facebook, Instagram, Youtube,
} from "lucide-react";

// ── MocDoc-style brand palette (white-dominant, blue primary + orange accent)
const BLUE = "#0b63f6";
const BLUE_DARK = "#0a3d91";
const ORANGE = "#ff7a1a";
const blueGrad = "linear-gradient(135deg, #0a3d91 0%, #0b63f6 100%)";
const orangeGrad = "linear-gradient(135deg, #ff7a1a 0%, #ff9a3d 100%)";

// ── Product / solution cards (MocDoc "Best Cloud-based Healthcare..." block)
const products = [
  {
    icon: Users,
    title: "Patient Management",
    points: ["End-to-end patient journey", "GP details & NHS compliance", "Risk scoring & journey tracking"],
    accent: BLUE,
  },
  {
    icon: Calendar,
    title: "Appointment Scheduling",
    points: ["Smart booking & status tracking", "Automated SMS reminders", "Reduce no-shows"],
    accent: ORANGE,
  },
  {
    icon: Stethoscope,
    title: "Clinical Consultations",
    points: ["Structured consultation notes", "Diagnosis & treatment plans", "Medications & follow-ups"],
    accent: BLUE,
  },
  {
    icon: BarChart3,
    title: "Outcome Analytics",
    points: ["Clinical & lifestyle outcomes", "Improvement & risk dashboards", "Program success metrics"],
    accent: ORANGE,
  },
];

// ── "Is Outdated Technology Slowing You Down?" — 6 value cards
const valueCards = [
  { icon: Cloud, title: "Zero Maintenance", desc: "Fully cloud-based with 99.9% uptime. No servers, no patches, no downtime." },
  { icon: FileX, title: "Paperless Practice", desc: "Digitise every record. Find any patient, note, or report in seconds." },
  { icon: Database, title: "Secure Backup & 24/7 Access", desc: "Encrypted, tenant-isolated backups you can reach anywhere, anytime." },
  { icon: MonitorSmartphone, title: "Any Device, Anywhere", desc: "Full access from desktop, tablet, or mobile — built responsive-first." },
  { icon: Network, title: "Multi-Location Management", desc: "Run hundreds of clinics across areas from a single control plane." },
  { icon: Wallet, title: "Minimal Cost", desc: "No upfront hardware. Pay only for what your organisation actually uses." },
];

// ── "Achieve More With Us" — 3 columns
const achieve = [
  {
    icon: HeartHandshake,
    title: "Elevate Patient Experience",
    accent: BLUE,
    items: ["Online presence & accessibility", "Queue & appointment management", "Email, SMS & WhatsApp reminders", "Feedback-driven improvements"],
  },
  {
    icon: Gauge,
    title: "Enhance Operational Efficiency",
    accent: ORANGE,
    items: ["Process automation", "Faster clinical decisions", "Data insights for optimisation", "End-to-end workflow management"],
  },
  {
    icon: TrendingUp,
    title: "Boost Outcomes & Revenue",
    accent: BLUE,
    items: ["Effective program pricing", "B2B / ICB settlements", "Reduce care leakage", "Maximise enrolment value"],
  },
];

const workflow = [
  { step: 1, label: "Patient", desc: "Onboarding & registration", icon: Users, color: BLUE },
  { step: 2, label: "Enrollment", desc: "Program assignment", icon: ClipboardList, color: ORANGE },
  { step: 3, label: "Appointment", desc: "Scheduling & reminders", icon: Calendar, color: BLUE },
  { step: 4, label: "Consultation", desc: "Clinical documentation", icon: Stethoscope, color: ORANGE },
  { step: 5, label: "Outcome", desc: "Progress tracking", icon: TrendingUp, color: BLUE },
  { step: 6, label: "Reporting", desc: "Analytics & insights", icon: BarChart3, color: ORANGE },
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

// ── Impact metrics (MocDoc 78% / 4X / 6X)
const impact = [
  { value: "78%", label: "Improved Patient Experience" },
  { value: "4X", label: "Increase in Operational Efficiency" },
  { value: "6X", label: "Increase in Program Throughput" },
];

const securityBadges = [
  "NHS Compliant", "HIPAA Ready", "ISO 27001", "256-bit AES", "SOC 2 Type II", "GDPR Compliant",
];

// ── Client logo strip (grayscale wordmarks; falls back to live tenant names)
const fallbackClients = [
  "Northgate NHS Trust", "Mumbai Community Health", "Westside Wellness",
  "Apollo Care Network", "Coromandel Health", "NMDC Medical",
];

const footerCols = [
  { title: "Products", links: ["Patient Management", "Appointments", "Consultations", "Outcome Analytics"] },
  { title: "Company", links: ["About", "Careers", "Contact", "Partners"] },
  { title: "Customers", links: ["Reviews", "Success Stories", "Referral Program"] },
  { title: "Resources", links: ["Blog", "Brochure", "Security", "Status"] },
];

const socials = [Linkedin, Twitter, Facebook, Instagram, Youtube];

export default function LandingPage() {
  const [data, setData] = useState<{ areas: number; clinics: number; programs: number; tenants: string[] } | null>(null);

  useEffect(() => {
    fetch("/api/health/public-stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((statsData) => setData(statsData))
      .catch((err) => console.error("Error loading public stats:", err));
  }, []);

  // Trust band — big headline metrics (MocDoc: 15M+ Records, 30k+ Doctors, 50+ Cities, 10+ Countries)
  const trustStats = [
    { value: data ? `${data.areas}+` : "195+", label: "Areas Managed", icon: MapPin },
    { value: data ? `${data.clinics}+` : "707+", label: "Active Clinics", icon: Building2 },
    { value: data ? `${data.programs}+` : "25+", label: "Care Programs", icon: Heart },
    { value: "99.9%", label: "Uptime SLA", icon: Zap },
  ];

  const dynamicTestimonials = testimonials.map((t, index) => {
    let orgName = t.org;
    if (data?.tenants && data.tenants.length > 0) {
      orgName = data.tenants[index % data.tenants.length];
    }
    return { ...t, org: orgName };
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 md:px-10 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: blueGrad }}>
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
              <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-primary">CareNexus</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#products" className="hover:text-primary transition-colors">Products</a>
          <a href="#why" className="hover:text-primary transition-colors">Why CareNexus</a>
          <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Customers</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-primary">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-sm font-semibold text-white shadow-sm" style={{ background: blueGrad }}>
              Book a Demo
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 right-0 w-[600px] h-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #0b63f6 0%, transparent 65%)" }} />
          <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #ff7a1a 0%, transparent 65%)" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ORANGE }} />
              Enterprise Healthcare Platform — Now Available
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.1] mb-6 text-foreground">
              One Stop Digital Healthcare Solution for{" "}
              <span style={{ background: "linear-gradient(120deg, #0a3d91, #0b63f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Clinics & Hospitals
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
              Empowering healthcare teams with cutting-edge, cloud-based software — connecting patients, clinicians, programs, and insights to deliver NHS-grade care at scale.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base font-semibold text-white shadow-lg shadow-blue-500/20" style={{ background: blueGrad }}>
                  Book a Demo <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium border-border text-foreground hover:border-primary hover:text-primary">
                  Contact Us
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">No credit card required · NHS compliant · Instant setup</p>
          </div>

          {/* Visual mock */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl opacity-10 blur-2xl" style={{ background: blueGrad }} />
            <div className="relative rounded-3xl border border-border bg-card shadow-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-muted-foreground">CareNexus · Clinical Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {trustStats.slice(0, 2).map(({ value, label, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-border bg-muted p-4">
                    <Icon className="w-5 h-5 mb-2" style={{ color: BLUE }} />
                    <div className="text-2xl font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">Patient Journey</span>
                  <span className="text-xs font-medium" style={{ color: ORANGE }}>Live</span>
                </div>
                {[
                  { l: "Active Patients", w: "82%", c: BLUE },
                  { l: "Appointments Today", w: "64%", c: ORANGE },
                  { l: "Outcomes Improving", w: "91%", c: BLUE },
                ].map(({ l, w, c }) => (
                  <div key={l} className="mb-2.5 last:mb-0">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>{l}</span><span>{w}</span></div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: w, background: c }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAND ──────────────────────────────────────────── */}
      <section className="py-14 px-6 md:px-10 border-y border-border bg-muted">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-10">Trusted by healthcare providers across the UK & beyond</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustStats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-primary/10">
                  <Icon className="w-5 h-5" style={{ color: BLUE }} />
                </div>
                <div className="text-3xl font-extrabold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLIENT LOGO STRIP ───────────────────────────────────── */}
      <section className="py-12 px-6 md:px-10 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-8">
            Trusted by leading healthcare organisations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {(data?.tenants && data.tenants.length > 0 ? data.tenants.slice(0, 6) : fallbackClients).map((name) => (
              <div key={name} className="flex items-center gap-2 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all">
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-primary/10">
                  <Building2 className="w-4 h-4" style={{ color: BLUE }} />
                </div>
                <span className="font-bold text-muted-foreground text-sm whitespace-nowrap">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ────────────────────────────────────────────── */}
      <section id="products" className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ORANGE }}>Our Solutions</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Best cloud-based healthcare technology software</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A complete healthcare management suite built for the demands of modern NHS trusts and healthcare providers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(({ icon: Icon, title, points, accent }) => (
              <div key={title} className="group rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" style={{ background: `${accent}14` }}>
                  <Icon className="w-6 h-6" style={{ color: accent }} />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-3">{title}</h3>
                <ul className="space-y-2 mb-5">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold cursor-pointer" style={{ color: accent }}>
                    Read More <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY / VALUE CARDS ───────────────────────────────────── */}
      <section id="why" className="py-24 px-6 md:px-10 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ORANGE }}>Why Upgrade</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Is outdated technology slowing you down?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Upgrade to CareNexus — the cloud-based, fully integrated, secure and reliable healthcare management suite.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueCards.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-200">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-orange-500/10">
                  <Icon className="w-5 h-5" style={{ color: ORANGE }} />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACHIEVE MORE (3 columns) ────────────────────────────── */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ORANGE }}>Achieve More With Us</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything your clinical team needs to grow</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achieve.map(({ icon: Icon, title, items, accent }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-7">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${accent}14` }}>
                  <Icon className="w-6 h-6" style={{ color: accent }} />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-4">{title}</h3>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ────────────────────────────────────────────── */}
      <section id="workflow" className="py-24 px-6 md:px-10 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ORANGE }}>Care Pathway</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">End-to-end care workflow</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From first contact to clinical outcome, CareNexus manages every step of the patient journey.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[8.33%] right-[8.33%] h-0.5 bg-border" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {workflow.map(({ step, label, desc, icon: Icon, color }) => (
                <div key={step} className="flex flex-col items-center text-center group">
                  <div className="relative z-10 w-20 h-20 rounded-2xl flex flex-col items-center justify-center bg-card shadow-lg mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-200" style={{ border: `2px solid ${color}33` }}>
                    <Icon className="w-7 h-7 mb-0.5" style={{ color }} />
                    <span className="text-[10px] font-bold" style={{ color }}>{step}</span>
                  </div>
                  <div className="font-semibold text-sm text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{desc}</div>
                  {step < 6 && <ChevronRight className="w-4 h-4 text-muted-foreground mt-2 md:hidden" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ORANGE }}>Customers</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our clients say it best</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dynamicTestimonials.map(({ quote, name, title, org, initials }) => (
              <div key={name} className="relative rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
                <Quote className="absolute top-6 right-6 w-8 h-8 opacity-10" style={{ color: BLUE }} />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">"{quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: blueGrad }}>
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground">{title}</div>
                    <div className="text-xs font-medium" style={{ color: BLUE }}>{org}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT METRICS ──────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10" style={{ background: blueGrad }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {impact.map(({ value, label }) => (
              <div key={label}>
                <div className="text-5xl font-extrabold text-white mb-2">{value}</div>
                <div className="text-white/75 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GROWTH CTA (Security + Support split) ───────────────── */}
      <section className="py-24 px-6 md:px-10 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Fuel your growth with CareNexus</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Enterprise-grade security and round-the-clock support, so your team can focus on care.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10">
                  <Shield className="w-5 h-5" style={{ color: BLUE }} />
                </div>
                <h3 className="font-bold text-lg text-foreground">Uncompromised Data Security</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">NHS-compliant, encrypted and audit-logged. Your patient data is isolated per tenant and protected end-to-end.</p>
              <div className="flex flex-wrap gap-2">
                {securityBadges.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted rounded-full px-3 py-1.5">
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: BLUE }} />{b}
                  </span>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-orange-500/10">
                  <Headphones className="w-5 h-5" style={{ color: ORANGE }} />
                </div>
                <h3 className="font-bold text-lg text-foreground">Best-in-Class 24/7 Support</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Reach our team any time via phone, email, or in-app ticketing. Onboarding, training, and migration included.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg" className="h-11 px-6 text-sm font-semibold text-white w-full sm:w-auto" style={{ background: orangeGrad }}>
                    Book a Demo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-medium border-border text-foreground w-full sm:w-auto">
                    <Phone className="w-4 h-4 mr-2" /> Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-border pt-16 pb-8 px-6 md:px-10 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
            {/* Brand + contact */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: blueGrad }}>
                  <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                    <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
                    <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
                  </svg>
                </div>
                <span className="font-bold text-lg text-foreground">CareNexus</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
                One Stop Digital Healthcare Solution for clinics & hospitals — cloud-based, secure, and NHS-compliant.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" style={{ color: BLUE }} /> +44 20 7946 0000</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" style={{ color: BLUE }} /> hello@carenexus.health</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" style={{ color: BLUE }} /> London, United Kingdom</div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                {socials.map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-transparent transition-colors" style={{ ["--hover-bg" as string]: BLUE }} onMouseEnter={(e) => (e.currentTarget.style.background = BLUE)} onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerCols.map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-semibold text-sm text-foreground mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="w-3.5 h-3.5" />
              <span>© {new Date().getFullYear()} CareNexus. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
