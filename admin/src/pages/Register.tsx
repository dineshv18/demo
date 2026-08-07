import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import {
  IconMail, IconLock, IconUser, IconArrowRight, IconLoader2, IconAlertCircle,
  IconCircleCheck, IconShield, IconArrowLeft, IconEye, IconEyeOff,
} from "@tabler/icons-react";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
  general?: string;
}

const passwordRules = [
  { test: (v: string) => v.length >= 8, label: "At least 8 characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "One number" },
];

type View = "register" | "otp" | "success";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
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

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const validateRegister = (): boolean => {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "Full name is required";
    else if (name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
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
    setLoading(true);
    setErrors({});
    try {
      await register(name, email, password);
      startResendTimer();
      setView("otp");
    } catch (err: unknown) {
      const message = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      setErrors({ general: message || "Registration failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit OTP" });
      return;
    }
    setOtpLoading(true);
    setErrors({});
    try {
      await authAPI.verifyOTP(email, otpString);
      setView("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      setErrors({ otp: message || "Invalid OTP. Try again." });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      await authAPI.sendOTP(email);
      startResendTimer();
    } catch (err: unknown) {
      const message = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      setErrors({ general: message || "Failed to resend OTP" });
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800/50 ${
      hasError
        ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
        : "border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 focus:border-indigo-500"
    }`;

  // ─── SUCCESS VIEW ───
  if (view === "success") {
    return (
      <div className="relative flex min-h-screen w-full bg-white dark:bg-gray-950 items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <IconCircleCheck className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Account Created!
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Your admin account has been verified. You can now access the dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ─── OTP VIEW ───
  if (view === "otp") {
    return (
      <div className="relative flex min-h-screen w-full bg-white dark:bg-gray-950">
        <div className="relative hidden lg:flex lg:w-[55%] overflow-hidden rounded-r-[2.5rem]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600" />
            <div className="absolute inset-0 opacity-60">
              <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="50%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                <path d="M0,300 Q200,100 400,300 T800,300 L800,600 L0,600 Z" fill="url(#g2)" opacity="0.5" />
                <circle cx="400" cy="280" r="120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx="400" cy="280" r="180" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase w-fit">
              <span className="h-1.5 w-1.5 rounded-lg bg-amber-400 animate-pulse" />
              Verification
            </div>
            <div>
              <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6 font-sans">
                Verify Your<br />Email
              </h1>
              <p className="text-white/70 text-base max-w-sm leading-relaxed">
                We&apos;ve sent a 6-digit code to your email. Enter it below to complete registration.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
          <div className="w-full max-w-md space-y-6">
            <button
              type="button"
              onClick={() => setView("register")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back to Registration
            </button>

            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/20 mb-4">
                <IconShield className="h-8 w-8 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Enter OTP
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                Code sent to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
              </p>
            </div>

            {errors.general && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                <IconAlertCircle className="h-4 w-4 shrink-0" />
                {errors.general}
              </div>
            )}

            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    handleOTPChange(i, e.target.value.replace(/\D/g, ""));
                    if (errors.otp) setErrors((p) => ({ ...p, otp: undefined }));
                  }}
                  onKeyDown={(e) => handleOTPKeyDown(i, e)}
                  className={`h-14 w-12 text-center text-xl font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                    errors.otp
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 focus:border-indigo-500"
                  } bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white`}
                />
              ))}
            </div>
            {errors.otp && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-red-500">
                <IconAlertCircle className="h-3 w-3" />
                {errors.otp}
              </p>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={otpLoading || otp.join("").length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
            >
              {otpLoading ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Verify Email
                  <IconCircleCheck className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                className={`font-medium ${
                  resendTimer > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-indigo-600 dark:text-indigo-400 hover:underline"
                }`}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── REGISTER VIEW ───
  return (
    <div className="relative flex min-h-screen w-full bg-white dark:bg-gray-950">
      {/* Left Panel */}
      <div className="relative hidden lg:flex lg:w-[55%] overflow-hidden rounded-r-[2.5rem]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600" />
          <div className="absolute inset-0 opacity-60">
            <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <path d="M0,300 Q200,100 400,300 T800,300 L800,600 L0,600 Z" fill="url(#g3)" opacity="0.5" />
              <circle cx="400" cy="280" r="150" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <circle cx="400" cy="280" r="220" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase w-fit">
            <span className="h-1.5 w-1.5 rounded-lg bg-emerald-400 animate-pulse" />
            Admin Registration
          </div>
          <div>
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6 font-sans">
              Create Your<br />Admin Account
            </h1>
            <p className="text-white/70 text-base max-w-sm leading-relaxed">
              Register as an admin to manage the ORVANTA Financial platform, users, and trading operations.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/25">
                O
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                ORVANTA <span className="text-indigo-600">Financial</span>
              </span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create Account
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
              Fill in the details to register as an admin
            </p>
          </div>

          {errors.general && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              {errors.general}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <div className="relative">
                <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
                  placeholder="John Doe"
                  className={`${inputClass(!!errors.name)} pl-10`}
                />
              </div>
              {errors.name && <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1"><IconAlertCircle className="h-3 w-3" />{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="relative">
                <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="admin@orvanta.com"
                  className={`${inputClass(!!errors.email)} pl-10`}
                />
              </div>
              {errors.email && <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1"><IconAlertCircle className="h-3 w-3" />{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="Create a strong password"
                  className={`${inputClass(!!errors.password)} pl-10 pr-11`}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1"><IconAlertCircle className="h-3 w-3" />{errors.password}</p>}
              {password.length > 0 && (
                <>
                  <div className="flex gap-1 pt-1">
                    {passwordRules.map((rule, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${rule.test(password) ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    {passwordRules.map((rule, i) => (
                      <span key={i} className={`text-[11px] flex items-center gap-1 ${rule.test(password) ? "text-emerald-500" : "text-gray-400"}`}>
                        <IconCircleCheck className={`h-3 w-3 ${rule.test(password) ? "opacity-100" : "opacity-30"}`} />
                        {rule.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
              <div className="relative">
                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                  placeholder="Re-enter your password"
                  className={`${inputClass(!!errors.confirmPassword)} pl-10 pr-11`}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1"><IconAlertCircle className="h-3 w-3" />{errors.confirmPassword}</p>}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pt-1">
              By creating an account you agree to our{" "}
              <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-4 shadow-lg shadow-indigo-500/25"
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

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an admin account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
