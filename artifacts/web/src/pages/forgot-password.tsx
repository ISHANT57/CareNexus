import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, KeyRound, Mail, CheckCircle2, Shield, Activity, Users, ShieldCheck, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to process request");
      }

      setSubmitted(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background font-sans selection:bg-primary/20">

      {/* ── LEFT PANEL (Form) ────────────────────────────────────── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10 bg-card">

        {/* Top Logo */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-16 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
              <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
            </svg>
          </div>
          <span className="font-extrabold text-xl text-foreground tracking-tight">CareNexus</span>
        </div>

        <div className="w-full max-w-[400px] mx-auto mt-16 lg:mt-0 relative">
          <Link href="/login" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary mb-10 group transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
          </Link>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                    <KeyRound className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Forgot password?</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    No worries, enter your work email and we'll send you secure reset instructions.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-foreground uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@trust.nhs.uk"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-12 h-12 bg-background border-border focus-visible:bg-card focus-visible:border-primary focus-visible:ring-primary/10 text-base rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full h-12 text-[15px] font-bold mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <div className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </div>
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-success/20">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Check your inbox</h2>
                <p className="text-muted-foreground text-[15px] leading-relaxed mb-10">
                  We've sent a secure password reset link to <br/>
                  <span className="font-bold text-foreground mt-2 block">{email}</span>
                </p>

                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                    variant="outline"
                    className="w-full h-12 font-bold border-border text-muted-foreground rounded-xl hover:bg-muted transition-colors"
                  >
                    Try another email
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer badges */}
        <div className="absolute bottom-8 left-8 sm:left-16 flex items-center gap-6 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 256-bit AES</div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> NHS DSP Toolkit Compliant</div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Premium Branding) ───────────────────────────────── */}
      <div className="hidden lg:flex relative w-[55%] flex-col justify-center items-center overflow-hidden bg-sidebar">
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />

        {/* Animated Orbs */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-gradient-to-b from-primary to-transparent rounded-full mix-blend-screen filter blur-[150px] opacity-30"
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-[480px] w-full"
        >
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-secondary/10 border border-secondary/20 rounded-2xl flex items-center justify-center mb-8">
                <ShieldCheck className="w-7 h-7 text-secondary" />
              </div>

              <h3 className="text-2xl font-bold text-sidebar-foreground mb-4">Enterprise Security</h3>
              <p className="text-sidebar-foreground/70 leading-relaxed mb-10">
                CareNexus employs zero-trust security architecture to protect patient data. Reset links are cryptographic, single-use, and expire in 15 minutes.
              </p>

              <div className="space-y-4">
                {[
                  { label: "End-to-end Encryption" },
                  { label: "ISO 27001 Certified Infrastructure" },
                  { label: "Strict Role-Based Access Controls" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-[15px] font-medium text-sidebar-foreground/90">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
