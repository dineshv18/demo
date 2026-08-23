"use client";

import { ShieldCheck, Eye, Users2, ArrowRight, LineChart, Lock, Sparkles } from "lucide-react";
import { Reveal, SectionTitle } from "../site/primitives";
import Link from "next/link";
import { CtaBanner } from "../site/CtaBanner";

const principles = [
    {
        icon: Eye,
        title: "Transparency First",
        desc: "Every tier, fee, and referral payout is published where you can see it — in your dashboard, not in fine print you find later.",
    },
    {
        icon: ShieldCheck,
        title: "Security By Default",
        desc: "KYC verification, segregated wallet tracking, and role-based admin controls aren't add-ons — they're how the platform is built.",
    },
    {
        icon: Users2,
        title: "Investor-First",
        desc: "Features ship because they help investors understand and track their capital — not because they look good in a pitch deck.",
    },
];

const whyUs = [
    { icon: LineChart, title: "Real-Time Visibility", desc: "Your Index performance, wallet balance, and transaction history update live — you're never guessing where things stand." },
    { icon: Lock, title: "Verified, Not Anonymous", desc: "Every account on the platform completes KYC. That protects you as much as it protects the platform." },
    { icon: Users2, title: "A Referral Program That Pays Out", desc: "Five levels deep, tracked automatically, with payouts visible in your dashboard the moment they're earned." },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div
                className="relative pt-28 pb-20 overflow-hidden"
                style={{ background: "radial-gradient(circle at 80% 20%, rgba(0,185,86,0.08), transparent 60%)" }}
            >
                <div className="mx-auto max-w-4xl px-5 lg:px-8 text-center">
                    <Reveal>
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
                            About <span className="text-gradient">ORVANTA Financial</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={0.05}>
                        <p className="mt-6 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                            ORVANTA Financial was built on a simple premise: independent investors deserve
                            the same transparency and security standards as institutional platforms — a
                            KYC-verified account, published tier terms, and a dashboard that tells you
                            exactly where your capital stands.
                        </p>
                    </Reveal>
                </div>
            </div>

            {/* Mission Section */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
                <div className="grid gap-12 lg:grid-cols-2 items-start">
                    <Reveal>
                        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-snug">
                            What we&apos;re building
                        </h2>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <div className="grid sm:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
                            <p>
                                ORVANTA Financial is a KYC-verified Index investing platform. Investors deposit
                                into a wallet, choose from tiered investment plans with clearly published
                                minimums, maximums and maturity periods, and track performance from a real-time
                                dashboard.
                            </p>
                            <p>
                                We built the wallet, the tier system, and the referral program around one
                                idea: an investor should never have to guess. Terms are disclosed upfront,
                                fees are published, and every transaction is logged and visible in your
                                account history.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>

            {/* Principles Section */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
                <SectionTitle
                    eyebrow="Core Principles"
                    title={<>What guides <span className="text-gradient">how we build.</span></>}
                    description="These aren't slogans — they're the standard every feature on the platform is measured against."
                />
                <div className="mt-14 grid gap-8 md:grid-cols-3">
                    {principles.map((f, i) => (
                        <Reveal key={f.title} delay={0.1 + i * 0.08}>
                            <div className="text-center space-y-4">
                                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand/15 text-brand">
                                    <f.icon className="h-7 w-7" />
                                </div>
                                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                                    {f.desc}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            {/* Trust Statement / Pull Quote */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-4">
                <Reveal>
                    <div className="rounded-lg glass-strong p-10 md:p-16 relative overflow-hidden text-center">
                        <div aria-hidden className="absolute -inset-x-20 -top-20 h-40 blur-3xl opacity-40"
                            style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 14%, transparent), transparent)" }} />
                        <div className="relative max-w-3xl mx-auto">
                            <Sparkles className="h-8 w-8 text-brand mx-auto mb-6" strokeWidth={1.5} />
                            <p className="font-display text-2xl md:text-4xl font-normal tracking-tight leading-snug text-foreground">
                                We publish what other platforms bury in fine print —
                                <span className="text-gradient"> that&apos;s the whole philosophy.</span>
                            </p>
                            <p className="mt-6 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                                Transparent terms, verified accounts, and a dashboard that tells the truth
                                about your capital — measured against the same standard on every feature we ship.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* Why Choose Us Section */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
                <Reveal>
                    <div className="rounded-2xl border border-border/50 bg-card/50 p-8 md:p-12">
                        <div className="grid gap-10 lg:grid-cols-2 items-center">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 border border-brand/20 px-3.5 py-1.5 text-xs font-semibold text-brand">
                                    Why Choose ORVANTA
                                </div>
                                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                                    Built for investors who read the fine print.
                                </h2>
                                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                    Because we published it in plain view instead. If you want a platform
                                    where verification is real, terms are disclosed, and your dashboard
                                    tells the truth about your account, that&apos;s what we built.
                                </p>
                                <Link href="/platform" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:gap-3 transition-all">
                                    See how the platform works <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {whyUs.map((w) => (
                                    <div key={w.title} className="flex items-start gap-4 rounded-xl border border-border/50 bg-background p-4">
                                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                                            <w.icon className="h-4.5 w-4.5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">{w.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{w.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* CTA */}
            <CtaBanner />
        </div>
    );
}
