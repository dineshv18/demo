"use client";

import { useMemo, useState } from "react";
import { Search, Clock, ArrowRight } from "lucide-react";
import { Section, Reveal, GlassCard, Eyebrow } from "../site/primitives";
import { CtaBanner } from "../site/CtaBanner";


const categories = ["All", "Forex", "Crypto", "Macro", "Platform", "Strategy"] as const;

const posts = [
    { title: "Reading the DXY: what a stronger dollar means for EUR/USD in Q3", cat: "Forex", author: "Elena Marquez", read: 6, tag: "Featured" },
    { title: "Bitcoin's halving cycle and volatility structure — a professional view", cat: "Crypto", author: "Marcus Chen", read: 8 },
    { title: "Fed dot plot decoded: positioning for the next rate decision", cat: "Macro", author: "James O'Brien", read: 5 },
    { title: "Why sub-25ms execution changes the math on scalping strategies", cat: "Strategy", author: "Priya Rao", read: 4 },
    { title: "MT5 Expert Advisor deep-dive: risk-parity portfolio automation", cat: "Platform", author: "Tomas Silva", read: 10 },
    { title: "ETH after the merge: liquidity, funding and volatility profile", cat: "Crypto", author: "Marcus Chen", read: 7 },
    { title: "Carry trade playbook: JPY funding and the yield differential map", cat: "Forex", author: "Elena Marquez", read: 6 },
    { title: "How institutional desks size positions — a framework you can adapt", cat: "Strategy", author: "Priya Rao", read: 9 },
];

export default function BlogPage() {
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<(typeof categories)[number]>("All");

    const filtered = useMemo(
        () =>
            posts.filter(
                (p) =>
                    (cat === "All" || p.cat === cat) &&
                    (q === "" || p.title.toLowerCase().includes(q.toLowerCase()) || p.author.toLowerCase().includes(q.toLowerCase())),
            ),
        [q, cat],
    );

    const featured = posts[0];

    return (
        <>
            <Section className="!pt-20 text-center">
                <Eyebrow>Market intelligence</Eyebrow>
                <h1 className="mt-5 font-display text-5xl md:text-6xl font-semibold tracking-tight">
                    Analysis from <span className="text-gradient">the trading desk</span>.
                </h1>
                <p className="mt-5 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Original macro, FX and crypto research — written by people who move real risk.
                </p>
            </Section>

            <Section className="!pt-0">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search articles or authors..."
                            className="w-full glass rounded-lg  py-3 pl-11 pr-5 text-sm outline-none focus:border-primary"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCat(c)}
                                className={`rounded-lg  px-4 py-2 text-xs font-medium transition ${cat === c ? "btn-glow" : "border border-border/70 hover:bg-accent"}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <Reveal>
                    <div className="mt-10 relative overflow-hidden rounded-lg glass-strong p-8 md:p-10">
                        <div aria-hidden className="absolute -top-24 -right-24 h-72 w-72 rounded-lg  blur-3xl"
                            style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 40%, transparent), transparent)" }} />
                        <div className="relative grid gap-8 md:grid-cols-[1.2fr,1fr] items-center">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-primary">Featured · {featured.cat}</div>
                                <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight">{featured.title}</h2>
                                <p className="mt-3 text-muted-foreground max-w-lg">
                                    A structural take on dollar strength, US yield differentials and what price
                                    action across G7 pairs is really telling us going into the quarter.
                                </p>
                                <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>By {featured.author}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.read} min read</span>
                                </div>
                                <button className="mt-6 inline-flex items-center gap-2 rounded-lg  btn-glow btn-glow-hover px-5 py-2.5 text-sm font-medium">
                                    Read Article <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="relative h-56 md:h-64 rounded-2xl overflow-hidden border border-border/60 bg-background/40">
                                <div className="absolute inset-0 bg-grid opacity-40" />
                                <svg viewBox="0 0 400 200" className="absolute inset-0 h-full w-full">
                                    <defs>
                                        <linearGradient id="fg" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0" stopColor="var(--brand)" stopOpacity="0.5" />
                                            <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,140 C50,120 90,150 140,110 C190,70 230,120 280,80 C330,50 360,90 400,60 L400,200 L0,200 Z" fill="url(#fg)" />
                                    <path d="M0,140 C50,120 90,150 140,110 C190,70 230,120 280,80 C330,50 360,90 400,60" fill="none" stroke="var(--brand)" strokeWidth="2" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((p, i) => (
                        <Reveal key={p.title} delay={i * 0.04}>
                            <GlassCard className="h-full !p-0 overflow-hidden">
                                <div className="relative h-40 overflow-hidden">
                                    <div className="absolute inset-0 bg-grid opacity-40" />
                                    <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, color-mix(in oklab, var(--brand) 30%, transparent), color-mix(in oklab, var(--brand-2) 20%, transparent))` }} />
                                    <div className="absolute bottom-3 left-3 rounded-lg  glass px-2.5 py-1 text-[10px] uppercase tracking-widest">{p.cat}</div>
                                </div>
                                <div className="p-6">
                                    <div className="font-display text-lg font-semibold leading-snug line-clamp-2">{p.title}</div>
                                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{p.author}</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {p.read} min</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </Reveal>
                    ))}
                </div>
                {filtered.length === 0 && (
                    <div className="mt-10 text-center text-muted-foreground">No articles match your search.</div>
                )}
            </Section>

            <CtaBanner />

        </>
    );
}
