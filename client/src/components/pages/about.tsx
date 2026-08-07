"use client";

import { Users, Target, Award, Play } from "lucide-react";
import { Reveal } from "../site/primitives";
import Image from "next/image";
import { CtaBanner } from "../site/CtaBanner";

const features = [
    {
        icon: Users,
        title: "Professional Team",
        desc: "Industry veterans with decades of combined experience in institutional trading, technology, and financial regulation.",
    },
    {
        icon: Target,
        title: "Target Oriented",
        desc: "Every feature we build is measured by one thing — does it help our traders perform better in live markets?",
    },
    {
        icon: Award,
        title: "Success Guarantee",
        desc: "From execution speed to fund security, we engineer reliability into every layer of the infrastructure.",
    },
];

const teamImages = [
    { src: "/about/team1.jpg", alt: "Team collaboration" },
    { src: "/about/team2.jpg", alt: "Office meeting" },
    { src: "/about/team3.jpg", alt: "Team working" },
    { src: "/about/team4.jpg", alt: "Team discussion" },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-primary/10 pt-28 pb-0 overflow-hidden">
                <div className="mx-auto max-w-6xl px-5 lg:px-8 text-center">
                    <Reveal>
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                            About us
                        </h1>
                    </Reveal>
                    <Reveal delay={0.05}>
                        <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                            ORVANTA Financial was founded on a simple belief: independent traders deserve the same
                            infrastructure, pricing and safeguards as institutional desks. We spent years engineering that reality.
                        </p>
                    </Reveal>
                </div>

                {/* Team Images Row */}
                <Reveal delay={0.1}>
                    <div className="mt-10 flex justify-center gap-4 px-5 max-w-5xl mx-auto pb-0">
                        {teamImages.map((img, i) => (
                            <div
                                key={i}
                                className="relative flex-1 h-48 md:h-56 lg:h-64 rounded-t-2xl overflow-hidden bg-muted/50 border border-border/40 border-b-0"
                            >
                                <Image
                                    src={img.src}
                                    alt={img.alt}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                {/* Placeholder gradient if no image */}
                                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60 -z-10" />
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>

            {/* Mission Section */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
                <div className="grid gap-12 lg:grid-cols-2 items-start">
                    <Reveal>
                        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-snug">
                            We make sure your idea &amp; creation delivered properly
                        </h2>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <div className="grid sm:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
                            <p>
                                ORVANTA Financial was built by traders, for traders. We saw how institutional desks
                                had access to better pricing, faster execution, and deeper liquidity — and we
                                built the bridge to bring that to independent professionals.
                            </p>
                            <p>
                                From raw spreads starting at 0.0 pips to sub-25ms execution across three continents,
                                every part of our platform is designed for traders who take performance seriously.
                                No marketing spreads — just real infrastructure delivering real results.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>

            {/* Empower Section */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 pb-20">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                    {/* Image Side */}
                    <Reveal>
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden bg-muted/50 aspect-[4/3] border border-border/40">
                                <Image
                                    src="/about/empower.jpg"
                                    alt="Team meeting"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60 -z-10" />
                                {/* Play button */}
                                <div className="absolute inset-0 grid place-items-center">
                                    <div className="grid h-14 w-14 place-items-center rounded-full bg-white/90 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                                        <Play className="h-5 w-5 text-foreground ml-0.5" fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                            {/* Quote card */}
                            <div className="absolute -bottom-6 left-6 right-6 md:right-auto md:left-6 md:max-w-xs rounded-lg bg-white dark:bg-card border border-border/60 shadow-xl p-5">
                                <p className="text-sm font-semibold">&ldquo;Making an impact, together&rdquo;</p>
                                <p className="text-xs text-muted-foreground mt-1">ORVANTA Founder</p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Text Side */}
                    <Reveal delay={0.1}>
                        <div className="space-y-6 pt-8 lg:pt-0">
                            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-snug">
                                We empower small business owners
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                From solo traders running algorithmic strategies to prop firms managing
                                multiple accounts — we provide the infrastructure that scales with ambition.
                                Our MT5 environment delivers the same institutional-grade tools to everyone.
                            </p>
                            <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-5">
                                <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    &ldquo;ORVANTA Financial was built on the belief that every serious trader deserves
                                    transparent pricing, lightning-fast execution, and a platform they can trust.
                                    That belief drives everything we build.&rdquo;
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>

            {/* Growth Section */}
            <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20 text-center">
                <Reveal>
                    <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-snug max-w-2xl mx-auto">
                        We help business to grow faster and bigger
                    </h2>
                    <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        A connected set of services designed to turn strategy into scale — from execution
                        infrastructure to dedicated support.
                    </p>
                </Reveal>

                <div className="mt-14 grid gap-8 md:grid-cols-3">
                    {features.map((f, i) => (
                        <Reveal key={f.title} delay={0.1 + i * 0.08}>
                            <div className="text-center space-y-4">
                                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 border border-primary/20">
                                    <f.icon className="h-7 w-7 text-primary" />
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

            {/* CTA */}
            <CtaBanner />
        </div>
    );
}
