import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { authAPI, type User } from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ requiresOTP: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  canView: (slug: string) => boolean;
  assignedRole: User["assignedRole"];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
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
    if (data.user.role === "USER") {
      throw new Error("Client users cannot access the admin panel. Please use the client portal.");
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authAPI.register({ name, email, password });
    if (data.user.role === "USER") {
      throw new Error("Client users cannot access the admin panel.");
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return { requiresOTP: data.requiresOTP ?? false };
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const canView = useCallback(
    (slug: string): boolean => {
      if (!user) return false;
      if (user.role === "SUPER_ADMIN") return true;
      const pages = user.assignedRole?.pages || [];
      return pages.some((p) => p.page.slug === slug && p.canView);
    },
    [user]
  );

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    canView,
    assignedRole: user?.assignedRole ?? null,
  }), [user, loading, login, register, logout, canView]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };
export type { User, AuthContextType };
