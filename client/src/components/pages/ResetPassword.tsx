"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, Suspense } from "react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCircleCheck,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconLock,
  IconShieldLock,
} from "@tabler/icons-react";
import AuthShell, { AuthLogo } from "@/components/site/AuthShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Live strength hints — presentational only; the API still enforces the rules. */
const passwordRules = [
  { test: (v: string) => v.length >= 8, label: "At least 8 characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "One number" },
];

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

  // ─── INVALID TOKEN ───
  if (!token) {
    return (
      <Card className="gap-5 rounded-2xl p-8 text-center shadow-lifted">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-danger-soft ring-1 ring-danger/25">
          <IconAlertCircle className="size-8 text-danger" stroke={1.75} />
        </div>
        <div>
          <p className="text-eyebrow">Link problem</p>
          <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight">Invalid Link</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This password reset link is invalid or has expired. Request a fresh one and
            we&apos;ll email it straight over.
          </p>
        </div>
        <div className="space-y-3">
          <Button asChild size="lg" className="btn-glow btn-glow-hover w-full">
            <Link href="/forgot-password">Request New Link</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full gap-2">
            <Link href="/login">
              <IconArrowLeft className="size-4" /> Back to Sign In
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  // ─── SUCCESS ───
  if (success) {
    return (
      <Card className="gap-6 rounded-2xl p-8 text-center shadow-lifted">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success-soft ring-1 ring-success/25">
          <IconCircleCheck className="size-8 text-success" stroke={1.75} />
        </div>
        <div>
          <p className="text-eyebrow">All set</p>
          <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight">
            Password Reset
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your password has been updated. You can sign in with it now.
          </p>
        </div>
        <Button
          onClick={() => router.push("/login")}
          size="lg"
          className="btn-glow btn-glow-hover w-full"
        >
          Go to Sign In
        </Button>
      </Card>
    );
  }

  // ─── FORM ───
  const matchState =
    confirmPassword.length === 0
      ? null
      : password === confirmPassword
        ? "match"
        : "mismatch";

  return (
    <Card className="gap-0 rounded-2xl p-7 shadow-lifted sm:p-8">
      <div className="mb-7 space-y-2 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-accent text-brand ring-1 ring-brand/20">
          <IconShieldLock className="size-6" stroke={1.75} />
        </div>
        <p className="text-eyebrow">Secure reset</p>
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
          Set a New Password
        </h2>
        <p className="text-sm text-muted-foreground">Choose a strong password you don&apos;t use elsewhere.</p>
      </div>

      {error && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="reset-password" className="text-sm font-medium">New Password</Label>
          <div className="relative">
            <IconLock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
              placeholder="Enter new password"
              className="pl-10 pr-11"
              autoFocus
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-foreground"
            >
              {showPassword ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
            </button>
          </div>

          {password.length > 0 && (
            <>
              <div className="flex gap-1 pt-1.5">
                {passwordRules.map((r, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      r.test(password) ? "bg-success" : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1.5">
                {passwordRules.map((r, i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex items-center gap-1 text-[0.6875rem]",
                      r.test(password) ? "text-success" : "text-muted-foreground/60"
                    )}
                  >
                    <IconCircleCheck className={cn("size-3", r.test(password) ? "opacity-100" : "opacity-30")} />
                    {r.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reset-confirm" className="text-sm font-medium">Confirm Password</Label>
          <div className="relative">
            <IconLock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              id="reset-confirm"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(""); }}
              placeholder="Re-enter new password"
              className={cn(
                "pl-10 pr-11",
                matchState === "mismatch" && "border-destructive focus-visible:ring-destructive/30"
              )}
            />
            <button
              type="button"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-foreground"
            >
              {showConfirm ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
            </button>
          </div>
          {matchState === "mismatch" && (
            <p className="flex items-center gap-1.5 text-xs text-danger">
              <IconAlertCircle className="size-3" /> Passwords do not match
            </p>
          )}
          {matchState === "match" && (
            <p className="flex items-center gap-1.5 text-xs text-success">
              <IconCircleCheck className="size-3" /> Passwords match
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading} size="lg" className="btn-glow btn-glow-hover w-full gap-2">
          {loading ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <>
              <span>Reset Password</span>
              <IconCircleCheck className="size-4" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      brandEyebrow="Secure Reset"
      brandTitle={<>Choose a new<br />password</>}
      brandDescription="Pick something strong and unique. Once it's saved you'll be able to sign straight back into your ORVANTA account."
    >
      <div className="space-y-6">
        <AuthLogo />
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-brand"
        >
          <IconArrowLeft className="size-4" />
          Back to Sign In
        </Link>
      </div>
    </AuthShell>
  );
}
