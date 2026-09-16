"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconLoader2, IconAlertCircle, IconShieldCheck,
  IconTrendingUp, IconTrendingDown, IconUser,
  IconRefresh, IconWallet, IconInfoCircle,
  IconClock, IconCircleCheck, IconChartPie,
} from "@tabler/icons-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { indexAPI, kycAPI, type IndexData, type KycData, type IndexInvestment, type FundAllocation } from "@/lib/api";
import InvestmentBasePopup from "@/components/site/InvestmentBasePopup";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/dashboard/SectionCard";
import { KycLockedState } from "@/components/dashboard/LockedState";
import { DashboardSkeleton } from "@/components/dashboard/Skeletons";

const TIER_COLORS = [
  "from-navy-600 to-navy-400",
  "from-navy-500 to-gold-700",
  "from-gold-700 to-gold-500",
  "from-gold-600 to-gold-400",
];

// Palette for the fund-allocation pie/legend — brand anchors plus the
// semantic tones, cycled if admin publishes more categories than colors.
const ALLOCATION_COLORS = [
  "var(--brand)",
  "var(--navy-500)",
  "var(--color-success)",
  "var(--brand-glow)",
  "var(--color-info)",
  "var(--navy-400)",
];

function AllocationDonutTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      className="rounded-xl border border-border px-3 py-2 shadow-xl"
      style={{ backgroundColor: "var(--card)", opacity: 1 }}
    >
      <p className="text-xs sm:text-[11px] text-muted-foreground mb-1">{p.name}</p>
      <p className="text-sm font-bold text-foreground">{p.value.toFixed(2)}%</p>
    </div>
  );
}

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-xs sm:text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground">${Number(payload[0].value).toFixed(4)}</p>
    </div>
  );
}

/**
 * Chart ranges.
 *
 * These only trim how many of the API's own `priceHistory` points are drawn —
 * the series is never resampled, interpolated or projected forward. An earlier
 * version of this page synthesised a growth curve from the tier's advertised
 * return plus pseudo-random noise; that is gone, because a simulated line has
 * no business being presented to an investor as the Index price.
 */
type Timeframe = "7D" | "1M" | "3M" | "ALL";
const TIMEFRAMES: { key: Timeframe; label: string; points: number }[] = [
  { key: "7D", label: "7D", points: 7 },
  { key: "1M", label: "1M", points: 30 },
  { key: "3M", label: "3M", points: 90 },
  { key: "ALL", label: "ALL", points: Number.POSITIVE_INFINITY },
];

export default function IndexPage() {
  const [data, setData] = useState<IndexData | null>(null);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [investments, setInvestments] = useState<IndexInvestment[]>([]);
  const [allocations, setAllocations] = useState<FundAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [timeframe, setTimeframe] = useState<Timeframe>("ALL");

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
      const [indexRes, kycRes, investRes, allocRes] = await Promise.allSettled([
        indexAPI.getData(),
        kycAPI.getStatus(),
        indexAPI.getMyInvestments(),
        indexAPI.getFundAllocations(),
      ]);
      if (indexRes.status === "fulfilled") setData(indexRes.value);
      if (kycRes.status === "fulfilled") setKyc(kycRes.value.kyc);
      if (investRes.status === "fulfilled") setInvestments(investRes.value.investments);
      if (allocRes.status === "fulfilled") setAllocations(allocRes.value.allocations);
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
    return <DashboardSkeleton />;
  }

  if (!kycApproved) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
        <PageHeading
          eyebrow="Investments"
          title="ORVANTA Index"
          description="Grow your money by investing in a plan — track it here."
        />
        <KycLockedState
          status={kyc?.status ?? "NOT_STARTED"}
          title="Investing is Locked for Now"
          description="Verify your identity (KYC) to unlock investing and start growing your money."
          pendingDescription="We're reviewing your documents. Investing unlocks automatically once your KYC is approved."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
        <PageHeading eyebrow="Investments" title="ORVANTA Index" />
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          <IconAlertCircle className="size-4 shrink-0" /> {error}
        </div>
        <Button variant="outline" onClick={fetchData} className="gap-2">
          <IconRefresh className="size-4" /> Retry
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

  // The chart is the API's own price history, trimmed to the selected range.
  const fullHistory = priceHistory || [];
  const activeFrame = TIMEFRAMES.find((t) => t.key === timeframe) ?? TIMEFRAMES[3];
  const chartData = Number.isFinite(activeFrame.points)
    ? fullHistory.slice(-activeFrame.points)
    : fullHistory;

  // Change across the plotted window, computed from those same points.
  const windowChange = (() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    if (!first) return null;
    return ((last - first) / first) * 100;
  })();

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-8">
        {/* Header */}
        <PageHeading
          eyebrow="Investments"
          title="ORVANTA Index"
          description={
            hasAnyInvestment
              ? "Track your investments and grow your money further."
              : "Grow your money — pick a plan and invest in a few taps."
          }
          actions={
            <>
              <Badge variant="outline" className="gap-1.5 border-success/25 bg-success-soft px-3 py-1.5 text-success">
                <IconShieldCheck className="size-3.5" /> KYC Verified
              </Badge>
              <Button variant="outline" size="icon" onClick={fetchData} className="size-9 shrink-0" aria-label="Refresh">
                <IconRefresh className="size-4" />
              </Button>
            </>
          }
        />


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
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand text-white text-xs font-bold">{s.n}</div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{s.title}</p>
                    <p className="text-xs sm:text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
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
              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-linear-to-br from-navy-600 to-navy-800 shrink-0">
                <IconWallet className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-sm text-muted-foreground">Your Wallet Balance</p>
                <p className="text-page-title text-foreground mt-0.5">
                  <span className="text-gradient">${balance.toFixed(2)}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">This is the money available to invest</p>
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
              <div className="flex items-center gap-2 rounded-lg border border-success/25 bg-success-soft px-3 py-2 text-xs text-success mb-3">
                <IconShieldCheck className="h-3.5 w-3.5 shrink-0" /> {withdrawSuccess}
              </div>
            )}
            {topUpSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-success/25 bg-success-soft px-3 py-2 text-xs text-success mb-3">
                <IconShieldCheck className="h-3.5 w-3.5 shrink-0" /> {topUpSuccess}
              </div>
            )}

            <div className={`grid grid-cols-1 gap-3 ${activeInvestments.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {activeInvestments.map((inv) => {
                const isMature = inv.maturesAt ? new Date() >= new Date(inv.maturesAt) : false;
                const exitPercent = isMature ? parseFloat(inv.tier.exitFeePercent) : parseFloat(inv.tier.earlyExitFeePercent);
                const estExitFee = (parseFloat(inv.netAmount) * exitPercent) / 100;
                const isTopUpTarget = topUpTargetId === inv.id;
                const isWithdrawTarget = withdrawTargetId === inv.id;

                // Accrued return since activation, computed by compounding the
                // tier's own published weekly return (the same rate shown on
                // Investment Tiers) daily over the real elapsed time — not an
                // invented figure.
                const netAmountNum = parseFloat(inv.netAmount || inv.amount);
                const weeklyReturn = parseFloat(inv.tier.weeklyReturn) || 0;
                const daysElapsed = Math.max(
                  0,
                  (Date.now() - new Date(inv.activatedAt).getTime()) / (24 * 60 * 60 * 1000)
                );
                const dailyRate = Math.pow(1 + weeklyReturn / 100, 1 / 7) - 1;
                const roiPercent = (Math.pow(1 + dailyRate, daysElapsed) - 1) * 100;
                const roiAmount = netAmountNum * (roiPercent / 100);

                return (
                  <div key={inv.id} className={`rounded-xl border p-4 ${isMature ? "border-brand/30 bg-brand/5" : "border-success/25 bg-success-soft"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{inv.tier.label}</p>
                        <p className={`text-lg font-bold mt-0.5 ${isMature ? "text-brand" : "text-success"}`}>
                          ${parseFloat(inv.netAmount || inv.amount).toFixed(2)}
                        </p>
                        {roiPercent > 0 && (
                          <p className="text-xs font-semibold text-success mt-0.5">
                            +${roiAmount.toFixed(2)} (+{roiPercent.toFixed(2)}%)
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration: <span className="font-medium text-foreground">{inv.tier.durationMonths} months</span>
                        </p>
                        {parseFloat(inv.feeAmount) > 0 && (
                          <p className="text-xs sm:text-[11px] text-muted-foreground mt-1">
                            ${parseFloat(inv.amount).toFixed(2)} invested − ${parseFloat(inv.feeAmount).toFixed(2)} fee at start
                          </p>
                        )}
                        {inv.maturesAt && (
                          <p className="text-xs sm:text-[11px] text-muted-foreground mt-1">
                            {isMature ? "Ready to withdraw since" : "Matures on"} {new Date(inv.maturesAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`gap-1 shrink-0 font-bold ${isMature ? "border-brand/30 bg-brand/10 text-brand" : "border-success/25 bg-success-soft text-success"}`}
                      >
                        {isMature ? <IconCircleCheck className="h-3.5 w-3.5" /> : <IconClock className="h-3.5 w-3.5" />}
                        {isMature ? "MATURED — READY" : "GROWING"}
                      </Badge>
                    </div>

                    {isWithdrawTarget && withdrawError && (
                      <div className="flex items-center gap-2 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs text-destructive mt-3">
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
                          <div className="flex items-center gap-2 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs text-destructive">
                            <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {topUpError}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Add funds to this <strong>{inv.tier.label}</strong> investment (up to ${inv.tier.maxAmount} total). Same {parseFloat(inv.tier.maintenanceFeePercent).toFixed(2)}% fee applies, just like your first investment.
                        </p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <Input
                            type="number" inputMode="decimal"
                            min="0"
                            step="0.01"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            placeholder="Amount to add"
                            className="pl-7 pr-16"
                          />
                          <button
                            type="button"
                            onClick={() => setTopUpAmount(String(balance))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-accent/70"
                          >
                            Max
                          </button>
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
                      <div className="mt-3 rounded-lg border border-warning/25 bg-warning-soft px-3 py-3">
                        {!isMature ? (
                          <p className="text-xs text-warning">
                            This hasn&apos;t matured yet. Withdrawing early charges a{" "}
                            <strong>{exitPercent.toFixed(2)}% fee</strong>{" "}
                            (about ${estExitFee.toFixed(2)}). Waiting until the maturity date avoids most of this fee.
                          </p>
                        ) : (
                          <p className="text-xs text-success">
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
            {investSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-success/25 bg-success-soft px-3 py-2 text-xs text-success">
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
                  const selectTierCard = () => {
                    if (isSelected) {
                      // Tap the already-selected card again to deselect it.
                      setSelectedTierId("");
                      setInvestAmount("");
                      return;
                    }
                    setSelectedTierId(t.id);
                    // Switching plans should always work — reset the amount
                    // to the new tier's own minimum rather than leaving a
                    // figure that only fit the old one.
                    setInvestAmount(t.minAmount);
                  };

                  return (
                    <div
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      onClick={selectTierCard}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectTierCard(); } }}
                      className={`rounded-2xl border-2 p-4 sm:p-5 transition-colors cursor-pointer ${isSelected ? "border-brand bg-brand/5" : investAmountNum > 0 && !isEligible ? "border-border opacity-50" : "border-border hover:border-brand/40"
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {t.imageUrl ? (
                            <img
                              src={t.imageUrl}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-border"
                            />
                          ) : (
                            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-linear-to-br ${TIER_COLORS[i % TIER_COLORS.length]} text-white text-sm font-bold shadow-sm`}>
                              {i + 1}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-base font-bold text-foreground break-words">{t.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t.tagline || `For amounts $${parseFloat(t.minAmount).toLocaleString()} ${parseFloat(t.maxAmount) >= 999999999 ? "and above" : `and $${parseFloat(t.maxAmount).toLocaleString()}`}`}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={isSelected ? "default" : "outline"}
                          className={`w-full sm:w-auto shrink-0 justify-center gap-1.5 font-semibold ${isSelected ? "" : "text-muted-foreground"}`}
                        >
                          {isSelected ? (
                            <>
                              <IconCircleCheck className="h-3.5 w-3.5" /> Selected — tap to deselect
                            </>
                          ) : (
                            "Tap to select"
                          )}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-4 pt-4 border-t border-border/60">
                        <div className="text-center px-0.5">
                          <p className="text-xs sm:text-[10px] text-muted-foreground uppercase tracking-wide">Return (up to)</p>
                          <p className="text-xs sm:text-sm font-bold text-brand mt-0.5">{parseFloat(t.monthlyReturn).toFixed(2)}%/mo</p>
                        </div>
                        <div className="text-center px-0.5 border-x border-border/60">
                          <p className="text-xs sm:text-[10px] text-muted-foreground uppercase tracking-wide">Duration</p>
                          <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">{t.durationMonths} months</p>
                        </div>
                        <div className="text-center px-0.5">
                          <p className="text-xs sm:text-[10px] text-muted-foreground uppercase tracking-wide">Min Invest</p>
                          <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">${parseFloat(t.minAmount).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Amount + invest — sits right inside the selected
                          tier's own card, so it's obvious which plan the
                          input applies to instead of being one shared block
                          at the bottom of a long list. */}
                      {isSelected && (
                        <div className="mt-4 space-y-3 border-t border-border/60 pt-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number" inputMode="decimal"
                              min="0"
                              step="0.01"
                              value={investAmount}
                              onChange={(e) => setInvestAmount(e.target.value)}
                              placeholder="Enter amount to invest"
                              className="pl-7 pr-16"
                            />
                            <button
                              type="button"
                              onClick={() => setInvestAmount(String(balance))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-accent/70"
                            >
                              Max
                            </button>
                          </div>
                          {investAmountNum > 0 && matchingTiers.length === 0 && (
                            <p className="text-xs text-warning">No plan matches this amount — check the ranges above.</p>
                          )}
                          {investError && (
                            <div className="flex items-center gap-2 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs text-destructive">
                              <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {investError}
                            </div>
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
                            ) : (
                              "Invest Now"
                            )}
                          </Button>

                          {selectedTier && (
                            <div className="rounded-lg border border-warning/25 bg-warning-soft px-3 py-2">
                              <p className="text-xs text-warning font-medium">
                                A {parseFloat(selectedTier.maintenanceFeePercent).toFixed(2)}% one-time fee applies when you invest
                              </p>
                              {investAmountNum > 0 && (
                                <p className="text-xs sm:text-[11px] text-muted-foreground mt-0.5">
                                  ${investAmountNum.toFixed(2)} − ${((investAmountNum * parseFloat(selectedTier.maintenanceFeePercent)) / 100).toFixed(2)} fee = $
                                  {(investAmountNum - (investAmountNum * parseFloat(selectedTier.maintenanceFeePercent)) / 100).toFixed(2)} actually invested
                                </p>
                              )}
                              <p className="text-xs sm:text-[11px] text-muted-foreground mt-1">
                                Withdrawing early costs {parseFloat(selectedTier.earlyExitFeePercent).toFixed(2)}%. Waiting until it matures costs only {parseFloat(selectedTier.exitFeePercent).toFixed(2)}%.
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Amount comes out of your wallet balance (${balance.toFixed(2)} available).
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No investment plans available right now.</p>
            )}

            {!selectedTierId && activeTiers.length > 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">Pick a plan above to continue</p>
            )}
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
                <Badge variant="outline" className={`gap-1 border-0 text-[10px] sm:text-xs font-bold ${priceUp ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
                  {priceUp ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
                  ${Math.abs(currentPrice?.changeAmount || 0).toFixed(2)} ({Math.abs(currentPrice?.changePercent || 0).toFixed(2)}%)
                </Badge>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Real Index price history as published by ORVANTA — only the prices actually recorded.
            {windowChange !== null && (
              <>
                {" "}
                <span className={windowChange >= 0 ? "text-success" : "text-danger"}>
                  {windowChange >= 0 ? "+" : ""}
                  {windowChange.toFixed(2)}%
                </span>{" "}
                over the selected period.
              </>
            )}
          </p>

          {/* Range selector — trims the real series, nothing more */}
          <div
            role="group"
            aria-label="Chart period"
            className="no-x-overflow mt-4 flex max-w-full gap-0.5 overflow-x-auto rounded-lg border border-border bg-surface-2 p-0.5"
          >
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.key}
                type="button"
                onClick={() => setTimeframe(tf.key)}
                aria-pressed={activeFrame.key === tf.key}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${activeFrame.key === tf.key
                    ? "bg-card text-brand shadow-xs ring-1 ring-brand/20"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="h-[200px] sm:h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="idxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
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
                <Area type="monotone" dataKey="price" stroke="var(--brand)" strokeWidth={2} fillOpacity={1} fill="url(#idxGrad)" dot={{ r: 3, fill: "var(--brand)", strokeWidth: 2, stroke: "var(--card)" }} activeDot={{ r: 5, fill: "var(--brand)", strokeWidth: 2, stroke: "var(--card)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Index Manager + Fund Allocation — shown together, in the open,
            not tucked behind a click. Diversification is exactly what
            admin has published: no category or percentage is invented
            on the client. */}
        {manager && (
          <Card className="p-4 sm:p-6 gap-0">
            <h2 className="font-display text-base sm:text-lg font-semibold mb-4">Index Manager</h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-lg bg-linear-to-br from-brand to-brand-2 shrink-0">
                <IconUser className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base text-foreground">{manager.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{manager.title}</p>
                {manager.bio && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">{manager.bio}</p>}
              </div>
            </div>

            {allocations.length > 0 && (
              <div className="mt-6 border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <IconChartPie className="h-4 w-4 text-brand shrink-0" />
                  <h3 className="font-display text-sm sm:text-base font-semibold text-foreground">How Your Investment Is Diversified</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  When you invest in an Index tier, your funds are strategically allocated across multiple asset classes to reduce risk and maximize returns.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:items-center">
                  <div className="h-52 w-52 sm:h-56 sm:w-56 mx-auto relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocations.map((a) => ({ name: a.label, value: a.percent }))}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="58%"
                          outerRadius="85%"
                          paddingAngle={2}
                          stroke="var(--card)"
                          strokeWidth={2}
                        >
                          {allocations.map((a, i) => (
                            <Cell key={a.id} fill={ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<AllocationDonutTooltip />} wrapperStyle={{ outline: "none", zIndex: 20 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-xs sm:text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                      <p className="text-lg font-bold text-foreground">100%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
                    {allocations.map((a, i) => (
                      <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 p-3">
                        {a.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.imageUrl} alt="" className="size-16 sm:size-20 shrink-0 rounded-lg object-contain bg-card p-1.5 ring-1 ring-border" />
                        ) : (
                          <span
                            aria-hidden
                            className="size-16 sm:size-20 shrink-0 rounded-lg"
                            style={{ backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {a.label} <span className="text-brand">{a.percent.toFixed(0)}%</span>
                          </p>
                          {a.description && (
                            <p className="text-xs sm:text-[11px] text-muted-foreground leading-snug mt-0.5">{a.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {allocations.some((a) => a.details && a.details.length > 0) && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allocations.filter((a) => a.details && a.details.length > 0).map((a) => (
                      <div key={a.id} className="rounded-lg border border-border bg-surface-2/50 p-3.5">
                        <p className="text-xs font-semibold text-foreground mb-2">{a.label}</p>
                        <div className="space-y-1.5">
                          {a.details!.map((d) => (
                            <div key={d.label} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                              <span className="text-xs sm:text-[11px] text-muted-foreground sm:w-28 sm:shrink-0 truncate" title={d.label}>{d.label}</span>
                              <div className="flex flex-1 items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                  <span
                                    className="block h-full rounded-full bg-brand"
                                    style={{ width: `${Math.min(d.percent, 100)}%` }}
                                  />
                                </div>
                                <span className="w-9 shrink-0 text-right text-xs sm:text-[11px] font-medium text-foreground">{d.percent}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Help footer */}
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-4 py-3">
          <IconInfoCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs sm:text-[11px] text-muted-foreground leading-relaxed">
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
