"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { IconMail, IconLoader2, IconAlertCircle, IconArrowLeft, IconSend, IconCheck } from "@tabler/icons-react";
import AuthShell, { AuthLogo } from "@/components/site/AuthShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
          <AuthLogo />

          <Card className="p-8 gap-5 shadow-sm rounded-2xl">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <IconCheck className="h-9 w-9 text-emerald-500" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Check Your Email</h2>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                We&apos;ve sent a password reset link to<br />
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="mt-2 text-muted-foreground text-xs">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full gap-2 btn-glow btn-glow-hover" size="lg">
                <Link href="/login">
                  <IconArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => { setSent(false); setEmail(""); setError(""); }}
                className="w-full"
                size="lg"
              >
                Try a different email
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      brandEyebrow="Account Recovery"
      brandTitle={<>Reset your<br />password securely</>}
      brandDescription="We'll email you a secure link to set a new password — your account stays protected the whole way through."
    >
      <div className="space-y-6">
        <AuthLogo />

        <Card className="p-6 sm:p-8 gap-0 shadow-sm rounded-2xl">
          <div className="text-center space-y-1.5 mb-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Forgot Password?</h2>
            <p className="text-muted-foreground text-sm">Enter your email and we&apos;ll send you a reset link</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-5">
              <IconAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                  placeholder="you@example.com"
                  className={`pl-10 ${error ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit" disabled={loading}
              className="w-full gap-2 btn-glow btn-glow-hover"
            >
              {loading ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <IconSend className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Card>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </AuthShell>
  );
}
