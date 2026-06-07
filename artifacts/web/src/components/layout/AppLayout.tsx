import { Sidebar } from "./Sidebar";
import { AuthGuard } from "../auth/AuthGuard";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        {/* pt-14 on mobile gives room for the floating hamburger button */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
