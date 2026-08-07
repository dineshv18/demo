"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { IconMail, IconLoader2, IconAlertCircle, IconArrowLeft, IconSend, IconCheck } from "@tabler/icons-react";
import Image from "next/image";

export default function ForgotPassword() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address"); return; }
    setError(""); setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset link. Please try again.";
      setError(message);
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen w-full bg-background items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/WhiteBlack-Photoroom.png" alt="Ovantra" width={44} height={44} className="h-11 w-auto dark:hidden" />
              <Image src="/dark-Photoroom.png" alt="Ovantra" width={44} height={44} className="h-11 w-auto hidden dark:block" />
              <span className="font-display text-xl font-bold tracking-tight">
                Ovantra <span className="text-gradient">Financial</span>
              </span>
            </Link>
          </div>

          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <IconCheck className="h-10 w-10 text-emerald-500" />
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Check Your Email</h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              We&apos;ve sent a password reset link to<br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 rounded-lg btn-glow btn-glow-hover py-3 text-sm font-semibold text-white transition-all"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
            <button
              onClick={() => { setSent(false); setEmail(""); setError(""); }}
              className="w-full rounded-lg border border-border py-3 text-sm font-medium hover:bg-accent transition-colors"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full bg-background">
      {/* Left Panel */}
      <div className="relative hidden lg:flex lg:w-[55%] overflow-hidden rounded-r-[1.5rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2a2040] to-[#1a2540]" />
        <div className="absolute inset-0 opacity-40">
          <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="gl-fp" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c9a84c" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#b8942e" />
              </linearGradient>
            </defs>
            <path d="M0,300 Q200,100 400,300 T800,300 L800,600 L0,600 Z" fill="url(#gl-fp)" opacity="0.25" />
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
            <h2 className="font-display text-2xl font-bold tracking-tight">Forgot Password?</h2>
            <p className="text-muted-foreground text-sm">Enter your email and we&apos;ll send you a reset link</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <IconAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                  placeholder="you@example.com"
                  className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 transition-all bg-background ${
                    error
                      ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
                      : "border-border focus:ring-brand/30 focus:border-brand/50"
                  }`}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg btn-glow btn-glow-hover py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <IconSend className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
