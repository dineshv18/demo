"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { authAPI, type User, type PageAccess, type AssignedRole } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ requiresOTP: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  assignedRole: AssignedRole | null;
  hasPageAccess: (slug: string) => PageAccess | null;
  canView: (slug: string) => boolean;
  canCreate: (slug: string) => boolean;
  canEdit: (slug: string) => boolean;
  canDelete: (slug: string) => boolean;
  roleColor: string;
  roleTheme: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authAPI.getMe();
        if (!cancelled) setUser(data.user);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authAPI.register({ name, email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return { requiresOTP: data.requiresOTP ?? false };
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const assignedRole = useMemo(() => user?.assignedRole ?? null, [user]);

  const pageAccessMap = useMemo(() => {
    const map = new Map<string, PageAccess>();
    if (assignedRole?.pages) {
      for (const pa of assignedRole.pages) {
        map.set(pa.page.slug, pa);
      }
    }
    return map;
  }, [assignedRole]);

  const hasPageAccess = useCallback((slug: string): PageAccess | null => {
    // SUPER_ADMIN always has full access
    if (user?.role === "SUPER_ADMIN") {
      return { canView: true, canCreate: true, canEdit: true, canDelete: true, page: { id: "", slug, name: slug, icon: null, category: "" } };
    }
    return pageAccessMap.get(slug) ?? null;
  }, [user, pageAccessMap]);

  const canView = useCallback((slug: string) => hasPageAccess(slug)?.canView ?? false, [hasPageAccess]);
  const canCreate = useCallback((slug: string) => hasPageAccess(slug)?.canCreate ?? false, [hasPageAccess]);
  const canEdit = useCallback((slug: string) => hasPageAccess(slug)?.canEdit ?? false, [hasPageAccess]);
  const canDelete = useCallback((slug: string) => hasPageAccess(slug)?.canDelete ?? false, [hasPageAccess]);

  const roleColor = assignedRole?.color ?? "#7c3aed";
  const roleTheme = assignedRole?.theme ?? "default";

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    assignedRole,
    hasPageAccess,
    canView,
    canCreate,
    canEdit,
    canDelete,
    roleColor,
    roleTheme,
  }), [user, loading, login, register, logout, assignedRole, hasPageAccess, canView, canCreate, canEdit, canDelete, roleColor, roleTheme]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
