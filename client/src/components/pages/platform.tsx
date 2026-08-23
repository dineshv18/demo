"use client";

import Link from "next/link";
import Image from "next/image";
import {
    LineChart, ShieldCheck, BarChart3, Wallet, Layers, Users,
    ArrowRight, Monitor, Globe, Smartphone, Sparkles, Bitcoin, Landmark,
    CheckCircle2, Lock, FileText,
} from "lucide-react";
import { Reveal, SectionTitle } from "../site/primitives";

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
        desc: "Choose the investment tier that matches your goals. Each tier publishes its minimum, maximum and maturity period in your dashboard.",
        beginner: "Tiers just mean different investment levels — pick the one that fits your budget and how long you're comfortable committing funds.",
    },
    {
        icon: Wallet,
        title: "Simple Wallet System",
        desc: "Deposit funds into your wallet via crypto or bank transfer, then allocate them into the Index. Track balances and history in one place.",
        beginner: "Your wallet is like a holding account — fund it first, then invest into the Index whenever you're ready.",
    },
    {
        icon: Users,
        title: "5-Level Referral Program",
        desc: "Invite other investors and earn commission across five referral levels, tracked automatically in your dashboard.",
        beginner: "Share your referral link. As the people you refer — and the people they refer — invest, you earn a share, up to five levels deep.",
    },
    {
        icon: Layers,
        title: "Transparent Fee Structure",
        desc: "Every fee applied to your account is published and visible before you commit — nothing deducted without disclosure.",
        beginner: "No guessing games. What you see in your dashboard before you invest is what you'll actually pay.",
    },
];

const walletMethods = [
    { icon: Bitcoin, label: "Crypto Deposits", desc: "Fund your wallet with supported cryptocurrencies. Deposits are credited once confirmed on-chain." },
    { icon: Landmark, label: "Bank Transfer", desc: "Prefer fiat? Deposit directly from your bank account through supported transfer rails." },
    { icon: Wallet, label: "Unified Balance", desc: "Whichever method you use, your wallet balance stays in one place — ready to allocate into an Index tier." },
];

const tierMechanics = [
    { icon: CheckCircle2, title: "Published Minimums & Maximums", desc: "Every tier states exactly how much you can allocate — before you commit a dollar." },
    { icon: FileText, title: "Clear Maturity Periods", desc: "Each tier's duration is disclosed upfront in your dashboard, so you know what you're committing to." },
    { icon: LineChart, title: "Live Performance Tracking", desc: "Once allocated, your position updates in real time alongside full historical charting." },
];

const access = [
    { icon: Globe, label: "Web Dashboard", sub: "No install needed — access your account from any modern browser", cta: "Launch", color: "from-brand/20 to-brand/10" },
    { icon: Monitor, label: "Desktop", sub: "The same dashboard experience on Windows & macOS", cta: "Learn More", color: "from-brand/15 to-brand/5" },
    { icon: Smartphone, label: "Mobile", sub: "Check your Index and wallet on the go", cta: "Learn More", color: "from-emerald-500/20 to-emerald-600/20" },
];

export default function PlatformPage() {
    return (
        <div className="min-h-screen">
            {/* ─── HERO ─── */}
            <div
                className="relative overflow-hidden"
                style={{ background: "radial-gradient(circle at 80% 20%, rgba(0,185,86,0.08), transparent 60%)" }}
            >
                <div className="relative mx-auto max-w-6xl px-5 lg:px-8 pt-28 pb-20">
                    <div className="grid gap-12 lg:grid-cols-2 items-center">
                        <Reveal>
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-sm font-medium">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-glow" />
                                    ORVANTA Financial
                                </div>
                                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-tight">
                                    The platform<br />
                                    <span className="text-gradient">investors</span> trust.
                                </h1>
                                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg">
                                    The ORVANTA Index platform powers every account with real-time performance
                                    tracking, transparent tiered investment plans, a wallet built for crypto
                                    and bank deposits, and KYC-verified security — from a single dashboard.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link href="/register" className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold btn-glow btn-glow-hover">
                                        Get Started <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a href="#access" className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-6 py-3.5 text-sm font-medium hover:bg-accent transition">
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
                                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand/15 text-brand">
                                    <f.icon className="h-5 w-5" />
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

            {/* ─── WALLET ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
                <SectionTitle
                    eyebrow="Wallet"
                    title={<>Fund it your way. <span className="text-gradient">Invest it your pace.</span></>}
                    description="Your wallet is separate from your Index allocation — deposit first, then decide when and how much to invest."
                />
                <div className="mt-14 grid gap-6 md:grid-cols-3">
                    {walletMethods.map((w, i) => (
                        <Reveal key={w.label} delay={i * 0.06}>
                            <div className="h-full rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4 hover:border-border hover:bg-card/80 transition-all duration-300">
                                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand/15 text-brand">
                                    <w.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-lg font-semibold">{w.label}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            {/* ─── INDEX TIERS ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
                <SectionTitle
                    eyebrow="Index Tiers"
                    title={<>One Index. <span className="text-gradient">Multiple tiers.</span></>}
                    description="Every tier is built around clear mechanics — no vague projections, no fine print you find out about later."
                />
                <div className="mt-14 grid gap-6 md:grid-cols-3">
                    {tierMechanics.map((t, i) => (
                        <Reveal key={t.title} delay={i * 0.06}>
                            <div className="h-full rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4 hover:border-border hover:bg-card/80 transition-all duration-300">
                                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand/15 text-brand">
                                    <t.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
                <Reveal delay={0.15}>
                    <p className="mt-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Exact tier ranges and current maturity terms are available once you sign in —
                        they're kept current in your dashboard rather than a static marketing page.
                    </p>
                </Reveal>
            </div>

            {/* ─── REFERRAL PROGRAM ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
                <Reveal>
                    <div className="rounded-2xl border border-border/50 bg-card/50 p-8 md:p-12">
                        <div className="grid gap-10 lg:grid-cols-2 items-center">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 border border-brand/20 px-3.5 py-1.5 text-xs font-semibold text-brand">
                                    <Users className="h-3.5 w-3.5" /> Referral Program
                                </div>
                                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                                    Earn across five levels.
                                </h2>
                                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                    Share your referral link from your dashboard. As people you refer invest —
                                    and as their referrals invest — you earn commission across five levels deep.
                                    Every payout is tracked and visible in your referral history.
                                </p>
                                <Link href="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:gap-3 transition-all">
                                    Start referring <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                    <div key={lvl} className="rounded-xl border border-border/50 bg-background p-4 text-center">
                                        <div className="font-display text-2xl font-bold text-gradient">L{lvl}</div>
                                        <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Level</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* ─── SECURITY ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
                <SectionTitle
                    eyebrow="Security"
                    title={<>Admin-grade controls, <span className="text-gradient">from day one.</span></>}
                    description="The infrastructure behind the dashboard is built with the same discipline expected of any platform handling client funds."
                />
                <div className="mt-14 grid gap-6 md:grid-cols-3">
                    {[
                        { icon: ShieldCheck, title: "Mandatory KYC", desc: "Identity verification gates every account before deposits, allocations, or withdrawals are permitted." },
                        { icon: Lock, title: "Role-Based Admin Access", desc: "Platform operations are separated by role, with activity logged and auditable." },
                        { icon: FileText, title: "Full Transaction History", desc: "Every deposit, allocation, and referral commission is recorded and visible in your account." },
                    ].map((s, i) => (
                        <Reveal key={s.title} delay={i * 0.06}>
                            <div className="h-full rounded-2xl border border-border/50 bg-card/50 p-6 space-y-3 hover:border-border hover:bg-card/80 transition-all duration-300">
                                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand/15 text-brand">
                                    <s.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            {/* ─── SECURITY TRUST STATEMENT ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-4">
                <Reveal>
                    <div className="rounded-lg glass-strong p-10 md:p-16 relative overflow-hidden text-center">
                        <div aria-hidden className="absolute -inset-x-20 -top-20 h-40 blur-3xl opacity-40"
                            style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 14%, transparent), transparent)" }} />
                        <div className="relative max-w-3xl mx-auto">
                            <ShieldCheck className="h-8 w-8 text-brand mx-auto mb-6" strokeWidth={1.5} />
                            <p className="font-display text-2xl md:text-4xl font-normal tracking-tight leading-snug text-foreground">
                                Admin-grade controls aren&apos;t bolted on —
                                <span className="text-gradient"> they&apos;re how the platform is built.</span>
                            </p>
                            <p className="mt-6 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                                Mandatory KYC, role-based admin access, and a fully auditable transaction
                                history on every deposit, allocation and referral payout — applied by default,
                                not offered as an upgrade.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* ─── ACCESS ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20" id="access">
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

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {access.map((d, i) => (
                        <Reveal key={d.label} delay={i * 0.06}>
                            <div className="h-full rounded-2xl border border-border/50 bg-card/50 p-6 text-center space-y-4 hover:border-border hover:bg-card/80 transition-all duration-300">
                                <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${d.color} border border-border/40`}>
                                    <d.icon className="h-6 w-6 text-foreground" />
                                </div>
                                <div>
                                    <div className="font-display text-lg font-semibold">{d.label}</div>
                                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{d.sub}</div>
                                </div>
                                <Link href="/login" className="w-full rounded-lg border border-border/70 py-2.5 text-sm font-medium hover:bg-accent transition inline-flex items-center justify-center gap-2">
                                    {d.cta}
                                </Link>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            {/* ─── CTA ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-16">
                <Reveal>
                    <div className="relative overflow-hidden rounded-[20px] p-8 md:p-14 bg-[#10211D] text-white shadow-xl border border-[#10211D]">
                        {/* Ambient Glows */}
                        <div aria-hidden className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                        <div aria-hidden className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#00B956]/20 blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 z-10">
                            <div className="space-y-4 max-w-xl text-left">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/10 select-none">
                                    <Sparkles size={14} className="text-[#00B956] animate-pulse" />
                                    <span>Verification takes minutes</span>
                                </div>

                                {/* Title */}
                                <h3 className="font-display text-3xl md:text-4xl font-medium tracking-tight leading-tight text-white">
                                    Ready to start investing?
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-white/70 leading-relaxed">
                                    Create an account in minutes. Fund your wallet when you&apos;re ready. Invest with discipline.
                                </p>
                            </div>

                            {/* Action block */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-6 shrink-0">
                                {/* Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center gap-2 rounded-xl bg-white text-[#10211D] hover:bg-white/90 px-6 py-3.5 text-sm font-semibold transition duration-200 shadow-lg shadow-black/10"
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
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </div>
    );
}
