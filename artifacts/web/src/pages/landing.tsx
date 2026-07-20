import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Users, Building2, Shield, Calendar, Stethoscope, BarChart3,
  CheckCircle, ArrowRight, TrendingUp,
  Globe, Phone, Headphones, Quote,
  MapPin, ChevronRight, Mail,
  Linkedin, Twitter, Facebook, Instagram, Youtube,
  Bell, FileText, Award, Lock,
  Mic, Sparkles, Zap, Brain, MessageSquare, Cpu,
  Activity, Heart, Play, LayoutGrid,
  Search, Settings, MoreVertical, Download, Upload, Filter, Eye, CheckSquare,
} from "lucide-react";
import { GradientAvatar, ProgramIcon } from "@/lib/ui-helpers";

// ── Brand palette
const BLUE = "#0b63f6";
const BLUE_DARK = "#0a3d91";
const NAVY = "#060d1b";
const GREEN = "#059669";
const VIOLET = "#7c3aed";
const AMBER = "#f59e0b";
const ROSE = "#e11d48";
const CYAN = "#0891b2";
const ORANGE = "#ff7a1a";
const blueGrad = "linear-gradient(135deg, #0a3d91 0%, #0b63f6 100%)";
const orangeGrad = "linear-gradient(135deg, #ff7a1a 0%, #ff9a3d 100%)";
const navyGrad = "linear-gradient(135deg, #060d1b 0%, #0f1f3d 100%)";

// ── Dark (eka-style) theme tokens
const DARK_BG = "#07060d";
const PURPLE = "#8b5cf6";
const purpleGrad = "linear-gradient(135deg, #7c3aed 0%, #5b3df5 45%, #4f46e5 100%)";
const purpleGradBright = "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #4f46e5 100%)";
const ROTATING_WORDS = ["NHS Trusts", "Clinics", "Doctors", "Hospitals", "Patients"];

// Product showcase (eka "One Platform" section)
const showcaseProducts = [
  {
    icon: Mic, tag: "AI Scribe", accent: PURPLE,
    title: "AI-driven voice-to-prescription",
    desc: "Speak naturally. CareNexus captures the consultation, structures clinical notes, and drafts the prescription in seconds.",
  },
  {
    icon: LayoutGrid, tag: "Clinic OS", accent: "#3b82f6",
    title: "The modern clinic OS",
    desc: "Run your entire practice — patients, scheduling, billing, and records — from one intelligent, cloud-native workspace.",
  },
  {
    icon: Cpu, tag: "Developer", accent: "#06b6d4",
    title: "Build AI-powered health apps",
    desc: "Composable APIs and SDKs to embed clinical intelligence into any workflow, at NHS-grade security and scale.",
  },
  {
    icon: Heart, tag: "Patient", accent: "#ec4899",
    title: "Your health, all in one place",
    desc: "Patients carry their records, appointments, and care plans everywhere — connected to every clinician in their journey.",
  },
];

// Smart features grid (eka "Limitless Clinical Innovation")
const smartFeatures = [
  { icon: Activity, title: "Co-ordinated Care", desc: "Every clinician, every clinic, one shared source of truth across the patient journey." },
  { icon: Zap, title: "Save 10+ hours a week", desc: "Automated clinical documentation and smart reminders cut admin load dramatically." },
  { icon: BarChart3, title: "Your clinic's command center", desc: "Real-time dashboards for enrolments, risk, outcomes and capacity in one view." },
  { icon: Cpu, title: "Build faster, scale smarter", desc: "Composable modules and open APIs let you extend the platform to any pathway." },
  { icon: Brain, title: "Medical Records Analyzer", desc: "AI reads, structures and summarises clinical documents instantly with citations." },
  { icon: Sparkles, title: "Clinical Decision Support", desc: "Evidence-based prompts surfaced at the point of care, tuned to each program." },
  { icon: MessageSquare, title: "Conversational patient engagement", desc: "Voice and WhatsApp-native messaging keeps patients engaged between visits.", wide: true },
];

// Certifications strip
const certifications = ["NHS Compliant", "ISO 27001", "SOC 2 Type II", "HIPAA Ready", "GDPR", "Cyber Essentials+"];

// "Apps already in Caremesh" tiles
const appTiles = [
  { icon: Stethoscope, c: "#7c3aed" }, { icon: Calendar, c: "#3b82f6" }, { icon: MessageSquare, c: "#22c55e" },
  { icon: FileText, c: "#f59e0b" }, { icon: Activity, c: "#ec4899" }, { icon: BarChart3, c: "#06b6d4" },
  { icon: Users, c: "#8b5cf6" }, { icon: Bell, c: "#f43f5e" }, { icon: Heart, c: "#ef4444" },
  { icon: Shield, c: "#10b981" }, { icon: Mic, c: "#a855f7" }, { icon: Building2, c: "#0ea5e9" },
];

// ── Data
const productTabs = [
  {
    icon: Users, title: "Patient Management", subtitle: "Complete patient lifecycle control",
    accent: BLUE,
    points: ["End-to-end patient journey tracking", "NHS Number & GP compliance built-in", "Risk scoring & clinical flagging", "Multi-program concurrent enrollment"],
  },
  {
    icon: Calendar, title: "Appointment Scheduling", subtitle: "Smart booking & communication",
    accent: GREEN,
    points: ["Drag-and-drop multi-clinic calendar", "Automated SMS & WhatsApp reminders", "Reduce no-shows by up to 40%", "Waiting list & cancellation management"],
  },
  {
    icon: Stethoscope, title: "Clinical Consultations", subtitle: "Structured clinical documentation",
    accent: VIOLET,
    points: ["Structured SOAP consultation notes", "Diagnosis, treatment & medication plans", "PSI milestone & follow-up tracking", "Instant audit trail on every note"],
  },
  {
    icon: BarChart3, title: "Outcome Analytics", subtitle: "Data-driven programme insights",
    accent: AMBER,
    points: ["Clinical & lifestyle improvement scores", "Program success & cohort dashboards", "ICB & commissioner-ready reporting", "Exportable outcomes for NHS submissions"],
  },
];


const testimonials = [
  {
    quote: "CareNexus has transformed how we manage our mental health pathways. The visibility across all our clinics is unprecedented — we can now identify at-risk patients before they deteriorate.",
    name: "Dr. Sarah Mitchell", title: "Clinical Director", org: "Northgate NHS Mental Health Trust",
    initials: "SM", accent: BLUE,
    featured: true,
  },
  {
    quote: "The area-to-clinic cascade filtering alone saved our admin team hours every week. The audit trail gives us complete confidence in our data governance compliance.",
    name: "Dr. James Okafor", title: "Head of Operations", org: "Mumbai Community Healthcare",
    initials: "JO", accent: GREEN,
    featured: false,
  },
  {
    quote: "We enrolled over 500 patients across 25 programs in the first month. The automated communications and dashboards have been game-changers.",
    name: "Dr. Priya Sharma", title: "Programme Lead", org: "Westside Wellness Clinics",
    initials: "PS", accent: VIOLET,
    featured: false,
  },
];

const workflow = [
  { step: 1, label: "Referral", desc: "Patient registered & profiled", icon: Users, color: BLUE },
  { step: 2, label: "Enrollment", desc: "Programme assignment", icon: FileText, color: GREEN },
  { step: 3, label: "Scheduling", desc: "Appointments & reminders", icon: Calendar, color: VIOLET },
  { step: 4, label: "Consultation", desc: "Clinical documentation", icon: Stethoscope, color: AMBER },
  { step: 5, label: "Outcomes", desc: "Progress & milestone tracking", icon: TrendingUp, color: CYAN },
  { step: 6, label: "Reporting", desc: "Analytics & NHS submission", icon: BarChart3, color: ROSE },
];

const securityBadges = [
  { label: "NHS Compliant", icon: Shield },
  { label: "HIPAA Ready", icon: Shield },
  { label: "ISO 27001", icon: Award },
  { label: "256-bit AES", icon: Lock },
  { label: "SOC 2 Type II", icon: CheckCircle },
  { label: "GDPR Compliant", icon: FileText },
];

const impact = [
  { value: "78%", label: "Average improvement in patient experience scores" },
  { value: "4×", label: "Increase in operational efficiency reported by clinical leads" },
  { value: "6×", label: "Programme throughput growth within the first 90 days" },
];

const fallbackClients = [
  "Northgate NHS Trust", "Mumbai Community Health", "Westside Wellness",
  "Apollo Care Network", "Coromandel Health", "NMDC Medical",
];

const footerCols = [
  { title: "Products", links: ["Patient Management", "Appointments", "Consultations", "Outcome Analytics"] },
  { title: "Company", links: ["About", "Careers", "Contact", "Partners"] },
  { title: "Customers", links: ["Reviews", "Success Stories", "Referral Programme"] },
  { title: "Resources", links: ["Blog", "Brochure", "Security", "Status"] },
];

const socials = [Linkedin, Twitter, Facebook, Instagram, Youtube];

// ─────────────────────────────────────────────────────────
// HERO DASHBOARD MOCKUP
// ─────────────────────────────────────────────────────────
function HeroDashboard() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-3xl blur-3xl opacity-20" style={{ background: blueGrad }} />

      {/* Browser window */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-[0_24px_72px_rgba(11,99,246,0.18)]">
        {/* Chrome bar */}
        <div className="px-4 py-2.5 flex items-center gap-3 bg-slate-100 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-white rounded-md px-3 py-1 border border-slate-200 text-xs text-slate-400">
            <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
            app.carenexus.health/dashboard
          </div>
        </div>

        {/* App layout */}
        <div className="flex bg-slate-50" style={{ height: "360px" }}>
          {/* Sidebar */}
          <div className="w-12 shrink-0 flex flex-col items-center gap-3 py-4 border-r border-slate-200" style={{ background: NAVY }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1" style={{ background: blueGrad }}>
              <svg viewBox="0 0 32 32" fill="none" className="w-3.5 h-3.5">
                <rect x="13" y="4" width="6" height="24" rx="2" fill="white" />
                <rect x="4" y="13" width="24" height="6" rx="2" fill="white" />
              </svg>
            </div>
            {[Users, Calendar, Stethoscope, BarChart3, Building2, Shield].map((Icon, i) => (
              <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: i === 0 ? BLUE : "transparent" }}>
                <Icon className="w-3.5 h-3.5" style={{ color: i === 0 ? "white" : "#475569" }} />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Top bar */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Clinical Operations</p>
                <p className="text-xs font-bold text-slate-800">Overview Dashboard</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-700">LIVE</span>
                </div>
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                <div className="w-6 h-6 rounded-full text-white text-[8px] font-bold flex items-center justify-center" style={{ background: blueGrad }}>JD</div>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-4 gap-2 p-3 shrink-0">
              {[
                { l: "Total Patients", v: "2,847", ch: "+12%", c: BLUE },
                { l: "Today's Appts", v: "34", ch: "+3 today", c: GREEN },
                { l: "Active Programmes", v: "18", ch: "All running", c: VIOLET },
                { l: "Success Rate", v: "91%", ch: "↑ 2% vs Q1", c: AMBER },
              ].map(({ l, v, ch, c }) => (
                <div key={l} className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                  <p className="text-[8px] text-slate-400 mb-1 truncate font-medium">{l}</p>
                  <p className="text-sm font-bold text-slate-900">{v}</p>
                  <p className="text-[8px] font-semibold mt-0.5" style={{ color: c }}>{ch}</p>
                </div>
              ))}
            </div>

            {/* Chart + patient list */}
            <div className="grid grid-cols-5 gap-2 px-3 pb-3 flex-1 min-h-0">
              {/* Area chart */}
              <div className="col-span-3 bg-white rounded-xl border border-slate-100 p-2.5 flex flex-col">
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <p className="text-[9px] font-bold text-slate-700">Patient Enrolments — Last 30 Days</p>
                  <span className="text-[8px] text-blue-600 font-medium">View report →</span>
                </div>
                <div className="flex-1">
                  <svg viewBox="0 0 220 70" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BLUE} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={BLUE} stopOpacity="0.01" />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GREEN} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={GREEN} stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                    <path d="M0,62 L27,52 L55,42 L82,48 L110,32 L138,36 L165,18 L192,14 L220,8 L220,70 L0,70Z" fill="url(#g1)" />
                    <path d="M0,62 L27,52 L55,42 L82,48 L110,32 L138,36 L165,18 L192,14 L220,8" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0,68 L27,66 L55,64 L82,60 L110,57 L138,53 L165,50 L192,46 L220,44 L220,70 L0,70Z" fill="url(#g2)" />
                    <path d="M0,68 L27,66 L55,64 L82,60 L110,57 L138,53 L165,50 L192,46 L220,44" fill="none" stroke={GREEN} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4,2" />
                  </svg>
                </div>
              </div>

              {/* High priority patients */}
              <div className="col-span-2 bg-white rounded-xl border border-slate-100 flex flex-col overflow-hidden">
                <div className="px-2.5 py-2 border-b border-slate-100 shrink-0">
                  <p className="text-[9px] font-bold text-slate-700">High Priority</p>
                </div>
                <div className="flex-1 overflow-hidden">
                  {[
                    { name: "Sarah Mitchell", prog: "MSK", risk: "HIGH", rc: ROSE },
                    { name: "James Okafor", prog: "Diabetes", risk: "MED", rc: AMBER },
                    { name: "Priya Sharma", prog: "CAMHS", risk: "LOW", rc: GREEN },
                    { name: "Tom Harrison", prog: "Cardiac", risk: "HIGH", rc: ROSE },
                  ].map(({ name, prog, risk, rc }) => (
                    <div key={name} className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0" style={{ background: blueGrad }}>
                          {name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8px] font-semibold text-slate-800 truncate">{name}</p>
                          <p className="text-[7px] text-slate-400">{prog}</p>
                        </div>
                      </div>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded" style={{ color: rc, background: `${rc}18` }}>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-3 flex items-center gap-2.5 z-10">
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-900">Appointment Confirmed</p>
          <p className="text-[9px] text-slate-500">Sarah M. · 2:30 PM today</p>
        </div>
      </div>

      {/* Floating stat */}
      <div className="absolute -bottom-5 -left-5 rounded-2xl shadow-[0_8px_32px_rgba(11,99,246,0.35)] p-3 z-10" style={{ background: blueGrad }}>
        <p className="text-[9px] text-blue-200 font-semibold uppercase tracking-wide">NHS Patients Managed</p>
        <p className="text-xl font-extrabold text-white leading-tight">12,485+</p>
        <p className="text-[9px] text-blue-200">↑ 24% this quarter</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PRODUCT TAB MOCKUPS
// ─────────────────────────────────────────────────────────
function PatientMgmtScreen() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-slate-200 flex-1 max-w-xs">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-xs text-slate-400">Search by name, NHS number…</span>
        </div>
        {["All", "Active", "New", "Discharged"].map((f, i) => (
          <span key={f} className={`text-xs px-2.5 py-1 rounded-full font-semibold cursor-pointer ${i === 0 ? "bg-blue-600 text-white" : "text-slate-500"}`}>{f}</span>
        ))}
        <button className="ml-auto flex items-center gap-1 text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ background: blueGrad }}>
          + Add Patient
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Patient", "NHS Number", "Programme", "Risk", "Status"].map(h => (
              <th key={h} className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { name: "Sarah Mitchell", nhs: "NHS 482 155 1234", prog: "MSK Rehabilitation", risk: "HIGH", status: "ACTIVE", rc: ROSE, sc: GREEN },
            { name: "James Okafor", nhs: "NHS 331 782 9912", prog: "Diabetes Prevention", risk: "MEDIUM", status: "ACTIVE", rc: AMBER, sc: GREEN },
            { name: "Priya Sharma", nhs: "NHS 665 421 7743", prog: "CAMHS Support", risk: "LOW", status: "NEW", rc: GREEN, sc: BLUE },
            { name: "Tom Harrison", nhs: "NHS 128 993 0021", prog: "Cardiac Rehab", risk: "HIGH", status: "ACTIVE", rc: ROSE, sc: GREEN },
            { name: "Emma Wilson", nhs: "NHS 874 230 5567", prog: "Weight Management", risk: "LOW", status: "ACTIVE", rc: GREEN, sc: GREEN },
          ].map(({ name, nhs, prog, risk, status, rc, sc }) => (
            <tr key={name} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors cursor-pointer">
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0" style={{ background: blueGrad }}>
                    {name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className="font-semibold text-slate-900 text-xs">{name}</span>
                </div>
              </td>
              <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{nhs}</td>
              <td className="py-2.5 px-3 text-xs text-slate-600">{prog}</td>
              <td className="py-2.5 px-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: rc, background: `${rc}15` }}>{risk}</span>
              </td>
              <td className="py-2.5 px-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: sc, background: `${sc}15` }}>{status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentScreen() {
  const slots = [
    { time: "09:00", name: "Sarah Mitchell", type: "Initial Assessment", dur: 2, c: BLUE },
    { time: "10:00", name: "", type: "", dur: 1, c: "" },
    { time: "11:00", name: "James Okafor", type: "Follow-up Review", dur: 1, c: GREEN },
    { time: "12:00", name: "", type: "", dur: 1, c: "" },
    { time: "13:00", name: "Priya Sharma", type: "Consultation", dur: 1, c: VIOLET },
    { time: "14:00", name: "Tom Harrison", type: "Discharge Planning", dur: 2, c: AMBER },
    { time: "15:00", name: "", type: "", dur: 1, c: "" },
    { time: "16:00", name: "Emma Wilson", type: "Outcome Review", dur: 1, c: ROSE },
  ];
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointment Schedule</p>
          <p className="text-sm font-bold text-slate-900">Tuesday, 1 July 2025 — Dr. Patel</p>
        </div>
        <div className="flex gap-1.5">
          {["Day", "Week", "Month"].map((v, i) => (
            <span key={v} className={`text-xs px-2.5 py-1 rounded-md font-semibold cursor-pointer ${i === 0 ? "text-white" : "text-slate-400"}`} style={i === 0 ? { background: blueGrad } : {}}>{v}</span>
          ))}
        </div>
      </div>
      <div className="overflow-hidden" style={{ height: "260px" }}>
        {slots.map((slot) => (
          <div key={slot.time} className="flex border-b border-slate-100 last:border-0" style={{ height: "32px" }}>
            <div className="w-14 shrink-0 flex items-center justify-center text-[10px] text-slate-400 font-medium border-r border-slate-100">{slot.time}</div>
            <div className="flex-1 px-2 flex items-center">
              {slot.name ? (
                <div className="flex items-center gap-2 w-full h-7 rounded-md px-2" style={{ background: `${slot.c}12`, borderLeft: `3px solid ${slot.c}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold truncate" style={{ color: slot.c }}>{slot.name}</p>
                    <p className="text-[8px] text-slate-500 truncate">{slot.type}</p>
                  </div>
                  <span className="text-[8px] font-semibold text-white px-1.5 py-0.5 rounded-sm" style={{ background: slot.c }}>Confirmed</span>
                </div>
              ) : (
                <div className="w-full h-6 rounded-md border border-dashed border-slate-200 flex items-center px-2">
                  <span className="text-[9px] text-slate-300">Available slot</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsultationScreen() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">JO</div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">James Okafor</p>
          <p className="text-[10px] text-slate-500">NHS 331 782 9912 · Diabetes Prevention · Dr. Patel</p>
        </div>
        <span className="text-[10px] font-bold text-white px-2 py-1 rounded-lg" style={{ background: GREEN }}>In Progress</span>
      </div>
      <div className="p-4 space-y-3">
        {[
          { label: "Presenting Complaint", content: "Patient presents with elevated HbA1c levels (7.8 mmol/L) and reports increased fatigue over 3 months. Requesting structured lifestyle intervention.", c: BLUE },
          { label: "Assessment & Plan", content: "1. Initiate 12-week Diabetes Prevention Programme\n2. Dietitian referral — low-carbohydrate dietary approach\n3. Weekly check-ins with care coordinator\n4. Repeat bloods in 6 weeks", c: VIOLET },
          { label: "Medications", content: "Metformin 500mg — continue current dosage. No new prescriptions at this time. Review at next appointment.", c: GREEN },
        ].map(({ label, content, c }) => (
          <div key={label}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: c }}>{label}</p>
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  const bars = [
    { prog: "MSK", val: 85, c: BLUE }, { prog: "Diabetes", val: 62, c: GREEN },
    { prog: "CAMHS", val: 45, c: VIOLET }, { prog: "Cardiac", val: 78, c: AMBER },
    { prog: "Weight Mgmt", val: 56, c: CYAN }, { prog: "Diabetes Prev.", val: 91, c: ROSE },
  ];
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analytics & Reporting</p>
          <p className="text-sm font-bold text-slate-900">Programme Performance — Q2 2025</p>
        </div>
        <button className="text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ background: blueGrad }}>Export Report</button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Avg. Improvement Score", value: "84.2%", delta: "+5.3% vs Q1", c: GREEN },
            { label: "Programme Completion", value: "78%", delta: "+8% vs Q1", c: BLUE },
            { label: "Patient Satisfaction", value: "4.8 / 5", delta: "+0.3 vs Q1", c: VIOLET },
          ].map(({ label, value, delta, c }) => (
            <div key={label} className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
              <p className="text-[9px] text-slate-400 mb-1 font-medium">{label}</p>
              <p className="text-lg font-extrabold" style={{ color: c }}>{value}</p>
              <p className="text-[9px] font-semibold text-emerald-600 mt-0.5">{delta}</p>
            </div>
          ))}
        </div>
        <div className="border border-slate-100 rounded-xl p-3">
          <p className="text-[10px] font-bold text-slate-600 mb-3">Enrolments by Programme</p>
          <div className="flex items-end gap-2 h-20">
            {bars.map(({ prog, val, c }) => (
              <div key={prog} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-sm" style={{ height: `${val}%`, background: c, opacity: 0.85, minHeight: "4px" }} />
                <p className="text-[7px] text-slate-400 font-medium text-center leading-tight">{prog}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const PRODUCT_SCREENS = [PatientMgmtScreen, AppointmentScreen, ConsultationScreen, AnalyticsScreen];

// ─────────────────────────────────────────────────────────
// FEATURE ROW MOCKUPS
// ─────────────────────────────────────────────────────────
function PatientProfileMockup() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)] bg-white">
      {/* Patient header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0" style={{ background: blueGrad }}>SM</div>
        <div className="flex-1">
          <p className="font-bold text-slate-900">Sarah Mitchell</p>
          <p className="text-xs text-slate-500">NHS 482 155 1234 · DOB: 14 Mar 1978 · GP: Dr. Patel</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: ROSE }}>HIGH RISK</span>
          <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: GREEN }}>ACTIVE</span>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        {["Overview", "Programmes", "Appointments", "Notes", "Outcomes"].map((t, i) => (
          <button key={t} className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${i === 0 ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>{t}</button>
        ))}
      </div>
      {/* Content */}
      <div className="p-5 grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Patient Details</p>
            {[["Condition", "Type 2 Diabetes + MSK"], ["BMI", "31.2 (Obese Class I)"], ["Blood Group", "A+"], ["Allergies", "Penicillin"]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-500">{k}</span>
                <span className="text-xs font-semibold text-slate-900">{v}</span>
              </div>
            ))}
          </div>
          <div className="border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Risk Scores</p>
            {[{ l: "Clinical Risk", w: 82, c: ROSE }, { l: "Lifestyle Risk", w: 68, c: AMBER }, { l: "Engagement", w: 91, c: GREEN }].map(({ l, w, c }) => (
              <div key={l} className="mb-2 last:mb-0">
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">{l}</span><span className="font-bold" style={{ color: c }}>{w}%</span></div>
                <div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${w}%`, background: c }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/30">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: BLUE }}>Active Programme</p>
            <p className="font-bold text-slate-900 text-sm">MSK Rehabilitation</p>
            <p className="text-xs text-slate-500 mb-3">Week 7 of 12 · Dr. Patel leading</p>
            <div className="h-2 rounded-full bg-white border border-blue-200 mb-1">
              <div className="h-full rounded-full" style={{ width: "58%", background: blueGrad }} />
            </div>
            <p className="text-[10px] text-slate-500">58% complete · Next session: 5 Jul 2025</p>
          </div>
          <div className="border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Upcoming Appointments</p>
            {[
              { date: "5 Jul", type: "MSK Review", st: GREEN },
              { date: "12 Jul", type: "Bloods Follow-up", st: BLUE },
              { date: "19 Jul", type: "Outcome Assessment", st: VIOLET },
            ].map(({ date, type, st }) => (
              <div key={date} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-lg text-center flex flex-col items-center justify-center text-[8px] font-bold shrink-0" style={{ background: `${st}15`, color: st }}>
                  {date.split(" ")[0]}<br />{date.split(" ")[1]}
                </div>
                <span className="text-xs text-slate-700 font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarMockup() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = [
    [{ name: "S. Mitchell", c: BLUE }, { name: "J. Okafor", c: GREEN }, null, { name: "P. Sharma", c: VIOLET }, null],
    [null, null, { name: "T. Harrison", c: AMBER }, null, { name: "E. Wilson", c: ROSE }],
    [{ name: "R. Ahmed", c: CYAN }, { name: "L. Brown", c: VIOLET }, null, null, { name: "C. Davis", c: BLUE }],
    [null, { name: "M. Taylor", c: GREEN }, { name: "A. Khan", c: AMBER }, { name: "F. Green", c: ROSE }, null],
    [{ name: "J. White", c: BLUE }, null, { name: "S. Lee", c: GREEN }, null, { name: "P. Hall", c: VIOLET }],
  ];
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)] bg-white">
      {/* Calendar header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic Calendar</p>
          <p className="font-bold text-slate-900">Week of 30 June – 4 July 2025</p>
        </div>
        <div className="flex gap-2 items-center">
          <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-xs">‹</button>
          <button className="text-xs font-bold px-3 py-1 rounded-lg text-white" style={{ background: blueGrad }}>Today</button>
          <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-xs">›</button>
        </div>
      </div>
      {/* Grid */}
      <div className="overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-5 border-b border-slate-200">
          {days.map((d, i) => (
            <div key={d} className={`py-2 text-center text-xs font-bold border-r border-slate-100 last:border-0 ${i === 1 ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}>{d}<br /><span className="text-base leading-tight">{30 + i}</span></div>
          ))}
        </div>
        {/* Slot rows */}
        {["09:00", "10:00", "11:00", "13:00", "14:00"].map((h, ri) => (
          <div key={h} className="grid grid-cols-5 border-b border-slate-100 last:border-0" style={{ height: "44px" }}>
            {days.map((d, ci) => {
              const appt = slots[ri][ci];
              return (
                <div key={d} className="border-r border-slate-100 last:border-0 p-1 flex items-center">
                  {appt ? (
                    <div className="w-full h-8 rounded-md flex items-center px-2 text-[9px] font-bold truncate" style={{ background: `${appt.c}15`, color: appt.c, borderLeft: `2px solid ${appt.c}` }}>
                      {appt.name}
                    </div>
                  ) : (
                    <div className="w-full h-8 rounded-md border border-dashed border-slate-150 flex items-center justify-center">
                      <span className="text-[8px] text-slate-200">+</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* Stats footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center gap-6">
        {[{ l: "Total Appts", v: "34", c: BLUE }, { l: "Confirmed", v: "28", c: GREEN }, { l: "Available", v: "11", c: AMBER }].map(({ l, v, c }) => (
          <div key={l} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-xs text-slate-500">{l}: <strong style={{ color: c }}>{v}</strong></span>
          </div>
        ))}
        <button className="ml-auto text-xs font-semibold text-blue-600">View full schedule →</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FULL-WIDTH ANALYTICS SHOWCASE
// ─────────────────────────────────────────────────────────
function FullDashboardShowcase() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
      {/* Chrome */}
      <div className="px-4 py-2.5 flex items-center gap-3" style={{ background: "#1e293b" }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <div className="flex-1 rounded-md px-3 py-1 text-xs text-slate-400 flex items-center gap-2" style={{ background: "#334155" }}>
          <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
          app.carenexus.health/analytics
        </div>
        <div className="flex items-center gap-1 rounded-full px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-400">LIVE</span>
        </div>
      </div>

      {/* App layout */}
      <div className="flex" style={{ background: "#f8fafc" }}>
        {/* Sidebar */}
        <div className="w-48 shrink-0 border-r border-slate-200 bg-white py-4 px-3 space-y-1">
          <div className="flex items-center gap-2 px-2 py-2 mb-3">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: blueGrad }}>
              <svg viewBox="0 0 32 32" fill="none" className="w-3 h-3">
                <rect x="13" y="4" width="6" height="24" rx="2" fill="white" />
                <rect x="4" y="13" width="24" height="6" rx="2" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-sm text-slate-900">CareNexus</span>
          </div>
          {[
            { icon: BarChart3, label: "Analytics", active: true },
            { icon: Users, label: "Patients", active: false },
            { icon: Calendar, label: "Appointments", active: false },
            { icon: Stethoscope, label: "Consultations", active: false },
            { icon: Building2, label: "Clinics", active: false },
            { icon: Shield, label: "Compliance", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <div key={label} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? "text-white" : "text-slate-500 hover:bg-slate-50"}`} style={active ? { background: blueGrad } : {}}>
              <Icon className="w-4 h-4" />
              <span className="text-xs font-semibold">{label}</span>
            </div>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 p-5 space-y-4 overflow-hidden">
          {/* Top metrics */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { l: "Total Patients", v: "2,847", delta: "+12%", c: BLUE },
              { l: "Enrolled Today", v: "14", delta: "+7", c: GREEN },
              { l: "Consultations", v: "128", delta: "+5%", c: VIOLET },
              { l: "Avg. Risk Score", v: "42.1", delta: "−2.3", c: AMBER },
              { l: "Success Rate", v: "91%", delta: "+2%", c: ROSE },
            ].map(({ l, v, delta, c }) => (
              <div key={l} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                <p className="text-[9px] text-slate-400 font-medium mb-1 truncate">{l}</p>
                <p className="text-lg font-extrabold text-slate-900">{v}</p>
                <p className="text-[9px] font-bold mt-0.5 text-emerald-600">{delta}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Area chart */}
            <div className="col-span-2 bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-700">Enrolment Trend — Last 12 Weeks</p>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[9px] font-medium text-slate-500"><span className="w-3 h-0.5 inline-block rounded" style={{ background: BLUE }} /> Enrolments</span>
                  <span className="flex items-center gap-1 text-[9px] font-medium text-slate-500"><span className="w-3 h-0.5 inline-block rounded" style={{ background: GREEN }} /> Discharges</span>
                </div>
              </div>
              <svg viewBox="0 0 380 90" className="w-full" style={{ height: "90px" }}>
                <defs>
                  <linearGradient id="ga1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={BLUE} stopOpacity="0.25" /><stop offset="100%" stopColor={BLUE} stopOpacity="0" /></linearGradient>
                  <linearGradient id="ga2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GREEN} stopOpacity="0.2" /><stop offset="100%" stopColor={GREEN} stopOpacity="0" /></linearGradient>
                </defs>
                <path d="M0,80 L34,72 L69,62 L103,68 L138,50 L172,54 L207,38 L241,42 L276,24 L310,28 L345,14 L380,8 L380,90 L0,90Z" fill="url(#ga1)" />
                <path d="M0,80 L34,72 L69,62 L103,68 L138,50 L172,54 L207,38 L241,42 L276,24 L310,28 L345,14 L380,8" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0,86 L34,84 L69,82 L103,79 L138,76 L172,72 L207,69 L241,65 L276,61 L310,58 L345,55 L380,52 L380,90 L0,90Z" fill="url(#ga2)" />
                <path d="M0,86 L34,84 L69,82 L103,79 L138,76 L172,72 L207,69 L241,65 L276,61 L310,58 L345,55 L380,52" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3" />
              </svg>
            </div>

            {/* Pie-style breakdown */}
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-700 mb-3">Patients by Status</p>
              <div className="space-y-2.5">
                {[
                  { l: "Active", v: 1840, pct: 65, c: BLUE },
                  { l: "Completed", v: 712, pct: 25, c: GREEN },
                  { l: "New", v: 198, pct: 7, c: VIOLET },
                  { l: "Discharged", v: 97, pct: 3, c: AMBER },
                ].map(({ l, v, pct, c }) => (
                  <div key={l}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: c }} /><span className="text-slate-600 font-medium">{l}</span></div>
                      <span className="font-bold text-slate-900">{v.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: c }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { prog: "MSK Rehabilitation", enrolled: 342, success: 88, c: BLUE },
              { prog: "Diabetes Prevention", enrolled: 287, success: 79, c: GREEN },
              { prog: "Cardiac Rehab", enrolled: 198, success: 91, c: VIOLET },
            ].map(({ prog, enrolled, success, c }) => (
              <div key={prog} className="bg-white rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                  <p className="text-[10px] font-bold text-slate-700 truncate">{prog}</p>
                </div>
                <div className="flex gap-4">
                  <div><p className="text-[8px] text-slate-400">Enrolled</p><p className="text-sm font-bold text-slate-900">{enrolled}</p></div>
                  <div><p className="text-[8px] text-slate-400">Success</p><p className="text-sm font-bold" style={{ color: c }}>{success}%</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN LANDING PAGE
// ─────────────────────────────────────────────────────────
export function LandingPageLight() {
  const [data, setData] = useState<{ areas: number; clinics: number; programs: number; tenants: string[] } | null>(null);
  const [activeProductTab, setActiveProductTab] = useState(0);

  useEffect(() => {
    fetch("/api/health/public-stats")
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); })
      .then((statsData) => setData(statsData))
      .catch((err) => console.error("Error loading public stats:", err));
  }, []);

  const trustStats = [
    { value: data ? `${data.areas}+` : "195+", label: "Areas Managed" },
    { value: data ? `${data.clinics}+` : "707+", label: "Active Clinics" },
    { value: data ? `${data.programs}+` : "25+", label: "Care Programmes" },
    { value: "99.9%", label: "Uptime SLA" },
  ];

  const dynamicTestimonials = testimonials.map((t, index) => {
    let orgName = t.org;
    if (data?.tenants && data.tenants.length > 0) orgName = data.tenants[index % data.tenants.length];
    return { ...t, org: orgName };
  });

  const ActiveScreen = PRODUCT_SCREENS[activeProductTab];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">

      {/* ── NAVBAR ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 md:px-10 bg-white/95 backdrop-blur-xl border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: blueGrad }}>
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
              <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">CareNexus</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#products" className="hover:text-blue-600 transition-colors">Products</a>
          <a href="#why" className="hover:text-blue-600 transition-colors">Why CareNexus</a>
          <a href="#workflow" className="hover:text-blue-600 transition-colors">Workflow</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">Customers</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-sm font-semibold text-white shadow-sm hover:opacity-90" style={{ background: blueGrad }}>
              Book a Demo
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO — 60/40 split ──────────────────────────────────────── */}
      <section className="relative pt-28 pb-24 px-6 md:px-10 overflow-hidden bg-white">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.6 }} />
        <div className="absolute top-0 right-0 w-[700px] h-[600px] pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(11,99,246,0.07) 0%, transparent 65%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-7 border border-emerald-200 bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              NHS-Compliant · SOC 2 Certified · Now Available
            </div>

            <h1 className="text-[2.75rem] md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.05] mb-6 text-slate-900">
              The clinical platform{" "}
              <span className="relative inline-block">
                <span style={{ background: "linear-gradient(120deg, #0a3d91 0%, #0b63f6 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  NHS teams trust
                </span>
              </span>
            </h1>

            <p className="text-lg text-slate-500 max-w-lg leading-relaxed mb-8">
              CareNexus unifies patient management, scheduling, clinical documentation, and outcomes analytics in a single cloud platform — built for the demands of modern healthcare at scale.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
              <Link href="/register">
                <Button size="lg" className="h-12 px-7 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 transition-opacity" style={{ background: blueGrad }}>
                  Book a Demo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-7 text-sm font-semibold bg-white border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors">
                  <Phone className="w-4 h-4 mr-2" /> Talk to Sales
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {["No credit card required", "Free onboarding", "Live within 7 days"].map((text) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="relative mt-8 lg:mt-0">
            <HeroDashboard />
          </div>
        </div>
      </section>

      {/* ── STATS BAND — dark navy ───────────────────────────────────── */}
      <section className="py-16 px-6 md:px-10 relative overflow-hidden" style={{ background: navyGrad }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-6xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-10">Powering NHS healthcare at scale</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-white/10">
            {trustStats.map(({ value, label }) => (
              <div key={label} className="text-center px-6">
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">{value}</div>
                <div className="text-sm text-blue-300/80 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLIENT LOGO STRIP ───────────────────────────────────────── */}
      <section className="py-12 px-6 md:px-10 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-8">
            Trusted by leading healthcare organisations across the UK &amp; India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {(data?.tenants && data.tenants.length > 0 ? data.tenants.slice(0, 6) : fallbackClients).map((name) => (
              <div key={name} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-default">
                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="font-bold text-slate-500 text-sm whitespace-nowrap">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS — tabbed ─────────────────────────────────────────── */}
      <section id="products" className="py-24 px-6 md:px-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[380px_1fr] gap-14 items-start">
            {/* Left — tabs */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Platform Modules</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                A complete suite. One integrated platform.
              </h2>
              <p className="text-slate-500 mb-10 leading-relaxed">
                Every module built for clinical teams — deeply connected, audit-ready, and NHS-grade by default.
              </p>
              <div className="space-y-2">
                {productTabs.map(({ icon: Icon, title, subtitle, accent, points }, i) => (
                  <button
                    key={title}
                    onClick={() => setActiveProductTab(i)}
                    className={`w-full text-left rounded-2xl p-5 transition-all duration-200 border ${activeProductTab === i ? "bg-white border-slate-200 shadow-lg" : "border-transparent hover:bg-white/60"}`}
                  >
                    <div className="flex items-center gap-3 mb-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: activeProductTab === i ? `${accent}18` : "#f1f5f9" }}>
                        <Icon className="w-4.5 h-4.5" style={{ color: activeProductTab === i ? accent : "#94a3b8", width: "18px", height: "18px" }} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{title}</p>
                        <p className="text-xs text-slate-500">{subtitle}</p>
                      </div>
                      {activeProductTab === i && <ChevronRight className="w-4 h-4 ml-auto shrink-0" style={{ color: accent }} />}
                    </div>
                    {activeProductTab === i && (
                      <ul className="mt-4 space-y-1.5 pl-12">
                        {points.map(pt => (
                          <li key={pt} className="flex items-start gap-2 text-xs text-slate-600">
                            <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — screen */}
            <div className="sticky top-24">
              <ActiveScreen />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE ROW 1 — image left, text right ──────────────────── */}
      <section id="why" className="py-24 px-6 md:px-10 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <PatientProfileMockup />
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Patient Management</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
              Every patient. Every detail. One place.
            </h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              CareNexus replaces scattered spreadsheets and legacy NHS systems with a unified patient record your whole clinical team can trust — from first referral to final discharge and beyond.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { label: "Instant search across 10,000+ patients by name, NHS number, or GP", color: BLUE },
                { label: "Risk stratification scoring surfaced directly on the patient card", color: GREEN },
                { label: "Complete GDPR audit trail on every field change — by default", color: VIOLET },
                { label: "Cascade filtering from trust level down to individual clinic", color: AMBER },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}18` }}>
                    <CheckCircle className="w-3 h-3" style={{ color }} />
                  </div>
                  <span className="text-slate-700 text-sm leading-relaxed">{label}</span>
                </div>
              ))}
            </div>
            <Link href="/register">
              <span className="inline-flex items-center gap-2 text-sm font-bold cursor-pointer hover:gap-3 transition-all" style={{ color: BLUE }}>
                Explore Patient Management <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURE ROW 2 — text left, image right ──────────────────── */}
      <section className="py-24 px-6 md:px-10 overflow-hidden" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GREEN }}>Appointment Scheduling</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
              Scheduling that works the way your team does.
            </h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              A clinical calendar built for multi-location NHS trusts. Coordinators can book, reschedule, and communicate with patients without ever leaving the platform.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { label: "Multi-clinic drag-and-drop calendar with real-time slot availability", color: GREEN },
                { label: "Automated SMS + WhatsApp reminder sequences cut no-shows by 40%", color: BLUE },
                { label: "One-click rescheduling with automatic patient notification", color: VIOLET },
                { label: "Appointment lifecycle: Booked → Attended → Followed up → Closed", color: AMBER },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}18` }}>
                    <CheckCircle className="w-3 h-3" style={{ color }} />
                  </div>
                  <span className="text-slate-700 text-sm leading-relaxed">{label}</span>
                </div>
              ))}
            </div>
            <Link href="/register">
              <span className="inline-flex items-center gap-2 text-sm font-bold cursor-pointer hover:gap-3 transition-all" style={{ color: GREEN }}>
                Explore Scheduling <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <CalendarMockup />
        </div>
      </section>

      {/* ── FULL ANALYTICS SHOWCASE — dark section ──────────────────── */}
      <section className="py-24 px-6 md:px-10 relative overflow-hidden" style={{ background: navyGrad }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #3b82f6 0%, transparent 40%), radial-gradient(circle at 80% 80%, #7c3aed 0%, transparent 40%)" }} />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-widest mb-4 text-blue-400">Outcome Analytics</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-5">
              Real-time intelligence across every programme.
            </h2>
            <p className="text-blue-200/70 max-w-xl mx-auto leading-relaxed">
              CareNexus surfaces clinical insights the moment they matter — programme performance, patient risk, and ICB-ready outcome reports in a single unified view.
            </p>
          </div>
          <FullDashboardShowcase />
        </div>
      </section>

      {/* ── WORKFLOW — numbered timeline ─────────────────────────────── */}
      <section id="workflow" className="py-24 px-6 md:px-10 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Care Pathway</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              End-to-end, from referral to outcome.
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
              CareNexus orchestrates every step of the patient journey so nothing gets missed and nothing falls through the cracks.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(8.33%+2rem)] right-[calc(8.33%+2rem)] h-px" style={{ background: "linear-gradient(90deg, #0b63f6 0%, #7c3aed 50%, #e11d48 100%)", opacity: 0.25 }} />

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {workflow.map(({ step, label, desc, icon: Icon, color }) => (
                <div key={step} className="group flex flex-col items-center text-center">
                  <div className="relative z-10 w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-md flex flex-col items-center justify-center mb-4 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-200">
                    <div className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full text-[10px] font-extrabold text-white flex items-center justify-center shadow" style={{ background: color }}>{step}</div>
                    <Icon className="w-7 h-7" style={{ color }} />
                  </div>
                  <div className="font-bold text-sm text-slate-900 mb-1">{label}</div>
                  <div className="text-xs text-slate-500 leading-snug">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — asymmetric ────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-6 md:px-10" style={{ background: "#eff6ff" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Customer Stories</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">What clinical leaders say.</h2>
          </div>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
            {/* Featured testimonial */}
            <div className="relative rounded-3xl p-8 bg-white border border-slate-200 shadow-lg flex flex-col justify-between">
              <div>
                <Quote className="w-10 h-10 mb-6 opacity-20" style={{ color: BLUE }} />
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-lg">★</span>)}
                </div>
                <p className="text-slate-800 text-lg leading-relaxed mb-8 font-medium">
                  "{dynamicTestimonials[0].quote}"
                </p>
              </div>
              <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold text-white shrink-0" style={{ background: blueGrad }}>
                  {dynamicTestimonials[0].initials}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{dynamicTestimonials[0].name}</div>
                  <div className="text-sm text-slate-500">{dynamicTestimonials[0].title}</div>
                  <div className="text-sm font-semibold" style={{ color: BLUE }}>{dynamicTestimonials[0].org}</div>
                </div>
              </div>
            </div>

            {/* Two stacked smaller */}
            <div className="flex flex-col gap-6">
              {dynamicTestimonials.slice(1).map(({ quote, name, title, org, initials, accent }) => (
                <div key={name} className="relative rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
                  <div>
                    <Quote className="w-6 h-6 mb-3 opacity-15" style={{ color: accent }} />
                    <p className="text-slate-700 text-sm leading-relaxed mb-4">"{quote}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: accent }}>
                      {initials}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{name}</div>
                      <div className="text-xs text-slate-500">{title} · <span style={{ color: accent }}>{org}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY & COMPLIANCE ────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-10 bg-white border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Security &amp; Compliance</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              Enterprise-grade protection. NHS by design.
            </h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              Patient data is the most sensitive information your organisation holds. CareNexus is architected from the ground up to meet the security and compliance standards required by UK and global healthcare regulators.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {securityBadges.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/60 hover:bg-blue-50/40 hover:border-blue-200 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${BLUE}10` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: BLUE }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual trust element */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(circle, rgba(11,99,246,0.06) 0%, transparent 70%)" }} />
            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed animate-[spin_30s_linear_infinite]" style={{ borderColor: `${BLUE}20` }} />
              {/* Mid ring */}
              <div className="absolute inset-8 rounded-full border border-slate-200" />
              {/* Inner circle */}
              <div className="relative w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-xl border border-blue-100" style={{ background: blueGrad }}>
                <Shield className="w-10 h-10 text-white mb-1" />
                <p className="text-white text-[10px] font-bold">Protected</p>
              </div>
              {/* Orbiting badges */}
              {[
                { label: "AES-256", angle: 0, c: GREEN },
                { label: "NHS DSP", angle: 60, c: BLUE },
                { label: "GDPR", angle: 120, c: VIOLET },
                { label: "SOC 2", angle: 180, c: AMBER },
                { label: "ISO 27001", angle: 240, c: ROSE },
                { label: "HIPAA", angle: 300, c: CYAN },
              ].map(({ label, angle, c }) => {
                const rad = (angle * Math.PI) / 180;
                const r = 110;
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;
                return (
                  <div key={label} className="absolute text-[9px] font-bold px-2 py-1 rounded-full text-white shadow-md" style={{ background: c, transform: `translate(${x}px, ${y}px)` }}>
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT METRICS — dark ───────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10" style={{ background: navyGrad }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-blue-400 mb-14">Measurable outcomes, not promises</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-white/10">
            {impact.map(({ value, label }) => (
              <div key={label} className="text-center px-8 py-4">
                <div className="text-6xl font-extrabold text-white mb-3 tracking-tight">{value}</div>
                <div className="text-blue-300/70 text-sm leading-relaxed max-w-xs mx-auto">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPORT + FINAL CTA ──────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
          {/* Support card */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-orange-50 border border-orange-100">
              <Headphones className="w-6 h-6" style={{ color: ORANGE }} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">World-class 24/7 support</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Onboarding, training, live data migration, and 24/7 support are included. Our clinical implementation team ensures your staff are confident from day one.
            </p>
            <ul className="space-y-2.5 mb-8">
              {["Dedicated onboarding manager", "Live data migration from your current system", "In-platform ticketing + phone + email", "SLA-backed response times"].map(pt => (
                <li key={pt} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-600 transition-colors">
                <Phone className="w-4 h-4 mr-2" /> Contact our team
              </Button>
            </Link>
          </div>

          {/* CTA card */}
          <div className="rounded-3xl p-10 relative overflow-hidden" style={{ background: navyGrad }}>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: blueGrad }} />
            <div className="relative">
              <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Get started today</div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                Ready to modernise your clinical operations?
              </h3>
              <p className="text-blue-200/70 leading-relaxed mb-8">
                Join NHS trusts and healthcare providers already delivering better outcomes with CareNexus. Book a 30-minute product demo with our clinical team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-7 text-sm font-bold text-white hover:opacity-90 transition-opacity w-full sm:w-auto" style={{ background: orangeGrad }}>
                    Book a Demo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-12 px-7 text-sm font-semibold border-white/20 text-white hover:bg-white/10 transition-colors w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-xs text-blue-300/60">No credit card · Free onboarding · NHS-compliant from day one</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 pt-16 pb-8 px-6 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: blueGrad }}>
                  <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                    <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
                    <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
                  </svg>
                </div>
                <span className="font-bold text-lg text-slate-900">CareNexus</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
                The NHS-grade cloud platform for modern patient management — secure, compliant, and built for scale.
              </p>
              <div className="space-y-2 text-sm text-slate-500 mb-5">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" style={{ color: BLUE }} /> +44 20 7946 0000</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" style={{ color: BLUE }} /> hello@carenexus.health</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" style={{ color: BLUE }} /> London, United Kingdom</div>
              </div>
              <div className="flex items-center gap-2">
                {socials.map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:border-transparent transition-all" onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BLUE; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {footerCols.map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-bold text-sm text-slate-900 mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map(l => (
                    <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Globe className="w-3.5 h-3.5" />
              <span>© {new Date().getFullYear()} CareNexus Health Ltd. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Cookie Settings</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// APP SNAPSHOT — faithful coded replica of the real Patients screen
// (mirrors the actual app UI, shown inside a browser frame)
// ─────────────────────────────────────────────────────────
const SNAPSHOT_ROWS = [
  { nhs: "91900049", first: "Isha", last: "Kulkarni", status: "Active", program: "Cardiac Rehabilitation", clinic: "Cloudnine Multispeciality Clinic Chembur" },
  { nhs: "91900048", first: "Karan", last: "Joshi", status: "Inactive", program: "Diabetes Management", clinic: "Cloudnine Clinic Chembur" },
  { nhs: "91900047", first: "Aanya", last: "Kulkarni", status: "Active", program: "Hypertension Management", clinic: "Cloudnine Polyclinic Kurla" },
  { nhs: "91900046", first: "Sonal", last: "Nair", status: "Active", program: "Elder Care", clinic: "Cloudnine Multispeciality Clinic Kurla" },
  { nhs: "91900045", first: "Aditya", last: "Shah", status: "Active", program: "Women's Health", clinic: "Cloudnine Clinic Kurla" },
  { nhs: "91900044", first: "Kabir", last: "Gaikwad", status: "Active", program: "Mental Health Support", clinic: "Cloudnine Polyclinic Andheri" },
];

const SNAPSHOT_NAV: { label: string; icon: any; group?: string; active?: boolean }[] = [
  { group: "MAIN", label: "Dashboard", icon: LayoutGrid },
  { group: "CLINICAL", label: "Patients", icon: Users, active: true },
  { label: "Tasks", icon: CheckSquare },
  { label: "Appointments", icon: Calendar },
  { label: "Consultations", icon: Stethoscope },
  { label: "Outcomes", icon: BarChart3 },
  { group: "MASTER DATA", label: "Tenants", icon: Building2 },
  { label: "Team Members", icon: Users },
  { label: "Clinics", icon: Building2 },
  { label: "Programs", icon: FileText },
];

function AppSnapshot() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] bg-white text-slate-900">
      {/* Browser chrome */}
      <div className="px-4 py-2.5 flex items-center gap-3 bg-slate-100 border-b border-slate-200">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 flex items-center gap-2 bg-white rounded-md px-3 py-1 border border-slate-200 text-[11px] text-slate-400 max-w-sm mx-auto">
          <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
          app.carenexus.health/patients
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: "440px" }}>
        {/* Sidebar */}
        <div className="w-52 shrink-0 flex flex-col text-slate-300" style={{ background: "#0a1120" }}>
          <div className="px-4 py-3.5 flex items-center gap-2 border-b border-white/5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: purpleGrad }}>
              <svg viewBox="0 0 32 32" fill="none" className="w-4 h-4"><rect x="13" y="4" width="6" height="24" rx="2" fill="white" /><rect x="4" y="13" width="24" height="6" rx="2" fill="white" /></svg>
            </div>
            <div className="leading-tight">
              <div className="text-white font-bold text-xs">CareNexus</div>
              <div className="text-[7px] text-slate-500 tracking-wide">CONNECTED CARE. BETTER OUTCOMES.</div>
            </div>
          </div>

          {/* Tenant switcher */}
          <div className="mx-3 mt-3 mb-2 flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-2.5 py-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-semibold text-white flex-1">Cloudnine Hospital</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          {/* User */}
          <div className="mx-3 mb-3 flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: purpleGrad }}>SA</div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-white truncate">System Administrator</div>
              <div className="text-[8px] text-slate-500 truncate">Northgate Mental Health Trust</div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-hidden px-3 space-y-0.5">
            {SNAPSHOT_NAV.map(({ label, icon: Icon, group, active }) => (
              <div key={label}>
                {group && <div className="text-[7px] font-bold uppercase tracking-widest text-slate-600 px-2 pt-2.5 pb-1">{group}</div>}
                <div className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg ${active ? "text-white" : "text-slate-400"}`} style={active ? { background: "linear-gradient(90deg, rgba(124,58,237,0.35), rgba(79,70,229,0.15))" } : {}}>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={active ? { color: "#a78bfa" } : {}} />
                  <span className="text-[10px] font-medium">{label}</span>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          {/* Top bar */}
          <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 w-72 text-[10px] text-slate-400">
              <Search className="w-3 h-3" /> Search patients, clinics, programs…
              <span className="ml-auto text-[8px] font-semibold bg-white border border-slate-200 rounded px-1">⌘K</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative"><Bell className="w-4 h-4 text-slate-400" /><span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 text-white text-[6px] font-bold flex items-center justify-center">12</span></div>
              <Settings className="w-4 h-4 text-slate-400" />
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: purpleGrad }}>SA</div>
            </div>
          </div>

          {/* Page header */}
          <div className="px-5 pt-4 pb-3 flex items-start justify-between">
            <div>
              <div className="text-[8px] font-bold uppercase tracking-widest text-violet-600 mb-0.5">Clinical Records</div>
              <div className="text-lg font-bold text-slate-900 leading-tight">Patients</div>
              <div className="text-[10px] text-slate-500">50 patients · Manage records, demographics, and care assignments.</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-600 border border-slate-200 rounded-md px-2 py-1 bg-white"><Download className="w-3 h-3" />Export CSV</span>
              <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-600 border border-slate-200 rounded-md px-2 py-1 bg-white"><Upload className="w-3 h-3" />Import CSV</span>
              <span className="flex items-center gap-1 text-[9px] font-semibold text-white rounded-md px-2 py-1" style={{ background: "#2563eb" }}>+ New Patient</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-5 pb-2 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex-1 text-[10px] text-slate-400">
              <Search className="w-3 h-3" /> Search by name, NHS number, mobile…
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-2.5 py-1.5"><Filter className="w-3 h-3" />Filters <span className="bg-violet-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px]">2</span></span>
            <span className="text-[10px] text-slate-400 font-medium">50 patients</span>
          </div>

          {/* Table */}
          <div className="flex-1 mx-5 mb-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-[70px_1.4fr_0.7fr_0.7fr_1.2fr_1.4fr_60px] gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/70">
              {["NHS", "NAME", "STATUS", "RISK", "PROGRAM", "CLINIC", ""].map((h, i) => (
                <div key={i} className="text-[7.5px] font-bold uppercase tracking-wider text-slate-400">{h}</div>
              ))}
            </div>
            {SNAPSHOT_ROWS.map((r) => (
              <div key={r.nhs} className="grid grid-cols-[70px_1.4fr_0.7fr_0.7fr_1.2fr_1.4fr_60px] gap-2 px-3 py-2 border-b border-slate-50 items-center">
                <div className="text-[9px] font-mono text-slate-400">{r.nhs}</div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <GradientAvatar first={r.first} last={r.last} className="!w-6 !h-6 !text-[8px]" />
                  <span className="text-[10px] font-semibold text-slate-800 truncate">{r.first} {r.last}</span>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1 text-[8px] font-semibold px-1.5 py-0.5 rounded-full border ${r.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    <span className={`w-1 h-1 rounded-full ${r.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />{r.status}
                  </span>
                </div>
                <div><span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">LOW (0)</span></div>
                <div className="flex items-center gap-1 min-w-0"><ProgramIcon name={r.program} className="!w-3 !h-3" /><span className="text-[9px] text-slate-600 truncate">{r.program}</span></div>
                <div className="flex items-center gap-1 min-w-0"><Building2 className="w-3 h-3 text-slate-300 shrink-0" /><span className="text-[9px] text-slate-500 truncate">{r.clinic}</span></div>
                <div className="flex items-center justify-end gap-1 text-slate-300"><Eye className="w-3 h-3" /><MoreVertical className="w-3 h-3" /></div>
              </div>
            ))}
            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[8px] text-slate-400">Showing 1 to 6 of 50 patients</span>
              <div className="flex items-center gap-1">
                {["1", "2", "3", "…", "5"].map((p, i) => (
                  <span key={i} className={`w-4 h-4 rounded flex items-center justify-center text-[8px] font-semibold ${p === "1" ? "text-white" : "text-slate-400 border border-slate-200"}`} style={p === "1" ? { background: "#2563eb" } : {}}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DARK AI LANDING PAGE (eka.care-style) — default export
// ─────────────────────────────────────────────────────────
interface PublicStats {
  areas: number;
  clinics: number;
  programs: number;
  patients: number;
  appointments: number;
  consultations: number;
  users: number;
  tenants: string[];
}

export default function LandingPage() {
  const [data, setData] = useState<PublicStats | null>(null);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    fetch("/api/health/public-stats")
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); })
      .then((statsData) => setData(statsData))
      .catch((err) => console.error("Error loading public stats:", err));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setWordIndex((i) => (i + 1) % ROTATING_WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);

  const dynamicTestimonials = testimonials.map((t, index) => {
    let orgName = t.org;
    if (data?.tenants && data.tenants.length > 0) orgName = data.tenants[index % data.tenants.length];
    return { ...t, org: orgName };
  });

  // Real, honest figures pulled live from the platform (public-stats endpoint).
  const fmt = (n?: number) => (n ?? 0).toLocaleString();
  const bigStats: { value: string; label: string }[] = [
    { value: fmt(data?.patients), label: "Patients Managed" },
    { value: fmt(data?.consultations), label: "Consultations Recorded" },
    { value: fmt(data?.appointments), label: "Appointments Scheduled" },
    { value: fmt(data?.clinics), label: "Active Clinics" },
    { value: fmt(data?.programs), label: "Care Programmes" },
    { value: data ? String(data.tenants.length) : "—", label: "Organisations" },
  ];

  const clientLogos = (data?.tenants && data.tenants.length > 0 ? data.tenants.slice(0, 6) : fallbackClients);

  return (
    <div className="min-h-screen text-white font-sans antialiased selection:bg-violet-500/30" style={{ background: DARK_BG }}>

      {/* ── NAVBAR ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-5 md:px-10 bg-black/40 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: purpleGrad }}>
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
              <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">CareNexus</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#products" className="hover:text-white transition-colors">Products</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stories" className="hover:text-white transition-colors">Customers</a>
          <a href="#apps" className="hover:text-white transition-colors">Apps</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-sm font-medium text-white/70 hover:text-white hover:bg-white/10">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-sm font-semibold text-white border-0 shadow-lg shadow-violet-600/25 hover:opacity-90" style={{ background: purpleGrad }}>
              Book a Demo
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-24 px-5 md:px-10">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "34px 34px", opacity: 0.5 }} />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.35) 0%, rgba(79,70,229,0.12) 45%, transparent 70%)" }} />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(59,130,246,0.18)" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-violet-400/25 bg-violet-500/10 text-violet-200">
            <Sparkles className="w-3.5 h-3.5" />
            The AI-Native Healthcare Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
            The AI-Native Ambient<br className="hidden md:block" /> Healthcare Platform for{" "}
            <span
              key={wordIndex}
              className="inline-block bg-clip-text text-transparent animate-in-up"
              style={{ backgroundImage: "linear-gradient(120deg, #ff9a3d 0%, #ff7a1a 100%)" }}
            >
              {ROTATING_WORDS[wordIndex]}
            </span>
          </h1>

          <p className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed mb-9">
            CareNexus unifies patient management, ambient clinical documentation, scheduling, and outcomes intelligence in one secure, cloud-native platform — built for healthcare at scale.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-sm font-bold text-white border-0 shadow-xl shadow-violet-600/30 hover:opacity-90 transition-opacity" style={{ background: purpleGradBright }}>
                Book a Demo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-semibold bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white transition-colors">
                <Play className="w-4 h-4 mr-2" /> Watch it work
              </Button>
            </Link>
          </div>
        </div>

        {/* Product snapshot — real app UI */}
        <div className="relative z-10 max-w-5xl mx-auto mt-16 animate-in-up">
          <div className="absolute -inset-6 rounded-[2rem] blur-3xl opacity-40 pointer-events-none" style={{ background: purpleGradBright }} />
          <div className="relative rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.6), rgba(59,130,246,0.3) 50%, rgba(255,255,255,0.05))" }}>
            <AppSnapshot />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-white/40">
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            A live look at the CareNexus clinical workspace
          </div>
        </div>
      </section>

      {/* ── CLIENT LOGO STRIP ────────────────────────────────────────── */}
      <section className="py-12 px-5 md:px-10 border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-white/35 mb-8">
            Trusted by leading healthcare organisations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {clientLogos.map((name) => (
              <div key={name} className="flex items-center gap-2 opacity-40 hover:opacity-90 transition-opacity duration-300 cursor-default">
                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-white/10">
                  <Building2 className="w-3.5 h-3.5 text-white/60" />
                </div>
                <span className="font-bold text-white/70 text-sm whitespace-nowrap">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ONE PLATFORM / INFINITE POSSIBILITIES ────────────────────── */}
      <section id="products" className="relative py-28 px-5 md:px-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[700px] rounded-full blur-[140px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 65%)" }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300 mb-4">One Product Suite</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              One Platform.<br />
              <span className="text-white/40">Infinite Healthcare Possibilities.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {showcaseProducts.map(({ icon: Icon, tag, accent, title, desc }) => (
              <div
                key={title}
                className="group relative rounded-3xl p-8 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ background: accent }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
                      <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ color: accent, background: `${accent}18` }}>{tag}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2.5">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">{desc}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color: accent }}>
                    Learn more <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SMART FEATURES / LIMITLESS INNOVATION ────────────────────── */}
      <section id="features" className="relative py-28 px-5 md:px-10 overflow-hidden" style={{ background: "linear-gradient(180deg, #0b0817 0%, #140a2e 50%, #0b0817 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300 mb-4">Capabilities</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Smart Features. <span className="bg-clip-text text-transparent" style={{ backgroundImage: purpleGradBright }}>Limitless Clinical Innovation.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartFeatures.map(({ icon: Icon, title, desc, wide }) => (
              <div
                key={title}
                className={`rounded-2xl p-6 border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm hover:border-violet-400/30 hover:bg-white/[0.06] transition-all duration-300 ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-violet-500/15 border border-violet-400/20">
                  <Icon className="w-5 h-5 text-violet-300" />
                </div>
                <h3 className="font-bold text-base mb-1.5">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL STORIES / MEASURABLE IMPACT ─────────────────────────── */}
      <section id="stories" className="py-28 px-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300 mb-4">Real Stories</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Measurable <span className="text-white/40">Impact</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto leading-relaxed mt-4">
              Clinical teams use CareNexus to deliver better outcomes, faster documentation, and effortless coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {dynamicTestimonials.map(({ quote, name, title, org, initials, accent }) => (
              <div key={name} className="rounded-2xl p-7 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition-colors flex flex-col justify-between">
                <div>
                  <Quote className="w-8 h-8 mb-4 text-violet-400/40" />
                  <p className="text-white/75 text-sm leading-relaxed mb-6">"{quote}"</p>
                </div>
                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.08]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: `linear-gradient(135deg, ${accent} 0%, #4f46e5 100%)` }}>
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{name}</div>
                    <div className="text-xs text-white/45">{title} · {org}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BIG STATS (real, live figures) ───────────────────────────── */}
      <section className="py-20 px-5 md:px-10 border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-12">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">Live from the platform</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-12 text-center">
            {bigStats.map(({ value, label }) => (
              <div key={label} className="animate-in-up">
                {data ? (
                  <div className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent tracking-tight mb-2" style={{ backgroundImage: purpleGradBright }}>{value}</div>
                ) : (
                  <div className="h-10 md:h-12 w-16 mx-auto rounded-lg bg-white/[0.06] animate-pulse mb-2" />
                )}
                <div className="text-xs text-white/45 leading-snug px-2">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPS ALREADY IN CARENEXUS ────────────────────────────────── */}
      <section id="apps" className="py-28 px-5 md:px-10">
        <div className="max-w-6xl mx-auto rounded-[2rem] p-10 md:p-16 relative overflow-hidden" style={{ background: purpleGrad }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-4">Integrations</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
                The apps you need.<br />Already in CareNexus.
              </h2>
              <p className="text-white/70 leading-relaxed mb-8 max-w-md">
                Scheduling, messaging, records, prescriptions, analytics — every tool your clinical team uses, connected and intelligent inside one platform.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-sm font-bold bg-white text-violet-700 hover:bg-white/90 transition-colors">
                  See integrations <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {appTiles.map(({ icon: Icon, c }, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-white flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform duration-200">
                  <Icon className="w-7 h-7" style={{ color: c }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ───────────────────────────────────────────── */}
      <section className="py-14 px-5 md:px-10 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-white/35 mb-8">Enterprise-grade security &amp; compliance</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {certifications.map((label) => (
              <div key={label} className="flex items-center gap-2 border border-white/[0.1] rounded-xl px-4 py-2.5 bg-white/[0.03]">
                <Shield className="w-4 h-4 text-violet-300 shrink-0" />
                <span className="text-sm font-semibold text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="py-28 px-5 md:px-10">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.3) 0%, transparent 70%)" }} />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Ready to modernise your clinical operations?
            </h2>
            <p className="text-white/55 text-lg leading-relaxed mb-9 max-w-xl mx-auto">
              Join healthcare providers already delivering better outcomes with CareNexus. Book a 30-minute demo with our clinical team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-sm font-bold text-white border-0 shadow-xl shadow-violet-600/30 hover:opacity-90 transition-opacity" style={{ background: purpleGradBright }}>
                  Book a Demo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-semibold bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white transition-colors">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-white/40">No credit card · Free onboarding · NHS-compliant from day one</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] pt-16 pb-8 px-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: purpleGrad }}>
                  <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                    <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
                    <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
                  </svg>
                </div>
                <span className="font-bold text-lg">CareNexus</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-5 max-w-xs">
                The AI-native cloud platform for modern patient management — secure, compliant, and built for scale.
              </p>
              <div className="space-y-2 text-sm text-white/50 mb-5">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-violet-300" /> +44 20 7946 0000</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-violet-300" /> hello@carenexus.health</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-violet-300" /> London, United Kingdom</div>
              </div>
              <div className="flex items-center gap-2">
                {socials.map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-violet-400/40 hover:bg-violet-500/10 transition-all">
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {footerCols.map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-bold text-sm mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l}><a href="#" className="text-sm text-white/50 hover:text-violet-300 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Globe className="w-3.5 h-3.5" />
              <span>© {new Date().getFullYear()} CareNexus Health Ltd. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/40">
              <a href="#" className="hover:text-violet-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-violet-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-violet-300 transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
