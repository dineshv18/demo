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
import Users from "./pages/Users";
import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
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
        <Route path="activity" element={<Activity />} />
        <Route path="settings" element={<div className="text-gray-900 dark:text-white text-lg font-semibold">Settings - Coming Soon</div>} />
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
