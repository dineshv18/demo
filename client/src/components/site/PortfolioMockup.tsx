"use client";

import { ArrowUpRight, Wallet2, LineChart, Gift, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const areaPath =
    "M0,70 C40,60 60,80 100,65 C140,50 160,30 200,38 C240,46 260,20 300,15";

export function PortfolioMockup() {
    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div
                aria-hidden
                className="absolute -inset-8 -z-10 rounded-[3rem] blur-[70px] opacity-40"
                style={{
                    background:
                        "radial-gradient(circle at 25% 20%, var(--brand) 0%, transparent 55%), radial-gradient(circle at 75% 80%, var(--brand-2) 0%, transparent 55%)",
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="glass-strong rounded-2xl p-5 sm:p-6 shadow-[0_40px_90px_-30px_rgba(16,33,29,0.25)] border border-border/70 backdrop-blur-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/40">
                    <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand/10 text-brand">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-foreground leading-none">Account Overview</p>
                            <p className="text-[10px] text-muted-foreground mt-1">KYC-verified · Live</p>
                        </div>
                    </div>
                    <div className="text-[10px] text-emerald-600 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Synced
                    </div>
                </div>

                {/* Three balance tiles */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Wallet2 className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-medium uppercase tracking-wide">Wallet</span>
                        </div>
                        <p className="mt-2 text-base sm:text-lg font-bold tabular-nums text-foreground">$3,240</p>
                    </div>
                    <div className="rounded-xl border-2 border-brand/40 bg-brand/[0.05] p-3">
                        <div className="flex items-center gap-1.5 text-brand">
                            <LineChart className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-medium uppercase tracking-wide">Index</span>
                        </div>
                        <p className="mt-2 text-base sm:text-lg font-bold tabular-nums text-foreground">$9,850</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Gift className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-medium uppercase tracking-wide">Bonus</span>
                        </div>
                        <p className="mt-2 text-base sm:text-lg font-bold tabular-nums text-foreground">$412</p>
                    </div>
                </div>

                {/* Chart */}
                <div className="mt-5 rounded-xl border border-border/50 bg-background/30 p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between mb-3">
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Index Performance · 30D</p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-xl font-bold tabular-nums text-foreground">$9,850.00</span>
                                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                    <ArrowUpRight className="h-3 w-3" /> +6.4%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-20 w-full">
                        <svg viewBox="0 0 300 90" className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="portfolioFill" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d={`${areaPath} L300,90 L0,90 Z`} fill="url(#portfolioFill)" />
                            <motion.path
                                d={areaPath}
                                fill="none"
                                stroke="var(--brand)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.4, ease: "easeInOut" }}
                            />
                        </svg>
                    </div>
                </div>

                {/* Referral strip */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                            <Gift className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Referral Earnings</p>
                            <p className="text-xs font-semibold text-foreground">5-level commission, credited instantly</p>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-brand tabular-nums">+$412</span>
                </div>
            </motion.div>
        </div>
    );
}
