"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  IconChartLine,
  IconCoins,
  IconReceipt2,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";

import {
  indexAPI,
  referralAPI,
  walletAPI,
  type IndexData,
  type IndexInvestment,
  type ReferralEarningsBreakdown,
  type TransactionData,
} from "@/lib/api";

import { PageHeading, SectionCard, EmptyState } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardSkeleton } from "@/components/dashboard/Skeletons";
import { useChartTheme, tooltipStyles } from "@/components/dashboard/chart-theme";
import {
  formatMoney,
  formatMoneyCompact,
  formatDay,
  parseAmount,
} from "@/components/dashboard/format";
import { Rise, Stagger } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

/**
 * Analytics.
 *
 * Every figure on this page is derived from the same endpoints the rest of the
 * dashboard uses — the wallet transaction ledger, the user's Index investments,
 * and the referral earnings breakdown. Nothing is simulated: when an account has
 * no history, the page says so rather than drawing a plausible-looking curve.
 */
export default function ChartsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [investments, setInvestments] = useState<IndexInvestment[]>([]);
  const [earnings, setEarnings] = useState<ReferralEarningsBreakdown | null>(null);
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [loading, setLoading] = useState(true);

  const { theme, mounted } = useChartTheme();

  useEffect(() => {
    const load = async () => {
      try {
        const [txRes, invRes, earnRes, idxRes] = await Promise.allSettled([
          walletAPI.getTransactions(),
          indexAPI.getMyInvestments(),
          referralAPI.getEarningsBreakdown(),
          indexAPI.getData(),
        ]);
        if (txRes.status === "fulfilled") setTransactions(txRes.value.transactions);
        if (invRes.status === "fulfilled") setInvestments(invRes.value.investments);
        if (earnRes.status === "fulfilled") setEarnings(earnRes.value);
        if (idxRes.status === "fulfilled") setIndexData(idxRes.value);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /** Running wallet balance after each completed transaction. */
  const balanceSeries = useMemo(() => {
    const completed = transactions
      .filter((t) => t.status === "COMPLETED")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const CREDIT = new Set(["DEPOSIT", "BONUS_CREDIT", "BONUS_TRANSFER", "INTERNAL_TRANSFER_IN"]);

    let running = 0;
    const byDay = new Map<string, number>();
    for (const tx of completed) {
      const amt = parseAmount(tx.amount);
      running += CREDIT.has(tx.type) ? amt : -amt;
      byDay.set(formatDay(tx.createdAt), running);
    }
    return Array.from(byDay, ([label, value]) => ({ label, value }));
  }, [transactions]);

  /** Deposits vs withdrawals, grouped by calendar month. */
  const flowSeries = useMemo(() => {
    const byMonth = new Map<string, { label: string; deposits: number; withdrawals: number }>();

    for (const tx of transactions) {
      if (tx.status !== "COMPLETED") continue;
      const d = new Date(tx.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const row = byMonth.get(key) ?? { label, deposits: 0, withdrawals: 0 };
      const amt = parseAmount(tx.amount);

      if (tx.type === "DEPOSIT") row.deposits += amt;
      else if (tx.type === "WITHDRAWAL" || tx.type === "BONUS_WITHDRAWAL") row.withdrawals += amt;

      byMonth.set(key, row);
    }

    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [transactions]);

  /** Referral commission per level, straight from the API breakdown. */
  const levelSeries = useMemo(() => {
    const rates = indexData?.referralLevels ?? [];
    const byLevel = earnings?.byLevel ?? [];
    return rates.map((rate, i) => ({
      label: `L${i + 1}`,
      rate,
      amount: byLevel[i] ?? 0,
    }));
  }, [indexData, earnings]);

  const activeInvestments = useMemo(
    () => investments.filter((i) => i.status === "ACTIVE"),
    [investments]
  );

  const totals = useMemo(() => {
    const deposits = transactions
      .filter((t) => t.type === "DEPOSIT" && t.status === "COMPLETED")
      .reduce((s, t) => s + parseAmount(t.amount), 0);
    const withdrawals = transactions
      .filter((t) => t.type === "WITHDRAWAL" && t.status === "COMPLETED")
      .reduce((s, t) => s + parseAmount(t.amount), 0);
    const indexValue = activeInvestments.reduce(
      (s, i) => s + parseAmount(i.netAmount || i.amount),
      0
    );
    const referral = earnings?.totalEarned ?? 0;
    const completedCount = transactions.filter((t) => t.status === "COMPLETED").length;

    return { deposits, withdrawals, indexValue, referral, completedCount };
  }, [transactions, activeInvestments, earnings]);

  if (loading) return <DashboardSkeleton />;

  const hasHistory = transactions.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeading
        eyebrow="Insights"
        title="Analytics"
        description="Your deposits, Index position and referral commission — drawn from your account history."
      />

      {/* Headline figures */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Rise>
          <StatCard
            label="Total Deposits"
            value={totals.deposits}
            icon={IconWallet}
            accent="navy"
            hint="Completed deposits"
          />
        </Rise>
        <Rise>
          <StatCard
            label="Total Withdrawals"
            value={totals.withdrawals}
            icon={IconReceipt2}
            accent="muted"
            hint="Completed withdrawals"
          />
        </Rise>
        <Rise>
          <StatCard
            label="Index Value"
            value={totals.indexValue}
            icon={IconChartLine}
            accent="gold"
            hint={
              activeInvestments.length === 0
                ? "No active investment"
                : `${activeInvestments.length} active plan${activeInvestments.length > 1 ? "s" : ""}`
            }
          />
        </Rise>
        <Rise>
          <StatCard
            label="Referral Earnings"
            value={totals.referral}
            icon={IconCoins}
            accent="success"
            hint="Commission earned to date"
          />
        </Rise>
      </Stagger>

      {/* Balance history */}
      <SectionCard
        title="Wallet Balance History"
        description="Running balance after each completed transaction"
        icon={IconTrendingUp}
        padded={false}
      >
        <div className="px-1 pb-4 pt-5 sm:px-3 sm:pb-6">
          {!mounted ? null : balanceSeries.length === 0 ? (
            <div className="px-3 sm:px-3">
              <EmptyState
                icon={IconTrendingUp}
                title="No balance history yet"
                description="Once you make your first deposit, your balance over time will be charted here."
              />
            </div>
          ) : (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceSeries} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="analyticsBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.fillFrom} />
                      <stop offset="100%" stopColor={theme.fillTo} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={theme.grid} vertical={false} strokeDasharray="4 4" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: theme.axis }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: theme.axis }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={(v: number) => formatMoneyCompact(v)}
                  />
                  <Tooltip
                    {...tooltipStyles(theme)}
                    formatter={(value: unknown) =>
                      [formatMoney(Number(value)), "Balance"] as [string, string]
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.stroke}
                    strokeWidth={2.25}
                    fill="url(#analyticsBalance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        {/* Deposits vs withdrawals */}
        <SectionCard
          title="Deposits vs Withdrawals"
          description="Completed movements, grouped by month"
          icon={IconWallet}
          padded={false}
        >
          <div className="px-1 pb-4 pt-5 sm:px-3 sm:pb-6">
            {!mounted ? null : flowSeries.length === 0 ? (
              <div className="px-3">
                <EmptyState
                  icon={IconWallet}
                  title="Nothing to compare yet"
                  description="Deposits and withdrawals appear here once they complete."
                />
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flowSeries} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke={theme.grid} vertical={false} strokeDasharray="4 4" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: theme.axis }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: theme.axis }}
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      tickFormatter={(v: number) => formatMoneyCompact(v)}
                    />
                    <Tooltip
                      {...tooltipStyles(theme)}
                      cursor={{ fill: theme.grid }}
                      formatter={(value: unknown, name: unknown) =>
                        [formatMoney(Number(value)), String(name)] as [string, string]
                      }
                    />
                    <Bar dataKey="deposits" name="Deposits" fill={theme.positive} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="withdrawals" name="Withdrawals" fill={theme.stroke} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Referral commission by level */}
        <SectionCard
          title="Commission by Level"
          description="Referral earnings across your five levels"
          icon={IconCoins}
          padded={false}
        >
          <div className="px-1 pb-4 pt-5 sm:px-3 sm:pb-6">
            {!mounted ? null : levelSeries.length === 0 ? (
              <div className="px-3">
                <EmptyState
                  icon={IconCoins}
                  title="No referral commission yet"
                  description="Earnings appear here once your referrals start investing."
                />
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelSeries} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke={theme.grid} vertical={false} strokeDasharray="4 4" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: theme.axis }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: theme.axis }}
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      tickFormatter={(v: number) => formatMoneyCompact(v)}
                    />
                    <Tooltip
                      {...tooltipStyles(theme)}
                      cursor={{ fill: theme.grid }}
                      formatter={(value: unknown) =>
                        [formatMoney(Number(value)), "Earned"] as [string, string]
                      }
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {levelSeries.map((_, i) => (
                        <Cell key={i} fill={theme.series[i % theme.series.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Active investments breakdown */}
      <SectionCard
        title="Active Index Positions"
        description="Your live allocations and their tiers"
        icon={IconChartLine}
        actionHref="/dashboard/index"
        actionLabel="Manage"
        padded={false}
      >
        {activeInvestments.length === 0 ? (
          <div className="p-4 sm:p-6">
            <EmptyState
              icon={IconChartLine}
              title="No active Index positions"
              description="Allocate from your wallet into an Index tier to see it here."
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-sm md:table">
              <caption className="sr-only">Your active Index investments</caption>
              <thead>
                <tr className="border-y border-border bg-surface-2/60 text-left">
                  <th scope="col" className="px-6 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tier</th>
                  <th scope="col" className="px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Activated</th>
                  <th scope="col" className="px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Matures</th>
                  <th scope="col" className="px-6 py-3 text-right text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeInvestments.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-surface-2/50">
                    <td className="px-6 py-4 font-semibold text-foreground">{inv.tier.label}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">
                      {new Date(inv.activatedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">
                      {inv.maturesAt
                        ? new Date(inv.maturesAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="text-money px-6 py-4 text-right text-foreground">
                      {formatMoney(parseAmount(inv.netAmount || inv.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-border md:hidden">
              {activeInvestments.map((inv) => (
                <li key={inv.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-semibold text-foreground">{inv.tier.label}</p>
                    <span className="text-money shrink-0 text-sm text-foreground">
                      {formatMoney(parseAmount(inv.netAmount || inv.amount))}
                    </span>
                  </div>
                  <dl className="mt-2.5 grid grid-cols-2 gap-2 text-[0.6875rem]">
                    <div>
                      <dt className="text-muted-foreground">Activated</dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {new Date(inv.activatedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Matures</dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {inv.maturesAt
                          ? new Date(inv.maturesAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </SectionCard>

      {!hasHistory && (
        <p className={cn("text-center text-xs text-muted-foreground")}>
          Analytics fill in as your account builds history — nothing here is simulated.
        </p>
      )}
    </div>
  );
}
