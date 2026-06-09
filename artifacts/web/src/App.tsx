import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TenantProvider } from "@/contexts/TenantContext";
import NotFound from "@/pages/not-found";

import { AppLayout } from "@/components/layout/AppLayout";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import DashboardPage from "@/pages/dashboard";
import PatientsPage from "@/pages/patients";
import PatientDetailPage from "@/pages/patient-detail";
import NewPatientPage from "@/pages/patient-new";
import UsersPage from "@/pages/users";
import NewUserPage from "@/pages/user-new";
import UserDetailPage from "@/pages/user-detail";
import RolesPage from "@/pages/roles";
import ClinicsPage from "@/pages/clinics";
import ProgramsPage from "@/pages/programs";
import AreasPage from "@/pages/areas";
import TenantsPage from "@/pages/tenants";
import AuditLogsPage from "@/pages/audit-logs";
import SettingsPage from "@/pages/settings";
import NotificationsPage from "@/pages/notifications";
import AppointmentsPage from "@/pages/appointments";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />

      {/* Protected Routes wrapped in AppLayout */}
      <Route path="/dashboard">
        <AppLayout><DashboardPage /></AppLayout>
      </Route>

      <Route path="/patients/new">
        <AppLayout><NewPatientPage /></AppLayout>
      </Route>
      <Route path="/patients/:id">
        <AppLayout><PatientDetailPage /></AppLayout>
      </Route>
      <Route path="/patients">
        <AppLayout><PatientsPage /></AppLayout>
      </Route>

      <Route path="/users/new">
        <AppLayout><NewUserPage /></AppLayout>
      </Route>
      <Route path="/users/:id">
        <AppLayout><UserDetailPage /></AppLayout>
      </Route>
      <Route path="/users">
        <AppLayout><UsersPage /></AppLayout>
      </Route>

      <Route path="/roles">
        <AppLayout><RolesPage /></AppLayout>
      </Route>

      <Route path="/clinics">
        <AppLayout><ClinicsPage /></AppLayout>
      </Route>
      <Route path="/programs">
        <AppLayout><ProgramsPage /></AppLayout>
      </Route>
      <Route path="/areas">
        <AppLayout><AreasPage /></AppLayout>
      </Route>
      <Route path="/tenants">
        <AppLayout><TenantsPage /></AppLayout>
      </Route>
      <Route path="/audit-logs">
        <AppLayout><AuditLogsPage /></AppLayout>
      </Route>
      <Route path="/settings">
        <AppLayout><SettingsPage /></AppLayout>
      </Route>
      <Route path="/notifications">
        <AppLayout><NotificationsPage /></AppLayout>
      </Route>
      <Route path="/appointments">
        <AppLayout><AppointmentsPage /></AppLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
}

export default App;
