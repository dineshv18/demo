"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
    Eye, EyeOff, AlertCircle, CheckCircle2, Loader2,
    Mail, Lock, User, ArrowRight, ArrowLeft, Send, Home,
} from "lucide-react";
import Image from "next/image";
import { ThemeToggleButton } from "../site/ThemeToggle";

type AuthMode = "login" | "register";
type AuthView = "auth" | "forgot" | "forgot-sent";

interface FieldError {
    message: string;
}

interface FormErrors {
    name?: FieldError;
    email?: FieldError;
    password?: FieldError;
    confirmPassword?: FieldError;
    general?: string;
}

const passwordRules = [
    { test: (v: string) => v.length >= 8, label: "At least 8 characters" },
    { test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
    { test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
    { test: (v: string) => /[0-9]/.test(v), label: "One number" },
];

export default function LoginPage() {
    const [mode, setMode] = useState<AuthMode>("login");
    const [view, setView] = useState<AuthView>("auth");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [success, setSuccess] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotError, setForgotError] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setErrors({});
        setSuccess(false);
        setShowPassword(false);
        setShowConfirm(false);
    };

    const switchMode = (newMode: AuthMode) => {
        resetForm();
        setMode(newMode);
    };

    const validateLogin = (): boolean => {
        const e: FormErrors = {};
        if (!email.trim()) {
            e.email = { message: "Email is required" };
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            e.email = { message: "Enter a valid email address" };
        }
        if (!password) {
            e.password = { message: "Password is required" };
        } else if (password.length < 6) {
            e.password = { message: "Password must be at least 6 characters" };
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateRegister = (): boolean => {
        const e: FormErrors = {};
        if (!name.trim()) {
            e.name = { message: "Full name is required" };
        } else if (name.trim().length < 2) {
            e.name = { message: "Name must be at least 2 characters" };
        }
        if (!email.trim()) {
            e.email = { message: "Email is required" };
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            e.email = { message: "Enter a valid email address" };
        }
        if (!password) {
            e.password = { message: "Password is required" };
        } else if (password.length < 8) {
            e.password = { message: "Password must be at least 8 characters" };
        }
        if (!confirmPassword) {
            e.confirmPassword = { message: "Please confirm your password" };
        } else if (password !== confirmPassword) {
            e.confirmPassword = { message: "Passwords do not match" };
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleLogin = async (ev: FormEvent) => {
        ev.preventDefault();
        if (!validateLogin()) return;
        setLoading(true);
        setErrors({});
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(false);
        setSuccess(true);
    };

    const handleRegister = async (ev: FormEvent) => {
        ev.preventDefault();
        if (!validateRegister()) return;
        setLoading(true);
        setErrors({});
        await new Promise((r) => setTimeout(r, 1800));
        setLoading(false);
        setSuccess(true);
    };

    const handleForgotPassword = async (ev: FormEvent) => {
        ev.preventDefault();
        if (!forgotEmail.trim()) {
            setForgotError("Email is required");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
            setForgotError("Enter a valid email address");
            return;
        }
        setForgotError("");
        setForgotLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setForgotLoading(false);
        setView("forgot-sent");
    };

    const inputClass = (hasError: boolean) =>
        `w-full rounded-lg border px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all bg-muted/50 ${
            hasError
                ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
                : "border-border focus:ring-brand/40 focus:border-brand/50"
        }`;

    // ─── FORGOT PASSWORD VIEW ───
    if (view === "forgot" || view === "forgot-sent") {
        return (
            <div className="relative flex min-h-screen w-full bg-background">
                {/* Left Panel */}
                <div className="relative hidden lg:flex lg:w-[55%] overflow-hidden rounded-r-[2.5rem]">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2a2040] to-[#1a2540]" />
                        <div className="absolute inset-0 opacity-60">
                            <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                                <defs>
                                    <linearGradient id="gf1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#e040fb" />
                                        <stop offset="50%" stopColor="#7c4dff" />
                                        <stop offset="100%" stopColor="#00b0ff" />
                                    </linearGradient>
                                </defs>
                                <path d="M0,300 Q200,100 400,300 T800,300 L800,600 L0,600 Z" fill="url(#gf1)" opacity="0.5" />
                                <circle cx="400" cy="280" r="150" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                                <circle cx="400" cy="280" r="220" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            </svg>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase w-fit">
                            <span className="h-1.5 w-1.5 rounded-lg bg-amber-400 animate-pulse" />
                            Password Recovery
                        </div>
                        <div>
                            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight mb-6">
                                Reset Your<br />
                                Password
                            </h1>
                            <p className="text-white/70 text-base max-w-sm leading-relaxed">
                                No worries happens to the best of us. Enter your
                                email and we&apos;ll send you a reset link.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
                    <div className="w-full max-w-md space-y-6">
                        {/* Theme toggle + Home button */}
                        <div className="flex items-center justify-between">
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Home className="h-4 w-4" />
                                Home
                            </Link>
                            <ThemeToggleButton className="!h-9 !w-9" />
                        </div>

                        {/* Logo */}
                        <div className="flex justify-center">
                            <Link href="/" className="flex items-center gap-2.5 group">
                                <Image src="/WhiteBlack-Photoroom.png" alt="Ovantra Financial" width={40} height={40} className="h-10 w-auto dark:hidden" />
                                <Image src="/dark-Photoroom.png" alt="Ovantra Financial" width={40} height={40} className="h-10 w-auto hidden dark:block" />
                                <span className="font-display text-xl font-semibold tracking-tight">
                                    Ovantra <span className="text-gradient">Financial</span>
                                </span>
                            </Link>
                        </div>

                        {/* Back button */}
                        <button
                            type="button"
                            onClick={() => {
                                setView("auth");
                                setForgotEmail("");
                                setForgotError("");
                            }}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Sign In
                        </button>

                        {view === "forgot-sent" ? (
                            /* Success State */
                            <div className="space-y-6 text-center">
                                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                                    <Send className="h-9 w-9 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="font-display text-3xl font-bold tracking-tight">Check Your Email</h2>
                                    <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                                        We&apos;ve sent a password reset link to{" "}
                                        <span className="font-medium text-foreground">{forgotEmail}</span>.
                                        Please check your inbox and follow the instructions.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setView("auth");
                                            setForgotEmail("");
                                        }}
                                        className="w-full rounded-lg bg-foreground py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
                                    >
                                        Back to Sign In
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setView("forgot");
                                        }}
                                        className="w-full rounded-lg border border-border py-3 text-sm font-medium hover:bg-accent transition-colors"
                                    >
                                        Resend Email
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Forgot Form */
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="font-display text-3xl font-bold tracking-tight">Forgot Password?</h2>
                                    <p className="mt-2 text-muted-foreground text-sm">
                                        Enter your email and we&apos;ll send you a reset link
                                    </p>
                                </div>

                                <form className="space-y-4" onSubmit={handleForgotPassword} noValidate>
                                    <div className="space-y-1.5">
                                        <label htmlFor="forgot-email" className="text-sm font-medium">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                            <input
                                                id="forgot-email"
                                                type="email"
                                                value={forgotEmail}
                                                onChange={(e) => {
                                                    setForgotEmail(e.target.value);
                                                    if (forgotError) setForgotError("");
                                                }}
                                                placeholder="you@example.com"
                                                className={`${inputClass(!!forgotError)} pl-10`}
                                                autoFocus
                                            />
                                        </div>
                                        {forgotError && (
                                            <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {forgotError}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {forgotLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Sending Link...
                                            </>
                                        ) : (
                                            <>
                                                Send Reset Link
                                                <Send className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── SUCCESS VIEW ───
    if (success) {
        return (
            <div className="relative flex min-h-screen w-full bg-background">
                {/* Left Panel */}
                <div className="relative hidden lg:flex lg:w-[55%] overflow-hidden rounded-r-[2.5rem]">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2a2040] to-[#1a2540]" />
                        <div className="absolute inset-0 opacity-60">
                            <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                                <defs>
                                    <linearGradient id="gs1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#e040fb" />
                                        <stop offset="50%" stopColor="#7c4dff" />
                                        <stop offset="100%" stopColor="#00b0ff" />
                                    </linearGradient>
                                </defs>
                                <path d="M0,300 Q200,100 400,300 T800,300 L800,600 L0,600 Z" fill="url(#gs1)" opacity="0.5" />
                                <circle cx="400" cy="280" r="120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <circle cx="400" cy="280" r="180" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            </svg>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase w-fit">
                            <span className="h-1.5 w-1.5 rounded-lg bg-emerald-400 animate-pulse" />
                            Success
                        </div>
                        <div>
                            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight mb-6">
                                {mode === "login" ? "Welcome\nBack!" : "You're\nAll Set!"}
                            </h1>
                            <p className="text-white/70 text-base max-w-sm leading-relaxed">
                                {mode === "login"
                                    ? "Redirecting you to your trading dashboard..."
                                    : "Your account has been created. Start exploring Ovantra Financial."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Success */}
                <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
                    <div className="w-full max-w-md space-y-8 text-center">
                        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="font-display text-3xl font-bold tracking-tight">
                                {mode === "login" ? "Signed In!" : "Account Created!"}
                            </h2>
                            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                                {mode === "login"
                                    ? `Welcome back! You've successfully signed in to ${email}.`
                                    : `A verification link has been sent to ${email}. Please check your inbox.`}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => { setSuccess(false); resetForm(); }}
                                className="w-full rounded-lg bg-foreground py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
                            >
                                Continue to Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    resetForm();
                                    switchMode(mode === "login" ? "register" : "login");
                                }}
                                className="w-full rounded-lg border border-border py-3 text-sm font-medium hover:bg-accent transition-colors"
                            >
                                {mode === "login" ? "Create a new account" : "Back to Sign In"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── MAIN AUTH VIEW ───
    return (
        <div className="relative flex min-h-screen w-full bg-background">
            {/* Left Panel - Decorative */}
            <div className="relative hidden lg:flex lg:w-[55%] overflow-hidden rounded-r-[2.5rem]">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2a2040] to-[#1a2540]" />
                    <div className="absolute inset-0 opacity-60">
                        <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#e040fb" />
                                    <stop offset="50%" stopColor="#7c4dff" />
                                    <stop offset="100%" stopColor="#00b0ff" />
                                </linearGradient>
                                <linearGradient id="g2" x1="100%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#ff4081" />
                                    <stop offset="50%" stopColor="#e040fb" />
                                    <stop offset="100%" stopColor="#536dfe" />
                                </linearGradient>
                            </defs>
                            <path d="M0,300 Q200,100 400,300 T800,300 L800,600 L0,600 Z" fill="url(#g1)" opacity="0.5" />
                            <path d="M0,250 Q200,450 400,250 T800,250 L800,0 L0,0 Z" fill="url(#g2)" opacity="0.4" />
                            <path d="M-100,350 Q200,150 500,350 T900,350" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
                            <path d="M-100,400 Q300,200 600,400 T1000,400" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" fill="none" />
                            <path d="M-50,320 Q250,120 550,320 T950,320" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
                        </svg>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase w-fit">
                        <span className="h-1.5 w-1.5 rounded-lg bg-white/80 animate-pulse" />
                        A Wise Quote
                    </div>
                    <div>
                        <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight mb-6">
                            Get<br />
                            Everything<br />
                            You Want
                        </h1>
                        <p className="text-white/70 text-base max-w-sm leading-relaxed">
                            You can get everything you want if you work hard,
                            trust the process, and stick to the plan.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
                <div className="w-full max-w-md space-y-6">
                    {/* Theme toggle + Home button */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Home className="h-4 w-4" />
                            Home
                        </Link>
                        <ThemeToggleButton className="!h-9 !w-9" />
                    </div>

                    {/* Logo */}
                    <div className="flex justify-center -mt-2">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <Image src="/WhiteBlack-Photoroom.png" alt="Ovantra Financial" width={40} height={40} className="h-10 w-auto dark:hidden" />
                            <Image src="/dark-Photoroom.png" alt="Ovantra Financial" width={40} height={40} className="h-10 w-auto hidden dark:block" />
                            <span className="font-display text-xl font-semibold tracking-tight">
                                Ovantra <span className="text-gradient">Financial</span>
                            </span>
                        </Link>
                    </div>

                    {/* Tabs */}
                    <div className="relative mx-auto flex w-full max-w-xs rounded-lg bg-muted/60 p-1">
                        <div
                            className="absolute top-1 bottom-1 rounded-lg bg-background shadow-sm transition-all duration-300"
                            style={{
                                left: mode === "login" ? "4px" : "50%",
                                width: "calc(50% - 4px)",
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => switchMode("login")}
                            className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                                mode === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode("register")}
                            className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                                mode === "register" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Heading */}
                    <div className="text-center">
                        <h2 className="font-display text-3xl font-bold tracking-tight">
                            {mode === "login" ? "Welcome Back" : "Create Account"}
                        </h2>
                        <p className="mt-2 text-muted-foreground text-sm">
                            {mode === "login"
                                ? "Enter your email and password to access your account"
                                : "Fill in the details below to get started"}
                        </p>
                    </div>

                    {/* General Error */}
                    {errors.general && (
                        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {errors.general}
                        </div>
                    )}

                    {/* ─── LOGIN FORM ─── */}
                    {mode === "login" ? (
                        <form className="space-y-4" onSubmit={handleLogin} noValidate>
                            <div className="space-y-1.5">
                                <label htmlFor="login-email" className="text-sm font-medium">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                                        placeholder="you@example.com"
                                        className={`${inputClass(!!errors.email)} pl-10`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="login-password" className="text-sm font-medium">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                                        placeholder="Enter your password"
                                        className={`${inputClass(!!errors.password)} pl-10 pr-11`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-border accent-brand"
                                    />
                                    Remember me
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setView("forgot");
                                        setForgotEmail(email);
                                        setForgotError("");
                                    }}
                                    className="text-sm font-medium text-brand hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-6"
                            >
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Signing In...</>
                                ) : (
                                    <><span>Sign In</span> <ArrowRight className="h-4 w-4" /></>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* ─── REGISTER FORM ─── */
                        <form className="space-y-4" onSubmit={handleRegister} noValidate>
                            <div className="space-y-1.5">
                                <label htmlFor="reg-name" className="text-sm font-medium">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <input
                                        id="reg-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
                                        placeholder="John Doe"
                                        className={`${inputClass(!!errors.name)} pl-10`}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="reg-email" className="text-sm font-medium">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <input
                                        id="reg-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                                        placeholder="you@example.com"
                                        className={`${inputClass(!!errors.email)} pl-10`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="reg-password" className="text-sm font-medium">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <input
                                        id="reg-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                                        placeholder="Create a strong password"
                                        className={`${inputClass(!!errors.password)} pl-10 pr-11`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.password.message}
                                    </p>
                                )}
                                {password.length > 0 && (
                                    <>
                                        <div className="flex gap-1 pt-1">
                                            {passwordRules.map((rule, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-colors ${rule.test(password) ? "bg-emerald-500" : "bg-muted"}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                                            {passwordRules.map((rule, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-[11px] flex items-center gap-1 ${rule.test(password) ? "text-emerald-500" : "text-muted-foreground/60"}`}
                                                >
                                                    <CheckCircle2 className={`h-3 w-3 ${rule.test(password) ? "opacity-100" : "opacity-30"}`} />
                                                    {rule.label}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="reg-confirm" className="text-sm font-medium">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <input
                                        id="reg-confirm"
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                                        placeholder="Re-enter your password"
                                        className={`${inputClass(!!errors.confirmPassword)} pl-10 pr-11`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                                By creating an account you agree to our{" "}
                                <Link href="/about" className="text-brand hover:underline">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="/about" className="text-brand hover:underline">Privacy Policy</Link>.
                            </p>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 rounded-lg btn-glow btn-glow-hover py-3 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                            >
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</>
                                ) : (
                                    <><span>Create Account</span> <ArrowRight className="h-4 w-4" /></>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">or continue with</span>
                        </div>
                    </div>

                    {/* Google */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 rounded-lg border border-border py-3 text-sm font-medium hover:bg-accent transition-colors"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {mode === "login" ? "Sign In with Google" : "Sign Up with Google"}
                    </button>
                </div>
            </div>
        </div>
    );
}
