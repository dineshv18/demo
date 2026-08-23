"use client";

import { useState, type FormEvent } from "react";
import { Phone, Mail, MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Reveal } from "../site/primitives";
import { CtaBanner } from "../site/CtaBanner";

const contactInfo = [
    {
        icon: Mail,
        label: "Email",
        value: "support@orvantafinancial.com",
        href: "mailto:support@orvantafinancial.com",
    },
    {
        icon: Phone,
        label: "Support Desk",
        value: "Available 24/5 via your dashboard",
        href: "/login",
    },
    {
        icon: MapPin,
        label: "Account Support",
        value: "Submit a ticket for the fastest response",
        href: "/login",
    },
];

export default function ContactPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; message?: string }>({});

    const handleSubmit = async (ev: FormEvent) => {
        ev.preventDefault();
        const e: typeof errors = {};
        if (!firstName.trim()) e.firstName = "First name is required";
        if (!lastName.trim()) e.lastName = "Last name is required";
        if (!email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
        if (!message.trim()) e.message = "Message is required";
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        setLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(false);
        setSent(true);
    };

    const inputClass = (hasError: boolean) =>
        `w-full rounded-lg border px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 transition-all bg-background ${
            hasError
                ? "border-destructive focus:ring-destructive/30"
                : "border-border focus:ring-brand/30 focus:border-brand/50"
        }`;

    if (sent) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <Reveal>
                    <div className="text-center space-y-6 max-w-md mx-auto px-6">
                        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h2 className="font-display text-3xl font-bold tracking-tight">Message Sent!</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Thanks, <span className="font-medium text-foreground">{firstName}</span>! Our team will get back to you shortly.
                            For account-specific issues, signing in and submitting a support ticket is
                            usually the fastest way to get help.
                        </p>
                        <button
                            onClick={() => { setSent(false); setFirstName(""); setLastName(""); setEmail(""); setMessage(""); }}
                            className="w-full rounded-lg bg-foreground py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
                        >
                            Send Another Message
                        </button>
                    </div>
                </Reveal>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative"
            style={{ background: "radial-gradient(circle at 80% 15%, rgba(0,185,86,0.08), transparent 55%)" }}
        >
            <div className="relative mx-auto max-w-6xl px-5 lg:px-8 pt-28 pb-20">
                {/* Breadcrumb */}
                <Reveal>
                    <nav className="text-sm text-muted-foreground mb-4">
                        <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => window.location.href = "/"}>Home</span>
                        <span className="mx-1.5">/</span>
                        <span className="text-foreground font-medium">Contact_Us</span>
                    </nav>
                </Reveal>

                {/* Heading */}
                <Reveal delay={0.05}>
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight mb-16">
                        Contact Us
                    </h1>
                </Reveal>

                {/* Two Column Layout */}
                <div className="grid gap-16 lg:grid-cols-2 items-start">
                    {/* Left Column - Info */}
                    <div className="space-y-10">
                        <Reveal delay={0.1}>
                            <div className="space-y-3">
                                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
                                    Have a question?<br />
                                    Get in touch with us
                                </h2>
                                <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                                    Whether you're evaluating the platform or already an investor, our team
                                    is here to help. For account-specific issues, signing in and opening a
                                    support ticket gets you the fastest response.
                                </p>
                            </div>
                        </Reveal>

                        <div className="space-y-5">
                            {contactInfo.map((item, i) => (
                                <Reveal key={item.label} delay={0.15 + i * 0.08}>
                                    <a href={item.href} className="flex items-center gap-4 group">
                                        <div className="grid h-12 w-12 place-items-center rounded-full bg-brand/15 text-brand shrink-0 group-hover:bg-brand/25 transition-colors">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wider text-foreground">{item.label}</div>
                                            <div className="text-sm text-muted-foreground mt-0.5">{item.value}</div>
                                        </div>
                                    </a>
                                </Reveal>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <Reveal delay={0.15}>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-display text-2xl font-semibold tracking-tight">Send a Message</h3>
                                <p className="text-muted-foreground text-sm">
                                    Fill out the form below and we&apos;ll follow up by email.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined })); }}
                                            placeholder="First Name"
                                            className={inputClass(!!errors.firstName)}
                                        />
                                        {errors.firstName && (
                                            <p className="flex items-center gap-1.5 text-xs text-destructive">
                                                <AlertCircle className="h-3 w-3" /> {errors.firstName}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors((p) => ({ ...p, lastName: undefined })); }}
                                            placeholder="Last Name"
                                            className={inputClass(!!errors.lastName)}
                                        />
                                        {errors.lastName && (
                                            <p className="flex items-center gap-1.5 text-xs text-destructive">
                                                <AlertCircle className="h-3 w-3" /> {errors.lastName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                                        placeholder="Email Address"
                                        className={inputClass(!!errors.email)}
                                    />
                                    {errors.email && (
                                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                                            <AlertCircle className="h-3 w-3" /> {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <textarea
                                        rows={6}
                                        value={message}
                                        onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors((p) => ({ ...p, message: undefined })); }}
                                        placeholder="Write Message Here..."
                                        className={`${inputClass(!!errors.message)} resize-none`}
                                    />
                                    {errors.message && (
                                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                                            <AlertCircle className="h-3 w-3" /> {errors.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground py-3.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                                    ) : (
                                        "Submit"
                                    )}
                                </button>
                            </form>
                        </div>
                    </Reveal>
                </div>

                {/* FAQ Teaser */}
                <Reveal delay={0.1}>
                    <div className="mt-24 rounded-2xl border border-border/50 bg-card/50 p-8 md:p-10">
                        <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight mb-6">
                            Common questions
                        </h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {[
                                { q: "How long does KYC verification take?", a: "Most accounts are verified within minutes of submitting valid ID documents." },
                                { q: "Can I deposit with crypto or bank transfer?", a: "Both. Your wallet accepts crypto deposits and bank transfers, tracked in one balance." },
                                { q: "Are tier terms disclosed before I invest?", a: "Yes — minimums, maximums and maturity periods are published in your dashboard before you allocate." },
                                { q: "How does the referral program pay out?", a: "Commission is tracked automatically across five referral levels and visible in your dashboard." },
                            ].map((f) => (
                                <div key={f.q}>
                                    <div className="text-sm font-semibold text-foreground">{f.q}</div>
                                    <div className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.a}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </div>
            <CtaBanner />
        </div>
    );
}
