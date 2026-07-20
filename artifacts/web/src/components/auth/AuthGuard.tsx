import { useGetMe, setAuthTokenGetter } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

// Initialise the token getter once at module load time so that
// the very first useGetMe() call already has the token in its
// Authorization header.  Without this the query fires with no
// token, gets a 401, and redirects to /login even when the user
// IS logged in (the "AuthGuard flash" bug).
setAuthTokenGetter(() => localStorage.getItem("access_token"));

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  // If there is no token at all, skip the network call and
  // redirect immediately – no flash, no spinner.
  const hasToken = useRef(!!localStorage.getItem("access_token"));

  const { data: user, isLoading, error } = useGetMe({
    query: {
      // Retry on 5xx / network errors (up to 2 times) but not on auth failures
      // (4xx) — those should redirect immediately, not loop endlessly.
      retry: (failureCount, err) => {
        const status = (err as any)?.status as number | undefined;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      queryKey: ["getMe"],
      // Only fire the query when we actually have a token stored.
      enabled: hasToken.current,
    },
  });

  useEffect(() => {
    if (!hasToken.current) {
      setLocation("/login");
      return;
    }
    if (error) {
      // Only redirect to login on definitive auth failures (4xx).
      // Transient server errors (5xx) or network failures should not log the user
      // out — they may recover on retry. The 401 case is already handled by
      // customFetch (which silently refreshes + retries before this error fires).
      const status = (error as any)?.status as number | undefined;
      if (!status || (status >= 400 && status < 500)) {
        setLocation("/login");
      }
    }
  }, [error, setLocation]);

  // No token → redirect is already scheduled; render nothing.
  if (!hasToken.current) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 4xx → useEffect already scheduled the redirect; render nothing while navigating.
  // 5xx / network error → show a minimal retry prompt rather than a blank screen.
  if (error) {
    const status = (error as any)?.status as number | undefined;
    if (status && status >= 500) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-background text-foreground">
          <p className="text-sm text-muted-foreground">Unable to reach the server. Please try again.</p>
          <button
            className="text-sm underline text-primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return null; // 4xx — useEffect redirect in progress
  }

  if (!user) {
    return null; // still loading or redirect in progress
  }

  return <>{children}</>;
}
