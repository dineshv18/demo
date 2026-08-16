"use client";

import Link from "next/link";
import Image from "next/image";
import {
    LineChart, ShieldCheck, BarChart3, Wallet, CalendarDays, Layers,
    ArrowRight, Download, Monitor, Globe, Smartphone, Sparkles,
} from "lucide-react";
import { Reveal } from "../site/primitives";

const features = [
    {
        icon: LineChart,
        title: "Real-Time Performance Charts",
        desc: "Track your Index performance with clear, up-to-date charts covering historical and live movement.",
        beginner: "Think of these charts as your investment map — they show you where performance has been and help you understand where it's heading.",
    },
    {
        icon: ShieldCheck,
        title: "KYC-Gated Access",
        desc: "Every account is verified before it can invest. Identity checks keep the platform secure for everyone.",
        beginner: "New here? Complete a quick verification step once, and you'll have full access to your dashboard and Index.",
    },
    {
        icon: BarChart3,
        title: "Tiered Investment Plans",
        desc: "Choose the investment tier that matches your goals. Each tier has clearly published terms in your dashboard.",
        beginner: "Tiers just mean different investment levels — pick the one that fits your budget and goals from your dashboard.",
    },
    {
        icon: Wallet,
        title: "Simple Wallet System",
        desc: "Deposit funds into your wallet, then allocate them into the Index. Track balances and history in one place.",
        beginner: "Your wallet is like a holding account — fund it first, then invest into the Index whenever you're ready.",
    },
    {
        icon: CalendarDays,
        title: "Economic Calendar",
        desc: "Stay updated with major economic events like interest rate decisions and job reports, each with an expected impact rating.",
        beginner: "Big news can move markets. This calendar helps you understand when important events happen.",
    },
    {
        icon: Layers,
        title: "Multi-Market Coverage",
        desc: "Our Index tracks performance across Forex pairs, Crypto assets, and more — all reflected in one unified dashboard.",
        beginner: "No need for multiple apps. Everything you want to track is available in one place.",
    },
];

const downloads = [
    { icon: Globe, label: "Web Dashboard", sub: "No install needed — access your account in any browser", cta: "Launch", color: "from-violet-500/20 to-violet-600/20" },
    { icon: Monitor, label: "Desktop", sub: "Full dashboard experience on Windows & macOS", cta: "Learn More", color: "from-violet-500/20 to-violet-700/20" },
    { icon: Smartphone, label: "Mobile", sub: "iOS & Android — check your Index on the go", cta: "Learn More", color: "from-emerald-500/20 to-emerald-600/20" },
];

export default function PlatformPage() {
    return (
        <div className="min-h-screen">
            {/* ─── HERO ─── */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="relative mx-auto max-w-6xl px-5 lg:px-8 pt-28 pb-20">
                    <div className="grid gap-12 lg:grid-cols-2 items-center">
                        <Reveal>
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-sm font-medium">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-glow" />
                                    ORVANTA Financial
                                </div>
                                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                                    The platform<br />
                                    <span className="text-gradient">investors</span> trust.
                                </h1>
                                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg">
                                    The ORVANTA Index platform powers every account with real-time performance
                                    tracking, tiered investment plans, and KYC-verified security — available
                                    from a single dashboard across desktop, web and mobile.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link href="/login" className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold btn-glow btn-glow-hover">
                                        Get Started <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a href="#downloads" className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-6 py-3.5 text-sm font-medium hover:bg-accent transition">
                                        Explore Access Options
                                    </a>
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <div className="relative rounded-2xl overflow-hidden bg-muted/50 aspect-[4/3] border border-border/40">
                                <Image
                                    src="/platform/mt5-hero.jpg"
                                    alt="ORVANTA Financial Index Platform"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60 -z-10" />
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>

            {/* ─── FEATURES ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
                <Reveal>
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                            Everything you need.<br />Nothing in your way.
                        </h2>
                        <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                            The ORVANTA Index dashboard is built for serious investors — clean, focused, and
                            stripped of bloat. The result: a platform that gets out of your way and lets you
                            focus on your investments.
                        </p>
                    </div>
                </Reveal>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => (
                        <Reveal key={f.title} delay={i * 0.06}>
                            <div className="h-full rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4 hover:border-border hover:bg-card/80 transition-all duration-300">
                                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 border border-primary/20">
                                    <f.icon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                                <div className="rounded-lg bg-muted/40 border border-border/40 p-3">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        <span className="font-semibold text-foreground">Beginner tip:</span> {f.beginner}
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            {/* ─── DOWNLOADS ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20" id="downloads">
                <Reveal>
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                            Access anywhere.<br />Invest everywhere.
                        </h2>
                        <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                            Start on your laptop, check your Index on your phone. Your ORVANTA account
                            is available on every device and syncs across all of them.
                        </p>
                    </div>
                </Reveal>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {downloads.map((d, i) => (
                        <Reveal key={d.label} delay={i * 0.06}>
                            <div className="h-full rounded-2xl border border-border/50 bg-card/50 p-6 text-center space-y-4 hover:border-border hover:bg-card/80 transition-all duration-300">
                                <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${d.color} border border-border/40`}>
                                    <d.icon className="h-6 w-6 text-foreground" />
                                </div>
                                <div>
                                    <div className="font-display text-lg font-semibold">{d.label}</div>
                                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{d.sub}</div>
                                </div>
                                <button className="w-full rounded-lg border border-border/70 py-2.5 text-sm font-medium hover:bg-accent transition inline-flex items-center justify-center gap-2">
                                    <Download className="h-4 w-4" /> {d.cta}
                                </button>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            {/* ─── CTA ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-16">
                <Reveal>
                    <div className="relative overflow-hidden rounded-[32px] p-8 md:p-14 bg-gradient-to-r from-violet-600 via-violet-600 to-violet-700 text-white shadow-2xl border border-violet-500/20">
                        {/* Ambient Glows */}
                        <div aria-hidden className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                        <div aria-hidden className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 z-10">
                            <div className="space-y-4 max-w-xl text-left">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/10 select-none">
                                    <Sparkles size={14} className="text-violet-200 animate-pulse" />
                                    <span>Instant Setup</span>
                                </div>

                                {/* Title */}
                                <h3 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                                    Ready to start investing?
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-violet-100/80 leading-relaxed">
                                    Create an account in minutes. Fund your wallet when you&apos;re ready. Invest with discipline.
                                </p>
                            </div>

                            {/* Action block */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-6 shrink-0">
                                {/* Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 rounded-lg bg-white text-violet-600 hover:bg-violet-50 px-6 py-3.5 text-sm font-bold transition duration-200 shadow-lg shadow-black/10"
                                    >
                                        Get Started <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center gap-2 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition duration-200"
                                    >
                                        Talk to our team
                                    </Link>
                                </div>

                                {/* Overlapping Avatars */}
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2 select-none">
                                        {[
                                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80",
                                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80",
                                            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=64&h=64&q=80",
                                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&h=64&q=80"
                                        ].map((src, idx) => (
                                            <img
                                                key={idx}
                                                src={src}
                                                alt="User avatar"
                                                className="h-7 w-7 rounded-full border border-violet-600 object-cover"
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-violet-100/90 font-medium">5/5 (220,000+ Active Clients)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </div>
    );
}
