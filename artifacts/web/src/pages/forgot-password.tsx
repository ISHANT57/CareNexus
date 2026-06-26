import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Loader2, CheckCircle2, Shield, Lock } from "lucide-react";

function getXsrf() {
  const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Establish the XSRF-TOKEN cookie before the user submits the form.
  // Users arriving directly from an email link skip the login page (which normally
  // seeds the cookie via its /api/health/public-stats fetch).
  useEffect(() => {
    if (!getXsrf()) fetch("/api/health/public-stats", { credentials: "include" }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const xsrf = getXsrf();
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(xsrf ? { "x-xsrf-token": xsrf } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Request failed");
      }
      setSubmitted(true);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

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

          {submitted ? (
            /* Success state */
            <div className="text-center space-y-4 animate-in-up">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Check your inbox</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  If <span className="font-medium text-foreground">{email}</span> is registered, a password reset link has been sent to your email.
                </p>
                <p className="text-muted-foreground text-xs mt-3 p-3 bg-muted/50 rounded-lg border border-border/60">
                  In development mode, the reset token is printed to the server console.
                </p>
              </div>
              <Link href="/login">
                <Button className="mt-2 w-full h-11" style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">Reset your password</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your registered email address and we'll send you a secure reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@nhs.net"
                      className="pl-10 h-11 bg-background border-border/80 focus-visible:border-primary"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold"
                  disabled={isLoading || !email.trim()}
                  style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending reset link...
                    </span>
                  ) : "Send Reset Link"}
                </Button>
              </form>

              <Link href="/login">
                <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Back to sign in
                </div>
              </Link>

              {/* Trust badges */}
              <div className="mt-10 pt-6 border-t border-border/60">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Secure reset</span>
                  </div>
                  <div className="w-px h-3 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    <span>Expires in 1 hour</span>
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
              <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
                <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
                <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Account Security</h2>
          <p className="text-white/65 text-base leading-relaxed">
            CareNexus uses enterprise-grade security to protect your healthcare data. All reset links are time-limited and single-use.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: Lock, label: "256-bit AES encryption" },
              { icon: Shield, label: "NHS compliant security" },
              { icon: CheckCircle2, label: "Single-use tokens" },
              { icon: Mail, label: "Verified email delivery" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 p-3 bg-white/8 rounded-lg border border-white/10">
                <Icon className="w-4 h-4 text-blue-300 shrink-0" />
                <span className="text-white/70 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
