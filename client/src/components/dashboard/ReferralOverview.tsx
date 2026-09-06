"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  IconCoins,
  IconGift,
  IconTrendingUp,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";

import type { ReferralDashboardStats, ReferralEarningsBreakdown } from "@/lib/api";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/components/shared/motion";
import { formatMoney } from "./format";
import { EmptyState, SectionCard } from "./SectionCard";

/**
 * Referral overview.
 *
 * The five-level structure, the per-level rates and every figure shown come
 * from `referralAPI` exactly as before — this only changes how they are drawn.
 * `levelRates` keeps its meaning: index 0 is level 1, and `byLevel[i]` is the
 * amount earned at that level.
 */
export function ReferralOverview({
  stats,
  earnings,
  levelRates,
  className,
}: {
  stats: ReferralDashboardStats | null;
  earnings: ReferralEarningsBreakdown | null;
  levelRates: number[];
  className?: string;
}) {
  const reduce = useReducedMotion();

  const totalReferrals = stats?.totalReferrals ?? 0;
  const deposited = stats?.deposited ?? 0;
  const totalEarned = earnings?.totalEarned ?? stats?.totalCommission ?? 0;

  const byLevel = earnings?.byLevel ?? [];
  const maxEarning = Math.max(...levelRates.map((_, i) => byLevel[i] ?? 0), 1);

  const summary = [
    { label: "Total Referrals", value: String(totalReferrals), icon: IconUsers, tone: "gold" as const },
    { label: "Deposited", value: String(deposited), icon: IconUserCheck, tone: "success" as const },
    { label: "Total Earned", value: formatMoney(totalEarned), icon: IconCoins, tone: "navy" as const },
  ];

  const toneClass = {
    gold: "bg-accent text-brand ring-brand/15",
    success: "bg-success-soft text-success ring-success/15",
    navy: "bg-navy-800 text-gold-400 ring-navy-800/15 dark:bg-white/8 dark:ring-white/10",
  };

  return (
    <SectionCard
      title="Referral Overview"
      description="Commission earned across your five referral levels"
      icon={IconGift}
      actionHref="/dashboard/referral"
      className={className}
    >
      {/* Headline figures */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summary.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/60 p-3.5"
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl ring-1",
                toneClass[s.tone]
              )}
            >
              <s.icon className="size-5" stroke={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <span className="text-money mt-0.5 block truncate text-lg text-foreground">
                {s.value}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Per-level commission progress */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[0.8125rem] font-semibold text-foreground">
            Commission by level
          </h3>
          {stats?.commissionRate !== undefined && (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[0.6875rem] font-semibold text-accent-foreground">
              {stats.commissionRate}% base rate
            </span>
          )}
        </div>

        {levelRates.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={IconTrendingUp}
            title="No referral commission data yet"
            description="Level commissions will appear here once your referral network starts earning."
            action={
              <Link
                href="/dashboard/referral"
                className="text-xs font-semibold text-brand hover:underline"
              >
                Invite your first referral →
              </Link>
            }
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {levelRates.map((rate, i) => {
              const amount = byLevel[i] ?? 0;
              const pct = Math.max((amount / maxEarning) * 100, amount > 0 ? 4 : 0);
              return (
                <li key={i} className="flex items-center gap-3">
                  <span className="flex w-24 shrink-0 items-baseline gap-1.5 text-xs">
                    <span className="font-semibold text-foreground">L{i + 1}</span>
                    <span className="text-muted-foreground">({rate}%)</span>
                  </span>

                  <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.span
                      className="block h-full rounded-full bg-linear-to-r from-brand-2 to-brand"
                      initial={reduce ? false : { width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.07 }}
                      style={reduce ? { width: `${pct}%` } : undefined}
                    />
                  </span>

                  <span className="text-money w-20 shrink-0 text-right text-xs text-foreground">
                    {formatMoney(amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}

/**
 * Full-width invite banner shown at the foot of the dashboard.
 * Navy ground, gold accent, abstract tick pattern — no gradient wash.
 */
export function ReferralCta({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "surface-navy relative overflow-hidden rounded-2xl p-6 sm:p-8",
        className
      )}
    >
      <span aria-hidden className="bg-ticker pointer-events-none absolute inset-0 opacity-50" />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-brand/12 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold-400">
            <IconGift className="size-3.5" stroke={2} />
            Invite &amp; Earn
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Grow your network. Grow your returns.
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-white/65">
            Share your referral link and earn commission across five levels of your
            network — paid on the capital your referrals invest.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Link
            href="/dashboard/referral"
            className="btn-glow btn-glow-hover inline-flex h-12 items-center justify-center rounded-xl px-7 text-sm font-semibold"
          >
            Get your referral link
          </Link>
          <Link
            href="/dashboard/referral"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 px-7 text-sm font-semibold text-white transition-colors hover:border-brand/50 hover:text-gold-400"
          >
            View earnings
          </Link>
        </div>
      </div>
    </section>
  );
}
