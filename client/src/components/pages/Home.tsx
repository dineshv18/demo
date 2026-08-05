"use client";

import Link from "next/link";

import {
    ArrowRight, PlayCircle, Sparkles, CircleDollarSign, Bitcoin,
    Check,
} from "lucide-react";
import {
    Bolt as TablerBolt,
    ChartBar as TablerChartBar,
    TrendingUp as TablerTrendingUp,
    ShieldCheck as TablerShieldCheck,
    Stack as TablerStack,
    Wallet as TablerWallet,
    Lock as TablerLock,
    Headphones as TablerHeadphones
} from "tabler-icons-react";
import { Section, SectionTitle, Eyebrow, Reveal, AnimatedCounter } from "../site/primitives";
import { HeroDashboard } from "../site/HeroDashboard";

import { DotGrid } from "../site/DotGrid";

const features = [
    { icon: TablerBolt, title: "Ultra-Fast Execution", desc: "Sub-25ms average order execution on our tier-1 institutional infrastructure." },
    { icon: TablerChartBar, title: "Ovantra Financial Engine", desc: "The world's most advanced multi-asset platform with 21 timeframes and 38 indicators." },
    { icon: TablerTrendingUp, title: "Institutional Spreads", desc: "Raw pricing streamed from top-tier liquidity providers, starting from 0.0 pips." },
    { icon: TablerShieldCheck, title: "Negative Balance Protection", desc: "You will never lose more than you deposit. Full account safeguards, always on." },
    { icon: TablerStack, title: "Forex & Crypto CFDs", desc: "70+ FX pairs and 30+ digital assets under one unified MT5 account." },
    { icon: TablerWallet, title: "Deep Liquidity", desc: "Aggregated bank and non-bank liquidity for consistent fills, even in fast markets." },
    { icon: TablerLock, title: "Bank-Grade Security", desc: "Segregated client funds, cold-storage custody, and SOC 2-aligned operations." },
    { icon: TablerHeadphones, title: "24/5 Expert Support", desc: "A dedicated trading desk staffed by real humans, in your timezone, every session." },
];

const stats = [
    { v: 25, s: "ms", label: "Avg. execution", prefix: "<" },
    { v: 100, s: "+", label: "Global markets" },

    { v: 90, s: "+", label: "Countries served" },
    { v: 220000, s: "+", label: "Active clients" },
];

const tiers = [
    {
        name: "Demo Account",
        tag: "Practice with virtual funds",
        price: "Free",
        unit: "forever",
        popular: false,
        features: [
            "$100,000 virtual balance",
            "Full MT5 desktop, web & mobile",
            "Real-time institutional pricing",
            "All 100+ instruments included",
            "Unlimited demo lifetime",
            "Practice EAs and strategies",
        ],
        cta: "Start Demo",
    },
    {
        name: "Live Account",
        tag: "Trade real markets, real capital",
        price: "$0",
        unit: "min. deposit $100",
        popular: true,
        features: [
            "Raw spreads from 0.0 pips",
            "Sub-25ms average execution",
            "Leverage up to 1:500",
            "Segregated client funds",
            "Negative balance protection",
            "Dedicated 24/5 trading desk",
            "Free VPS for eligible balances",
            "Instant deposits & withdrawals",
        ],
        cta: "Open Live Account",
    },
];

const specRows = [
    ["Spreads", "Simulated raw", "Raw · from 0.0 pips"],
    ["Execution", "Simulated", "< 25 ms average"],
    ["Instruments", "100+", "100+"],
    ["Max Leverage", "1:500", "1:500"],
    ["Min Deposit", "None", "$100"],
    ["Fund Segregation", "N/A", "Tier-1 banks"],
    ["Support", "Standard", "24/5 dedicated desk"],
];

export default function Home() {
    return (
        <>
            {/* HERO */}
            <div className="relative overflow-hidden">
                <DotGrid />
                <Section className="relative z-10 !pt-16 !pb-24 lg:!pt-24">
                    <div className="text-center max-w-3xl mx-auto">
                        <Reveal>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Eyebrow>MT5 Engine</Eyebrow>
                                <div className="rounded-lg  glass px-3 py-1.5 text-xs uppercase tracking-wide">Global Market Access</div>
                                <div className="rounded-lg  glass px-3 py-1.5 text-xs uppercase tracking-wide inline-flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-lg  bg-emerald-500 animate-pulse-glow" /> Live Execution
                                </div>
                            </div>
                        </Reveal>
                        <Reveal delay={0.05}>
                            <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02]">
                                Trade Global Markets<br />
                                with <span className="text-gradient">Confidence.</span>
                            </h1>
                        </Reveal>
                        <Reveal delay={0.12}>
                            <p className="mt-6 max-w-xl mx-auto text-lg text-muted-foreground leading-relaxed">
                                Ovantra Financial gives serious traders institutional-grade Forex and Crypto CFDs
                                — with raw spreads, deep liquidity, and the execution
                                infrastructure of a global prime broker.
                            </p>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <Link href="/#accounts" className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium btn-glow btn-glow-hover">
                                    Open Live Account <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href="/platform" className="inline-flex items-center gap-2 rounded-lg  border border-border/70 px-6 py-3.5 text-sm font-medium hover:bg-accent transition">
                                    <PlayCircle className="h-4 w-4" /> Explore Platform
                                </Link>
                            </div>
                        </Reveal>

                    </div>

                    <Reveal delay={0.15} y={40}>
                        <div className="mt-16">
                            <HeroDashboard />
                        </div>
                    </Reveal>
                </Section>
            </div>

            {/* TRUST BAR */}
            <div className="relative border-y border-border/50 bg-background/40 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl overflow-hidden px-5 lg:px-8 py-6">
                    <div className="flex gap-16 animate-marquee whitespace-nowrap">
                        {[...Array(2)].map((_, k) => (
                            <div key={k} className="flex gap-16 items-center text-sm text-muted-foreground">
                                {["Fast Execution", "Secure Trading", "24/5 Support", "MT5 Certified", "100+ Markets", "0.0 Pip Spreads", "Tier-1 Liquidity", "SOC 2 Aligned"].map((t) => (
                                    <span key={t} className="font-medium tracking-wide">{t}</span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* WHY */}
            <Section>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1 text-xs text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider rounded-md relative select-none">
                        {/* Corner Brackets */}
                        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-500 dark:border-amber-500" />
                        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-500 dark:border-amber-500" />
                        My Specialization
                    </div>
                    <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                        Why <span className="text-amber-600 dark:text-amber-500">Ovantra Financial</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                        Every layer of our stack — from liquidity to execution to security — is engineered for professionals who take markets seriously.
                    </p>
                </div>

                {/* Grid layout matching the screenshot */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <Reveal key={f.title} delay={i * 0.05}>
                                <div className="relative group overflow-hidden rounded-2xl border border-border/40 dark:border-white/5 bg-zinc-50/60 dark:bg-zinc-900/20 p-6 md:p-8 hover:bg-white dark:hover:bg-zinc-900/40 hover:shadow-xl hover:shadow-zinc-950/5 dark:hover:shadow-none transition-all duration-300 h-full flex flex-col justify-between">
                                    {/* Left Accent Bar */}
                                    <div className="absolute left-0 top-6 w-[4px] h-12 bg-amber-500 dark:bg-amber-500 rounded-r-full" />

                                    <div>
                                        {/* Circular Icon Container */}
                                        <div className="h-12 w-12 rounded-full bg-white dark:bg-zinc-950 border border-border/50 dark:border-white/5 shadow-sm flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                                            <Icon size={22} className="text-zinc-800 dark:text-amber-500" strokeWidth={2} />
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-500 duration-200">
                                            {f.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                            {f.desc}
                                        </p>
                                    </div>

                                    {/* Learn More link */}
                                    <div className="mt-6 pt-4 border-t border-border/30 dark:border-white/5">
                                        <Link
                                            href="/platform"
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-amber-600 dark:hover:text-amber-500 transition-colors group/link"
                                        >
                                            <span>Learn more</span>
                                            <ArrowRight size={14} className="text-amber-500 dark:text-amber-500 transition-transform group-hover/link:translate-x-1 duration-200" />
                                        </Link>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </Section>

            {/* STATS */}
            <Section className="!py-20">
                <Reveal>
                    <div className="rounded-lg glass-strong p-10 md:p-14 relative overflow-hidden">
                        <div aria-hidden className="absolute -inset-x-20 -top-20 h-40 blur-3xl opacity-60"
                            style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 40%, transparent), transparent)" }} />
                        <div className="relative grid gap-10 md:grid-cols-4 text-center">
                            {stats.map((s) => (
                                <div key={s.label}>
                                    <div className="font-display text-4xl md:text-5xl font-semibold text-gradient tabular-nums">
                                        <AnimatedCounter to={s.v} prefix={s.prefix ?? ""} suffix={s.s} />
                                    </div>
                                    <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </Section>

            {/* MARKETS */}
            <Section>
                <SectionTitle
                    eyebrow="Markets"
                    title={<>One account. <span className="text-gradient">Every major market.</span></>}
                    description="Trade FX, metals, indices, energies and 30+ digital assets from a single MT5 login."
                />
                <div className="mt-14 grid gap-8 md:grid-cols-2">
                    <Reveal>
                        <div className="rounded-[32px] border border-border/50 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/10 p-6 md:p-8 hover:bg-white dark:hover:bg-zinc-900/20 hover:shadow-xl hover:shadow-zinc-950/5 dark:hover:shadow-none transition-all duration-300">
                            {/* Card Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 shadow-sm shadow-amber-500/10 select-none">
                                    <CircleDollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold text-foreground">Forex CFDs</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">70+ pairs · From 0.0 pips</p>
                                </div>
                            </div>
                            {/* Rates Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                {[["EUR/USD", "1.0842", "+0.24"], ["GBP/USD", "1.2731", "+0.11"], ["USD/JPY", "156.02", "-0.08"], ["AUD/USD", "0.6721", "+0.19"], ["USD/CAD", "1.3712", "-0.03"], ["NZD/USD", "0.6021", "+0.42"]].map(([s, p, c]) => (
                                    <div
                                        key={s}
                                        className="group/rate rounded-2xl border border-border/40 dark:border-white/5 bg-white/80 dark:bg-zinc-950/40 p-4 transition-all duration-300 hover:bg-white dark:hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-zinc-950/5 dark:hover:shadow-none hover:border-amber-500/20 dark:hover:border-amber-500/20"
                                    >
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-xs font-bold text-muted-foreground group-hover/rate:text-foreground transition-colors duration-200">{s}</span>
                                            <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.startsWith("+")
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                }`}>
                                                {c}%
                                            </span>
                                        </div>
                                        <div className="font-display text-base font-extrabold tracking-tight mt-2 text-foreground tabular-nums">
                                            {p}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={0.08}>
                        <div className="rounded-[32px] border border-border/50 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/10 p-6 md:p-8 hover:bg-white dark:hover:bg-zinc-900/20 hover:shadow-xl hover:shadow-zinc-950/5 dark:hover:shadow-none transition-all duration-300">
                            {/* Card Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 shadow-sm shadow-amber-500/10 select-none">
                                    <Bitcoin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold text-foreground">Crypto CFDs</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">30+ assets · 24/7 markets</p>
                                </div>
                            </div>
                            {/* Rates Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                {[["BTC/USD", "68,421", "-0.62"], ["ETH/USD", "3,842", "+1.42"], ["SOL/USD", "172.10", "+2.11"], ["XRP/USD", "0.5214", "+0.31"], ["ADA/USD", "0.4421", "-0.18"], ["DOGE/USD", "0.1621", "+0.72"]].map(([s, p, c]) => (
                                    <div
                                        key={s}
                                        className="group/rate rounded-2xl border border-border/40 dark:border-white/5 bg-white/80 dark:bg-zinc-950/40 p-4 transition-all duration-300 hover:bg-white dark:hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-zinc-950/5 dark:hover:shadow-none hover:border-amber-500/20 dark:hover:border-amber-500/20"
                                    >
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-xs font-bold text-muted-foreground group-hover/rate:text-foreground transition-colors duration-200">{s}</span>
                                            <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.startsWith("+")
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                }`}>
                                                {c}%
                                            </span>
                                        </div>
                                        <div className="font-display text-base font-extrabold tracking-tight mt-2 text-foreground tabular-nums">
                                            {p}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </Section>

            {/* ACCOUNTS */}
            <Section id="accounts">
                <SectionTitle
                    eyebrow="Accounts"
                    title={<>Choose the account that <span className="text-gradient">fits your ambition</span>.</>}
                    description="One transparent structure. Institutional pricing. Zero hidden fees."
                />
                <div className="mt-14 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                    {tiers.map((t, i) => (
                        <Reveal key={t.name} delay={i * 0.08}>
                            <div className="relative rounded-[32px] overflow-hidden bg-white dark:bg-zinc-900 border border-border/60 dark:border-white/5 shadow-xl flex flex-col justify-between h-full">
                                {/* Top Header Block */}
                                <div className={`p-8 pb-14 relative ${t.popular
                                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-500/10"
                                    : "bg-zinc-100/60 dark:bg-zinc-800/40 border-b border-border/40"
                                    }`}>
                                    {/* Popular Badge */}
                                    {t.popular && (
                                        <div className="absolute top-4 right-6 rounded-full bg-amber-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                            Most Popular
                                        </div>
                                    )}

                                    {/* Account Type Name */}
                                    <span className="inline-block px-3.5 py-1 text-[11px] font-bold bg-white dark:bg-zinc-900 text-foreground border border-border/80 dark:border-white/10 rounded-full mb-6 uppercase tracking-wider">
                                        {t.name}
                                    </span>

                                    {/* Price and Unit */}
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-5xl font-extrabold text-foreground tracking-tight">
                                            {t.price}
                                        </span>
                                        <span className="text-sm font-semibold text-muted-foreground">
                                            / {t.unit}
                                        </span>
                                    </div>

                                    {/* Tagline */}
                                    <p className="text-xs text-muted-foreground mt-4 font-semibold uppercase tracking-wide">
                                        {t.tag}
                                    </p>

                                    {/* Overlapping Call-To-Action Button */}
                                    <div className="absolute left-6 right-6 bottom-0 translate-y-1/2 z-10">
                                        <Link
                                            href="/login"
                                            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition duration-300 shadow-md ${t.popular
                                                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/25"
                                                : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 shadow-zinc-950/20"
                                                }`}
                                        >
                                            <span>{t.cta}</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Bottom Features List */}
                                <div className="p-8 pt-12 flex-1 flex flex-col justify-between">
                                    <ul className="space-y-4">
                                        {t.features.map((f) => (
                                            <li key={f} className="flex items-center gap-3 text-sm text-foreground/90 font-medium">
                                                <Check className="h-4.5 w-4.5 text-amber-500 dark:text-amber-500 shrink-0" strokeWidth={3} />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="mt-24">
                    <SectionTitle eyebrow="Compare" title={<>Full <span className="text-gradient">specification</span>.</>} />
                    <Reveal>
                        <div className="mt-14 overflow-hidden rounded-[32px] border border-border/60 dark:border-white/5 bg-white dark:bg-zinc-900/60 shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-border/60">
                                            {/* Column 1: Feature Titles */}
                                            <th className="px-8 py-6 text-left font-bold text-foreground text-base w-[34%] bg-white dark:bg-zinc-900">
                                                Features
                                            </th>
                                            {/* Column 2: Demo Account Header */}
                                            <th className="px-8 py-6 text-left font-bold text-foreground text-base w-[33%] bg-zinc-50/50 dark:bg-zinc-900/20 border-x border-border/40 dark:border-white/5">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <span className="block text-base font-bold">Demo Account</span>
                                                        <span className="block text-xs text-muted-foreground font-normal mt-0.5">Practice Mode</span>
                                                    </div>
                                                    <div className="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center select-none shadow-sm">
                                                        <span className="text-[10px] font-bold text-muted-foreground">MT5</span>
                                                    </div>
                                                </div>
                                            </th>
                                            {/* Column 3: Live Account Header */}
                                            <th className="px-8 py-6 text-left font-bold text-foreground text-base w-[33%] bg-amber-50/30 dark:bg-amber-950/10">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <span className="block text-base font-bold text-amber-600 dark:text-amber-500">Live Account</span>
                                                        <span className="block text-xs text-muted-foreground font-normal mt-0.5">Real Execution</span>
                                                    </div>
                                                    <div className="h-9 w-9 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 select-none">
                                                        <span className="text-[10px] font-bold">MT5</span>
                                                    </div>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {specRows.map((row, idx) => (
                                            <tr
                                                key={idx}
                                                className="border-b border-border/30 dark:border-white/5 last:border-0 hover:bg-zinc-50/20 dark:hover:bg-white/[0.01] transition-colors"
                                            >
                                                {/* Feature Name */}
                                                <td className="px-8 py-5 font-semibold text-muted-foreground text-left bg-white dark:bg-zinc-900">
                                                    {row[0]}
                                                </td>
                                                {/* Demo spec */}
                                                <td className="px-8 py-5 text-center font-medium text-foreground/80 bg-zinc-50/50 dark:bg-zinc-900/20 border-x border-border/30 dark:border-white/5 tabular-nums">
                                                    {row[1] === "N/A" || row[1] === "None" ? (
                                                        <span className="inline-flex px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold select-none">
                                                            ✕
                                                        </span>
                                                    ) : (
                                                        row[1]
                                                    )}
                                                </td>
                                                {/* Live spec */}
                                                <td className="px-8 py-5 text-center font-bold text-foreground bg-amber-50/30 dark:bg-amber-950/10 tabular-nums">
                                                    {row[2] === "None" ? (
                                                        row[2]
                                                    ) : (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <span className="text-emerald-500 font-bold select-none">✓</span>
                                                            {row[2]}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </Section>

            {/* CTA */}
            <Section>
                <Reveal>
                    <div className="relative overflow-hidden rounded-[32px] p-8 md:p-14 bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 text-white shadow-2xl border border-amber-500/20">
                        {/* Ambient Glows */}
                        <div aria-hidden className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                        <div aria-hidden className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 z-10">
                            <div className="space-y-4 max-w-xl text-left">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/10 select-none">
                                    <Sparkles size={14} className="text-amber-200 animate-pulse" />
                                    <span>Live in under 5 minutes</span>
                                </div>

                                {/* Title */}
                                <h3 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                                    Your MT5 account is <span className="text-amber-100">one click away</span>.
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-amber-100/80 leading-relaxed">
                                    Open a live account, fund in your preferred currency, and start trading on institutional infrastructure today.
                                </p>
                            </div>

                            {/* Action block */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-6 shrink-0">
                                {/* Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/#accounts"
                                        className="inline-flex items-center gap-2 rounded-lg bg-white text-amber-600 hover:bg-amber-50 px-6 py-3.5 text-sm font-bold transition duration-200 shadow-lg shadow-black/10"
                                    >
                                        Open Live Account <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/platform"
                                        className="inline-flex items-center gap-2 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition duration-200"
                                    >
                                        Try Demo
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
                                                className="h-7 w-7 rounded-full border border-amber-600 object-cover"
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-amber-100/90 font-medium">5/5 (220,000+ Active Clients)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </Section>


        </>
    );
}
