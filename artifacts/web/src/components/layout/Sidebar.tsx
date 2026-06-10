import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderGit2,
  Map,
  ScrollText,
  Settings,
  Bell,
  LogOut,
  UserCircle,
  Menu,
  X,
  Calendar,
  Shield,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useGetMe, useLogout, useListNotifications } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";
import { TenantSwitcher } from "./TenantSwitcher";

const ALL_ROLES = ["SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"];
const ADMIN_ROLES = ["SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN"];

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main", allowedRoles: ALL_ROLES },
  { href: "/patients", label: "Patients", icon: Users, group: "clinical", allowedRoles: ALL_ROLES },
  { href: "/tasks", label: "Tasks", icon: Calendar, group: "clinical", allowedRoles: ALL_ROLES },
  { href: "/appointments", label: "Appointments", icon: Calendar, group: "clinical", allowedRoles: ["SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN", "DOCTOR", "OPERATOR"] },
  { href: "/tenants", label: "Tenants", icon: Building2, group: "admin", allowedRoles: ["SUPER_ADMIN"] },
  { href: "/users", label: "Team Members", icon: UserCircle, group: "admin", allowedRoles: ADMIN_ROLES },
  { href: "/roles", label: "Roles & Permissions", icon: Shield, group: "admin", allowedRoles: ["SUPER_ADMIN"] },
  { href: "/clinics", label: "Clinics", icon: Building2, group: "org", allowedRoles: ["SUPER_ADMIN", "AREA_ADMIN"] },
  { href: "/programs", label: "Programs", icon: FolderGit2, group: "org", allowedRoles: ADMIN_ROLES },
  { href: "/areas", label: "Areas", icon: Map, group: "org", allowedRoles: ["SUPER_ADMIN"] },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText, group: "system", allowedRoles: ["SUPER_ADMIN"] },
];

const navGroups = [
  { key: "main", label: null },
  { key: "clinical", label: "Clinical" },
  { key: "admin", label: "Administration" },
  { key: "org", label: "Organization" },
  { key: "master_data", label: "Master Data" },
  { key: "system", label: "System" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: "light" | "dark" | "system"; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Monitor, label: "System" },
    { value: "dark", icon: Moon, label: "Dark" },
  ];

  return (
    <div className="flex items-center gap-1 bg-sidebar-accent rounded-lg p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={`${label} mode`}
          title={`${label} mode`}
          className={cn(
            "flex-1 flex items-center justify-center h-7 rounded-md transition-all duration-200",
            theme === value
              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
              : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [location, setLocation] = useLocation();
  const { data: user } = useGetMe();
  const logout = useLogout();
  const { data: notificationsData } = useListNotifications({ limit: 50 });

  const unreadCount = notificationsData?.data?.filter((n: any) => !n.readAt)?.length ?? 0;

  const filteredItems = navItems
    .filter((item) => user?.role && item.allowedRoles.includes(user.role))
    .map((item) => {
      // Group platform-wide data into "Master Data" for SUPER_ADMIN
      if (
        user?.role === "SUPER_ADMIN" &&
        ["/tenants", "/areas", "/clinics", "/programs", "/users"].includes(item.href)
      ) {
        return { ...item, group: "master_data" };
      }
      return item;
    });

  const handleLogout = async () => {
    await logout.mutateAsync();
    localStorage.removeItem("access_token");
    setLocation("/login");
  };

  const getRoleColor = (role?: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: "bg-purple-500/20 text-purple-300",
      AREA_ADMIN: "bg-blue-500/20 text-blue-300",
      CLINIC_ADMIN: "bg-cyan-500/20 text-cyan-300",
      DOCTOR: "bg-emerald-500/20 text-emerald-300",
      OPERATOR: "bg-amber-500/20 text-amber-300",
      STAFF: "bg-slate-500/20 text-slate-300",
    };
    return colors[role ?? ""] ?? "bg-slate-500/20 text-slate-300";
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-sidebar-foreground">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm overflow-hidden shrink-0" style={{background: "linear-gradient(135deg, #003f9e 0%, #0066ff 100%)"}}>
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <rect x="13" y="5" width="6" height="22" rx="2" fill="white" opacity="0.95"/>
              <rect x="5" y="13" width="22" height="6" rx="2" fill="white" opacity="0.95"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-base text-sidebar-foreground tracking-tight leading-none">
              CareNexus
            </div>
            <div className="text-[9px] text-sidebar-foreground/40 tracking-widest uppercase mt-0.5 leading-none">
              Connected Care. Better Outcomes.
            </div>
          </div>
        </div>
      </div>


      {/* User profile & Tenant Switcher */}
      <div className="px-4 py-3 border-b border-sidebar-border shrink-0">
        <TenantSwitcher />
        <div className="flex items-center gap-3 mt-4">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0 text-sm font-semibold text-sidebar-foreground/80">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-sidebar-foreground/50 truncate">
              {user?.tenantName}
            </div>
          </div>
        </div>
        {user?.role && (
          <div className={cn(
            "mt-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md inline-flex",
            getRoleColor(user.role)
          )}>
            {user.role.replace(/_/g, " ")}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5" aria-label="Main navigation">
        {navGroups.map(({ key, label }) => {
          const items = filteredItems.filter((item) => item.group === key);
          if (items.length === 0) return null;
          return (
            <div key={key} className={label ? "pt-3 first:pt-0" : ""}>
              {label && (
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
                  {label}
                </p>
              )}
              {items.map((item) => {
                const isActive = location.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={onNavigate}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 group",
                        isActive
                          ? "bg-sidebar-primary/15 text-sidebar-primary font-semibold"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-sidebar-primary" : ""
                      )} />
                      {item.label}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-3 border-t border-sidebar-border pt-3 space-y-1 shrink-0">
        {/* Theme toggle */}
        <div className="px-1 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 px-2 mb-2">
            Appearance
          </p>
          <ThemeToggle />
        </div>

        <Link href="/notifications" onClick={onNavigate}>
          <div className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all",
            location === "/notifications"
              ? "bg-sidebar-primary/15 text-sidebar-primary"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}>
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              Notifications
            </div>
            {unreadCount > 0 && (
              <span className="bg-sidebar-primary text-sidebar-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </Link>

        <Link href="/settings" onClick={onNavigate}>
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all",
            location === "/settings"
              ? "bg-sidebar-primary/15 text-sidebar-primary"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}>
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </Link>

        <div
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all text-sidebar-foreground/50 hover:bg-red-500/10 hover:text-red-400 mt-1"
          data-testid="nav-logout"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 border-r border-sidebar-border flex-col h-screen sticky top-0 bg-sidebar/80 backdrop-blur-2xl shadow-2xl z-40">
        <SidebarContent />
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="shadow-md bg-background/80 backdrop-blur-sm"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out bg-sidebar/90 backdrop-blur-2xl border-r border-sidebar-border shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </div>
    </>
  );
}
