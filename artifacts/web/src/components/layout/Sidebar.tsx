import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderGit2,
  Map,
  ClipboardList,
  Settings,
  Bell,
  LogOut,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/users", label: "Team Members", icon: UserCircle },
  { href: "/roles", label: "Roles", icon: ClipboardList },
  { href: "/clinics", label: "Clinics", icon: Building2 },
  { href: "/programs", label: "Programs", icon: FolderGit2 },
  { href: "/areas", label: "Areas", icon: Map },
  { href: "/audit-logs", label: "Audit Logs", icon: ClipboardList },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [location, setLocation] = useLocation();
  const { data: user } = useGetMe();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    localStorage.removeItem("access_token");
    setLocation("/login");
  };

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="font-bold text-xl text-primary flex items-center gap-2 tracking-tight">
          <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm">
            C
          </div>
          Caremesh
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="text-sm font-medium text-foreground truncate">{user?.tenantName || "Tenant"}</div>
        <div className="text-xs text-muted-foreground truncate">
          {user?.firstName} {user?.lastName}
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-wider font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full inline-block">
          {user?.role}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              onClick={onNavigate}
            >
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <Link href="/notifications" onClick={onNavigate}>
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
              location === "/notifications"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              Notifications
            </div>
          </div>
        </Link>
        <Link href="/settings" onClick={onNavigate}>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
              location === "/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </Link>
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive mt-4"
          data-testid="nav-logout"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <div className="hidden md:flex w-64 border-r border-border bg-card flex-col h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile hamburger button */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="shadow-md"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </div>
    </>
  );
}
