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
import { Shield, Lock, CheckCircle, ArrowRight, Building2, Users, Activity, EyeOff, Eye, ChevronLeft, HeartPulse, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const registerSchema = z.object({
  tenantName: z.string().min(2, "Organisation name is required"),
  tenantDomain: z.string().min(2, "Domain is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      tenantName: "",
      tenantDomain: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["tenantName", "tenantDomain"]);
    } else if (step === 2) {
      isValid = await form.trigger(["firstName", "lastName", "email"]);
    }
    if (isValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync({ data });
      toast({
        title: "Registration successful",
        description: "Please check the server console for the email verification link to verify your account before logging in.",
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

  const variants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
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

        <div className="w-full max-w-[400px] mx-auto mt-16 lg:mt-0">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Request Access</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Create a new tenant workspace for your healthcare organization to manage patients securely.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-primary" />
              <div className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold uppercase tracking-wider">
              <span className="text-primary">Organisation</span>
              <span className={step >= 2 ? 'text-primary' : 'text-muted-foreground'}>Administrator</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="tenantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-foreground uppercase tracking-wider">Organisation Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Northgate NHS Trust"
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
                      name="tenantDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-foreground uppercase tracking-wider">Workspace Domain</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Input
                                placeholder="northgate-trust"
                                className="h-12 rounded-r-none bg-background border-border focus-visible:bg-card focus-visible:border-primary focus-visible:ring-primary/10 text-base rounded-l-xl border-r-0 transition-all"
                                {...field}
                              />
                              <div className="h-12 px-4 flex items-center bg-muted border border-l-0 border-border text-muted-foreground font-medium text-sm rounded-r-xl">
                                .carenexus.app
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="w-full h-12 text-[15px] font-bold mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 group"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-foreground uppercase tracking-wider">First Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Jane"
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
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-foreground uppercase tracking-wider">Last Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Smith"
                                className="h-12 bg-background border-border focus-visible:bg-card focus-visible:border-primary focus-visible:ring-primary/10 text-base rounded-xl transition-all"
                                {...field}
                              />
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
                          <FormLabel className="text-xs font-bold text-foreground uppercase tracking-wider">Work Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="jane.smith@nhs.net"
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
                          <FormLabel className="text-xs font-bold text-foreground uppercase tracking-wider">Create Password</FormLabel>
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
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="h-12 px-4 rounded-xl border-border text-muted-foreground font-bold hover:bg-muted transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 text-[15px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 relative overflow-hidden group"
                        disabled={registerMutation.isPending}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <div className="relative flex items-center justify-center gap-2">
                          {registerMutation.isPending ? (
                            <>
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Creating Workspace...
                            </>
                          ) : (
                            <>
                              Complete Registration <CheckCircle className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </div>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>

          <div className="mt-10 text-center text-sm text-muted-foreground font-medium border-t border-border pt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors hover:underline">
              Sign in
            </Link>
          </div>
        </div>

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
          className="absolute -bottom-[20%] -right-[10%] w-[800px] h-[800px] bg-gradient-to-t from-primary to-transparent rounded-full mix-blend-screen filter blur-[150px] opacity-30"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-b from-secondary to-transparent rounded-full mix-blend-screen filter blur-[120px] opacity-20"
        />

        <div className="relative z-10 w-full max-w-[560px] px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-success text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md">
              <Shield className="w-4 h-4" /> Built for Scale
            </div>

            <h2 className="text-4xl xl:text-5xl font-extrabold text-sidebar-foreground leading-[1.15] mb-6">
              Deploy your secure clinical workspace <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">in seconds.</span>
            </h2>

            <p className="text-lg text-sidebar-foreground/70 leading-relaxed mb-12 max-w-[480px]">
              Setup your organizational tenant, configure geographical areas, and onboard clinicians instantly with strict role-based access controls.
            </p>

            {/* Glassmorphic Feature List */}
            <div className="space-y-4">
              {[
                { icon: Users, title: "Multi-Tenant Architecture", desc: "Complete data isolation for different healthcare organizations." },
                { icon: Building2, title: "Hierarchical Control", desc: "Manage clinics across regions with ease." },
                { icon: Lock, title: "Granular RBAC", desc: "Strict permissions for Admins, Doctors, and Staff." }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div 
                    key={idx}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-sm transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sidebar-foreground font-bold text-sm mb-0.5">{item.title}</h4>
                      <p className="text-sidebar-foreground/60 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

      </div>

    </div>
  );
}
