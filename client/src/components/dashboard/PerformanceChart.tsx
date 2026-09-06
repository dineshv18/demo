"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import type { IndexPriceEntry } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useChartTheme, tooltipStyles } from "./chart-theme";
import { formatMoney, formatMoneyCompact } from "./format";
import { EmptyState } from "./SectionCard";
import { IconChartLine } from "@tabler/icons-react";

const RANGES = [
  { key: "7D", points: 7 },
  { key: "1M", points: 30 },
  { key: "3M", points: 90 },
  { key: "ALL", points: Infinity },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

/**
 * Index Performance.
 *
 * Reads the same `priceHistory` / `currentPrice` the Index API already returns.
 * The range selector only trims how many of those existing points are drawn —
 * no resampling, no interpolation, and no derived figures beyond the change
 * between the first and last point actually shown.
 */
export function PerformanceChart({
  priceHistory,
  currentPrice,
  className,
  height = 280,
}: {
  priceHistory: IndexPriceEntry[];
  currentPrice?: { price: number; changePercent: number; changeAmount: number } | null;
  className?: string;
  height?: number;
}) {
  const { theme, mounted } = useChartTheme();
  const [range, setRange] = React.useState<RangeKey>("1M");

  const data = React.useMemo(() => {
    const points = RANGES.find((r) => r.key === range)?.points ?? Infinity;
    const sliced = Number.isFinite(points) ? priceHistory.slice(-(points as number)) : priceHistory;
    return sliced.map((p) => ({
      label: p.dateLabel,
      price: p.price,
      changePercent: p.changePercent,
    }));
  }, [priceHistory, range]);

  // Change across the visible window, computed from the plotted points only.
  const windowChange = React.useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0].price;
    const last = data[data.length - 1].price;
    if (!first) return null;
    return ((last - first) / first) * 100;
  }, [data]);

  const price = currentPrice?.price ?? priceHistory.at(-1)?.price ?? 0;
  const headlineChange = currentPrice?.changePercent;
  const up = (headlineChange ?? windowChange ?? 0) >= 0;

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card",
        className
      )}
    >
      <header className="flex flex-col gap-4 px-4 pt-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:pt-5">
        <div className="min-w-0">
          <p className="text-eyebrow">Index performance</p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-money text-[1.75rem] leading-none text-foreground sm:text-[2rem]">
              {formatMoney(price)}
            </span>
            {headlineChange !== undefined && Number.isFinite(headlineChange) && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                  up ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                )}
              >
                {up ? <IconTrendingUp className="size-3.5" /> : <IconTrendingDown className="size-3.5" />}
                {headlineChange >= 0 ? "+" : ""}
                {headlineChange.toFixed(2)}%
              </span>
            )}
          </div>
          {windowChange !== null && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {windowChange >= 0 ? "+" : ""}
              {windowChange.toFixed(2)}% over the selected period
            </p>
          )}
        </div>

        {/* Period selector */}
        <div
          role="group"
          aria-label="Chart period"
          className="inline-flex shrink-0 gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5"
        >
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              aria-pressed={range === r.key}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[0.6875rem] font-semibold transition-colors",
                range === r.key
                  ? "bg-card text-brand shadow-xs ring-1 ring-brand/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.key}
            </button>
          ))}
        </div>
      </header>

      <div className="px-2 pb-4 pt-5 sm:px-3 sm:pb-6">
        {!mounted ? (
          <Skeleton className="mx-2 rounded-xl" style={{ height }} />
        ) : data.length === 0 ? (
          <div className="px-2 sm:px-3">
            <EmptyState
              icon={IconChartLine}
              title="No Index price history yet"
              description="Performance will appear here once Index pricing data is published."
            />
          </div>
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="orvantaIndexFill" x1="0" y1="0" x2="0" y2="1">
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
                  dy={6}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme.axis }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={(v: number) => formatMoneyCompact(v)}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  {...tooltipStyles(theme)}
                  formatter={(value: unknown) => [formatMoney(Number(value)), "Index value"] as [string, string]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={theme.stroke}
                  strokeWidth={2.25}
                  fill="url(#orvantaIndexFill)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: theme.tooltipBg, fill: theme.stroke }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Compact balance sparkline used on the wallet summary. Takes an already-built
 * series so the caller keeps ownership of how the balance is derived.
 */
export function BalanceTrend({
  data,
  height = 160,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const { theme, mounted } = useChartTheme();

  if (!mounted) return <Skeleton className="rounded-xl" style={{ height }} />;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="orvantaBalanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.fillFrom} />
              <stop offset="100%" stopColor={theme.fillTo} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.grid} vertical={false} strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: theme.axis }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            tick={{ fontSize: 10, fill: theme.axis }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) => formatMoneyCompact(v)}
          />
          <Tooltip
            {...tooltipStyles(theme)}
            formatter={(value: unknown) => [formatMoney(Number(value)), "Balance"] as [string, string]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={theme.stroke}
            strokeWidth={2}
            fill="url(#orvantaBalanceFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
