"use client";

import Link from "next/link";

import {
    ArrowRight, PlayCircle, Sparkles, ShieldCheck, UserCheck, Wallet2, LineChart, Check, X, Minus,
} from "lucide-react";
import {
    ChartBar as TablerChartBar,
    ShieldCheck as TablerShieldCheck,
    Stack as TablerStack,
    Wallet as TablerWallet,
    Lock as TablerLock,
    Users as TablerUsers,
    Receipt as TablerReceipt,
    Headphones as TablerHeadphones,
} from "tabler-icons-react";
import { Section, SectionTitle, Eyebrow, Reveal, AnimatedCounter } from "../site/primitives";
import { HeroDashboard } from "../site/HeroDashboard";
import { PortfolioMockup } from "../site/PortfolioMockup";

import { DotGrid } from "../site/DotGrid";

const capabilities = [
    {
        icon: TablerShieldCheck,
        title: "KYC-verified onboarding",
        desc: "No account moves funds — deposit, invest, or withdraw — until identity verification clears. Every user on the platform has been checked.",
    },
    {
        icon: TablerWallet,
        title: "Wallet-first deposits",
        desc: "Fund by crypto or bank transfer into a wallet balance that's kept separate from what you've allocated into the Index. You decide when it moves.",
    },
    {
        icon: TablerStack,
        title: "Published Index tiers",
        desc: "Every tier states its minimum, maximum and maturity period up front, in your dashboard, before you commit a dollar.",
    },
    {
        icon: TablerUsers,
        title: "5-level referral program",
        desc: "Bring verified investors onto the platform and earn commission across five referral levels — structure disclosed, not hidden in fine print.",
    },
];

const comparisonRows = [
    { feature: "Identity verification before funds move", us: true, generic: false },
    { feature: "Published tier minimums, maximums & maturity", us: true, generic: "sometimes" },
    { feature: "Wallet balance separated from allocated funds", us: true, generic: false },
    { feature: "Transparent, published fee structure", us: true, generic: "sometimes" },
    { feature: "Role-based admin controls & audit trails", us: true, generic: false },
    { feature: "Support desk with ticket tracking", us: true, generic: "sometimes" },
];

function ComparisonCell({ value }: { value: boolean | "sometimes" }) {
    if (value === true) {
        return (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-brand">
                <Check size={15} strokeWidth={2.5} />
            </span>
        );
    }
    if (value === "sometimes") {
        return (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted-foreground/10 text-muted-foreground">
                <Minus size={15} strokeWidth={2.5} />
            </span>
        );
    }
    return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted-foreground/5 text-muted-foreground/50">
            <X size={15} strokeWidth={2.5} />
        </span>
    );
}

export default function Home() {
    return (
        <>
            {/* HERO */}
            <div className="relative overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 82% 15%, rgba(0,185,86,0.09), transparent 55%)" }}
                />
                <DotGrid />
                <Section className="relative z-10 !pt-28 !pb-20 lg:!pt-36 lg:!pb-28">
                    <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-10">
                        {/* Left column */}
                        <div className="text-center lg:text-left">
                            <Reveal>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                    <Eyebrow>ORVANTA Index</Eyebrow>
                                </div>
                            </Reveal>
                            <Reveal delay={0.05}>
                                <h1 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.05]">
                                    Invest with<br />
                                    <span className="text-gradient">Confidence.</span>
                                </h1>
                            </Reveal>
                            <Reveal delay={0.12}>
                                <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-muted-foreground leading-relaxed">
                                    ORVANTA Financial gives serious investors a transparent, KYC-verified
                                    Index investment platform — deposit into your wallet, choose a tier,
                                    and track your performance in real time.
                                </p>
                            </Reveal>
                            <Reveal delay={0.2}>
                                <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
                                    <Link href="/register" className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium btn-glow btn-glow-hover">
                                        Get Started <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link href="/platform" className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-6 py-3.5 text-sm font-medium hover:bg-accent transition">
                                        <PlayCircle className="h-4 w-4" /> Explore Platform
                                    </Link>
                                </div>
                            </Reveal>
                            <Reveal delay={0.25}>
                                <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                        <ShieldCheck className="h-3.5 w-3.5 text-brand" /> 100% KYC-verified
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <UserCheck className="h-3.5 w-3.5 text-brand" /> 5 referral levels
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <LineChart className="h-3.5 w-3.5 text-brand" /> Real-time tracking
                                    </span>
                                </div>
                            </Reveal>
                        </div>

                        {/* Right column: dashboard mockup */}
                        <Reveal delay={0.15} y={40}>
                            <HeroDashboard />
                        </Reveal>
                    </div>
                </Section>
            </div>

            {/* TRUST BAR */}
            <div className="relative border-y border-border/50 bg-background/40 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl overflow-hidden px-5 lg:px-8 py-6">
                    <div className="flex gap-16 animate-marquee whitespace-nowrap">
                        {[...Array(2)].map((_, k) => (
                            <div key={k} className="flex gap-16 items-center text-sm text-muted-foreground">
                                {["KYC-Verified Onboarding", "Transparent Tiers", "Real-Time Dashboard", "5-Level Referrals", "Crypto & Bank Wallet", "Published Fee Structure", "Role-Based Admin Security", "Real Support Desk"].map((t) => (
                                    <span key={t} className="font-medium tracking-wide">{t}</span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ASYMMETRIC FEATURE SHOWCASE — alternating rows */}
            <Section>
                <SectionTitle
                    eyebrow="How It's Built"
                    title={<>A platform built around <span className="text-gradient">what actually protects you.</span></>}
                    description="Not a feature grid — a walkthrough of the four things that structurally define ORVANTA."
                />
                <div className="mt-16 space-y-16 md:space-y-24">
                    {capabilities.map((c, i) => {
                        const Icon = c.icon;
                        const reversed = i % 2 === 1;
                        return (
                            <Reveal key={c.title} delay={i * 0.05}>
                                <div className={`flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-14`}>
                                    <div className="w-full md:w-1/2">
                                        <div className="relative rounded-2xl border border-border/50 bg-card/50 aspect-[4/3] flex items-center justify-center overflow-hidden">
                                            <div aria-hidden className="absolute -inset-8 blur-3xl opacity-40"
                                                style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 12%, transparent), transparent)" }} />
                                            <div className="relative grid h-24 w-24 md:h-28 md:w-28 place-items-center rounded-2xl bg-brand/10 text-brand border border-brand/20">
                                                <Icon size={44} />
                                            </div>
                                            <span className="absolute top-4 left-4 font-display text-xs uppercase tracking-widest text-muted-foreground/50">0{i + 1}</span>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 text-center md:text-left">
                                        <h3 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-foreground">
                                            {c.title}
                                        </h3>
                                        <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md mx-auto md:mx-0">
                                            {c.desc}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </Section>

            {/* PORTFOLIO MOCKUP */}
            <Section className="!py-20">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <Reveal>
                        <Eyebrow>Your Dashboard</Eyebrow>
                        <h2 className="mt-5 font-display text-3xl md:text-4xl font-normal tracking-tight text-foreground leading-tight">
                            Wallet, Index, and <span className="text-gradient">bonus balance</span> — one screen.
                        </h2>
                        <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-md">
                            No juggling statements or spreadsheets. Your available balance, active Index
                            position, and referral earnings update together in real time, the moment you
                            log in.
                        </p>
                        <Link
                            href="/register"
                            className="mt-7 inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium btn-glow btn-glow-hover"
                        >
                            Open Your Dashboard <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Reveal>
                    <Reveal delay={0.1} y={30}>
                        <PortfolioMockup />
                    </Reveal>
                </div>
            </Section>

            {/* COMPARISON TABLE */}
            <Section>
                <SectionTitle
                    eyebrow="What You Get"
                    title={<>What ORVANTA holds itself to — <span className="text-gradient">versus a generic platform.</span></>}
                    description="No hype, just a direct look at the structural choices that separate a disciplined platform from an average one."
                />
                <Reveal>
                    <div className="mt-14 overflow-x-auto rounded-2xl border border-border/50">
                        <table className="w-full min-w-[560px] text-sm">
                            <thead>
                                <tr className="border-b border-border/50 bg-card/50">
                                    <th className="text-left font-medium text-muted-foreground px-5 py-4">Feature</th>
                                    <th className="text-center font-display font-semibold text-brand px-5 py-4">ORVANTA</th>
                                    <th className="text-center font-medium text-muted-foreground px-5 py-4">Generic Platform</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonRows.map((r, i) => (
                                    <tr key={r.feature} className={i % 2 === 0 ? "bg-transparent" : "bg-card/30"}>
                                        <td className="px-5 py-4 text-foreground/90">{r.feature}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-center"><ComparisonCell value={r.us as boolean} /></div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-center"><ComparisonCell value={r.generic as boolean | "sometimes"} /></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Reveal>
            </Section>

            {/* TRUST STATEMENT / PULL QUOTE */}
            <Section className="!py-20">
                <Reveal>
                    <div className="rounded-lg glass-strong p-10 md:p-16 relative overflow-hidden text-center">
                        <div aria-hidden className="absolute -inset-x-20 -top-20 h-40 blur-3xl opacity-40"
                            style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 14%, transparent), transparent)" }} />
                        <div className="relative max-w-3xl mx-auto">
                            <ShieldCheck className="h-8 w-8 text-brand mx-auto mb-6" strokeWidth={1.5} />
                            <p className="font-display text-2xl md:text-4xl font-normal tracking-tight leading-snug text-foreground">
                                Every account is identity-verified before a single dollar moves —
                                <span className="text-gradient"> that's the baseline, not a feature.</span>
                            </p>
                            <p className="mt-6 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                                Segregated wallet balances, role-based admin controls, and a fully auditable
                                trail on every deposit, allocation and referral payout — the operational
                                discipline serious capital requires, applied by default.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </Section>

            {/* CTA */}
            <Section>
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
                                    Your ORVANTA account is <span className="text-[#00B956]">one step away</span>.
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-white/70 leading-relaxed">
                                    Complete verification, fund your wallet, and start investing with full
                                    visibility into every tier, balance, and transaction.
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
                                        href="/platform"
                                        className="inline-flex items-center gap-2 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition duration-200"
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </Section>


        </>
    );
}
