"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, Suspense } from "react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";
import { IconLock, IconLoader2, IconAlertCircle, IconCircleCheck, IconEye, IconEyeOff, IconHome } from "@tabler/icons-react";
import Image from "next/image";
import { ThemeToggleButton } from "../site/ThemeToggle";

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
      const msg = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      setError(msg || "Reset failed");
      toast.error("Reset failed", { description: msg });
    } finally { setLoading(false); }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all bg-muted/50 ${hasError ? "border-destructive focus:ring-destructive/30" : "border-border focus:ring-brand/40 focus:border-brand/50"}`;

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h2 className="font-display text-3xl font-bold tracking-tight">Invalid Link</h2>
        <p className="text-muted-foreground text-sm">This password reset link is invalid or expired.</p>
        <Link href="/forgot-password" className="inline-block rounded-lg bg-foreground py-3 px-6 text-sm font-semibold text-background hover:bg-foreground/90">Request New Link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <IconCircleCheck className="h-10 w-10 text-emerald-500" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Password Reset!</h2>
          <p className="mt-3 text-muted-foreground text-sm">Your password has been updated successfully.</p>
        </div>
        <button onClick={() => router.push("/login")} className="w-full rounded-lg bg-foreground py-3 text-sm font-semibold text-background hover:bg-foreground/90">Go to Sign In</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight">Reset Password</h2>
        <p className="mt-2 text-muted-foreground text-sm">Enter your new password below</p>
      </div>
      {error && <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><IconAlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">New Password</label>
          <div className="relative">
            <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" className={`${inputClass(false)} pl-10 pr-11`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}</button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Confirm Password</label>
          <div className="relative">
            <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className={`${inputClass(false)} pl-10 pr-11`} />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}</button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg btn-glow btn-glow-hover py-3 text-sm font-semibold text-white transition-all disabled:opacity-60">
          {loading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <><span>Reset Password</span><IconCircleCheck className="h-4 w-4" /></>}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen w-full bg-background items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><IconHome className="h-4 w-4" /> Home</Link>
          <ThemeToggleButton className="!h-9 !w-9" />
        </div>
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/WhiteBlack-Photoroom.png" alt="Ovantra" width={40} height={40} className="h-10 w-auto dark:hidden" />
            <Image src="/dark-Photoroom.png" alt="Ovantra" width={40} height={40} className="h-10 w-auto hidden dark:block" />
            <span className="font-display text-xl font-semibold tracking-tight">Ovantra <span className="text-gradient">Financial</span></span>
          </Link>
        </div>
        <Suspense fallback={<div className="flex justify-center py-8"><IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
