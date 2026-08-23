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
import { indexAPI, kycAPI, type IndexData, type KycData, type IndexInvestment } from "@/lib/api";
import InvestmentBasePopup from "@/components/site/InvestmentBasePopup";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TIER_COLORS = [
  "from-teal-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-green-600 to-emerald-400",
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

type Timeframe = "1W" | "1M" | "6M";
const TIMEFRAMES: { key: Timeframe; label: string; days: number }[] = [
  { key: "1W", label: "1W", days: 7 },
  { key: "1M", label: "1M", days: 30 },
  { key: "6M", label: "6M", days: 182 },
];

// Deterministic pseudo-random so the wiggle stays stable across re-renders
// (same seed -> same curve) instead of jumping around on every fetch.
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function projectGrowth(startPrice: number, returnPercent: number, days: number, startDate: Date, seed = 1) {
  const dailyRate = Math.pow(1 + returnPercent / 100, 1 / days) - 1;
  const points = [];
  const step = days <= 30 ? 1 : Math.round(days / 30);
  // Volatility band scales with the trend size — small moves for small returns,
  // visible zigzag for bigger ones — capped so noise never dwarfs the trend.
  const noiseAmplitude = Math.min(Math.abs(returnPercent) / 100, 0.05);

  let prevPrice = startPrice;
  for (let d = 0; d <= days; d += step) {
    const trendPrice = startPrice * Math.pow(1 + dailyRate, d);
    const wiggle = (seededRandom(seed + d) - 0.5) * 2 * noiseAmplitude;
    const price = d === 0 ? startPrice : Math.max(trendPrice * (1 + wiggle), prevPrice * 0.97);
    prevPrice = price;
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    points.push({
      price,
      dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }
  return points;
}

export default function IndexPage() {
  const [data, setData] = useState<IndexData | null>(null);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [investments, setInvestments] = useState<IndexInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [timeframe, setTimeframe] = useState<Timeframe | null>(null);

  const [investAmount, setInvestAmount] = useState("");
  const [selectedTierId, setSelectedTierId] = useState("");
  const [investLoading, setInvestLoading] = useState(false);
  const [investError, setInvestError] = useState("");
  const [investSuccess, setInvestSuccess] = useState("");

  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState("");
  const [topUpSuccess, setTopUpSuccess] = useState("");

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
      const [indexRes, kycRes, investRes] = await Promise.allSettled([
        indexAPI.getData(),
        kycAPI.getStatus(),
        indexAPI.getMyInvestments(),
      ]);
      if (indexRes.status === "fulfilled") setData(indexRes.value);
      if (kycRes.status === "fulfilled") setKyc(kycRes.value.kyc);
      if (investRes.status === "fulfilled") setInvestments(investRes.value.investments);
    } catch {
      setError("Failed to load index data");
    } finally {
      setLoading(false);
    }
  };

  const kycApproved = kyc?.status === "APPROVED";
  const activeInvestment = investments.find((i) => i.status === "ACTIVE") || null;

  const selectTier = (minAmount: number, tierId?: string) => {
    setInvestAmount(String(minAmount));
    if (tierId) setSelectedTierId(tierId);
    setShowPopup(false);
    localStorage.setItem("orvanta_investment_base_seen", "1");
    setInvestError("");
    setInvestSuccess("");
    document.getElementById("invest-in-index")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleInvest = async () => {
    const amt = parseFloat(investAmount);
    if (!investAmount || isNaN(amt) || amt <= 0) {
      setInvestError("Enter a valid amount");
      return;
    }
    if (!selectedTierId) {
      setInvestError("Please select an investment plan");
      return;
    }
    setInvestLoading(true);
    setInvestError("");
    setInvestSuccess("");
    try {
      await indexAPI.invest(amt, selectedTierId);
      setInvestSuccess("Investment activated successfully!");
      setInvestAmount("");
      setSelectedTierId("");
      await fetchData();
    } catch (err) {
      setInvestError(err instanceof Error ? err.message : "Investment failed");
    } finally {
      setInvestLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amt = parseFloat(topUpAmount);
    if (!topUpAmount || isNaN(amt) || amt <= 0) {
      setTopUpError("Enter a valid amount");
      return;
    }
    setTopUpLoading(true);
    setTopUpError("");
    setTopUpSuccess("");
    try {
      const res = await indexAPI.topUp(amt);
      setTopUpSuccess(res.message);
      setTopUpAmount("");
      setShowTopUp(false);
      await fetchData();
    } catch (err) {
      setTopUpError(err instanceof Error ? err.message : "Failed to add funds");
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    setWithdrawError("");
    try {
      const res = await indexAPI.withdraw();
      setConfirmWithdraw(false);
      setWithdrawSuccess(
        res.wasMature
          ? `$${res.payoutAmount.toFixed(2)} credited to your wallet.`
          : `$${res.payoutAmount.toFixed(2)} credited to your wallet after a $${res.earlyFee.toFixed(2)} early-withdrawal fee.`
      );
      await fetchData();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setWithdrawLoading(false);
    }
  };

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
          <Button asChild size="sm" className="shrink-0 self-start sm:self-auto bg-amber-500 hover:bg-amber-600">
            <Link href="/dashboard/kyc">{kyc?.status === "PENDING" ? "Check KYC Status" : "Complete KYC"}</Link>
          </Button>
        </div>
        <Card className="px-6 py-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
            <IconLock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold">Index Locked</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
            {kyc?.status === "PENDING"
              ? "Your KYC is under review. Index access will be unlocked once approved."
              : "Complete your KYC verification to view index performance and investment returns."}
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
        <Button variant="outline" onClick={fetchData} className="gap-2">
          <IconRefresh className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const { tiers, activeTier, walletBalance, maintenanceFeePercent, earlyWithdrawalPercent: earlyWithdrawalPercentRaw, maturityWithdrawalFee: maturityWithdrawalFeeRaw, priceHistory, currentPrice, manager } = data || {};
  const priceUp = (currentPrice?.changePercent ?? 0) >= 0;
  const balance = walletBalance || 0;
  const feePercent = maintenanceFeePercent ?? 5;
  const earlyWithdrawalPercent = earlyWithdrawalPercentRaw ?? 17;
  const maturityWithdrawalFee = maturityWithdrawalFeeRaw ?? 2;
  const investAmountNum = parseFloat(investAmount) || 0;
  const matchingTiers = (tiers || []).filter(
    (t) => t.isActive && investAmountNum >= parseFloat(t.minAmount) && investAmountNum <= parseFloat(t.maxAmount)
  );

  const tierForProjection = activeInvestment?.tier;
  const timeframeReturn = (tf: Timeframe) => {
    if (!tierForProjection) return 0;
    if (tf === "1W") return parseFloat(tierForProjection.weeklyReturn);
    if (tf === "1M") return parseFloat(tierForProjection.monthlyReturn);
    return parseFloat(tierForProjection.halfYearlyReturn);
  };
  const activeFrame = TIMEFRAMES.find((t) => t.key === timeframe);
  const projectionSeed = activeInvestment
    ? Array.from(activeInvestment.id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
    : 1;
  const projectionStartDate = activeInvestment ? new Date(activeInvestment.activatedAt) : new Date();
  const chartData =
    timeframe && activeFrame && tierForProjection
      ? projectGrowth(currentPrice?.price || 0, timeframeReturn(timeframe), activeFrame.days, projectionStartDate, projectionSeed)
      : priceHistory || [];

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
            <Button variant="outline" size="sm" onClick={() => setShowPopup(true)} className="gap-1.5">
              <IconInfoCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Investment Base</span>
            </Button>
            <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 text-xs font-bold">
              <IconShieldCheck className="h-3.5 w-3.5" /> KYC Verified
            </Badge>
            <Badge variant="outline" className="sm:hidden gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
              <IconShieldCheck className="h-3 w-3" /> Verified
            </Badge>
            <Button variant="outline" size="icon" onClick={fetchData} className="size-9">
              <IconRefresh className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Wallet Balance + Tier Banner */}
        <Card className="p-4 sm:p-5 gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shrink-0">
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
        </Card>

        {/* Invest in Index */}
        <Card id="invest-in-index" className="p-4 sm:p-6 gap-0">
          <h2 className="font-display text-base sm:text-lg font-semibold mb-4">Invest in Index</h2>

          {activeInvestment ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Active Investment</p>
                  <p className="text-lg font-bold text-emerald-500 mt-0.5">
                    ${parseFloat(activeInvestment.netAmount || activeInvestment.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Plan: <span className="font-medium text-foreground">{activeInvestment.tier.label} · {activeInvestment.tier.durationMonths} months</span>
                  </p>
                  {parseFloat(activeInvestment.feeAmount) > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      ${parseFloat(activeInvestment.amount).toFixed(2)} deposited − ${parseFloat(activeInvestment.feeAmount).toFixed(2)} maintenance fee
                    </p>
                  )}
                  {activeInvestment.maturesAt && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Matures on {new Date(activeInvestment.maturesAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold">
                  <IconShieldCheck className="h-3.5 w-3.5" /> ACTIVE
                </Badge>
              </div>

              {topUpSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 mt-3">
                  <IconShieldCheck className="h-3.5 w-3.5 shrink-0" /> {topUpSuccess}
                </div>
              )}
              {withdrawError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive mt-3">
                  <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {withdrawError}
                </div>
              )}

              {!confirmWithdraw && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => { setShowTopUp((v) => !v); setTopUpError(""); setTopUpSuccess(""); }}
                    className="btn-glow btn-glow-hover"
                  >
                    {showTopUp ? "Cancel" : "Add More Funds"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmWithdraw(true)}
                  >
                    Withdraw Investment
                  </Button>
                </div>
              )}

              {showTopUp && !confirmWithdraw && (
                <div className="mt-3 rounded-lg border border-border bg-background px-3 py-3 space-y-2">
                  {topUpError && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                      <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {topUpError}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Add funds to your existing <strong>{activeInvestment.tier.label}</strong> investment. Same {feePercent}% maintenance fee applies.
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="Amount to add"
                      className="pl-7"
                    />
                  </div>
                  <Button
                    onClick={handleTopUp}
                    disabled={topUpLoading || balance <= 0}
                    className="w-full"
                  >
                    {topUpLoading ? "Adding..." : "Confirm Add Funds"}
                  </Button>
                </div>
              )}

              {confirmWithdraw && (
                <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-3">
                  {activeInvestment.maturesAt && new Date() < new Date(activeInvestment.maturesAt) ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      This investment hasn&apos;t matured yet. Withdrawing now applies a{" "}
                      <strong>{earlyWithdrawalPercent}% early-withdrawal fee</strong>{" "}
                      (≈${((parseFloat(activeInvestment.netAmount) * earlyWithdrawalPercent) / 100).toFixed(2)}).
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      This investment has matured. A <strong>${maturityWithdrawalFee.toFixed(2)} withdrawal fee</strong> will be applied.
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleWithdraw}
                      disabled={withdrawLoading}
                    >
                      {withdrawLoading ? "Withdrawing..." : "Confirm Withdrawal"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setConfirmWithdraw(false); setWithdrawError(""); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <IconShieldCheck className="h-3.5 w-3.5 shrink-0" /> {withdrawSuccess}
                </div>
              )}
              {investError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {investError}
                </div>
              )}
              {investSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <IconShieldCheck className="h-3.5 w-3.5 shrink-0" /> {investSuccess}
                </div>
              )}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={investAmount}
                  onChange={(e) => { setInvestAmount(e.target.value); setSelectedTierId(""); }}
                  placeholder="Enter amount to invest"
                  className="pl-7"
                />
              </div>

              {investAmountNum > 0 && (
                matchingTiers.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Choose a plan</p>
                    {matchingTiers.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTierId(t.id)}
                        role="button"
                        className={`rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${selectedTierId === t.id ? "border-brand bg-brand/5" : "border-border hover:bg-accent"}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">{t.label}</p>
                          <span className="text-xs font-bold text-brand">{t.durationMonths} months</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-[11px] text-muted-foreground">{parseFloat(t.weeklyReturn).toFixed(2)}% / week</span>
                          <span className="text-[11px] text-muted-foreground">{parseFloat(t.halfYearlyReturn).toFixed(2)}% / 6mo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No plans available for this amount.</p>
                )
              )}

              <Button
                onClick={handleInvest}
                disabled={investLoading || balance <= 0 || !selectedTierId}
                className="w-full btn-glow btn-glow-hover gap-2"
              >
                {investLoading ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Investing...
                  </>
                ) : (
                  "Invest Now"
                )}
              </Button>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {feePercent}% fee for maintenance
                </p>
                {investAmountNum > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    ${investAmountNum.toFixed(2)} − ${((investAmountNum * feePercent) / 100).toFixed(2)} fee = $
                    {(investAmountNum - (investAmountNum * feePercent) / 100).toFixed(2)} invested
                  </p>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Withdrawing before your plan matures charges a {earlyWithdrawalPercent}% fee. Withdrawing after maturity charges a flat ${maturityWithdrawalFee.toFixed(2)} fee.
              </p>
              <p className="text-xs text-muted-foreground">
                Amount is deducted from your wallet balance (${balance.toFixed(2)} available) and cannot exceed it.
              </p>
            </div>
          )}
        </Card>

        {/* Index Price Card + Chart */}
        <Card className="p-4 sm:p-6 gap-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="font-display text-lg sm:text-xl font-bold">ORVANTA Index</h2>
                <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium tracking-wider uppercase">ORVI</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">CURRENT INDEX PRICE</p>
              <div className="flex items-center gap-2 sm:gap-3 mt-1">
                <span className="font-display text-xl sm:text-2xl font-bold">${currentPrice?.price?.toFixed(2) || "0.00"}</span>
                <Badge variant="outline" className={`gap-1 border-0 text-[10px] sm:text-xs font-bold ${priceUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                  {priceUp ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
                  ${Math.abs(currentPrice?.changeAmount || 0).toFixed(2)} ({Math.abs(currentPrice?.changePercent || 0).toFixed(2)}%)
                </Badge>
              </div>
            </div>
            <span className="relative inline-flex items-center gap-1 rounded-lg bg-red-500 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white shrink-0">
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              SOLD OUT
            </span>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2 mt-4">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
              <button
                onClick={() => setTimeframe(null)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${!timeframe ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"}`}
              >
                History
              </button>
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => setTimeframe(tf.key)}
                  disabled={!tierForProjection}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${timeframe === tf.key ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"}`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            {!tierForProjection && (
              <span className="text-[11px] text-muted-foreground">Invest to unlock return projections</span>
            )}
          </div>

          <div className="h-[200px] sm:h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="idxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A94F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00A94F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                <XAxis dataKey="dateLabel" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "rgba(128,128,128,0.7)" }} />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[
                    (min: number) => min - (min * 0.001 || 0.0001),
                    (max: number) => max + (max * 0.001 || 0.0001),
                  ]}
                  tickFormatter={(v) => `$${v.toFixed(4)}`}
                  tick={{ fill: "rgba(128,128,128,0.7)" }}
                  width={64}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="price" stroke="#00A94F" strokeWidth={2} fillOpacity={1} fill="url(#idxGrad)" dot={{ r: 3, fill: "#00A94F", strokeWidth: 2, stroke: "var(--card)" }} activeDot={{ r: 5, fill: "#00A94F", strokeWidth: 2, stroke: "var(--card)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Investment Base Section — On Page */}
        <Card className="p-4 sm:p-6 gap-0">
          <div className="text-center mb-6">
            <p className="text-xs text-brand font-semibold uppercase tracking-widest mb-1">ORVANTA Financial</p>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Investment Base</h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-brand to-brand-2 mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(tiers || []).filter((t) => t.isActive).map((item, i) => (
              <div
                key={item.id}
                onClick={() => selectTier(parseFloat(item.minAmount), item.id)}
                role="button"
                className="group relative rounded-xl border border-border bg-background/50 p-4 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${TIER_COLORS[i % TIER_COLORS.length]} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-bold tracking-wide text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${parseFloat(item.minAmount).toLocaleString()} - ${parseFloat(item.maxAmount).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-brand">
                        <IconTrendingUp className="h-3 w-3" /> {parseFloat(item.weeklyReturn).toFixed(2)}% / week
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <IconClock className="h-3 w-3" /> {item.durationMonths} months
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(!tiers || tiers.filter((t) => t.isActive).length === 0) && (
              <p className="col-span-full text-center text-sm text-muted-foreground py-6">
                No investment tiers available right now.
              </p>
            )}
          </div>
        </Card>

        {/* Index Manager */}
        {manager && (
          <Card className="p-4 sm:p-6 gap-0">
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
          </Card>
        )}
      </div>

      {/* Investment Base Popup */}
      {showPopup && (
        <InvestmentBasePopup
          onClose={() => { setShowPopup(false); localStorage.setItem("orvanta_investment_base_seen", "1"); }}
          onSelectTier={selectTier}
        />
      )}
    </>
  );
}
