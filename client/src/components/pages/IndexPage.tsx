"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconLoader2, IconAlertCircle, IconLock, IconShieldCheck,
  IconTrendingUp, IconTrendingDown, IconUser,
  IconRefresh, IconWallet, IconInfoCircle,
  IconClock, IconCircleCheck,
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
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const [topUpTargetId, setTopUpTargetId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState("");
  const [topUpSuccess, setTopUpSuccess] = useState("");
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);

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
  const activeInvestments = investments.filter((i) => i.status === "ACTIVE");
  const hasAnyInvestment = investments.length > 0;

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
    if (!topUpTargetId) return;
    const amt = parseFloat(topUpAmount);
    if (!topUpAmount || isNaN(amt) || amt <= 0) {
      setTopUpError("Enter a valid amount");
      return;
    }
    setTopUpLoading(true);
    setTopUpError("");
    setTopUpSuccess("");
    try {
      const res = await indexAPI.topUp(amt, topUpTargetId);
      setTopUpSuccess(res.message);
      setTopUpAmount("");
      setTopUpTargetId(null);
      await fetchData();
    } catch (err) {
      setTopUpError(err instanceof Error ? err.message : "Failed to add funds");
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTargetId) return;
    setWithdrawLoading(true);
    setWithdrawError("");
    try {
      const res = await indexAPI.withdraw(withdrawTargetId);
      setWithdrawTargetId(null);
      setWithdrawSuccess(
        res.wasMature
          ? `$${res.payoutAmount.toFixed(2)} credited to your wallet.`
          : `$${res.payoutAmount.toFixed(2)} credited to your wallet after a $${res.withdrawalFee.toFixed(2)} early-exit fee.`
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
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Grow your money by investing in a plan — track it here.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <div className="flex items-start sm:items-center gap-3 flex-1">
            <IconAlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">One quick step first: verify your identity</p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">This keeps your account and funds secure. It only takes a couple of minutes.</p>
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
          <h2 className="font-display text-xl font-semibold">Investing is Locked for Now</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
            {kyc?.status === "PENDING"
              ? "We're reviewing your documents. This unlocks automatically once your KYC is approved."
              : "Verify your identity (KYC) to unlock investing and start growing your money."}
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

  const { tiers, walletBalance, priceHistory, currentPrice, manager } = data || {};
  const priceUp = (currentPrice?.changePercent ?? 0) >= 0;
  const balance = walletBalance || 0;
  const investAmountNum = parseFloat(investAmount) || 0;
  const activeTiers = (tiers || []).filter((t) => t.isActive);
  const matchingTiers = activeTiers.filter(
    (t) => investAmountNum >= parseFloat(t.minAmount) && investAmountNum <= parseFloat(t.maxAmount)
  );
  const selectedTier = activeTiers.find((t) => t.id === selectedTierId) || null;

  // Chart projects off the most recently activated active investment, if any.
  const latestActiveInvestment = activeInvestments.length > 0
    ? [...activeInvestments].sort((a, b) => new Date(b.activatedAt).getTime() - new Date(a.activatedAt).getTime())[0]
    : null;
  const tierForProjection = latestActiveInvestment?.tier;
  const timeframeReturn = (tf: Timeframe) => {
    if (!tierForProjection) return 0;
    if (tf === "1W") return parseFloat(tierForProjection.weeklyReturn);
    if (tf === "1M") return parseFloat(tierForProjection.monthlyReturn);
    return parseFloat(tierForProjection.halfYearlyReturn);
  };
  const activeFrame = TIMEFRAMES.find((t) => t.key === timeframe);
  const projectionSeed = latestActiveInvestment
    ? Array.from(latestActiveInvestment.id).reduce((sum: number, ch: string) => sum + ch.charCodeAt(0), 0)
    : 1;
  const projectionStartDate = latestActiveInvestment ? new Date(latestActiveInvestment.activatedAt) : new Date();
  const chartData =
    timeframe && activeFrame && tierForProjection
      ? projectGrowth(currentPrice?.price || 0, timeframeReturn(timeframe), activeFrame.days, projectionStartDate, projectionSeed)
      : priceHistory || [];

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">ORVANTA Index</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              {hasAnyInvestment ? "Track your investments and grow your money further." : "Grow your money — pick a plan and invest in a few taps."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 text-xs font-bold">
              <IconShieldCheck className="h-3.5 w-3.5" /> KYC Verified
            </Badge>
            <Badge variant="outline" className="sm:hidden gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
              <IconShieldCheck className="h-3 w-3" /> Verified
            </Badge>
            <Button variant="outline" size="icon" onClick={fetchData} className="size-9 shrink-0">
              <IconRefresh className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Simple 3-step guide — only shown to first-time / no-investment users */}
        {!hasAnyInvestment && (
          <Card className="p-4 sm:p-5 gap-0 border-brand/20 bg-brand/[0.03]">
            <p className="text-sm font-semibold text-foreground mb-3">How investing works, in 3 steps</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { n: "1", title: "Add money to your Wallet", desc: "Deposit funds first — you invest from your Wallet balance." },
                { n: "2", title: "Pick a plan below", desc: "Each plan shows its return, duration, and fees upfront." },
                { n: "3", title: "Invest & track it here", desc: "Watch your investment grow until it matures, then withdraw." },
              ].map((s) => (
                <div key={s.n} className="flex gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-white text-xs font-bold">{s.n}</div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Wallet Balance */}
        <Card className="p-4 sm:p-5 gap-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shrink-0">
                <IconWallet className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Your Wallet Balance</p>
                <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
                  <span className="text-gradient">${balance.toFixed(2)}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">This is the money available to invest</p>
              </div>
            </div>
            {balance <= 0 && (
              <Button asChild size="sm" className="shrink-0 btn-glow btn-glow-hover">
                <Link href="/dashboard/wallet">Add Funds</Link>
              </Button>
            )}
          </div>
        </Card>

        {/* Active / Matured Investments */}
        {activeInvestments.length > 0 && (
          <Card className="p-4 sm:p-6 gap-0">
            <h2 className="font-display text-base sm:text-lg font-semibold mb-1">
              Your Investments ({activeInvestments.length})
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Each one grows independently and matures on its own date.</p>

            {withdrawSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 mb-3">
                <IconShieldCheck className="h-3.5 w-3.5 shrink-0" /> {withdrawSuccess}
              </div>
            )}
            {topUpSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 mb-3">
                <IconShieldCheck className="h-3.5 w-3.5 shrink-0" /> {topUpSuccess}
              </div>
            )}

            <div className="space-y-3">
              {activeInvestments.map((inv) => {
                const isMature = inv.maturesAt ? new Date() >= new Date(inv.maturesAt) : false;
                const exitPercent = isMature ? parseFloat(inv.tier.exitFeePercent) : parseFloat(inv.tier.earlyExitFeePercent);
                const estExitFee = (parseFloat(inv.netAmount) * exitPercent) / 100;
                const isTopUpTarget = topUpTargetId === inv.id;
                const isWithdrawTarget = withdrawTargetId === inv.id;

                return (
                  <div key={inv.id} className={`rounded-xl border p-4 ${isMature ? "border-brand/30 bg-brand/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{inv.tier.label}</p>
                        <p className={`text-lg font-bold mt-0.5 ${isMature ? "text-brand" : "text-emerald-500"}`}>
                          ${parseFloat(inv.netAmount || inv.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration: <span className="font-medium text-foreground">{inv.tier.durationMonths} months</span>
                        </p>
                        {parseFloat(inv.feeAmount) > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            ${parseFloat(inv.amount).toFixed(2)} invested − ${parseFloat(inv.feeAmount).toFixed(2)} fee at start
                          </p>
                        )}
                        {inv.maturesAt && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {isMature ? "Ready to withdraw since" : "Matures on"} {new Date(inv.maturesAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`gap-1 shrink-0 font-bold ${isMature ? "border-brand/30 bg-brand/10 text-brand" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"}`}
                      >
                        {isMature ? <IconCircleCheck className="h-3.5 w-3.5" /> : <IconClock className="h-3.5 w-3.5" />}
                        {isMature ? "MATURED — READY" : "GROWING"}
                      </Badge>
                    </div>

                    {isWithdrawTarget && withdrawError && (
                      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive mt-3">
                        <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {withdrawError}
                      </div>
                    )}

                    {!isWithdrawTarget && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            setTopUpTargetId(isTopUpTarget ? null : inv.id);
                            setTopUpError("");
                            setTopUpSuccess("");
                          }}
                          className="btn-glow btn-glow-hover"
                        >
                          {isTopUpTarget ? "Cancel" : "Add More Funds"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setWithdrawTargetId(inv.id); setWithdrawError(""); }}
                        >
                          Withdraw
                        </Button>
                      </div>
                    )}

                    {isTopUpTarget && !isWithdrawTarget && (
                      <div className="mt-3 rounded-lg border border-border bg-background px-3 py-3 space-y-2">
                        {topUpError && (
                          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                            <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {topUpError}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Add funds to this <strong>{inv.tier.label}</strong> investment (up to ${inv.tier.maxAmount} total). Same {parseFloat(inv.tier.maintenanceFeePercent).toFixed(2)}% fee applies, just like your first investment.
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

                    {isWithdrawTarget && (
                      <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-3">
                        {!isMature ? (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            This hasn&apos;t matured yet. Withdrawing early charges a{" "}
                            <strong>{exitPercent.toFixed(2)}% fee</strong>{" "}
                            (about ${estExitFee.toFixed(2)}). Waiting until the maturity date avoids most of this fee.
                          </p>
                        ) : (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            This has matured — you can withdraw now. A small <strong>{exitPercent.toFixed(2)}% exit fee</strong> (about ${estExitFee.toFixed(2)}) applies, then the rest goes straight to your wallet.
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
                            onClick={() => { setWithdrawTargetId(null); setWithdrawError(""); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Invest / Choose a Plan */}
        <Card id="invest-in-index" className="p-4 sm:p-6 gap-0">
          <h2 className="font-display text-base sm:text-lg font-semibold mb-1">
            {hasAnyInvestment ? "Start a New Investment" : "Choose a Plan"}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {hasAnyInvestment
              ? "You can hold investments in several plans at once — each grows and matures on its own."
              : "Type how much you want to invest, and we'll show you which plans it qualifies for."}
          </p>

          <div className="space-y-3">
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

            {/* Plan list — always visible so users can browse without typing first */}
            {activeTiers.length > 0 ? (
              <div className="space-y-3">
                {activeTiers.map((t, i) => {
                  const isSelected = selectedTierId === t.id;
                  const isEligible = investAmountNum > 0
                    ? investAmountNum >= parseFloat(t.minAmount) && investAmountNum <= parseFloat(t.maxAmount)
                    : true;
                  return (
                    <div
                      key={t.id}
                      className={`rounded-2xl border-2 p-4 sm:p-5 transition-colors ${
                        isSelected ? "border-brand bg-brand/5" : investAmountNum > 0 && !isEligible ? "border-border opacity-50" : "border-border"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${TIER_COLORS[i % TIER_COLORS.length]} text-white text-sm font-bold shadow-sm`}>
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-bold text-foreground break-words">{t.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{t.tagline || `For amounts between $${parseFloat(t.minAmount).toLocaleString()} and $${parseFloat(t.maxAmount).toLocaleString()}`}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTierId(t.id);
                            if (!investAmount) setInvestAmount(t.minAmount);
                          }}
                          disabled={investAmountNum > 0 && !isEligible}
                          className={`w-full sm:w-auto shrink-0 gap-1.5 font-semibold ${isSelected ? "" : "btn-glow btn-glow-hover"}`}
                          variant={isSelected ? "outline" : "default"}
                        >
                          {isSelected ? (
                            <>
                              <IconCircleCheck className="h-4 w-4" /> Selected
                            </>
                          ) : (
                            "Choose Plan"
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-4 pt-4 border-t border-border/60">
                        <div className="text-center px-0.5">
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">Return (up to)</p>
                          <p className="text-xs sm:text-sm font-bold text-brand mt-0.5">{parseFloat(t.monthlyReturn).toFixed(2)}%/mo</p>
                        </div>
                        <div className="text-center px-0.5 border-x border-border/60">
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">Duration</p>
                          <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">{t.durationMonths} months</p>
                        </div>
                        <div className="text-center px-0.5">
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">Min Invest</p>
                          <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">${parseFloat(t.minAmount).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No investment plans available right now.</p>
            )}

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                placeholder="Enter amount to invest"
                className="pl-7"
              />
            </div>
            {investAmountNum > 0 && matchingTiers.length === 0 && (
              <p className="text-xs text-amber-600">No plan matches this amount — check the ranges above.</p>
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
              ) : balance <= 0 ? (
                "Add funds to your wallet first"
              ) : !selectedTierId ? (
                "Pick a plan above to continue"
              ) : (
                "Invest Now"
              )}
            </Button>

            {selectedTier && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  A {parseFloat(selectedTier.maintenanceFeePercent).toFixed(2)}% one-time fee applies when you invest
                </p>
                {investAmountNum > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    ${investAmountNum.toFixed(2)} − ${((investAmountNum * parseFloat(selectedTier.maintenanceFeePercent)) / 100).toFixed(2)} fee = $
                    {(investAmountNum - (investAmountNum * parseFloat(selectedTier.maintenanceFeePercent)) / 100).toFixed(2)} actually invested
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">
                  Withdrawing early costs {parseFloat(selectedTier.earlyExitFeePercent).toFixed(2)}%. Waiting until it matures costs only {parseFloat(selectedTier.exitFeePercent).toFixed(2)}%.
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Amount comes out of your wallet balance (${balance.toFixed(2)} available).
            </p>
          </div>
        </Card>

        {/* Index Price Card + Chart */}
        <Card className="p-4 sm:p-6 gap-0">
          <div className="flex items-start justify-between mb-1 gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h2 className="font-display text-lg sm:text-xl font-bold">ORVANTA Index Price</h2>
                <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium tracking-wider uppercase">ORVI</Badge>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                <span className="font-display text-xl sm:text-2xl font-bold">${currentPrice?.price?.toFixed(2) || "0.00"}</span>
                <Badge variant="outline" className={`gap-1 border-0 text-[10px] sm:text-xs font-bold ${priceUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                  {priceUp ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
                  ${Math.abs(currentPrice?.changeAmount || 0).toFixed(2)} ({Math.abs(currentPrice?.changePercent || 0).toFixed(2)}%)
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {tierForProjection
              ? "This chart shows how your active investment is projected to grow over time."
              : "This chart tracks the Index price history. Invest in a plan to see your own growth projection here."}
          </p>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
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
              <span className="text-[11px] text-muted-foreground">Invest to unlock your own growth projection</span>
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

        {/* Index Manager */}
        {manager && (
          <Card className="p-4 sm:p-6 gap-0">
            <h2 className="font-display text-base sm:text-lg font-semibold mb-4">Index Manager</h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 shrink-0">
                <IconUser className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base text-foreground">{manager.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{manager.title}</p>
                {manager.bio && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">{manager.bio}</p>}
              </div>
            </div>
          </Card>
        )}

        {/* Help footer */}
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-4 py-3">
          <IconInfoCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Every plan&apos;s fee, return, and duration is shown before you invest — nothing hidden. Need help? Reach out from the{" "}
            <Link href="/dashboard/support" className="text-brand font-medium hover:underline">Support</Link> page.
          </p>
        </div>
      </div>

      {/* Investment Base Popup — first-visit intro only */}
      {showPopup && (
        <InvestmentBasePopup
          onClose={() => { setShowPopup(false); localStorage.setItem("orvanta_investment_base_seen", "1"); }}
          onSelectTier={selectTier}
        />
      )}
    </>
  );
}
