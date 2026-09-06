"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconBuildingBank,
  IconChartLine,
  IconCircleCheck,
  IconCoin,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconFileText,
  IconLayersIntersect,
  IconLock,
  IconShieldCheck,
  IconStack2,
  IconUsers,
  IconWallet,
  IconWorld,
  type IconProps,
} from "@tabler/icons-react";

import { Reveal, Section, SectionTitle } from "../site/primitives";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { CTASection } from "@/components/marketing/CTASection";
import { FeatureGrid as SharedFeatureGrid, StatementSection } from "@/components/marketing/sections";
import { SheenButton } from "@/components/marketing/SheenButton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

type TablerIcon = React.ComponentType<IconProps>;

const features: { icon: TablerIcon; title: string; desc: string; beginner: string }[] = [
  {
    icon: IconChartLine,
    title: "Real-Time Performance Charts",
    desc: "Track your Index performance with clear, up-to-date charts covering historical and live movement.",
    beginner: "Think of these charts as your investment map — they show you where performance has been and help you understand where it's heading.",
  },
  {
    icon: IconShieldCheck,
    title: "KYC-Gated Access",
    desc: "Every account is verified before it can invest. Identity checks keep the platform secure for everyone.",
    beginner: "New here? Complete a quick verification step once, and you'll have full access to your dashboard and Index.",
  },
  {
    icon: IconStack2,
    title: "Tiered Investment Plans",
    desc: "Choose the investment tier that matches your goals. Each tier publishes its minimum, maximum and maturity period in your dashboard.",
    beginner: "Tiers just mean different investment levels — pick the one that fits your budget and how long you're comfortable committing funds.",
  },
  {
    icon: IconWallet,
    title: "Simple Wallet System",
    desc: "Deposit funds into your wallet via crypto or bank transfer, then allocate them into the Index. Track balances and history in one place.",
    beginner: "Your wallet is like a holding account — fund it first, then invest into the Index whenever you're ready.",
  },
  {
    icon: IconUsers,
    title: "5-Level Referral Program",
    desc: "Invite other investors and earn commission across five referral levels, tracked automatically in your dashboard.",
    beginner: "Share your referral link. As the people you refer — and the people they refer — invest, you earn a share, up to five levels deep.",
  },
  {
    icon: IconLayersIntersect,
    title: "Transparent Fee Structure",
    desc: "Every fee applied to your account is published and visible before you commit — nothing deducted without disclosure.",
    beginner: "No guessing games. What you see in your dashboard before you invest is what you'll actually pay.",
  },
];

const walletMethods: { icon: TablerIcon; label: string; desc: string }[] = [
  { icon: IconCoin, label: "Crypto Deposits", desc: "Fund your wallet with supported cryptocurrencies. Deposits are credited once confirmed on-chain." },
  { icon: IconBuildingBank, label: "Bank Transfer", desc: "Prefer fiat? Deposit directly from your bank account through supported transfer rails." },
  { icon: IconWallet, label: "Unified Balance", desc: "Whichever method you use, your wallet balance stays in one place — ready to allocate into an Index tier." },
];

const tierMechanics: { icon: TablerIcon; title: string; desc: string }[] = [
  { icon: IconCircleCheck, title: "Published Minimums & Maximums", desc: "Every tier states exactly how much you can allocate — before you commit a dollar." },
  { icon: IconFileText, title: "Clear Maturity Periods", desc: "Each tier's duration is disclosed upfront in your dashboard, so you know what you're committing to." },
  { icon: IconChartLine, title: "Live Performance Tracking", desc: "Once allocated, your position updates in real time alongside full historical charting." },
];

const security: { icon: TablerIcon; title: string; desc: string }[] = [
  { icon: IconShieldCheck, title: "Mandatory KYC", desc: "Identity verification gates every account before deposits, allocations, or withdrawals are permitted." },
  { icon: IconLock, title: "Role-Based Admin Access", desc: "Platform operations are separated by role, with activity logged and auditable." },
  { icon: IconFileText, title: "Full Transaction History", desc: "Every deposit, allocation, and referral commission is recorded and visible in your account." },
];

const access: { icon: TablerIcon; label: string; sub: string; cta: string }[] = [
  { icon: IconWorld, label: "Web Dashboard", sub: "No install needed — access your account from any modern browser", cta: "Launch" },
  { icon: IconDeviceDesktop, label: "Desktop", sub: "The same dashboard experience on Windows & macOS", cta: "Learn More" },
  { icon: IconDeviceMobile, label: "Mobile", sub: "Check your Index and wallet on the go", cta: "Learn More" },
];

/** Shared card shell so every block on the page reads as one system. */
function FeatureCard({
  icon: Icon,
  title,
  children,
  index,
  className,
}: {
  icon: TablerIcon;
  title: string;
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-tilt group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card",
        className
      )}
    >
      {index !== undefined && (
        <span
          aria-hidden
          className="absolute right-5 top-5 font-display text-[0.6875rem] font-semibold tracking-[0.2em] text-brand/40"
        >
          {String(index).padStart(2, "0")}
        </span>
      )}
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-brand ring-1 ring-brand/15 transition-colors group-hover:bg-brand group-hover:text-brand-foreground group-hover:ring-brand">
        <Icon className="size-6" stroke={1.75} />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <div className="mt-2.5 flex-1">{children}</div>
      <span
        aria-hidden
        className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-linear-to-r from-brand to-transparent transition-transform duration-500 group-hover:scale-x-100"
      />
    </div>
  );
}

export default function PlatformPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <Section className="!pb-0 !pt-6 lg:!pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-accent px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
              <span aria-hidden className="size-1.5 rounded-full bg-brand" />
              The ORVANTA Platform
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-foreground md:text-5xl lg:text-6xl">
              The platform
              <span className="block text-gradient">investors trust.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              The ORVANTA Index platform powers every account with real-time
              performance tracking, transparent tiered investment plans, a
              wallet built for crypto and bank deposits, and KYC-verified
              security — from a single dashboard.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <SheenButton href={user ? "/dashboard" : "/register"} size="md">
                {user ? "Go to Dashboard" : "Get Started"} <IconArrowRight className="size-4" />
              </SheenButton>
              <a
                href="#access"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand/45 hover:bg-accent"
              >
                Explore Access Options
              </a>
            </div>
          </Reveal>
        </div>

        {/* Live product preview — full-width, matches the real dashboard shape */}
        <Reveal delay={0.2} y={30}>
          <div className="relative mx-auto mt-14 max-w-6xl">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-x-10 -top-16 h-56 rounded-full bg-brand/6 blur-3xl"
            />
            <div className="relative rounded-xl border border-border bg-card/60 p-2 shadow-lifted backdrop-blur-xl sm:p-3">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-brand/60 to-transparent"
              />
              <HeroPreview />
            </div>
          </div>
        </Reveal>

        {/* Quick capability strip — seamless, under the preview */}
        <Reveal delay={0.28}>
          <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border">
            {[
              { label: "KYC", sub: "Gated access" },
              { label: "5-Level", sub: "Referrals" },
              { label: "Real-Time", sub: "Tracking" },
            ].map((s) => (
              <div key={s.sub} className="bg-card p-5 text-center sm:p-6">
                <dt className="sr-only">{s.sub}</dt>
                <dd className="font-display text-xl font-semibold text-brand sm:text-2xl">
                  {s.label}
                </dd>
                <p className="mt-1 text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
                  {s.sub}
                </p>
              </div>
            ))}
          </dl>
        </Reveal>
      </Section>

      {/* ─── FEATURES ─── */}
      <Section>
        <SectionTitle
          eyebrow="Capabilities"
          title={
            <>
              Everything you need.{" "}
              <span className="text-gradient">Nothing in your way.</span>
            </>
          }
          description="The ORVANTA Index dashboard is built for serious investors — clean, focused, and stripped of bloat."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <FeatureCard icon={f.icon} title={f.title} index={i + 1}>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <div className="mt-4 rounded-xl border border-border bg-surface-2/70 p-3.5">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-brand">Beginner tip:</span>{" "}
                    {f.beginner}
                  </p>
                </div>
              </FeatureCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ─── WALLET ─── */}
      <SharedFeatureGrid
        eyebrow="Wallet"
        title={
          <>
            Fund it your way.{" "}
            <span className="text-gradient">Invest it your pace.</span>
          </>
        }
        description="Your wallet is separate from your Index allocation — deposit first, then decide when and how much to invest."
        items={walletMethods.map(({ icon, label, desc }) => ({ icon, title: label, desc }))}
        columns={3}
      />

      {/* ─── INDEX TIERS ─── */}
      <Section>
        <SectionTitle
          eyebrow="Index Tiers"
          title={
            <>
              One Index. <span className="text-gradient">Multiple tiers.</span>
            </>
          }
          description="Every tier is built around clear mechanics — no vague projections, no fine print you find out about later."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tierMechanics.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.06}>
              <FeatureCard icon={t.icon} title={t.title}>
                <p className="text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
              </FeatureCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            Exact tier ranges and current maturity terms are available once you sign in —
            they&apos;re kept current in your dashboard rather than a static marketing page.
          </p>
        </Reveal>
      </Section>

      {/* ─── REFERRAL PROGRAM ─── */}
      <Section>
        <Reveal>
          <div className="grid items-center gap-10 rounded-xl border border-border bg-card p-8 shadow-card md:p-12 lg:grid-cols-2">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-accent px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
                <IconUsers className="size-3.5" stroke={2} /> Referral Program
              </span>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
                Earn across five levels.
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                Share your referral link from your dashboard. As people you refer invest —
                and as their referrals invest — you earn commission across five levels
                deep. Every payout is tracked and visible in your referral history.
              </p>
              <Link
                href={user ? "/dashboard/referral" : "/register"}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-brand"
              >
                {user ? "View your referral link" : "Start referring"}
                <IconArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Level ladder — each step a little taller than the last */}
            <ul className="flex items-end justify-between gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <li key={lvl} className="flex flex-1 flex-col items-center justify-end gap-3">
                  <span className="font-display text-lg font-semibold text-gradient">
                    L{lvl}
                  </span>
                  <span
                    aria-hidden
                    className="w-full rounded-t-xl border border-b-0 border-brand/25 bg-linear-to-t from-brand/15 to-transparent"
                    style={{ height: `${40 + lvl * 18}px` }}
                  />
                  <span className="w-full rounded-b-xl border border-t-0 border-border bg-surface-2 py-2 text-center text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                    Level
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      {/* ─── SECURITY ─── */}
      <SharedFeatureGrid
        eyebrow="Security"
        title={
          <>
            Admin-grade controls,{" "}
            <span className="text-gradient">from day one.</span>
          </>
        }
        description="The infrastructure behind the dashboard is built with the same discipline expected of any platform handling client funds."
        items={security}
        columns={3}
      />

      {/* ─── SECURITY TRUST STATEMENT ─── */}
      <StatementSection
        icon={IconShieldCheck}
        lead="Admin-grade controls aren&apos;t bolted on —"
        accent="they&apos;re how the platform is built."
        body="Mandatory KYC, role-based admin access, and a fully auditable transaction history on every deposit, allocation and referral payout — applied by default, not offered as an upgrade."
      />

      {/* ─── ACCESS ─── */}
      <Section id="access">
        <SectionTitle
          eyebrow="Access"
          title={
            <>
              Access anywhere.{" "}
              <span className="text-gradient">Invest everywhere.</span>
            </>
          }
          description="Start on your laptop, check your Index on your phone. Your ORVANTA account is available on every device and syncs across all of them."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {access.map((d, i) => (
            <Reveal key={d.label} delay={i * 0.06}>
              <div className="card-tilt group flex h-full flex-col items-center gap-5 rounded-xl border border-border bg-card p-7 text-center shadow-card">
                <span className="grid size-14 place-items-center rounded-xl bg-accent text-brand ring-1 ring-brand/15 transition-colors group-hover:bg-brand group-hover:text-brand-foreground group-hover:ring-brand">
                  <d.icon className="size-7" stroke={1.5} />
                </span>
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold text-foreground">{d.label}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{d.sub}</p>
                </div>
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand/45 hover:bg-accent hover:text-brand"
                >
                  {user ? "Open Dashboard" : d.cta} <IconArrowRight className="size-3.5" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ─── CTA ─── */}
      <Section className="!pt-6">
        <Reveal>
          <CTASection
            title="Ready to start investing?"
            description="Create an account in minutes. Fund your wallet when you're ready. Invest with discipline."
            secondary={{ href: "/contact", label: "Talk to our team" }}
          />
        </Reveal>
      </Section>
    </div>
  );
}
