import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Roles from "./pages/Roles";
import Admins from "./pages/Admins";
import Activity from "./pages/Activity";
import Pages from "./pages/Pages";
import KycVerification from "./pages/KycVerification";
import Payments from "./pages/Payments";
import Support from "./pages/Support";
import SupportTickets from "./pages/SupportTickets";
import PlatformWallet from "./pages/PlatformWallet";
import Users from "./pages/Users";
import ReferralSettings from "./pages/ReferralSettings";
import IndexSettings from "./pages/IndexSettings";
import type { ReactNode } from "react";
import { Card, CardContent } from "./components/ui/card";
import { IconSettings } from "@tabler/icons-react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="admins" element={<Admins />} />
        <Route path="pages" element={<Pages />} />
        <Route path="kyc" element={<KycVerification />} />
        <Route path="payments" element={<Payments />} />
        <Route path="support" element={<Support />} />
        <Route path="support-tickets" element={<SupportTickets />} />
        <Route path="platform-wallet" element={<PlatformWallet />} />
        <Route path="activity" element={<Activity />} />
        <Route path="referrals" element={<ReferralSettings />} />
        <Route path="index-settings" element={<IndexSettings />} />
        <Route
          path="settings"
          element={
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                  <IconSettings className="h-6 w-6 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold">Settings</h2>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </CardContent>
            </Card>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
