"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IconChartLine,
  IconClock,
  IconCoins,
  IconGift,
  IconTrendingUp,
  IconUser,
  IconWallet,
} from "@tabler/icons-react";

import { useAuth } from "@/lib/AuthContext";
import {
  indexAPI,
  kycAPI,
  referralAPI,
  walletAPI,
  type IndexData,
  type IndexInvestment,
  type KycData,
  type ReferralDashboardStats,
  type ReferralEarningsBreakdown,
  type TransactionData,
  type WalletData,
} from "@/lib/api";

import { Rise, Stagger } from "@/components/shared/motion";
import { PageHeading, SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard, StatRow } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { ReferralCta, ReferralOverview } from "@/components/dashboard/ReferralOverview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { KycBanner, KycStatusPill } from "@/components/dashboard/KycBanner";
import { DashboardSkeleton } from "@/components/dashboard/Skeletons";
import { formatMoney, parseAmount } from "@/components/dashboard/format";

export default function ClientDashboard() {
  const { user } = useAuth();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralDashboardStats | null>(null);
  const [earnings, setEarnings] = useState<ReferralEarningsBreakdown | null>(null);
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [investments, setInvestments] = useState<IndexInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  // Unchanged fetch: the same seven endpoints, still settled independently so a
  // single failing call never blanks the whole dashboard.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, txRes, kycRes, refRes, earnRes, indexRes, investRes] =
          await Promise.allSettled([
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
        if (indexRes.status === "fulfilled") setIndexData(indexRes.value);
        if (investRes.status === "fulfilled") setInvestments(investRes.value.investments);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const balance = wallet ? parseAmount(wallet.balance) : 0;
  const bonusBalance = wallet ? parseAmount(wallet.bonusBalance) : 0;
  const frozen = wallet ? parseAmount(wallet.frozen) : 0;
  const kycStatus = kyc?.status || "NOT_STARTED";

  const activeInvestments = useMemo(
    () => investments.filter((i) => i.status === "ACTIVE"),
    [investments]
  );

  const totalIndexValue = useMemo(
    () =>
      activeInvestments.reduce(
        (sum, i) => sum + parseAmount(i.netAmount || i.amount),
        0
      ),
    [activeInvestments]
  );

  const totalDeposits = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "DEPOSIT" && t.status === "COMPLETED")
        .reduce((sum, t) => sum + parseAmount(t.amount), 0),
    [transactions]
  );

  const totalWithdrawals = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "WITHDRAWAL" && t.status === "COMPLETED")
        .reduce((sum, t) => sum + parseAmount(t.amount), 0),
    [transactions]
  );

  const pendingCount = useMemo(
    () => transactions.filter((t) => t.status === "PENDING").length,
    [transactions]
  );

  const referralEarned = earnings?.totalEarned ?? referralStats?.totalCommission ?? 0;

  // "Total Earnings" is the sum of the two earning streams the API reports —
  // referral commission plus the current value of active Index positions.
  const totalEarnings = referralEarned + totalIndexValue;

  const recentTx = useMemo(
    () =>
      transactions.slice(0, 5).map((t) => ({
        id: t.id,
        type: t.type,
        amount: parseAmount(t.amount),
        status: t.status,
        date: t.createdAt,
        description: null,
      })),
    [transactions]
  );

  if (loading) return <DashboardSkeleton />;

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const indexChange = indexData?.currentPrice?.changePercent;

  return (
    <div className="space-y-6">
      <KycBanner status={kycStatus} />

      <PageHeading
        eyebrow="Portfolio overview"
        title={`Welcome back, ${firstName}`}
        description="Here's how your ORVANTA account is performing today."
        actions={<KycStatusPill status={kycStatus} />}
      />

      {/* Headline figures */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Rise data-tour="stat-wallet">
          <StatCard
            label="Total Balance"
            value={balance}
            icon={IconWallet}
            accent="navy"
            hint="Available to invest or withdraw"
            href="/dashboard/wallet"
          />
        </Rise>

        <Rise data-tour="stat-index">
          <StatCard
            label="Index Value"
            value={totalIndexValue}
            icon={IconChartLine}
            accent="gold"
            href="/dashboard/index"
            trend={
              indexChange !== undefined && Number.isFinite(indexChange)
                ? { value: indexChange }
                : null
            }
            hint={
              activeInvestments.length === 0
                ? "No active investment"
                : activeInvestments.length === 1
                  ? `${activeInvestments[0].tier.label} · Active`
                  : `Across ${activeInvestments.length} active plans`
            }
          />
        </Rise>

        <Rise data-tour="stat-bonus">
          <StatCard
            label="Bonus Earnings"
            value={bonusBalance}
            icon={IconGift}
            accent="success"
            hint="From referral commission"
          >
            <div className="flex gap-2">
              <Link
                href="/dashboard/wallet?action=bonus-add"
                aria-disabled={bonusBalance <= 0}
                className={
                  bonusBalance > 0
                    ? "flex h-9 flex-1 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground transition-[filter] hover:brightness-105"
                    : "pointer-events-none flex h-9 flex-1 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground"
                }
              >
                Add to Wallet
              </Link>
              <Link
                href="/dashboard/wallet?action=bonus-withdraw"
                aria-disabled={bonusBalance <= 0}
                className={
                  bonusBalance > 0
                    ? "flex h-9 flex-1 items-center justify-center rounded-lg border border-border text-xs font-semibold text-foreground transition-colors hover:border-brand/40 hover:bg-accent"
                    : "pointer-events-none flex h-9 flex-1 items-center justify-center rounded-lg border border-border text-xs font-semibold text-muted-foreground opacity-60"
                }
              >
                Withdraw
              </Link>
            </div>
          </StatCard>
        </Rise>

        <Rise>
          <StatCard
            label="Total Earnings"
            value={totalEarnings}
            icon={IconCoins}
            accent="info"
            hint="Referral commission + Index value"
            href="/dashboard/referral"
          />
        </Rise>
      </Stagger>

      {/* Quick actions */}
      <QuickActions />

      {/* Performance + wallet composition */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
        <PerformanceChart
          className="lg:col-span-2"
          priceHistory={indexData?.priceHistory ?? []}
          currentPrice={indexData?.currentPrice ?? null}
        />
        <WalletOverview balance={balance} bonusBalance={bonusBalance} locked={frozen} />
      </div>

      {/* Account + stats + activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Account summary */}
          <SectionCard title="Account" icon={IconUser} actionHref="/dashboard/profile" actionLabel="Profile">
            <div className="flex items-center gap-3.5">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-navy-800 text-base font-bold text-brand ring-1 ring-brand/25 dark:bg-white/10">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-[0.9375rem] font-semibold text-foreground">
                  {user?.name || "User"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user?.email || ""}
                </span>
              </span>
            </div>

            <div className="mt-4 divide-y divide-border border-t border-border pt-1">
              <StatRow
                label="Role"
                value={<span className="capitalize">{user?.role?.toLowerCase() || "User"}</span>}
              />
              <StatRow label="KYC status" value={<KycStatusPill status={kycStatus} />} />
              <StatRow label="Currency" value={`${wallet?.currency || "USD"}`} />
            </div>
          </SectionCard>

          {/* Quick stats */}
          <SectionCard title="Quick Stats" icon={IconTrendingUp}>
            <div className="divide-y divide-border">
              <StatRow
                label="Total Deposits"
                value={formatMoney(totalDeposits)}
                tone="success"
              />
              <StatRow label="Total Withdrawals" value={formatMoney(totalWithdrawals)} />
              <StatRow
                label="Pending Requests"
                value={pendingCount}
                tone={pendingCount > 0 ? "warning" : "muted"}
                icon={pendingCount > 0 ? IconClock : undefined}
              />
              {frozen > 0 && (
                <StatRow label="Locked Amount" value={formatMoney(frozen)} tone="muted" />
              )}
            </div>
          </SectionCard>
        </div>

        <RecentTransactions className="lg:col-span-2" transactions={recentTx} />
      </div>

      {/* Referral */}
      <ReferralOverview
        stats={referralStats}
        earnings={earnings}
        levelRates={indexData?.referralLevels ?? []}
      />

      <ReferralCta />
    </div>
  );
}
