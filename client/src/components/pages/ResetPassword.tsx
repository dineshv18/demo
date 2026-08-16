"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, Suspense } from "react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";
import { IconLock, IconLoader2, IconAlertCircle, IconCircleCheck, IconEye, IconEyeOff } from "@tabler/icons-react";
import { AuthLogo } from "@/components/site/AuthShell";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!token) { setError("Invalid reset token"); return; }
    if (!password || password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    try {
      await authAPI.resetPassword(token, password);
      toast.success("Password reset!", { description: "You can now log in with your new password." });
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Reset failed";
      setError(message);
      toast.error("Reset failed", { description: message });
    } finally { setLoading(false); }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border pl-10 pr-11 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 transition-all bg-background ${hasError ? "border-destructive focus:ring-destructive/30" : "border-border focus:ring-brand/30 focus:border-brand/50"}`;

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-4">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
          <IconAlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Invalid Link</h2>
        <p className="text-muted-foreground text-sm">This password reset link is invalid or expired.</p>
        <Link href="/forgot-password" className="inline-flex w-full items-center justify-center rounded-lg btn-glow btn-glow-hover py-3 text-sm font-semibold text-white">
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-5">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <IconCircleCheck className="h-9 w-9 text-emerald-500" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Password Reset!</h2>
          <p className="mt-2 text-muted-foreground text-sm">Your password has been updated successfully.</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="w-full rounded-lg btn-glow btn-glow-hover py-3 text-sm font-semibold text-white"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      <div className="text-center space-y-1.5 mb-6">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand/10 ring-1 ring-brand/20 mb-3">
          <IconLock className="h-6 w-6 text-brand" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Reset Password</h2>
        <p className="text-muted-foreground text-sm">Enter your new password below</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-5">
          <IconAlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">New Password</label>
          <div className="relative">
            <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className={inputClass(false)}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Confirm Password</label>
          <div className="relative">
            <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              type={showConfirm ? "text" : "password"} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className={inputClass(false)}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              {showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg btn-glow btn-glow-hover py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
        >
          {loading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <><span>Reset Password</span><IconCircleCheck className="h-4 w-4" /></>}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen w-full bg-background items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <AuthLogo />
        <Suspense fallback={<div className="flex justify-center py-8"><IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
