import { useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Lock, Shield, Eye, EyeOff, ShieldCheck, Asterisk } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const search = useSearch();
  const [, setLocation] = useLocation();

  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Requirements logic
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const reqs = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "Contains at least one letter", met: hasLetter },
    { label: "Contains at least one number", met: hasNumber },
    { label: "Contains a special character", met: hasSpecial },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecial) {
      toast({ variant: "destructive", title: "Password does not meet requirements" });
      return;
    }
    if (!token) {
      toast({ variant: "destructive", title: "Missing reset token — check your link" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Reset failed");
      }
      setDone(true);
      setTimeout(() => setLocation("/login"), 3000);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Reset failed", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (hasMinLength ? 1 : 0) + (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  const strengthColor = ["bg-muted", "bg-destructive", "bg-warning", "bg-primary", "bg-success"][passwordStrength];
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];

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
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                    <Asterisk className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Create new password</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Please ensure your new password meets the security requirements below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground uppercase tracking-wider">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 bg-background border-border focus-visible:bg-card focus-visible:border-primary focus-visible:ring-primary/10 pr-12 text-base rounded-xl transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground uppercase tracking-wider">Confirm Password</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="h-12 bg-background border-border focus-visible:bg-card focus-visible:border-primary focus-visible:ring-primary/10 text-base rounded-xl transition-all"
                    />
                  </div>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Strength</span>
                        <span className={`text-xs font-bold uppercase ${strengthColor.replace('bg-', 'text-')}`}>{strengthLabel}</span>
                      </div>
                      <div className="flex gap-1 h-1.5 mb-4">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength >= level ? strengthColor : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="space-y-2">
                        {reqs.map((req, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-success/20' : 'bg-muted'}`}>
                              <CheckCircle2 className={`w-3 h-3 ${req.met ? 'text-success' : 'text-muted-foreground'}`} />
                            </div>
                            <span className={`text-sm ${req.met ? 'text-foreground' : 'text-muted-foreground'}`}>{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || passwordStrength < 4 || password !== confirm}
                    className="w-full h-12 text-[15px] font-bold mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <div className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </div>
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-success/20">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Password Reset</h2>
                <p className="text-muted-foreground text-[15px] leading-relaxed mb-8">
                  Your password has been successfully updated. You will be redirected to the sign in page momentarily.
                </p>
                <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
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
              <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-8">
                <Lock className="w-7 h-7 text-accent" />
              </div>

              <h3 className="text-2xl font-bold text-sidebar-foreground mb-4">Secure Authentication</h3>
              <p className="text-sidebar-foreground/70 leading-relaxed mb-10">
                Strong passwords protect sensitive patient health records. Please ensure your password is unique and not used on other services.
              </p>

              <div className="space-y-4">
                {[
                  { label: "Do not use common dictionary words" },
                  { label: "Avoid using personal information" },
                  { label: "Consider using a password manager" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-accent" />
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
