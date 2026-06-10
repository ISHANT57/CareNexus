import { Sidebar } from "./Sidebar";
import { AuthGuard } from "../auth/AuthGuard";
import { GlobalSearch } from "./GlobalSearch";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Skip to content
      </a>
      <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm md:h-16">
            <div className="flex flex-1 items-center gap-4 md:ml-0 md:gap-2 lg:gap-4">
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
