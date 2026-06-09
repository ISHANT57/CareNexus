import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-4 space-y-6">
        {/* CareNexus Logo */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}
          >
            <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9">
              <rect x="13" y="4" width="6" height="24" rx="2" fill="white" opacity="0.95" />
              <rect x="4" y="13" width="24" height="6" rx="2" fill="white" opacity="0.95" />
            </svg>
          </div>
        </div>

        <div>
          <div className="text-8xl font-bold text-foreground/10 leading-none mb-2">404</div>
          <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
          <Link href="/dashboard">
            <Button size="sm" style={{ background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)" }}>
              <Home className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          CareNexus — Connected Care. Better Outcomes.
        </p>
      </div>
    </div>
  );
}
