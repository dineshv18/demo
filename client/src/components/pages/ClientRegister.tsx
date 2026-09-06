"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, type FormEvent, useCallback } from "react";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
  IconMail, IconLock, IconUser, IconArrowRight, IconLoader2, IconAlertCircle,
  IconCircleCheck, IconShield, IconArrowLeft, IconEye, IconEyeOff,
} from "@tabler/icons-react";
import AuthShell, { AuthLogo } from "@/components/site/AuthShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheenButton } from "@/components/marketing/SheenButton";
import { cn } from "@/lib/utils";

interface FormErrors { name?: string; email?: string; password?: string; confirmPassword?: string; otp?: string; general?: string }

const passwordRules = [
  { test: (v: string) => v.length >= 8, label: "At least 8 characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "One number" },
];

type View = "register" | "otp" | "success";

export default function ClientRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const refCode = searchParams.get("ref");
  const [view, setView] = useState<View>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  const startResendTimer = () => {
    setResendTimer(60);
    const iv = setInterval(() => { setResendTimer((p) => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; }); }, 1000);
  };

  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setErrors((p) => {
      if (p[field]) return { ...p, [field]: undefined };
      return p;
    });
  }, []);

  const validateRegister = (): boolean => {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validateRegister()) return;
    setLoading(true); setErrors({});
    try {
      await authAPI.register({ name, email, password, ref: refCode || undefined });
      startResendTimer();
      setView("otp");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setErrors({ general: message });
    } finally { setLoading(false); }
  };

  const handleOTPChange = (i: number, v: string) => {
    if (v.length > 1) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  /** Backspace on an empty box steps back; arrows move between boxes. */
  const handleOTPKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      e.preventDefault();
      const n = [...otp]; n[i - 1] = ""; setOtp(n);
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
    if (e.key === "ArrowRight" && i < 5) {
      e.preventDefault();
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  /** Pasting the whole code from an email fills every box at once. */
  const handleOTPPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    const n = ["", "", "", "", "", ""];
    for (let j = 0; j < digits.length; j++) n[j] = digits[j];
    setOtp(n);
    clearFieldError("otp");
    document.getElementById(`otp-${Math.min(digits.length, 5)}`)?.focus();
  };

  const handleVerifyOTP = async () => {
    const s = otp.join("");
    if (s.length !== 6) { setErrors({ otp: "Please enter the complete 6-digit code" }); return; }
    setOtpLoading(true); setErrors({});
    try {
      await authAPI.verifyOTP(email, s);
      setView("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed. Please try again.";
      setErrors({ otp: message });
    } finally { setOtpLoading(false); }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      await authAPI.sendOTP(email);
      startResendTimer();
      setErrors({ general: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend OTP. Please try again.";
      setErrors({ general: message });
    }
  };

  // ─── SUCCESS VIEW ───
  if (view === "success") {
    return (
      <AuthShell
        brandEyebrow="Welcome Aboard"
        brandTitle={<>Your account<br />is verified</>}
        brandDescription="Sign in to fund your wallet, complete KYC, and choose the Index tier that fits your goals."
      >
        <div className="space-y-6">
          <AuthLogo />
          <Card className="gap-6 rounded-xl p-8 text-center shadow-lifted">
            <div className="mx-auto grid size-16 place-items-center rounded-xl bg-success-soft ring-1 ring-success/25">
              <IconCircleCheck className="size-8 text-success" stroke={1.75} />
            </div>
            <div>
              <p className="text-eyebrow">Verified</p>
              <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight">
                Account Verified
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your email has been confirmed. You can now sign in to your ORVANTA account.
              </p>
            </div>
            <SheenButton onClick={() => router.push("/login")} size="lg" className="w-full">
              Go to Sign In
            </SheenButton>
          </Card>
        </div>
      </AuthShell>
    );
  }

  // ─── OTP VIEW ───
  if (view === "otp") {
    const filledCount = otp.filter(Boolean).length;

    return (
      <AuthShell
        brandEyebrow="Almost There"
        brandTitle={<>Verify your<br />email address</>}
        brandDescription="One last step — confirm it's really you so we can secure your new ORVANTA account."
      >
        <div className="space-y-6">
          <AuthLogo />

          <Card className="gap-5 rounded-xl p-7 shadow-lifted sm:p-8">
            <button onClick={() => setView("register")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <IconArrowLeft className="h-4 w-4" /> Back to registration
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-xl bg-accent text-brand ring-1 ring-brand/20">
                <IconShield className="size-7" stroke={1.75} />
              </div>
              <p className="text-eyebrow">Step 2 of 2</p>
              <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                Verify Your Email
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the 6-digit code we sent to
              </p>
              <p className="mt-1 break-all font-semibold text-foreground">{email}</p>
            </div>

            {/* Fill progress — a quiet cue that doesn't require counting boxes */}
            <div className="mx-auto flex w-full max-w-55 gap-1.5" aria-hidden>
              {otp.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i < filledCount ? "bg-brand" : "bg-muted"
                  )}
                />
              ))}
            </div>

            {errors.general && (
              <div role="alert" className="flex items-start gap-3 rounded-lg border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
                <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Paste the whole code into any box and every field fills */}
            <div className="flex justify-center gap-2 sm:gap-2.5">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={d}
                  aria-label={`Verification code digit ${i + 1}`}
                  onChange={(e) => { handleOTPChange(i, e.target.value.replace(/\D/g, "")); if (errors.otp) clearFieldError("otp"); }}
                  onKeyDown={(e) => handleOTPKeyDown(i, e)}
                  onPaste={handleOTPPaste}
                  onFocus={(e) => e.currentTarget.select()}
                  className={cn(
                    "h-14 w-11 rounded-lg border-2 bg-surface-2 text-center font-display text-2xl font-semibold tabular-nums text-foreground transition-all sm:h-16 sm:w-13",
                    "focus:outline-none focus:ring-2",
                    errors.otp
                      ? "border-destructive focus:border-destructive focus:ring-destructive/25"
                      : d
                        ? "border-brand bg-accent text-brand focus:ring-brand/25"
                        : "border-border focus:border-brand focus:ring-brand/25"
                  )}
                />
              ))}
            </div>

            {errors.otp && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-danger">
                <IconAlertCircle className="size-3" />{errors.otp}
              </p>
            )}

            <SheenButton
              onClick={handleVerifyOTP}
              disabled={otpLoading || otp.join("").length !== 6}
              size="lg"
              className="w-full gap-2"
            >
              {otpLoading ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Verify Email</span>
                  <IconCircleCheck className="h-4 w-4" />
                </>
              )}
            </SheenButton>

            <p className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              <button
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                className={`font-medium ${resendTimer > 0 ? "text-muted-foreground cursor-not-allowed" : "text-brand hover:underline"}`}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
              </button>
            </p>
          </Card>
        </div>
      </AuthShell>
    );
  }

  // ─── REGISTER VIEW ───
  return (
    <AuthShell
      brandEyebrow="Get Started"
      brandTitle={<>Create your<br />investment account</>}
      brandDescription="Open an ORVANTA account in minutes. Registration is free, and KYC verification unlocks deposits and withdrawals."
    >
      <div className="space-y-6">
        <AuthLogo />

        <Card className="gap-0 rounded-xl p-7 shadow-lifted sm:p-8">
          <div className="text-center space-y-1.5 mb-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Create Account</h2>
            <p className="text-muted-foreground text-sm">Fill in the details to get started</p>
          </div>

          {errors.general && (
            <div className="flex items-start gap-3 rounded-lg border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger mb-5">
              <IconAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="reg-name" className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="reg-name" type="text" value={name}
                  onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
                  placeholder="John Doe"
                  className={`pl-10 ${errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                />
              </div>
              {errors.name && <p className="flex items-center gap-1.5 text-xs text-danger mt-1"><IconAlertCircle className="h-3 w-3" />{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="reg-email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                  placeholder="you@example.com"
                  className={`pl-10 ${errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                />
              </div>
              {errors.email && <p className="flex items-center gap-1.5 text-xs text-danger mt-1"><IconAlertCircle className="h-3 w-3" />{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="reg-password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                  placeholder="Create a strong password"
                  className={`pl-10 pr-11 ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="flex items-center gap-1.5 text-xs text-danger mt-1"><IconAlertCircle className="h-3 w-3" />{errors.password}</p>}
              {password.length > 0 && (
                <>
                  <div className="flex gap-1 pt-1">
                    {passwordRules.map((r, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${r.test(password) ? "bg-success" : "bg-muted"}`} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    {passwordRules.map((r, i) => (
                      <span key={i} className={`text-[11px] flex items-center gap-1 ${r.test(password) ? "text-success" : "text-muted-foreground/60"}`}>
                        <IconCircleCheck className={`h-3 w-3 ${r.test(password) ? "opacity-100" : "opacity-30"}`} />{r.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="reg-confirm" type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
                  placeholder="Re-enter password"
                  className={`pl-10 pr-11 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                />
                <button type="button" aria-label={showConfirm ? "Hide password" : "Show password"} onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  {showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="flex items-center gap-1.5 text-xs text-danger mt-1"><IconAlertCircle className="h-3 w-3" />{errors.confirmPassword}</p>}
            </div>

            <SheenButton type="submit" disabled={loading} size="lg" className="w-full gap-2 mt-2">
              {loading ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <IconArrowRight className="h-4 w-4" />
                </>
              )}
            </SheenButton>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}
