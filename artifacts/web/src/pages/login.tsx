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
import { Shield, Lock, Activity, Users, Building2, CheckCircle, ArrowRight, Eye, EyeOff, BrainCircuit, HeartPulse, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="min-h-screen w-full flex bg-background font-sans selection:bg-primary/20">

      {/* ── LEFT PANEL (Auth Form) ──────────────────────────────── */}
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

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] mx-auto mt-16 lg:mt-0"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">Enter your credentials to securely access your clinical workspace and patient records.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground uppercase tracking-wider">Work Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@trust.nhs.uk"
                        className="h-12 bg-background border-border focus-visible:bg-card focus-visible:border-primary focus-visible:ring-primary/10 text-base rounded-xl transition-all"
                        {...field}
                      />
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
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-xs font-bold text-foreground uppercase tracking-wider">Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-12 bg-background border-border focus-visible:bg-card focus-visible:border-primary focus-visible:ring-primary/10 pr-12 text-base rounded-xl transition-all"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-[15px] font-bold mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 relative overflow-hidden group"
                disabled={loginMutation.isPending}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <div className="relative flex items-center justify-center gap-2">
                  {loginMutation.isPending ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In to Workspace <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </Button>
            </form>
          </Form>

          <div className="mt-10 text-center text-sm text-muted-foreground font-medium border-t border-border pt-8">
            Don't have a platform account?{" "}
            <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors hover:underline">
              Request access
            </Link>
          </div>
        </motion.div>

        {/* Footer badges */}
        <div className="absolute bottom-8 left-8 sm:left-16 flex items-center gap-6 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 256-bit AES</div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> NHS DSP Toolkit Compliant</div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Premium Branding) ────────────────────────────────── */}
      <div className="hidden lg:flex relative w-[55%] flex-col justify-center items-center overflow-hidden bg-sidebar">
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />

        {/* Animated Orbs */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-gradient-to-b from-primary to-transparent rounded-full mix-blend-screen filter blur-[150px] opacity-30"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-t from-secondary to-transparent rounded-full mix-blend-screen filter blur-[120px] opacity-20"
        />

        <div className="relative z-10 w-full max-w-[560px] px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-secondary text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md">
              <HeartPulse className="w-4 h-4" /> Next-Gen Care
            </div>

            <h2 className="text-4xl xl:text-5xl font-extrabold text-sidebar-foreground leading-[1.15] mb-6">
              Transforming patient pathways with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">intelligent care.</span>
            </h2>

            <p className="text-lg text-sidebar-foreground/80 leading-relaxed mb-12 max-w-[480px]">
              CareNexus unifies clinical workflows, appointment scheduling, and outcome tracking across multiple facilities—providing a seamless experience for healthcare professionals.
            </p>

            {/* Glassmorphic Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-6 rounded-2xl backdrop-blur-xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-4 border border-primary/20">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sidebar-foreground font-bold mb-1">AI Insights</h3>
                <p className="text-sm text-sidebar-foreground/70 leading-relaxed">Predictive risk scoring and pathway recommendations.</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-6 rounded-2xl backdrop-blur-xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 border border-secondary/20">
                  <Activity className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-sidebar-foreground font-bold mb-1">Live Analytics</h3>
                <p className="text-sm text-sidebar-foreground/70 leading-relaxed">Real-time monitoring of clinical outcomes.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

      </div>

    </div>
  );
}
