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
      retry: false,
      queryKey: ["getMe"],
      // Only fire the query when we actually have a token stored.
      enabled: hasToken.current,
    },
  });

  useEffect(() => {
    if (!hasToken.current || error) {
      setLocation("/login");
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

  if (error || !user) {
    return null; // useEffect will redirect
  }

  return <>{children}</>;
}
