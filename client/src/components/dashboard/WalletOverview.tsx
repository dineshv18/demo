"use client";

import * as React from "react";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { IconWallet } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useChartTheme, tooltipStyles } from "./chart-theme";
import { formatMoney } from "./format";
import { SectionCard } from "./SectionCard";

/**
 * Wallet composition donut.
 *
 * The three figures are passed straight through from the wallet API; the total
 * is their sum and nothing else. When every figure is zero the donut renders as
 * a neutral ring rather than a misleading full segment.
 */
export function WalletOverview({
  balance,
  bonusBalance,
  locked,
  className,
}: {
  balance: number;
  bonusBalance: number;
  locked: number;
  className?: string;
}) {
  const { theme, mounted } = useChartTheme();

  const segments = React.useMemo(
    () => [
      { name: "Wallet Balance", value: balance, color: theme.series[0] },
      { name: "Bonus Balance", value: bonusBalance, color: theme.series[1] },
      { name: "Locked Amount", value: locked, color: theme.series[2] },
    ],
    [balance, bonusBalance, locked, theme.series]
  );

  const total = balance + bonusBalance + locked;
  const hasValue = total > 0;

  const chartData = hasValue
    ? segments.filter((s) => s.value > 0)
    : [{ name: "No funds", value: 1, color: theme.emptyRing }];

  return (
    <SectionCard
      title="Wallet Overview"
      icon={IconWallet}
      actionHref="/dashboard/wallet"
      actionLabel="View Wallet"
      className={className}
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-5">
        {/* Donut with the total sitting in the middle */}
        <div className="relative size-36 shrink-0">
          {!mounted ? (
            <Skeleton className="size-36 rounded-full" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="70%"
                    outerRadius="100%"
                    paddingAngle={hasValue && chartData.length > 1 ? 2 : 0}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive
                  >
                    {chartData.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  {hasValue && (
                    <Tooltip
                      {...tooltipStyles(theme)}
                      cursor={false}
                      formatter={(value: unknown, name: unknown) => [formatMoney(Number(value)), String(name)] as [string, string]}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-eyebrow text-[0.625rem]">Total</span>
                <span className="text-money mt-0.5 text-lg text-foreground">
                  {formatMoney(total)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Legend / breakdown */}
        <ul className="w-full min-w-0 flex-1 space-y-1">
          {segments.map((s) => {
            const share = total > 0 ? (s.value / total) * 100 : 0;
            return (
              <li key={s.name} className="flex items-start gap-2.5 py-1.5">
                <span
                  aria-hidden
                  className="mt-1.5 size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="min-w-0 flex-1 text-[0.8125rem] leading-snug text-muted-foreground">
                  {s.name}
                </span>
                <span className="shrink-0 text-right">
                  <span className="text-money block text-sm text-foreground">
                    {formatMoney(s.value)}
                  </span>
                  <span className="block text-[0.6875rem] text-muted-foreground">
                    {share.toFixed(1)}%
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <Link
        href="/dashboard/wallet"
        className={cn(
          "mt-5 flex h-10 w-full items-center justify-center rounded-lg border border-border",
          "text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:bg-accent hover:text-brand"
        )}
      >
        View Wallet
      </Link>
    </SectionCard>
  );
}
