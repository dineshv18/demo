"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  IconMail, IconLock, IconArrowRight, IconLoader2, IconAlertCircle,
  IconEye, IconEyeOff,
} from "@tabler/icons-react";
import Image from "next/image";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function ClientLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full bg-background">
      {/* Left Panel - Brand */}
      <div className="relative hidden lg:flex lg:w-[55%] overflow-hidden rounded-r-[1.5rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2a2040] to-[#1a2540]" />
        <div className="absolute inset-0 opacity-40">
          <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="gl1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c9a84c" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#b8942e" />
              </linearGradient>
            </defs>
            <path d="M0,300 Q200,100 400,300 T800,300 L800,600 L0,600 Z" fill="url(#gl1)" opacity="0.25" />
            <circle cx="400" cy="280" r="150" fill="none" stroke="rgba(201,168,76,0.08)" strokeWidth="1" />
            <circle cx="400" cy="280" r="220" fill="none" stroke="rgba(201,168,76,0.05)" strokeWidth="1" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Trading
          </div>
          <div>
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight mb-6">
              Ovantra<br />Financial
            </h1>
            <p className="text-white/60 text-base max-w-sm leading-relaxed">
              Institutional-grade Forex and Crypto CFD trading. Deep liquidity, transparent pricing, and enterprise security.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/WhiteBlack-Photoroom.png" alt="Ovantra" width={44} height={44} className="h-11 w-auto dark:hidden" />
              <Image src="/dark-Photoroom.png" alt="Ovantra" width={44} height={44} className="h-11 w-auto hidden dark:block" />
              <span className="font-display text-xl font-bold tracking-tight">
                Ovantra <span className="text-gradient">Financial</span>
              </span>
            </Link>
          </div>

          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground text-sm">Sign in to your trading account</p>
          </div>

          {errors.general && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
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
                <input type="checkbox" className="h-4 w-4 rounded border-border accent-brand" />
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

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-brand hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
