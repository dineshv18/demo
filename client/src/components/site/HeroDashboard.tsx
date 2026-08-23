"use client";

import { ArrowUpRight, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const chartPath =
    "M0,85 C30,70 50,95 90,75 C130,55 150,25 190,40 C230,55 250,15 290,20 C330,25 350,60 390,45 C430,30 450,10 500,5";

const watchlist: [string, string, string, boolean][] = [
    ["BTC/USD", "68,421.50", "+1.42%", true],
    ["ETH/USD", "3,842.10", "+0.62%", true],
    ["EUR/USD", "1.08421", "-0.11%", false],
    ["XAU/USD", "2,384.50", "+0.32%", true],
];

function MarketWatch() {
    return (
        <div className="rounded-xl border border-border/60 bg-background/60 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Market Watch</span>
                <span className="text-[10px] text-brand bg-brand/10 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <div className="space-y-0.5">
                {watchlist.map(([sym, px, pct, up]) => (
                    <div key={sym} className="flex items-center justify-between py-1.5">
                        <span className="font-semibold text-xs tracking-tight">{sym}</span>
                        <div className="flex items-center gap-2.5">
                            <span className="tabular-nums text-xs text-foreground/80 font-medium">{px}</span>
                            <span className={`tabular-nums text-[10px] font-semibold px-1.5 py-0.5 rounded ${up ? "text-brand bg-brand/10" : "text-red-500 bg-red-500/10"}`}>{pct}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PortfolioChart() {
    return (
        <div className="rounded-xl border border-border/60 bg-background/60 p-3.5">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Portfolio Overview</div>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-xl font-bold tracking-tight tabular-nums">$24,180.40</span>
                        <span className="text-[11px] text-brand font-semibold flex items-center gap-0.5 bg-brand/10 px-1.5 py-0.5 rounded-full">
                            <ArrowUpRight className="h-3 w-3" /> +8.4%
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative mt-3 h-24 w-full">
                <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="heroChartFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={`${chartPath} L500,120 L0,120 Z`} fill="url(#heroChartFill)" />
                    <motion.path
                        d={chartPath}
                        fill="none"
                        stroke="var(--brand)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.8, ease: "easeInOut" }}
                    />
                </svg>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                    ["Invested", "$20,000"],
                    ["Current", "$24,180"],
                    ["Returns", "+$4,180"],
                ].map(([label, val]) => (
                    <div key={label} className="rounded-lg bg-muted/40 border border-border/40 px-2 py-2">
                        <div className="text-[9px] text-muted-foreground uppercase font-semibold">{label}</div>
                        <div className="font-bold text-[11px] tracking-tight tabular-nums mt-0.5">{val}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function HeroDashboard() {
    return (
        <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
            {/* Ambient background glow */}
            <div
                aria-hidden
                className="absolute -inset-10 -z-10 rounded-[3rem] blur-[70px] opacity-30"
                style={{ background: "radial-gradient(circle at 50% 40%, var(--brand) 0%, transparent 60%)" }}
            />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="glass-strong rounded-2xl p-4 shadow-xl border border-border/70"
            >
                {/* Browser chrome bar */}
                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border/40">
                    <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-brand/80" />
                    </div>
                    <div className="flex-1 rounded-md bg-muted/50 border border-border/40 px-3 py-1 text-[10px] text-muted-foreground truncate">
                        orvanta.financial/dashboard
                    </div>
                </div>

                <div className="space-y-3">
                    <MarketWatch />
                    <PortfolioChart />
                </div>
            </motion.div>

            {/* Floating badges — hidden on mobile to avoid overlap/clipping */}
            <motion.div
                className="hidden sm:flex absolute -left-8 top-10 items-center gap-2.5 glass rounded-lg p-2.5 w-40 shadow-lg border border-border/50 animate-float-slow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand border border-brand/20">
                    <Zap className="h-4 w-4" />
                </div>
                <div>
                    <div className="text-muted-foreground text-[9px] uppercase font-semibold tracking-wider">Live Feed</div>
                    <div className="font-bold text-[11px] mt-0.5">Connected</div>
                </div>
            </motion.div>

            <motion.div
                className="hidden sm:flex absolute -right-6 -bottom-6 items-center gap-2.5 glass rounded-lg p-2.5 w-44 shadow-lg border border-border/50 animate-float-med"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
            >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand border border-brand/20">
                    <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                    <div className="text-muted-foreground text-[9px] uppercase font-semibold tracking-wider">Account Tier</div>
                    <div className="font-bold text-[11px] mt-0.5">KYC Verified</div>
                </div>
            </motion.div>
        </div>
    );
}
