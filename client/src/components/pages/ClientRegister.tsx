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

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 transition-all bg-background ${
      hasError
        ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
        : "border-border focus:ring-brand/30 focus:border-brand/50"
    }`;

  // ─── SUCCESS VIEW ───
  if (view === "success") {
    return (
      <div className="flex min-h-screen w-full bg-background items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <AuthLogo />
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-5">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <IconCircleCheck className="h-9 w-9 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Account Verified!</h2>
              <p className="mt-2 text-muted-foreground text-sm">
                Your email has been verified. You can now sign in to your account.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-lg btn-glow btn-glow-hover py-3 text-sm font-semibold text-white"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── OTP VIEW ───
  if (view === "otp") {
    return (
      <AuthShell
        brandEyebrow="Almost There"
        brandTitle={<>Verify your<br />email address</>}
        brandDescription="One last step — confirm it's really you so we can secure your new ORVANTA account."
      >
        <div className="space-y-6">
          <AuthLogo />

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
            <button onClick={() => setView("register")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <IconArrowLeft className="h-4 w-4" /> Back to registration
            </button>

            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/10 ring-1 ring-brand/20 mb-4">
                <IconShield className="h-7 w-7 text-brand" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Verify Your Email</h2>
              <p className="mt-2 text-muted-foreground text-sm">
                Enter the 6-digit code sent to<br />
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            {errors.general && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <IconAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((d, i) => (
                <input
                  key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={(e) => { handleOTPChange(i, e.target.value.replace(/\D/g, "")); if (errors.otp) clearFieldError("otp"); }}
                  className={`h-13 w-11 sm:h-14 sm:w-12 text-center text-xl font-bold rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    errors.otp
                      ? "border-destructive focus:ring-destructive/30"
                      : "border-border focus:ring-brand/40 focus:border-brand/50"
                  } bg-muted/50 text-foreground`}
                />
              ))}
            </div>

            {errors.otp && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-destructive">
                <IconAlertCircle className="h-3 w-3" />{errors.otp}
              </p>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={otpLoading || otp.join("").length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-lg btn-glow btn-glow-hover py-3 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {otpLoading ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Verify Email</span>
                  <IconCircleCheck className="h-4 w-4" />
                </>
              )}
            </button>

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
          </div>
        </div>
      </AuthShell>
    );
  }

  // ─── REGISTER VIEW ───
  return (
    <AuthShell
      brandEyebrow="Get Started"
      brandTitle={<>Create your<br />trading account</>}
      brandDescription="Join thousands of traders on our institutional-grade platform. Free to register, KYC-verified in hours."
    >
      <div className="space-y-6">
        <AuthLogo />

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="text-center space-y-1.5 mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">Create Account</h2>
            <p className="text-muted-foreground text-sm">Fill in the details to get started</p>
          </div>

          {errors.general && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-5">
              <IconAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister} noValidate>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type="text" value={name}
                  onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
                  placeholder="John Doe"
                  className={inputClass(!!errors.name)}
                />
              </div>
              {errors.name && <p className="flex items-center gap-1.5 text-xs text-destructive mt-1"><IconAlertCircle className="h-3 w-3" />{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                  placeholder="you@example.com"
                  className={inputClass(!!errors.email)}
                />
              </div>
              {errors.email && <p className="flex items-center gap-1.5 text-xs text-destructive mt-1"><IconAlertCircle className="h-3 w-3" />{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                  placeholder="Create a strong password"
                  className={`${inputClass(!!errors.password)} pr-11`}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="flex items-center gap-1.5 text-xs text-destructive mt-1"><IconAlertCircle className="h-3 w-3" />{errors.password}</p>}
              {password.length > 0 && (
                <>
                  <div className="flex gap-1 pt-1">
                    {passwordRules.map((r, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${r.test(password) ? "bg-emerald-500" : "bg-muted"}`} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    {passwordRules.map((r, i) => (
                      <span key={i} className={`text-[11px] flex items-center gap-1 ${r.test(password) ? "text-emerald-500" : "text-muted-foreground/60"}`}>
                        <IconCircleCheck className={`h-3 w-3 ${r.test(password) ? "opacity-100" : "opacity-30"}`} />{r.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
                  placeholder="Re-enter password"
                  className={`${inputClass(!!errors.confirmPassword)} pr-11`}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  {showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="flex items-center gap-1.5 text-xs text-destructive mt-1"><IconAlertCircle className="h-3 w-3" />{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg btn-glow btn-glow-hover py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <IconArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}
