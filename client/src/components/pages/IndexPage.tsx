"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconLoader2, IconAlertCircle, IconLock, IconShieldCheck,
  IconTrendingUp, IconTrendingDown, IconUser,
  IconRefresh, IconWallet, IconCoin,
} from "@tabler/icons-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { indexAPI, kycAPI, type IndexData, type KycData } from "@/lib/api";

export default function IndexPage() {
  const [data, setData] = useState<IndexData | null>(null);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchData(); }, []);

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
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">MetaYield Index</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Track index performance and returns</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
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
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
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

  // Calculate actual dollar returns based on wallet balance
  const calcReturn = (pct: string) => balance * (parseFloat(pct) / 100);

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">MetaYield Index</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Track index performance and returns</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
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
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
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
            <div className="rounded-lg border border-dashed border-border px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Deposit funds to unlock returns</p>
              <Link href="/dashboard/wallet" className="text-xs font-semibold text-brand hover:underline mt-1 inline-block">
                Add Funds →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Index Price Card */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3">
              <h2 className="font-display text-lg sm:text-xl font-bold">MetaYield Index</h2>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wider uppercase">MYLD</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs sm:text-sm text-muted-foreground">CURRENT INDEX PRICE</span>
            </div>
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

        {/* Chart */}
        <div className="h-[200px] sm:h-[280px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceHistory || []}>
              <defs>
                <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--brand))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="dateLabel"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value) => [`$${Number(value).toFixed(4)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--brand))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#indexGradient)"
                dot={{ r: 4, fill: "hsl(var(--brand))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                activeDot={{ r: 6, fill: "hsl(var(--brand))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Your Returns - Dollar + Percentage */}
      {activeTier && balance > 0 ? (
        <div>
          <h2 className="font-display text-base sm:text-lg font-semibold mb-3">Your Returns</h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <ReturnCard
              label="1W Return"
              percent={`${parseFloat(activeTier.weeklyReturn).toFixed(2)}%`}
              dollar={calcReturn(activeTier.weeklyReturn)}
              balance={balance}
              color="from-blue-600 to-blue-800"
            />
            <ReturnCard
              label="1M Return"
              percent={`${parseFloat(activeTier.monthlyReturn).toFixed(2)}%`}
              dollar={calcReturn(activeTier.monthlyReturn)}
              balance={balance}
              color="from-blue-600 to-blue-800"
            />
            <ReturnCard
              label="6M Return"
              percent={`${parseFloat(activeTier.halfYearlyReturn).toFixed(2)}%`}
              dollar={calcReturn(activeTier.halfYearlyReturn)}
              balance={balance}
              color="from-blue-600 to-blue-800"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <ReturnCardEmpty label="1W Return" />
          <ReturnCardEmpty label="1M Return" />
          <ReturnCardEmpty label="6M Return" />
        </div>
      )}

      {/* Tier Comparison Table */}
      {tiers && tiers.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-semibold mb-4">Investment Tiers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Tier</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider text-right">1 Week</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider text-right">1 Month</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider text-right">6 Months</th>
                  {balance > 0 && <th className="pb-3 font-medium text-xs uppercase tracking-wider text-right">Your Est. 6M</th>}
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => {
                  const isYourTier = activeTier?.id === tier.id;
                  return (
                    <tr
                      key={tier.id}
                      className={`border-b border-border/50 last:border-0 transition-colors ${
                        isYourTier ? "bg-brand/5" : "hover:bg-accent/50"
                      }`}
                    >
                      <td className="py-3 font-medium">
                        <div className="flex items-center gap-2">
                          {isYourTier && (
                            <span className="h-2 w-2 rounded-full bg-brand shrink-0" />
                          )}
                          <span>{tier.label}</span>
                          {isYourTier && (
                            <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">YOUR TIER</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right text-emerald-500 font-medium">{parseFloat(tier.weeklyReturn).toFixed(2)}%</td>
                      <td className="py-3 text-right text-emerald-500 font-medium">{parseFloat(tier.monthlyReturn).toFixed(2)}%</td>
                      <td className="py-3 text-right text-emerald-500 font-medium">{parseFloat(tier.halfYearlyReturn).toFixed(2)}%</td>
                      {balance > 0 && (
                        <td className="py-3 text-right font-medium text-foreground">
                          ${(balance * parseFloat(tier.halfYearlyReturn) / 100).toFixed(2)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Index Manager */}
      {manager && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base sm:text-lg font-semibold">Index Manager</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-brand/10 shrink-0">
              <IconUser className="h-6 w-6 sm:h-7 sm:w-7 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base">{manager.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{manager.title}</p>
              {manager.bio && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{manager.bio}</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ReturnCard({ label, percent, dollar, balance, color }: {
  label: string;
  percent: string;
  dollar: number;
  balance: number;
  color: string;
}) {
  return (
    <div className={`rounded-xl sm:rounded-2xl bg-gradient-to-br ${color} p-3 sm:p-5`}>
      <p className="text-[10px] sm:text-sm font-medium text-white/90">{label}</p>
      <p className="font-display text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 text-white">{percent}</p>
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20">
        <p className="text-[10px] sm:text-xs text-white/70">You earn on ${balance.toFixed(0)}</p>
        <p className="font-display text-sm sm:text-lg font-bold text-emerald-200 mt-0.5">+${dollar.toFixed(2)}</p>
      </div>
    </div>
  );
}

function ReturnCardEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-3 sm:p-5 text-white/50">
      <p className="text-[10px] sm:text-sm font-medium text-white/70">{label}</p>
      <p className="font-display text-base sm:text-2xl font-bold mt-0.5 sm:mt-1">--</p>
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20">
        <p className="text-[10px] sm:text-xs text-white/50">Deposit to see returns</p>
        <p className="font-display text-sm sm:text-lg font-bold text-white/30 mt-0.5">$0.00</p>
      </div>
    </div>
  );
}
