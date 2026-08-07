import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconMail, IconLock, IconArrowRight, IconLoader2, IconAlertCircle,
  IconEye, IconEyeOff,
} from "@tabler/icons-react";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
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
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      setErrors({ general: message || "Login failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full bg-white dark:bg-gray-950">
      {/* Left Panel */}
      <div className="relative hidden lg:flex lg:w-[55%] overflow-hidden rounded-r-[1.5rem]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2a2040] to-[#1a2540]" />
          <div className="absolute inset-0 opacity-60">
            <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9a84c" />
                  <stop offset="50%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#b8942e" />
                </linearGradient>
              </defs>
              <path d="M0,300 Q200,100 400,300 T800,300 L800,600 L0,600 Z" fill="url(#g1)" opacity="0.3" />
              <circle cx="400" cy="280" r="150" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="1" />
              <circle cx="400" cy="280" r="220" fill="none" stroke="rgba(201,168,76,0.06)" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase w-fit">
            <span className="h-1.5 w-1.5 rounded-lg bg-emerald-400 animate-pulse" />
            Admin Portal
          </div>
          <div>
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6 font-sans">
              ORVANTA<br />Financial
            </h1>
            <p className="text-white/70 text-base max-w-sm leading-relaxed">
              Access the admin dashboard to manage your trading platform, users, and settings.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md space-y-6">
          {/* Logo (mobile) */}
          <div className="flex justify-center lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/25">
                O
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                ORVANTA <span className="text-indigo-600">Financial</span>
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="admin@orvanta.com"
                  className={`w-full rounded-lg border px-4 py-3 pl-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800/50 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:ring-amber-500/40 focus:border-amber-500"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                  <IconAlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  className={`w-full rounded-lg border px-4 py-3 pl-10 pr-11 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-800/50 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:ring-amber-500/40 focus:border-amber-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                  <IconAlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 py-3 text-sm font-semibold text-white hover:from-amber-700 hover:to-yellow-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-6 shadow-lg shadow-amber-500/25"
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

          {/* No register link - admin accounts created by super admin only */}
        </div>
      </div>
    </div>
  );
}
