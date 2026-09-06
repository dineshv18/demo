"use client";

import type { ReactNode } from "react";
import {
  IconCheck,
  IconCircleCheck,
  IconLayersIntersect,
  IconShieldCheck,
  IconStack2,
  IconUsers,
  IconWallet,
  type IconProps,
} from "@tabler/icons-react";

import { Reveal, Section, SectionTitle } from "@/components/site/primitives";
import { cn } from "@/lib/utils";

type TablerIcon = React.ComponentType<IconProps>;

/* ------------------------------------------------------------------ *
 * Bento feature grid.
 *
 * Each tile carries a small purpose-drawn visual instead of a stock image or
 * a lone icon, so the section shows what the platform does rather than just
 * listing it. Every visual is built from the design tokens — nothing here is
 * a screenshot, and no figure in them is presented as a user's real data.
 * ------------------------------------------------------------------ */

/** Shared frame: a sunken panel the mini-visuals sit inside. */
function Canvas({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2/60 p-5",
        className
      )}
    >
      <span className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative w-full">{children}</div>
    </div>
  );
}

/** KYC — a verification checklist where each row is already cleared. */
function KycVisual() {
  const rows = ["Identity document", "Proof of address", "Email verification"];
  return (
    <Canvas className="min-h-44">
      <ul className="mx-auto max-w-xs space-y-2.5">
        {rows.map((r, i) => (
          <li
            key={r}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 shadow-xs"
            style={{ opacity: 1 - i * 0.18 }}
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-success-soft text-success">
              <IconCheck className="size-3.5" stroke={3} />
            </span>
            <span className="text-[0.6875rem] font-medium text-foreground">{r}</span>
            <span className="ml-auto text-[0.625rem] font-semibold uppercase tracking-wider text-success">
              Cleared
            </span>
          </li>
        ))}
      </ul>
    </Canvas>
  );
}

/** Wallet — the balance split that keeps deposits separate from allocations. */
function WalletVisual() {
  return (
    <Canvas className="min-h-44">
      <div className="mx-auto max-w-xs space-y-3">
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Wallet balance
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <span className="block h-full w-2/3 rounded-full bg-brand" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Allocated to Index
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <span className="block h-full w-1/3 rounded-full bg-navy-500 dark:bg-white/40" />
          </div>
        </div>
      </div>
    </Canvas>
  );
}

/** Tiers — an ascending ladder, each step taller than the last. */
function TiersVisual() {
  return (
    <Canvas className="min-h-44">
      <div className="flex h-28 items-end justify-center gap-2.5">
        {[38, 55, 74, 96].map((h, i) => (
          <div key={h} className="flex w-10 flex-col items-center gap-1.5">
            <span
              className={cn(
                "w-full rounded-t-md",
                i === 3 ? "bg-brand" : "bg-brand/25"
              )}
              style={{ height: `${h}px` }}
            />
            <span className="text-[0.5625rem] font-semibold text-muted-foreground">
              T{i + 1}
            </span>
          </div>
        ))}
      </div>
    </Canvas>
  );
}

/** Referrals — five levels fanning out from you. */
function ReferralVisual() {
  return (
    <Canvas className="min-h-44">
      <div className="flex flex-col items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div key={lvl} className="flex items-center gap-1.5">
            {Array.from({ length: lvl }, (_, i) => (
              <span
                key={i}
                className="size-2.5 rounded-full"
                style={{
                  background:
                    lvl === 1 ? "var(--brand)" : "color-mix(in oklab, var(--brand) 30%, transparent)",
                }}
              />
            ))}
            <span className="ml-2 text-[0.5625rem] font-semibold text-muted-foreground">
              L{lvl}
            </span>
          </div>
        ))}
      </div>
    </Canvas>
  );
}

/** Fees — the disclosure arithmetic, shown as a formula rather than a number. */
function FeesVisual() {
  return (
    <Canvas className="min-h-44">
      <div className="mx-auto max-w-xs rounded-lg border border-border bg-card p-4 shadow-xs">
        <dl className="space-y-2 text-[0.6875rem]">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="font-semibold text-foreground">Shown</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">− Fee</dt>
            <dd className="font-semibold text-brand">Published</dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <dt className="font-semibold text-foreground">= You receive</dt>
            <dd className="font-semibold text-success">Before you commit</dd>
          </div>
        </dl>
      </div>
    </Canvas>
  );
}

/** Audit trail — a ledger of timestamped rows. */
function AuditVisual() {
  const rows = ["Deposit", "Allocation", "Referral payout"];
  return (
    <Canvas className="min-h-44">
      <ul className="mx-auto max-w-xs space-y-2">
        {rows.map((r, i) => (
          <li
            key={r}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 shadow-xs"
            style={{ opacity: 1 - i * 0.16 }}
          >
            <span className="size-1.5 shrink-0 rounded-full bg-brand" />
            <span className="text-[0.6875rem] font-medium text-foreground">{r}</span>
            <span className="ml-auto h-1.5 w-10 rounded-full bg-muted" />
          </li>
        ))}
      </ul>
    </Canvas>
  );
}

type Tile = {
  icon: TablerIcon;
  eyebrow: string;
  title: string;
  desc: string;
  visual: ReactNode;
  /** Column span at the `lg` breakpoint, out of 6. */
  span: 2 | 3 | 4 | 6;
};

const tiles: Tile[] = [
  {
    icon: IconShieldCheck,
    eyebrow: "Verification",
    title: "KYC-verified onboarding",
    desc: "No account moves funds — deposit, invest, or withdraw — until identity verification clears. Every user on the platform has been checked.",
    visual: <KycVisual />,
    span: 4,
  },
  {
    icon: IconWallet,
    eyebrow: "Custody",
    title: "Wallet-first deposits",
    desc: "Your wallet balance stays separate from what you've allocated into the Index. You decide when it moves.",
    visual: <WalletVisual />,
    span: 2,
  },
  {
    icon: IconStack2,
    eyebrow: "Terms",
    title: "Published Index tiers",
    desc: "Every tier states its minimum, maximum and maturity period up front — before you commit a dollar.",
    visual: <TiersVisual />,
    span: 2,
  },
  {
    icon: IconUsers,
    eyebrow: "Network",
    title: "5-level referral program",
    desc: "Earn commission across five referral levels, with the structure disclosed rather than hidden in fine print.",
    visual: <ReferralVisual />,
    span: 2,
  },
  {
    icon: IconLayersIntersect,
    eyebrow: "Pricing",
    title: "Transparent fee structure",
    desc: "Every fee applied to your account is published and visible — nothing is deducted without disclosure.",
    visual: <FeesVisual />,
    span: 2,
  },
  {
    icon: IconCircleCheck,
    eyebrow: "Records",
    title: "Auditable transaction trail",
    desc: "Deposits, allocations and referral payouts are recorded, timestamped and visible in your own account history.",
    visual: <AuditVisual />,
    span: 6,
  },
];

const spanClass: Record<Tile["span"], string> = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
};

export function BentoFeatures({ id }: { id?: string }) {
  return (
    <Section id={id}>
      <SectionTitle
        eyebrow="How It's Built"
        title={
          <>
            A platform built around{" "}
            <span className="text-gradient">what actually protects you.</span>
          </>
        }
        description="Not a feature list — the structural choices that define how ORVANTA handles your capital."
      />

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-6">
        {tiles.map((t, i) => (
          <Reveal
            key={t.title}
            delay={i * 0.05}
            className={cn("h-full", spanClass[t.span])}
          >
            <article
              className={cn(
                "group flex h-full overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card",
                "transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
                "hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lifted",
                // A full-width tile reads better side-by-side than stacked.
                t.span === 6
                  ? "flex-col gap-5 lg:flex-row-reverse lg:items-center lg:gap-8"
                  : "flex-col"
              )}
            >
              {/* Visual sits on top — or alongside, on the full-width tile */}
              <div className={cn("flex", t.span === 6 && "lg:w-1/2")}>{t.visual}</div>

              <div
                className={cn(
                  "flex items-start gap-3",
                  t.span === 6 ? "lg:w-1/2" : "mt-5"
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-brand ring-1 ring-brand/15 transition-colors group-hover:bg-brand group-hover:text-brand-foreground group-hover:ring-brand">
                  <t.icon className="size-[18px]" stroke={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-brand">
                    {t.eyebrow}
                  </p>
                  <h3 className="mt-1 font-display text-[1.0625rem] font-semibold tracking-tight text-foreground">
                    {t.title}
                  </h3>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    {t.desc}
                  </p>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
