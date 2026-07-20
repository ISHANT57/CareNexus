import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Building2, Activity, Shield, Calendar, FileText,
  CheckCircle, ArrowRight, Stethoscope, BarChart3, Lock,
  Globe, ChevronRight, Star, TrendingUp, ClipboardList,
  MapPin, Heart, Zap, Play, ChevronDown, Check, BrainCircuit, HeartPulse, Hospital, Syringe, UserCheck
} from "lucide-react";

// ── DATA ────────────────────────────────────────────────────────
const features = [
  { icon: Users, title: "Patient Master Record", desc: "A unified, single source of truth for patient demographics, medical history, and care pathways across all facilities." },
  { icon: Calendar, title: "Intelligent Scheduling", desc: "Automated appointment booking, provider availability matching, and Twilio-powered SMS reminders." },
  { icon: HeartPulse, title: "Programs Management", desc: "Enroll cohorts into specialized care pathways (e.g. Diabetes Management) and track aggregate outcomes." },
  { icon: Shield, title: "Strict Data Isolation", desc: "Multi-tenant architecture ensures complete separation of clinical data between different NHS trusts." },
  { icon: Building2, title: "Hierarchical Control", desc: "Manage hundreds of clinics globally, mapped precisely to geographic areas and administrative regions." },
  { icon: Lock, title: "Granular RBAC", desc: "Strict role-based access for Super Admins, Area Managers, Doctors, and front-desk Operators." },
];

const workflow = [
  { step: 1, label: "Organization", desc: "Tenant Onboarding", icon: Shield, color: "text-primary" },
  { step: 2, label: "Region", desc: "Geographic Mapping", icon: MapPin, color: "text-secondary" },
  { step: 3, label: "Facility", desc: "Clinic Setup", icon: Hospital, color: "text-accent" },
  { step: 4, label: "Pathway", desc: "Program Creation", icon: Heart, color: "text-success" },
  { step: 5, label: "Patient", desc: "Registration", icon: Users, color: "text-warning" },
  { step: 6, label: "Consultation", desc: "Clinical Notes", icon: Stethoscope, color: "text-destructive" },
];

const faqs = [
  { q: "Is CareNexus compliant with NHS Data Security Standards?", a: "Absolutely. CareNexus aligns fully with the NHS Data Security and Protection (DSP) Toolkit, utilizing 256-bit AES encryption at rest and in transit." },
  { q: "How does the multi-tenant architecture protect data?", a: "Each organization receives a dedicated workspace. Data is strictly isolated via Prisma row-level security policies and multi-tenant middleware, ensuring zero cross-contamination." },
  { q: "Can doctors work across multiple hospitals?", a: "Yes. Our advanced User-Tenant Assignment model allows clinicians to use a single email login to securely access multiple authorized hospitals." },
  { q: "Does CareNexus support HL7 or FHIR integration?", a: "CareNexus provides a modern RESTful API that can be easily mapped to FHIR resources or integrated with existing EMR systems like Epic and Cerner." },
];

const testimonials = [
  { quote: "CareNexus transformed how we manage our diabetes pathway. We reduced missed appointments by 40% and improved patient outcomes within months.", author: "Dr. Sarah Jenkins", role: "Clinical Director, Northgate Trust" },
  { quote: "The multi-tenant architecture allowed us to scale from 5 clinics to 50 clinics effortlessly. The analytics dashboard gives us unprecedented visibility.", author: "Michael Chen", role: "Operations Lead, Apex Healthcare" },
  { quote: "Finally, a platform that doesn't look like it was built in 1995. The UX is stunning, and our doctors actually enjoy using it.", author: "Emma Thompson", role: "Chief Medical Officer, Vitalis Care" },
];

// ── ANIMATION VARIANTS ──────────────────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
};

// ── COMPONENTS ──────────────────────────────────────────────────
export default function LandingPage() {
  const [data, setData] = useState<{ areas: number; clinics: number; programs: number; tenants: string[] } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/health/public-stats")
      .then((res) => res.ok ? res.json() : null)
      .then((statsData) => setData(statsData))
      .catch(() => {});
      
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dynamicStats = [
    { value: data ? `${data.areas}+` : "195+", label: "Geographic Areas" },
    { value: data ? `${data.clinics}+` : "700+", label: "Facilities Supported" },
    { value: data ? `${data.programs}+` : "25+", label: "Active Care Pathways" },
    { value: "30M+", label: "Patient Records" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary overflow-hidden">

      {/* ── 1. NAVBAR ──────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-20 px-6 md:px-12 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
              <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">CareNexus</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Platform</a>
          <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Outcomes</a>
          <a href="#security" className="hover:text-primary transition-colors">Security</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-bold text-muted-foreground hover:text-primary">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-full px-6">
              Request Demo
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── 2. HERO SECTION ────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 to-background -z-10" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full mix-blend-multiply blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-gradient-to-tr from-accent/10 to-success/5 rounded-full mix-blend-multiply blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <Badge variant="outline" className="gap-2 px-3 py-1.5 rounded-full bg-primary/10 border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8">
              <Shield className="w-3.5 h-3.5" /> NHS DSP Toolkit Compliant
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-8">
              Connected Care.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Better Outcomes.</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-10">
              The enterprise patient management system built for modern healthcare. Manage clinics, coordinate pathways, and deliver clinical excellence at scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/register">
                <Button className="h-14 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-full w-full sm:w-auto">
                  Deploy Workspace <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" className="h-14 px-8 text-base font-bold border-border text-foreground hover:bg-muted rounded-full w-full sm:w-auto">
                <Play className="w-5 h-5 mr-2 text-secondary" /> Watch Product Tour
              </Button>
            </div>
          </motion.div>

          {/* Hero Abstract Graphic / Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 w-full max-w-[600px] relative"
          >
            <div className="relative rounded-[2.5rem] bg-card border border-border shadow-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-muted/30 opacity-90" />
              <div className="relative z-10 flex flex-col gap-4">
                {/* Mock UI Elements */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><UserCheck className="w-5 h-5 text-primary" /></div>
                    <div>
                      <div className="h-2 w-24 bg-muted rounded-full mb-2"></div>
                      <div className="h-2 w-32 bg-muted/60 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-8 w-24 bg-success/10 rounded-full flex items-center justify-center"><span className="h-2 w-12 bg-success rounded-full"></span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-2xl border border-border">
                    <div className="h-2 w-16 bg-muted rounded-full mb-4"></div>
                    <div className="flex items-end gap-2">
                      <div className="h-8 w-1/4 bg-primary rounded-t-sm"></div>
                      <div className="h-12 w-1/4 bg-primary rounded-t-sm opacity-80"></div>
                      <div className="h-16 w-1/4 bg-primary rounded-t-sm opacity-60"></div>
                      <div className="h-24 w-1/4 bg-primary rounded-t-sm opacity-40"></div>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-2xl border border-border flex flex-col justify-center gap-3">
                     <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-secondary/20"></div> <div className="h-2 w-20 bg-muted rounded-full"></div></div>
                     <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-secondary/20"></div> <div className="h-2 w-24 bg-muted rounded-full"></div></div>
                     <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-secondary/20"></div> <div className="h-2 w-16 bg-muted rounded-full"></div></div>
                  </div>
                </div>

                <div className="bg-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <div className="text-primary-foreground/80 text-sm font-semibold mb-1">Active Consultations</div>
                      <div className="text-3xl font-bold">1,248</div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                      <Activity className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Floating Badges */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -left-8 top-20 bg-card border border-border shadow-xl rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-success" /></div>
              <div><div className="text-xs text-muted-foreground font-semibold">System Status</div><div className="text-sm font-bold text-foreground">All Operational</div></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 3. TRUSTED BY / STATISTICS ────────────────────────────── */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-10">Trusted by modern healthcare providers</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50">
            {dynamicStats.map((stat, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURES GRID ───────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6">Everything you need to <br/> manage care at scale.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A comprehensive suite of tools designed specifically for complex clinical environments.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="rounded-3xl p-8 shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 5. WORKFLOW / PATIENT JOURNEY ─────────────────────────── */}
      <section id="workflow" className="py-24 px-6 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent blur-[100px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">The Clinical Hierarchy</h2>
            <p className="text-lg text-sidebar-foreground/70 max-w-2xl">How CareNexus structures your healthcare data from the global tenant down to individual patient outcomes.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {workflow.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative">
                  {i < workflow.length - 1 && <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-sidebar-foreground/40 z-20" />}
                  <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-sidebar-foreground/60 mb-1">STEP 0{item.step}</div>
                  <div className="font-bold text-sidebar-foreground mb-1">{item.label}</div>
                  <div className="text-xs text-sidebar-foreground/70">{item.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 10. TESTIMONIALS ───────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-6 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6">Proven Clinical Outcomes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-foreground text-lg font-medium leading-relaxed mb-8">"{t.quote}"</p>
                </div>
                <div>
                  <div className="font-bold text-foreground">{t.author}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. FAQ ────────────────────────────────────────────────── */}
      <section id="security" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="rounded-2xl overflow-hidden shadow-none">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-6 flex items-center justify-between font-bold text-left text-foreground hover:bg-muted transition-colors"
              >
                {faq.q}
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 12. FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-sidebar text-sidebar-foreground/70 py-16 px-6 border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" className="w-4 h-4">
                <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
                <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
              </svg>
            </div>
            <span className="font-extrabold text-lg text-sidebar-foreground">CareNexus</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} CareNexus Platform. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-semibold">
            <a href="#" className="hover:text-sidebar-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-sidebar-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-sidebar-foreground transition-colors">Security</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
