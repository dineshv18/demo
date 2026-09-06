"use client";

import * as React from "react";
import Link from "next/link";
import { IconArrowUpRight, IconTrendingDown, IconTrendingUp, type IconProps } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/shared/motion";
import { formatMoney } from "./format";

type TablerIcon = React.ComponentType<IconProps>;

export type StatAccent = "gold" | "navy" | "success" | "info" | "muted";

const ACCENT: Record<StatAccent, { chip: string; ring: string; wash: string }> = {
  gold: {
    chip: "bg-accent text-brand",
    ring: "ring-brand/20",
    wash: "from-brand/10",
  },
  navy: {
    chip: "bg-navy-800 text-gold-400 dark:bg-white/8 dark:text-gold-400",
    ring: "ring-navy-800/15 dark:ring-white/10",
    wash: "from-navy-800/8 dark:from-white/5",
  },
  success: {
    chip: "bg-success-soft text-success",
    ring: "ring-success/20",
    wash: "from-success/10",
  },
  info: {
    chip: "bg-info-soft text-info",
    ring: "ring-info/20",
    wash: "from-info/10",
  },
  muted: {
    chip: "bg-muted text-muted-foreground",
    ring: "ring-border",
    wash: "from-foreground/5",
  },
};

export type StatCardProps = {
  label: string;
  /** Numeric value — animated up on mount. Pass `valueText` instead for non-numeric. */
  value?: number;
  valueText?: string;
  /** Overrides the default currency formatting. */
  format?: (n: number) => string;
  hint?: React.ReactNode;
  icon: TablerIcon;
  accent?: StatAccent;
  /** Percentage change from real data only. Omit when the API gives no basis. */
  trend?: { value: number; label?: string } | null;
  href?: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * The headline metric tile. Figures shown are exactly what the caller passes —
 * the only animation is the count toward the real value.
 */
export function StatCard({
  label,
  value,
  valueText,
  format = (n) => formatMoney(n),
  hint,
  icon: Icon,
  accent = "gold",
  trend,
  href,
  children,
  className,
}: StatCardProps) {
  const a = ACCENT[accent];

  const body = (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
        href && "hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lifted",
        className
      )}
    >
      {/* Subtle corner wash — the card's only decoration */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-linear-to-br to-transparent opacity-70",
          a.wash
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl ring-1",
            a.chip,
            a.ring
          )}
        >
          <Icon className="size-5" stroke={1.75} />
        </span>

        {href && (
          <IconArrowUpRight className="size-4 shrink-0 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
        )}
      </div>

      <p className="relative mt-4 text-[0.8125rem] font-medium text-muted-foreground">{label}</p>

      <p className="text-money relative mt-1 text-[1.75rem] leading-tight text-foreground sm:text-[2rem]">
        {valueText !== undefined ? (
          valueText
        ) : (
          <AnimatedNumber value={value ?? 0} format={format} />
        )}
      </p>

      <div className="relative mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {trend && Number.isFinite(trend.value) && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold",
              trend.value >= 0 ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
            )}
          >
            {trend.value >= 0 ? (
              <IconTrendingUp className="size-3" />
            ) : (
              <IconTrendingDown className="size-3" />
            )}
            {trend.value >= 0 ? "+" : ""}
            {trend.value.toFixed(2)}%
          </span>
        )}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>

      {children && <div className="relative mt-4">{children}</div>}
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-2xl" aria-label={label}>
        {body}
      </Link>
    );
  }

  return body;
}

/** Compact label/value row used inside panels (Quick Stats, summaries). */
export function StatRow({
  label,
  value,
  tone = "default",
  icon: Icon,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "brand" | "muted";
  icon?: TablerIcon;
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    brand: "text-brand",
    muted: "text-muted-foreground",
  }[tone];

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex min-w-0 items-center gap-2 text-[0.8125rem] text-muted-foreground">
        {Icon && <Icon className="size-4 shrink-0 opacity-70" stroke={1.75} />}
        <span className="truncate">{label}</span>
      </span>
      <span className={cn("text-money shrink-0 text-sm", toneClass)}>{value}</span>
    </div>
  );
}
