"use client";

import { ArrowUpRight, ArrowDownRight, Zap, Activity, Globe, CandlestickChart } from "lucide-react";
import { motion } from "framer-motion";

const chartPath =
    "M0,85 C30,70 50,95 90,75 C130,55 150,25 190,40 C230,55 250,15 290,20 C330,25 350,60 390,45 C430,30 450,10 500,5";

export function HeroDashboard() {
    return (
        <div className="relative w-full max-w-5xl mx-auto">
            {/* Ambient Background Glows */}
            <div
                aria-hidden
                className="absolute -inset-10 -z-10 rounded-[3rem] blur-[80px] opacity-40 dark:opacity-60 transition-all duration-1000"
                style={{
                    background: "radial-gradient(circle at 30% 30%, var(--brand) 0%, transparent 50%), radial-gradient(circle at 70% 70%, var(--brand-2) 0%, transparent 50%)"
                }}
            />
            
            <motion.div
                initial={{ opacity: 0, y: 40, rotateX: 6 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="glass-strong rounded-2xl p-5 shadow-[0_50px_100px_-30px_rgba(155,153,254,0.25)] border border-border/80 dark:border-white/10 backdrop-blur-2xl"
            >
                {/* Header Window Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-border/40 dark:border-white/5 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                            <span className="h-3 w-3 rounded-full bg-red-500/80" />
                            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-muted/60 dark:bg-white/5 border border-border/50 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                            <CandlestickChart className="h-3 w-3 text-primary" /> Index Live Dashboard
                        </div>
                    </div>
                    <div className="text-[11px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Feed Connected
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: Watchlist */}
                    <div className="col-span-1 rounded-lg border border-border/50 dark:border-white/5 bg-background/30 dark:bg-zinc-950/20 p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Market Watch</span>
                                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">6 Active</span>
                            </div>
                            <div className="space-y-1">
                                {[
                                    ["EUR/USD", "1.08421", "+0.24%", true],
                                    ["GBP/USD", "1.27315", "+0.11%", true],
                                    ["BTC/USD", "68,421.50", "-0.62%", false],
                                    ["ETH/USD", "3,842.10", "+1.42%", true],
                                    ["XAU/USD", "2,384.50", "+0.32%", true],
                                    ["USD/JPY", "156.024", "-0.08%", false],
                                ].map(([sym, px, pct, up]) => (
                                    <div 
                                        key={sym as string} 
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 dark:hover:bg-white/5 transition duration-150 group cursor-pointer"
                                    >
                                        <div className="font-semibold text-xs tracking-tight">{sym}</div>
                                        <div className="flex items-center gap-3">
                                            <span className="tabular-nums text-xs text-foreground/90 font-medium">{px}</span>
                                            <span className={`tabular-nums text-[10px] font-semibold px-1.5 py-0.5 rounded ${up ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}>{pct}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border/40 dark:border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Slippage: <span className="font-semibold text-foreground">0.1 pips</span></span>
                            <span>Broker: <span className="font-semibold text-foreground">ORVANTA</span></span>
                        </div>
                    </div>

                    {/* Column 2 & 3: Main Chart */}
                    <div className="col-span-1 md:col-span-2 rounded-lg border border-border/50 dark:border-white/5 bg-background/30 dark:bg-zinc-950/20 p-4 relative overflow-hidden flex flex-col justify-between">
                        {/* Background Grid Pattern inside chart */}
                        <div className="absolute inset-0 bg-grid opacity-[0.03] dark:opacity-[0.06] pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded bg-primary" /> EUR / USD · 1 Hour Chart
                                </div>
                                <div className="mt-1 flex items-baseline gap-2.5">
                                    <span className="text-2xl font-bold tracking-tight tabular-nums">1.08421</span>
                                    <span className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight className="h-3 w-3" /> +0.24%
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-muted/60 dark:bg-white/5 p-1 rounded-lg border border-border/60 dark:border-white/5">
                                {["M15", "H1", "H4", "D1"].map((t, i) => (
                                    <span 
                                        key={t} 
                                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-md cursor-pointer transition duration-150 ${i === 1 ? "bg-background shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Chart Render */}
                        <div className="relative my-4 h-36 w-full">
                            <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.45" />
                                        <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                                    </linearGradient>
                                    <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                                        <stop offset="0%" stopColor="var(--brand-2)" />
                                        <stop offset="50%" stopColor="var(--brand)" />
                                        <stop offset="100%" stopColor="var(--brand-glow)" />
                                    </linearGradient>
                                </defs>
                                
                                {/* Vertical Grid Lines */}
                                {[50, 150, 250, 350, 450].map((x) => (
                                    <line key={x} x1={x} y1="0" x2={x} y2="120" stroke="currentColor" strokeOpacity="0.04" strokeDasharray="3 3" className="text-foreground" />
                                ))}
                                
                                {/* Horizontal Grid Lines */}
                                {[30, 60, 90].map((y) => (
                                    <line key={y} x1="0" y1={y} x2="500" stroke="currentColor" strokeOpacity="0.04" strokeDasharray="3 3" className="text-foreground" />
                                ))}

                                <path d={`${chartPath} L500,120 L0,120 Z`} fill="url(#chartGradient)" />
                                <motion.path
                                    d={chartPath}
                                    fill="none"
                                    stroke="url(#lineGradient)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.8, ease: "easeInOut" }}
                                />
                                {/* Pulsing Nodes */}
                                {[90, 190, 290, 390, 500].map((x, i) => (
                                    <g key={i}>
                                        <circle cx={x} cy={[75, 40, 20, 45, 5][i]} r="5" fill="var(--brand)" className="animate-pulse" />
                                        <circle cx={x} cy={[75, 40, 20, 45, 5][i]} r="2" fill="#fff" />
                                    </g>
                                ))}
                            </svg>
                        </div>

                        {/* Bid / Ask info */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-background/50 dark:bg-white/5 border border-border/50 dark:border-white/5 p-2 transition duration-200 hover:border-primary/30">
                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Bid Price</div>
                                <div className="font-bold text-xs tracking-tight tabular-nums mt-0.5">1.08419</div>
                            </div>
                            <div className="rounded-lg bg-background/50 dark:bg-white/5 border border-border/50 dark:border-white/5 p-2 transition duration-200 hover:border-primary/30">
                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Ask Price</div>
                                <div className="font-bold text-xs tracking-tight tabular-nums mt-0.5">1.08423</div>
                            </div>
                            <div className="rounded-lg bg-background/50 dark:bg-white/5 border border-border/50 dark:border-white/5 p-2 transition duration-200 hover:border-primary/30">
                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Real Spreads</div>
                                <div className="font-bold text-xs tracking-tight tabular-nums text-primary mt-0.5">0.4 pips</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Floating Status Badges */}
            <motion.div
                className="absolute -left-6 md:-left-16 top-28 glass rounded-lg p-3 w-48 shadow-lg border border-border/50 dark:border-white/10 animate-float-slow backdrop-blur-md"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-3 text-xs">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20"><Zap className="h-4.5 w-4.5" /></div>
                    <div>
                        <div className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">Fast Execution</div>
                        <div className="font-bold text-xs mt-0.5">18 ms average</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="absolute -right-4 md:-right-12 -bottom-4 glass rounded-lg p-3 w-52 shadow-lg border border-border/50 dark:border-white/10 animate-float-med backdrop-blur-md"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
            >
                <div className="flex items-center gap-3 text-xs">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Activity className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <div className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">Live Position</div>
                        <div className="font-bold text-xs text-emerald-500 flex items-center gap-1 mt-0.5">
                            + $1,284.20 <ArrowDownRight className="h-3 w-3 rotate-180" />
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="absolute -right-8 md:-right-20 top-8 glass rounded-lg p-3 w-48 shadow-lg border border-border/50 dark:border-white/10 animate-float-slow backdrop-blur-md"
                style={{ animationDelay: "1.5s" }}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
            >
                <div className="flex items-center gap-3 text-xs">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500/10 text-violet-500 border border-violet-500/20">
                        <Globe className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <div className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">Liquidity</div>
                        <div className="font-bold text-xs mt-0.5">Tier-1 Premium</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
