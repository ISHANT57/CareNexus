import { useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Lock, Shield, ArrowRight } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Password must be at least 8 characters" });
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

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : password.length < 12 ? 3 : 4;
  const strengthLabel = ["", "Too short", "Weak", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"][passwordStrength];

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Left — Auth Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-12 relative z-10">
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

          {done ? (
            <div className="text-center space-y-4 animate-in-up">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Password updated!</h1>
                <p className="text-muted-foreground text-sm">
                  Your password has been successfully reset. Redirecting to sign in...
                </p>
              </div>
              <Link href="/login">
                <Button className="w-full h-11" style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}>
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">Set new password</h1>
                <p className="text-sm text-muted-foreground">Choose a strong password for your CareNexus account.</p>
              </div>

              {!token && (
                <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg">
                  Invalid or missing reset token. Please{" "}
                  <Link href="/forgot-password" className="underline font-medium">request a new reset link</Link>.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-password" className="text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reset-password"
                      type="password"
                      placeholder="Min. 8 characters"
                      className="pl-10 h-11 bg-background border-border/80"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  {password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= passwordStrength ? strengthColor : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{strengthLabel}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-confirm" className="text-sm font-medium">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reset-confirm"
                      type="password"
                      placeholder="Repeat your password"
                      className="pl-10 h-11 bg-background border-border/80"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                  {confirm.length > 0 && confirm !== password && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold"
                  disabled={isLoading || !token || !password || !confirm}
                  style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetting password...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Reset Password <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <Link href="/forgot-password">
                <div className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Request a new reset link
                </div>
              </Link>

              <div className="mt-8 pt-5 border-t border-border/60">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Encrypted</span>
                  </div>
                  <div className="w-px h-3 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    <span>NHS Compliant</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right — Branding Panel (desktop only) */}
      <div
        className="hidden lg:flex relative w-[52%] flex-col items-center justify-center p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #001f5e 0%, #003f9e 40%, #0066ff 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }} />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />
        </div>

        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-blue-200" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Secure Password Reset</h2>
          <p className="text-white/65 text-base leading-relaxed">
            Use a strong, unique password to protect your CareNexus account and the patient data you are entrusted to manage.
          </p>
          <div className="p-4 bg-white/8 rounded-xl border border-white/10 text-left space-y-2">
            <p className="text-white/80 text-sm font-medium mb-3">Password requirements:</p>
            {["At least 8 characters", "Mix of letters and numbers", "At least one special character", "Not previously used"].map((req) => (
              <div key={req} className="flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                {req}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
