"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  IconMail, IconLock, IconArrowRight, IconLoader2, IconAlertCircle,
  IconEye, IconEyeOff,
} from "@tabler/icons-react";
import AuthShell, { AuthLogo } from "@/components/site/AuthShell";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function ClientLogin() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  // Pre-fill from a previously "remembered" email, if any.
  useEffect(() => {
    const remembered = localStorage.getItem("orvanta_remembered_email");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem("orvanta_remembered_email", email);
      } else {
        localStorage.removeItem("orvanta_remembered_email");
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      brandEyebrow="Index Investing"
      brandTitle={<>Welcome back to<br />ORVANTA</>}
      brandDescription="Institutional-grade Index investing. Transparent tiers, KYC-verified security, and real-time performance tracking."
    >
      <div className="space-y-6">
        <AuthLogo />

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="text-center space-y-1.5 mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">Sign In</h2>
            <p className="text-muted-foreground text-sm">Enter your credentials to access your account</p>
          </div>

          {errors.general && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-5">
              <IconAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  id="email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                  placeholder="you@example.com"
                  className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 transition-all bg-background ${
                    errors.email
                      ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
                      : "border-border focus:ring-brand/30 focus:border-brand/50"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <IconAlertCircle className="h-3 w-3" />{errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                  placeholder="Enter your password"
                  className={`w-full rounded-lg border pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 transition-all bg-background ${
                    errors.password
                      ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
                      : "border-border focus:ring-brand/30 focus:border-brand/50"
                  }`}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <IconAlertCircle className="h-3 w-3" />{errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-brand"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg btn-glow btn-glow-hover py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <IconArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-brand hover:underline">Create one</Link>
        </p>
      </div>
    </AuthShell>
  );
}
