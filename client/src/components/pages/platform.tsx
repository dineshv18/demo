"use client";

import Link from "next/link";
import Image from "next/image";
import {
    LineChart, Bot, BarChart3, MousePointerClick, CalendarDays, Layers,
    ArrowRight, Download, Monitor, Globe, Smartphone, Apple, Check, Sparkles,
} from "lucide-react";
import { Reveal } from "../site/primitives";

const features = [
    {
        icon: LineChart,
        title: "Advanced Charts",
        desc: "See price movements in real-time with 21 different timeframes (from 1 minute to 1 month). Use 38 built-in indicators like Moving Averages and RSI to find trading opportunities.",
        beginner: "Think of charts as your trading map — they show you where the price has been and help predict where it might go next.",
    },
    {
        icon: Bot,
        title: "Algorithmic Trading",
        desc: "Build automated trading robots (called Expert Advisors) using MQL5 programming language. They can trade for you 24/7 while you sleep.",
        beginner: "New to coding? No worries — MT5 has a marketplace where you can download free or paid trading robots made by other traders.",
    },
    {
        icon: BarChart3,
        title: "Depth of Market",
        desc: "See real-time buy and sell orders from other traders. This helps you understand supply and demand before placing your trade.",
        beginner: "It's like seeing how many people want to buy or sell at each price — helps you pick the best entry point.",
    },
    {
        icon: MousePointerClick,
        title: "One-Click Trading",
        desc: "Buy or sell instantly with a single click directly from the chart. Set your risk amount beforehand so you always know your maximum loss.",
        beginner: "Perfect for quick trades — no need to fill out order forms every time. Just click and you're in the market.",
    },
    {
        icon: CalendarDays,
        title: "Economic Calendar",
        desc: "Stay updated with major economic events like interest rate decisions and job reports. Each event shows expected impact so you can plan your trades.",
        beginner: "Big news moves the market. This calendar tells you when important events happen so you're never caught off guard.",
    },
    {
        icon: Layers,
        title: "Multi-Asset Trading",
        desc: "Trade Forex pairs (EUR/USD, GBP/JPY), Crypto CFDs (Bitcoin, Ethereum), and more — all from one account, one platform.",
        beginner: "No need for multiple apps. Everything you want to trade is available in one place.",
    },
];

const plans = [
    {
        name: "Live Account",
        price: "$100",
        unit: "minimum deposit",
        popular: true,
        desc: "Trade with real money. Full access to live markets, raw spreads, and instant execution.",
        features: [
            "Raw spreads from 0.0 pips",
            "Leverage up to 1:500",
            "100+ Forex & Crypto instruments",
            "Negative balance protection",
            "Instant deposits & withdrawals",
            "24/5 priority support",
        ],
        cta: "Open Live Account",
        href: "/#accounts",
    },
    {
        name: "Demo Account",
        price: "$50,000",
        unit: "virtual balance",
        popular: false,
        desc: "Practice with fake money. Learn the platform and test strategies risk-free.",
        features: [
            "Real-time market data",
            "Full MT5 functionality",
            "Same execution as live",
            "Reset balance anytime",
            "No registration required",
            "Unlimited time (30 days renewable)",
        ],
        cta: "Open Demo Account",
        href: "/#accounts",
    },
];

const downloads = [
    { icon: Globe, label: "Web Trader", sub: "No install needed — trade in any browser", cta: "Launch", color: "from-amber-500/20 to-amber-600/20" },
    { icon: Monitor, label: "Windows", sub: "Full desktop app for Windows 10/11", cta: "Download", color: "from-amber-500/20 to-yellow-600/20" },
    { icon: Apple, label: "macOS", sub: "Native app for Apple Silicon Macs", cta: "Download", color: "from-purple-500/20 to-purple-600/20" },
    { icon: Smartphone, label: "Mobile", sub: "iOS & Android — trade on the go", cta: "Get App", color: "from-emerald-500/20 to-emerald-600/20" },
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
                                    <span className="text-gradient">professionals</span> use.
                                </h1>
                                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg">
                                    MT5 powers every ORVANTA Financial account. It&apos;s the world&apos;s most popular
                                    trading platform — and for good reason. Industry-standard charting, automated
                                    trading, and lightning-fast execution across desktop, web and mobile.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link href="/#accounts" className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold btn-glow btn-glow-hover">
                                        Open Live Account <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a href="#downloads" className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-6 py-3.5 text-sm font-medium hover:bg-accent transition">
                                        <Download className="h-4 w-4" /> Download MT5
                                    </a>
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <div className="relative rounded-2xl overflow-hidden bg-muted/50 aspect-[4/3] border border-border/40">
                                <Image
                                    src="/platform/mt5-hero.jpg"
                                    alt="ORVANTA Financial Trading Platform"
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
                            MT5 was built for professional traders — and stripped of bloat by ORVANTA Financial.
                            The result: a platform that gets out of your way and lets you focus on trading.
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

            {/* ─── ACCOUNTS ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
                <Reveal>
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                            Two paths. One engine.<br />Pick your starting point.
                        </h2>
                        <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                            Whether you&apos;re learning the basics or scaling a live portfolio, every ORVANTA
                            account runs on the same MT5 infrastructure.
                        </p>
                    </div>
                </Reveal>

                <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                    {plans.map((plan, i) => (
                        <Reveal key={plan.name} delay={i * 0.08}>
                            <div className="relative rounded-[32px] overflow-hidden bg-white dark:bg-zinc-900 border border-border/60 dark:border-white/5 shadow-xl flex flex-col justify-between h-full">
                                {/* Top Header Block */}
                                <div className={`p-8 pb-14 relative ${plan.popular
                                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-500/10"
                                    : "bg-zinc-100/60 dark:bg-zinc-800/40 border-b border-border/40"
                                    }`}>
                                    {/* Popular Badge */}
                                    {plan.popular && (
                                        <div className="absolute top-4 right-6 rounded-full bg-amber-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                            Most Popular
                                        </div>
                                    )}

                                    {/* Account Type Name */}
                                    <span className="inline-block px-3.5 py-1 text-[11px] font-bold bg-white dark:bg-zinc-900 text-foreground border border-border/80 dark:border-white/10 rounded-full mb-6 uppercase tracking-wider">
                                        {plan.name}
                                    </span>

                                    {/* Price and Unit */}
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-4xl font-extrabold text-foreground tracking-tight">
                                            {plan.price}
                                        </span>
                                        <span className="text-sm font-semibold text-muted-foreground">
                                            / {plan.unit}
                                        </span>
                                    </div>

                                    {/* Tagline / Description */}
                                    <p className="text-xs text-muted-foreground mt-4 font-semibold uppercase tracking-wide">
                                        {plan.desc}
                                    </p>

                                    {/* Overlapping Call-To-Action Button */}
                                    <div className="absolute left-6 right-6 bottom-0 translate-y-1/2 z-10">
                                        <Link
                                            href={plan.href}
                                            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition duration-300 shadow-md ${plan.popular
                                                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/25"
                                                : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 shadow-zinc-950/20"
                                                }`}
                                        >
                                            <span>{plan.cta}</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Bottom Features List */}
                                <div className="p-8 pt-12 flex-1 flex flex-col justify-between">
                                    <ul className="space-y-4">
                                        {plan.features.map((f) => (
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
            </div>

            {/* ─── DOWNLOADS ─── */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20" id="downloads">
                <Reveal>
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                            Download anywhere.<br />Trade everywhere.
                        </h2>
                        <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                            Start on your laptop, check positions on your phone. MT5 is available
                            on every device — your account syncs across all of them.
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
                    <div className="relative overflow-hidden rounded-[32px] p-8 md:p-14 bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 text-white shadow-2xl border border-amber-500/20">
                        {/* Ambient Glows */}
                        <div aria-hidden className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                        <div aria-hidden className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 z-10">
                            <div className="space-y-4 max-w-xl text-left">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/10 select-none">
                                    <Sparkles size={14} className="text-amber-200 animate-pulse" />
                                    <span>Instant Setup</span>
                                </div>

                                {/* Title */}
                                <h3 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                                    Ready to start trading?
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-amber-100/80 leading-relaxed">
                                    Open an account in minutes. Fund it when you&apos;re ready. Trade with discipline.
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
            </div>
        </div>
    );
}
