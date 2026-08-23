"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import {
  walletAPI, kycAPI, referralAPI, indexAPI,
  type WalletData, type TransactionData, type KycData, type ReferralDashboardStats,
  type ReferralEarningsBreakdown, type IndexInvestment,
} from "@/lib/api";
import {
  IconWallet, IconShieldCheck, IconShield, IconClock,
  IconArrowUpRight, IconArrowDownLeft, IconLoader2, IconLock,
  IconAlertCircle, IconCheck, IconX, IconUserPlus, IconUsers,
  IconTrendingUp, IconInfoCircle, IconChartLine, IconGift,
} from "@tabler/icons-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralDashboardStats | null>(null);
  const [earnings, setEarnings] = useState<ReferralEarningsBreakdown | null>(null);
  const [levelRates, setLevelRates] = useState<number[]>([]);
  const [activeInvestment, setActiveInvestment] = useState<IndexInvestment | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Chart colors — the app is light-mode only (dark mode is force-disabled),
  // so these are fixed rather than theme-conditional.
  const chartColors = useMemo(() => ({
    grid: "rgba(0,0,0,0.06)",
    axis: "rgba(0,0,0,0.4)",
    tooltipBg: "#ffffff",
    tooltipBorder: "rgba(0,0,0,0.1)",
    tooltipText: "#1e293b",
    stroke: "#00A94F",
    gradientStart: "#00A94F",
  }), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, txRes, kycRes, refRes, earnRes, indexRes, investRes] = await Promise.allSettled([
          walletAPI.getWallet(),
          walletAPI.getTransactions(),
          kycAPI.getStatus(),
          referralAPI.getMyStats(),
          referralAPI.getEarningsBreakdown(),
          indexAPI.getData(),
          indexAPI.getMyInvestments(),
        ]);
        if (walletRes.status === "fulfilled") setWallet(walletRes.value.wallet);
        if (txRes.status === "fulfilled") setTransactions(txRes.value.transactions);
        if (kycRes.status === "fulfilled") setKyc(kycRes.value.kyc);
        if (refRes.status === "fulfilled") setReferralStats(refRes.value.stats);
        if (earnRes.status === "fulfilled") setEarnings(earnRes.value);
        if (indexRes.status === "fulfilled") setLevelRates(indexRes.value.referralLevels || []);
        if (investRes.status === "fulfilled") {
          setActiveInvestment(investRes.value.investments.find((i) => i.status === "ACTIVE") || null);
        }
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
  const bonusBalance = wallet ? parseFloat(wallet.bonusBalance) : 0;
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
        <Card className="flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 border-amber-500/30 bg-amber-500/10 py-4 sm:py-5 px-4 sm:px-5 flex shadow-sm">
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <IconShield className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Complete Your KYC Verification</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">You need to complete KYC to deposit and withdraw funds.</p>
          </div>
          <Link href="/dashboard/kyc" className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors btn-glow btn-glow-hover w-full sm:w-auto text-center">
            Complete KYC
          </Link>
        </Card>
      )}

      {kycStatus === "PENDING" && (
        <Card className="flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 border-teal-500/30 bg-teal-500/10 py-4 sm:py-5 px-4 sm:px-5 flex shadow-sm">
          <div className="h-10 w-10 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0">
            <IconClock className="h-5 w-5 text-teal-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">KYC Under Review</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Your identity verification is being reviewed. This usually takes 12-24 working hours.</p>
          </div>
        </Card>
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s your account overview</p>
      </div>

      {/* Top Stats: Wallet / Index / Bonus */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/wallet">
          <Card className="p-4 sm:p-5 gap-0 hover:border-brand/30 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-teal-500/10 shrink-0">
                <IconWallet className="h-5 w-5 text-teal-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Wallet</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{sym}{balance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Available balance</p>
          </Card>
        </Link>

        <Link href="/dashboard/index">
          <Card className="p-4 sm:p-5 gap-0 hover:border-brand/30 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-brand/10 shrink-0">
                <IconChartLine className="h-5 w-5 text-brand" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Index</p>
            </div>
            {activeInvestment ? (
              <>
                <p className="text-2xl font-bold text-foreground">{sym}{parseFloat(activeInvestment.netAmount || activeInvestment.amount).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{activeInvestment.tier.label} · Active</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-muted-foreground">{sym}0.00</p>
                <p className="text-xs text-muted-foreground mt-1">No active investment</p>
              </>
            )}
          </Card>
        </Link>

        <Card className="p-4 sm:p-5 gap-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-amber-500/10 shrink-0">
              <IconGift className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Bonus</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{sym}{bonusBalance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">From referral earnings</p>
          <div className="flex gap-2 mt-3">
            <Link
              href="/dashboard/wallet?action=bonus-add"
              className={`flex-1 text-center rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors min-h-10 flex items-center justify-center ${
                bonusBalance > 0 ? "bg-brand text-white hover:bg-brand/90" : "bg-muted text-muted-foreground pointer-events-none"
              }`}
            >
              Add to Wallet
            </Link>
            <Link
              href="/dashboard/wallet?action=bonus-withdraw"
              className={`flex-1 text-center rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors min-h-10 flex items-center justify-center ${
                bonusBalance > 0 ? "border-border hover:bg-accent text-foreground" : "border-border text-muted-foreground pointer-events-none opacity-60"
              }`}
            >
              Withdraw
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: User Card + Stats */}
        <div className="space-y-4">
          {/* User Profile Card — clickable → Profile */}
          <Link href="/dashboard/profile" className="block">
            <Card className="p-4 sm:p-6 gap-0 hover:border-brand/30 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-brand/10 flex items-center justify-center text-lg font-bold text-brand shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground truncate">{user?.name || "User"}</h3>
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
                  <Badge variant="outline" className={`gap-1 border-transparent ${badge.bg} ${badge.color}`}>
                    <BadgeIcon className="h-3.5 w-3.5" /> {badge.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-500">
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
              <div className="mt-4 pt-3 border-t border-border text-center">
                <span className="text-xs font-medium text-brand hover:text-brand/80 transition-colors">View Profile →</span>
              </div>
            </Card>
          </Link>

          {/* Quick Stats */}
          <Card className="p-4 sm:p-5 gap-3">
            <h3 className="text-sm font-semibold text-foreground mb-1">Quick Stats</h3>
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
          </Card>

          {/* Referral Stats */}
          <Link href="/dashboard/referral" className="block">
            <Card className="p-4 sm:p-5 gap-3 hover:border-brand/30 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <IconUserPlus className="h-4 w-4 text-brand" /> Referrals
                </h3>
                <Badge className="bg-brand/10 text-brand border-transparent">{referralStats?.commissionRate || 2}% commission</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Referrals</span>
                <span className="text-sm font-bold text-foreground">{referralStats?.totalReferrals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Deposited</span>
                <span className="text-sm font-bold text-emerald-500">{referralStats?.deposited || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Earned</span>
                <span className="text-sm font-bold text-brand">{sym}{(referralStats?.totalCommission || 0).toFixed(2)}</span>
              </div>
              <div className="pt-1 text-center">
                <span className="text-[10px] font-medium text-muted-foreground hover:text-brand transition-colors">View Referral Dashboard →</span>
              </div>
            </Card>
          </Link>
        </div>

        {/* Right Column: Balance + Chart + Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Balance Card */}
          <Card className="p-4 sm:p-6 gap-0">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">
                  <span className="text-gradient">{sym}{balance.toFixed(2)}</span>
                </p>
              </div>
              <Link href="/dashboard/wallet" className="flex items-center gap-2 rounded-lg btn-glow btn-glow-hover px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all">
                <IconWallet className="h-4 w-4" /> Wallet
              </Link>
            </div>

            {/* Balance Chart */}
            <div className="h-40 sm:h-48">
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
          </Card>

          {/* Recent Transactions */}
          <Card className="p-4 sm:p-6 gap-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Recent Transactions</h2>
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
                          <Badge variant="outline" className={`gap-1 border-0 text-[10px] px-1.5 py-0.5 ${st.bg} ${st.color}`}>
                            <StIcon className="h-2.5 w-2.5" /> {st.label}
                          </Badge>
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
          </Card>
        </div>
      </div>

      {/* Referral Overview */}
      <Card className="p-4 sm:p-6 gap-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-1.5">
            Referral Overview
            <IconInfoCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </h2>
          <Link href="/dashboard/referral" className="text-xs font-medium text-brand hover:underline">View All</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-brand/10 shrink-0">
              <IconUsers className="h-5 w-5 text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Referrals</p>
              <p className="text-xl font-bold text-foreground">{referralStats?.totalReferrals || 0}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500/10 shrink-0">
              <IconTrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Referral Earnings</p>
              <p className="text-xl font-bold text-foreground">{sym}{(earnings?.totalEarned ?? referralStats?.totalCommission ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {levelRates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <p className="text-sm font-semibold text-foreground">Referral Level Commission</p>
              {(() => {
                const byLevel = earnings?.byLevel || [];
                const maxEarning = Math.max(...levelRates.map((_, i) => byLevel[i] || 0), 1);
                return levelRates.map((rate, i) => {
                  const amount = byLevel[i] || 0;
                  const widthPct = Math.max((amount / maxEarning) * 100, amount > 0 ? 4 : 0);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-xs text-muted-foreground">
                        Level {i + 1} ({rate}%)
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${widthPct}%`, backgroundColor: "#2a78d6" }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-xs font-semibold text-foreground">
                        {sym}{amount.toFixed(0)}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-brand/10 mb-3">
                <IconUsers className="h-10 w-10 text-brand" />
              </div>
              <p className="text-sm font-semibold text-foreground">Keep referring<br />to earn more!</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No referral commission data yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}
