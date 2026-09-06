"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconLoader2,
  IconMail,
  IconMailCheck,
  IconSend,
} from "@tabler/icons-react";
import AuthShell, { AuthLogo } from "@/components/site/AuthShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SheenButton } from "@/components/marketing/SheenButton";

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

  // ─── SENT ───
  // Kept inside AuthShell so recovery never drops out of the branded layout.
  if (sent) {
    return (
      <AuthShell
        brandEyebrow="Check Your Inbox"
        brandTitle={<>Your reset link<br />is on its way</>}
        brandDescription="Follow the secure link we just emailed you to choose a new password. The link expires shortly, for your protection."
      >
        <div className="space-y-6">
          <AuthLogo />

          <Card className="gap-6 rounded-xl p-7 text-center shadow-lifted sm:p-8">
            <div className="mx-auto grid size-16 place-items-center rounded-xl bg-success-soft ring-1 ring-success/25">
              <IconMailCheck className="size-8 text-success" stroke={1.75} />
            </div>

            <div>
              <p className="text-eyebrow">Email sent</p>
              <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight">
                Check your email
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We&apos;ve sent a password reset link to
              </p>
              <p className="mt-1 break-all font-semibold text-foreground">{email}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder, or try again below.
              </p>
            </div>

            <div className="space-y-3">
              <SheenButton href="/login" size="lg" className="w-full gap-2">
                <IconArrowLeft className="size-4" />
                Back to Sign In
              </SheenButton>
              <Button
                variant="outline"
                size="lg"
                onClick={() => { setSent(false); setEmail(""); setError(""); }}
                className="w-full"
              >
                Try a different email
              </Button>
            </div>
          </Card>
        </div>
      </AuthShell>
    );
  }

  // ─── REQUEST ───
  return (
    <AuthShell
      brandEyebrow="Account Recovery"
      brandTitle={<>Reset your<br />password securely</>}
      brandDescription="We'll email you a secure link to set a new password — your account stays protected the whole way through."
    >
      <div className="space-y-6">
        <AuthLogo />

        <Card className="gap-0 rounded-xl p-7 shadow-lifted sm:p-8">
          <div className="mb-7 space-y-2 text-center">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-accent text-brand ring-1 ring-brand/20">
              <IconMail className="size-6" stroke={1.75} />
            </div>
            <p className="text-eyebrow">Account recovery</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              Forgot Password?
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
              <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <IconMail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                  placeholder="you@example.com"
                  className={`pl-10 ${error ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  autoFocus
                />
              </div>
            </div>

            <SheenButton type="submit" disabled={loading} size="lg" className="w-full gap-2">
              {loading ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <IconSend className="size-4" />
                </>
              )}
            </SheenButton>
          </form>
        </Card>

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
