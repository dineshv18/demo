"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconLoader2, IconAlertCircle, IconLock, IconShieldCheck,
  IconTrendingUp, IconTrendingDown, IconUser,
  IconRefresh, IconWallet, IconCoin, IconInfoCircle,
  IconClock,
} from "@tabler/icons-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { indexAPI, kycAPI, type IndexData, type KycData } from "@/lib/api";
import InvestmentBasePopup from "@/components/site/InvestmentBasePopup";

const INVESTMENT_BASE = [
  { num: 1, name: "NOVA INDEX", range: "$100 - $500", returnRange: "3% to 5%", duration: "18 months", color: "from-blue-500 to-cyan-400", icon: "✦" },
  { num: 2, name: "PRIME INDEX", range: "$501 - $2,000", returnRange: "5% to 7%", duration: "18 months", color: "from-purple-500 to-pink-400", icon: "◆" },
  { num: 3, name: "VERTEX INDEX", range: "$2,001 - $10,000", returnRange: "7% to 9%", duration: "24 months", color: "from-amber-500 to-orange-400", icon: "★" },
  { num: 4, name: "IMPERIUM INDEX", range: "$10,001 & above", returnRange: "9% to 11%", duration: "30 months", color: "from-emerald-500 to-teal-400", icon: "♛" },
];

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground">${Number(payload[0].value).toFixed(4)}</p>
    </div>
  );
}

export default function IndexPage() {
  const [data, setData] = useState<IndexData | null>(null);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchData();
    const seen = localStorage.getItem("orvanta_investment_base_seen");
    if (!seen) {
      const timer = setTimeout(() => setShowPopup(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [indexRes, kycRes] = await Promise.allSettled([
        indexAPI.getData(),
        kycAPI.getStatus(),
      ]);
      if (indexRes.status === "fulfilled") setData(indexRes.value);
      if (kycRes.status === "fulfilled") setKyc(kycRes.value.kyc);
    } catch {
      setError("Failed to load index data");
    } finally {
      setLoading(false);
    }
  };

  const kycApproved = kyc?.status === "APPROVED";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!kycApproved) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">ORVANTA Index</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Track index performance and investment returns</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <div className="flex items-start sm:items-center gap-3 flex-1">
            <IconAlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">KYC verification required</p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">Complete your KYC to view index data and returns.</p>
            </div>
          </div>
          <Link href="/dashboard/kyc" className="shrink-0 self-start sm:self-auto rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
            {kyc?.status === "PENDING" ? "Check KYC Status" : "Complete KYC"}
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
            <IconLock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold">Index Locked</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
            {kyc?.status === "PENDING"
              ? "Your KYC is under review. Index access will be unlocked once approved."
              : "Complete your KYC verification to view index performance and investment returns."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
          <IconRefresh className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const { tiers, activeTier, walletBalance, priceHistory, currentPrice, manager } = data || {};
  const priceUp = (currentPrice?.changePercent ?? 0) >= 0;
  const balance = walletBalance || 0;

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">ORVANTA Index</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">Track index performance and investment returns</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowPopup(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium hover:bg-accent transition-colors"
            >
              <IconInfoCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Investment Base</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
              <IconShieldCheck className="h-3.5 w-3.5" /> KYC Verified
            </span>
            <span className="sm:hidden inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
              <IconShieldCheck className="h-3 w-3" /> Verified
            </span>
            <button onClick={fetchData} className="flex items-center gap-2 rounded-lg border border-border px-2.5 sm:px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
              <IconRefresh className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Wallet Balance + Tier Banner */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shrink-0">
                <IconWallet className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Your Wallet Balance</p>
                <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
                  <span className="text-gradient">${balance.toFixed(2)}</span>
                </p>
              </div>
            </div>
            {activeTier ? (
              <div className="flex items-center gap-3">
                <div className="text-center sm:text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Tier</p>
                  <p className="text-sm font-bold text-brand mt-0.5">{activeTier.label}</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 shrink-0">
                  <IconCoin className="h-6 w-6 text-brand" />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Deposit funds to unlock returns</p>
                <Link href="/dashboard/wallet" className="text-xs font-semibold text-brand hover:underline mt-1 inline-block">
                  Add Funds →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Index Price Card + Chart */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="font-display text-lg sm:text-xl font-bold">ORVANTA Index</h2>
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wider uppercase bg-muted px-2 py-0.5 rounded-md">ORVI</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">CURRENT INDEX PRICE</p>
              <div className="flex items-center gap-2 sm:gap-3 mt-1">
                <span className="font-display text-xl sm:text-2xl font-bold">${currentPrice?.price?.toFixed(2) || "0.00"}</span>
                <span className={`inline-flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-bold ${priceUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                  {priceUp ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
                  ${Math.abs(currentPrice?.changeAmount || 0).toFixed(2)} ({Math.abs(currentPrice?.changePercent || 0).toFixed(2)}%)
                </span>
              </div>
            </div>
            <span className="relative inline-flex items-center gap-1 rounded-lg bg-red-500 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white shrink-0">
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              SOLD OUT
            </span>
          </div>

          <div className="h-[200px] sm:h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceHistory || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="idxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                <XAxis dataKey="dateLabel" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "rgba(128,128,128,0.7)" }} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(2)}`} tick={{ fill: "rgba(128,128,128,0.7)" }} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="price" stroke="#c9a84c" strokeWidth={2} fillOpacity={1} fill="url(#idxGrad)" dot={{ r: 3, fill: "#c9a84c", strokeWidth: 2, stroke: "var(--card)" }} activeDot={{ r: 5, fill: "#c9a84c", strokeWidth: 2, stroke: "var(--card)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Base Section — On Page */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="text-center mb-6">
            <p className="text-xs text-brand font-semibold uppercase tracking-widest mb-1">ORVANTA Financial</p>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Investment Base</h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-brand to-brand-2 mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INVESTMENT_BASE.map((item) => (
              <div key={item.num} className="group relative rounded-xl border border-border bg-background/50 p-4 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                    {item.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-bold tracking-wide text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.range}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-brand">
                        <IconTrendingUp className="h-3 w-3" /> {item.returnRange}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <IconClock className="h-3 w-3" /> {item.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Index Manager */}
        {manager && (
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 className="font-display text-base sm:text-lg font-semibold mb-4">Index Manager</h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 shrink-0">
                <IconUser className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base text-foreground">{manager.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{manager.title}</p>
                {manager.bio && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">{manager.bio}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investment Base Popup */}
      {showPopup && <InvestmentBasePopup onClose={() => { setShowPopup(false); localStorage.setItem("orvanta_investment_base_seen", "1"); }} />}
    </>
  );
}
