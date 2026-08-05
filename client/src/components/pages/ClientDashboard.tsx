"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/AuthContext";
import { walletAPI, kycAPI, type WalletData, type TransactionData, type KycData } from "@/lib/api";
import {
  IconWallet, IconShieldCheck, IconShield, IconClock,
  IconArrowUpRight, IconArrowDownLeft, IconLoader2, IconLock,
  IconAlertCircle, IconCheck, IconX,
} from "@tabler/icons-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const currencySymbol = () => "$";

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatDateTime = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof IconCheck }> = {
  COMPLETED: { label: "Completed", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: IconCheck },
  PENDING: { label: "Processing", color: "text-amber-500", bg: "bg-amber-500/10", icon: IconClock },
  FAILED: { label: "Failed", color: "text-red-500", bg: "bg-red-500/10", icon: IconX },
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Theme-aware chart colors (must be before any early return)
  const chartColors = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    return {
      grid: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      axis: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
      tooltipBg: isDark ? "#1a1a2e" : "#ffffff",
      tooltipBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      tooltipText: isDark ? "#e2e8f0" : "#1e293b",
      stroke: isDark ? "oklch(0.78 0.14 85)" : "oklch(0.72 0.14 85)",
      gradientStart: isDark ? "oklch(0.78 0.14 85)" : "oklch(0.72 0.14 85)",
    };
  }, [resolvedTheme]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, txRes, kycRes] = await Promise.allSettled([
          walletAPI.getWallet(),
          walletAPI.getTransactions(),
          kycAPI.getStatus(),
        ]);
        if (walletRes.status === "fulfilled") setWallet(walletRes.value.wallet);
        if (txRes.status === "fulfilled") setTransactions(txRes.value.transactions);
        if (kycRes.status === "fulfilled") setKyc(kycRes.value.kyc);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const frozen = wallet ? parseFloat(wallet.frozen) : 0;
  const sym = currencySymbol();
  const kycStatus = kyc?.status || "NOT_STARTED";

  const totalDeposits = transactions
    .filter((t) => t.type === "DEPOSIT" && t.status === "COMPLETED")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === "WITHDRAWAL" && t.status === "COMPLETED")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;

  // Build chart data — last 7 days balance progression
  const chartData = (() => {
    const completed = transactions
      .filter((t) => t.status === "COMPLETED")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let runningBalance = 0;
    const dailyMap = new Map<string, number>();

    for (const tx of completed) {
      const amt = parseFloat(tx.amount);
      if (tx.type === "DEPOSIT") runningBalance += amt;
      else runningBalance -= amt;
      const day = formatDate(tx.createdAt);
      dailyMap.set(day, runningBalance);
    }

    // If no transactions, show zero
    if (dailyMap.size === 0) {
      return [{ day: "Today", balance: 0 }];
    }

    return Array.from(dailyMap.entries()).map(([day, bal]) => ({ day, balance: bal }));
  })();

  const recentTx = transactions.slice(0, 4);

  const kycBadge = () => {
    if (kycStatus === "APPROVED") return { label: "Verified", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: IconShieldCheck };
    if (kycStatus === "PENDING") return { label: "Under Review", color: "text-amber-500", bg: "bg-amber-500/10", icon: IconClock };
    if (kycStatus === "REJECTED") return { label: "Rejected", color: "text-red-500", bg: "bg-red-500/10", icon: IconShield };
    return { label: "Not Started", color: "text-muted-foreground", bg: "bg-muted", icon: IconAlertCircle };
  };

  const badge = kycBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="space-y-6">
      {/* KYC Banners */}
      {(kycStatus === "NOT_STARTED" || kycStatus === "REJECTED") && (
        <div className="flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <IconShield className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Complete Your KYC Verification</h3>
            <p className="text-sm text-muted-foreground">You need to complete KYC to deposit and withdraw funds.</p>
          </div>
          <Link href="/dashboard/kyc" className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors btn-glow btn-glow-hover">
            Complete KYC
          </Link>
        </div>
      )}

      {kycStatus === "PENDING" && (
        <div className="flex items-center gap-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
          <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
            <IconClock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">KYC Under Review</h3>
            <p className="text-sm text-muted-foreground">Your identity verification is being reviewed. This usually takes 12-24 working hours.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s your account overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Card + Stats */}
        <div className="space-y-4">
          {/* User Profile Card */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-brand/10 flex items-center justify-center text-lg font-bold text-brand">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base font-bold text-foreground truncate">{user?.name || "User"}</h3>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium text-foreground capitalize">{user?.role?.toLowerCase() || "User"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">KYC Status</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${badge.color}`}>
                  <BadgeIcon className="h-3.5 w-3.5" /> {badge.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Currency</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-500">
                  $ USD
                  {wallet?.currency && <IconLock className="h-3 w-3 opacity-40" />}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium text-foreground text-xs">
                  {user ? new Date((user as unknown as Record<string, string>).createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-2">Quick Stats</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Deposits</span>
              <span className="text-sm font-bold text-emerald-500">{sym}{totalDeposits.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Withdrawals</span>
              <span className="text-sm font-bold text-foreground">{sym}{totalWithdrawals.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Pending Requests</span>
              <span className={`text-sm font-bold ${pendingCount > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                {pendingCount}
              </span>
            </div>
            {frozen > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Frozen</span>
                <span className="text-sm font-bold text-muted-foreground">{sym}{frozen.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Balance + Chart + Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Balance Card */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="font-display text-4xl font-bold tracking-tight mt-1">
                  <span className="text-gradient">{sym}{balance.toFixed(2)}</span>
                </p>
              </div>
              <Link href="/dashboard/wallet" className="flex items-center gap-2 rounded-lg btn-glow btn-glow-hover px-4 py-2 text-sm font-semibold text-white transition-all">
                <IconWallet className="h-4 w-4" /> Wallet
              </Link>
            </div>

            {/* Balance Chart */}
            <div className="h-48">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.gradientStart} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.gradientStart} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: chartColors.axis }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `${sym}${v}`} />
                    <Tooltip
                      contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: "0.75rem", fontSize: 12, color: chartColors.tooltipText }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [`${sym}${Number(value).toFixed(2)}`, "Balance"]}
                    />
                    <Area type="monotone" dataKey="balance" stroke={chartColors.stroke} strokeWidth={2} fill="url(#balGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading chart...</div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
              <Link href="/dashboard/wallet" className="text-xs font-medium text-brand hover:underline">View All</Link>
            </div>
            {recentTx.length === 0 ? (
              <div className="py-8 text-center">
                <IconWallet className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
                <Link href="/dashboard/wallet" className="text-xs text-brand hover:underline mt-1 inline-block">Add Funds</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTx.map((tx) => {
                  const st = statusConfig[tx.status] || statusConfig.PENDING;
                  const StIcon = st.icon;
                  const isDeposit = tx.type === "DEPOSIT";
                  return (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className={`grid h-10 w-10 place-items-center rounded-full shrink-0 ${isDeposit ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                        {isDeposit
                          ? <IconArrowDownLeft className="h-5 w-5 text-emerald-500" />
                          : <IconArrowUpRight className="h-5 w-5 text-amber-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{isDeposit ? "Deposit" : "Withdrawal"}</p>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${st.bg} ${st.color}`}>
                            <StIcon className="h-2.5 w-2.5" /> {st.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(tx.createdAt)}</p>
                      </div>
                      <p className={`text-sm font-bold ${isDeposit ? "text-emerald-500" : "text-foreground"}`}>
                        {isDeposit ? "+" : "-"}{sym}{parseFloat(tx.amount).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
