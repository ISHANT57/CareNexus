import { useEffect } from "react";
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
import { Activity } from "lucide-react";

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified. You can now sign in.",
      });
      // Clear search params to prevent repeating toast on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await loginMutation.mutateAsync({ data });
      // ── Store token so AuthGuard can find it on every page load ──────────
      localStorage.setItem("access_token", response.accessToken);
      // Refresh the token getter immediately so the next API call is authed
      setAuthTokenGetter(() => localStorage.getItem("access_token"));
      // Invalidate the cached getMe so AuthGuard re-fetches with the new token
      await queryClient.invalidateQueries({ queryKey: ["getMe"] });
      setLocation("/dashboard");
    } catch (error: any) {
      const errorMsg = error.data?.error?.message || error.message || "Please check your credentials and try again.";
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMsg,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">Caremesh PMS</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Sign in to your account</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Enter your details to access the clinical dashboard.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@nhs.net" {...field} data-testid="input-email" />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-submit"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="hover:text-foreground hover:underline transition-colors">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have a tenant account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block relative w-0 flex-1 bg-muted">
        <div className="absolute inset-0 h-full w-full object-cover bg-primary/5 flex items-center justify-center p-12">
          <div className="max-w-md space-y-6">
            <h3 className="text-3xl font-bold text-primary">Clinical Grade Precision</h3>
            <p className="text-lg text-primary/80">
              Caremesh PMS provides healthcare teams with the tools they need to manage patient care efficiently and securely.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="font-bold text-2xl text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime SLA</div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="font-bold text-2xl text-primary">NHS</div>
                <div className="text-sm text-muted-foreground">Compliant</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
