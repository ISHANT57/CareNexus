import { Sidebar } from "./Sidebar";
import { AuthGuard } from "../auth/AuthGuard";
import { GlobalSearch } from "./GlobalSearch";
import { useLocation } from "wouter";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/patients": "Patients",
  "/appointments": "Appointments",
  "/tasks": "Tasks",
  "/programs": "Programs",
  "/clinics": "Clinics",
  "/areas": "Areas",
  "/users": "Team Members",
  "/tenants": "Tenants",
  "/roles": "Roles & Permissions",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/audit-logs": "Audit Logs",
};

function getPageLabel(path: string): string {
  if (path.startsWith("/patients/") && path !== "/patients/new") return "Patient Detail";
  if (path === "/patients/new") return "New Patient";
  return PAGE_LABELS[path] ?? "";
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const pageLabel = getPageLabel(location);

  return (
    <AuthGuard>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Skip to content
      </a>
      <div className="flex h-screen text-foreground overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm md:h-14">
            <div className="flex flex-1 items-center gap-4 md:ml-0">
              {pageLabel && (
                <div className="hidden md:flex items-center gap-2 pl-2">
                  <span className="text-sm font-semibold text-foreground">{pageLabel}</span>
                </div>
              )}
              <div className="ml-auto flex w-full md:w-auto items-center space-x-2 sm:space-x-4 pl-12 md:pl-0">
                <GlobalSearch />
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
