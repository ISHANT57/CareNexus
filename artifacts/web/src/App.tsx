import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import UsersPage from "@/pages/users";
import NewUserPage from "@/pages/user-new";
import UserDetailPage from "@/pages/user-detail";
import RolesPage from "@/pages/roles";
import SettingsPage from "@/pages/settings";
import PatientsPage from "@/pages/patients";
import PatientDetailPage from "@/pages/patient-detail";
import NewPatientPage from "@/pages/patient-new";
import AuditLogsPage from "@/pages/audit-logs";
import NotificationsPage from "@/pages/notifications";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      
      {/* Protected Routes */}
      <Route path="/">
        <Redirect to="/login" />
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
      <Route path="/settings">
        <AppLayout><SettingsPage /></AppLayout>
      </Route>
      <Route path="/audit-logs">
        <AppLayout><AuditLogsPage /></AppLayout>
      </Route>
      <Route path="/notifications">
        <AppLayout><NotificationsPage /></AppLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;