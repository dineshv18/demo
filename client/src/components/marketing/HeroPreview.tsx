"use client";

import {
  IconArrowsExchange,
  IconChartLine,
  IconCoins,
  IconLayoutDashboard,
  IconReceipt2,
  IconSearch,
  IconShieldCheck,
  IconWallet,
  type IconProps,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";

type TablerIcon = React.ComponentType<IconProps>;

/* ------------------------------------------------------------------ *
 * Full-width product preview for the hero.
 *
 * This mirrors the real dashboard's structure — navy sidebar, header,
 * stat row, performance panel, wallet donut — so visitors see the actual
 * product shape rather than a stock image.
 *
 * Deliberately no monetary figures or percentages. On an investment site a
 * mocked "+8.4% return" in a hero reads as a performance claim, so the value
 * slots are rendered as neutral bars and the chart carries no axis values.
 * The layout does the selling; the numbers live in the signed-in dashboard.
 * ------------------------------------------------------------------ */

const navItems: { icon: TablerIcon; label: string; active?: boolean }[] = [
  { icon: IconLayoutDashboard, label: "Dashboard", active: true },
  { icon: IconWallet, label: "My Wallet" },
  { icon: IconChartLine, label: "Index" },
  { icon: IconArrowsExchange, label: "Transactions" },
  { icon: IconReceipt2, label: "Statements" },
];

const stats: { icon: TablerIcon; label: string; width: string; tone: "gold" | "navy" | "muted" }[] = [
  { icon: IconWallet, label: "Total Balance", width: "72%", tone: "navy" },
  { icon: IconChartLine, label: "Index Value", width: "58%", tone: "gold" },
  { icon: IconCoins, label: "Bonus Earnings", width: "44%", tone: "muted" },
  { icon: IconShieldCheck, label: "Total Earnings", width: "64%", tone: "muted" },
];

/** Neutral stand-in for a figure — never a fabricated amount. */
function ValueBar({ width, tone }: { width: string; tone: "gold" | "navy" | "muted" }) {
  const fill = {
    gold: "bg-brand",
    navy: "bg-navy-700 dark:bg-white/55",
    muted: "bg-muted-foreground/35",
  }[tone];

  return (
    <span className="mt-2.5 block h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <span className={cn("block h-full rounded-full", fill)} style={{ width }} />
    </span>
  );
}

export function HeroPreview() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-surface-2/70 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-danger/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
        </div>
        <div className="mx-auto flex max-w-xs flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-1">
          <IconShieldCheck className="size-3 shrink-0 text-brand" stroke={2} />
          <span className="truncate text-[0.625rem] text-muted-foreground">
            orvanta.financial/dashboard
          </span>
        </div>
        <span className="hidden rounded-full border border-brand/25 bg-accent px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-wider text-accent-foreground sm:inline">
          Preview
        </span>
      </div>

      <div className="flex">
        {/* Navy sidebar — the product's real anchor */}
        <aside className="hidden w-44 shrink-0 flex-col gap-1 bg-navy-800 p-3 sm:flex lg:w-52">
          <div className="flex items-center gap-2 px-1 pb-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand/15 text-[0.625rem] font-bold text-brand ring-1 ring-brand/25">
              O
            </span>
            <span className="grid leading-tight">
              <span className="font-display text-[0.6875rem] font-semibold text-white">
                ORVANTA
              </span>
              <span className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-brand">
                Financial
              </span>
            </span>
          </div>
          <span aria-hidden className="mb-2 block h-px bg-linear-to-r from-brand/40 to-transparent" />

          {navItems.map((n) => (
            <div
              key={n.label}
              className={cn(
                "relative flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.6875rem]",
                n.active
                  ? "bg-brand/12 font-semibold text-white ring-1 ring-inset ring-brand/25"
                  : "text-white/55"
              )}
            >
              {n.active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-brand"
                />
              )}
              <n.icon
                className={cn("size-3.5 shrink-0", n.active ? "text-brand" : "text-white/45")}
                stroke={1.75}
              />
              {n.label}
            </div>
          ))}

          {/* Invite promo, as in the real sidebar */}
          <div className="mt-auto rounded-md border border-brand/25 bg-brand/10 p-2.5">
            <p className="text-[0.625rem] font-semibold text-white">Invite &amp; Earn</p>
            <span className="mt-2 flex h-6 items-center justify-center rounded bg-brand text-[0.5625rem] font-bold text-brand-foreground">
              Refer now
            </span>
          </div>
        </aside>

        {/* Main area */}
        <div className="min-w-0 flex-1 bg-background p-3 sm:p-4">
          {/* Header */}
          <div className="mb-3 flex items-center gap-3">
            <p className="font-display text-[0.8125rem] font-semibold text-foreground">
              Dashboard
            </p>
            <span className="ml-auto hidden items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 sm:flex">
              <IconSearch className="size-3 text-muted-foreground" stroke={1.75} />
              <span className="text-[0.5625rem] text-muted-foreground">Search…</span>
            </span>
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy-800 text-[0.5625rem] font-bold text-brand ring-1 ring-brand/25 dark:bg-white/10">
              C
            </span>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-card p-2.5">
                <span className="grid size-6 place-items-center rounded-md bg-accent text-brand ring-1 ring-brand/15">
                  <s.icon className="size-3.5" stroke={1.75} />
                </span>
                <p className="mt-2 truncate text-[0.5625rem] font-medium text-muted-foreground">
                  {s.label}
                </p>
                <ValueBar width={s.width} tone={s.tone} />
              </div>
            ))}
          </div>

          {/* Chart + wallet */}
          <div className="mt-2 grid gap-2 lg:grid-cols-3">
            {/* Performance panel */}
            <div className="rounded-lg border border-border bg-card p-3 lg:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Index Performance
                </p>
                <div className="flex gap-0.5 rounded-md border border-border bg-surface-2 p-0.5">
                  {["7D", "1M", "3M", "ALL"].map((r, i) => (
                    <span
                      key={r}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[0.5rem] font-semibold",
                        i === 1 ? "bg-card text-brand ring-1 ring-brand/20" : "text-muted-foreground"
                      )}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Illustrative curve — deliberately unlabelled */}
              <svg
                aria-hidden
                viewBox="0 0 420 120"
                className="mt-3 h-24 w-full sm:h-28"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="orvPreviewFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[24, 48, 72, 96].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="420"
                    y1={y}
                    y2={y}
                    stroke="var(--border)"
                    strokeDasharray="3 5"
                  />
                ))}
                <path
                  d="M0 96 C 50 88, 80 62, 120 66 S 190 40, 240 48 S 320 20, 420 14 L420 120 L0 120 Z"
                  fill="url(#orvPreviewFill)"
                />
                <path
                  d="M0 96 C 50 88, 80 62, 120 66 S 190 40, 240 48 S 320 20, 420 14"
                  fill="none"
                  stroke="var(--brand)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Wallet overview */}
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Wallet Overview
              </p>
              <div className="mt-3 flex items-center gap-3">
                {/* Donut */}
                <svg aria-hidden viewBox="0 0 42 42" className="size-16 shrink-0 -rotate-90">
                  <circle cx="21" cy="21" r="16" fill="none" stroke="var(--muted)" strokeWidth="6" />
                  <circle
                    cx="21" cy="21" r="16" fill="none"
                    stroke="var(--brand)" strokeWidth="6"
                    strokeDasharray="58 100" strokeLinecap="round"
                  />
                  <circle
                    cx="21" cy="21" r="16" fill="none"
                    stroke="var(--color-navy-500)" strokeWidth="6"
                    strokeDasharray="24 100" strokeDashoffset="-60" strokeLinecap="round"
                  />
                </svg>

                <ul className="min-w-0 flex-1 space-y-1.5">
                  {[
                    { label: "Wallet", tone: "bg-brand", w: "80%" },
                    { label: "Bonus", tone: "bg-navy-500 dark:bg-white/45", w: "50%" },
                    { label: "Locked", tone: "bg-muted-foreground/35", w: "30%" },
                  ].map((l) => (
                    <li key={l.label} className="flex items-center gap-2">
                      <span className={cn("size-1.5 shrink-0 rounded-full", l.tone)} />
                      <span className="w-10 shrink-0 text-[0.5625rem] text-muted-foreground">
                        {l.label}
                      </span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <span className={cn("block h-full rounded-full", l.tone)} style={{ width: l.w }} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
